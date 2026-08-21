const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');
const Inventory = require('../models/Inventory');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { calculateNextDonationDate } = require('../utils/registrationHelpers');
const crypto = require('crypto');

// Get all blood banks (Public/Protected)
router.get('/', async (req, res) => {
  try {
    const bloodBanks = await BloodBank.find();
    res.json(bloodBanks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get or create current Blood Bank profile for authenticated user
router.get('/profile', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    let bloodBank = await BloodBank.findOne({ user: req.user._id });
    if (!bloodBank && req.user.bloodBankId) {
      bloodBank = await BloodBank.findById(req.user.bloodBankId);
    }
    if (!bloodBank) {
      if (!req.user.licenseNumber) {
        return res.status(400).json({ error: "License number is required to create a blood bank profile." });
      }
      
      bloodBank = new BloodBank({
        name: req.user.name + ' Blood Bank',
        licenseNumber: req.user.licenseNumber,
        address: req.user.location || 'Central City',
        phone: req.user.phone || '0000000000',
        email: req.user.email,
        user: req.user._id
      });
      await bloodBank.save();
      await User.findByIdAndUpdate(req.user._id, { bloodBankId: bloodBank._id });
    }
    res.json(bloodBank);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Blood Bank Profile
router.put('/profile', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { name, licenseNumber, address, district, state, phone, email, manager, openingHours, coordinates, logoUrl } = req.body;
    let bloodBank = await BloodBank.findOne({ user: req.user._id });
    if (!bloodBank) {
      bloodBank = new BloodBank({ user: req.user._id });
    }
    bloodBank.name = name || bloodBank.name;
    bloodBank.licenseNumber = licenseNumber || bloodBank.licenseNumber;
    bloodBank.address = address || bloodBank.address;
    bloodBank.district = district || bloodBank.district;
    bloodBank.state = state || bloodBank.state;
    bloodBank.phone = phone || bloodBank.phone;
    bloodBank.email = email || bloodBank.email;
    bloodBank.manager = manager || bloodBank.manager;
    bloodBank.openingHours = openingHours || bloodBank.openingHours;
    bloodBank.logoUrl = logoUrl || bloodBank.logoUrl;
    if (coordinates) {
      bloodBank.coordinates = { type: 'Point', coordinates: [coordinates.lng || coordinates[0], coordinates.lat || coordinates[1]] };
    }
    await bloodBank.save();
    res.json(bloodBank);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blood Bank Dashboard Metrics
router.get('/dashboard', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    let bloodBank = await BloodBank.findOne({ user: req.user._id });
    const bankId = bloodBank ? bloodBank._id : req.user.bloodBankId;

    const query = bankId ? { bloodBank: bankId } : {};

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [inventoryItems, todayDonations, todayRequests, pendingRequests, emergencyRequests] = await Promise.all([
      Inventory.find(query),
      Donation.countDocuments({ ...query, donationDate: { $gte: todayStart, $lte: todayEnd } }),
      Request.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Request.countDocuments({ status: 'Pending' }),
      Request.countDocuments({ emergencyLevel: { $in: ['High', 'Critical', 'Emergency'] }, status: { $ne: 'Completed' } })
    ]);

    let totalUnits = 0;
    let availableUnits = 0;
    let expiringUnits = 0;

    const stockGrouped = {
      'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0
    };

    inventoryItems.forEach(item => {
      totalUnits += item.units;
      if (item.storageStatus === 'Available') {
        availableUnits += item.units;
        if (stockGrouped[item.bloodGroup] !== undefined) {
          stockGrouped[item.bloodGroup] += item.units;
        }
      }
      if (item.expiryDate && new Date(item.expiryDate) <= sevenDaysFromNow && item.storageStatus === 'Available') {
        expiringUnits += item.units;
      }
    });

    res.json({
      totalUnits,
      availableUnits,
      expiringUnits,
      todayDonations,
      todayRequests,
      pendingRequests,
      emergencyRequests,
      stock: stockGrouped
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory CRUD
router.get('/inventory', verifyToken, async (req, res) => {
  try {
    const { bloodBankId, bloodGroup, storageStatus, component } = req.query;
    let filter = {};
    if (bloodBankId) filter.bloodBank = bloodBankId;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (storageStatus) filter.storageStatus = storageStatus;
    if (component) filter.component = component;

    if (req.user.role === 'blood_bank') {
      let bloodBank = await BloodBank.findOne({ user: req.user._id });
      if (bloodBank) filter.bloodBank = bloodBank._id;
    }

    const items = await Inventory.find(filter).populate('donor', 'name email phone bloodGroup').sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    let bloodBank = await BloodBank.findOne({ user: req.user._id });
    const bankId = bloodBank ? bloodBank._id : req.body.bloodBankId;

    const { bloodGroup, units, component, collectionDate, expiryDate, batchNumber, donorId, donorName } = req.body;

    const batch = batchNumber || 'BATCH-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const barcode = 'BC-' + Date.now();
    const qrCode = JSON.stringify({ batch, bloodGroup, units, barcode, bankId });

    const newItem = new Inventory({
      bloodBank: bankId,
      bloodGroup,
      units: units || 1,
      component: component || 'Whole Blood',
      collectionDate: collectionDate || new Date(),
      expiryDate: expiryDate || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // Default 35 days
      batchNumber: batch,
      donor: donorId || null,
      donorName,
      barcode,
      qrCode,
      storageStatus: 'Available'
    });

    await newItem.save();

    // Update BloodBank summary stock
    if (bankId) {
      await BloodBank.findByIdAndUpdate(bankId, {
        $inc: { [`stock.${bloodGroup}`]: units || 1 }
      });
    }

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Blood Testing (HIV, HBV, HCV, Malaria, Syphilis)
router.post('/inventory/:id/test', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { hiv, hbv, hcv, malaria, syphilis, safetyStatus } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    item.testing = {
      hiv: hiv || item.testing.hiv,
      hbv: hbv || item.testing.hbv,
      hcv: hcv || item.testing.hcv,
      malaria: malaria || item.testing.malaria,
      syphilis: syphilis || item.testing.syphilis,
      safetyStatus: safetyStatus || (hiv === 'Positive' || hbv === 'Positive' || hcv === 'Positive' || malaria === 'Positive' || syphilis === 'Positive' ? 'Unsafe' : 'Safe')
    };

    if (item.testing.safetyStatus === 'Unsafe' || item.testing.safetyStatus === 'Discard') {
      item.storageStatus = 'Discarded';
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blood Separation (Whole Blood into components)
router.post('/inventory/:id/separate', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const parentItem = await Inventory.findById(req.params.id);
    if (!parentItem) return res.status(404).json({ error: 'Parent unit not found' });

    const components = req.body.components || ['Plasma', 'Platelets', 'RBC'];
    const createdComponents = [];

    for (const comp of components) {
      const child = new Inventory({
        bloodBank: parentItem.bloodBank,
        bloodGroup: parentItem.bloodGroup,
        units: 1,
        component: comp,
        collectionDate: parentItem.collectionDate,
        expiryDate: new Date(Date.now() + (comp === 'Platelets' ? 5 : 42) * 24 * 60 * 60 * 1000),
        batchNumber: parentItem.batchNumber + '-' + comp.substring(0, 3).toUpperCase(),
        donor: parentItem.donor,
        barcode: 'BC-' + Date.now() + '-' + comp.substring(0, 3),
        storageStatus: 'Available',
        testing: parentItem.testing
      });
      await child.save();
      createdComponents.push(child);
    }

    parentItem.storageStatus = 'Reserved'; // Original whole blood split
    await parentItem.save();

    res.json({ message: 'Blood components created successfully', components: createdComponents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Walk-in Donor & Collect Blood
router.post('/walk-in-donation', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { name, email, phone, bloodGroup, units, location, hemoglobinLevel, pulse, bloodPressure, notes } = req.body;

    // Find or create donor user
    let donor = await User.findOne({ email });
    if (!donor) {
      donor = new User({
        name,
        email,
        phone,
        bloodGroup,
        location: location || 'Walk-in Location',
        role: 'donor',
        status: 'active'
      });
      await donor.save();
    }

    let bloodBank = await BloodBank.findOne({ user: req.user._id });
    const bankId = bloodBank ? bloodBank._id : req.user.bloodBankId;

    const receiptId = 'RCP-' + Date.now();
    const donation = new Donation({
      donor: donor._id,
      bloodBank: bankId,
      bloodGroup,
      units: units || 1,
      donationDate: new Date(),
      status: 'Completed',
      receiptId,
      hemoglobinLevel,
      pulse,
      bloodPressure,
      notes
    });
    await donation.save();

    // Create inventory item automatically
    const batch = 'BATCH-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const barcode = 'BC-' + Date.now();
    const inventoryItem = new Inventory({
      bloodBank: bankId,
      bloodGroup,
      units: units || 1,
      component: 'Whole Blood',
      collectionDate: new Date(),
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      batchNumber: batch,
      donor: donor._id,
      donorName: donor.name,
      barcode,
      storageStatus: 'Available'
    });
    await inventoryItem.save();

    // Update donor gamification count and donation schedule
    await User.findByIdAndUpdate(donor._id, {
      $inc: { donationsCount: 1, points: 100 },
      $set: {
        lastDonationDate: new Date(),
        nextDonationDate: new Date(calculateNextDonationDate(new Date(), donor.medicalDonationGapDays || 90))
      }
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in donation registered successfully',
      receiptId,
      donation,
      inventoryItem
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dispatch request to hospital
router.post('/requests/:id/dispatch', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { batchNumbers, notes } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Dispatched';
    if (notes) request.reason = (request.reason || '') + ' | Dispatch note: ' + notes;
    await request.save();

    // Mark matching inventory units as Dispatched
    if (batchNumbers && Array.isArray(batchNumbers)) {
      await Inventory.updateMany(
        { batchNumber: { $in: batchNumbers } },
        { storageStatus: 'Dispatched' }
      );
    }

    res.json({ success: true, message: 'Request dispatched successfully', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

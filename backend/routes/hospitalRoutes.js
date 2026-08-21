const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const Request = require('../models/Request');
const Camp = require('../models/Camp');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');

// Create a new hospital
router.post('/', verifyToken, authorizeRoles('super_admin', 'admin'), logActivity('CREATE_HOSPITAL'), async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    await newHospital.save();
    res.status(201).json({ success: true, message: 'Hospital added', data: newHospital });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get profile of current logged in hospital
router.get('/profile/me', verifyToken, authorizeRoles('hospital', 'admin', 'super_admin'), async (req, res) => {
  try {
    let hospital = await Hospital.findOne({ user: req.user._id });
    if (!hospital && req.user.hospitalId) {
      hospital = await Hospital.findById(req.user.hospitalId);
    }
    if (!hospital) {
      if (!req.user.registrationNumber) {
        return res.status(400).json({ error: "Registration number is required to create a hospital profile." });
      }

      hospital = new Hospital({
        name: req.user.name + ' Hospital',
        registrationNumber: req.user.registrationNumber,
        address: req.user.location || 'City Hospital',
        phone: req.user.phone || '0000000000',
        email: req.user.email,
        user: req.user._id
      });
      await hospital.save();
      await User.findByIdAndUpdate(req.user._id, { hospitalId: hospital._id });
    }
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile of current hospital
router.put('/profile/me', verifyToken, authorizeRoles('hospital', 'admin', 'super_admin'), async (req, res) => {
  try {
    let hospital = await Hospital.findOne({ user: req.user._id });
    if (!hospital && req.user.hospitalId) {
      hospital = await Hospital.findById(req.user.hospitalId);
    }
    if (!hospital) {
      hospital = new Hospital({ user: req.user._id });
    }

    const { name, registrationNumber, address, district, state, phone, email, emergencyContact, operatingHours, logoUrl, coordinates } = req.body;
    if (name) hospital.name = name;
    if (registrationNumber) hospital.registrationNumber = registrationNumber;
    if (address) hospital.address = address;
    if (district) hospital.district = district;
    if (state) hospital.state = state;
    if (phone) hospital.phone = phone;
    if (email) hospital.email = email;
    if (emergencyContact) hospital.emergencyContact = emergencyContact;
    if (operatingHours) hospital.operatingHours = operatingHours;
    if (logoUrl) hospital.logoUrl = logoUrl;
    if (coordinates) {
      hospital.coordinates = { type: 'Point', coordinates: [coordinates.lng || coordinates[0], coordinates.lat || coordinates[1]] };
    }

    await hospital.save();
    res.json({ success: true, hospital });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dedicated Hospital Dashboard Stats
router.get('/dashboard/stats', verifyToken, authorizeRoles('hospital', 'admin', 'super_admin'), async (req, res) => {
  try {
    let hospital = await Hospital.findOne({ user: req.user._id });
    const hospitalId = hospital ? hospital._id : req.user.hospitalId;

    const query = hospitalId ? { hospitalId } : {};

    const [activeRequests, fulfilledRequests, emergencyRequests, upcomingCamps, bloodBanks] = await Promise.all([
      Request.countDocuments({ ...query, status: { $in: ['Pending', 'Accepted', 'Processing'] } }),
      Request.countDocuments({ ...query, status: 'Completed' }),
      Request.countDocuments({ ...query, emergencyLevel: { $in: ['High', 'Critical', 'Emergency'] } }),
      Camp.countDocuments({ date: { $gte: new Date() } }),
      BloodBank.find().select('name stock phone address coordinates')
    ]);

    // Aggregate blood availability summary across all connected blood banks & hospital stock
    const availabilitySummary = {
      'O+': 0, 'O-': 0, 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0
    };

    if (hospital && hospital.stock) {
      Object.keys(availabilitySummary).forEach(bg => {
        availabilitySummary[bg] += hospital.stock[bg] || 0;
      });
    }

    bloodBanks.forEach(bb => {
      if (bb.stock) {
        Object.keys(availabilitySummary).forEach(bg => {
          availabilitySummary[bg] += bb.stock[bg] || 0;
        });
      }
    });

    res.json({
      activeRequests,
      fulfilledRequests,
      emergencyRequests,
      upcomingCamps,
      nearbyBloodBanksCount: bloodBanks.length,
      nearbyBloodBanks: bloodBanks,
      availabilitySummary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get aggregated stock data
router.get('/stock', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'hospital') {
       let hospital = await Hospital.findOne({ user: req.user._id || req.user.id });
       if (!hospital && req.user.hospitalId) {
          hospital = await Hospital.findById(req.user.hospitalId);
       }
       if (hospital) {
          query = { _id: hospital._id };
       } else {
          return res.json({
            'O+': 0, 'A+': 0, 'B+': 0, 'AB+': 0,
            'O-': 0, 'A-': 0, 'B-': 0, 'AB-': 0
          });
       }
    }

    const hospitals = await Hospital.find(query).lean();
    const aggregateStock = {
      'O+': 0, 'A+': 0, 'B+': 0, 'AB+': 0,
      'O-': 0, 'A-': 0, 'B-': 0, 'AB-': 0
    };
    
    hospitals.forEach(hosp => {
      if (hosp.stock) {
        Object.keys(aggregateStock).forEach(type => {
          aggregateStock[type] += Number(hosp.stock[type]) || 0;
        });
      }
    });
    
    res.json(aggregateStock);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update specific blood stock
router.put('/:id/stock', verifyToken, authorizeRoles('super_admin', 'admin', 'hospital'), logActivity('UPDATE_STOCK'), async (req, res) => {
  try {
    const { bloodGroup, quantity, operation } = req.body;
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    let currentStock = hospital.stock[bloodGroup] || 0;
    
    if (operation === 'add') {
      hospital.stock[bloodGroup] = currentStock + Number(quantity);
    } else if (operation === 'subtract') {
      hospital.stock[bloodGroup] = Math.max(0, currentStock - Number(quantity));
    }

    await hospital.save();

    // Check critical threshold
    const threshold = hospital.criticalThresholds ? hospital.criticalThresholds[bloodGroup] : 5;
    if (hospital.stock[bloodGroup] <= threshold) {
      const io = req.app.get('socketio');
      const alertMsg = `Low Stock Alert: ${bloodGroup} is critically low at ${hospital.name}`;
      
      if (io) {
        io.emit('receiveNotification', {
          title: 'Low Inventory Alert',
          message: alertMsg,
          type: 'inventory_alert'
        });
      }

      await new Notification({
        title: 'Low Inventory',
        message: alertMsg,
        type: 'inventory_alert',
        link: `/hospitals/${hospital._id}`
      }).save();
    }

    res.json({ success: true, data: hospital.stock });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update hospital details
router.put('/:id', verifyToken, authorizeRoles('super_admin', 'admin', 'hospital'), logActivity('UPDATE_HOSPITAL'), async (req, res) => {
  try {
    const updated = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');
const Hospital = require('../models/Hospital');
const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');
const Camp = require('../models/Camp');
const Report = require('../models/Report');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');

const convertToCSV = (arr) => {
  if (!arr || !arr.length) return 'No data available';
  const keys = Object.keys(arr[0]);
  
  const csvContent = [
    keys.join(','),
    ...arr.map(item => keys.map(k => {
      let val = item[k] === null || item[k] === undefined ? '' : String(item[k]);
      val = val.replace(/"/g, '""');
      if (val.search(/("|,|\n)/g) >= 0) {
        val = `"${val}"`;
      }
      return val;
    }).join(','))
  ].join('\n');
  
  return csvContent;
};

// Export Monthly Donations CSV
router.get('/export/donations', verifyToken, async (req, res) => {
  try {
    const donations = await Donation.find().populate('donor', 'name email phone').lean();
    const formatted = donations.map(d => ({
      ReceiptID: d.receiptId || d._id,
      DonorName: d.donor ? d.donor.name : 'Walk-in',
      DonorEmail: d.donor ? d.donor.email : 'N/A',
      BloodGroup: d.bloodGroup,
      Units: d.units,
      Status: d.status,
      DonationDate: d.donationDate ? new Date(d.donationDate).toISOString().split('T')[0] : ''
    }));

    const csv = convertToCSV(formatted);
    res.header('Content-Type', 'text/csv');
    res.attachment('monthly_donations_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export Blood Requests CSV
router.get('/export/requests', verifyToken, logActivity('EXPORT_REQUESTS'), async (req, res) => {
  try {
    const requests = await Request.find().populate('hospitalId', 'name').select('-responses -__v').lean();
    const formatted = requests.map(r => ({
      RequestID: r._id,
      BloodGroup: r.bloodGroup,
      UnitsNeeded: r.unitsNeeded,
      EmergencyLevel: r.emergencyLevel,
      Status: r.status,
      RequesterType: r.requesterType,
      Hospital: r.hospitalId ? r.hospitalId.name : 'N/A',
      CreatedAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : ''
    }));

    const csv = convertToCSV(formatted);
    res.header('Content-Type', 'text/csv');
    res.attachment('blood_requests_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export Inventory Stock CSV
router.get('/export/inventory', verifyToken, async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('bloodBank', 'name').lean();
    const formatted = inventory.map(i => ({
      BatchNumber: i.batchNumber,
      BloodBank: i.bloodBank ? i.bloodBank.name : 'N/A',
      BloodGroup: i.bloodGroup,
      Units: i.units,
      Component: i.component,
      StorageStatus: i.storageStatus,
      SafetyStatus: i.testing ? i.testing.safetyStatus : 'Safe',
      CollectionDate: i.collectionDate ? new Date(i.collectionDate).toISOString().split('T')[0] : '',
      ExpiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString().split('T')[0] : ''
    }));

    const csv = convertToCSV(formatted);
    res.header('Content-Type', 'text/csv');
    res.attachment('inventory_stock_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export Users CSV
router.get('/export/users', verifyToken, authorizeRoles('super_admin', 'admin'), logActivity('EXPORT_USERS'), async (req, res) => {
  try {
    const users = await User.find().select('name email phone role bloodGroup location points status createdAt -_id').lean();
    const formatted = users.map(u => ({
      ...u,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : ''
    }));

    const csv = convertToCSV(formatted);
    res.header('Content-Type', 'text/csv');
    res.attachment('users_report.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

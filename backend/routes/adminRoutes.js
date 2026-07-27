const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const Camp = require('../models/Camp');
const ActivityLog = require('../models/ActivityLog');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// System Dashboard & Statistics Overview
router.get('/system-stats', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalBloodBanks,
      totalVolunteers,
      totalRequests,
      completedRequests,
      totalDonations,
      activeCamps
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      Hospital.countDocuments(),
      BloodBank.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'Completed' }),
      Donation.countDocuments(),
      Camp.countDocuments({ status: { $ne: 'Cancelled' } })
    ]);

    res.json({
      totalUsers,
      totalDonors,
      totalHospitals,
      totalBloodBanks,
      totalVolunteers,
      totalRequests,
      completedRequests,
      totalDonations,
      activeCamps
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management (List with role and search filters)
router.get('/users', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const { role, status, q } = req.query;
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Role & Status
router.put('/users/:id/role', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();

    res.json({ success: true, message: 'User role/status updated successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Query Audit Logs
router.get('/audit-logs', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('user', 'name email role').sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Backup Simulation
router.post('/backup', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const backupMetadata = {
      timestamp: new Date(),
      version: '1.0.0',
      status: 'Success',
      snapshotId: 'BACKUP-' + Date.now(),
      tablesCount: {
        users: await User.countDocuments(),
        hospitals: await Hospital.countDocuments(),
        bloodBanks: await BloodBank.countDocuments(),
        requests: await Request.countDocuments(),
        donations: await Donation.countDocuments()
      }
    };
    res.json({ success: true, message: 'System database backup snapshot created successfully', backup: backupMetadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Restore Simulation
router.post('/restore', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    res.json({ success: true, message: 'System restored to selected checkpoint successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

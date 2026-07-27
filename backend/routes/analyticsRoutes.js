const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get monthly donation trends
router.get('/trends/monthly', verifyToken, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

    const trends = await Request.aggregate([
      {
        $match: {
          status: 'Completed',
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          donations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for charts (e.g., [ { month: 'Jan', value: 15 } ])
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = monthNames.map((month, index) => {
      const match = trends.find(t => t._id === index + 1);
      return {
        month,
        value: match ? match.donations : 0
      };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get blood group demand statistics
router.get('/demand/blood-groups', verifyToken, async (req, res) => {
  try {
    const demand = await Request.aggregate([
      {
        $group: {
          _id: "$bloodGroup",
          totalRequests: { $sum: 1 },
          completedRequests: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { totalRequests: -1 } }
    ]);

    res.json({ success: true, data: demand });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin overview stats
router.get('/overview', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const [totalUsers, totalDonors, activeHospitals, pendingHospitals, emergencyRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor', status: 'active' }),
      Hospital.countDocuments({ verified: true }),
      Hospital.countDocuments({ verified: false }),
      Request.countDocuments({ emergencyLevel: { $in: ['High', 'Critical'] }, status: 'Pending' })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        activeHospitals,
        pendingHospitals,
        emergencyRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const HealthScreening = require('../models/HealthScreening');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');

/**
 * Helper to determine eligibility based on questionnaire
 */
const determineEligibility = (data) => {
  const { age, weight, hemoglobin, medicalConditions, medications, lastDonationDate } = data;
  
  if (age < 18 || age > 65) {
    return { status: 'Permanently Not Eligible', reason: 'Age must be between 18 and 65' };
  }
  if (weight < 50) {
    return { status: 'Temporarily Not Eligible', reason: 'Weight must be at least 50kg' };
  }
  if (hemoglobin && hemoglobin < 12.5) {
    return { status: 'Temporarily Not Eligible', reason: 'Hemoglobin levels are too low' };
  }
  
  const permanentConditions = ['HIV', 'Hepatitis B', 'Hepatitis C', 'Cancer', 'Heart Disease'];
  const hasPermanent = medicalConditions?.some(c => permanentConditions.includes(c));
  if (hasPermanent) {
    return { status: 'Permanently Not Eligible', reason: 'Disqualifying medical condition present' };
  }

  if (lastDonationDate) {
    const daysSinceLast = Math.floor((new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceLast < 90) { // 3 months wait time generally
      const nextDate = new Date(lastDonationDate);
      nextDate.setDate(nextDate.getDate() + 90);
      return { 
        status: 'Temporarily Not Eligible', 
        reason: `Must wait 90 days between donations. Days elapsed: ${daysSinceLast}`,
        nextEligibleDate: nextDate
      };
    }
  }

  return { status: 'Eligible', reason: 'Passed all screening checks' };
};

// Submit a new health screening
router.post('/', verifyToken, logActivity('HEALTH_SCREENING'), async (req, res) => {
  try {
    const eligibility = determineEligibility(req.body);
    
    const screening = new HealthScreening({
      user: req.user._id || req.user.id,
      ...req.body,
      status: eligibility.status,
      reason: eligibility.reason,
      nextEligibleDate: eligibility.nextEligibleDate
    });

    await screening.save();

    // Update user status if necessary (e.g. they are eligible)
    if (eligibility.status === 'Eligible') {
      await User.findByIdAndUpdate(req.user._id || req.user.id, { $set: { status: 'active' } });
    }

    res.status(201).json({ success: true, data: screening });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get screening history for a user
router.get('/history/:userId', verifyToken, async (req, res) => {
  try {
    // Only allow self or admin to view
    if (req.user.id !== req.params.userId && !['admin', 'super_admin', 'doctor'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const screenings = await HealthScreening.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: screenings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

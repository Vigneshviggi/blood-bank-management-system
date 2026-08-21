const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/authMiddleware');
const { XP_CONFIG, calculateDonorProgress } = require('../utils/gamification');

// Helper to calculate next eligible donation date (90 days)
const calculateNextDonationDate = (lastDate = new Date(), gapDays = 90) => {
  const next = new Date(lastDate);
  next.setDate(next.getDate() + gapDays);
  return next;
};

// 1. Get authenticated user's donation history & progress
router.get('/my-history', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const donations = await Donation.find({ donor: userId })
      .populate('requestId', 'patientName bloodGroup emergencyLevel location')
      .populate('requesterId', 'name email phone')
      .populate('hospital', 'name address')
      .populate('bloodBank', 'name address')
      .sort({ createdAt: -1 });

    const user = await User.findById(userId).select('-password');
    const emergencyDonationsCount = donations.filter(d => d.status === 'Completed' && d.isEmergency).length;
    const progress = calculateDonorProgress(user, { emergencyDonationsCount });

    res.json({
      success: true,
      donations,
      progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get donation records for a specific request
router.get('/request/:requestId', verifyToken, async (req, res) => {
  try {
    const donations = await Donation.find({ requestId: req.params.requestId })
      .populate('donor', 'name email phone bloodGroup imageUrl')
      .populate('requesterId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Accept a donor response (Requester accepts donor)
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const currentUserId = (req.user._id || req.user.id).toString();
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found' });
    }

    // Only requester, hospital, or admin can accept donor
    const requesterId = donation.requesterId?.toString();
    const isAuthorized = requesterId === currentUserId || ['admin', 'super_admin', 'hospital'].includes(req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this donor.' });
    }

    if (donation.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'This donation is already marked completed.' });
    }

    donation.status = 'Accepted';
    await donation.save();

    // Award acceptance XP to donor if not already awarded
    const donorUser = await User.findById(donation.donor);
    if (donorUser) {
      donorUser.points = (donorUser.points || 0) + XP_CONFIG.DONOR_ACCEPTED;
      await donorUser.save();

      // Emit socket notification
      const io = req.app.get('socketio');
      if (io) {
        const progress = calculateDonorProgress(donorUser);
        io.emit('donor_progress_updated', {
          userId: donorUser._id.toString(),
          ...progress,
        });
      }
    }

    res.json({ success: true, message: 'Donor response accepted.', donation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Mark Donation as Completed (Increments donationsCount + awards donation XP)
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const currentUserId = (req.user._id || req.user.id).toString();
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    // Authorization check: Requester, Hospital, or Admin
    const requesterId = donation.requesterId?.toString();
    const isAuthorized = requesterId === currentUserId || ['admin', 'super_admin', 'hospital', 'blood_bank'].includes(req.user.role);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to mark this donation completed.' });
    }

    // Duplicate protection: prevent double incrementing donationsCount or awarding duplicate XP
    if (donation.status === 'Completed' || donation.isXpAwarded) {
      return res.status(400).json({ 
        success: false, 
        message: 'This donation has already been marked as completed. Duplicate XP prevented.' 
      });
    }

    // Determine XP reward
    const xpReward = donation.isEmergency 
      ? XP_CONFIG.EMERGENCY_DONATION_COMPLETED 
      : XP_CONFIG.DONATION_COMPLETED;

    // Mark donation record as completed
    donation.status = 'Completed';
    donation.completedAt = new Date();
    donation.xpAwarded = xpReward;
    donation.isXpAwarded = true;
    if (req.body.receiptId) donation.receiptId = req.body.receiptId;
    if (req.body.notes) donation.notes = req.body.notes;
    await donation.save();

    // Increment donor donationsCount and XP atomically
    const donorUser = await User.findById(donation.donor);
    if (!donorUser) {
      return res.status(404).json({ success: false, message: 'Donor user account not found.' });
    }

    donorUser.donationsCount = (donorUser.donationsCount || 0) + 1;
    donorUser.points = (donorUser.points || 0) + xpReward;
    donorUser.lastDonationDate = new Date();
    donorUser.nextDonationDate = calculateNextDonationDate(new Date(), donorUser.medicalDonationGapDays || 90);
    await donorUser.save();

    // If linked to a Request, update request status to Completed
    if (donation.requestId) {
      await Request.findByIdAndUpdate(donation.requestId, { status: 'Completed' });
    }

    // Calculate updated progress
    const emergencyDonationsCount = await Donation.countDocuments({
      donor: donorUser._id,
      status: 'Completed',
      isEmergency: true,
    });
    const updatedProgress = calculateDonorProgress(donorUser, { emergencyDonationsCount });

    // Create In-App Notification for Donor
    await Notification.create({
      userId: donorUser._id,
      title: '🩸 Donation Completed & XP Awarded!',
      message: `Your blood donation has been verified and marked completed! You earned +${xpReward} XP. Current Level: ${updatedProgress.donorLevel} (${updatedProgress.donorRank}).`,
      type: 'donation_completed',
      read: false,
    });

    // Real-time Socket.IO Broadcast
    const io = req.app.get('socketio');
    if (io) {
      io.emit('donor_progress_updated', {
        userId: donorUser._id.toString(),
        ...updatedProgress,
      });
      io.emit('request_update', { requestId: donation.requestId });
    }

    res.json({
      success: true,
      message: `Donation marked completed successfully! Awarded +${xpReward} XP to ${donorUser.name}.`,
      donation,
      progress: updatedProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

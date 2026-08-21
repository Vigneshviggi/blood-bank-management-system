const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const { XP_CONFIG, calculateDonorProgress } = require('../utils/gamification');
const { calculateNextDonationDate } = require('../utils/registrationHelpers');

/**
 * Service to process rewards and gamification for donors
 * Call this when a donation request is marked as "Completed"
 * 
 * @param {String} userId - ID of the donor
 * @param {Object} io - Socket.io instance to emit alerts
 * @param {Object} options - { requestId, isEmergency, donationId }
 */
const processDonationRewards = async (userId, io, options = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const isEmergency = Boolean(options.isEmergency);
    const xpReward = isEmergency ? XP_CONFIG.EMERGENCY_DONATION_COMPLETED : XP_CONFIG.DONATION_COMPLETED;

    // 1. Increment points and donation count
    user.donationsCount = (user.donationsCount || 0) + 1;
    user.points = (user.points || 0) + xpReward;

    const donationDate = new Date();
    user.lastDonationDate = donationDate;
    user.nextDonationDate = new Date(calculateNextDonationDate(donationDate, user.medicalDonationGapDays || 90));
    await user.save();

    // 2. Get updated progress with real achievements
    const emergencyDonationsCount = await Donation.countDocuments({
      donor: user._id,
      status: 'Completed',
      isEmergency: true,
    });
    const progress = calculateDonorProgress(user, { emergencyDonationsCount });

    // 3. Create Notification
    const notif = new Notification({
      userId: user._id,
      title: '🩸 Donation Completed & Points Earned!',
      message: `You earned +${xpReward} XP for completing a blood donation! Current Level: ${progress.donorLevel} (${progress.donorRank}).`,
      type: 'donation_completed',
      link: '/profile',
    });
    await notif.save();

    // 4. Emit real-time Socket.IO events
    if (io) {
      io.emit('donor_progress_updated', {
        userId: user._id.toString(),
        ...progress,
      });
      io.emit('receiveNotification', {
        userId: user._id,
        title: '🩸 Donation Completed & Points Earned!',
        message: `You earned +${xpReward} XP! Current Level: ${progress.donorLevel} (${progress.donorRank}).`,
        type: 'donation_completed',
      });
    }

    return { success: true, user, progress };
  } catch (error) {
    console.error("Reward Service Error:", error);
    return { success: false, error };
  }
};

module.exports = { processDonationRewards };

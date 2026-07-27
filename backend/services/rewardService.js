const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Service to process rewards and gamification for donors
 * Call this when a donation request is marked as "Completed"
 * 
 * @param {String} userId - ID of the donor
 * @param {Object} io - Socket.io instance to emit alerts
 */
const processDonationRewards = async (userId, io) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 1. Increment points and donation count
    // Award 50 points per successful donation
    user.points += 50;
    user.donationsCount += 1;

    let newBadge = null;

    // 2. Check and Award Badges
    const counts = user.donationsCount;
    
    if (counts === 1 && !user.badges.includes('First Donation')) {
      newBadge = 'First Donation';
    } else if (counts === 5 && !user.badges.includes('Hero - 5 Donations')) {
      newBadge = 'Hero - 5 Donations';
    } else if (counts === 10 && !user.badges.includes('Super Hero - 10 Donations')) {
      newBadge = 'Super Hero - 10 Donations';
    } else if (counts === 25 && !user.badges.includes('Legend - 25 Donations')) {
      newBadge = 'Legend - 25 Donations';
    } else if (counts === 50 && !user.badges.includes('Life Saver - 50 Donations')) {
      newBadge = 'Life Saver - 50 Donations';
    }

    if (newBadge) {
      user.badges.push(newBadge);
      
      // Emit real-time badge unlock notification
      const message = `Congratulations! You've unlocked the '${newBadge}' badge and earned 50 points!`;
      
      const notif = new Notification({
        user: user._id,
        title: 'Achievement Unlocked! 🏆',
        message: message,
        type: 'achievement',
        link: '/profile'
      });
      await notif.save();

      if (io) {
        io.emit('receiveNotification', {
          userId: user._id,
          title: 'Achievement Unlocked! 🏆',
          message: message,
          type: 'achievement'
        });
      }
    } else {
      // Just points notification
      const notif = new Notification({
        user: user._id,
        title: 'Points Earned! ⭐',
        message: 'You earned 50 points for your recent donation.',
        type: 'points',
        link: '/profile'
      });
      await notif.save();

      if (io) {
        io.emit('receiveNotification', {
          userId: user._id,
          title: 'Points Earned! ⭐',
          message: 'You earned 50 points for your recent donation.',
          type: 'points'
        });
      }
    }

    await user.save();
    return { success: true, user };

  } catch (error) {
    console.error("Reward Service Error:", error);
    return { success: false, error };
  }
};

module.exports = { processDonationRewards };

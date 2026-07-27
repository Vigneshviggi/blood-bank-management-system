const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all notifications for a user (and global)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const query = {
      $or: [
        { userId },
        { userId: null },
        { userId: { $exists: false } }
      ]
    };

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a notification (Internal use mostly)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    await newNotification.save();
    
    // Emit socket event
    const io = req.app.get('socketio');
    if (io) io.emit('new_notification', newNotification);

    res.status(201).json({ success: true, data: newNotification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Mark as read
router.put('/read/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark all as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all notifications
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.deleteMany({ userId });
    res.json({ success: true, message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

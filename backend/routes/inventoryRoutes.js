const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Scan barcode or QR code
router.get('/scan/:code', verifyToken, async (req, res) => {
  try {
    const { code } = req.params;
    const item = await Inventory.findOne({
      $or: [
        { barcode: code },
        { batchNumber: code },
        { qrCode: { $regex: code, $options: 'i' } }
      ]
    }).populate('bloodBank', 'name phone address').populate('donor', 'name email bloodGroup');

    if (!item) {
      return res.status(404).json({ success: false, message: 'No inventory unit matching code' });
    }

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expiry alerts endpoint
router.get('/expiry-alerts', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const [expiringToday, expiringTomorrow, expired] = await Promise.all([
      Inventory.find({ storageStatus: 'Available', expiryDate: { $gte: today, $lt: tomorrow } }),
      Inventory.find({ storageStatus: 'Available', expiryDate: { $gte: tomorrow, $lt: dayAfterTomorrow } }),
      Inventory.find({ storageStatus: 'Available', expiryDate: { $lt: today } })
    ]);

    res.json({
      expiringTodayCount: expiringToday.length,
      expiringTomorrowCount: expiringTomorrow.length,
      expiredCount: expired.length,
      expiringToday,
      expiringTomorrow,
      expired
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Inventory item
router.put('/:id', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Inventory item
router.delete('/:id', verifyToken, authorizeRoles('blood_bank', 'admin', 'super_admin'), async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

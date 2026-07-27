const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['emergency', 'camp', 'appointment', 'blood_available', 'blood_request', 'donation_reminder', 'inventory', 'system', 'donor_response', 'hospital_alert', 'camp_update'],
    default: 'system'
  },
  urgency: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  redirectUrl: { type: String },
  actions: [{ type: String }],
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

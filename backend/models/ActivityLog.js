const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Some actions might be anonymous (like failed login attempts)
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'REGISTER', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SEARCH', 'OTHER']
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  endpoint: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  }
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

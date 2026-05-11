const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  bloodType: { type: String, required: true },
  priority: { type: String, required: true },
  quantity: { type: Number, required: true },
  dateRequired: { type: Date, required: true },
  reason: { type: String, required: true },
  hospitalName: { type: String },
  location: { type: String },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);

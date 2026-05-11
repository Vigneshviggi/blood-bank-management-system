const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: If donor is logged in
  name: { type: String }, // For anonymous or if name is provided
  available: { type: Boolean, default: true },
  arrivalTime: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);

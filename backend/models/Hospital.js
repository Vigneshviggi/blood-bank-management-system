const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  beds: { type: Number, required: true },
  stock: {
    'O+': { type: Number, default: 0 },
    'A+': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 }
  },
  distance: { type: String },
  verified: { type: Boolean, default: false },
  operatingHours: { type: String, default: '24/7' }
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);

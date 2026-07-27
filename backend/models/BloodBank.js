const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  district: { type: String },
  state: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  manager: { type: String },
  openingHours: { type: String, default: '24/7' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  logoUrl: { type: String, default: '' },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

bloodBankSchema.index({ name: 'text', address: 'text', district: 'text', licenseNumber: 'text' });
bloodBankSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('BloodBank', bloodBankSchema);

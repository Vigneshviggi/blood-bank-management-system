const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String },
  address: { type: String, required: true },
  city: { type: String },
  district: { type: String },
  state: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  emergencyContact: { type: String },
  beds: { type: Number, default: 50 },
  logoUrl: { type: String, default: '' },
  operatingHours: { type: String, default: '24/7' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Dynamic Blood Inventory
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
  
  criticalThresholds: {
    'O+': { type: Number, default: 10 },
    'A+': { type: Number, default: 10 },
    'B+': { type: Number, default: 5 },
    'AB+': { type: Number, default: 5 },
    'O-': { type: Number, default: 15 },
    'A-': { type: Number, default: 5 },
    'B-': { type: Number, default: 5 },
    'AB-': { type: Number, default: 5 }
  },
  
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  distance: { type: String },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

hospitalSchema.index({ name: 'text', address: 'text', city: 'text', district: 'text' });
hospitalSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);

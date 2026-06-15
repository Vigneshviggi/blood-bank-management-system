const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  bio: { type: String, default: '' },
  availability: { type: Boolean, default: true },
  lastDonation: { type: Date },
  donations: { type: Number, default: 0 },
  reliabilityScore: { type: Number, default: 5.0 },
  distance: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);

const mongoose = require('mongoose');

const healthScreeningSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  hemoglobin: { type: Number },
  medicalConditions: [{ type: String }],
  medications: [{ type: String }],
  lastDonationDate: { type: Date },
  status: {
    type: String,
    enum: ['Eligible', 'Temporarily Not Eligible', 'Permanently Not Eligible'],
    required: true
  },
  reason: { type: String }, // Explanation if not eligible
  nextEligibleDate: { type: Date } // Null if permanently ineligible
}, { timestamps: true });

module.exports = mongoose.model('HealthScreening', healthScreeningSchema);

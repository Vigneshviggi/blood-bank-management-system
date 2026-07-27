const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  donationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Rejected'], default: 'Completed' },
  receiptId: { type: String },
  certificateUrl: { type: String },
  hemoglobinLevel: { type: Number },
  pulse: { type: Number },
  bloodPressure: { type: String },
  notes: { type: String }
}, { timestamps: true });

donationSchema.index({ donor: 1, donationDate: -1 });

module.exports = mongoose.model('Donation', donationSchema);

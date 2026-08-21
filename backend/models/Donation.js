const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp' },
  bloodGroup: { type: String, required: true },
  units: { type: Number, default: 1 },
  donationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Scheduled', 'Completed', 'Cancelled', 'Rejected'], 
    default: 'Pending' 
  },
  isEmergency: { type: Boolean, default: false },
  completedAt: { type: Date },
  xpAwarded: { type: Number, default: 0 },
  isXpAwarded: { type: Boolean, default: false },
  receiptId: { type: String },
  certificateUrl: { type: String },
  hemoglobinLevel: { type: Number },
  pulse: { type: Number },
  bloodPressure: { type: String },
  notes: { type: String }
}, { timestamps: true });

donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ requestId: 1, donor: 1 });

module.exports = mongoose.model('Donation', donationSchema);


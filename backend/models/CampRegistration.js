const mongoose = require('mongoose');

const campRegistrationSchema = new mongoose.Schema({
  campId: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, required: true },
  contactInfo: { type: String, required: true },
  status: { type: String, enum: ['Registered', 'Attended', 'Cancelled'], default: 'Registered' },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.CampRegistration || mongoose.model('CampRegistration', campRegistrationSchema);

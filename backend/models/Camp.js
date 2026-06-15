const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'organizerType' },
  organizerType: { type: String, enum: ['User', 'Hospital'], required: true },
  bannerImage: { type: String },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  capacity: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  healthCheckup: { type: Boolean, default: false },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Camp', campSchema);


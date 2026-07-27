const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'organizerType' },
  organizerType: { type: String, enum: ['User', 'Hospital'], required: true },
  organizerName: { type: String, default: '' },
  organizerContact: { type: String, default: '' },
  email: { type: String, default: '' },
  bannerImage: { type: String },
  venueName: { type: String, default: '' },
  location: { type: String, required: true },
  fullAddress: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  googlePlaceId: { type: String, default: '' },
  date: { type: Date, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  time: { type: String, default: '' },
  capacity: { type: Number, required: true },
  maxParticipants: { type: Number, default: 0 },
  registeredCount: { type: Number, default: 0 },
  currentRegistrations: { type: Number, default: 0 },
  bloodGroupsRequired: [{ type: String }],
  description: { type: String, required: true },
  campInstructions: { type: String, default: '' },
  healthCheckup: { type: Boolean, default: false },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'], default: 'Upcoming' },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

campSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Camp', campSchema);


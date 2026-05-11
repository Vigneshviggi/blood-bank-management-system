const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  organizer: { type: String, required: true },
  description: { type: String, required: true },
  participants: { type: Number, default: 0 },
  maxParticipants: { type: Number, required: true },
  imageUrl: { type: String },
  status: { type: String, default: 'Upcoming' },
  bloodTypes: [{ type: String }],
  tests: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Camp', campSchema);

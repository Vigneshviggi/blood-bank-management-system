const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  camp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp'
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  bloodGroup: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

// Prevent a donor from double booking exactly the same time slot
appointmentSchema.index({ donor: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { verifyToken } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');

// Create a new appointment (Book a slot)
router.post('/', verifyToken, logActivity('BOOK_APPOINTMENT'), async (req, res) => {
  try {
    const { hospitalId, campId, date, timeSlot, bloodGroup, notes } = req.body;
    const donorId = req.user._id || req.user.id;

    // Prevent overlapping bookings
    const existing = await Appointment.findOne({ 
      donor: donorId, 
      date: new Date(date), 
      timeSlot 
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an appointment at this time' });
    }

    const appointment = new Appointment({
      donor: donorId,
      hospital: hospitalId,
      camp: campId,
      date,
      timeSlot,
      bloodGroup,
      notes
    });

    await appointment.save();
    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get user's appointments
router.get('/my-appointments', verifyToken, async (req, res) => {
  try {
    const donorId = req.user._id || req.user.id;
    const appointments = await Appointment.find({ donor: donorId })
      .populate('hospital', 'name address')
      .populate('camp', 'name location date')
      .sort({ date: 1, timeSlot: 1 });
      
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hospital's appointments
router.get('/hospital/:hospitalId', verifyToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospital: req.params.hospitalId })
      .populate('donor', 'name email phone bloodGroup')
      .sort({ date: 1, timeSlot: 1 });
      
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reschedule / Update appointment status
router.put('/:id', verifyToken, logActivity('UPDATE_APPOINTMENT'), async (req, res) => {
  try {
    const { timeSlot, date, status } = req.body;
    
    // Check for overlap if rescheduling
    if (timeSlot || date) {
      const existing = await Appointment.findOne({
        _id: { $ne: req.params.id }, // Exclude current appointment
        donor: req.user._id || req.user.id,
        date: date ? new Date(date) : undefined,
        timeSlot: timeSlot || undefined
      });
      
      if (existing) {
        return res.status(400).json({ success: false, message: 'Time slot conflict detected' });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Appointment updated', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cancel appointment
router.delete('/:id', verifyToken, logActivity('CANCEL_APPOINTMENT'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

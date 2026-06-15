const express = require('express');
const router = express.Router();
const Camp = require('../models/Camp');
const CampRegistration = require('../models/CampRegistration');

// Create a new camp
router.post('/', async (req, res) => {
  try {
    const newCamp = new Camp(req.body);
    await newCamp.save();
    res.status(201).json({ success: true, message: 'Camp added', data: newCamp });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all camps
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single camp by ID
router.get('/:id', async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register for a camp
router.post('/:id/register', async (req, res) => {
  try {
    const { userId, bloodGroup, contactInfo } = req.body;
    const campId = req.params.id;

    // Check if already registered
    const existing = await CampRegistration.findOne({ campId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this camp' });
    }

    const registration = new CampRegistration({ campId, userId, bloodGroup, contactInfo });
    await registration.save();

    // Update camp registration count
    await Camp.findByIdAndUpdate(campId, { $inc: { registeredCount: 1 } });

    res.status(201).json({ success: true, message: 'Registered successfully', data: registration });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cancel registration
router.delete('/:id/register/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const deleted = await CampRegistration.findOneAndDelete({ campId: id, userId });
    if (deleted) {
      await Camp.findByIdAndUpdate(id, { $inc: { registeredCount: -1 } });
      res.json({ success: true, message: 'Registration cancelled' });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get registrations for a camp (Organizer only)
router.get('/:id/registrations', async (req, res) => {
  try {
    const registrations = await CampRegistration.find({ campId: req.params.id })
      .populate('userId', 'name email phone bloodGroup');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get camps organized by specific hospital/user
router.get('/organized-by/:id', async (req, res) => {
  try {
    const camps = await Camp.find({ organizerId: req.params.id });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a camp
router.delete('/:id', async (req, res) => {
  try {
    await Camp.findByIdAndDelete(req.params.id);
    // Also delete registrations
    await CampRegistration.deleteMany({ campId: req.params.id });
    res.json({ success: true, message: 'Camp deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get registration status for a specific user and camp
router.get('/:id/registration-status', async (req, res) => {
  try {
    const registration = await CampRegistration.findOne({ 
      campId: req.params.id, 
      userId: req.query.userId // Usually passed as query or from auth middleware
    });
    res.json(registration);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendees for a camp
router.get('/:id/attendees', async (req, res) => {
  try {
    const registrations = await CampRegistration.find({ campId: req.params.id })
      .populate('userId', 'name email phone bloodGroup');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel registration (POST version)
router.post('/:id/cancel-registration', async (req, res) => {
  try {
    const { userId } = req.body; // or from auth
    const deleted = await CampRegistration.findOneAndDelete({ campId: req.params.id, userId });
    if (deleted) {
      await Camp.findByIdAndUpdate(req.params.id, { $inc: { registeredCount: -1 } });
      res.json({ success: true, message: 'Registration cancelled' });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update registration status (Check-in)
router.patch('/registration/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await CampRegistration.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(registration);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const Camp = require('../models/Camp');
const CampRegistration = require('../models/CampRegistration');
const Notification = require('../models/Notification');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const normalizeCampCoordinates = (payload) => {
  const latitude = Number(payload.latitude ?? payload.coordinates?.coordinates?.[1] ?? 0);
  const longitude = Number(payload.longitude ?? payload.coordinates?.coordinates?.[0] ?? 0);
  const coordinates = [longitude, latitude];

  return {
    ...payload,
    latitude,
    longitude,
    coordinates: {
      type: 'Point',
      coordinates
    }
  };
};

// Create a new camp
router.post('/', verifyToken, authorizeRoles('admin', 'hospital', 'blood_bank'), upload.single('bannerImage'), async (req, res) => {
  try {
    const payload = normalizeCampCoordinates(req.body);
    payload.registeredCount = payload.registeredCount ?? payload.currentRegistrations ?? 0;
    payload.currentRegistrations = payload.currentRegistrations ?? payload.registeredCount ?? 0;
    payload.maxParticipants = payload.maxParticipants ?? payload.capacity ?? 0;

    if (req.file) {
      payload.bannerImage = req.file.path;
    }

    const newCamp = new Camp(payload);
    await newCamp.save();

    const io = req.app.get('socketio');
    if (io) io.emit('campUpdate', newCamp);

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

// Get my registrations
router.get('/my-registrations', verifyToken, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const registrations = await CampRegistration.find({ userId }).select('campId').lean();
    const campIds = registrations
      .map((reg) => reg.campId)
      .filter(Boolean)
      .map((campId) => campId.toString());

    res.json(campIds);
  } catch (error) {
    console.error('Camp registration fetch error', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register for a camp
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const { userId, bloodGroup, contactInfo } = req.body;
    const campId = req.params.id;

    const existing = await CampRegistration.findOne({ campId, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this camp' });
    }

    const registration = new CampRegistration({ campId, userId, bloodGroup, contactInfo, status: 'Registered' });
    await registration.save();

    const camp = await Camp.findByIdAndUpdate(campId, { $inc: { registeredCount: 1, currentRegistrations: 1 } }, { new: true });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('campRegistrationUpdate', { campId, registration, camp });
    }

    const notification = new Notification({
      userId,
      title: 'Camp Registration Confirmed',
      message: `You are registered for ${camp?.title || 'the blood donation camp'}.`,
      type: 'camp',
      urgency: 'medium',
      redirectUrl: `/camps/${campId}`,
      actions: ['Navigate']
    });
    await notification.save();

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
router.patch('/registration/:id', verifyToken, authorizeRoles('admin', 'hospital', 'blood_bank'), async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await CampRegistration.findByIdAndUpdate(req.params.id, { status }, { new: true });

    const io = req.app.get('socketio');
    if (io) io.emit('campAttendanceUpdate', registration);

    res.json(registration);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single camp by ID
router.get('/:id', async (req, res, next) => {
  // Prevent catching "my-registrations" if the route ordering gets mixed up
  if (req.params.id === 'my-registrations') {
    return next();
  }
  
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


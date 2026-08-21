const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const OTP = require('../models/OTP');
const Camp = require('../models/Camp');
const Request = require('../models/Request');
const Hospital = require('../models/Hospital');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');
const { calculateDonorProgress } = require('../utils/gamification');

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');
const upload = require('../middleware/upload');
const { buildUserRegistrationPayload, validateUserRegistrationPayload, calculateNextDonationDate } = require('../utils/registrationHelpers');
const { buildVerificationEmailContent } = require('../utils/verificationHelpers');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlifelink';

// Helper to generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

// Register user
router.post('/register', logActivity('REGISTER'), async (req, res) => {
  try {
    const validation = validateUserRegistrationPayload(req.body);
    if (validation.errors.length) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const normalizedPayload = buildUserRegistrationPayload(req.body);
    const existingUser = await User.findOne({ $or: [{ email: normalizedPayload.email }, { phone: normalizedPayload.phone }] });
    if (existingUser) return res.status(400).json({ error: 'User with this email or phone already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(normalizedPayload.password, salt);

    const registrationData = {
      name: normalizedPayload.name,
      email: normalizedPayload.email,
      phone: normalizedPayload.phone,
      password: hashedPassword,
      role: normalizedPayload.role,
      location: normalizedPayload.location
    };

    if (normalizedPayload.coordinates) {
      registrationData.latitude = normalizedPayload.latitude;
      registrationData.longitude = normalizedPayload.longitude;
      registrationData.coordinates = normalizedPayload.coordinates;
    }

    if (normalizedPayload.role === 'donor') {
      registrationData.bloodGroup = normalizedPayload.bloodGroup;
      registrationData.medicalDonationGapDays = 90;
      registrationData.lastDonationDate = null;
      registrationData.nextDonationDate = null;
    }

    if (normalizedPayload.registrationNumber) registrationData.registrationNumber = normalizedPayload.registrationNumber;
    if (normalizedPayload.licenseNumber) registrationData.licenseNumber = normalizedPayload.licenseNumber;

    const user = new User({ ...registrationData, status: 'inactive' });
    await user.save();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.deleteOne({ email: normalizedPayload.email });
    await new OTP({ email: normalizedPayload.email, otp, expiresAt }).save();

    const { subject, text } = buildVerificationEmailContent(otp, 'register');
    
    // Fire and forget email sending to speed up the API response
    sendOTPEmail(normalizedPayload.email, otp, subject, text).catch(err => {
      console.error("Background email send failed:", err);
    });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email to activate your account.',
      requiresEmailVerification: true,
      email: normalizedPayload.email
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login user
router.post('/login', logActivity('LOGIN'), async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Check if account is suspended/inactive
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}` });
    }

    // Compare hashed password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.password === password) isMatch = true; // Support legacy

    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Adding userId as well as id for backward compatibility across both apps
    const token = jwt.sign({ id: user._id, userId: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;
    
    // Set user on req for the activity logger
    req.user = userObj;
    
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Search API (Fuzzy text search)
router.get('/search', verifyToken, logActivity('SEARCH'), async (req, res) => {
  try {
    const { q, filter } = req.query;
    if (!q) return res.status(400).json({ error: 'Query string "q" is required' });

    const results = {};

    if (!filter || filter === 'users' || filter === 'donors') {
      results.users = await User.find(
        { $text: { $search: q }, role: 'donor' },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).select('-password').limit(10);
    }

    if (!filter || filter === 'hospitals') {
      results.hospitals = await Hospital.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(10);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get authenticated user profile with real-time gamification progression
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const emergencyDonationsCount = await Donation.countDocuments({
      donor: user._id,
      status: 'Completed',
      isEmergency: true,
    });
    const progress = calculateDonorProgress(user, { emergencyDonationsCount });
    const userObj = user.toObject ? user.toObject() : { ...user };
    Object.assign(userObj, progress);

    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update preferences
router.put('/preferences', verifyToken, logActivity('UPDATE_PREFERENCES'), async (req, res) => {
  try {
    const { pushNotifications, emailAlerts, locationSharing } = req.body;
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.preferences) user.preferences = {};
    if (pushNotifications !== undefined) user.preferences.pushNotifications = pushNotifications;
    if (emailAlerts !== undefined) user.preferences.emailAlerts = emailAlerts;
    if (locationSharing !== undefined) user.preferences.locationSharing = locationSharing;

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout all devices
router.post('/logout-all', verifyToken, logActivity('LOGOUT_ALL'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Increment tokenVersion to invalidate all existing tokens
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    
    res.json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Change Password
router.post('/change-password', verifyToken, logActivity('CHANGE_PASSWORD'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;
    
    // Find user and include password for comparison
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch && user.password !== currentPassword) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/:id', verifyToken, logActivity('UPDATE'), async (req, res) => {
  try {
    const { name, bloodGroup, location, imageUrl, bio, coordinates, latitude, longitude } = req.body;
    
    // Make sure user can only update their own profile unless admin
    const currentUserId = (req.user._id || req.user.id)?.toString();
    if (currentUserId !== req.params.id && !['admin', 'super_admin'].includes(req.user.role)) {
       return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updateData = { name, bloodGroup, location, imageUrl, bio };
    let lat = null, lng = null;
    if (latitude !== undefined && longitude !== undefined && latitude !== '' && longitude !== '') {
      lat = Number(latitude);
      lng = Number(longitude);
    } else if (coordinates) {
      if (Array.isArray(coordinates) && coordinates.length === 2) {
        lng = Number(coordinates[0]);
        lat = Number(coordinates[1]);
      } else if (typeof coordinates === 'object' && coordinates !== null) {
        lng = Number(coordinates.lng ?? coordinates.longitude);
        lat = Number(coordinates.lat ?? coordinates.latitude);
      }
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
      updateData.latitude = lat;
      updateData.longitude = lng;
      updateData.coordinates = { type: 'Point', coordinates: [lng, lat] };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload profile image
router.post('/:id/upload-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = req.file.path.startsWith('http') ? req.file.path : `${baseUrl}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, { imageUrl }, { new: true }).select('-password');
    
    res.json({ success: true, imageUrl, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lightweight dashboard stats for the mobile home screen
router.get('/stats', async (req, res) => {
  try {
    const [totalDonors, totalRequests, upcomingCamps, completedRequests] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      Request.countDocuments(),
      Camp.countDocuments({ date: { $gte: new Date() } }),
      Request.countDocuments({ status: 'Completed' })
    ]);

    res.json({
      donations: totalRequests,
      livesSaved: completedRequests,
      upcomingCamps,
      totalDonors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Protected: Admin only)
router.get('/', verifyToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID with dynamic gamification progression
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const emergencyDonationsCount = await Donation.countDocuments({
      donor: user._id,
      status: 'Completed',
      isEmergency: true,
    });
    const progress = calculateDonorProgress(user, { emergencyDonationsCount });
    const userObj = user.toObject ? user.toObject() : { ...user };
    Object.assign(userObj, progress);

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test email route
router.get('/test-mail', async (req, res) => {
  try {
    const testEmail = 'vigneshgullapelly143@gmail.com'; // Testing with your email
    const success = await sendOTPEmail(testEmail, '123456');
    if (success) {
      res.send('Professional Test Mail Sent Successfully ✅ Check your inbox!');
    } else {
      res.status(500).send('Failed to send mail. Check backend console for errors.');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

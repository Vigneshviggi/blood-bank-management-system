const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Camp = require('../models/Camp');
const Request = require('../models/Request');
const Hospital = require('../models/Hospital');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlifelink';

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register user
router.post('/register', logActivity('REGISTER'), async (req, res) => {
  try {
    const { name, email, phone, password, role, bloodGroup, location } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ error: 'User with this email or phone already exists' });

    // Validate role
    const validRoles = ['super_admin', 'admin', 'hospital', 'doctor', 'donor', 'volunteer'];
    const assignedRole = validRoles.includes(role) ? role : 'donor';

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, password: hashedPassword, role: assignedRole, bloodGroup, location });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
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
    const token = jwt.sign({ id: user._id, userId: user._id, role: user.role }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '7d' });
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

// Example protected route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const { name, bloodGroup, location, imageUrl, bio, coordinates } = req.body;
    
    // Make sure user can only update their own profile unless admin
    if (req.user.id !== req.params.id && !['admin', 'super_admin'].includes(req.user.role)) {
       return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updateData = { name, bloodGroup, location, imageUrl, bio };
    if (coordinates) {
      updateData.coordinates = { type: 'Point', coordinates: [coordinates.lng, coordinates.lat] };
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
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

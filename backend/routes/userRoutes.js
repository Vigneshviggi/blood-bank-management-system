
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlifelink';

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, location } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role, bloodGroup, location });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Compare hashed password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.password === password) isMatch = true; // Support legacy

    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Example protected route
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FORGOT PASSWORD FLOW ---

// 1. Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Requesting OTP for:", email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = generateOTP();
    
    // Store OTP in DB
    await OTP.deleteOne({ email }); // Clear previous OTPs
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    // Send Professional Email
    const emailSent = await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const validOTP = await OTP.findOne({ email, otp });
    
    if (!validOTP) return res.status(400).json({ error: 'Invalid or expired OTP' });

    res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) return res.status(400).json({ error: 'OTP verification failed' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clear OTP
    await OTP.deleteOne({ _id: validOTP._id });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const { name, bloodGroup, location, imageUrl, bio } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, bloodGroup, location, imageUrl, bio }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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

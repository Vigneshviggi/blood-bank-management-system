const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');
const { buildVerificationEmailContent } = require('../utils/verificationHelpers');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();
const normalizeEmail = (email) => (email || '').trim().toLowerCase();

// 1. Send OTP (Forgot Password - via Email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    console.log("Requesting OTP for email:", normalizedEmail);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate user existence by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store OTP in MongoDB
    await OTP.deleteOne({ email: normalizedEmail }); // Clear previous OTPs
    const newOTP = new OTP({ email: normalizedEmail, otp, expiresAt });
    await newOTP.save();

    const { subject, text } = buildVerificationEmailContent(otp, 'reset');
    const emailSent = await sendOTPEmail(normalizedEmail, otp, subject, text);

    if (emailSent) {
      res.json({ success: true, message: "OTP sent successfully to your email", email: normalizedEmail });
    } else {
      res.status(500).json({
        success: false,
        message: "Email delivery is not configured. Please set real SMTP/Gmail credentials in backend/.env before using forgot password."
      });
    }
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);
    
    // Validate OTP existence and match
    const validOTP = await OTP.findOne({ email: normalizedEmail, otp });
    
    if (!validOTP) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (Date.now() > validOTP.expiresAt) {
      await OTP.deleteOne({ _id: validOTP._id });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const validOTP = await OTP.findOne({ email: normalizedEmail, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (Date.now() > validOTP.expiresAt) {
      await OTP.deleteOne({ _id: validOTP._id });
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Hash new password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Clear OTP after successful reset
    await OTP.deleteOne({ _id: validOTP._id });

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Verify email after registration
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const validOTP = await OTP.findOne({ email: normalizedEmail, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (Date.now() > validOTP.expiresAt) {
      await OTP.deleteOne({ _id: validOTP._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'active';
    await user.save();
    await OTP.deleteOne({ _id: validOTP._id });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.deleteOne({ email: normalizedEmail });
    await new OTP({ email: normalizedEmail, otp, expiresAt }).save();

    const { subject, text } = buildVerificationEmailContent(otp, 'register');
    const emailSent = await sendOTPEmail(normalizedEmail, otp, subject, text);

    if (emailSent) {
      res.json({ success: true, message: 'Verification email resent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Unable to send verification email right now' });
    }
  } catch (err) {
    console.error("RESEND VERIFICATION ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Resend password reset OTP
router.post('/resend-reset-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.deleteOne({ email: normalizedEmail });
    await new OTP({ email: normalizedEmail, otp, expiresAt }).save();

    const { subject, text } = buildVerificationEmailContent(otp, 'reset');
    const emailSent = await sendOTPEmail(normalizedEmail, otp, subject, text);

    if (emailSent) {
      res.json({ success: true, message: 'Reset OTP resent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Unable to send reset OTP right now' });
    }
  } catch (err) {
    console.error("RESEND RESET OTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Check email verification status
router.get('/verification-status/:email', async (req, res) => {
  try {
    const email = normalizeEmail(req.params.email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, verified: user.status === 'active' });
  } catch (err) {
    console.error("VERIFICATION STATUS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Confirm reset password request
router.post('/confirm-reset', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const validOTP = await OTP.findOne({ email: normalizedEmail, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (Date.now() > validOTP.expiresAt) {
      await OTP.deleteOne({ _id: validOTP._id });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error("CONFIRM RESET ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists - update last login and profile picture
      user.lastLogin = new Date();
      if (!user.authProvider || user.authProvider === 'local') {
        user.authProvider = 'local'; // Keep it local if they started as local
      }
      if (picture && !user.imageUrl) {
        user.imageUrl = picture;
      }
      if (!user.googleId) {
         user.googleId = sub;
      }
      await user.save();
    } else {
      // New user - create with Google Provider
      user = new User({
        name,
        email,
        authProvider: 'google',
        googleId: sub,
        imageUrl: picture || '',
        lastLogin: new Date(),
        role: 'donor',
        status: 'active',
        // Provide dummy bloodGroup and location since they are required by the schema initially
        bloodGroup: 'Unknown',
        location: 'Unknown'
      });
      await user.save();
    }

    // Generate JWT (matching the logic in userRoutes.js login)
    const token = jwt.sign(
      { id: user._id, userId: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 },
      process.env.JWT_SECRET || 'supersecretlifelink',
      { expiresIn: '7d' }
    );
    
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json({ token, user: userObj, isNewUser: user.bloodGroup === 'Unknown' });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(401).json({ success: false, message: "Invalid Google Token or server error" });
  }
});

module.exports = router;

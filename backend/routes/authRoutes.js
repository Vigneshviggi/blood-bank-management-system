const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const { sendOTPSMS } = require('../utils/smsService');

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP (Forgot Password - via SMS)
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("Requesting OTP for phone:", phone);

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Validate user existence by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: "User with this phone number not found" });
    }

    const otp = generateOTP();
    
    // Store OTP in MongoDB
    await OTP.deleteOne({ phone }); // Clear previous OTPs for this phone
    const newOTP = new OTP({ phone, otp });
    await newOTP.save();

    // Send SMS using SMS service
    const smsSent = await sendOTPSMS(phone, otp);

    if (smsSent) {
      res.json({ success: true, message: "OTP sent successfully to your phone" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send OTP SMS" });
    }
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Validate OTP existence and match
    const validOTP = await OTP.findOne({ phone, otp });
    
    if (!validOTP) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
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
    const { phone, otp, newPassword } = req.body;

    // Final security check for OTP
    const validOTP = await OTP.findOne({ phone, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: "OTP verification failed or expired" });
    }

    const user = await User.findOne({ phone });
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

module.exports = router;

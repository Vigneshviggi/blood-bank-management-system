const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"LifeLink Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">LifeLink</h1>
          <p style="color: #fda4af; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Professional Blood Network</p>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #64748b; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. Use the verification code below to proceed with the reset process. This code will expire in <strong>5 minutes</strong>.
          </p>
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #e11d48; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            If you did not request this password reset, please ignore this email or contact our support team if you have concerns about your account security.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
            &copy; 2026 LifeLink Professional Blood Network. All rights reserved.<br />
            This is an automated system message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail Sent:", info.response);
    return true;
  } catch (error) {
    console.log("❌ MAIL ERROR:", error);
    // If it fails, we still log for development
    console.log(`[BACKUP LOG] OTP for ${email}: ${otp}`);
    return false;
  }
};

module.exports = { sendOTPEmail };

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a professional OTP email using Nodemailer
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"LifeLink Network" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'LifeLink - OTP Verification Code',
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em;">LifeLink</h1>
            <p style="color: #fda4af; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Professional Blood Network</p>
          </div>
          
          <div style="padding: 40px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 700; text-align: center;">Verification Code</h2>
            <p style="color: #475569; line-height: 1.7; font-size: 16px; text-align: center; margin-bottom: 32px;">
              Your security is our priority. Use the code below to complete your verification process. This code will remain active for <strong>5 minutes</strong>.
            </p>
            
            <div style="background-color: #fff1f2; border: 2px solid #fecdd3; border-radius: 16px; padding: 24px; text-align: center; margin: 0 auto 32px auto; max-width: 240px;">
              <span style="font-size: 42px; font-weight: 800; color: #e11d48; letter-spacing: 12px; font-family: monospace;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
              If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
            </p>
            
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">
                &copy; 2026 LifeLink Professional Blood Network.
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
                This is an automated security message. Please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `Your LifeLink verification code is: ${otp}. This code expires in 5 minutes.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail Sent via Gmail:", info.messageId);
    return true;
  } catch (err) {
    console.log("❌ MAIL SERVICE ERROR:", err);
    console.log(`[BACKUP LOG] OTP for ${email}: ${otp}`);
    return false;
  }
};

module.exports = { sendOTPEmail };

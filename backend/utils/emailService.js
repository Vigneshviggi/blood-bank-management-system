const nodemailer = require('nodemailer');
require('dotenv').config();

const normalizedEmailUser = (process.env.EMAIL_USER || '').trim();

const normalizedEmailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

const normalizedEmailFrom = (process.env.EMAIL_FROM || normalizedEmailUser).trim();

const transporter = process.env.EMAIL_HOST
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: normalizedEmailUser,
        pass: normalizedEmailPass
      }
    })
  : nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: normalizedEmailUser,
        pass: normalizedEmailPass
      }
    });

const sendOTPEmail = async (
  email,
  otp,
  subjectOverride,
  textOverride
) => {
  try {
    const fromAddress =
      normalizedEmailFrom ||
      normalizedEmailUser ||
      'noreply@lifelink.local';

    const fromName =
      process.env.EMAIL_FROM_NAME ||
      'LifeLink Network';

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      replyTo: fromAddress,
      to: email,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Mailer': 'LifeLink-Mailer',
      },

      subject:
        subjectOverride ||
        'LifeLink - OTP Verification Code',

      html: `
        <div style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        
            <div style="padding:28px 24px;text-align:center;background:#d7194a;">
              <div style="font-size:30px;font-weight:700;color:#ffffff;">
                LifeLink
              </div>
        
              <div style="margin-top:6px;font-size:13px;color:#ffe4ea;">
                Blood Network
              </div>
            </div>
        
            <div style="padding:36px 32px;">
        
              <h2 style="margin:0 0 20px;text-align:center;color:#111827;font-size:24px;">
                Verify your email
              </h2>
        
              <p style="color:#4b5563;font-size:15px;line-height:1.7;">
                Hi,
              </p>
        
              <p style="color:#4b5563;font-size:15px;line-height:1.7;">
                Use the verification code below to continue with your LifeLink account.
              </p>
        
              <div style="margin:28px auto;padding:18px;text-align:center;background:#fff5f7;border:1px solid #fecdd3;border-radius:12px;max-width:220px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#d7194a;">
                  ${otp}
                </span>
              </div>
        
              <p style="text-align:center;color:#4b5563;font-size:14px;">
                This code expires in <strong>5 minutes</strong>.
              </p>
        
              <p style="margin-top:28px;color:#6b7280;font-size:13px;line-height:1.6;">
                If you didn't request this code, you can safely ignore this email.
              </p>
        
            </div>
        
            <div style="padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:12px;">
                LifeLink Network
              </p>
        
              <p style="margin:6px 0 0;color:#9ca3af;font-size:11px;">
                Automated security email
              </p>
            </div>
        
          </div>
        </div>
      `,

      text:
        textOverride ||
        `Your LifeLink verification code is: ${otp}. This code expires in 5 minutes.`
    };

    const hasDummyCredentials =
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER.includes('yourgmail') ||
      process.env.EMAIL_PASS.includes('your_google') ||
      process.env.EMAIL_PASS.includes('your');

    if (hasDummyCredentials) {
      console.log("⚠️ Email delivery is not configured.");
      console.log("Please configure EMAIL_USER and EMAIL_PASS.");
      console.log(`[EMAIL NOT SENT] To: ${email}`);
      return false;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail Sent:", info.messageId);
    return true;
  } catch (err) {
    console.log("❌ MAIL SERVICE ERROR:", err);
    console.log(`[BACKUP LOG] Failed to send OTP to ${email}`);
    return false;
  }
};

module.exports = {
  sendOTPEmail
};
const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio only if credentials are provided
let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends an OTP via SMS
 * @param {string} phone - Recipient phone number
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPSMS = async (phone, otp) => {
  try {
    const message = `LifeLink: Your verification code is ${otp}. Valid for 5 minutes.`;

    if (client && twilioPhone) {
      await client.messages.create({
        body: message,
        from: twilioPhone,
        to: phone
      });
      console.log(`✅ SMS Sent to ${phone} via Twilio`);
      return true;
    } else {
      // Mock / Fallback for development
      console.log(`\n--- [SMS MOCK] ---`);
      console.log(`To: ${phone}`);
      console.log(`Message: ${message}`);
      console.log(`------------------\n`);
      return true; // Return true so the flow continues in dev
    }
  } catch (err) {
    console.error("❌ SMS SERVICE ERROR:", err);
    return false;
  }
};

module.exports = { sendOTPSMS };

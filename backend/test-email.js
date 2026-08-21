require('dotenv').config();
const { sendOTPEmail } = require('./utils/emailService');

(async () => {
  console.log("Testing email configuration...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "****" : "MISSING");
  
  try {
    const success = await sendOTPEmail(process.env.EMAIL_USER, '123456');
    console.log("Email sent successfully?", success);
  } catch (error) {
    console.error("Script Error:", error);
  }
})();

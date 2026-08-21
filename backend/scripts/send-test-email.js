require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendOTPEmail } = require('../utils/emailService');

(async () => {
  const recipient = process.env.EMAIL_USER;
  if (!recipient || recipient.includes('your_real_gmail')) {
    console.log('Please set a real Gmail address in backend/.env before running this test.');
    process.exit(1);
  }

  const sent = await sendOTPEmail(recipient, '123456');
  console.log('TEST_EMAIL_SENT', sent);
})();

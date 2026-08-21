function buildVerificationEmailContent(otp, purpose = 'register') {
  const normalizedPurpose = purpose === 'reset' ? 'Password Reset' : 'Email Verification';
  return {
    subject: `LifeLink - ${normalizedPurpose} Code`,
    text: `Your LifeLink ${normalizedPurpose.toLowerCase()} code is ${otp}. This code expires in 5 minutes.`
  };
}

module.exports = { buildVerificationEmailContent };

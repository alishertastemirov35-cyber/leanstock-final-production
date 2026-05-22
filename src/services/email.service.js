const { Resend } = require('resend');
const env = require('../config/env');

async function sendEmail({ to, subject, html }) {
  if (env.EMAIL_PROVIDER === 'resend') {
    const resend = new Resend(env.EMAIL_API_KEY);

    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM_ADDRESS,
      to,
      subject,
      html
    });

    if (error) {
      throw new Error(error.message || 'Resend email failed');
    }

    console.log('REAL EMAIL SENT:', data);
    return data;
  }

  console.log('EMAIL MOCK');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);

  return { mocked: true };
}

module.exports = { sendEmail };
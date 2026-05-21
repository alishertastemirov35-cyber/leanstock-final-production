const nodemailer = require('nodemailer');
const env = require('../config/env');

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('EMAIL MOCK');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    return { mocked: true };
  }

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html
  });
}

module.exports = { sendEmail };

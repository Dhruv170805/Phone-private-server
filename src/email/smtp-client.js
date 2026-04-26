const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport(config.smtp);

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: config.email.user,
      to,
      subject,
      text
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
};

module.exports = { sendEmail };

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  appSecret: process.env.APP_SECRET || 'dev_secret',
  webUser: process.env.WEB_USER || 'admin',
  webPass: process.env.WEB_PASS || 'admin',
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST || 'imap.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 993,
    tls: true
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  allowedSender: process.env.ALLOWED_SENDER,
  dbPath: process.env.DB_PATH || './data/assistant.sqlite'
};

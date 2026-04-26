const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const config = require('../config');
const { parseCommand } = require('./parser');
const { sendEmail } = require('./smtp-client');
const { LogDAO } = require('../db/dao');

const pollEmail = async () => {
  if (!config.email.user || !config.email.pass) {
    console.warn('Email credentials not set. Skipping polling.');
    return;
  }

  const imapConfig = {
    imap: {
      user: config.email.user,
      password: config.email.pass,
      host: config.email.host,
      port: config.email.port,
      tls: config.email.tls,
      authTimeout: 3000
    }
  };

  try {
    const connection = await imaps.connect(imapConfig);
    await connection.openBox('INBOX');

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const msg of messages) {
      const all = msg.parts.find(part => part.which === 'TEXT' || part.which === '');
      const id = msg.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      
      const mail = await simpleParser(idHeader + (all ? all.body : ''));
      const from = mail.from.value[0].address;
      
      if (from === config.allowedSender) {
        const body = mail.text || '';
        const response = await parseCommand(body);
        await LogDAO.log(`Email command from ${from}: ${body.substring(0, 50)}`, 'email');
        await sendEmail(from, `Re: Assistant Command`, response);
      } else {
        await LogDAO.log(`Ignored email from unauthorized sender: ${from}`, 'email', 'warn');
      }
    }

    connection.end();
  } catch (err) {
    console.error('IMAP error:', err);
    await LogDAO.log(`IMAP Error: ${err.message}`, 'email', 'error');
  }
};

const startPolling = () => {
  console.log('Starting email polling...');
  // Initial poll
  pollEmail();
  // Poll every 60 seconds
  setInterval(pollEmail, 60000);
};

module.exports = { startPolling };

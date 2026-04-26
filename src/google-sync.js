const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { ReminderDAO, BirthdayDAO, LogDAO } = require('../db/dao');

// Constants
const TOKEN_PATH = path.join(process.cwd(), 'data/google_token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'data/credentials.json');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/contacts.readonly'
];

/**
 * Get OAuth2 client
 */
async function getClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Google Credentials not found. Please place credentials.json in the data/ folder.');
    return null;
  }

  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  console.warn('⚠️ Google Token not found. Run "node src/google-auth.js" to authorize.');
  return null;
}

/**
 * Sync Calendar Events
 */
async function syncCalendar() {
  const auth = await getClient();
  if (!auth) return;

  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;
    if (events && events.length > 0) {
      for (const event of events) {
        const start = event.start.dateTime || event.start.date;
        // Check if exists or just try to create (DAO should handle or we check manually)
        // For simplicity, we create reminders for new events
        await ReminderDAO.create(`📅 CAL: ${event.summary}`, start, null, 1);
      }
      await LogDAO.log(`Synced ${events.length} Google Calendar events`, 'system');
    }
  } catch (err) {
    console.error('Calendar sync error:', err);
  }
}

/**
 * Sync Contacts Birthdays
 */
async function syncBirthdays() {
  const auth = await getClient();
  if (!auth) return;

  const people = google.people({ version: 'v1', auth });
  try {
    const res = await people.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,birthdays',
    });

    const connections = res.data.connections;
    let count = 0;
    if (connections && connections.length > 0) {
      for (const person of connections) {
        const name = person.names && person.names[0] ? person.names[0].displayName : 'Unknown';
        const birthday = person.birthdays && person.birthdays[0] ? person.birthdays[0].date : null;
        
        if (birthday && birthday.month && birthday.day) {
          const year = birthday.year || 2000;
          const dateStr = `${year}-${String(birthday.month).padStart(2, '0')}-${String(birthday.day).padStart(2, '0')}`;
          await BirthdayDAO.create(name, dateStr);
          count++;
        }
      }
      await LogDAO.log(`Synced ${count} birthdays from Google Contacts`, 'system');
    }
  } catch (err) {
    console.error('Contacts sync error:', err);
  }
}

module.exports = { syncCalendar, syncBirthdays, getClient, SCOPES };

const cron = require('node-cron');
const { ReminderDAO, BirthdayDAO, LogDAO } = require('../db/dao');
const { sendEmail } = require('../email/smtp-client');
const config = require('../config');
const { syncCalendar, syncBirthdays } = require('../google-sync');

const sendSummary = async (date, title) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    const reminders = await ReminderDAO.getForDate(dateStr);
    const birthdays = await BirthdayDAO.getForMonthDay(monthDay);

    if (reminders.length === 0 && birthdays.length === 0) {
      console.log(`No events for ${title}. Skipping summary.`);
      return;
    }

    let summary = `--- ${title} (${dateStr}) ---\n\n`;
    
    if (birthdays.length > 0) {
      summary += "🎂 Birthdays:\n" + birthdays.map(b => `- ${b.name}`).join('\n') + "\n\n";
    }
    
    if (reminders.length > 0) {
      summary += "⏰ Reminders / Meetings:\n" + reminders.map(r => `- ${r.task} (${new Date(r.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`).join('\n') + "\n";
    }

    await sendEmail(config.allowedSender, `${title} Summary`, summary);
    await LogDAO.log(`${title} summary sent`, 'scheduler');
  } catch (err) {
    console.error(`${title} summary job error:`, err);
  }
};

const startScheduler = () => {
  console.log('Starting scheduler...');

  // 1. Google Sync (Every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running Google Sync job...');
    await syncCalendar();
    await syncBirthdays();
  });

  // 2. Morning Summary (Today) - 7 AM
  cron.schedule('0 7 * * *', async () => {
    console.log('Running morning summary...');
    await sendSummary(new Date(), "Morning");
  });

  // 3. Night Summary (Tomorrow's Preview) - 9 PM
  cron.schedule('0 21 * * *', async () => {
    console.log('Running night summary...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await sendSummary(tomorrow, "Tomorrow's Preview");
  });

  // 4. Real-time reminder check (every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const nowISO = now.toISOString().substring(0, 16); 
      
      const reminders = await ReminderDAO.getAll();
      const due = reminders.filter(r => r.completed === 0 && r.due_date.startsWith(nowISO));

      for (const r of due) {
        await sendEmail(config.allowedSender, `REMINDER: ${r.task}`, `Alert: ${r.task}`);
        await LogDAO.log(`Reminder alert sent: ${r.task}`, 'scheduler');
      }
    } catch (err) {
      console.error('Reminder check job error:', err);
    }
  });
};

module.exports = { startScheduler };

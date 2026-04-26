const { ReminderDAO, BirthdayDAO } = require('../db/dao');

const parseCommand = async (text) => {
  const cleanText = text.trim();

  // Structured commands
  // ADD REMINDER: Buy milk at 6 PM
  if (cleanText.toUpperCase().startsWith('ADD REMINDER:')) {
    const content = cleanText.substring(13).trim();
    // Simple split by "at" or "on" for date parsing
    let [task, datePart] = content.split(/\sat\s|\son\s/i);
    if (!datePart) datePart = new Date().toISOString(); // Default to now if not specified
    
    await ReminderDAO.create(task.trim(), datePart.trim());
    return `Added reminder: ${task.trim()} for ${datePart.trim()}`;
  }

  // ADD BIRTHDAY: Mom 12 May
  if (cleanText.toUpperCase().startsWith('ADD BIRTHDAY:')) {
    const content = cleanText.substring(13).trim();
    const parts = content.split(/\s+/);
    const name = parts[0];
    const date = parts.slice(1).join(' ');
    
    await BirthdayDAO.create(name, date);
    return `Added birthday: ${name} on ${date}`;
  }

  // DELETE: Mom
  if (cleanText.toUpperCase().startsWith('DELETE:')) {
    const name = cleanText.substring(7).trim();
    await BirthdayDAO.deleteByName(name);
    return `Deleted entries matching: ${name}`;
  }

  // SHOW: TODAY
  if (cleanText.toUpperCase().startsWith('SHOW: TODAY')) {
    const reminders = await ReminderDAO.getToday();
    const birthdays = await BirthdayDAO.getToday();
    
    let response = "Today's Schedule:\n";
    if (birthdays.length > 0) {
      response += "\nBirthdays:\n" + birthdays.map(b => `🎂 ${b.name}`).join('\n');
    }
    if (reminders.length > 0) {
      response += "\nReminders:\n" + reminders.map(r => `⏰ ${r.task}`).join('\n');
    }
    if (birthdays.length === 0 && reminders.length === 0) {
      response += "Nothing scheduled for today.";
    }
    return response;
  }

  // Natural language fallback (very basic)
  if (cleanText.toLowerCase().includes('remind me to')) {
    const task = cleanText.toLowerCase().replace('remind me to', '').trim();
    await ReminderDAO.create(task, new Date().toISOString());
    return `Added reminder: ${task}`;
  }

  return "Unknown command. Try 'ADD REMINDER: task at time' or 'SHOW: TODAY'.";
};

module.exports = { parseCommand };

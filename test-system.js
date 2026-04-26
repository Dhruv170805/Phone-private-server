const { initDb, db } = require('./src/db/schema');
const { ReminderDAO, BirthdayDAO, LogDAO } = require('./src/db/dao');
const { parseCommand } = require('./src/email/parser');

async function runTests() {
  console.log('🧪 Starting System Tests...');

  try {
    // 1. Initialize Database
    await initDb();
    console.log('✅ Database initialized.');

    // 2. Test Reminder DAO
    const reminderId = await ReminderDAO.create('Test Task', '2026-04-26T10:00:00Z', null, 1);
    console.log(`✅ Reminder created with ID: ${reminderId}`);

    const todayReminders = await ReminderDAO.getToday();
    console.log(`✅ Today's reminders fetched: ${todayReminders.length}`);

    // 3. Test Birthday DAO
    const birthdayId = await BirthdayDAO.create('Test User', '1990-04-26');
    console.log(`✅ Birthday created with ID: ${birthdayId}`);

    const todayBirthdays = await BirthdayDAO.getToday();
    console.log(`✅ Today's birthdays fetched: ${todayBirthdays.length}`);

    // 4. Test Email Parser
    console.log('Testing Email Parser...');
    
    const res1 = await parseCommand('ADD REMINDER: Buy bread at 8 PM');
    console.log(`📩 Parser Result 1: ${res1}`);

    const res2 = await parseCommand('SHOW: TODAY');
    console.log(`📩 Parser Result 2:\n${res2}`);

    const res3 = await parseCommand('ADD BIRTHDAY: Alice 20 May');
    console.log(`📩 Parser Result 3: ${res3}`);

    // 5. Verify Logs
    const logs = await LogDAO.getRecent(5);
    console.log(`✅ System logs verified: ${logs.length} entries found.`);

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');
    process.exit(0);
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();

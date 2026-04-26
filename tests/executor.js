const { ReminderDAO, BirthdayDAO } = require('../src/db/dao');
const { parseCommand } = require('../src/email/parser');
const { initDb } = require('../src/db/schema');

async function runExecutorAgent() {
  console.log('⚙️ Executor Agent: Starting Functional & Integration Tests...');
  const logs = [];
  let failures = 0;

  try {
    await initDb();

    const testCases = [
      { cmd: 'ADD REMINDER: Gym session at 6 PM', expected: 'Gym session' },
      { cmd: 'ADD BIRTHDAY: Sarah 20 June', expected: 'Sarah' },
      { cmd: 'SHOW: TODAY', expected: 'Today' }
    ];

    for (const test of testCases) {
      console.log(`  - Executing Command: "${test.cmd}"`);
      const response = await parseCommand(test.cmd);
      
      if (response.includes(test.expected) || response.toLowerCase().includes('today')) {
        logs.push(`✅ PASS: ${test.cmd}`);
      } else {
        logs.push(`❌ FAIL: ${test.cmd} (Unexpected response: ${response})`);
        failures++;
      }
    }

    // Verify DB persistence
    const reminders = await ReminderDAO.getAll();
    if (reminders.length > 0) {
      logs.push(`✅ PASS: Database persistence verified (${reminders.length} items found)`);
    } else {
      logs.push(`❌ FAIL: Database persistence failed (0 items found)`);
      failures++;
    }

    return { failures, logs, status: failures === 0 ? 'PASS' : 'FAIL' };
  } catch (err) {
    return { failures: 1, logs: [`❌ CRITICAL ERROR: ${err.message}`], status: 'FAIL' };
  }
}

module.exports = runExecutorAgent;

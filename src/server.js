const express = require('express');
const path = require('path');
const config = require('./config');
const { initDb, db } = require('./db/schema');
const routes = require('./api/routes');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const { startPolling } = require('./email/imap-client');
const { startScheduler } = require('./scheduler/cron-jobs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api', routes);

// Start server
const start = async () => {
  try {
    await initDb();
    
    // Create default user if none exists
    db.get('SELECT count(*) as count FROM users', async (err, row) => {
      if (row.count === 0) {
        const hashedPassword = await bcrypt.hash(config.webPass, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [config.webUser, hashedPassword]);
        console.log(`Default user created: ${config.webUser}`);
      }
    });

    startPolling();
    startScheduler();

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

start();

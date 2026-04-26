const { db } = require('./schema');

const ReminderDAO = {
  create: (task, dueDate, repeat = null, priority = 1) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO reminders (task, due_date, repeat, priority) VALUES (?, ?, ?, ?)',
        [task, dueDate, repeat, priority],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM reminders ORDER BY due_date ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getForDate: (dateString) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM reminders WHERE date(due_date) = ? AND completed = 0 ORDER BY due_date ASC',
        [dateString],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getToday: function() {
    const today = new Date().toISOString().split('T')[0];
    return this.getForDate(today);
  },

  complete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE reminders SET completed = 1 WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM reminders WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

const BirthdayDAO = {
  create: (name, date, phone = null, message = null) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO birthdays (name, date, phone, message) VALUES (?, ?, ?, ?)',
        [name, date, phone, message],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM birthdays ORDER BY date ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getForMonthDay: (monthDay) => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM birthdays WHERE strftime('%m-%d', date) = ?",
        [monthDay],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  getToday: function() {
    const today = new Date();
    const monthDay = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return this.getForMonthDay(monthDay);
  },

  deleteByName: (name) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM birthdays WHERE name LIKE ?', [`%${name}%`], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

const LogDAO = {
  log: (message, source = 'system', level = 'info') => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO logs (message, source, level) VALUES (?, ?, ?)',
        [message, source, level],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getRecent: (limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ?', [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = {
  ReminderDAO,
  BirthdayDAO,
  LogDAO
};

const express = require('express');
const router = express.Router();
const { ReminderDAO, BirthdayDAO, LogDAO } = require('../db/dao');
const { login, authMiddleware } = require('./auth');

// Auth
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await login(username, password);
    if (result) res.json(result);
    else res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Routes
router.use(authMiddleware);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const reminders = await ReminderDAO.getToday();
    const birthdays = await BirthdayDAO.getToday();
    const logs = await LogDAO.getRecent(10);
    res.json({ reminders, birthdays, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reminders
router.get('/reminders', async (req, res) => {
  try {
    const reminders = await ReminderDAO.getAll();
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reminders', async (req, res) => {
  const { task, due_date, repeat, priority } = req.body;
  try {
    const id = await ReminderDAO.create(task, due_date, repeat, priority);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reminders/:id/complete', async (req, res) => {
  try {
    await ReminderDAO.complete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reminders/:id', async (req, res) => {
  try {
    await ReminderDAO.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Birthdays
router.get('/birthdays', async (req, res) => {
  try {
    const birthdays = await BirthdayDAO.getAll();
    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/birthdays', async (req, res) => {
  const { name, date, phone, message } = req.body;
  try {
    const id = await BirthdayDAO.create(name, date, phone, message);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await LogDAO.getRecent(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

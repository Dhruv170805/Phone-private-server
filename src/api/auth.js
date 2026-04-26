const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { db } = require('../db/schema');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, config.appSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate' });
    req.userId = decoded.id;
    next();
  });
};

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return reject(err);
      if (!user) return resolve(null);

      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const token = jwt.sign({ id: user.id }, config.appSecret, { expiresIn: '30d' });
        resolve({ token, user: { username: user.username } });
      } else {
        resolve(null);
      }
    });
  });
};

module.exports = {
  authMiddleware,
  login
};

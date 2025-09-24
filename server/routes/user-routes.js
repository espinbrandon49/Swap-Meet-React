// routes/user-routes.js
const router = require('express').Router();
const { User } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');
const { sign } = require('jsonwebtoken');

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password;

    if (!username) return res.status(400).json({ error: 'username is required' });
    if (!password) return res.status(400).json({ error: 'password is required' });

    const user = await User.create({ username, password });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'username already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation failed' });
    }
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfigured: JWT secret missing' });
    }

    const token = sign(
      { username: user.username, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: user.username, id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/auth
router.get('/auth', validateToken, (req, res) => {
  res.json(req.user);
});

// GET /api/users/basicinfo/:id
router.get('/basicinfo/:id', async (req, res) => {
  try {
    const basicInfo = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!basicInfo) return res.status(404).json({ message: 'Not found' });
    res.json(basicInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

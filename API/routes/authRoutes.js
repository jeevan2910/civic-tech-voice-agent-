const express = require('express');
const router = express.Router();
const { login, verifyToken, getUsers } = require('../services/authService');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = login(email, password);
  if (!result.success) {
    return res.status(401).json({ error: result.message });
  }

  res.json(result);
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/demo-users (helpful for fast switching on login screen)
router.get('/demo-users', (req, res) => {
  const users = getUsers().map(u => ({
    email: u.email,
    password: u.password,
    role: u.role,
    name: u.name,
    title: u.title,
    department_name: u.department_name
  }));
  res.json(users);
});

module.exports = router;

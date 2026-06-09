const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

// Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google auth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // On success, redirect to frontend with a token or set cookie
    const user = req.user;
    // For simplicity, redirect to frontend home
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication Failed' });
});

// Development-only: mock login/logout to simulate authenticated user when SKIP_DB=true
router.post('/mock-login', (req, res) => {
  if (process.env.SKIP_DB !== 'true') return res.status(403).json({ error: 'Mock login disabled' });
  const { _id, name, email, role } = req.body || {};
  const mockUser = { id: _id || 'mockid', _id: _id || 'mockid', name: name || 'Dev User', email: email || 'dev@example.com', role: role || 'student' };
  req.session.mockUser = mockUser;
  req.user = mockUser;
  res.status(200).json({ message: 'Mock login set', user: mockUser });
});

router.post('/mock-logout', (req, res) => {
  if (process.env.SKIP_DB !== 'true') return res.status(403).json({ error: 'Mock logout disabled' });
  if (req.session) delete req.session.mockUser;
  req.user = null;
  res.status(200).json({ message: 'Mock logout successful' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Import Auth Middlewares
const apiKeyAuth = require('../middleware/apiKeyAuth');
const jwtAuth = require('../middleware/jwtAuth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Import User Model to validate real users
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Week 4 Task 2 (Part 4): Complete Secure API Example
// Health check (no auth required)
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Login endpoint (strict rate limiting applied)
router.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find the user
    const dbUser = await User.findOne({ where: { username } });
    
    if (dbUser) {
      const match = await bcrypt.compare(password, dbUser.password);
      if (match) {
        // Generate JWT Token
        const token = jwt.sign(
          { userId: dbUser.id, username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ success: true, token });
      }
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Protected route: Public API with API Key (Step 3)
router.get('/data', apiKeyAuth, (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Secure Item 1' },
      { id: 2, name: 'Secure Item 2' },
    ],
  });
});

// Protected route: User profile with JWT (Step 3)
router.get('/profile', jwtAuth, (req, res) => {
  res.json({
    message: 'This is your secure API profile',
    user: req.user,
  });
});

// Update profile (JWT protected)
router.put('/profile', jwtAuth, (req, res) => {
  res.json({
    message: 'Profile updated successfully via API',
    user: req.user,
  });
});

module.exports = router;

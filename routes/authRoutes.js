const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const pageController = require('../controllers/pageController');
const { csrfProtection } = require('../middleware/csrfProtection');
const { body } = require('express-validator');

router.get('/', pageController.renderHome);
router.get('/about', pageController.renderAbout);
router.get('/contact', pageController.renderContact);

// Week 5 Task: Apply CSRF protection to form routes
router.get('/register', csrfProtection, authController.renderRegister);
router.post('/register', 
  csrfProtection, 
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters').escape(),
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  authController.register
);

router.get('/login', csrfProtection, authController.renderLogin);
router.post('/login', 
  csrfProtection, 
  [
    body('username').trim().notEmpty().withMessage('Username or email is required').escape(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

router.get('/profile', authController.renderProfile);
router.get('/logout', authController.logout);

module.exports = router;

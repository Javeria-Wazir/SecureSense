const User = require('../models/User');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator'); // Kept for any manual fallback if needed
const { validationResult } = require('express-validator');

exports.renderRegister = (req, res) => {
  // Week 5 Task: Pass CSRF token to the form
  res.render('register', { csrfToken: req.csrfToken() });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', { 
        error: errors.array()[0].msg, 
        csrfToken: req.csrfToken() 
      });
    }

    // BEFORE: No input validation
    // AFTER: Sanitizing input and verifying email using express-validator
    const { username, email, password } = req.body;

    // BEFORE: Saving plain text password directly to the database.
    // const user = await User.create({ username, email, password });

    // AFTER: Hashing password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    
    if (req.app.locals.logger) req.app.locals.logger.info(`User registered: ${username}`);
    res.redirect('/login');
  } catch (error) {
    // BEFORE: Sending the raw error trace back to the user
    // AFTER: Sending generic error response and logging the specific detail
    if (req.app.locals.logger) req.app.locals.logger.error(`Registration error: ${error.message}`);
    res.status(500).send(`Registration Error: Please try again later.`);
  }
};

exports.renderLogin = (req, res) => {
  // Week 5 Task: Pass CSRF token to the form
  res.render('login', { csrfToken: req.csrfToken() });
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', { 
        error: errors.array()[0].msg, 
        csrfToken: req.csrfToken() 
      });
    }

    const { username, password } = req.body;

    // BEFORE: Raw string query susceptible to SQL Injection
    // const query = `SELECT * FROM Users WHERE username = '${username}' AND password = '${password}'`;
    // const users = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    // AFTER: Using Sequelize parameterised queries to prevent SQL Injection
    const dbUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      },
      order: [['id', 'DESC']] // Pick the most recently created user in case of duplicates
    });

    if (dbUser) {
      // Check if password starts with bcrypt format, if not, it means it's an old plain-text password from before we fixed it,
      // and bcrypt.compare will fail or take forever. Support fallback for old users or just rely on bcrypt.
      let match = false;
      if (dbUser.password.startsWith('$2b$')) {
          match = await bcrypt.compare(password, dbUser.password);
      } else {
          match = (password === dbUser.password); // Fallback for old vulnerable records
      }
      
      if (match) {
        // AFTER: Basic token-based authentication using jsonwebtoken
        // Week 6 Task: Include role in JWT payload for RBAC
        const token = jwt.sign({ id: dbUser.id, role: dbUser.role }, process.env.JWT_SECRET);
        
        // Storing in session and cookie for the frontend EJS application logic
        req.session.userId = dbUser.id;
        req.session.username = dbUser.username;
        req.session.role = dbUser.role; // Add role to session for the frontend
        res.cookie('token', token, { 
          httpOnly: true, 
          sameSite: 'strict', 
          secure: process.env.NODE_ENV === 'production' 
        });

        if (req.app.locals.logger) req.app.locals.logger.info(`Successful login: ${username}`);
        
        // Save session before redirecting to ensure it persists
        return req.session.save(() => {
          res.redirect('/');
        });
      }
    }

    if (req.app.locals.logger) req.app.locals.logger.info(`Failed login attempt for: ${username}`);
    return res.render('login', { error: 'Invalid credentials', csrfToken: req.csrfToken() });
  } catch (error) {
    // BEFORE: res.status(500).send(`Login Error: <br><pre>${error.stack}</pre>`);
    // AFTER: Generic message 
    if (req.app.locals.logger) req.app.locals.logger.error(`Login error: ${error.message}`);
    res.status(500).send(`Login Error: An unexpected error occurred.`);
  }
};

exports.renderProfile = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  res.render('profile', { username: req.session.username });
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

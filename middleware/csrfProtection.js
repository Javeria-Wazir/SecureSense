const csrf = require('csurf');

// Week 5 Task: Anti-CSRF Protection
// Create CSRF protection middleware using secure cookies
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  } 
});

module.exports = { csrfProtection };

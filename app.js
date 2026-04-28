require('dotenv').config();
console.log('dotenv loaded');
const express = require('express');
console.log('express loaded');
const session = require('express-session');
console.log('session loaded');
const bodyParser = require('body-parser');
console.log('bodyParser loaded');
const cookieParser = require('cookie-parser');
console.log('cookieParser loaded');
const sequelize = require('./config/database');
console.log('sequelize loaded');
const authRoutes = require('./routes/authRoutes');
console.log('authRoutes loaded');

// Import new Week 4 Middlewares
const securityHeaders = require('./middleware/securityHeaders');
const corsConfig = require('./middleware/corsConfig');
const { apiLimiter } = require('./middleware/rateLimiter');
const { csrfProtection } = require('./middleware/csrfProtection');
const apiRoutes = require('./routes/api');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security.log' })
  ]
});
logger.info('Application started');

// Make logger accessible via app.locals if needed globally, or we can export it later
const app = express();
app.disable('x-powered-by'); // Prevent information leak about Express
app.locals.logger = logger;
console.log('app created');


// Set View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.static('public'));

// Week 4 Task 2 (Part 4): Body parser limits and CORS
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(bodyParser.urlencoded({ limit: '10kb', extended: true })); // Limit URL-encoded payload size

// Week 5 Task: CSRF Protection - Cookie Parser must come before CSRF
app.use(cookieParser()); // Cookie parser for CSRF token

// Apply Week 4 CORS middleware
app.use(corsConfig);

// Apply Week 4 Security Headers (CSP, HSTS, etc.)
app.use(securityHeaders);

// Apply Week 4 Rate limiting to all API routes
app.use('/api/', apiLimiter);

// BEFORE: app.use(session({ secret: process.env.SESSION_SECRET || 'fallback_secret', resave: false, saveUninitialized: false }));
// AFTER: Security configuration for session, using httpOnly, sameSite, and secure (if production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    sameSite: 'strict', // Changed from lax to strict to prevent CSRF and session hijacking
    secure: process.env.NODE_ENV === 'production' // Requires HTTPS in production
  }
}));

// Routes
app.use('/', authRoutes);

// Week 4 Task 2 (Part 4): Secure API Routes
app.use('/api', apiRoutes);

// CSRF Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Error:', err.message);
    res.status(403).send('CSRF token validation failed. Please try again.');
  } else {
    next(err);
  }
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (!res.headersSent) {
    // VULNERABILITY FIX: Prevent Format String / Info Leak by not sending err.message
    res.status(err.status || 500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
console.log('syncing database...');
// Sync database and start server
sequelize.sync({ alter: true }) // Uses alter: true to update the database schema with new columns (like 'role')
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
 
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

setInterval(() => {}, 10000); // keep event loop alive


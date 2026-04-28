const cors = require('cors');

// Week 4 Task 2 (Step 2): Configure CORS Properly
// Define trusted origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://yourdomain.com',
  'https://app.yourdomain.com',
];

const corsOptions = {
  // Restrict to specific origins
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  
  // Only allow specific HTTP methods to prevent unexpected actions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  
  // Only expose necessary headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count'],
  
  // Allow credentials (cookies, auth headers) for secure cross-origin communication
  credentials: true,
  
  // Cache preflight requests for 24 hours to reduce server load
  maxAge: 86400,
  
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);

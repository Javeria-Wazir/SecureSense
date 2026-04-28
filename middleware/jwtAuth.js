const jwt = require('jsonwebtoken');

// Week 4 Task 2 (Step 3): JWT Authentication
const jwtAuth = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const token = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }
  
  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid token',
      message: err.message,
    });
  }
};

module.exports = jwtAuth;

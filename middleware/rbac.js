// Week 6 Task: Zero Trust Security - Role-Based Access Control (RBAC)
const requireRole = (role) => {
  return (req, res, next) => {
    // Assuming req.user is set by jwtAuth middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have the required permissions to access this resource'
      });
    }

    next();
  };
};

module.exports = { requireRole };

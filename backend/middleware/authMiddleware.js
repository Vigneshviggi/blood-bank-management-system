const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Check if auth header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Check if tokenVersion matches (for Logout All Devices feature)
    // If decoded.tokenVersion is undefined, default to 0 for backwards compatibility
    const tokenVersion = decoded.tokenVersion || 0;
    const userTokenVersion = user.tokenVersion || 0;
    if (tokenVersion !== userTokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }

    // Check if user is active
    if (user.status !== 'active' && user.status !== undefined) {
      return res.status(403).json({ success: false, message: `Account is ${user.status}` });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token failed', error: error.message });
  }
};

/**
 * Role-Based Access Control (RBAC)
 * Example usage: authorizeRoles('super_admin', 'admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };

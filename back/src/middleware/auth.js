const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Проверка JWT токена
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Authentication error.' });
  }
};

// Проверка роли Admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Проверка роли Organizer или Admin
exports.requireOrganizer = (req, res, next) => {
  if (!['admin', 'organizer'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Access denied. Organizer privileges required.' 
    });
  }
  next();
};

// Проверка роли Student (любой авторизованный)
exports.requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Access denied. Authentication required.' 
    });
  }
  next();
};

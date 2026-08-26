const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bachat_bazar_super_secret_jwt_key_2026');

      if (mongoose.connection.readyState !== 1) {
        const found = mockStore.users.find(u => u._id === decoded.id) || {
          _id: decoded.id,
          name: 'Demo Shopper',
          email: 'shopper@bachatbazar.in',
          wishlist: []
        };
        req.user = found;
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        const found = mockStore.users.find(u => u._id === decoded.id);
        if (found) {
          req.user = found;
          return next();
        }
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };

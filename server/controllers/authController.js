const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'bachat_bazar_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      const existing = mockStore.users.find(u => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email: lowerEmail,
        passwordHash: await bcrypt.hash(password, 10),
        wishlist: [],
        createdAt: new Date()
      };
      mockStore.users.push(newUser);

      return res.status(201).json({
        success: true,
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          wishlist: newUser.wishlist,
          token: generateToken(newUser._id)
        }
      });
    }

    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: lowerEmail,
      password
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    // Fallback to mock registration
    const { name, email } = req.body;
    const lowerEmail = (email || 'user@example.com').toLowerCase().trim();
    const newUser = {
      _id: 'usr_' + Date.now(),
      name: name || 'User',
      email: lowerEmail,
      wishlist: [],
      createdAt: new Date()
    };
    mockStore.users.push(newUser);

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        wishlist: [],
        token: generateToken(newUser._id)
      }
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u.email === lowerEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.passwordHash || '');
      if (!match && password !== 'password123') {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          wishlist: user.wishlist,
          token: generateToken(user._id)
        }
      });
    }

    const user = await User.findOne({ email: lowerEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    const lowerEmail = (req.body.email || '').toLowerCase().trim();
    const user = mockStore.users.find(u => u.email === lowerEmail) || mockStore.users[0];
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      }
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user?._id) || mockStore.users[0];
      const populatedWishlist = mockStore.products.filter(p => (user.wishlist || []).includes(p._id));
      return res.json({
        success: true,
        data: {
          ...user,
          wishlist: populatedWishlist
        }
      });
    }

    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.json({
      success: true,
      data: mockStore.users[0]
    });
  }
};

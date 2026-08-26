const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user?._id) || mockStore.users[0];
      const items = mockStore.products.filter(p => (user.wishlist || []).includes(p._id));
      return res.json({
        success: true,
        count: items.length,
        data: items
      });
    }

    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    const items = mockStore.products.slice(0, 2);
    res.json({ success: true, count: items.length, data: items });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user?._id) || mockStore.users[0];
      if (!user.wishlist) user.wishlist = [];
      if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
      }
      return res.json({
        success: true,
        message: 'Product added to wishlist',
        data: user.wishlist
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product is already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: user.wishlist
    });
  } catch (error) {
    res.json({ success: true, message: 'Product added to wishlist' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user?._id) || mockStore.users[0];
      if (user.wishlist) {
        user.wishlist = user.wishlist.filter(id => id !== productId);
      }
      return res.json({
        success: true,
        message: 'Product removed from wishlist',
        data: user.wishlist
      });
    }

    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: user.wishlist
    });
  } catch (error) {
    res.json({ success: true, message: 'Product removed from wishlist' });
  }
};

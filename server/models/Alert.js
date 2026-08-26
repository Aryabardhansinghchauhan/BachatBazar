const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required']
  },
  currentPriceWhenSet: {
    type: Number,
    required: true
  },
  retailerPreference: {
    type: String,
    enum: ['any', 'flipkart', 'amazon'],
    default: 'any'
  },
  status: {
    type: String,
    enum: ['active', 'triggered', 'cancelled'],
    default: 'active',
    index: true
  },
  triggeredAt: {
    type: Date
  },
  lastNotifiedPrice: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', AlertSchema);

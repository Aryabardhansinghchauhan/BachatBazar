const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  retailer: {
    type: String,
    enum: ['flipkart', 'amazon', 'croma', 'reliance'],
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  checkedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Composite index for fast range queries
PriceHistorySchema.index({ productId: 1, retailer: 1, checkedAt: -1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);

const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
  retailer: {
    type: String,
    enum: ['flipkart', 'amazon', 'croma', 'reliance'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  mrp: {
    type: Number,
    default: 0
  },
  discountPct: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  seller: {
    type: String,
    default: 'Verified Seller'
  },
  deliveryText: {
    type: String,
    default: 'Free Delivery'
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: 'text'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  specs: {
    type: Map,
    of: String,
    default: {}
  },
  sources: [SourceSchema],
  cheapestSource: {
    retailer: String,
    price: Number,
    savingsVsMrp: Number
  },
  allTimeLow: {
    price: Number,
    retailer: String,
    date: Date
  },
  allTimeHigh: {
    price: Number,
    retailer: String,
    date: Date
  }
}, {
  timestamps: true
});

// Middleware to calculate cheapest source before saving
ProductSchema.pre('save', function(next) {
  if (this.sources && this.sources.length > 0) {
    const validSources = this.sources.filter(s => s.inStock && s.currentPrice > 0);
    if (validSources.length > 0) {
      const cheapest = validSources.reduce((min, s) => s.currentPrice < min.currentPrice ? s : min, validSources[0]);
      const maxMrp = Math.max(...this.sources.map(s => s.mrp || s.currentPrice));
      this.cheapestSource = {
        retailer: cheapest.retailer,
        price: cheapest.currentPrice,
        savingsVsMrp: maxMrp > cheapest.currentPrice ? maxMrp - cheapest.currentPrice : 0
      };
    }
  }
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);

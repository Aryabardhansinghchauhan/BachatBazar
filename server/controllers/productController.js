const mongoose = require('mongoose');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all products with filters & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, sort, page = 1, limit = 12, retailer } = req.query;

    if (!isDbConnected()) {
      let list = [...mockStore.products];
      if (category && category !== 'All') {
        list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (brand) {
        list = list.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
      }
      if (minPrice) {
        list = list.filter(p => (p.cheapestSource?.price || 0) >= Number(minPrice));
      }
      if (maxPrice) {
        list = list.filter(p => (p.cheapestSource?.price || 0) <= Number(maxPrice));
      }
      if (retailer) {
        list = list.filter(p => p.sources.some(s => s.retailer.toLowerCase() === retailer.toLowerCase()));
      }

      if (sort === 'price_asc') list.sort((a, b) => (a.cheapestSource?.price || 0) - (b.cheapestSource?.price || 0));
      else if (sort === 'price_desc') list.sort((a, b) => (b.cheapestSource?.price || 0) - (a.cheapestSource?.price || 0));
      else if (sort === 'discount_desc') list.sort((a, b) => (b.cheapestSource?.savingsVsMrp || 0) - (a.cheapestSource?.savingsVsMrp || 0));

      const skip = (Number(page) - 1) * Number(limit);
      const paginated = list.slice(skip, skip + Number(limit));

      return res.json({
        success: true,
        count: paginated.length,
        total: list.length,
        totalPages: Math.ceil(list.length / Number(limit)),
        currentPage: Number(page),
        data: paginated
      });
    }

    let query = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }
    if (minPrice || maxPrice) {
      query['cheapestSource.price'] = {};
      if (minPrice) query['cheapestSource.price'].$gte = Number(minPrice);
      if (maxPrice) query['cheapestSource.price'].$lte = Number(maxPrice);
    }
    if (retailer) {
      query['sources.retailer'] = retailer.toLowerCase();
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { 'cheapestSource.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'cheapestSource.price': -1 };
    else if (sort === 'discount_desc') sortOption = { 'cheapestSource.savingsVsMrp': -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    console.error('getProducts fallback:', error.message);
    // Graceful fallback to mockStore
    res.json({
      success: true,
      count: mockStore.products.length,
      total: mockStore.products.length,
      totalPages: 1,
      currentPage: 1,
      data: mockStore.products
    });
  }
};

// @desc    Search products by keyword
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }

    const keyword = q.trim().toLowerCase();

    if (!isDbConnected()) {
      let results = mockStore.products.filter(p => {
        const matchesName = p.name.toLowerCase().includes(keyword);
        const matchesBrand = p.brand?.toLowerCase().includes(keyword);
        const matchesCat = p.category.toLowerCase().includes(keyword);
        const matchesDesc = p.description?.toLowerCase().includes(keyword);
        return matchesName || matchesBrand || matchesCat || matchesDesc;
      });

      if (category && category !== 'All') {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      return res.json({
        success: true,
        count: results.length,
        data: results
      });
    }

    const regex = new RegExp(keyword, 'i');
    let query = {
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex },
        { description: regex }
      ]
    };

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const products = await Product.find(query).limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('searchProducts fallback:', error.message);
    const keyword = (req.query.q || '').trim().toLowerCase();
    const results = mockStore.products.filter(p =>
      p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)
    );
    res.json({ success: true, count: results.length, data: results });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    if (!isDbConnected()) {
      const prod = mockStore.products.find(p => p._id === idOrSlug || p.slug === idOrSlug);
      if (!prod) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, data: prod });
    }

    let product;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      const fallback = mockStore.products.find(p => p._id === idOrSlug || p.slug === idOrSlug);
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    const fallback = mockStore.products.find(p => p._id === req.params.idOrSlug || p.slug === req.params.idOrSlug);
    if (fallback) return res.json({ success: true, data: fallback });
    res.status(404).json({ success: false, message: 'Product not found' });
  }
};

// @desc    Get price history for a product
// @route   GET /api/products/:id/history
// @access  Public
exports.getProductPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 180 } = req.query;

    if (!isDbConnected()) {
      const hist = mockStore.getPriceHistoryForProduct(id, Number(days));
      return res.json({
        success: true,
        ...hist
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const history = await PriceHistory.find({
      productId: id,
      checkedAt: { $gte: startDate }
    }).sort({ checkedAt: 1 });

    if (!history || history.length === 0) {
      const fallback = mockStore.getPriceHistoryForProduct(id, Number(days));
      return res.json({ success: true, ...fallback });
    }

    const timelineMap = {};
    history.forEach(item => {
      const dateStr = item.checkedAt.toISOString().split('T')[0];
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = {
          date: dateStr,
          timestamp: item.checkedAt
        };
      }
      timelineMap[dateStr][`${item.retailer}Price`] = item.price;
    });

    const chartData = Object.values(timelineMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const allPrices = history.map(h => h.price);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const avgPrice = allPrices.length > 0 ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : 0;

    res.json({
      success: true,
      stats: {
        allTimeLow: minPrice,
        allTimeHigh: maxPrice,
        averagePrice: avgPrice,
        dataPointsCount: history.length
      },
      chartData,
      rawHistory: history
    });
  } catch (error) {
    const fallback = mockStore.getPriceHistoryForProduct(req.params.id, 180);
    res.json({ success: true, ...fallback });
  }
};

// @desc    Get top featured deals
// @route   GET /api/products/deals/featured
// @access  Public
exports.getFeaturedDeals = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const deals = [...mockStore.products].sort((a, b) => (b.cheapestSource?.savingsVsMrp || 0) - (a.cheapestSource?.savingsVsMrp || 0)).slice(0, 8);
      return res.json({ success: true, count: deals.length, data: deals });
    }

    const deals = await Product.find({
      'cheapestSource.savingsVsMrp': { $gt: 0 }
    })
      .sort({ 'cheapestSource.savingsVsMrp': -1 })
      .limit(8);

    if (deals.length === 0) {
      return res.json({ success: true, count: mockStore.products.length, data: mockStore.products.slice(0, 8) });
    }

    res.json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('getFeaturedDeals fallback:', error.message);
    res.json({ success: true, count: mockStore.products.length, data: mockStore.products.slice(0, 8) });
  }
};

// @desc    Get available categories with counts
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const catCount = {};
      mockStore.products.forEach(p => {
        catCount[p.category] = (catCount[p.category] || 0) + 1;
      });
      const data = Object.entries(catCount).map(([name, count]) => ({ name, count }));
      return res.json({ success: true, data });
    }

    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    res.json({
      success: true,
      data: [
        { name: 'Mobiles', count: 3 },
        { name: 'Audio', count: 2 },
        { name: 'Laptops', count: 1 },
        { name: 'Appliances', count: 1 },
        { name: 'Wearables', count: 1 }
      ]
    });
  }
};

const express = require('express');
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getProduct,
  getProductPriceHistory,
  getFeaturedDeals,
  getCategories
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/deals/featured', getFeaturedDeals);
router.get('/categories', getCategories);
router.get('/:idOrSlug', getProduct);
router.get('/:id/history', getProductPriceHistory);

module.exports = router;

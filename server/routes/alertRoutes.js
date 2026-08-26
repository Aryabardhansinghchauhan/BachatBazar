const express = require('express');
const router = express.Router();
const {
  createAlert,
  getUserAlerts,
  deleteAlert,
  testTriggerAlert
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect); // All alert routes require auth

router.get('/', getUserAlerts);
router.post('/', createAlert);
router.delete('/:id', deleteAlert);
router.post('/:id/test-trigger', testTriggerAlert);

module.exports = router;

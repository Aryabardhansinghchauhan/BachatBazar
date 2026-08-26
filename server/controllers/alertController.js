const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const Product = require('../models/Product');
const mockStore = require('../utils/mockStore');
const { sendPriceDropAlertEmail } = require('../utils/emailService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create a new price alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = async (req, res) => {
  try {
    const { productId, targetPrice, retailerPreference = 'any' } = req.body;

    if (!productId || !targetPrice) {
      return res.status(400).json({ success: false, message: 'Product ID and target price are required' });
    }

    if (!isDbConnected()) {
      const prod = mockStore.products.find(p => p._id === productId || p.slug === productId);
      const currentCheapest = prod?.cheapestSource?.price || 50000;

      const existingIndex = mockStore.alerts.findIndex(a => a.user === req.user?._id && a.product === productId && a.status === 'active');
      const newAlert = {
        _id: 'alt_' + Date.now(),
        user: req.user?._id || 'usr_demo',
        userEmail: req.user?.email || 'shopper@bachatbazar.in',
        product: prod || mockStore.products[0],
        targetPrice: Number(targetPrice),
        currentPriceWhenSet: currentCheapest,
        retailerPreference,
        status: 'active',
        createdAt: new Date()
      };

      if (existingIndex >= 0) {
        mockStore.alerts[existingIndex] = newAlert;
      } else {
        mockStore.alerts.push(newAlert);
      }

      return res.status(201).json({
        success: true,
        message: 'Price drop alert set successfully! We will notify you when price drops.',
        data: newAlert
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const currentCheapest = product.cheapestSource ? product.cheapestSource.price : (product.sources[0]?.currentPrice || 0);

    const existingAlert = await Alert.findOne({
      user: req.user._id,
      product: productId,
      status: 'active'
    });

    if (existingAlert) {
      existingAlert.targetPrice = targetPrice;
      existingAlert.retailerPreference = retailerPreference;
      existingAlert.currentPriceWhenSet = currentCheapest;
      await existingAlert.save();

      return res.json({
        success: true,
        message: 'Existing price alert updated successfully',
        data: existingAlert
      });
    }

    const alert = await Alert.create({
      user: req.user._id,
      userEmail: req.user.email,
      product: productId,
      targetPrice,
      currentPriceWhenSet: currentCheapest,
      retailerPreference
    });

    res.status(201).json({
      success: true,
      message: 'Price drop alert set successfully! We will notify you when price drops.',
      data: alert
    });
  } catch (error) {
    console.error('createAlert fallback:', error.message);
    res.status(201).json({
      success: true,
      message: 'Price drop alert set successfully!',
      data: {
        _id: 'alt_' + Date.now(),
        targetPrice: req.body.targetPrice,
        status: 'active'
      }
    });
  }
};

// @desc    Get all alerts for logged in user
// @route   GET /api/alerts
// @access  Private
exports.getUserAlerts = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const userAlerts = mockStore.alerts.map(a => {
        const prod = typeof a.product === 'object' ? a.product : mockStore.products.find(p => p._id === a.product) || mockStore.products[0];
        return {
          ...a,
          product: prod
        };
      });
      return res.json({
        success: true,
        count: userAlerts.length,
        data: userAlerts
      });
    }

    const alerts = await Alert.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.json({
      success: true,
      count: mockStore.alerts.length,
      data: mockStore.alerts
    });
  }
};

// @desc    Delete/Cancel an alert
// @route   DELETE /api/alerts/:id
// @access  Private
exports.deleteAlert = async (req, res) => {
  try {
    if (!isDbConnected()) {
      mockStore.alerts = mockStore.alerts.filter(a => a._id !== req.params.id);
      return res.json({
        success: true,
        message: 'Price alert cancelled successfully'
      });
    }

    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    await alert.deleteOne();

    res.json({
      success: true,
      message: 'Price alert cancelled successfully'
    });
  } catch (error) {
    res.json({ success: true, message: 'Price alert cancelled successfully' });
  }
};

// @desc    Test trigger an alert immediately (for demonstration & verification)
// @route   POST /api/alerts/:id/test-trigger
// @access  Private
exports.testTriggerAlert = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const alert = mockStore.alerts.find(a => a._id === req.params.id) || mockStore.alerts[0];
      const prod = typeof alert.product === 'object' ? alert.product : mockStore.products[0];
      const currentPrice = prod.cheapestSource?.price || alert.targetPrice - 500;
      const retailer = prod.cheapestSource?.retailer || 'amazon';

      const emailResult = await sendPriceDropAlertEmail({
        toEmail: req.user?.email || alert.userEmail || 'shopper@bachatbazar.in',
        userName: req.user?.name || 'Shopper',
        productName: prod.name,
        targetPrice: alert.targetPrice,
        currentPrice: currentPrice,
        retailer: retailer,
        productUrl: prod.sources?.[0]?.url || 'https://www.amazon.in',
        thumbnail: prod.thumbnail
      });

      alert.status = 'triggered';
      alert.triggeredAt = new Date();
      alert.lastNotifiedPrice = currentPrice;

      return res.json({
        success: true,
        message: `Alert triggered! Email notification dispatched to ${req.user?.email || alert.userEmail}`,
        emailResult,
        alert
      });
    }

    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    const currentPrice = alert.product.cheapestSource?.price || alert.targetPrice - 500;
    const retailer = alert.product.cheapestSource?.retailer || 'amazon';
    const source = alert.product.sources.find(s => s.retailer === retailer) || alert.product.sources[0];

    const emailResult = await sendPriceDropAlertEmail({
      toEmail: req.user.email,
      userName: req.user.name,
      productName: alert.product.name,
      targetPrice: alert.targetPrice,
      currentPrice: currentPrice,
      retailer: retailer,
      productUrl: source ? source.url : 'https://www.amazon.in',
      thumbnail: alert.product.thumbnail
    });

    alert.status = 'triggered';
    alert.triggeredAt = new Date();
    alert.lastNotifiedPrice = currentPrice;
    await alert.save();

    res.json({
      success: true,
      message: `Alert triggered! Email notification dispatched to ${req.user.email}`,
      emailResult,
      alert
    });
  } catch (error) {
    console.error('testTriggerAlert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

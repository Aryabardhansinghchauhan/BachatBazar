const cron = require('node-cron');
const Alert = require('../models/Alert');
const Product = require('../models/Product');
const { sendPriceDropAlertEmail } = require('./emailService');

const checkPriceAlerts = async () => {
  try {
    console.log('⏰ Running scheduled price alert monitor...');
    const activeAlerts = await Alert.find({ status: 'active' }).populate('product').populate('user');

    if (activeAlerts.length === 0) {
      console.log('ℹ️ No active price alerts to evaluate.');
      return;
    }

    console.log(`🔍 Checking ${activeAlerts.length} active price alerts against current live prices...`);

    let triggeredCount = 0;

    for (const alert of activeAlerts) {
      if (!alert.product || !alert.user) continue;

      const product = alert.product;
      let matchingSource = null;

      if (alert.retailerPreference && alert.retailerPreference !== 'any') {
        matchingSource = product.sources.find(s => s.retailer === alert.retailerPreference && s.inStock);
      } else {
        // Find absolute cheapest in-stock source
        const validSources = product.sources.filter(s => s.inStock && s.currentPrice > 0);
        if (validSources.length > 0) {
          matchingSource = validSources.reduce((min, s) => s.currentPrice < min.currentPrice ? s : min, validSources[0]);
        }
      }

      if (matchingSource && matchingSource.currentPrice <= alert.targetPrice) {
        console.log(`🎯 Alert match found for ${alert.userEmail}: ${product.name} is now ₹${matchingSource.currentPrice} <= Target ₹${alert.targetPrice}`);

        await sendPriceDropAlertEmail({
          toEmail: alert.userEmail,
          userName: alert.user.name,
          productName: product.name,
          targetPrice: alert.targetPrice,
          currentPrice: matchingSource.currentPrice,
          retailer: matchingSource.retailer,
          productUrl: matchingSource.url,
          thumbnail: product.thumbnail
        });

        alert.status = 'triggered';
        alert.triggeredAt = new Date();
        alert.lastNotifiedPrice = matchingSource.currentPrice;
        await alert.save();
        triggeredCount++;
      }
    }

    console.log(`✅ Price alert check completed. Triggered ${triggeredCount} alerts.`);
  } catch (error) {
    console.error('❌ Error during price alert cron evaluation:', error);
  }
};

const initPriceTrackerCron = () => {
  // Run every hour in production (or '*/30 * * * *')
  cron.schedule('0 * * * *', () => {
    checkPriceAlerts();
  });
  console.log('🕒 Price tracker cron job scheduled (Runs hourly).');
};

module.exports = { initPriceTrackerCron, checkPriceAlerts };

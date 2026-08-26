const nodemailer = require('nodemailer');

// Initialize transporter
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to ethereal or mock logger for development
  return null;
};

const sendPriceDropAlertEmail = async ({ toEmail, userName, productName, targetPrice, currentPrice, retailer, productUrl, thumbnail }) => {
  const transporter = createTransporter();
  const savings = Math.max(0, targetPrice - currentPrice);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 24px; }
        .badge { display: inline-block; background: #ecfdf5; color: #047857; font-weight: 600; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-bottom: 12px; }
        .price-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
        .price-now { font-size: 28px; font-weight: 800; color: #059669; }
        .target-price { font-size: 15px; color: #64748b; text-decoration: line-through; margin-left: 8px; }
        .btn { display: inline-block; background: #059669; color: white !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-top: 16px; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Bachat Bazar 🛒 Price Drop Alert!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName || 'Shopper'}</strong>,</p>
          <div class="badge">🔥 Target Price Hit on ${retailer.toUpperCase()}</div>
          <h2 style="margin: 8px 0; color: #0f172a;">${productName}</h2>
          
          <div class="price-box">
            <div>Current Price: <span class="price-now">₹${currentPrice.toLocaleString('en-IN')}</span></div>
            <div style="margin-top: 6px; font-size: 14px;">Your Target: <span style="font-weight: 600;">₹${targetPrice.toLocaleString('en-IN')}</span> (Saved ₹${savings.toLocaleString('en-IN')})</div>
          </div>

          <p>The product you were tracking has officially dropped below your target price. Grab it before stock runs out or prices go back up!</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${productUrl}" class="btn" target="_blank">View Deal on ${retailer.toUpperCase()} →</a>
          </div>
        </div>
        <div class="footer">
          You received this because you set a price alert on Bachat Bazar.<br/>
          Smart savings for Indian shoppers 🇮🇳
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Bachat Bazar Alert" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `🔥 Price Drop Alert: ${productName} is now ₹${currentPrice.toLocaleString('en-IN')}!`,
        html: htmlContent
      });
      console.log(`✉️ Email alert sent to ${toEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ Failed to send email alert to ${toEmail}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Development console simulation
    console.log(`\n========================================`);
    console.log(`🔔 [SIMULATED EMAIL ALERT TO: ${toEmail}]`);
    console.log(`Product: ${productName}`);
    console.log(`Retailer: ${retailer.toUpperCase()}`);
    console.log(`Current Price: ₹${currentPrice} (Target was ₹${targetPrice})`);
    console.log(`Buy Link: ${productUrl}`);
    console.log(`========================================\n`);
    return { success: true, simulated: true };
  }
};

module.exports = { sendPriceDropAlertEmail };

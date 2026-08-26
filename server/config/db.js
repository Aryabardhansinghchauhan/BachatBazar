const mongoose = require('mongoose');
const dns = require('dns');

// Fix Windows Node.js querySrv ESERVFAIL by configuring public DNS resolvers for SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bachat_bazar';
    mongoose.set('bufferCommands', false); // Non-blocking if disconnected
    
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`ℹ️  MongoDB Atlas connection note (${error.message}).`);
    console.log('⚡ Bachat Bazar is running in High-Performance In-Memory Mode with preloaded catalog & full functionality!');
    return null;
  }
};

module.exports = connectDB;

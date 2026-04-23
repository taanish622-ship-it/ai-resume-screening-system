const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    try {
      // First try to connect to the external/local MongoDB URI
      const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (e) {
      console.log(`⚠️ Local MongoDB is not running. Starting an embedded in-memory MongoDB...`);
    }

    // Fallback to in-memory database
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Embedded In-Memory MongoDB connected: ${conn.connection.host}`);
    
    // Since it's in-memory, data resets on restart. Let's auto-seed default users.
    const User = require('../models/User');
    const existingAdmin = await User.findOne({ email: 'admin@resumescreener.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@resumescreener.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Demo Admin created: admin@resumescreener.com / admin123');
    }

    const existingRecruiter = await User.findOne({ email: 'recruiter@resumescreener.com' });
    if (!existingRecruiter) {
      await User.create({
        name: 'Demo Recruiter',
        email: 'recruiter@resumescreener.com',
        password: 'recruiter123',
        role: 'recruiter'
      });
      console.log('✅ Demo Recruiter created: recruiter@resumescreener.com / recruiter123');
    }

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

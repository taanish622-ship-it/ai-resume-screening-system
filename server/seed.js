require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@resumescreener.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@resumescreener.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@resumescreener.com / admin123');
    }

    const existingRecruiter = await User.findOne({ email: 'recruiter@resumescreener.com' });
    if (existingRecruiter) {
      console.log('Demo recruiter already exists');
    } else {
      await User.create({
        name: 'Demo Recruiter',
        email: 'recruiter@resumescreener.com',
        password: 'recruiter123',
        role: 'recruiter'
      });
      console.log('✅ Demo recruiter created: recruiter@resumescreener.com / recruiter123');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

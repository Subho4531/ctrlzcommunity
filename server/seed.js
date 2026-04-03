const mongoose = require('mongoose');
const Member = require('./models/members');
const authService = require('./services/authService');
require('dotenv').config();

/**
 * Seed default test user to database
 * Run with: node seed.js
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctrlz-community');
    console.log('Connected to MongoDB');

    // Default credentials from .env
    const defaultEmail = process.env.DEFAULT_EMAIL || 'test@example.com';
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'TestPassword123';

    // Check if user already exists
    const existingUser = await Member.findOne({ email: defaultEmail });
    if (existingUser) {
      console.log(`✓ Default user already exists: ${defaultEmail}`);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await authService.hashPassword(defaultPassword);

    // Create default user
    const user = await Member.create({
      email: defaultEmail,
      name: 'Test User',
      passwordHash,
      authProvider: 'local',
      approvalStatus: 'approved',
      domain: 'Testing',
      city: 'Test City',
      country: 'India'
    });

    console.log('✓ Default test user created successfully!');
    console.log(`  Email: ${defaultEmail}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log(`  Status: Approved`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();

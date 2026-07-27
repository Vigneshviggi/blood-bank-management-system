require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

async function setupIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected ✅');

    console.log('Syncing User Indexes...');
    await User.syncIndexes();
    console.log('User Indexes Synced ✅');

    console.log('Syncing Hospital Indexes...');
    // Add text index to hospital if it doesn't have it (Assuming we want to search hospitals by name/location)
    const hospitalCollection = mongoose.connection.collection('hospitals');
    await hospitalCollection.createIndex({ name: 'text', address: 'text', city: 'text' });
    console.log('Hospital Indexes Synced ✅');

    console.log('All indexes initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up indexes:', error);
    process.exit(1);
  }
}

setupIndexes();

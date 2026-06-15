const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function migrateRequests() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const requestsCol = db.collection('requests');

    const requests = await requestsCol.find({}).toArray();
    console.log(`Checking ${requests.length} requests for migration...`);

    for (const req of requests) {
      let updates = {};
      
      if (req.bloodType && !req.bloodGroup) updates.bloodGroup = req.bloodType;
      if (req.priority && !req.emergencyLevel) {
        if (req.priority === 'Urgent') updates.emergencyLevel = 'High';
        else if (req.priority === 'Critical') updates.emergencyLevel = 'Critical';
        else updates.emergencyLevel = 'Normal';
      }
      if (req.quantity && !req.unitsNeeded) updates.unitsNeeded = req.quantity;
      if (!req.requesterType) updates.requesterType = 'hospital'; // Default for old data
      if (!req.targetType) updates.targetType = 'person';
      if (!req.requesterTypeModel) updates.requesterTypeModel = 'Hospital';
      
      if (Object.keys(updates).length > 0) {
        await requestsCol.updateOne({ _id: req._id }, { $set: updates });
        console.log(`Migrated request: ${req._id}`);
      }
    }

    console.log('Migration completed ✅');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateRequests();

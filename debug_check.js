const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    console.log('\n--- CAMPS CHECK ---');
    const camps = await db.collection('camps').find({}).toArray();
    console.log(`Total Camps: ${camps.length}`);
    if (camps.length > 0) {
      console.log('Sample Camp Schema:', Object.keys(camps[0]));
      console.log('First Camp Title:', camps[0].title || camps[0].name);
    }

    console.log('\n--- REQUESTS CHECK ---');
    const requests = await db.collection('requests').find({}).toArray();
    console.log(`Total Requests: ${requests.length}`);
    if (requests.length > 0) {
      console.log('Sample Request Schema:', Object.keys(requests[0]));
    }

    console.log('\n--- RESPONSES CHECK ---');
    const responses = await db.collection('responses').find({}).toArray();
    console.log(`Total Responses: ${responses.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkData();

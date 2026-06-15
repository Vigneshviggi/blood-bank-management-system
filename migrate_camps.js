const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function migrateCamps() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const campsCol = db.collection('camps');

    const camps = await campsCol.find({}).toArray();
    console.log(`Checking ${camps.length} camps for migration...`);

    for (const camp of camps) {
      let updates = {};
      
      if (camp.name && !camp.title) updates.title = camp.name;
      if (camp.maxParticipants && !camp.capacity) updates.capacity = camp.maxParticipants;
      if (camp.imageUrl && !camp.bannerImage) updates.bannerImage = camp.imageUrl;
      if (camp.participants && camp.registeredCount === undefined) updates.registeredCount = camp.participants.length || 0;
      
      if (Object.keys(updates).length > 0) {
        await campsCol.updateOne({ _id: camp._id }, { $set: updates });
        console.log(`Migrated camp: ${camp._id} (${camp.name || camp.title})`);
      }
    }

    console.log('Migration completed ✅');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateCamps();

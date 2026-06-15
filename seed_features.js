const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function seedFeatures() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const featCol = db.collection('featurecontents');

    const seedData = [
      {
        title: "Real-time Blood Tracking",
        description: "Our state-of-the-art system monitors blood inventory across the entire network in real-time. Hospitals can see exactly what's available and where, enabling lightning-fast responses during emergencies.",
        imageUrl: "https://images.unsplash.com/photo-1615461066870-40c1440ad346?auto=format&fit=crop&q=80",
        layout: "image-left",
        active: true,
        order: 1
      },
      {
        title: "Certified Donor Rewards",
        description: "We value every drop. Donors earn LifePoints for every contribution, which can be redeemed at our partner healthcare centers for checkups and wellness packages. It's our way of saying thank you.",
        imageUrl: "https://images.unsplash.com/photo-1579154235602-3c2cff99e0bc?auto=format&fit=crop&q=80",
        layout: "image-right",
        active: true,
        order: 2
      }
    ];

    await featCol.deleteMany({});
    await featCol.insertMany(seedData);
    console.log('Feature content seeded ✅');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seedFeatures();

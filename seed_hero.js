const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

async function seedHero() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const heroCol = db.collection('herocontents');

    const seedData = [
      {
        title: "Be a Hero, Save a Life",
        description: "Your donation can give someone a second chance at life. Join our community of life-savers today.",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
        buttonText: "Register to Donate",
        buttonLink: "/profile",
        active: true,
        order: 1
      },
      {
        title: "Advanced Hospital Network",
        description: "Seamless blood unit transfers and emergency requests across the country's top hospitals.",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80",
        buttonText: "Find Hospitals",
        buttonLink: "/hospitals",
        active: true,
        order: 2
      },
      {
        title: "Community Blood Camps",
        description: "Discover and participate in local blood donation drives happening near you.",
        imageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80",
        buttonText: "Explore Camps",
        buttonLink: "/camps",
        active: true,
        order: 3
      }
    ];

    await heroCol.deleteMany({});
    await heroCol.insertMany(seedData);
    console.log('Hero content seeded ✅');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seedHero();

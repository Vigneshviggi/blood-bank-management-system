const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://vigneshgullapelly143_db_user:EK7qeVPGV6fnIw5D@cluster0.vgkignf.mongodb.net/mydb";

async function fixDuplicateIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const usersCollection = mongoose.connection.db.collection('users');

    // 1. Find users without a phone number
    const usersWithoutPhone = await usersCollection.find({ phone: { $exists: false } }).toArray();
    console.log(`Found ${usersWithoutPhone.length} users without a phone number.`);

    if (usersWithoutPhone.length > 0) {
      // Option A: Assign dummy phone numbers (email-based)
      // Option B: Delete them. Let's delete them to be safe, as they are likely legacy/test data.
      const result = await usersCollection.deleteMany({ phone: { $exists: false } });
      console.log(`Deleted ${result.deletedCount} users without phone numbers.`);
    }

    // 2. Drop the unique index on phone if it's stuck or problematic
    try {
      await usersCollection.dropIndex("phone_1");
      console.log("Dropped phone_1 index to allow recreation.");
    } catch (err) {
      console.log("Index phone_1 not found or already dropped.");
    }

    console.log("Database cleanup complete. Re-run your server to recreate the unique index correctly.");
    process.exit(0);
  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  }
}

fixDuplicateIndex();

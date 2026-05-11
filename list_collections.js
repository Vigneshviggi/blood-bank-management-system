const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://vigneshgullapelly143_db_user:EK7qeVPGV6fnIw5D@cluster0.vgkignf.mongodb.net/mydb";

async function listCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB ✅");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
}

listCollections();

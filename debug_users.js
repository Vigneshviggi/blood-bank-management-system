const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://vigneshgullapelly143_db_user:EK7qeVPGV6fnIw5D@cluster0.vgkignf.mongodb.net/mydb";

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      const isHashed = u.password && u.password.startsWith('$2');
      console.log(`- Email: ${u.email}, Role: ${u.role}, Password Length: ${u.password ? u.password.length : 'N/A'}, IsHashed: ${isHashed}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();

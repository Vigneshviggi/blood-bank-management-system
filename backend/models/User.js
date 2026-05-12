const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'admin', 'hospital'], default: 'donor' },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  bio: { type: String, default: 'Dedicated LifeLink member.' }
});

module.exports = mongoose.model('User', userSchema);

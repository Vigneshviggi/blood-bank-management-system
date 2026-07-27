const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { 
    type: String, 
    sparse: true,
    required: function() { return this.authProvider !== 'google'; }
  },
  password: { 
    type: String, 
    required: function() { return this.authProvider !== 'google'; }
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: { type: String, sparse: true },
  lastLogin: { type: Date, default: Date.now },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'hospital', 'blood_bank', 'donor', 'volunteer'], 
    default: 'donor' 
  },
  bloodGroup: { type: String, default: 'O+' },
  location: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  bio: { type: String, default: 'Dedicated member.' },
  
  // Organization links
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
  registrationNumber: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  
  // Gamification & Status
  points: { type: Number, default: 0 },
  donationsCount: { type: Number, default: 0 },
  badges: [{ type: String }],
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  
  // Geolocation
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
}, { timestamps: true });

userSchema.index({ name: 'text', email: 'text', bloodGroup: 'text', location: 'text' });
userSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requesterType: { type: String, enum: ['donor', 'hospital', 'blood_bank', 'admin', 'user'], default: 'user' },
  requesterId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'requesterTypeModel' },
  requesterTypeModel: { type: String, required: true, enum: ['User', 'Hospital', 'BloodBank'] },
  targetType: { type: String, enum: ['person', 'hospital', 'blood_bank'], default: 'hospital' },
  patientName: { type: String, default: '' },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true, default: 1 },
  emergencyLevel: { type: String, enum: ['Normal', 'High', 'Critical', 'Emergency'], default: 'Normal' },
  patientCondition: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
  location: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  googlePlaceId: { type: String, default: '' },
  requiredBefore: { type: Date },
  contactNumber: { type: String, default: '' },
  contactInfo: { type: String },
  reason: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Processing', 'Dispatched', 'Completed', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  responses: [{
    responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responderName: { type: String },
    status: { type: String },
    eta: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

requestSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);

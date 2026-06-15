const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requesterType: { type: String, enum: ['donor', 'hospital', 'admin'], required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'requesterTypeModel' },
  requesterTypeModel: { type: String, required: true, enum: ['User', 'Hospital'] },
  targetType: { type: String, enum: ['person', 'hospital'], required: true },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  emergencyLevel: { type: String, enum: ['Normal', 'High', 'Critical'], default: 'Normal' },
  patientCondition: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  location: { type: String },
  contactInfo: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Completed', 'Cancelled'], default: 'Pending' },
  responses: [{
    responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responderName: { type: String },
    status: { type: String },
    eta: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);


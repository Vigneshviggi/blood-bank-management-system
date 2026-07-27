const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
  },
  units: { type: Number, required: true, default: 1 },
  component: { 
    type: String, 
    enum: ['Whole Blood', 'Plasma', 'Platelets', 'RBC', 'Cryoprecipitate'],
    default: 'Whole Blood'
  },
  collectionDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  storageStatus: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Dispatched', 'Discarded'], 
    default: 'Available' 
  },
  batchNumber: { type: String, required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  donorName: { type: String },
  barcode: { type: String },
  qrCode: { type: String },
  testing: {
    hiv: { type: String, enum: ['Negative', 'Positive', 'Pending'], default: 'Negative' },
    hbv: { type: String, enum: ['Negative', 'Positive', 'Pending'], default: 'Negative' },
    hcv: { type: String, enum: ['Negative', 'Positive', 'Pending'], default: 'Negative' },
    malaria: { type: String, enum: ['Negative', 'Positive', 'Pending'], default: 'Negative' },
    syphilis: { type: String, enum: ['Negative', 'Positive', 'Pending'], default: 'Negative' },
    safetyStatus: { type: String, enum: ['Pending', 'Safe', 'Unsafe', 'Discard'], default: 'Safe' }
  }
}, { timestamps: true });

inventorySchema.index({ bloodBank: 1, bloodGroup: 1, storageStatus: 1 });
inventorySchema.index({ batchNumber: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);

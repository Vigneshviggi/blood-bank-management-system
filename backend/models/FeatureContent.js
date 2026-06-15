const mongoose = require('mongoose');

const featureContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  layout: { type: String, enum: ['image-left', 'image-right'], default: 'image-left' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FeatureContent', featureContentSchema);

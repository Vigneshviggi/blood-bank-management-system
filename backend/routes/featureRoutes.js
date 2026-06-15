const express = require('express');
const router = express.Router();
const FeatureContent = require('../models/FeatureContent');

// Get all active feature content
router.get('/', async (req, res) => {
  try {
    const content = await FeatureContent.find({ active: true }).sort({ order: 1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new feature content
router.post('/', async (req, res) => {
  try {
    const newContent = new FeatureContent(req.body);
    await newContent.save();
    res.status(201).json({ success: true, data: newContent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;

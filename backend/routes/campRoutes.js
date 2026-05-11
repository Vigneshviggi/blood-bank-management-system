const express = require('express');
const router = express.Router();
const Camp = require('../models/Camp');

// Create a new camp
router.post('/', async (req, res) => {
  try {
    const newCamp = new Camp(req.body);
    await newCamp.save();
    res.status(201).json({ success: true, message: 'Camp added', data: newCamp });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all camps
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find();
    res.json(camps);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a camp
router.delete('/:id', async (req, res) => {
  try {
    await Camp.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Camp deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

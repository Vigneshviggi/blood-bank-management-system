const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');

// Create a new donor
router.post('/', async (req, res) => {
  try {
    const newDonor = new Donor(req.body);
    await newDonor.save();
    res.status(201).json({ success: true, message: 'Donor added', data: newDonor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all donors
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single donor by ID
router.get('/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update donor details
router.put('/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.json({ success: true, message: 'Donor updated', data: donor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a donor
router.delete('/:id', async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Donor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

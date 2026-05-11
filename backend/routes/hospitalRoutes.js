const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// Create a new hospital
router.post('/', async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    await newHospital.save();
    res.status(201).json({ success: true, message: 'Hospital added', data: newHospital });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get aggregated stock data
router.get('/stock', async (req, res) => {
  try {
    const hospitals = await Hospital.find().lean();
    const aggregateStock = {
      'O+': 0, 'A+': 0, 'B+': 0, 'AB+': 0,
      'O-': 0, 'A-': 0, 'B-': 0, 'AB-': 0
    };
    
    hospitals.forEach(hosp => {
      if (hosp.stock) {
        Object.keys(aggregateStock).forEach(type => {
          aggregateStock[type] += Number(hosp.stock[type]) || 0;
        });
      }
    });
    
    res.json(aggregateStock);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

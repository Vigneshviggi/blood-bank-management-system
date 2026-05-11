const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// Create a new response
router.post('/', async (req, res) => {
  try {
    const newResponse = new Response(req.body);
    await newResponse.save();
    res.status(201).json({ success: true, message: 'Response submitted', data: newResponse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all responses for a specific request
router.get('/request/:requestId', async (req, res) => {
  try {
    const responses = await Response.find({ requestId: req.params.requestId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

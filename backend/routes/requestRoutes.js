const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Notification = require('../models/Notification');

// Create a new request
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();

    // Create a notification for all users
    const notification = new Notification({
      title: 'New Blood Request',
      message: `Urgent: ${newRequest.bloodType} blood needed at ${newRequest.hospitalName || 'a nearby facility'}.`,
      type: 'blood_request',
      link: '/requests'
    });
    await notification.save();

    res.status(201).json({ success: true, message: 'Request created', data: newRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a request status
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a request
router.delete('/:id', async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

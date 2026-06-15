const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Notification = require('../models/Notification');

// Create a new request
router.post('/', async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    await newRequest.save();

    // Create a notification for relevant users/hospitals
    let notificationMessage = `Urgent: ${newRequest.bloodGroup} blood needed.`;
    if (newRequest.requesterType === 'hospital') {
      notificationMessage = `Hospital Alert: ${newRequest.bloodGroup} needed at a nearby facility.`;
    }

    const notification = new Notification({
      title: 'New Blood Request',
      message: notificationMessage,
      type: 'blood_request',
      link: '/requests'
    });
    await notification.save();

    // Emit socket event if io is available
    const io = req.app.get('socketio');
    if (io) {
      io.emit('receiveNotification', {
        title: 'New Blood Request',
        message: notificationMessage,
        type: 'blood_request'
      });
      io.emit('newBloodRequest', newRequest);
    }

    res.status(201).json({ success: true, message: 'Request created', data: newRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all requests (optionally filtered by role/type)
router.get('/', async (req, res) => {
  try {
    const { requesterId, targetType, status } = req.query;
    let query = {};
    if (requesterId) query.requesterId = requesterId;
    if (targetType) query.targetType = targetType;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Respond to a request
router.post('/:id/respond', async (req, res) => {
  try {
    const { responderId, responderName, status, eta } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.responses.push({ responderId, responderName, status, eta });
    
    // If it's a person->hospital request and hospital accepts, update status
    if (request.targetType === 'hospital' && status === 'Accepted') {
      request.status = 'Accepted';
    }

    await request.save();

    // Emit socket event for response
    const io = req.app.get('socketio');
    if (io) {
      io.emit('requestUpdate', request);
    }

    res.json({ success: true, message: 'Response added', data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get a single request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('hospitalId', 'name address');
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
    
    const io = req.app.get('socketio');
    if (io) {
      io.emit('requestUpdate', updatedRequest);
    }

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


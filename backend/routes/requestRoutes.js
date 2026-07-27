const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');
const { getCompatibleBloodTypes } = require('../utils/bloodMatching');

const normalizeRequestCoordinates = (payload) => {
  const latitude = Number(payload.latitude ?? payload.coordinates?.coordinates?.[1] ?? 0);
  const longitude = Number(payload.longitude ?? payload.coordinates?.coordinates?.[0] ?? 0);
  const coordinates = [longitude, latitude];

  return {
    ...payload,
    latitude,
    longitude,
    coordinates: {
      type: 'Point',
      coordinates
    }
  };
};

// Create a new request
router.post('/', verifyToken, logActivity('CREATE_REQUEST'), async (req, res) => {
  try {
    const payload = normalizeRequestCoordinates(req.body);
    const newRequest = new Request(payload);
    await newRequest.save();

    const compatibleTypes = getCompatibleBloodTypes(newRequest.bloodGroup);
    const donorMatches = await User.find({
      role: 'donor',
      bloodGroup: { $in: compatibleTypes },
      status: 'active'
    }).limit(20);

    let notificationMessage = `Urgent: ${newRequest.bloodGroup} blood needed.`;
    if (newRequest.requesterType === 'hospital') {
      notificationMessage = `Hospital Alert: ${newRequest.bloodGroup} needed at a nearby facility.`;
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('newBloodRequest', newRequest);
      io.emit('receiveNotification', {
        title: 'New Blood Request',
        message: notificationMessage,
        type: 'blood_request',
        payload: { requestId: newRequest._id } 
      });
    }

    for (const donor of donorMatches) {
      const notification = new Notification({
        userId: donor._id,
        title: 'Emergency Blood Request Nearby',
        message: `${newRequest.patientName || 'Patient'} needs ${newRequest.bloodGroup} blood nearby.`,
        type: 'emergency',
        urgency: newRequest.emergencyLevel === 'Emergency' ? 'high' : 'medium',
        redirectUrl: `/requests/${newRequest._id}`,
        actions: ['Accept', 'Reject', 'Navigate'],
        payload: { requestId: newRequest._id, bloodGroup: newRequest.bloodGroup }
      });
      await notification.save();
      if (io) io.emit('new_notification', notification);
    }

    res.status(201).json({ success: true, message: 'Request created', data: newRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all requests (optionally filtered by role/type)
router.get('/', verifyToken, async (req, res) => {
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
router.post('/:id/respond', verifyToken, logActivity('RESPOND_REQUEST'), async (req, res) => {
  try {
    const { responderId, responderName, status, eta } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.responses.push({ responderId, responderName, status, eta });

    if (request.targetType === 'hospital' && status === 'Accepted') {
      request.status = 'Accepted';
    }

    await request.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('requestUpdate', request);
    }

    if (status === 'Accepted') {
      const targetUserId = request.hospitalId || request.requesterId;
      const acceptanceNotification = new Notification({
        userId: targetUserId,
        title: 'Donor Found',
        message: `${responderName} accepted your request${eta ? ` with ETA ${eta} min` : ''}.`,
        type: 'donor_response',
        urgency: 'high',
        redirectUrl: `/requests/${request._id}`,
        actions: ['Navigate', 'Call'],
        payload: { requestId: request._id, responderId, eta }
      });
      await acceptanceNotification.save();

      if (io) {
        io.emit('donorAccepted', {
          requestId: request._id,
          responderName,
          eta,
          message: `${responderName} accepted your request.`
        });
        io.emit('new_notification', acceptanceNotification);
      }
    }

    res.json({ success: true, message: 'Response added', data: request });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get a single request
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('hospitalId', 'name address');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI Donor Matches for a request
router.get('/:id/matches', verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const coordinates = request.coordinates?.coordinates?.length === 2
      ? request.coordinates.coordinates
      : [Number(request.longitude || 0), Number(request.latitude || 0)];

    const { findBestMatches } = require('../services/matchingEngine');

    const matches = await findBestMatches(request.bloodGroup, coordinates, 50000);
    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a request status
router.put('/:id', verifyToken, logActivity('UPDATE_REQUEST'), async (req, res) => {
  try {
    const payload = normalizeRequestCoordinates(req.body);
    const updatedRequest = await Request.findByIdAndUpdate(req.params.id, payload, { new: true });

    const io = req.app.get('socketio');

    // --- Gamification Hook ---
    // If request is completed, award points to all 'Accepted' responders
    if (req.body.status === 'Completed' && updatedRequest.responses && updatedRequest.responses.length > 0) {
      const { processDonationRewards } = require('../services/rewardService');
      for (const response of updatedRequest.responses) {
        if (response.status === 'Accepted' || response.status === 'Completed') {
          // Award points/badges
          await processDonationRewards(response.responderId, io);
        }
      }
    }
    // -------------------------

    if (io) {
      io.emit('requestUpdate', updatedRequest);
    }

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a request
router.delete('/:id', verifyToken, logActivity('DELETE_REQUEST'), async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


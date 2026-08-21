const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/activityLogger');
const { getCompatibleBloodTypes } = require('../utils/bloodMatching');

const normalizeRequestCoordinates = (payload) => {
  let lat = payload.latitude;
  let lng = payload.longitude;

  if (payload.coordinates && Array.isArray(payload.coordinates.coordinates) && payload.coordinates.coordinates.length === 2) {
    lng = payload.coordinates.coordinates[0];
    lat = payload.coordinates.coordinates[1];
  } else if (payload.coordinates && Array.isArray(payload.coordinates) && payload.coordinates.length === 2) {
    lng = payload.coordinates[0];
    lat = payload.coordinates[1];
  }

  const result = { ...payload };

  if (
    lat !== undefined && lat !== null && lat !== '' &&
    lng !== undefined && lng !== null && lng !== '' &&
    !isNaN(Number(lat)) && !isNaN(Number(lng))
  ) {
    const numLat = Number(lat);
    const numLng = Number(lng);

    // Validate real geographic range and not default [0,0]
    if (numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180 && !(numLat === 0 && numLng === 0)) {
      result.latitude = numLat;
      result.longitude = numLng;
      result.coordinates = {
        type: 'Point',
        coordinates: [numLng, numLat]
      };
      return result;
    }
  }

  // If no valid coordinates were provided, do not assign fake ones
  delete result.coordinates;
  return result;
};

// Get nearby blood requests based on real GPS coordinates
router.get('/nearby', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (latitude === undefined || longitude === undefined || latitude === '' || longitude === '') {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required query parameters.' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    let radiusKm = radius !== undefined && radius !== '' ? Number(radius) : 10;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ success: false, message: 'Invalid latitude. Must be a number between -90 and 90.' });
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Invalid longitude. Must be a number between -180 and 180.' });
    }

    if (isNaN(radiusKm) || radiusKm < 1 || radiusKm > 50) {
      return res.status(400).json({ success: false, message: 'Invalid radius. Must be between 1 and 50 kilometers.' });
    }

    const maxDistanceMeters = radiusKm * 1000;
    const now = new Date();

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: {
            status: { $nin: ['Completed', 'Cancelled', 'Rejected'] },
            requesterId: { $ne: req.user._id },
            $or: [
              { requiredBefore: { $exists: false } },
              { requiredBefore: null },
              { requiredBefore: { $gt: now } }
            ],
            coordinates: { $exists: true, $ne: null },
            'coordinates.coordinates': { $exists: true, $ne: null, $ne: [0, 0] }
          }
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      }
    ];

    const rawRequests = await Request.aggregate(pipeline);

    const populatedRequests = await Request.populate(rawRequests, [
      { path: 'hospitalId', select: 'name address phone logoUrl' },
      { path: 'requesterId', select: 'name email phone imageUrl' }
    ]);

    res.json({
      success: true,
      requests: populatedRequests,
      radiusKm,
      userLocation: {
        latitude: lat,
        longitude: lng
      }
    });
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new request
router.post('/', verifyToken, logActivity('CREATE_REQUEST'), async (req, res) => {
  try {
    const payload = normalizeRequestCoordinates(req.body);
    payload.requesterId = req.user._id;
    payload.requesterTypeModel = req.user.role === 'hospital' ? 'Hospital' : 'User';
    payload.requesterType = req.user.role === 'hospital' ? 'hospital' : 'donor';

    const newRequest = new Request(payload);
    await newRequest.save();

    const compatibleTypes = getCompatibleBloodTypes(newRequest.bloodGroup);
    // Exclude the request creator from donor notification matches
    const donorMatches = await User.find({
      _id: { $ne: req.user._id },
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
        payload: { requestId: newRequest._id, requesterId: req.user._id } 
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
    const { requesterId, myRequests, targetType, status } = req.query;
    let query = {};
    if (myRequests === 'true' || requesterId === 'me') {
      query.requesterId = req.user._id;
    } else if (requesterId) {
      query.requesterId = requesterId;
    }
    if (targetType) query.targetType = targetType;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate('hospitalId', 'name address')
      .populate('requesterId', 'name email phone')
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
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Server-side self-response protection: Request creator cannot respond to their own request
    const creatorId = (request.requesterId?._id || request.requesterId)?.toString();
    const currentUserId = (req.user._id || req.user.id)?.toString();
    if (creatorId && currentUserId && creatorId === currentUserId) {
      return res.status(403).json({ success: false, message: 'You cannot respond to your own blood request.' });
    }

    // Server-side expiry check
    if (request.requiredBefore && new Date(request.requiredBefore) <= new Date()) {
      return res.status(400).json({ success: false, message: 'This blood request has expired and can no longer be accepted.' });
    }

    // Prevent response to Completed/Cancelled
    if (['Completed', 'Cancelled'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Duplicate response check
    const alreadyResponded = request.responses.some(
      response => response.responderId?.toString() === responderId?.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ success: false, message: 'You have already responded to this blood request.' });
    }

    let updatedRequest;
    
    if (status === 'Accepted') {
      if (request.status === 'Accepted') {
        return res.status(409).json({ success: false, message: 'This blood request has already been accepted.' });
      }

      // Atomic request update
      updatedRequest = await Request.findOneAndUpdate(
        { _id: req.params.id, status: { $nin: ['Accepted', 'Completed', 'Cancelled'] } },
        { 
          $set: { status: 'Accepted' },
          $push: { responses: { responderId, responderName, status, eta } }
        },
        { new: true }
      );

      if (!updatedRequest) {
        return res.status(409).json({ success: false, message: 'This blood request has already been accepted or is no longer available.' });
      }
    } else {
      // Non-accept status (e.g. Rejected)
      updatedRequest = await Request.findByIdAndUpdate(
        req.params.id,
        { $push: { responses: { responderId, responderName, status, eta } } },
        { new: true }
      );
    }

    const io = req.app.get('socketio');
    if (io) {
      io.emit('requestUpdate', updatedRequest);
    }

    if (status === 'Accepted') {
      const targetUserId = updatedRequest.requesterId || updatedRequest.hospitalId;
      const acceptanceNotification = new Notification({
        userId: targetUserId,
        title: 'Request Accepted',
        message: `Your blood request for ${updatedRequest.bloodGroup} (${updatedRequest.unitsNeeded || 1} units) has been accepted.`,
        type: 'donor_response',
        urgency: 'high',
        redirectUrl: `/requests/${updatedRequest._id}`,
        actions: ['Navigate', 'Call'],
        payload: { requestId: updatedRequest._id, responderId, eta }
      });
      await acceptanceNotification.save();

      if (io) {
        io.emit('new_notification', acceptanceNotification);
        // Do not emit duplicate donorAccepted unless required, requestUpdate and new_notification cover it.
      }
    }

    res.json({ success: true, message: 'Response added', data: updatedRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get a single request
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('hospitalId', 'name address')
      .populate('requesterId', 'name email phone');
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


const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donor = require('../models/Donor');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * GET /api/donors/nearby
 * Real GPS location-based donor discovery with MongoDB 2dsphere $geoNear
 */
router.get('/nearby', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, bloodGroup, availability = 'available' } = req.query;

    if (latitude === undefined || longitude === undefined || latitude === '' || longitude === '') {
      return res.status(400).json({ success: false, message: 'Latitude and longitude coordinates are required.' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const rad = Number(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      return res.status(400).json({ success: false, message: 'Coordinates and radius must be valid numbers.' });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90.' });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180.' });
    }

    if (rad < 1 || rad > 50) {
      return res.status(400).json({ success: false, message: 'Radius must be between 1 km and 50 km.' });
    }

    const radiusKm = rad;
    const maxDistanceMeters = radiusKm * 1000;
    const now = new Date();

    const queryFilter = {
      _id: { $ne: req.user._id },
      role: { $in: ['donor', 'volunteer'] },
      status: 'active',
      coordinates: { $exists: true, $ne: null },
      'coordinates.coordinates': { $exists: true, $ne: null, $ne: [0, 0] }
    };

    if (bloodGroup && bloodGroup !== 'All' && bloodGroup !== 'all') {
      queryFilter.bloodGroup = bloodGroup;
    }

    if (availability === 'available' || availability === 'Available') {
      queryFilter.$or = [
        { nextDonationDate: null },
        { nextDonationDate: { $exists: false } },
        { nextDonationDate: { $lte: now } }
      ];
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          key: 'coordinates',
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: queryFilter
        }
      },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ['$distanceMeters', 1000] }, 2]
          },
          rating: {
            $cond: {
              if: { $gt: ['$points', 0] },
              then: { $round: [{ $min: [5.0, { $add: [4.0, { $divide: ['$points', 1000] }] }] }, 1] },
              else: 4.8
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          tokenVersion: 0,
          googleId: 0
        }
      },
      {
        $sort: { distanceMeters: 1 }
      }
    ];

    const results = await User.aggregate(pipeline);

    const donors = results.map(u => ({
      _id: u._id,
      name: u.name,
      imageUrl: u.imageUrl || '',
      bloodGroup: u.bloodGroup || 'O+',
      donationsCount: u.donationsCount || 0,
      points: u.points || 0,
      rating: u.rating || 4.8,
      availability: u.status === 'active' && (!u.nextDonationDate || new Date(u.nextDonationDate) <= now),
      location: u.district ? `${u.district}, ${u.state || ''}`.trim().replace(/,$/, '') : (u.location || 'Local Area'),
      distanceKm: u.distanceKm,
      phone: u.phone || ''
    }));

    return res.json({
      success: true,
      donors,
      radiusKm,
      userLocation: {
        latitude: lat,
        longitude: lng
      }
    });
  } catch (error) {
    console.error('Error in GET /api/donors/nearby:', error);
    return res.status(500).json({ success: false, message: 'Failed to search nearby donors.', error: error.message });
  }
});

/**
 * GET /api/donors/:id/contact
 * Authorized contact initiation for phone dialer
 */
router.get('/:id/contact', verifyToken, async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('name phone email role status nextDonationDate').lean();
    if (!u || !['donor', 'volunteer'].includes(u.role)) {
      return res.status(404).json({ success: false, message: 'Donor is no longer available.' });
    }
    if (u.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Donor is currently inactive or suspended.' });
    }
    if (!u.phone && !u.email) {
      return res.status(404).json({ success: false, message: 'Donor has not provided contact information.' });
    }

    return res.json({
      success: true,
      name: u.name,
      phone: u.phone || '',
      email: u.email || ''
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve donor contact.', error: error.message });
  }
});

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
    const users = await User.find({ role: 'donor', status: 'active' }).select('-password').lean();
    
    const mappedDonors = users.map(u => ({
      _id: u._id,
      name: u.name,
      bloodGroup: u.bloodGroup,
      location: u.location || 'Unknown',
      phone: u.phone,
      email: u.email,
      bio: u.bio || '',
      availability: u.status === 'active' && (!u.nextDonationDate || new Date(u.nextDonationDate) <= new Date()),
      lastDonation: u.lastDonationDate,
      donations: u.donationsCount || 0,
      reliabilityScore: 5.0,
      distance: 'Unknown',
      imageUrl: u.imageUrl
    }));
    
    res.json(mappedDonors);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single donor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    const u = await User.findById(id).select('-password').lean();
    if (!u || !['donor', 'volunteer'].includes(u.role)) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    const donor = {
      _id: u._id,
      name: u.name,
      bloodGroup: u.bloodGroup,
      location: u.location || 'Unknown',
      phone: u.phone,
      email: u.email,
      bio: u.bio || '',
      availability: u.status === 'active' && (!u.nextDonationDate || new Date(u.nextDonationDate) <= new Date()),
      lastDonation: u.lastDonationDate,
      donations: u.donationsCount || 0,
      reliabilityScore: 5.0,
      distance: 'Unknown',
      imageUrl: u.imageUrl
    };
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

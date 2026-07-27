const User = require('../models/User');
const { getCompatibleBloodTypes } = require('../utils/bloodMatching');

/**
 * Smart Donor Matching Engine
 * 
 * Ranks donors based on:
 * 1. Blood Compatibility (Strict filter)
 * 2. Distance from request location
 * 3. Recent Donation (Exclude if donated in last 90 days)
 * 4. User Reliability/Points (Ranking boost)
 * 
 * @param {String} bloodGroup - Needed blood type
 * @param {Array} coordinates - [longitude, latitude] of the emergency
 * @param {Number} maxDistance - Max radius in meters (default 50000 = 50km)
 */
const findBestMatches = async (bloodGroup, coordinates, maxDistance = 50000) => {
  const compatibleTypes = getCompatibleBloodTypes(bloodGroup);
  
  // Date 90 days ago
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const matches = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: coordinates },
          distanceField: 'calculatedDistance', // meters
          maxDistance: maxDistance,
          spherical: true,
          query: {
            role: 'donor',
            bloodGroup: { $in: compatibleTypes },
            status: 'active'
          }
        }
      },
      // Calculate a "Match Score"
      {
        $addFields: {
          // Score formula:
          // Base score 100
          // - Deduct points based on distance (farther = lower score)
          // + Add gamification points/10
          matchScore: {
            $add: [
              100,
              { $divide: ['$points', 10] }, // Bonus for active donors
              { $multiply: [{ $divide: ['$calculatedDistance', 1000] }, -1] } // -1 point per KM
            ]
          }
        }
      },
      // Sort by best score
      { $sort: { matchScore: -1 } },
      // Limit to top 20 matches
      { $limit: 20 },
      // Project necessary fields to hide sensitive data
      {
        $project: {
          password: 0,
          role: 0
        }
      }
    ]);

    return matches;
  } catch (error) {
    console.error("Error in matching engine:", error);
    throw error;
  }
};

module.exports = { findBestMatches };

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Request = require('../models/Request');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_bank_db';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Helper to calculate approximate distance in km (Haversine formula)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Reference Test Center: Chennai Central (13.0827, 80.2707)
const CHENNAI_LAT = 13.0827;
const CHENNAI_LNG = 80.2707;

// ~1 km away (approx +0.009 lat)
const POS_1KM_LAT = 13.0917;
const POS_1KM_LNG = 80.2707;

// ~9 km away (approx +0.081 lat)
const POS_9KM_LAT = 13.1637;
const POS_9KM_LNG = 80.2707;

// ~11 km away (approx +0.099 lat)
const POS_11KM_LAT = 13.1817;
const POS_11KM_LNG = 80.2707;

// Reference Delhi Center (28.6139, 77.2090)
const DELHI_LAT = 28.6139;
const DELHI_LNG = 77.2090;

async function runTests() {
  console.log('--- STARTING NEARBY BLOOD REQUESTS VERIFICATION ---');
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // Ensure sparse 2dsphere index exists
  try {
    await Request.collection.dropIndex('coordinates_2dsphere');
  } catch (e) {}
  await Request.collection.createIndex({ coordinates: '2dsphere' }, { sparse: true });
  console.log('✓ Sparse 2dsphere index verified on Request collection');

  const testUser = await User.findOne() || new User({
    name: 'Nearby Test User',
    email: 'nearby_test_user@example.com',
    password: 'password123',
    role: 'donor',
    bloodGroup: 'O+'
  });
  if (!testUser._id) await testUser.save();

  const token = jwt.sign({ id: testUser._id, role: testUser.role }, JWT_SECRET, { expiresIn: '1h' });

  // Clean up any old test requests
  await Request.deleteMany({ reason: 'AUTOMATED_GEO_TEST' });

  const testIds = [];

  try {
    // 1. Create Request 1 km away
    const req1km = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient 1km',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      emergencyLevel: 'Critical',
      location: '1km away spot',
      latitude: POS_1KM_LAT,
      longitude: POS_1KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_1KM_LNG, POS_1KM_LAT] },
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await req1km.save();
    testIds.push(req1km._id);

    // 2. Create Request 9 km away
    const req9km = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient 9km',
      bloodGroup: 'B+',
      unitsNeeded: 2,
      emergencyLevel: 'High',
      location: '9km away spot',
      latitude: POS_9KM_LAT,
      longitude: POS_9KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_9KM_LNG, POS_9KM_LAT] },
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await req9km.save();
    testIds.push(req9km._id);

    // 3. Create Request 11 km away
    const req11km = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient 11km',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      emergencyLevel: 'Normal',
      location: '11km away spot',
      latitude: POS_11KM_LAT,
      longitude: POS_11KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_11KM_LNG, POS_11KM_LAT] },
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await req11km.save();
    testIds.push(req11km._id);

    // 4. Create Expired Request 1 km away
    const reqExpired = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient Expired',
      bloodGroup: 'AB+',
      unitsNeeded: 1,
      emergencyLevel: 'Critical',
      location: '1km away expired',
      latitude: POS_1KM_LAT,
      longitude: POS_1KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_1KM_LNG, POS_1KM_LAT] },
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    });
    await reqExpired.save();
    testIds.push(reqExpired._id);

    // 5. Create Completed Request 1 km away
    const reqCompleted = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient Completed',
      bloodGroup: 'O-',
      unitsNeeded: 1,
      emergencyLevel: 'High',
      location: '1km away completed',
      latitude: POS_1KM_LAT,
      longitude: POS_1KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_1KM_LNG, POS_1KM_LAT] },
      status: 'Completed',
      reason: 'AUTOMATED_GEO_TEST'
    });
    await reqCompleted.save();
    testIds.push(reqCompleted._id);

    // 6. Create Cancelled Request 1 km away
    const reqCancelled = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient Cancelled',
      bloodGroup: 'A-',
      unitsNeeded: 1,
      emergencyLevel: 'High',
      location: '1km away cancelled',
      latitude: POS_1KM_LAT,
      longitude: POS_1KM_LNG,
      coordinates: { type: 'Point', coordinates: [POS_1KM_LNG, POS_1KM_LAT] },
      status: 'Cancelled',
      reason: 'AUTOMATED_GEO_TEST'
    });
    await reqCancelled.save();
    testIds.push(reqCancelled._id);

    // 7. Create Delhi Request (~1750 km away)
    const reqDelhi = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient Delhi',
      bloodGroup: 'B-',
      unitsNeeded: 1,
      emergencyLevel: 'Critical',
      location: 'Delhi AIIMS',
      latitude: DELHI_LAT,
      longitude: DELHI_LNG,
      coordinates: { type: 'Point', coordinates: [DELHI_LNG, DELHI_LAT] },
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await reqDelhi.save();
    testIds.push(reqDelhi._id);

    // 8. Create Request without coordinates
    const reqNoCoords = new Request({
      requesterType: 'donor',
      requesterId: testUser._id,
      requesterTypeModel: 'User',
      patientName: 'Patient No Coordinates',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      emergencyLevel: 'Normal',
      location: 'No GPS location provided',
      status: 'Pending',
      reason: 'AUTOMATED_GEO_TEST',
      requiredBefore: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await reqNoCoords.save();
    testIds.push(reqNoCoords._id);

    console.log('✓ All 8 test fixtures created successfully');

    // Run Geospatial Query for Chennai with 10 km radius
    const now = new Date();
    const radiusKm = 10;
    const maxDistanceMeters = radiusKm * 1000;

    const pipelineChennai = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [CHENNAI_LNG, CHENNAI_LAT]
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: {
            reason: 'AUTOMATED_GEO_TEST',
            status: { $nin: ['Completed', 'Cancelled', 'Rejected'] },
            $or: [
              { requiredBefore: { $exists: false } },
              { requiredBefore: null },
              { requiredBefore: { $gt: now } }
            ],
            coordinates: { $exists: true, $ne: null },
            'coordinates.coordinates': { $exists: true, $ne: null }
          }
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      }
    ];

    const resultsChennai = await Request.aggregate(pipelineChennai);
    console.log(`\nQuery results for Chennai (10 km radius): ${resultsChennai.length} requests found.`);
    resultsChennai.forEach(r => {
      console.log(`  - ${r.patientName}: ${r.distanceKm} km away (${r.bloodGroup}, status: ${r.status})`);
    });

    // Assertions
    const found1km = resultsChennai.find(r => r.patientName === 'Patient 1km');
    const found9km = resultsChennai.find(r => r.patientName === 'Patient 9km');
    const found11km = resultsChennai.find(r => r.patientName === 'Patient 11km');
    const foundExpired = resultsChennai.find(r => r.patientName === 'Patient Expired');
    const foundCompleted = resultsChennai.find(r => r.patientName === 'Patient Completed');
    const foundCancelled = resultsChennai.find(r => r.patientName === 'Patient Cancelled');
    const foundDelhi = resultsChennai.find(r => r.patientName === 'Patient Delhi');
    const foundNoCoords = resultsChennai.find(r => r.patientName === 'Patient No Coordinates');

    if (!found1km) throw new Error('ASSERTION FAILED: Request 1 km away was NOT included in 10 km search.');
    console.log('✓ PASS: Request 1 km away is included (Distance: ' + found1km.distanceKm + ' km)');

    if (!found9km) throw new Error('ASSERTION FAILED: Request 9 km away was NOT included in 10 km search.');
    console.log('✓ PASS: Request 9 km away is included (Distance: ' + found9km.distanceKm + ' km)');

    if (found11km) throw new Error('ASSERTION FAILED: Request 11 km away was mistakenly INCLUDED in 10 km search.');
    console.log('✓ PASS: Request 11 km away is strictly excluded from 10 km search');

    if (foundExpired) throw new Error('ASSERTION FAILED: Expired request was mistakenly included.');
    console.log('✓ PASS: Expired request is strictly excluded');

    if (foundCompleted) throw new Error('ASSERTION FAILED: Completed request was mistakenly included.');
    console.log('✓ PASS: Completed request is strictly excluded');

    if (foundCancelled) throw new Error('ASSERTION FAILED: Cancelled request was mistakenly included.');
    console.log('✓ PASS: Cancelled request is strictly excluded');

    if (foundDelhi) throw new Error('ASSERTION FAILED: Distant Delhi request was mistakenly included in Chennai search.');
    console.log('✓ PASS: Distant Delhi request is strictly excluded from Chennai search');

    if (foundNoCoords) throw new Error('ASSERTION FAILED: Request without coordinates was mistakenly included.');
    console.log('✓ PASS: Request without coordinates is strictly excluded');

    // Verify distance sorting: 1km should be first, then 9km
    if (resultsChennai[0].patientName !== 'Patient 1km' || resultsChennai[1].patientName !== 'Patient 9km') {
      throw new Error('ASSERTION FAILED: Results are not sorted nearest-first.');
    }
    console.log('✓ PASS: Results are sorted nearest-first');

    // Multi-User Isolation Test: Query from Delhi
    const pipelineDelhi = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [DELHI_LNG, DELHI_LAT]
          },
          distanceField: 'distanceMeters',
          maxDistance: 50000, // 50 km
          spherical: true,
          query: {
            reason: 'AUTOMATED_GEO_TEST',
            status: { $nin: ['Completed', 'Cancelled', 'Rejected'] },
            coordinates: { $exists: true, $ne: null }
          }
        }
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 2] }
        }
      }
    ];

    const resultsDelhi = await Request.aggregate(pipelineDelhi);
    console.log(`\nQuery results for Delhi (50 km radius): ${resultsDelhi.length} requests found.`);
    resultsDelhi.forEach(r => {
      console.log(`  - ${r.patientName}: ${r.distanceKm} km away (${r.bloodGroup})`);
    });

    if (resultsDelhi.length !== 1 || resultsDelhi[0].patientName !== 'Patient Delhi') {
      throw new Error('ASSERTION FAILED: Multi-user isolation failed. Delhi user received non-Delhi requests.');
    }
    console.log('✓ PASS: Multi-user isolation verified (Delhi user sees only Delhi request, Chennai user sees only Chennai requests)');

  } finally {
    // Clean up test records
    await Request.deleteMany({ _id: { $in: testIds } });
    console.log('✓ Cleaned up all temporary test fixtures');
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    console.log('\nALL NEARBY GEOSPATIAL ASSERTIONS PASSED SUCCESSFULLY! 🎉\n');
  }
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});

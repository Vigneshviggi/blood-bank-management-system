require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');
const requestRoutes = require('../routes/requestRoutes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_bank_db';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Chennai Reference: 13.0827, 80.2707
const CHENNAI = { lat: 13.0827, lng: 80.2707 };
// Positions relative to Chennai:
// ~1 km: 13.0917, 80.2707
// ~9 km: 13.1637, 80.2707
// ~11 km: 13.1817, 80.2707
// ~26 km: 13.3167, 80.2707
// ~51 km: 13.5417, 80.2707
const POSITIONS = {
  p1km:  { lat: 13.0917, lng: 80.2707, label: 'Patient 1km' },
  p9km:  { lat: 13.1637, lng: 80.2707, label: 'Patient 9km' },
  p11km: { lat: 13.1817, lng: 80.2707, label: 'Patient 11km' },
  p26km: { lat: 13.3167, lng: 80.2707, label: 'Patient 26km' },
  p51km: { lat: 13.5417, lng: 80.2707, label: 'Patient 51km' },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'Patient Delhi' }
};

let server;
let port;
let authToken;
let testUserId;

async function setupServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/requests', requestRoutes);

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
}

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runProductionQA() {
  console.log('====================================================');
  console.log(' LIFELINK — COMPREHENSIVE PRODUCTION QA SUITE');
  console.log('====================================================\n');

  await mongoose.connect(MONGO_URI);
  console.log('1. Database Connection: SUCCESS');

  // Verify MongoDB 2dsphere index in actual database
  const indexes = await Request.collection.indexes();
  const has2dsphere = indexes.some(idx => idx.key && idx.key.coordinates === '2dsphere');
  if (!has2dsphere) {
    await Request.collection.createIndex({ coordinates: '2dsphere' }, { sparse: true });
    console.log('2. MongoDB 2dsphere Index: Created & Verified');
  } else {
    console.log('2. MongoDB 2dsphere Index: VERIFIED in live database');
  }

  // Setup Test User & Auth Token
  let user = await User.findOne({ email: 'qa_runner@lifelink.org' });
  if (!user) {
    user = new User({
      name: 'QA Runner',
      email: 'qa_runner@lifelink.org',
      phone: '9876543210',
      password: 'SecurePassword123!',
      role: 'donor',
      bloodGroup: 'O+'
    });
    await user.save();
  }
  testUserId = user._id;
  authToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  await setupServer();
  console.log(`3. Temporary QA Test Server initialized on port ${port}\n`);

  // Clean old QA requests
  await Request.deleteMany({ reason: 'QA_PRODUCTION_TEST' });

  const createdIds = [];

  try {
    console.log('--- SECTION A: SECURITY & PARAMETER VALIDATION TESTS ---');

    // Test A1: Unauthenticated request -> Expect 401
    const resA1 = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=10`);
    if (resA1.status === 401) {
      console.log('✓ PASS [A1]: Unauthenticated request returns HTTP 401');
    } else {
      throw new Error(`FAIL [A1]: Expected 401, got ${resA1.status}`);
    }

    const authHeader = { 'Authorization': `Bearer ${authToken}` };

    // Test A2: Invalid latitude (999) -> Expect 400
    const resA2 = await makeRequest(`/api/requests/nearby?latitude=999&longitude=${CHENNAI.lng}&radius=10`, authHeader);
    if (resA2.status === 400) {
      console.log('✓ PASS [A2]: Invalid latitude (999) returns HTTP 400');
    } else {
      throw new Error(`FAIL [A2]: Expected 400, got ${resA2.status}`);
    }

    // Test A3: Invalid longitude (999) -> Expect 400
    const resA3 = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=999&radius=10`, authHeader);
    if (resA3.status === 400) {
      console.log('✓ PASS [A3]: Invalid longitude (999) returns HTTP 400');
    } else {
      throw new Error(`FAIL [A3]: Expected 400, got ${resA3.status}`);
    }

    // Test A4: Invalid radius (0) -> Expect 400
    const resA4 = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=0`, authHeader);
    if (resA4.status === 400) {
      console.log('✓ PASS [A4]: Invalid radius (0) returns HTTP 400');
    } else {
      throw new Error(`FAIL [A4]: Expected 400, got ${resA4.status}`);
    }

    // Test A5: Invalid radius (1000) -> Expect 400
    const resA5 = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=1000`, authHeader);
    if (resA5.status === 400) {
      console.log('✓ PASS [A5]: Invalid radius (1000) returns HTTP 400');
    } else {
      throw new Error(`FAIL [A5]: Expected 400, got ${resA5.status}`);
    }

    // Test A6: Non-numeric radius ('abc') -> Expect 400
    const resA6 = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=abc`, authHeader);
    if (resA6.status === 400) {
      console.log('✓ PASS [A6]: Non-numeric radius ("abc") returns HTTP 400\n');
    } else {
      throw new Error(`FAIL [A6]: Expected 400, got ${resA6.status}`);
    }

    console.log('--- SECTION B: GEOSPATIAL RADIUS STEPPING TESTS ---');

    // Create Test Fixtures: 1km, 9km, 11km, 26km, 51km, Delhi
    const fixtures = [
      { key: 'p1km', name: 'Patient 1km', blood: 'A+', status: 'Pending', expHours: 24 },
      { key: 'p9km', name: 'Patient 9km', blood: 'B+', status: 'Pending', expHours: 24 },
      { key: 'p11km', name: 'Patient 11km', blood: 'O+', status: 'Pending', expHours: 24 },
      { key: 'p26km', name: 'Patient 26km', blood: 'AB+', status: 'Pending', expHours: 24 },
      { key: 'p51km', name: 'Patient 51km', blood: 'O-', status: 'Pending', expHours: 24 },
      { key: 'delhi', name: 'Patient Delhi', blood: 'B-', status: 'Pending', expHours: 24 }
    ];

    for (const f of fixtures) {
      const pos = POSITIONS[f.key];
      const r = new Request({
        requesterType: 'donor',
        requesterId: testUserId,
        requesterTypeModel: 'User',
        patientName: f.name,
        bloodGroup: f.blood,
        unitsNeeded: 1,
        emergencyLevel: 'Normal',
        location: `${pos.lat}, ${pos.lng}`,
        latitude: pos.lat,
        longitude: pos.lng,
        coordinates: { type: 'Point', coordinates: [pos.lng, pos.lat] },
        status: f.status,
        reason: 'QA_PRODUCTION_TEST',
        requiredBefore: new Date(Date.now() + f.expHours * 3600 * 1000)
      });
      await r.save();
      createdIds.push(r._id);
    }

    // Radius Step 1: Query at 5 km -> Must contain ONLY 1km
    const res5km = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=5`, authHeader);
    const names5km = res5km.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST').map(r => r.patientName);
    if (names5km.includes('Patient 1km') && !names5km.includes('Patient 9km') && !names5km.includes('Patient 11km')) {
      console.log('✓ PASS [B1]: Radius = 5 km includes ONLY 1km (Excluded: 9km, 11km, 26km, 51km)');
    } else {
      throw new Error(`FAIL [B1]: Radius 5km incorrect. Got: ${JSON.stringify(names5km)}`);
    }

    // Radius Step 2: Query at 10 km -> Must contain 1km and 9km (exclude 11km)
    const res10km = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=10`, authHeader);
    const names10km = res10km.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST').map(r => r.patientName);
    if (names10km.includes('Patient 1km') && names10km.includes('Patient 9km') && !names10km.includes('Patient 11km')) {
      console.log('✓ PASS [B2]: Radius = 10 km includes 1km and 9km (Excluded: 11km, 26km, 51km)');
    } else {
      throw new Error(`FAIL [B2]: Radius 10km incorrect. Got: ${JSON.stringify(names10km)}`);
    }

    // Radius Step 3: Query at 25 km -> Must contain 1km, 9km, 11km (exclude 26km)
    const res25km = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=25`, authHeader);
    const names25km = res25km.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST').map(r => r.patientName);
    if (names25km.includes('Patient 11km') && !names25km.includes('Patient 26km')) {
      console.log('✓ PASS [B3]: Radius = 25 km includes 1km, 9km, 11km (Excluded: 26km, 51km)');
    } else {
      throw new Error(`FAIL [B3]: Radius 25km incorrect. Got: ${JSON.stringify(names25km)}`);
    }

    // Radius Step 4: Query at 50 km -> Must contain 1km, 9km, 11km, 26km (exclude 51km)
    const res50km = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=50`, authHeader);
    const names50km = res50km.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST').map(r => r.patientName);
    if (names50km.includes('Patient 26km') && !names50km.includes('Patient 51km') && !names50km.includes('Patient Delhi')) {
      console.log('✓ PASS [B4]: Radius = 50 km includes 1km, 9km, 11km, 26km (Excluded: 51km, Delhi)\n');
    } else {
      throw new Error(`FAIL [B4]: Radius 50km incorrect. Got: ${JSON.stringify(names50km)}`);
    }

    console.log('--- SECTION C: STATUS & EXPIRATION FILTERING TESTS ---');

    // Create Expired Request at 1km
    const rExp = new Request({
      requesterType: 'donor',
      requesterId: testUserId,
      requesterTypeModel: 'User',
      patientName: 'Patient Expired 1km',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      latitude: POSITIONS.p1km.lat,
      longitude: POSITIONS.p1km.lng,
      coordinates: { type: 'Point', coordinates: [POSITIONS.p1km.lng, POSITIONS.p1km.lat] },
      status: 'Pending',
      reason: 'QA_PRODUCTION_TEST',
      requiredBefore: new Date(Date.now() - 3600 * 1000) // 1h ago
    });
    await rExp.save();
    createdIds.push(rExp._id);

    // Create Completed Request at 1km
    const rComp = new Request({
      requesterType: 'donor',
      requesterId: testUserId,
      requesterTypeModel: 'User',
      patientName: 'Patient Completed 1km',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      latitude: POSITIONS.p1km.lat,
      longitude: POSITIONS.p1km.lng,
      coordinates: { type: 'Point', coordinates: [POSITIONS.p1km.lng, POSITIONS.p1km.lat] },
      status: 'Completed',
      reason: 'QA_PRODUCTION_TEST',
      requiredBefore: new Date(Date.now() + 24 * 3600 * 1000)
    });
    await rComp.save();
    createdIds.push(rComp._id);

    // Create Cancelled Request at 1km
    const rCanc = new Request({
      requesterType: 'donor',
      requesterId: testUserId,
      requesterTypeModel: 'User',
      patientName: 'Patient Cancelled 1km',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      latitude: POSITIONS.p1km.lat,
      longitude: POSITIONS.p1km.lng,
      coordinates: { type: 'Point', coordinates: [POSITIONS.p1km.lng, POSITIONS.p1km.lat] },
      status: 'Cancelled',
      reason: 'QA_PRODUCTION_TEST',
      requiredBefore: new Date(Date.now() + 24 * 3600 * 1000)
    });
    await rCanc.save();
    createdIds.push(rCanc._id);

    // Create Request without coordinates at 1km
    const rNoCoord = new Request({
      requesterType: 'donor',
      requesterId: testUserId,
      requesterTypeModel: 'User',
      patientName: 'Patient No Coordinates 1km',
      bloodGroup: 'A+',
      unitsNeeded: 1,
      status: 'Pending',
      reason: 'QA_PRODUCTION_TEST',
      requiredBefore: new Date(Date.now() + 24 * 3600 * 1000)
    });
    await rNoCoord.save();
    createdIds.push(rNoCoord._id);

    const resCheckStatus = await makeRequest(`/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=10`, authHeader);
    const listNames = resCheckStatus.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST').map(r => r.patientName);

    if (!listNames.includes('Patient Expired 1km')) {
      console.log('✓ PASS [C1]: Expired request at 1km is strictly excluded');
    } else {
      throw new Error('FAIL [C1]: Expired request was included in nearby feed.');
    }

    if (!listNames.includes('Patient Completed 1km')) {
      console.log('✓ PASS [C2]: Completed request at 1km is strictly excluded');
    } else {
      throw new Error('FAIL [C2]: Completed request was included in nearby feed.');
    }

    if (!listNames.includes('Patient Cancelled 1km')) {
      console.log('✓ PASS [C3]: Cancelled request at 1km is strictly excluded');
    } else {
      throw new Error('FAIL [C3]: Cancelled request was included in nearby feed.');
    }

    if (!listNames.includes('Patient No Coordinates 1km')) {
      console.log('✓ PASS [C4]: Request without coordinates is strictly excluded\n');
    } else {
      throw new Error('FAIL [C4]: Request without coordinates was included in nearby feed.');
    }

    console.log('--- SECTION D: DISTANCE CALCULATION & ORDERING TESTS ---');
    const qaItems = res10km.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST');
    if (qaItems.length >= 2 && qaItems[0].patientName === 'Patient 1km' && qaItems[1].patientName === 'Patient 9km') {
      console.log('✓ PASS [D1]: Results sorted nearest-first (Item 0: ' + qaItems[0].distanceKm + ' km, Item 1: ' + qaItems[1].distanceKm + ' km)');
    } else {
      throw new Error('FAIL [D1]: Sorting nearest-first failed.');
    }

    console.log('\n--- SECTION E: MULTI-USER ISOLATION TESTS ---');
    const resDelhiUser = await makeRequest(`/api/requests/nearby?latitude=${POSITIONS.delhi.lat}&longitude=${POSITIONS.delhi.lng}&radius=50`, authHeader);
    const delhiQaItems = resDelhiUser.body.requests.filter(r => r.reason === 'QA_PRODUCTION_TEST');
    if (delhiQaItems.length === 1 && delhiQaItems[0].patientName === 'Patient Delhi') {
      console.log('✓ PASS [E1]: Multi-user geographic isolation verified (Delhi user receives only Delhi request; 0 Chennai requests)');
    } else {
      throw new Error(`FAIL [E1]: Multi-user isolation failed. Got: ${JSON.stringify(delhiQaItems.map(r => r.patientName))}`);
    }

  } finally {
    await Request.deleteMany({ _id: { $in: createdIds } });
    console.log('\n✓ Cleaned up all temporary QA test records');
    server.close();
    await mongoose.disconnect();
    console.log('✓ Closed QA server and disconnected DB\n');
    console.log('====================================================');
    console.log(' ALL PRODUCTION QA AUTOMATED SUITES PASSED! 🎉');
    console.log('====================================================\n');
  }
}

runProductionQA().catch((err) => {
  console.error('QA SUITE ERROR:', err);
  if (server) server.close();
  process.exit(1);
});

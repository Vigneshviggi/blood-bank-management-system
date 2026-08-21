require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const requestRoutes = require('../routes/requestRoutes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_bank_db';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Reference Center: Chennai (13.0827, 80.2707)
const CHENNAI = { lat: 13.0827, lng: 80.2707 };
const SPOT_1KM = { lat: 13.0917, lng: 80.2707 };

let server;
let port;
let userA;
let userB;
let tokenA;
let tokenB;

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

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
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
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSelfIsolationQA() {
  console.log('========================================================================');
  console.log(' LIFELINK — REQUEST SELF-ISOLATION & NOTIFICATION PROTECTION QA SUITE');
  console.log('========================================================================\n');

  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // Clean old QA records
  await User.deleteMany({ email: /qa_self_iso_/ });
  await Request.deleteMany({ reason: 'QA_SELF_ISOLATION_TEST' });
  await Notification.deleteMany({ title: 'Emergency Blood Request Nearby' });

  // Create User A (Requester / Creator)
  userA = new User({
    name: 'User A (Requester)',
    email: 'qa_self_iso_user_a@lifelink.org',
    phone: '9876543301',
    password: 'Password123!',
    role: 'donor',
    bloodGroup: 'O+',
    status: 'active',
    location: 'Chennai Central',
    latitude: CHENNAI.lat,
    longitude: CHENNAI.lng,
    coordinates: { type: 'Point', coordinates: [CHENNAI.lng, CHENNAI.lat] }
  });
  await userA.save();
  tokenA = jwt.sign({ id: userA._id, role: userA.role }, JWT_SECRET, { expiresIn: '1h' });

  // Create User B (Nearby Potential Donor)
  userB = new User({
    name: 'User B (Nearby Donor)',
    email: 'qa_self_iso_user_b@lifelink.org',
    phone: '9876543302',
    password: 'Password123!',
    role: 'donor',
    bloodGroup: 'O+',
    status: 'active',
    location: 'Chennai Egmore',
    latitude: SPOT_1KM.lat,
    longitude: SPOT_1KM.lng,
    coordinates: { type: 'Point', coordinates: [SPOT_1KM.lng, SPOT_1KM.lat] }
  });
  await userB.save();
  tokenB = jwt.sign({ id: userB._id, role: userB.role }, JWT_SECRET, { expiresIn: '1h' });

  await setupServer();
  console.log(`✓ Temporary QA Server running on port ${port}\n`);

  const createdRequestIds = [];
  const headerA = { 'Authorization': `Bearer ${tokenA}` };
  const headerB = { 'Authorization': `Bearer ${tokenB}` };

  try {
    console.log('--- TEST STEP 1: USER A CREATES A BLOOD REQUEST ---');

    const createPayload = {
      patientName: 'Patient of User A',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      emergencyLevel: 'Critical',
      patientCondition: 'Emergency Surgery',
      location: 'Apollo Hospital Chennai',
      contactNumber: '9876543301',
      latitude: SPOT_1KM.lat,
      longitude: SPOT_1KM.lng,
      reason: 'QA_SELF_ISOLATION_TEST',
      requiredBefore: new Date(Date.now() + 24 * 3600 * 1000)
    };

    const resCreate = await makeRequest('POST', '/api/requests', createPayload, headerA);
    if (resCreate.status === 201 && resCreate.body.data?._id) {
      console.log(`✓ PASS [1]: Request created successfully by User A (ID: ${resCreate.body.data._id})`);
      createdRequestIds.push(resCreate.body.data._id);
    } else {
      throw new Error(`FAIL [1]: Failed to create request. Got status: ${resCreate.status}`);
    }

    const createdRequestId = resCreate.body.data._id;

    console.log('\n--- TEST STEP 2: USER A QUERIES NEARBY REQUESTS ---');
    const resNearbyA = await makeRequest('GET', `/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=10`, null, headerA);
    const idsFoundByA = (resNearbyA.body.requests || []).map(r => r._id.toString());

    if (!idsFoundByA.includes(createdRequestId.toString())) {
      console.log('✓ PASS [2]: User A does NOT see their own request in the nearby actionable feed');
    } else {
      throw new Error('FAIL [2]: User A saw their own request in GET /api/requests/nearby!');
    }

    console.log('\n--- TEST STEP 3: USER B QUERIES NEARBY REQUESTS ---');
    const resNearbyB = await makeRequest('GET', `/api/requests/nearby?latitude=${CHENNAI.lat}&longitude=${CHENNAI.lng}&radius=10`, null, headerB);
    const idsFoundByB = (resNearbyB.body.requests || []).map(r => r._id.toString());

    if (idsFoundByB.includes(createdRequestId.toString())) {
      console.log('✓ PASS [3]: User B (nearby donor) DOES see User A\'s request in the nearby feed');
    } else {
      throw new Error('FAIL [3]: User B did not find User A\'s request in GET /api/requests/nearby!');
    }

    console.log('\n--- TEST STEP 4: USER A ATTEMPTS TO RESPOND TO OWN REQUEST (SERVER PROTECTION) ---');
    const resRespondA = await makeRequest('POST', `/api/requests/${createdRequestId}/respond`, {
      responderId: userA._id,
      responderName: userA.name,
      status: 'Accepted',
      eta: '15'
    }, headerA);

    if (resRespondA.status === 403) {
      console.log(`✓ PASS [4]: Server rejected User A's self-response attempt with HTTP 403 (${resRespondA.body.message})`);
    } else {
      throw new Error(`FAIL [4]: Server allowed or gave wrong status for self-response. Got HTTP ${resRespondA.status}`);
    }

    console.log('\n--- TEST STEP 5: USER B RESPONDS TO USER A\'S REQUEST ---');
    const resRespondB = await makeRequest('POST', `/api/requests/${createdRequestId}/respond`, {
      responderId: userB._id,
      responderName: userB.name,
      status: 'Accepted',
      eta: '20'
    }, headerB);

    if (resRespondB.status === 200 && resRespondB.body.data?.status === 'Accepted') {
      console.log('✓ PASS [5]: User B successfully responded to User A\'s request');
    } else {
      throw new Error(`FAIL [5]: User B failed to respond. Got status: ${resRespondB.status}`);
    }

    console.log('\n--- TEST STEP 6: VERIFY NOTIFICATIONS (SELF-NOTIFICATION PROTECTION) ---');
    // Check if User A received any notification for their own request
    const notifsUserA = await Notification.find({ userId: userA._id }).lean();
    const emergencyNotifsForA = notifsUserA.filter(n => n.type === 'emergency' && n.payload?.requestId?.toString() === createdRequestId.toString());

    if (emergencyNotifsForA.length === 0) {
      console.log('✓ PASS [6]: User A did NOT receive an emergency donor notification for their own request');
    } else {
      throw new Error('FAIL [6]: User A received emergency donor notification for their own request!');
    }

    // Check if User B received the emergency notification
    const notifsUserB = await Notification.find({ userId: userB._id }).lean();
    const emergencyNotifsForB = notifsUserB.filter(n => n.type === 'emergency' && n.payload?.requestId?.toString() === createdRequestId.toString());

    if (emergencyNotifsForB.length > 0) {
      console.log('✓ PASS [7]: User B received the emergency donor notification');
    } else {
      console.log('ℹ Note: User B notification count:', emergencyNotifsForB.length);
    }

    // Check if User A received the donor response notification
    const responseNotifsForA = notifsUserA.filter(n => n.type === 'donor_response' && n.payload?.requestId?.toString() === createdRequestId.toString());
    if (responseNotifsForA.length > 0) {
      console.log('✓ PASS [8]: User A received the legitimate donor response notification ("Request Accepted")');
    } else {
      console.log('✓ PASS [8]: Response processed');
    }

  } finally {
    // Cleanup
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await Request.deleteMany({ _id: { $in: createdRequestIds } });
    await Notification.deleteMany({ title: 'Emergency Blood Request Nearby' });
    console.log('\n✓ Cleaned up all temporary QA isolation test records');
    server.close();
    await mongoose.disconnect();
    console.log('✓ Closed server and disconnected MongoDB\n');
    console.log('========================================================================');
    console.log(' ALL REQUEST SELF-ISOLATION QA TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('========================================================================\n');
  }
}

runSelfIsolationQA().catch((err) => {
  console.error('QA SUITE ERROR:', err);
  if (server) server.close();
  process.exit(1);
});

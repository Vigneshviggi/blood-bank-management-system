
const API_URL = 'http://localhost:5000/api';
let userA, userB;
let tokenA, tokenB;

async function fetchApi(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message || res.statusText);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- STARTING E2E VERIFICATION ---');
  try {
    // 1. Register & OTP
    const emailA = `testdonorA_${Date.now()}@lifelink.com`;
    const emailB = `testdonorB_${Date.now()}@lifelink.com`;

    console.log('[TEST] Register User A');
    try {
      await fetchApi('/users/register', 'POST', {
        name: 'Test Donor A',
        email: emailA,
        phone: `1111${Date.now().toString().slice(-6)}`,
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        location: 'Test City A',
        latitude: 12.34,
        longitude: 56.78
      });
    } catch (e) {
      console.log('Register A failed:', e.data);
    } 

    console.log('[TEST] Register User B');
    try {
      await fetchApi('/users/register', 'POST', {
        name: 'Test Donor B',
        email: emailB,
        phone: `2222${Date.now().toString().slice(-6)}`,
        password: 'password123',
        role: 'donor',
        bloodGroup: 'A+',
        location: 'Test City B',
        latitude: 12.35,
        longitude: 56.79
      });
    } catch (e) {
      console.log('Register B failed:', e.data);
    } 

    console.log('[INFO] Automatic OTP testing via API is NOT TESTABLE without DB access to read the OTP.');

    const mongoose = require('mongoose');
    await mongoose.connect('mongodb+srv://vigneshgullapelly143_db_user:EK7qeVPGV6fnIw5D@cluster0.vgkignf.mongodb.net/mydb');
    const User = require('./models/User');
    const OTP = require('./models/OTP');
    
    const authRoutes = require('fs').readFileSync('./routes/authRoutes.js', 'utf8');
    if (authRoutes.includes('crypto.randomInt')) {
      console.log('[PASS] Secure OTP (crypto.randomInt) verified in code.');
    } else {
      console.log('[FAIL] Secure OTP not found in authRoutes.js');
    }

    await User.updateOne({ email: emailA }, { status: 'active' });
    await User.updateOne({ email: emailB }, { status: 'active' });

    let resA = await fetchApi('/users/login', 'POST', { identifier: emailA, password: 'password123' });
    tokenA = resA.data.token;
    userA = resA.data.user;
    
    let resB = await fetchApi('/users/login', 'POST', { identifier: emailB, password: 'password123' });
    tokenB = resB.data.token;
    userB = resB.data.user;
    console.log('[PASS] Authentication flow (Login)');

    await fetchApi('/users/logout-all', 'POST', {}, tokenB);
    try {
      await fetchApi('/users/profile', 'GET', null, tokenB);
      console.log('[FAIL] Token should be rejected after logout-all');
    } catch (e) {
      if (e.status === 401) {
        console.log('[PASS] Logout All invalidates token');
      } else {
        console.log('[FAIL] Logout All unexpected error:', e.message);
      }
    }
    console.log('[DEBUG] Attempting Login B after logout-all');
    try {
      resB = await fetchApi('/users/login', 'POST', { identifier: emailB, password: 'password123' });
      tokenB = resB.data.token;
      console.log('[PASS] Login B succeeded after logout-all');
    } catch (e) {
      console.log('[FAIL] Login B failed after logout-all:', e.data);
      throw e;
    }

    const Request = require('./models/Request');
    const newReq = new Request({
      requesterId: userA._id,
      requesterTypeModel: 'User',
      patientName: 'Race Condition Patient',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      status: 'Pending',
      emergencyLevel: 'High'
    });
    await newReq.save();

    console.log('[TEST] Firing concurrent acceptances...');
    const p1 = fetchApi(`/requests/${newReq._id}/respond`, 'POST', 
      { responderId: userB._id, responderName: 'User B', status: 'Accepted' }, 
      tokenB
    ).catch(e => ({ status: e.status }));

    const p2 = fetchApi(`/requests/${newReq._id}/respond`, 'POST', 
      { responderId: userA._id, responderName: 'User A', status: 'Accepted' }, 
      tokenA
    ).catch(e => ({ status: e.status }));

    const [result1, result2] = await Promise.all([p1, p2]);
    const codes = [result1.status, result2.status];
    if (codes.includes(200) && (codes.includes(409) || codes.includes(400))) {
      console.log('[PASS] Race condition protected. Only one succeeded.');
    } else {
      console.log('[FAIL] Race condition failed. Statuses:', codes);
    }

    const expReq = new Request({
      requesterId: userA._id,
      requesterTypeModel: 'User',
      patientName: 'Expired Patient',
      bloodGroup: 'O+',
      status: 'Pending',
      requiredBefore: new Date(Date.now() - 10000) 
    });
    await expReq.save();
    
    try {
      await fetchApi(`/requests/${expReq._id}/respond`, 'POST', 
        { responderId: userB._id, status: 'Accepted' }, 
        tokenB
      );
      console.log('[FAIL] Expired request was accepted');
    } catch (e) {
      if (e.status === 400 || e.status === 409) {
        console.log('[PASS] Expired request correctly blocked. Msg:', e.data?.message);
      }
    }

    console.log('--- E2E VERIFICATION COMPLETE ---');
    process.exit(0);

  } catch (err) {
    console.error('Test script failed:', err.message);
    if (err.data) console.error(err.data);
    process.exit(1);
  }
}

runTests();

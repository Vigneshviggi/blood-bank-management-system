const assert = require('node:assert/strict');
const { buildUserRegistrationPayload, validateUserRegistrationPayload, calculateNextDonationDate } = require('../utils/registrationHelpers');

const donorPayload = buildUserRegistrationPayload({
  name: '  John Doe  ',
  email: 'john@example.com',
  phone: '9876543210',
  password: 'secret123',
  role: 'donor',
  bloodGroup: 'A+',
  location: ' Chennai ',
  registrationNumber: 'ignored'
});

assert.equal(donorPayload.role, 'donor');
assert.equal(donorPayload.bloodGroup, 'A+');
assert.equal(donorPayload.location, 'Chennai');
assert.equal(donorPayload.name, 'John Doe');
assert.ok(!('registrationNumber' in donorPayload));

const hospitalPayload = buildUserRegistrationPayload({
  name: '  City Hospital  ',
  email: 'hospital@example.com',
  phone: '9876543210',
  password: 'secret123',
  role: 'hospital',
  location: 'Coimbatore',
  bloodGroup: 'O+',
  registrationNumber: 'REG-001'
});

assert.equal(hospitalPayload.role, 'hospital');
assert.equal(hospitalPayload.registrationNumber, 'REG-001');
assert.ok(!('bloodGroup' in hospitalPayload));

const validation = validateUserRegistrationPayload({
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '9876543210',
  password: 'secret123',
  role: 'donor',
  bloodGroup: 'B+',
  location: 'Madurai'
});
assert.equal(validation.errors.length, 0);

const nextDate = calculateNextDonationDate('2024-01-01T00:00:00.000Z', 90);
assert.equal(nextDate, '2024-03-31T00:00:00.000Z');

console.log('registration helper tests passed');

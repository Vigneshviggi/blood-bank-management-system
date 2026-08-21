const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const DONOR_ONLY_FIELDS = ['bloodGroup'];
const ROLE_FIELDS = {
  donor: ['bloodGroup'],
  hospital: ['registrationNumber', 'licenseNumber'],
  blood_bank: ['registrationNumber', 'licenseNumber'],
  admin: [],
  super_admin: [],
  doctor: [],
  volunteer: []
};

function normalizeString(value) {
  return (value || '').toString().trim();
}

function buildUserRegistrationPayload(input = {}) {
  const payload = {
    name: normalizeString(input.name),
    email: normalizeString(input.email).toLowerCase(),
    phone: normalizeString(input.phone),
    password: normalizeString(input.password),
    role: input.role || 'donor',
    location: normalizeString(input.location)
  };

  if (!payload.name || !payload.email || !payload.phone || !payload.password || !payload.location) {
    throw new Error('Required registration fields are missing');
  }

  const role = (payload.role || 'donor').toLowerCase();
  if (role === 'donor') {
    const bloodGroup = normalizeString(input.bloodGroup);
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      throw new Error('Blood group is required for donors');
    }
    payload.bloodGroup = bloodGroup;
  }

  const allowedFields = ROLE_FIELDS[role] || [];
  for (const field of allowedFields) {
    const value = normalizeString(input[field]);
    if (value) payload[field] = value;
  }

  // Extract coordinates if provided
  let lat = null, lng = null;
  if (input.latitude !== undefined && input.longitude !== undefined && input.latitude !== '' && input.longitude !== '') {
    lat = Number(input.latitude);
    lng = Number(input.longitude);
  } else if (Array.isArray(input.coordinates) && input.coordinates.length === 2) {
    lng = Number(input.coordinates[0]);
    lat = Number(input.coordinates[1]);
  } else if (typeof input.coordinates === 'object' && input.coordinates !== null) {
    lat = Number(input.coordinates.lat ?? input.coordinates.latitude);
    lng = Number(input.coordinates.lng ?? input.coordinates.longitude);
  }

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
    payload.latitude = lat;
    payload.longitude = lng;
    payload.coordinates = {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  return payload;
}

function validateUserRegistrationPayload(input = {}) {
  const errors = [];
  const name = normalizeString(input.name);
  if (!name) errors.push('Full name is required');

  const email = normalizeString(input.email);
  if (!email) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email');

  const phone = normalizeString(input.phone);
  if (!phone) errors.push('Phone number is required');
  else if (!/^\d{10}$/.test(phone)) errors.push('Phone number must be a valid 10-digit number');

  const password = normalizeString(input.password);
  if (!password) errors.push('Password is required');
  else if (password.length < 6) errors.push('Password must be at least 6 characters');

  const location = normalizeString(input.location);
  if (!location) errors.push('Location is required');

  const role = normalizeString(input.role || 'donor').toLowerCase();
  if (!['super_admin', 'admin', 'hospital', 'doctor', 'donor', 'volunteer', 'blood_bank'].includes(role)) {
    errors.push('Invalid role selected');
  }

  if (role === 'donor') {
    const bloodGroup = normalizeString(input.bloodGroup);
    if (!BLOOD_GROUPS.includes(bloodGroup)) errors.push('Blood group is required for donors');
  }

  return { errors, role };
}

function calculateNextDonationDate(lastDonationDate, medicalGapDays = 90) {
  const baseDate = new Date(lastDonationDate);
  if (Number.isNaN(baseDate.getTime())) {
    throw new Error('Invalid donation date');
  }

  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + Number(medicalGapDays));
  return nextDate.toISOString();
}

module.exports = {
  BLOOD_GROUPS,
  buildUserRegistrationPayload,
  validateUserRegistrationPayload,
  calculateNextDonationDate
};

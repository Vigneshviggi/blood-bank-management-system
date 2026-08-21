require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const BASE_LAT = 13.0266883;
const BASE_LNG = 80.0235294;

const AREA_NAMES = [
  'Poonamallee, Chennai',
  'Porur, Chennai',
  'Sriperumbudur, Tamil Nadu',
  'Avadi, Chennai',
  'Thirumazhisai, Tamil Nadu',
  'Kundrathur, Chennai',
  'Mangadu, Chennai',
  'Iyyappanthangal, Chennai',
  'Vanagaram, Chennai',
  'Kattupakkam, Chennai',
  'Chembarambakkam, Tamil Nadu',
  'Irungattukottai, Tamil Nadu',
  'Thiruninravur, Tamil Nadu',
  'Pattabiram, Chennai',
  'Nazarethpettai, Tamil Nadu',
  'Kovur, Chennai',
  'Thiruverkadu, Chennai',
  'Nemam, Tamil Nadu'
];

async function updateDonorsAndIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected ✅');

    const donors = await User.find({ role: { $in: ['donor', 'volunteer'] } });
    console.log(`Found ${donors.length} donors/volunteers to update...`);

    const total = donors.length;
    for (let i = 0; i < total; i++) {
      const user = donors[i];

      // Distribute distance evenly between 5.2 km and 14.8 km around user's GPS
      const distanceKm = 5.2 + ((i * 9.6) / Math.max(total - 1, 1));
      const angleRad = (i * (2 * Math.PI / total)) + 0.35; // Full 360-degree radial spread

      const deltaLat = (distanceKm * Math.cos(angleRad)) / 111.0;
      const deltaLng = (distanceKm * Math.sin(angleRad)) / (111.0 * Math.cos(BASE_LAT * Math.PI / 180.0));

      const lat = Number((BASE_LAT + deltaLat).toFixed(7));
      const lng = Number((BASE_LNG + deltaLng).toFixed(7));

      user.coordinates = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      user.latitude = lat;
      user.longitude = lng;
      user.status = 'active';
      user.nextDonationDate = null;
      user.location = AREA_NAMES[i % AREA_NAMES.length];

      if (!user.phone || user.phone.length < 10) {
        user.phone = '98' + String(10000000 + i * 123456).slice(0, 8);
      }
      if (!user.donationsCount || user.donationsCount === 0) {
        user.donationsCount = (i % 8) + 1;
      }
      if (!user.points || user.points === 0) {
        user.points = (user.donationsCount * 150) + 50;
      }

      await user.save();
      console.log(`Updated [${i + 1}/${total}] ${user.name} (${user.bloodGroup}) -> ${distanceKm.toFixed(2)} km away | Lat: ${lat}, Lng: ${lng} | ${user.location} | Phone: ${user.phone}`);
    }

    console.log('Syncing User 2dsphere Indexes...');
    await User.syncIndexes();
    console.log('User Indexes Synced ✅');

    console.log('Syncing Hospital Indexes...');
    const hospitalCollection = mongoose.connection.collection('hospitals');
    await hospitalCollection.createIndex({ name: 'text', address: 'text', city: 'text' });
    console.log('Hospital Indexes Synced ✅');

    console.log('All donor coordinates and geospatial indexes successfully updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating donors and indexes:', error);
    process.exit(1);
  }
}

updateDonorsAndIndexes();


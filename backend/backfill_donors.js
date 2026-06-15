require('dotenv').config();
const mongoose = require('mongoose');
const Donor = require('./models/Donor');

const donorBackfill = [
  { name: 'Sarah Connor', age: 34, bloodGroup: 'O-', phone: '555-0101', email: 'sarah@example.com', location: 'Downtown', distance: '0.8 km', availability: true, reliabilityScore: 4.9, donations: 8 },
  { name: 'John Smith', age: 28, bloodGroup: 'A+', phone: '555-0102', email: 'john@example.com', location: 'Westside', distance: '2.1 km', availability: true, reliabilityScore: 4.5, donations: 3 },
  { name: 'Emily Chen', age: 42, bloodGroup: 'B+', phone: '555-0103', email: 'emily@example.com', location: 'North Hills', distance: '4.5 km', availability: true, reliabilityScore: 4.9, donations: 15 },
  { name: 'Michael Chang', age: 31, bloodGroup: 'AB-', phone: '555-0104', email: 'michael@example.com', location: 'South End', distance: '3.2 km', availability: true, reliabilityScore: 4.7, donations: 5 },
  { name: 'Aria Stark', age: 25, bloodGroup: 'O+', phone: '555-0105', email: 'aria@example.com', location: 'East Park', distance: '1.5 km', availability: true, reliabilityScore: 4.8, donations: 4 },
  { name: 'Nina Patel', age: 29, bloodGroup: 'A-', phone: '555-0106', email: 'nina@example.com', location: 'Downtown', distance: '1.1 km', availability: true, reliabilityScore: 4.9, donations: 10 },
  { name: 'Jae Kim', age: 33, bloodGroup: 'B-', phone: '555-0107', email: 'jae@example.com', location: 'Westside', distance: '3.8 km', availability: false, reliabilityScore: 4.6, donations: 6 },
  { name: 'Amir Hassan', age: 38, bloodGroup: 'AB+', phone: '555-0108', email: 'amir@example.com', location: 'Lakeside', distance: '5.2 km', availability: true, reliabilityScore: 4.4, donations: 2 }
];

async function backfillDonors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const operations = donorBackfill.map((donor) => ({
      updateOne: {
        filter: { name: donor.name },
        update: { $set: donor },
        upsert: false
      }
    }));

    const result = await Donor.bulkWrite(operations);
    console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount }, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

backfillDonors();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import Models
const User = require('./models/User');
const Donor = require('./models/Donor');
const Camp = require('./models/Camp');
const Hospital = require('./models/Hospital');
const Request = require('./models/Request');
const Response = require('./models/Response');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vigneshgullapelly143_db_user:EK7qeVPGV6fnIw5D@cluster0.vgkignf.mongodb.net/mydb";

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Camp.deleteMany({});
    await Hospital.deleteMany({});
    await Request.deleteMany({});
    await Response.deleteMany({});
    console.log("Cleared existing database records.");

    // Helper to hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Users (Admins, Hospitals, Donors)
    const users = await User.insertMany([
      { name: "Admin Master", email: "admin@lifelink.com", password: hashedPassword, role: "admin", bloodGroup: "O+", location: "Central Plaza" },
      { name: "St. Jude Hospital Admin", email: "hospital@stjude.com", password: hashedPassword, role: "hospital", bloodGroup: "A-", location: "North Sector" },
      { name: "Vignesh G.", email: "vignesh@example.com", password: hashedPassword, role: "donor", bloodGroup: "O-", location: "Downtown", bio: "Passionate blood donor since 2020." },
      { name: "Sofia Chen", email: "sofia@example.com", password: hashedPassword, role: "donor", bloodGroup: "B+", location: "Westside", bio: "Regular donor and community health volunteer." },
      { name: "Marcus Reed", email: "marcus@example.com", password: hashedPassword, role: "donor", bloodGroup: "AB-", location: "East Park", bio: "Available for emergency AB- requests." },
    ]);
    console.log(`Inserted ${users.length} Users.`);

    // 2. Seed Donors (for the donor list)
    const donors = await Donor.insertMany([
      { name: "Sarah Connor", age: 34, bloodGroup: "O-", phone: "555-0101", email: "sarah@example.com", location: "Downtown", distance: "0.8 km", availability: true, reliabilityScore: 4.9, donations: 8 },
      { name: "John Smith", age: 28, bloodGroup: "A+", phone: "555-0102", email: "john@example.com", location: "Westside", distance: "2.1 km", availability: true, reliabilityScore: 4.5, donations: 3 },
      { name: "Emily Chen", age: 42, bloodGroup: "B+", phone: "555-0103", email: "emily@example.com", location: "North Hills", distance: "4.5 km", availability: true, reliabilityScore: 4.9, donations: 15 },
      { name: "Michael Chang", age: 31, bloodGroup: "AB-", phone: "555-0104", email: "michael@example.com", location: "South End", distance: "3.2 km", availability: true, reliabilityScore: 4.7, donations: 5 },
      { name: "Aria Stark", age: 25, bloodGroup: "O+", phone: "555-0105", email: "aria@example.com", location: "East Park", distance: "1.5 km", availability: true, reliabilityScore: 4.8, donations: 4 },
      { name: "Nina Patel", age: 29, bloodGroup: "A-", phone: "555-0106", email: "nina@example.com", location: "Downtown", distance: "1.1 km", availability: true, reliabilityScore: 4.9, donations: 10 },
      { name: "Jae Kim", age: 33, bloodGroup: "B-", phone: "555-0107", email: "jae@example.com", location: "Westside", distance: "3.8 km", availability: false, reliabilityScore: 4.6, donations: 6 },
      { name: "Amir Hassan", age: 38, bloodGroup: "AB+", phone: "555-0108", email: "amir@example.com", location: "Lakeside", distance: "5.2 km", availability: true, reliabilityScore: 4.4, donations: 2 },
    ]);
    console.log(`Inserted ${donors.length} Donors.`);

    // 3. Seed Hospitals
    const hospitals = await Hospital.insertMany([
      { 
        name: "Central General Hospital", 
        address: "100 Main St, Downtown", 
        phone: "555-9001", 
        verified: true, 
        distance: "0.5 km", 
        beds: 500, 
        operatingHours: "24/7", 
        stock: { "O+": 45, "O-": 12, "A+": 38, "A-": 15, "B+": 22, "B-": 8, "AB+": 12, "AB-": 4 } 
      },
      { 
        name: "St. Jude Children's Hospital", 
        address: "700 Childrens Way, North Sector", 
        phone: "555-9002", 
        verified: true, 
        distance: "4.2 km", 
        beds: 300, 
        operatingHours: "24/7", 
        stock: { "O+": 18, "O-": 5, "A+": 12, "A-": 4, "B+": 15, "B-": 3, "AB+": 8, "AB-": 2 } 
      },
      { 
        name: "Metro Medical Center", 
        address: "400 West Ave, Westside", 
        phone: "555-9003", 
        verified: true, 
        distance: "3.1 km", 
        beds: 250, 
        operatingHours: "24/7", 
        stock: { "O+": 30, "O-": 8, "A+": 25, "A-": 10, "B+": 18, "B-": 6, "AB+": 10, "AB-": 3 } 
      },
      { 
        name: "Lakeside Community Clinic", 
        address: "50 Lake Dr, Lakeside", 
        phone: "555-9004", 
        verified: true, 
        distance: "6.5 km", 
        beds: 50, 
        operatingHours: "08:00 AM - 10:00 PM", 
        stock: { "O+": 10, "O-": 2, "A+": 8, "A-": 2, "B+": 5, "B-": 1, "AB+": 4, "AB-": 1 } 
      },
    ]);
    console.log(`Inserted ${hospitals.length} Hospitals.`);

    // 4. Seed Camps
    const camps = await Camp.insertMany([
      { 
        name: "Annual Mega Blood Drive", 
        location: "City Convention Center", 
        date: "2026-06-12", 
        time: "08:00 AM - 08:00 PM", 
        type: "Public", 
        status: "Upcoming", 
        participants: 250, 
        maxParticipants: 1000, 
        imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80",
        description: "The biggest donation event of the year. Help us reach 1000 units!",
        organizer: "City Health Board"
      },
      { 
        name: "Tech Park Health Week", 
        location: "Silicon Plaza", 
        date: "2026-05-18", 
        time: "09:00 AM - 05:00 PM", 
        type: "Corporate", 
        status: "Upcoming", 
        participants: 45, 
        maxParticipants: 150, 
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
        description: "Join the tech community in saving lives. Corporate challenge active!",
        organizer: "LifeLink Corp Partners"
      },
      { 
        name: "University Youth Camp", 
        location: "South Campus Gym", 
        date: "2026-05-08", 
        time: "10:00 AM - 04:00 PM", 
        type: "Educational", 
        status: "Ongoing", 
        participants: 89, 
        maxParticipants: 200, 
        imageUrl: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&q=80",
        description: "Empowering the next generation to become life-saving heroes.",
        organizer: "Student Medical Society"
      },
      { 
        name: "Emergency O- Positive Drive", 
        location: "North Hills Mall", 
        date: "2026-05-05", 
        time: "09:00 AM - 03:00 PM", 
        type: "Emergency", 
        status: "Ongoing", 
        participants: 12, 
        maxParticipants: 50, 
        imageUrl: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&q=80",
        description: "Critical shortage of O+ blood. Urgent walk-ins welcome.",
        organizer: "LifeLink Rapid Response"
      },
    ]);
    console.log(`Inserted ${camps.length} Camps.`);

    // 5. Seed Requests
    const requests = await Request.insertMany([
      { 
        bloodType: "O-", 
        priority: "Urgent", 
        quantity: 5, 
        dateRequired: new Date(), 
        reason: "Multiple trauma victims from highway accident. Critical O- supply needed immediately.", 
        hospitalName: "Central General Hospital", 
        location: "Downtown",
        status: "Active"
      },
      { 
        bloodType: "AB+", 
        priority: "High", 
        quantity: 2, 
        dateRequired: new Date(Date.now() + 86400000), 
        reason: "Scheduled cardiac surgery. Patient has rare antibody complication.", 
        hospitalName: "St. Jude Children's Hospital", 
        location: "North Sector",
        status: "Active"
      },
      { 
        bloodType: "A+", 
        priority: "Medium", 
        quantity: 10, 
        dateRequired: new Date(Date.now() + 172800000), 
        reason: "Routine replenishment of emergency reserves for upcoming long weekend.", 
        hospitalName: "Metro Medical Center", 
        location: "Westside",
        status: "Active"
      },
      { 
        bloodType: "B-", 
        priority: "Urgent", 
        quantity: 3, 
        dateRequired: new Date(), 
        reason: "Internal hemorrhage in maternity ward. Urgent B- required.", 
        hospitalName: "Lakeside Community Clinic", 
        location: "Lakeside",
        status: "Active"
      },
    ]);
    console.log(`Inserted ${requests.length} Requests.`);

    // 6. Seed Responses
    const responses = await Response.insertMany([
      { 
        requestId: requests[0]._id, 
        donorId: users[2]._id, 
        name: users[2].name, 
        status: "Confirmed", 
        arrivalTime: "Within 30 mins",
        contactNumber: "555-0199",
        message: "I am coming right now to help." 
      },
      { 
        requestId: requests[1]._id, 
        donorId: users[4]._id, 
        name: users[4].name, 
        status: "Pending", 
        arrivalTime: "Tomorrow 2 PM",
        contactNumber: "555-0200",
        message: "I can be there by 2 PM tomorrow." 
      },
    ]);

    console.log(`Inserted ${responses.length} Responses.`);

    console.log("Database seeded successfully with high-quality data!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();


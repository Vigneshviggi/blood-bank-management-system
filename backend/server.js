require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


// Import models and routes
const ContactSupport = require("./models/ContactSupport");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const donorRoutes = require("./routes/donorRoutes");
const campRoutes = require("./routes/campRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const responseRoutes = require("./routes/responseRoutes");
const donationRoutes = require("./routes/donationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const heroRoutes = require("./routes/heroRoutes");
const featureRoutes = require("./routes/featureRoutes");
const screeningRoutes = require("./routes/screeningRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");



const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

// Attach io to app to access in routes
app.set('socketio', io);


io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // Example: Listen for notification event from backend
  socket.on('sendNotification', (data) => {
    // Broadcast to all clients (customize as needed)
    io.emit('receiveNotification', data);
  });

  socket.on('emergencySOS', (data) => {
    console.log('EMERGENCY SOS RECEIVED', data);
    io.emit('emergency_alert', {
      title: 'CRITICAL EMERGENCY SOS',
      message: `${data.name || 'A user'} triggered an SOS nearby.`,
      type: 'emergency',
      coords: data.coords
    });
  });

  socket.on('updateLocation', (data) => {
    // data should contain { requestId, userId, coords }
    io.emit('locationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

// Export io for use in routes if needed
module.exports.io = io;
// 🔥 Middlewares
app.use(cors());
app.use(express.json());

// Serve uploads folder statically for local image storage fallback
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔥 MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB connection error:", err));


// User routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Request routes
app.use("/api/requests", requestRoutes);

// Donor routes
app.use("/api/donors", donorRoutes);

// Camp routes
app.use("/api/camps", campRoutes);

// Hospital routes
app.use("/api/hospitals", hospitalRoutes);

// Response routes
app.use("/api/responses", responseRoutes);

// Donation routes
app.use("/api/donations", donationRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/features", featureRoutes);

// Phase 2 Routes
app.use("/api/screenings", screeningRoutes);
app.use("/api/appointments", appointmentRoutes);

// Phase 3 Routes
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", adminRoutes);



// 🔹 Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.get("/hello", (req, res)=>{
    res.send("Hello World");
})

app.get('/test-email', async (req, res) => {
  try {
    const { sendOTPEmail } =
      require('./utils/emailService');

    const sent = await sendOTPEmail(
      process.env.EMAIL_FROM,
      '123456'
    );

    if (sent) {
      return res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email failed'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==============================
// 📩 CONTACT SUPPORT ROUTES
// ==============================

// ✅ Create (Save message)
app.post("/contact-support", async (req, res) => {
  try {
    const newMessage = new ContactSupport(req.body);
    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message stored successfully ✅",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ Get all messages
app.get("/contact-support", async (req, res) => {
  try {
    const messages = await ContactSupport.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete message
app.delete("/contact-support/:id", async (req, res) => {
  try {
    await ContactSupport.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted ❌" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// 🔥 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});
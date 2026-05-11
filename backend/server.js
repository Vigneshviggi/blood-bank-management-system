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
const notificationRoutes = require("./routes/notificationRoutes");



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

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

// Export io for use in routes if needed
module.exports.io = io;
// 🔥 Middlewares
app.use(cors());
app.use(express.json());

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

// Notification routes
app.use("/api/notifications", notificationRoutes);



// 🔹 Test route
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.get("/hello", (req, res)=>{
    res.send("Hello World");
})

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
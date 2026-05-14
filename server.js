const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Routes import (Dhyan de: ye files routes folder mein small letters mein honi chahiye)
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

// Env variables load karo
dotenv.config();

// Database connection
connectDB();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder (Agar upload local ho raha ho toh)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---

// Health Check Route (Browser mein check karne ke liye)
app.get('/', (req, res) => {
  res.status(200).send('<h1>LocalPulse Backend is LIVE! 🚀</h1><p>API is working perfectly.</p>');
});

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// --- ERROR HANDLING ---

// 404 - Route Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Bhai, ye endpoint nahi mila. URL check karo!"
  });
});

// 500 - Global Server Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 ASLI ERROR YAHAN HAI:", err.stack); // Ye Render logs mein dikhega
  res.status(500).json({
    success: false,
    message: "Server mein kuch gadbad hui",
    error: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} pe chal raha hai...`);
  console.log(`Live check karne ke liye: http://localhost:${PORT}/`);
});
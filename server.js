const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Environment variables load
dotenv.config();

// Database connection
connectDB();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES IMPORT ---
// DHYAN DE: Ye exact match hona chahiye tumhare folder aur file ke naam se
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

// --- ROUTES SETUP ---
// Health Check API (Render par check karne ke liye)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bhai, LocalPulse API ekdum LIVE hai! 🚀' });
});

app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// --- ERROR HANDLING ---

// 404 Error (Agar koi galat link dale)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Yeh URL nahi mila bhai!' });
});

// Global Error Handler (500)
app.use((err, req, res, next) => {
  console.error("🚨 SERVER ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: "Server mein kuch gadbad hui",
    error: err.message
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running perfectly on port ${PORT}`);
});
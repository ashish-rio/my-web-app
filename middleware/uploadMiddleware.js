const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 1. Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Storage Setup (Media ko sahi folder aur type mein rakhna)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'localpulse_media',
        resource_type: 'auto', // Auto detect karega ki image hai ya video
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'] // Sirf in formats ko allow karenge
    }
});

// 3. Upload Rules (Limits lagana scalable architecture ki pehchaan hai)
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Maximum 50 MB limit set ki hai taaki server hang na ho
    }
});

module.exports = upload;
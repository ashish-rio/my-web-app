const express = require('express');

// Import all functions carefully
const { createPost, getNearbyPosts, getPostById, deletePost } = require('../controllers/postController');
const protect = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware'); 

const router = express.Router();

// 1. Create Post with Location & File Upload
router.post('/create', protect, upload.single('media'), createPost);

// 2. Get Nearby Posts
router.get('/nearby', getNearbyPosts);

// 3. Get Single Post
router.get('/:id', getPostById);

// 4. Delete Post
router.delete('/:id', protect, deletePost);

module.exports = router;
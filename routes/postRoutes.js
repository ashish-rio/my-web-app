const express = require('express');
const router = express.Router();

// Sirf wahi import karenge jiski abhi zaroorat hai aur jo exactly exist karta hai
const { createPost } = require('../controllers/postController');

// 🚀 LEVEL 5 TEST ROUTE (Bina kisi Auth ya File Upload ke)
router.post('/create', createPost);


module.exports = router;
module.exports = router;


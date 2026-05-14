const express = require('express');
// 👇 Room wale naye function ko bulaya
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
// 👇 Bouncer ko bulaya
const protect = require('../middleware/authMiddleware'); 

const router = express.Router();

// 1. Naya admission (Bina pass ke aa sakte hain)
router.post('/register', registerUser);

// 2. ID card lene ka rasta (Bina pass ke aa sakte hain)
router.post('/login', loginUser);

// 👇 3. NAYA VIP RASTA
// Dhyan do: Yahan humne pehle raste ka naam diya ('/profile'), 
// uske baad 'protect' (Bouncer) ko khada kiya, aur sabse aakhir mein room ('getUserProfile') ka naam likha!
router.get('/profile', protect, getUserProfile);

module.exports = router;
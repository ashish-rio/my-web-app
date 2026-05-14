const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  getRoomMessages,
  deleteMessage,
  getActiveRooms
} = require('../controllers/chatController')

// ─────────────────────────────────────────
// ROOM KE MESSAGES FETCH KARO
// GET /api/chat/messages?lat=25.5&lng=85.1&page=1&limit=50
// ─────────────────────────────────────────
router.get('/messages', protect, getRoomMessages)

// ─────────────────────────────────────────
// ACTIVE ROOMS FETCH KARO
// GET /api/chat/rooms
// ─────────────────────────────────────────
router.get('/rooms', protect, getActiveRooms)

// ─────────────────────────────────────────
// MESSAGE DELETE KARO
// DELETE /api/chat/messages/:id
// ─────────────────────────────────────────
router.delete('/messages/:id', protect, deleteMessage)

module.exports = router
const Message = require('../models/Message')
const User = require('../models/User')

// ─────────────────────────────────────────
// ROOM CODE BANAO LOCATION SE
// Har 10km ka ek alag room hoga
// ─────────────────────────────────────────
const getRoomCode = (lat, lng) => {
  const latRound = Math.floor(parseFloat(lat) * 10) / 10
  const lngRound = Math.floor(parseFloat(lng) * 10) / 10
  return `room_${latRound}_${lngRound}`
}

// ─────────────────────────────────────────
// ROOM KE PURANE MESSAGES FETCH KARO
// Pagination ke saath
// ─────────────────────────────────────────
const getRoomMessages = async (req, res) => {
  try {
    const { lat, lng, page = 1, limit = 50 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat aur lng do' })
    }

    const roomCode = getRoomCode(lat, lng)
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const messages = await Message.find({ roomCode })
      .populate('sender', 'name area')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Message.countDocuments({ roomCode })
    const totalPages = Math.ceil(total / parseInt(limit))

    res.json({
      roomCode,
      total,
      page: parseInt(page),
      totalPages,
      hasMore: parseInt(page) < totalPages,
      messages: messages.reverse()
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────
// MESSAGE SAVE KARO DATABASE MEIN
// Socket.io se call hoga
// ─────────────────────────────────────────
const saveMessage = async (senderId, content, roomCode, coordinates) => {
  try {
    const message = await Message.create({
      sender: senderId,
      content,
      roomCode,
      location: {
        type: 'Point',
        coordinates
      }
    })

    const populated = await Message.findById(message._id)
      .populate('sender', 'name area')

    return populated

  } catch (error) {
    console.error('Message save error:', error.message)
    return null
  }
}

// ─────────────────────────────────────────
// MESSAGE DELETE KARO
// Sirf apna message delete kar sakte ho
// ─────────────────────────────────────────
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Message nahi mila' })
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Sirf apna message delete kar sakte ho' })
    }

    await message.deleteOne()

    res.json({ message: 'Message delete ho gaya' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────
// ACTIVE ROOMS FETCH KARO
// Last 24 ghante mein active rooms
// ─────────────────────────────────────────
const getActiveRooms = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const rooms = await Message.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$roomCode',
          messageCount: { $sum: 1 },
          lastMessage: { $last: '$content' },
          lastActivity: { $last: '$createdAt' }
        }
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 20 }
    ])

    res.json({ rooms })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getRoomCode,
  getRoomMessages,
  saveMessage,
  deleteMessage,
  getActiveRooms
}
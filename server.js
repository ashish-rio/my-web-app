const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/db')
const { getRoomCode, saveMessage } = require('./controllers/chatController')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

dotenv.config()
connectDB()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/posts', require('./routes/postRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))

// ─────────────────────────────────────────
// HOME ROUTE
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'LocalPulse API chal raha hai!' })
})

// ─────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Yeh route exist nahi karta' })
})

// ─────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Server mein kuch gadbad hui' })
})

// ─────────────────────────────────────────
// SOCKET.IO — REAL TIME CHAT
// ─────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Token nahi hai'))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return next(new Error('User nahi mila'))
    }
    socket.user = user
    next()
  } catch (error) {
    next(new Error('Token invalid hai'))
  }
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name}`)

  // Room join karo
  socket.on('joinRoom', ({ lat, lng }) => {
    const roomCode = getRoomCode(lat, lng)
    socket.join(roomCode)
    socket.roomCode = roomCode
    socket.lat = lat
    socket.lng = lng
    console.log(`${socket.user.name} joined room: ${roomCode}`)

    // Room mein batao koi aaya
    socket.to(roomCode).emit('userJoined', {
      message: `${socket.user.name} area mein aa gaya`,
      time: new Date().toISOString()
    })
  })

  // Message bhejo
  socket.on('sendMessage', async ({ content }) => {
    if (!content || !content.trim()) return

    const roomCode = socket.roomCode
    if (!roomCode) {
      socket.emit('error', { message: 'Pehle room join karo' })
      return
    }

    // Database mein save karo
    const savedMessage = await saveMessage(
      socket.user._id,
      content.trim(),
      roomCode,
      [socket.lng, socket.lat]
    )

   if (savedMessage) {
      // Poore room mein bhejo
      io.to(roomCode).emit('newMessage', {
        _id: savedMessage._id,
        content: savedMessage.content,
        sender: {
          _id: savedMessage.sender._id,
          name: savedMessage.sender.name
        },
        roomCode,
        createdAt: savedMessage.createdAt
      })
    }
  })

  // Typing indicator
  socket.on('typing', () => {
    socket.to(socket.roomCode).emit('userTyping', {
      name: socket.user.name
    })
  })

  socket.on('stopTyping', () => {
    socket.to(socket.roomCode).emit('userStoppedTyping', {
      name: socket.user.name
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name}`)
    if (socket.roomCode) {
      socket.to(socket.roomCode).emit('userLeft', {
        message: `${socket.user.name} chala gaya`,
        time: new Date().toISOString()
      })
    }
  })
})

// ─────────────────────────────────────────
// SERVER START
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server ${PORT} pe chal raha hai`)
})
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  roomCode: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  }
}, { timestamps: true })

messageSchema.index({ location: '2dsphere' })
messageSchema.index({ roomCode: 1 })
messageSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)
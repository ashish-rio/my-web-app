const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['News', 'Event', 'Video'], 
        required: true,
        default: 'News'
    },
    eventDate: {
        type: Date
    },
    // Naye fields for Scalability
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'none'],
        default: 'none'
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, { 
    timestamps: true 
});

// Geospatial search ke liye index
postSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);
const Post = require('../models/Post');

// 1. Create Post (Ultra-Scalable Version - Direct Location Insert)
const createPost = async (req, res) => {
  try {
    const { title, content, type, eventDate, longitude, latitude } = req.body;

    // Strict Validation
    if (!longitude || !latitude) {
        return res.status(400).json({ success: false, message: 'Current location (longitude, latitude) dena zaroori hai!' });
    }

    let mediaUrl = null;
    let mediaType = 'none';

    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Direct Database Insert (Saves 1 DB Call)
    const post = await Post.create({
      title,
      content,
      type,
      eventDate,
      mediaUrl,
      mediaType,
      author: req.user.id,
      location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)] 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Post successfully create ho gayi!',
      post
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Nearby Posts ($geoNear)
const getNearbyPosts = async (req, res) => {
  try {
      const { lng, lat, radius } = req.query;
      
      if (!lng || !lat) {
          return res.status(400).json({ message: "Longitude aur latitude zaroori hai" });
      }

      // Radius in meters (default 5km)
      const maxDistance = radius ? parseInt(radius) * 1000 : 5000;

      const posts = await Post.find({
          location: {
              $near: {
                  $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                  $maxDistance: maxDistance
              }
          }
      }).populate('author', 'name profilePic');
      
      res.status(200).json({ total: posts.length, posts });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// 3. Get Post By ID
const getPostById = async (req, res) => {
  try {
      const post = await Post.findById(req.params.id).populate('author', 'name profilePic');
      if (!post) {
          return res.status(404).json({ message: 'Post nahi mili' });
      }
      res.status(200).json(post);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// 4. Delete Post
const deletePost = async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
          return res.status(404).json({ message: 'Post nahi mili' });
      }
      
      // Check if logged in user is the author
      if (post.author.toString() !== req.user.id) {
          return res.status(401).json({ message: 'Tum is post ko delete nahi kar sakte' });
      }
      
      await post.deleteOne();
      res.status(200).json({ message: 'Post delete ho gayi' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

// SABSE ZAROORI LINE (Isi ki wajah se crash hua tha)
module.exports = { createPost, getNearbyPosts, getPostById, deletePost };
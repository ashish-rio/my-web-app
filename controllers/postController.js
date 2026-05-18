const Post = require('../models/Post')
const User = require('../models/User')

const createPost = async (req, res) => {
  try {
    const { title, content, type, eventDate } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'Title aur content zaroori hai' })
    }
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User nahi mila' })
    }
    const post = await Post.create({
      title,
      content,
      type: type || 'general',
      eventDate: eventDate || null,
      author: user._id,
      location: user.location
    })
    const populatedPost = await Post.findById(post._id).populate('author', 'name area')
    res.status(201).json({ message: 'Post ban gayi!', post: populatedPost })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getNearbyPosts = async (req, res) => {
  try {
    const { lat, lng, radius = 10, type, page = 1, limit = 10, search } = req.query
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat aur lng do' })
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(radius) * 1000,
          spherical: true
        }
      }
    ]
    if (type && ['news', 'event', 'general'].includes(type)) {
      pipeline.push({ $match: { type } })
    }
    if (search && search.trim() !== '') {
      pipeline.push({ $match: { title: { $regex: search.trim(), $options: 'i' } } })
    }
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: parseInt(limit) })
    pipeline.push({ $sort: { createdAt: -1 } })
    const posts = await Post.aggregate(pipeline)
    await Post.populate(posts, { path: 'author', select: 'name area' })
    res.json({ total: posts.length, page: parseInt(page), posts })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name area')
    if (!post) {
      return res.status(404).json({ message: 'Post nahi mili' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post nahi mili' })
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Sirf apni post delete kar sakte ho' })
    }
    await post.deleteOne()
    res.json({ message: 'Post delete ho gayi' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updatePost = async (req, res) => {
  try {
    const { title, content, type, eventDate } = req.body
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post nahi mili' })
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Sirf apni post update kar sakte ho' })
    }
    post.title = title || post.title
    post.content = content || post.content
    post.type = type || post.type
    post.eventDate = eventDate || post.eventDate
    await post.save()
    res.json({ message: 'Post update ho gayi!', post })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createPost, getNearbyPosts, getPostById, deletePost, updatePost }
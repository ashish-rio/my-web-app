
const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {

  createPost,
  getNearbyPosts,
  getPostById,
  deletePost,
  updatePost
} = require('../controllers/postController')

router.get('/nearby', protect, getNearbyPosts)
router.get('/:id', protect, getPostById)
router.post('/', protect, createPost)
router.put('/:id', protect, updatePost)
router.delete('/:id', protect, deletePost)

module.exports = router

 
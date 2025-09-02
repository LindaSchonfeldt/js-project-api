import express from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { getLikedThoughts } from '../controllers/thoughtsController.js'
import { loginUser, registerUser } from '../controllers/userController.js'
import {
  createThought,
  deleteThought,
  updateThought
} from '../controllers/thoughtsController.js'

const router = express.Router()

// Auth routes (no authentication required)
router.post('/login', loginUser)
router.post('/signup', registerUser)

// User's liked thoughts (authentication required)
router.get('/liked-thoughts', authenticateUser, getLikedThoughts)

// Thoughts routes under /users/thoughts (authentication required)
router.post('/thoughts', authenticateUser, createThought)
router.put('/:id', authenticateUser, updateThought)
router.delete('/:id', authenticateUser, deleteThought)

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint works' })
})

export default router

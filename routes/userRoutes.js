import express from 'express'

import {
  createThought,
  deleteThought,
  updateThought
} from '../controllers/thoughtsController.js'
import {
  loginUser,
  registerUser,
  getLikedThoughts
} from '../controllers/userController.js'
import { authenticateUser } from '../middleware/auth.js'

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

export default router

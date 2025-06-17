import express from 'express'

import {
  createThought,
  deleteThought,
  getAllThoughts,
  updateThought
} from '../controllers/thoughtsController.js'
import { authenticateUser, signin, signup } from '../middleware/auth.js'

const router = express.Router()

// Auth routes (no authentication required)
router.post('/signin', signin)
router.post('/signup', signup)

// Thoughts routes under /users/thoughts (authentication required)
router.get('/thoughts', authenticateUser, getAllThoughts)
router.post('/thoughts', authenticateUser, createThought)

router.put('/:id', authenticateUser, updateThought)
router.delete('/:id', authenticateUser, deleteThought)
// Note: The above routes assume that the authenticateUser middleware is defined
// and properly checks for user authentication before allowing access to the thought operations.

export default router

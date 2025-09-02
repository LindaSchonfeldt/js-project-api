/**
 * Thoughts Routes
 * Purpose: Defines Express routes for thoughts-related API endpoints.
 * Usage: Imported by server.js to handle thoughts requests.
 * Author: Linda Schonfeldt
 * Last Updated: September 2, 2025
 */

import express from 'express'

import * as thoughtController from '../controllers/thoughtsController.js'
import { authenticateUser, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', thoughtController.getAllThoughts)
router.get('/trending', thoughtController.getTrendingThoughts)
router.get('/tag/:tag', thoughtController.getThoughtsByTag)
router.get('/:id', thoughtController.getThoughtById)

// Mixed routes (optional authentication)
router.post('/', optionalAuth, thoughtController.createThought)
router.post('/:id/like', optionalAuth, thoughtController.likeThought)

// Protected routes
router.put('/:id', authenticateUser, thoughtController.updateThought)
router.delete('/:id', authenticateUser, thoughtController.deleteThought)

export default router

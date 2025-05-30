/**
 * THOUGHTS ROUTES
 *
 * URL Route Definitions for Happy Thoughts API
 *
 * This file defines all HTTP endpoints related to thoughts and maps them
 * to their corresponding controller methods. Acts as the entry point
 * for all thoughts-related API requests.
 *
 * Available Endpoints:
 * - GET    /thoughts           - Get paginated thoughts
 * - GET    /thoughts/trending  - Get thoughts sorted by popularity
 * - GET    /thoughts/tag/:tag  - Get thoughts filtered by tag
 * - GET    /thoughts/:id       - Get specific thought by ID
 * - POST   /thoughts           - Create new thought (auto-tagged)
 * - POST   /thoughts/:id/like  - Increment hearts count
 * - POST   /thoughts/auto-tag  - Auto-tag existing thoughts
 * - DELETE /thoughts/:id       - Delete thought by ID
 *
 * Architecture: HTTP Request → Routes → Controller
 *
 */

import express from 'express'
import * as thoughtsController from '../controllers/thoughtsController.js'

const router = express.Router()

router.get('/', thoughtsController.getAllThoughts)
router.get('/trending', thoughtsController.getTrendingThoughts)
router.get('/tag/:tag', thoughtsController.getThoughtsByTag)
router.get('/:id', thoughtsController.getThoughtById)
router.post('/', thoughtsController.createThought)
router.post('/:id/like', thoughtsController.likeThought)
router.post('/auto-tag', thoughtsController.autoTagThoughts)

export default router

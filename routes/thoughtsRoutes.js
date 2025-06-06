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
 * - PUT    /thoughts/:id       - Update an existing thought
 * - DELETE /thoughts/:id       - Remove a thought
 * - POST   /thoughts/:id/like  - Increment hearts count
 * - POST   /thoughts/auto-tag  - Auto-tag existing thoughts
 *
 * Architecture: HTTP Request → Routes → Controller
 *
 * @author Linda Schönfeldt
 * @created June 2025
 */

import express from 'express'

import * as thoughtsController from '../controllers/thoughtsController.js'

const router = express.Router()

router.get('/', thoughtsController.getAllThoughts)
router.post('/', thoughtsController.createThought)
router.get('/trending', thoughtsController.getTrendingThoughts)
router.get('/tag/:tag', thoughtsController.getThoughtsByTag)
router.post('/auto-tag', thoughtsController.autoTagThoughts)
router.get('/:id', thoughtsController.getThoughtById)
router.delete('/:id', thoughtsController.deleteThought)
router.post('/:id/like', thoughtsController.likeThought)
router.put('/:id', thoughtsController.updateThought)

export default router

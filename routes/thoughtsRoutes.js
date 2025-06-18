/**
 * THOUGHTS ROUTES
 *
 * URL Route Definitions for Happy Thoughts API
 *
 * This file defines all HTTP endpoints related to thoughts and maps them
 * to their corresponding controller methods. Acts as the entry point
 * for all thoughts-related API requests with comprehensive endpoint coverage.
 *
 * Available Endpoints:
 * - GET    /thoughts           - Get paginated thoughts with filtering options
 * - GET    /thoughts/trending  - Get thoughts sorted by popularity/hearts
 * - GET    /thoughts/tag/:tag  - Get thoughts filtered by specific tag
 * - GET    /thoughts/:id       - Get specific thought by unique ID
 * - POST   /thoughts           - Create new thought (auto-tagged)
 * - PUT    /thoughts/:id       - Update an existing thought
 * - DELETE /thoughts/:id       - Remove a thought permanently
 * - POST   /thoughts/:id/like  - Increment hearts count (social feature)
 * - POST   /thoughts/auto-tag  - Auto-tag existing thoughts in bulk
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions ← YOU ARE HERE
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage)
 * * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 * @updated June 2025
 */

const express = require('express')
const router = express.Router()
const thoughtController = require('../controllers/thoughtController')
const auth = require('../middleware/auth')

// Public routes
router.get('/', thoughtController.getAllThoughts)
router.get('/trending', thoughtController.getTrendingThoughts)
router.get('/tag/:tag', thoughtController.getThoughtsByTag)
router.get('/:id', thoughtController.getThoughtById)

// Mixed routes (optional authentication - allows both logged in and anonymous users)
router.post('/', optionalAuth, thoughtController.createThought)
router.post('/:id/like', optionalAuth, thoughtController.likeThought)

// Protected routes (authentication required)
router.put('/:id', auth, thoughtController.updateThought)
router.delete('/:id', auth, thoughtController.deleteThought)

module.exports = router

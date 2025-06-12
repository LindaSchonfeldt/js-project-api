/**
 * TAGS ROUTES
 *
 * Route definitions for tag-related endpoints in the Happy Thoughts API
 *
 * This module defines all routes related to tag management and operations.
 * Tags are automatically generated from thought content and provide
 * categorization and filtering capabilities.
 *
 * Available Endpoints:
 * - GET /tags - Retrieve all available tags with usage statistics
 * - DELETE /tags/:id - Remove a specific thought by ID (legacy endpoint)
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

import express from 'express'

import * as thoughtsController from '../controllers/thoughtsController.js'

const router = express.Router()

router.get('/', thoughtsController.getAllTags)
router.delete('/:id', thoughtsController.deleteThought)

export default router

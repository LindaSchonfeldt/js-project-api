/**
 * Tags Routes
 * Purpose: Defines Express routes for tags-related API endpoints.
 * Usage: Imported by server.js to handle tags requests.
 * Author: Linda Schonfeldt
 * Last Updated: June, 2025
 */

import express from 'express'

import * as thoughtsController from '../controllers/thoughtsController.js'

const router = express.Router()

router.get('/', thoughtsController.getAllTags)
router.delete('/:id', thoughtsController.deleteThought)

export default router

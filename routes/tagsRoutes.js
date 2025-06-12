import express from 'express'

import * as thoughtsController from '../controllers/thoughtsController.js'

const router = express.Router()

router.get('/', thoughtsController.getAllTags)
router.delete('/:id', thoughtsController.deleteThought)

export default router

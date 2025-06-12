/**
 * THOUGHTS CONTROLLER
 *
 * HTTP Request/Response Handler for Happy Thoughts API
 *
 * This controller handles all HTTP-related operations for thoughts endpoints,
 * including request parsing, response formatting, and error handling.
 *
 * Responsibilities:
 * - Parse HTTP requests (query params, body, headers)
 * - Validate request format and basic input
 * - Call appropriate service methods
 * - Format HTTP responses with proper status codes
 * - Handle and format errors consistently
 * - Manage HTTP-specific concerns (caching, CORS, etc.)
 *
 * Architecture: Routes → Controller → Service
 *
 */
/**
 * Available Endpoints:
 * - GET    /thoughts           - Get paginated thoughts (getAllThoughts)
 * - GET    /thoughts/:id       - Get specific thought (getThoughtById)
 * - POST   /thoughts           - Create new thought (createThought)
 * - POST   /thoughts/:id/like  - Increment hearts count (likeThought)
 * - DELETE /thoughts/:id       - Remove thought (deleteThought)
 * - GET    /thoughts/trending  - Get popular thoughts (getTrendingThoughts)
 * - GET    /thoughts/tag/:tag  - Get thoughts by tag (getThoughtsByTag)
 * - GET    /tags               - Get all tags (getAllTags)
 * - POST   /thoughts/auto-tag  - Tag existing thoughts (autoTagThoughts)
 */
/**
 * Error Handling:
 * - 400 Bad Request - Invalid input format
 * - 404 Not Found - Resource doesn't exist
 * - 500 Server Error - Unexpected errors
 */

import * as thoughtsService from '../services/thoughtsService.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export const getAllThoughts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // Validate pagination parameters
    if (page < 1) {
      throw new ValidationError('Page must be at least 1')
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100')
    }

    // Use getPaginatedThoughts, not getAllThoughts
    const result = await thoughtsService.getPaginatedThoughts(page, limit)

    res.status(200).json({
      success: true,
      response: result,
      message: 'All thoughts were successfully fetched'
    })
  } catch (error) {
    next(error)
  }
}

export const getThoughtById = async (req, res, next) => {
  const { id } = req.params
  try {
    const thought = await thoughtsService.getThoughtById(id)
    if (!thought) {
      throw new NotFoundError('Thought not found')
    }
    res.status(200).json({
      success: true,
      response: thought,
      message: 'Thought was successfully fetched'
    })
  } catch (error) {
    next(error)
  }
}

// Example for createThought with validation
export const createThought = async (req, res, next) => {
  try {
    const { message } = req.body

    // Validation
    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required and must be a string')
    }

    if (message.length < 5 || message.length > 140) {
      throw new ValidationError(
        'Message must be between 5 and 140 characters',
        {
          field: 'message',
          current: message.length,
          min: 5,
          max: 140
        }
      )
    }

    const newThought = await thoughtsService.createThought(message)
    res.status(201).json({
      success: true,
      response: newThought,
      message: 'Thought was successfully created'
    })
  } catch (error) {
    next(error)
  }
}

export const likeThought = async (req, res, next) => {
  const { id } = req.params
  try {
    const thought = await thoughtsService.likeThought(id)

    if (!thought) {
      throw new NotFoundError('Thought')
    }

    res.status(200).json({
      success: true,
      response: thought,
      message: 'Thought was successfully liked'
    })
  } catch (error) {
    next(error) // Let the error middleware handle it
  }
}

export const updateThought = async (req, res, next) => {
  // Add next parameter
  try {
    const { message } = req.body
    const { id } = req.params

    // Validation is correct
    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required and must be a string')
    }

    if (message.length < 5 || message.length > 140) {
      throw new ValidationError(
        'Message must be between 5 and 140 characters',
        {
          field: 'message',
          current: message.length,
          min: 5,
          max: 140
        }
      )
    }

    const updatedThought = await thoughtsService.updateThought(id, message)

    if (!updatedThought) {
      throw new NotFoundError('Thought')
    }

    res.status(200).json({
      success: true,
      response: updatedThought,
      message: 'Thought was successfully updated'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteThought = async (req, res, next) => {
  const { id } = req.params
  console.log('DELETE request for ID:', id)

  try {
    const thought = await thoughtsService.deleteThought(id)
    console.log('Delete result:', thought)

    if (!thought) {
      console.log('Thought not found')
      throw new NotFoundError('Thought')
    }

    res.status(200).json({
      success: true,
      response: thought,
      message: 'Thought was successfully deleted'
    })
  } catch (error) {
    console.error('Delete error:', error)
    next(error)
  }
}

export const getTrendingThoughts = async (req, res, next) => {
  try {
    const trendingThoughts = await thoughtsService.getTrendingThoughts()

    res.status(200).json({
      success: true,
      response: trendingThoughts,
      message: 'Trending thoughts were successfully fetched'
    })
  } catch (error) {
    next(error)
  }
}

export const getThoughtsByTag = async (req, res, next) => {
  try {
    // Validate tag parameter
    if (!req.params.tag) {
      throw new ValidationError('Tag parameter is required')
    }

    const tag = req.params.tag.toLowerCase()
    const thoughts = await thoughtsService.getThoughtsByTag(tag)

    res.status(200).json({
      success: true,
      response: thoughts,
      message: `Thoughts with tag "${tag}" were successfully fetched`
    })
  } catch (error) {
    next(error)
  }
}

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await thoughtsService.getAllTags()

    res.status(200).json({
      success: true,
      response: tags,
      message: 'Tags were successfully fetched'
    })
  } catch (error) {
    next(error)
  }
}

export const autoTagThoughts = async (req, res, next) => {
  try {
    const updatedCount = await thoughtsService.updateExistingThoughtsWithTags()

    res.status(200).json({
      success: true,
      response: { updatedCount },
      message: `Successfully auto-tagged ${updatedCount} thoughts`
    })
  } catch (error) {
    next(error)
  }
}

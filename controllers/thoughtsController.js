/**
 * THOUGHTS CONTROLLER
 *
 * HTTP Request/Response Handler for Happy Thoughts API
 *
 * This controller handles all HTTP-related operations for thoughts endpoints,
 * including request parsing, response formatting, and comprehensive error handling.
 * Acts as the bridge between HTTP requests and business logic services.
 *
 * Responsibilities:
 * - Parse and validate HTTP requests (query params, body, headers)
 * - Validate request format and perform basic input sanitization
 * - Call appropriate service methods for business logic
 * - Format HTTP responses with proper status codes and structure
 * - Handle and format errors consistently across all endpoints
 * - Manage HTTP-specific concerns (caching, CORS, pagination)
 * - Implement request logging and performance monitoring
 *
 * Available Endpoints:
 * - GET    /thoughts           - Get paginated thoughts with filtering options
 * - GET    /thoughts/:id       - Get specific thought by unique ID
 * - POST   /thoughts           - Create new thought with auto-tagging
 * - POST   /thoughts/:id/like  - Increment hearts count (social feature)
 * - DELETE /thoughts/:id       - Remove thought permanently
 * - GET    /thoughts/trending  - Get popular thoughts sorted by hearts
 * - GET    /thoughts/tag/:tag  - Get thoughts filtered by specific tag
 * - GET    /tags               - Get all available tags with usage stats
 * - POST   /thoughts/auto-tag  - Bulk auto-tag existing thoughts
 *
 * Error Handling:
 * - 400 Bad Request - Invalid input format or validation failures
 * - 404 Not Found - Resource doesn't exist or invalid ID
 * - 500 Server Error - Unexpected errors and system failures
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling ← YOU ARE HERE
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage)
 * * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 * @updated June 2025
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

    // Create thought (with or without user)
    const newThought = await thoughtsService.createThought(message, req.user)

    res.status(201).json({
      success: true,
      response: newThought,
      message: req.isAuthenticated
        ? 'Thought was successfully created'
        : 'Anonymous thought was successfully created'
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
  try {
    const { message } = req.body
    const { id } = req.params

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

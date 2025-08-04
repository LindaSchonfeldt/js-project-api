import Thought from '../models/Thought.js'
import { ThoughtsModel } from '../models/thoughtsModel.js'
import * as thoughtsService from '../services/thoughtsService.js'
import {
  AuthorizationError,
  NotFoundError,
  ValidationError
} from '../utils/errors.js'

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

export const getAllThoughts = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10

  try {
    const { thoughts, totalPages } = await thoughtsService.getPaginatedThoughts(
      page,
      limit
    )
    const tagger = new ThoughtsModel(false)

    const payload = thoughts.map((doc) => {
      const t = doc.toObject()

      if (!t.themeTags?.length) {
        t.themeTags = t.tags?.length
          ? [...t.tags]
          : tagger.identifyTags(t.message)
      }

      t.userId = t.user?.toString() || null // Remove ._id
      t.username = t.user?.username || null
      delete t.user

      return t
    })

    return res.status(200).json({
      success: true,
      response: {
        thoughts: payload,
        pagination: { current: page, pages: totalPages }
      },
      message: 'All thoughts were successfully fetched'
    })
  } catch (err) {
    next(err)
  }
}

export const getThoughtById = async (req, res, next) => {
  try {
    const thought = await thoughtsService.getThoughtById(req.params.id)
    if (!thought) throw new Error('Not Found')

    const plain = thought.toObject ? thought.toObject() : thought
    if (!plain.themeTags?.length) {
      plain.themeTags = plain.tags?.length
        ? [...plain.tags]
        : new ThoughtsModel(false).identifyTags(plain.message)
    }

    plain.userId = plain.user?.toString() || null
    plain.username = plain.user?.username || null
    delete plain.user

    return res.status(200).json({
      success: true,
      response: plain,
      message: 'Thought was successfully fetched'
    })
  } catch (err) {
    next(err)
  }
}

export const createThought = async (req, res, next) => {
  try {
    const { message } = req.body
    const { userId, username } = req.user || {}

    console.log('Create request - User ID:', userId, 'Username:', username)

    const fileModel = new ThoughtsModel(false)
    const generatedTags = fileModel.identifyTags(message)

    const thoughtData = {
      message: message.trim(),
      hearts: 0,
      likes: [],
      tags: generatedTags,
      themeTags: generatedTags,
      ...(userId ? { user: userId } : {})
    }

    const created = await Thought.create(thoughtData)
    const plain = created.toObject()

    // flatten into strings for the frontend
    plain.userId = plain.user?.toString() || null
    plain.username = username || null
    delete plain.user

    return res.status(201).json({
      success: true,
      response: plain,
      message: 'Thought created successfully'
    })
  } catch (err) {
    next(err)
  }
}

export const likeThought = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.isAuthenticated ? req.user.id : null

    const thought = await Thought.findById(id)
    if (!thought) {
      throw new NotFoundError('Thought not found')
    }

    // For authenticated users: track specific users
    if (userId) {
      // Check if user already liked this thought
      const alreadyLiked = thought.likes.some((id) => id.toString() === userId)

      if (alreadyLiked) {
        // Unlike: remove user from likes array
        thought.likes = thought.likes.filter((id) => id.toString() !== userId)
      } else {
        // Like: add user to likes array
        thought.likes.push(userId)
      }

      // Update hearts count to match likes array length
      thought.hearts = thought.likes.length
    } else {
      // For anonymous users: just increment counter
      thought.hearts += 1
    }

    await thought.save()

    res.json({
      success: true,
      data: thought
    })
  } catch (error) {
    next(error)
  }
}

export const updateThought = async (req, res, next) => {
  try {
    const { id } = req.params
    const { message, tags, preserveTags } = req.body
    const userId = req.user?.userId

    console.log('Update request - User ID:', userId, 'Thought ID:', id)

    if (!message || message.trim().length < 5) {
      throw new ValidationError('Message is too short (min 5 characters)')
    }

    const updated = await thoughtsService.updateThought(
      id,
      { message, tags, preserveTags },
      userId
    )

    return res.json({
      success: true,
      response: updated,
      message: 'Thought was successfully updated'
    })
  } catch (err) {
    next(err)
  }
}

export const deleteThought = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user ? req.user.userId : null

    console.log('Delete request - User ID:', userId, 'Thought ID:', id)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to delete thoughts'
      })
    }

    // Call the service method
    await thoughtsService.deleteThought(id, userId)

    return res.status(200).json({
      success: true,
      message: 'Thought deleted successfully'
    })
  } catch (error) {
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

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

import * as thoughtsService from '../services/thoughtsService.js'

export const getAllThoughts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const result = await thoughtsService.getPaginatedThoughts(page, limit)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thoughts' })
  }
}

export const getThoughtById = async (req, res) => {
  try {
    const thought = await thoughtsService.getThoughtById(req.params.id)
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: 'Thought not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thought' })
  }
}

export const createThought = async (req, res) => {
  try {
    const { message } = req.body

    // Validation
    if (
      !message ||
      typeof message !== 'string' ||
      message.length < 5 ||
      message.length > 140
    ) {
      return res.status(400).json({ error: 'Invalid message format' })
    }

    const newThought = await thoughtsService.createThought(message)
    res.status(201).json(newThought)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create thought' })
  }
}

export const likeThought = async (req, res) => {
  try {
    const thought = await thoughtsService.likeThought(req.params.id)
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: 'Thought not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to like thought' })
  }
}

export const deleteThought = async (req, res) => {
  try {
    const thought = await thoughtsService.deleteThought(req.params.id)
    if (thought) {
      res.json(thought)
    } else {
      res.status(404).json({ error: 'Thought not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete thought' })
  }
}

export const getTrendingThoughts = async (req, res) => {
  try {
    const trendingThoughts = await thoughtsService.getTrendingThoughts()
    res.json(trendingThoughts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending thoughts' })
  }
}

export const getThoughtsByTag = async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase()
    const thoughts = await thoughtsService.getThoughtsByTag(tag)
    res.json(thoughts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thoughts by tag' })
  }
}

export const getAllTags = async (req, res) => {
  try {
    const tags = await thoughtsService.getAllTags()
    res.json(tags)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
}

export const autoTagThoughts = async (req, res) => {
  try {
    const updatedCount = await thoughtsService.updateExistingThoughtsWithTags()
    res.json({
      message: `Auto-generated tags for ${updatedCount} thoughts`,
      updatedCount: updatedCount
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to auto-tag thoughts' })
  }
}

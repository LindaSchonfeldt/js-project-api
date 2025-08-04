/**
 * THOUGHTS SERVICE
 *
 * Business Logic Layer for Happy Thoughts API
 *
 * This service layer acts as an intermediary between controllers and models,
 * handling business logic, data validation, and orchestrating complex operations.
 * Implements the business rules and workflows for thought management.
 *
 * Responsibilities:
 * - Implement business rules and complex workflows
 * - Coordinate between multiple models when needed
 * - Transform data for specific business requirements
 * - Handle advanced validation logic beyond basic model validation
 * - Manage external API integrations (future extensibility)
 * - Orchestrate multi-step operations and transactions
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration ← YOU ARE HERE
 * - Models: Data access (supports both file and MongoDB storage)
 * * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 * @updated June 2025
 */
import mongoose from 'mongoose'

import Thought from '../models/Thought.js'
import { ThoughtsModel } from '../models/thoughtsModel.js'
import { AuthorizationError, NotFoundError } from '../utils/errors.js'

// Choose storage type based on environment
const useDatabase = process.env.USE_DATABASE === 'true' || false
const thoughtsModel = new ThoughtsModel(useDatabase)

// Create an instance for tag identification
const fileThoughtsModel = new ThoughtsModel(false)

export const getPaginatedThoughts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  const thoughts = await Thought.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username') // ← populate the username

  const total = await Thought.countDocuments()
  return {
    thoughts,
    totalPages: Math.ceil(total / limit)
  }
}

export const createThought = async (message, user = null) => {
  const tags = thoughtsModel.identifyTags(message) // Tags are generated!

  const thoughtData = {
    message: message.trim(),
    tags // Tags are included in the data
  }

  // Add user info if authenticated
  if (user) {
    thoughtData.user = user._id
    thoughtData.isAnonymous = false
  } else {
    thoughtData.isAnonymous = true
  }

  const thought = new Thought(thoughtData)
  return await thought.save()
}

export const getThoughtById = async (id) => {
  return await Thought.findById(id)
}

export const likeThought = async (id) => {
  return await Thought.findByIdAndUpdate(
    id,
    { $inc: { hearts: 1 } },
    { new: true }
  )
}

export const updateThought = async (id, updateData, userId) => {
  try {
    const { message, tags, preserveTags } = updateData

    // Find the thought first
    const thought = await Thought.findById(id)
    if (!thought) {
      throw new NotFoundError('Thought not found')
    }

    // Authorization check
    if (thought.user && userId && thought.user.toString() !== userId) {
      throw new AuthorizationError('You can only update your own thoughts')
    }

    // Prepare update data
    const updatedTags = preserveTags ? thought.tags : tags || []

    // Update with findByIdAndUpdate
    const updated = await Thought.findByIdAndUpdate(
      id,
      {
        message: message.trim(),
        tags: updatedTags
        // Don't update other fields like hearts, user, etc.
      },
      { new: true } // Return updated document
    )

    return updated
  } catch (error) {
    console.error('Error updating thought:', error)
    throw error
  }
}

export const deleteThought = async (id, userId) => {
  console.log('Service deleteThought called with:', { id, userId })

  const thought = await Thought.findById(id)
  console.log('Found thought:', {
    id: thought._id,
    user: thought.user,
    userString: thought.user?.toString()
  })

  if (!thought) {
    throw new NotFoundError('Thought not found')
  }

  // Debug the comparison
  console.log('Comparing:', {
    thoughtUser: thought.user?.toString(),
    requestUserId: userId,
    areEqual: thought.user?.toString() === userId
  })

  if (!thought.user || thought.user.toString() !== userId) {
    throw new AuthorizationError('You can only delete your own thoughts')
  }

  return await Thought.findByIdAndDelete(id)
}

export const getTrendingThoughts = async () => {
  return thoughtsModel.getTrendingThoughts()
}

export const getThoughtsByTag = async (tag) => {
  return thoughtsModel.getThoughtsByTag(tag)
}

export const getAllTags = async () => {
  return thoughtsModel.getAllTags()
}

export const updateExistingThoughtsWithTags = async () => {
  return thoughtsModel.updateExistingThoughtsWithTags()
}

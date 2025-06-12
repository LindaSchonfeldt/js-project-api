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

// Choose storage type based on environment
const useDatabase = process.env.USE_DATABASE === 'true' || false
const thoughtsModel = new ThoughtsModel(useDatabase)

// Create a thoughts model instance for file-based operations
const fileThoughtsModel = new ThoughtsModel(false)

export const getPaginatedThoughts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const thoughts = await Thought.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Thought.countDocuments()

  return {
    thoughts,
    pagination: {
      current: page,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}

export const createThought = async (message) => {
  // Use Mongoose directly, not the wrapper
  const thought = new Thought({ message })
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

export const updateThought = async (id, message) => {
  return thoughtsModel.updateThought(id, message)
}

export const deleteThought = async (id) => {
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

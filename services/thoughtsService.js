/**
 * THOUGHTS SERVICE
 *
 * Business Logic Layer for Happy Thoughts API
 *
 * This service layer acts as an intermediary between controllers and models,
 * handling business logic, data validation, and orchestrating operations.
 *
 * Responsibilities:
 * - Implement business rules and workflows
 * - Coordinate between multiple models if needed
 * - Transform data for business requirements
 * - Handle complex validation logic
 * - Manage external API integrations (future)
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage)
 *
 */

import { ThoughtsModel } from '../models/thoughtsModel.js'

// Choose storage type based on environment
const useDatabase = process.env.USE_DATABASE === 'true' || false
const thoughtsModel = new ThoughtsModel(useDatabase)

export const createThought = async (message) => {
  return thoughtsModel.createThought(message)
}

export const getThoughtById = async (id) => {
  return thoughtsModel.getThoughtById(id)
}

export const likeThought = async (id) => {
  return thoughtsModel.likeThought(id)
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

export const getPaginatedThoughts = async (page, limit) => {
  return thoughtsModel.getPaginatedThoughts(page, limit)
}

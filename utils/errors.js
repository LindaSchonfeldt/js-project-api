/**
 * CUSTOM ERROR CLASSES
 *
 * Specialized error types and utilities for the Happy Thoughts API
 *
 * These custom error classes help standardize error handling across the application,
 * enable cleaner controller code with better error information, and provide
 * consistent API responses for different error scenarios.
 *
 * Error Types:
 * - ApiError: Base error class with HTTP status codes
 * - NotFoundError: For missing resources (404)
 * - ValidationError: For input validation failures (400)
 * - DatabaseError: For database operation failures (500)
 * - AuthenticationError: For authentication failures (401)
 *
 * Features:
 * - Consistent error response formatting
 * - HTTP status code integration
 * - Public vs internal error message separation
 * - JSON serialization support
 * - Error logging and debugging information
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage)
 * - Utils: Shared utilities and error handling ← YOU ARE HERE
 *  * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 * @updated June 2025
 */

export class ApiError extends Error {
  constructor(
    message,
    statusCode = 500,
    publicMessage = 'An unexpected error occurred'
  ) {
    super(message)
    this.statusCode = statusCode
    this.publicMessage = publicMessage
    this.name = this.constructor.name
  }

  toJSON() {
    return {
      success: false,
      message: this.publicMessage,
      error: this.message
    }
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(
      `${resource} not found`,
      404,
      `The requested ${resource.toLowerCase()} could not be found`
    )
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details = {}) {
    super(`Validation error: ${message}`, 400, message)
    this.details = details
  }

  toJSON() {
    return {
      success: false,
      message: this.publicMessage,
      error: this.message,
      details: this.details
    }
  }
}

export class DatabaseError extends ApiError {
  constructor(operation = 'database operation', details = null) {
    super(
      `Database error during ${operation}`,
      500,
      `Something went wrong with our database`
    )
    this.details = details
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(`Authentication error: ${message}`, 401, message)
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(`Authorization error: ${message}`, 403, message)
  }
}

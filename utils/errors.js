/**
 * Error Utilities
 * Purpose: Defines custom error classes and helpers for error handling.
 * Usage: Imported by controllers/services for consistent error management.
 * Author: Linda Schonfeldt
 * Last Updated: September 2, 2025
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

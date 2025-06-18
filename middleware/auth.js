import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/errors.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * Authentication middleware - requires valid token
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        401,
        'Authentication required',
        'Please login to access this resource'
      )
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token', 'Please login again')
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Optional authentication middleware - allows both authenticated and anonymous users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.isAuthenticated = false
      req.user = null
      return next()
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
      req.isAuthenticated = true
    } catch (error) {
      req.isAuthenticated = false
      req.user = null
    }

    next()
  } catch (error) {
    next(error)
  }
}

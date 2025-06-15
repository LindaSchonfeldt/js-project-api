import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      // No token provided - allow anonymous access
      req.user = null
      req.isAuthenticated = false
      return next()
    }

    // Token provided - try to authenticate
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      // Invalid token - still allow anonymous access
      req.user = null
      req.isAuthenticated = false
      return next()
    }

    // Valid token - user is authenticated
    req.user = user
    req.isAuthenticated = true
    next()
  } catch (error) {
    // Token verification failed - allow anonymous access
    req.user = null
    req.isAuthenticated = false
    next()
  }
}

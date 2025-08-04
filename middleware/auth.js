import jwt from 'jsonwebtoken'

import { ApiError } from '../utils/errors.js'

const JWT_SECRET = process.env.JWT_SECRET

/**
 * Authentication middleware - requires valid token
 */
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'))
  }

  const token = authHeader.slice(7) // drop "Bearer "
  try {
    const { userId, username } = jwt.verify(token, JWT_SECRET)
    req.user = { userId, username }
    return next()
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'))
  }
}

/**
 * Optional authentication middleware - allows both authenticated and anonymous users
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    req.isAuthenticated = false
    req.user = null
    return next()
  }

  try {
    const { userId, username } = jwt.verify(authHeader.slice(7), JWT_SECRET)
    req.isAuthenticated = true
    req.user = { id: userId, username }
  } catch {
    req.isAuthenticated = false
    req.user = null
  }
  return next()
}

/**
 * Token authentication middleware - verifies token and attaches user to request
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401)
  }

  const token = authHeader.slice(7) // drop "Bearer "
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)

    console.log('JWT decoded user:', user)
    req.user = user
    next()
  })
}

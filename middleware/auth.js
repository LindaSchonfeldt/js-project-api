import jwt from 'jsonwebtoken'

import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }
}

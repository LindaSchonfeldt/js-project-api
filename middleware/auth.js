import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import { ApiError } from '../utils/errors'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required')
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Attach user info to request
    req.user = decoded // Should include user ID

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'))
    }
    next(error)
  }
}

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hashedPassword })
    await user.save()

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '24h'
    })

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

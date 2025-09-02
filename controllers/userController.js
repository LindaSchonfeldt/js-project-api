import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import Thought from '../models/Thought.js'
import User from '../models/User.js'
import { ValidationError } from '../utils/errors.js'

const JWT_SECRET = process.env.JWT_SECRET

export const registerUser = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // Validation
    if (!username || !password) {
      throw new ValidationError('Username and password are required')
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long')
    }

    if (username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters long')
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      throw new ValidationError('Username already exists')
    }

    // Create new user
    const user = new User({ username, password })
    await user.save()

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      success: true,
      response: {
        user: { id: user._id.toString(), username: user.username },
        token
      },
      message: 'User registered successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      throw new ValidationError('Username and password are required')
    }

    // Find user by username
    const user = await User.findOne({ username })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        username: user.username
      },
      message: 'Login successful'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get thoughts liked by the current user
 * @route GET /users/liked-thoughts
 * @access Private
 */
export const getLikedThoughts = async (req, res, next) => {
  try {
    const userId = req.user?.userId
    console.log('GET LIKED THOUGHTS REQUEST:', { userId })

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Option 1: Try this simpler query first
    const objectId = new mongoose.Types.ObjectId(userId)
    let likedThoughts = await Thought.find({ likes: objectId }).sort({
      createdAt: -1
    })

    // If that didn't work, try a more flexible query
    if (likedThoughts.length === 0) {
      likedThoughts = await Thought.find({
        likes: { $in: [userId, objectId] }
      }).sort({ createdAt: -1 })

      console.log(
        `Found ${likedThoughts.length} liked thoughts with flexible query`
      )
    }

    console.log(
      `Found ${likedThoughts.length} liked thoughts for user ${userId}`
    )

    return res.json({
      success: true,
      response: likedThoughts,
      message: ''
    })
  } catch (err) {
    console.error('ERROR in getLikedThoughts:', err)
    return next(err)
  }
}

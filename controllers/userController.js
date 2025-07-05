import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import Thought from '../models/Thought.js'
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
    const userId = req.user.id

    // Find thoughts that include this user's ID in their likes array
    const likedThoughts = await Thought.find({ likes: userId }).sort({
      createdAt: -1
    })

    res.json({
      success: true,
      data: likedThoughts,
      count: likedThoughts.length
    })
  } catch (error) {
    next(error)
  }
}

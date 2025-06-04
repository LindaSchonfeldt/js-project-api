/**
 * HAPPY THOUGHTS API SERVER
 *
 * Main Express.js server for the Happy Thoughts API
 *
 * A RESTful API for managing happy thoughts with automatic tagging,
 * pagination, and social features. Features intelligent content analysis
 * that automatically categorizes thoughts into relevant tags.
 *
 * Key Features:
 * - ✨ Automatic tag generation based on content analysis
 * - 📄 Pagination support for efficient data loading
 * - 💖 Social interactions with like/heart system
 * - 🏷️ Smart categorization into 10+ categories
 * - 📊 Trending system based on popularity
 * - 🔍 Tag-based filtering and search
 * - 💾 MongoDB integration for scalable data storage
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage)
 *
 * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 */

import dotenv from 'dotenv'

dotenv.config() // Load environment variables

import cors from 'cors'
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import thoughtsRoutes from './routes/thoughtsRoutes.js'
import tagsRoutes from './routes/tagsRoutes.js'
import mongoose from 'mongoose'
import Thought from './models/Thought.js'
import { ThoughtsModel } from './models/thoughtsModel.js'
import { ApiError } from './utils/errors.js'

// Defines the port the app will run on
const port = process.env.PORT || 8080
const app = express()

// Log environment
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)

// Middleware
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
// Create middleware for error handling
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ Error: 'Service Unavailable' })
  }
})

// Database connection - using env
const mongoURL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/happy-thoughts'
console.log(
  `Connecting to MongoDB: ${mongoURL.replace(/\/\/(.+)@/, '//***:***@')}`
) // Hide credentials in logs

// Connect to MongoDB
mongoose
  .connect(mongoURL)
  .then(async () => {
    console.log('Connected to MongoDB')

    // Check if database is empty
    const count = await Thought.countDocuments()

    // Auto-migrate if database is empty
    if (count === 0) {
      console.log('Empty database detected, migrating data from JSON...')

      try {
        // Load data from file
        const thoughtsModel = new ThoughtsModel(false)
        const thoughts = thoughtsModel.loadData()

        // Transform and enhance with tags
        const transformedThoughts = thoughts.map((thought) => {
          const { _id, ...thoughtData } = thought

          // Auto-generate tags if missing
          if (!thoughtData.tags || !thoughtData.tags.length) {
            thoughtData.tags = thoughtsModel.identifyTags(thoughtData.message)
          }

          return thoughtData
        })

        const result = await Thought.insertMany(transformedThoughts)
        console.log(
          `✅ Successfully imported ${result.length} thoughts to MongoDB`
        )
      } catch (error) {
        console.error('Migration failed:', error)
      }
    } else {
      console.log(`Database contains ${count} thoughts, skipping migration`)
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err))

// Routes
app.use('/thoughts', thoughtsRoutes)
app.use('/tags', tagsRoutes)

// API documentation
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: endpoints
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)

  if (err instanceof ApiError) {
    // Our custom API errors have status codes and formatted responses
    return res.status(err.statusCode).json({
      success: false,
      response: err.message,
      message: err.publicMessage
    })
  } else {
    // Unknown errors
    return res.status(500).json({
      success: false,
      response: process.env.NODE_ENV === 'production' ? null : err.message,
      message: 'An unexpected error occurred'
    })
  }
})

// 404 middleware for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested endpoint does not exist'
  })
})

// Start the server with error handling
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Try another port.`)
  } else {
    console.error('Server error:', error)
  }
})

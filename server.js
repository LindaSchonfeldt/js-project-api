import cors from 'cors'
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
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import mongoose from 'mongoose'
import morgan from 'morgan'

import Thought from './models/Thought.js'
import { ThoughtsModel } from './models/thoughtsModel.js'
import tagsRoutes from './routes/tagsRoutes.js'
import thoughtsRoutes from './routes/thoughtsRoutes.js'
import { ApiError } from './utils/errors.js'

dotenv.config() // Load environment variables

const mongoURL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/happy-thoughts'

// Defines the port the app will run on
const port = process.env.PORT || 8080
const app = express()

// Middleware
app.use(express.json()) // Parse JSON request bodies

app.use(
  cors({
    origin: [
      'https://creative-hotteok-2e5655.netlify.app',
      'http://localhost:3000' // Frontend running on port 3000
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Enable request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Create middleware for database state handling
app.use((req, res, next) => {
  // If MongoDB is connected, use it
  if (mongoose.connection.readyState === 1) {
    req.useDatabase = true
    next()
  }
  // If we're in production and MongoDB is down, return 503
  else if (process.env.NODE_ENV === 'production') {
    res.status(503).json({ Error: 'Service Unavailable' })
  }
  // In development, fall back to file storage
  else {
    console.log('MongoDB not connected, using file storage')
    req.useDatabase = false
    next()
  }
})

// Routes
app.use('/thoughts', thoughtsRoutes)
app.use('/tags', tagsRoutes)

// API documentation endpoint
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: endpoints
  })
})

// Error handling middleware (after routes, before server start)
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

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested endpoint does not exist'
  })
})

// THEN connect and start server
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

    // Start server last
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    // Still start server even if DB connection fails
    app.listen(port, () => {
      console.log(
        `Server running in file-based mode on http://localhost:${port}`
      )
    })
  })

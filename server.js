/**
 * Express Server Entry Point
 * Purpose: Initializes and configures the API server for Happy Thoughts.
 * Usage: Run with Node.js to start backend server.
 * Author: Linda Schonfeldt
 * Last Updated: September 2, 2025
 */

import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import mongoose from 'mongoose'
import morgan from 'morgan'

import Thought from './models/Thought.js'
import { ThoughtsModel } from './models/thoughtsModel.js'
import tagsRoutes from './routes/tagsRoutes.js'
import thoughtsRoutes from './routes/thoughtsRoutes.js'
import userRoutes from './routes/userRoutes.js'
// Note singular "user" not "users"
import { ApiError } from './utils/errors.js'

dotenv.config() // Load environment variables

const mongoURL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/happy-thoughts'

// Defines the port the app will run on
const port = process.env.PORT || 8080
const app = express()

// Middleware
app.use(express.json()) // Parse JSON request bodies

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://creative-hotteok-2e5655.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}

app.use(cors(corsOptions))
// Ensure preflight responses are handled
app.options('*', cors(corsOptions))

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
app.use('/users', userRoutes)

// API documentation endpoint
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    environment: process.env.NODE_ENV || 'development',
    endpoints: endpoints
  })
})

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping()

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date()
    })
  }
})

// Debugging middleware
app.use((req, res, next) => {
  console.log(`🔍 Unmatched request: ${req.method} ${req.url}`)
  next()
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

// Connect to MongoDB and start server
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
    const PORT = process.env.PORT || 8080

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`)
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

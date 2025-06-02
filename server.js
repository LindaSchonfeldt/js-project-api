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
 *
 * Architecture: MVC Pattern
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access and storage operations
 *
 */

import cors from 'cors'
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import thoughtsRoutes from './routes/thoughtsRoutes.js'
import tagsRoutes from './routes/tagsRoutes.js'
import mongoose from 'mongoose'

// Defines the port the app will run on
const port = process.env.PORT || 8080
const app = express()

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

// Database connection
const mongoURL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/happy-thoughts'
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// Routes
app.use('/thoughts', thoughtsRoutes)
app.use('/tags', tagsRoutes)

// API documentation
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    endpoints: endpoints
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

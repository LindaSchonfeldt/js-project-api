import cors from 'cors'
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import ThoughtsStore from './store/thoughtsStore.js'

// Initialize the store
const thoughtsStore = new ThoughtsStore()

// Defines the port the app will run on
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// API documentation
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    endpoints: endpoints
  })
})

// Return all messages
app.get('/thoughts', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10

  console.log('Page:', page)
  console.log('Limit:', limit)
  console.log('Query params:', req.query)

  const paginatedThoughts = thoughtsStore.getPaginatedThoughts(page, limit)

  console.log(
    'Returned thoughts count:',
    paginatedThoughts.thoughts
      ? paginatedThoughts.thoughts.length
      : paginatedThoughts.length
  )

  res.json(paginatedThoughts)
})

// Get messages sorted by hearts
app.get('/thoughts/trending', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10

  const allTrending = thoughtsStore.getTrendingThoughts()
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  res.json(allTrending.slice(startIndex, endIndex))
})

// Get a specific message
app.get('/thoughts/:id', (req, res) => {
  const message = thoughtsStore.getThoughtById(req.params.id)
  if (message) {
    res.json(message)
  } else {
    res.status(404).send({ error: 'Thought not found' })
  }
})

// Create a new message
app.post('/thoughts', (req, res) => {
  const { message } = req.body

  // Validation
  if (
    !message ||
    typeof message !== 'string' ||
    message.length < 5 ||
    message.length > 140
  ) {
    return res.status(400).send({
      error: 'Message must be a string between 5 and 140 characters long'
    })
  }

  const newMessage = thoughtsStore.addThought(message)
  res.status(201).json(newMessage)
})

// Get thoughts by tag
app.get('/thoughts/tag/:tag', (req, res) => {
  const tag = req.params.tag.toLowerCase()
  const thoughts = thoughtsStore.getThoughtsByTag(tag)
  res.json(thoughts)
})

// Get all available tags
app.get('/tags', (req, res) => {
  const tags = thoughtsStore.getAllTags()
  res.json(tags)
})
app.get('/thoughts/tags', (req, res) => {
  const tags = thoughtsStore.getAllTags()
  res.json(tags)
})

// Increment hearts count
app.post('/thoughts/:id/like', (req, res) => {
  const message = thoughtsStore.likeThought(req.params.id)
  if (message) {
    res.json(message)
  } else {
    res.status(404).send({ error: 'Thought not found' })
  }
})

// Auto-tag all existing thoughts
app.post('/thoughts/auto-tag', (req, res) => {
  const updatedCount = thoughtsStore.updateExistingThoughtsWithTags()
  res.json({
    message: `Auto-generated tags for ${updatedCount} thoughts`,
    updatedCount: updatedCount
  })
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

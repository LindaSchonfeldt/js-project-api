import cors from 'cors'
import express from 'express'
import listEndpoints from 'express-list-endpoints'
import fs from 'fs'

const thoughtsData = JSON.parse(fs.readFileSync('./data/thoughts.json', 'utf8'))

// Defines the port the app will run on. Defaults to 8080, but can be overridden
const port = process.env.PORT || 8080
const app = express()
let messages = thoughtsData

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Get API documentation
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app)
  res.send({
    message: 'Welcome to the Happy Thoughts API',
    endpoints: endpoints
  })
})

// Return all messages
app.get('/thoughts', (req, res) => {
  res.json(messages)
})

// Get messages sorted by hearts
app.get('/thoughts/trending', (req, res) => {
  const sortedMessages = [...messages].sort((a, b) => b.hearts - a.hearts)
  res.json(sortedMessages)
})

// Get a specific message
app.get('/thoughts/:id', (req, res) => {
  const id = req.params.id
  const message = messages.find((message) => message._id === id)
  if (message) {
    res.json(message)
  } else {
    res.status(404).send({ error: 'Thought not found' })
  }
})

// Create a new message
app.post('/thoughts', (req, res) => {})

// Increment hearts count
app.post('/thoughts/:id/like', (req, res) => {})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

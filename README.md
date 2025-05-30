# Happy Thoughts API

A RESTful API for managing happy thoughts with automatic tagging, pagination, and social features. Users can create, read, like, and categorize thoughts with intelligent auto-tagging based on content analysis.

## Features

- ✨ **Automatic Tag Generation** - AI-powered content analysis assigns relevant tags
- 📄 **Pagination Support** - Efficient data loading with customizable page sizes
- 💖 **Social Interactions** - Like/heart system for popular thoughts
- 🏷️ **Smart Categorization** - Automatic categorization into 10+ categories
- 📊 **Trending System** - Sort thoughts by popularity
- 🔍 **Tag-based Filtering** - Find thoughts by specific categories

## Getting Started

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

The API will be available at `http://localhost:8080`

## API Endpoints

### 📝 Thoughts

#### Get All Thoughts

```http
GET /thoughts?page=1&limit=10
```

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Number of thoughts per page (default: 10)

**Response:**

```json
{
  "thoughts": [
    {
      "_id": "unique-id",
      "message": "Learning to code is like solving puzzles every day",
      "tags": ["programming", "learning"],
      "hearts": 28,
      "createdAt": "2025-05-27T14:22:41.329Z",
      "__v": 0
    }
  ],
  "totalCount": 100,
  "currentPage": 1,
  "totalPages": 10,
  "next": { "page": 2, "limit": 10 },
  "previous": null
}
```

#### Get Single Thought

```http
GET /thoughts/:id
```

**Response:**

```json
{
  "_id": "unique-id",
  "message": "Sometimes the simplest solution is the best one ✨",
  "tags": ["programming", "emotions"],
  "hearts": 19,
  "createdAt": "2025-05-27T16:05:12.781Z",
  "__v": 0
}
```

#### Create New Thought

```http
POST /thoughts
```

**Request Body:**

```json
{
  "message": "Coffee is just bean soup ☕"
}
```

**Validation:**

- Message must be 5-140 characters
- Message must be a string
- Tags are automatically generated based on content

**Response:**

```json
{
  "_id": "new-unique-id",
  "message": "Coffee is just bean soup ☕",
  "tags": ["food"],
  "hearts": 0,
  "createdAt": "2025-05-28T08:12:33.456Z",
  "__v": 0
}
```

#### Get Trending Thoughts

```http
GET /thoughts/trending
```

Returns thoughts sorted by hearts count (most liked first).

#### Like a Thought

```http
POST /thoughts/:id/like
```

Increments the hearts count for a specific thought.

**Response:**

```json
{
  "_id": "unique-id",
  "message": "Updated thought",
  "tags": ["programming"],
  "hearts": 43,
  "createdAt": "2025-05-27T17:31:54.123Z",
  "__v": 0
}
```

### 🏷️ Tags & Categories

#### Get All Tags

```http
GET /tags
```

**Response:**

```json
{
  "tags": [
    "emotions",
    "entertainment",
    "food",
    "health",
    "home",
    "learning",
    "programming",
    "travel",
    "weather",
    "work"
  ]
}
```

#### Get Thoughts by Tag

```http
GET /thoughts/tag/:tag
```

**Example:**

```http
GET /thoughts/tag/programming
```

**Response:**

```json
{
  "thoughts": [
    {
      "_id": "unique-id",
      "message": "Debugging: being a detective in a crime scene where you're also the murderer 🕵️‍♀️",
      "tags": ["programming", "emotions"],
      "hearts": 42,
      "createdAt": "2025-05-27T17:31:54.123Z",
      "__v": 0
    }
  ]
}
```

### 🔧 Admin/Utility

#### Auto-tag Existing Thoughts

```http
POST /thoughts/auto-tag
```

Automatically generates tags for thoughts that don't have them yet.

**Response:**

```json
{
  "message": "Auto-generated tags for 20 thoughts",
  "updatedCount": 20
}
```

#### API Documentation

```http
GET /
```

Returns welcome message and list of available endpoints.

## Auto-Tagging System

The API automatically analyzes thought content and assigns relevant tags based on:

### 📚 Keyword Categories

| Category          | Keywords                                                    |
| ----------------- | ----------------------------------------------------------- |
| **food**          | food, eat, cook, pizza, coffee, chocolate, restaurant, etc. |
| **programming**   | code, debug, javascript, react, api, algorithm, etc.        |
| **work**          | job, office, meeting, deadline, project, boss, etc.         |
| **home**          | house, family, clean, garden, pet, parents, etc.            |
| **health**        | exercise, workout, gym, sleep, medicine, doctor, etc.       |
| **emotions**      | happy, sad, love, excited, stressed, grateful, etc.         |
| **weather**       | sunny, rain, snow, storm, temperature, etc.                 |
| **travel**        | vacation, trip, flight, hotel, beach, passport, etc.        |
| **entertainment** | movie, music, book, game, concert, party, etc.              |
| **learning**      | study, school, course, teacher, education, etc.             |

### 😊 Emoji Recognition

The system also recognizes emojis and assigns appropriate tags:

- 🍕🍰☕ → `food`
- 😄😢😍 → `emotions`
- 💼📊💻 → `work`
- 🏠🌱 → `home`

### 🎯 Smart Features

- **Plural Forms**: Recognizes "coding" from "code"
- **Multiple Tags**: Single thought can have multiple relevant tags
- **Fallback**: Assigns "general" tag if no specific categories match

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "error": "Message must be a string between 5 and 140 characters long"
}
```

#### 404 Not Found

```json
{
  "error": "Thought not found"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### Creating Thoughts with Automatic Tagging

```javascript
// Create a food-related thought
fetch('/thoughts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Just made the most delicious homemade pizza! 🍕'
  })
})
// Result: tags = ["food"]

// Create a programming thought
fetch('/thoughts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Finally fixed that React bug that was driving me crazy!'
  })
})
// Result: tags = ["programming", "emotions"]
```

### Pagination Example

```javascript
// Get first page of thoughts
fetch('/thoughts?page=1&limit=5')
  .then((res) => res.json())
  .then((data) => {
    console.log(
      `Showing ${data.thoughts.length} of ${data.totalCount} thoughts`
    )
    console.log(`Page ${data.currentPage} of ${data.totalPages}`)
  })
```

### Filter by Category

```javascript
// Get all programming-related thoughts
fetch('/thoughts/tag/programming')
  .then((res) => res.json())
  .then((thoughts) => {
    console.log(`Found ${thoughts.length} programming thoughts`)
  })
```

## Data Structure

js-project-api/
├── server.js # Server setup
├── controllers/ # CONTROLLER LAYER
│ └── thoughtsController.js # HTTP request/response handling
├── services/ # BUSINESS LOGIC (part of Model)
│ └── thoughtsService.js # Business rules and workflows
├── models/ # MODEL LAYER  
│ └── thoughtsModel.js # Data access and storage
└── routes/ # URL ROUTING
└── thoughtsRoutes.js # Maps URLs to controllers

### Thought Object

```typescript
{
  _id: string,           // Unique identifier
  message: string,       // Thought content (5-140 chars)
  tags: string[],        // Auto-generated tags
  hearts: number,        // Like count
  createdAt: string,     // ISO timestamp
  __v: number           // Version key
}
```

### Pagination Object

```typescript
{
  thoughts: Thought[],   // Array of thoughts
  totalCount: number,    // Total number of thoughts
  currentPage: number,   // Current page number
  totalPages: number,    // Total number of pages
  next?: {              // Next page info (if exists)
    page: number,
    limit: number
  },
  previous?: {          // Previous page info (if exists)
    page: number,
    limit: number
  }
}
```

## Technical Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **File System** - JSON-based data storage
- **CORS** - Cross-origin resource sharing
- **Auto-tagging** - Custom content analysis algorithm

## Development

### Project Structure

```
js-project-api/
├── server.js              # Main server file
├── store/
│   └── thoughtsStore.js   # Data management class
├── data/
│   └── thoughts.json      # Data storage
├── package.json
└── README.md
```

### Key Features Implementation

- **Auto-tagging**: Content analysis with keyword matching and emoji recognition
- **Pagination**: Server-side pagination with metadata
- **Social Features**: Heart/like system for engagement
- **RESTful Design**: Standard HTTP methods and status codes
- **Data Persistence**: JSON file-based storage with automatic saving

## License

This project is open source and available under the MIT License.

---

**Happy Coding! 🚀**

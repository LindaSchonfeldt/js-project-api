# Happy Thoughts API

This is the backend API for the Happy Thoughts app. It provides secure, RESTful endpoints for managing users, thoughts, likes, tags, and authentication. Built with **Node.js**, **Express**, and **MongoDB**.

## 🚀 Features

- 🔐 **JWT Authentication** – Secure signup/login, session management
- 📝 **Thought CRUD** – Create, read, update, delete thoughts with ownership validation
- 💖 **Like System** – Social interactions with optimistic updates
- 🏷️ **Automatic Tag Generation** – AI-powered content analysis with keyword matching and emoji recognition
- 🔄 **Pagination** – Efficient data loading for large datasets
- ⚠️ **Error Handling** – Consistent error responses and logging
- 🛡️ **Authorization** – Ownership validation and anonymous user protection
- 📊 **Analytics** – Trending thoughts and tag statistics

## 🛠️ Tech Stack

- **Node.js** & **Express.js** – Server framework
- **MongoDB** & **Mongoose** – Database and ODM
- **JWT** – Authentication tokens
- **bcrypt** – Password hashing
- **CORS** – Cross-origin resource sharing
- **Custom middleware** – Auth validation and error handling

## 🏗️ Architecture

This API follows the **MVC (Model-View-Controller) pattern with Service Layer** architecture:

- **Models** (Mongoose schemas) – Data structure and validation
- **Views** (JSON responses) – API response formatting
- **Controllers** – HTTP request/response handling and business logic
- **Services** – Reusable business logic and data operations
- **Routes** – URL mapping and middleware application
- **Middleware** – Authentication, validation, and error handling

### Data Flow

```
Request → Routes → Middleware → Controllers → Services → Models → Database
Response ← JSON ← Controllers ← Services ← Models ← Database
```

## 🔗 Key API Endpoints

### Authentication

```http
POST   /users/register     # Register new user
POST   /users/login        # Login and receive JWT
```

### Thoughts

```http
GET    /thoughts           # Get paginated thoughts
GET    /thoughts/:id       # Get single thought
POST   /thoughts           # Create new thought (auth required)
PUT    /thoughts/:id       # Update own thought (auth + ownership)
DELETE /thoughts/:id       # Delete own thought (auth + ownership)
```

### Social & Tags

```http
POST   /thoughts/:id/like  # Like/unlike a thought
GET    /thoughts/trending  # Get popular thoughts
GET    /thoughts/tag/:tag  # Filter by tag
GET    /tags               # List all tags with usage stats
```

### User Features

```http
GET    /users/liked-thoughts    # Get user's liked thoughts (auth required)
GET    /users/thoughts          # Get user's own thoughts (auth required)
```

## 🏷️ Automatic Tag Generation

The API automatically generates relevant tags for thoughts using dual recognition:

### Keyword Analysis

- Scans thought content for relevant keywords across 10+ categories
- Recognizes plural forms and verb variations (e.g., "code", "codes", "coding")
- Categories include: programming, food, work, home, health, weather, emotions, travel, entertainment, learning

### Emoji Recognition

- Analyzes emoji patterns to assign contextual tags
- Food emojis (🍕🍰🍪☕) → `food` tag
- Emotion emojis (😄😊😢😍🥰😤😱) → `emotions` tag
- Work emojis (💼📊📈💻📝) → `work` tag
- Home emojis (🏠🏡🛋️🌱) → `home` tag

### Smart Fallback

- Assigns `general` tag when no specific patterns are detected
- Removes duplicates when both keyword and emoji match the same category

## ⚡ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required variables
4. Start the server: `npm start` or `npm run dev`
5. API runs at [http://localhost:8080](http://localhost:8080)

### Environment Variables

```env
MONGO_URL=mongodb://localhost/happythoughts
JWT_SECRET=your-secret-key
PORT=8080
```

## 📝 License

This project is licensed under the MIT License.

---

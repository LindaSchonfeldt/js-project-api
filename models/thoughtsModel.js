/**
 * THOUGHTS MODEL (Data Access Layer)
 *
 * Data Storage and Retrieval for Happy Thoughts API
 *
 * This model handles all data operations including file I/O, data validation,
 * and the intelligent auto-tagging system. Currently uses JSON file storage
 * but designed for easy migration to MongoDB/database.
 *
 * Responsibilities:
 * - Load and save data to/from JSON file
 * - Perform CRUD operations on thoughts
 * - Auto-generate tags using keyword and emoji analysis
 * - Handle data structure validation
 * - Manage data persistence and caching
 * - Provide search and filtering capabilities
 *
 * Features:
 * - Automatic tag generation (10+ categories)
 * - Keyword matching with plural/verb forms
 * - Emoji pattern recognition
 * - Pagination support
 * - Data integrity validation
 *
 * Architecture: Service → Model → Data Storage
 *
 */

import fs from 'fs'

import Thought from './Thought'

export class ThoughtsModel {
  constructor(useDatabase = false, filePath = './data/thoughts.json') {
    this.useDatabase = useDatabase
    this.filePath = filePath

    if (!useDatabase) {
      this.messages = this.loadData()
    }
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf8')
      const thoughtsData = JSON.parse(rawData)

      // Ensure it's an array
      if (!Array.isArray(thoughtsData)) {
        console.error('JSON file does not contain an array')
        return []
      }

      // Filter out invalid entries - STORE the result instead of returning immediately
      const filtered = thoughtsData.filter(
        (message) =>
          message &&
          typeof message === 'object' &&
          message._id &&
          message.message &&
          typeof message.hearts === 'number'
      )

      return filtered
    } catch (error) {
      return []
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.messages, null, 2))
    } catch (error) {
      console.error('Error saving thoughts data:', error)
    }
  }

  getAllThoughts() {
    return this.messages
  }

  getTrendingThoughts() {
    return [...this.messages].sort((a, b) => b.hearts - a.hearts)
  }

  getThoughtById(id) {
    return this.messages.find((message) => message._id === id)
  }

  identifyTags(message) {
    const text = message.toLowerCase()
    const tags = []

    // Define keyword categories
    const tagKeywords = {
      food: [
        'food',
        'eat',
        'cook',
        'recipe',
        'coffee',
        'tea',
        'pizza',
        'cake',
        'chocolate',
        'cookies',
        'restaurant',
        'dinner',
        'lunch',
        'breakfast',
        'hungry',
        'delicious',
        'taste',
        'flavor',
        'soup',
        'pasta'
      ],
      programming: [
        'code',
        'debug',
        'function',
        'api',
        'javascript',
        'python',
        'html',
        'css',
        'react',
        'node',
        'server',
        'database',
        'compile',
        'syntax',
        'algorithm',
        'programming',
        'developer',
        'git',
        'github',
        'bug'
      ],
      work: [
        'work',
        'job',
        'office',
        'meeting',
        'deadline',
        'project',
        'boss',
        'colleague',
        'salary',
        'career',
        'interview',
        'presentation',
        'team',
        'client',
        'business'
      ],
      home: [
        'home',
        'house',
        'family',
        'room',
        'clean',
        'organize',
        'furniture',
        'garden',
        'plants',
        'pet',
        'cat',
        'dog',
        'parents',
        'siblings'
      ],
      health: [
        'exercise',
        'workout',
        'gym',
        'run',
        'walk',
        'yoga',
        'sleep',
        'tired',
        'energy',
        'healthy',
        'medicine',
        'doctor',
        'hospital'
      ],
      weather: [
        'sunny',
        'rain',
        'snow',
        'cold',
        'hot',
        'weather',
        'storm',
        'cloud',
        'wind',
        'sunshine',
        'temperature'
      ],
      emotions: [
        'happy',
        'sad',
        'excited',
        'nervous',
        'angry',
        'love',
        'hate',
        'anxious',
        'calm',
        'stressed',
        'grateful',
        'proud',
        'disappointed'
      ],
      travel: [
        'travel',
        'vacation',
        'trip',
        'flight',
        'hotel',
        'beach',
        'mountain',
        'city',
        'country',
        'airport',
        'passport'
      ],
      entertainment: [
        'movie',
        'music',
        'book',
        'game',
        'tv',
        'show',
        'concert',
        'theater',
        'dance',
        'party',
        'festival'
      ],
      learning: [
        'learn',
        'study',
        'school',
        'university',
        'course',
        'lesson',
        'teacher',
        'student',
        'education',
        'knowledge'
      ]
    }

    // Emoji-based tagging
    const emojiPatterns = {
      food: /[🍕🍰🍪☕🍝🥘🍳🥗🍔🌮]/,
      emotions: /[😄😊😢😍🥰😤😱]/,
      work: /[💼📊📈💻📝]/,
      home: /[🏠🏡🛋️🌱]/
    }

    // Check each category for keyword matches
    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      const hasKeyword = keywords.some(
        (keyword) =>
          text.includes(keyword) ||
          text.includes(keyword + 's') || // plural forms
          text.includes(keyword + 'ing') // -ing forms
      )

      if (hasKeyword) {
        tags.push(tag)
      }
    }

    // Check emoji matches
    for (const [tag, pattern] of Object.entries(emojiPatterns)) {
      if (pattern.test(message)) {
        tags.push(tag)
      }
    }

    // Remove duplicates (in case both keyword and emoji match for same tag)
    const uniqueTags = [...new Set(tags)]

    // Always add a 'general' tag if no specific tags found
    if (uniqueTags.length === 0) {
      uniqueTags.push('general')
    }

    return uniqueTags
  }

  createThought(message) {
    const newId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // Auto-identify tags
    const autoTags = this.identifyTags(message)

    const newMessage = {
      _id: newId,
      message: message.trim(),
      tags: autoTags,
      hearts: 0,
      createdAt: new Date().toISOString(),
      __v: 0
    }

    this.messages.push(newMessage)
    this.saveData()
    return newMessage
  }

  getThoughtsByTag(tag) {
    return this.messages.filter(
      (message) => message.tags && message.tags.includes(tag.toLowerCase())
    )
  }

  getAllTags() {
    const allTags = this.messages.flatMap((message) => message.tags || [])
    return [...new Set(allTags)].sort() // Unique tags, sorted
  }

  likeThought(id) {
    const message = this.messages.find((message) => message._id === id)
    if (message) {
      message.hearts++
      this.saveData()
      return message
    }
    return null
  }

  deleteThought(id) {
    const index = this.messages.findIndex((message) => message._id === id)
    if (index !== -1) {
      const deletedMessage = this.messages.splice(index, 1)[0]
      this.saveData()
      return deletedMessage
    }
    return null
  }

  getPaginatedThoughts(page = 1, limit = 10) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    console.log('StartIndex:', startIndex, 'EndIndex:', endIndex)
    console.log('Total messages:', this.messages.length)

    const results = {
      thoughts: this.messages.slice(startIndex, endIndex),
      totalCount: this.messages.length,
      currentPage: page,
      totalPages: Math.ceil(this.messages.length / limit)
    }

    console.log('Sliced thoughts count:', results.thoughts.length)

    if (endIndex < this.messages.length) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    return results
  }

  // Method to update existing thoughts with tags
  updateExistingThoughtsWithTags() {
    console.log('Auto-generating tags for existing thoughts...')

    let updatedCount = 0
    this.messages.forEach((message) => {
      if (!message.tags) {
        // Generate tags automatically based on message content
        message.tags = this.identifyTags(message.message)
        updatedCount++
        console.log(
          `Tagged "${message.message.substring(0, 30)}..." with:`,
          message.tags
        )
      }
    })

    if (updatedCount > 0) {
      this.saveData()
      console.log(`✅ Auto-tagged ${updatedCount} thoughts`)
    }

    return updatedCount
  }
}

export default ThoughtsModel

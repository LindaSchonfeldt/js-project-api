import fs from 'fs'

class ThoughtsStore {
  constructor(filePath = './data/thoughts.json') {
    this.filePath = filePath
    this.messages = this.loadData()
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(this.filePath, 'utf8')
      console.log('Raw data:', rawData.substring(0, 100) + '...')

      const thoughtsData = JSON.parse(rawData)
      console.log('Parsed data type:', typeof thoughtsData)
      console.log('Is array:', Array.isArray(thoughtsData))
      console.log('Data length:', thoughtsData?.length)

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

      console.log('Filtered length:', filtered.length)
      console.log('First few entries:', filtered.slice(0, 3))
      return filtered // Return at the end
    } catch (error) {
      console.error('Error loading thoughts data:', error)
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

  addThought(messageText) {
    const newId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9)

    const newMessage = {
      _id: newId,
      message: messageText.trim(),
      hearts: 0,
      createdAt: new Date().toISOString(),
      __v: 0
    }

    this.messages.push(newMessage)
    this.saveData()
    return newMessage
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
}

export default ThoughtsStore

/**
 * Thought Model (Mongoose)
 * Purpose: Defines the schema and model for Thought documents in MongoDB.
 * Usage: Imported by controllers/services to interact with thoughts collection.
 * Author: Linda Schonfeldt
 * Last Updated: September 2, 2025
 */

import mongoose from 'mongoose'

// Make sure required fields have proper default values
const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 280
  },
  tags: [
    {
      type: String,
      lowercase: true
    }
  ],
  // Add themeTags field for frontend compatibility
  themeTags: [
    {
      type: String,
      lowercase: true
    }
  ],
  hearts: {
    type: Number,
    default: 0
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Add indexes for better query performance
thoughtSchema.index({ createdAt: -1 })
thoughtSchema.index({ hearts: -1 })
thoughtSchema.index({ tags: 1 })

export default mongoose.model('Thought', thoughtSchema)

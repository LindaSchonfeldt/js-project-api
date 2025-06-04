/**
 * THOUGHT MONGOOSE MODEL
 *
 * MongoDB schema definition for thoughts
 *
 * This file defines the data structure for thoughts stored in MongoDB.
 *
 * @author Linda Schönfeldt
 * @created June 2025
 */

import mongoose from 'mongoose'

const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [5, 'Message must be at least 5 characters'],
    maxlength: [140, 'Message cannot exceed 140 characters'],
    trim: true
  },
  tags: [
    {
      type: String,
      lowercase: true
    }
  ],
  hearts: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  __v: Number
})

// Add indexes for better query performance
thoughtSchema.index({ createdAt: -1 })
thoughtSchema.index({ hearts: -1 })
thoughtSchema.index({ tags: 1 })

export default mongoose.model('Thought', thoughtSchema)

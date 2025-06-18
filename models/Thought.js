/**
 * THOUGHT MONGOOSE MODEL
 *
 * MongoDB schema definition for thoughts in the Happy Thoughts API
 *
 * This file defines the comprehensive data structure for thoughts stored in MongoDB.
 * Includes validation rules, default values, and field constraints to ensure
 * data integrity and consistency across the application.
 *
 * Schema Features:
 * - Message validation (5-140 characters with trimming)
 * - Automatic tag array management with lowercase normalization
 * - Hearts/likes counter with non-negative validation
 * - Automatic timestamp tracking for creation and updates
 * - String trimming and length validation
 *
 * Architecture: MVC Pattern with Service Layer
 * - Routes: URL mapping and route definitions
 * - Controllers: HTTP request/response handling
 * - Services: Business logic and data orchestration
 * - Models: Data access (supports both file and MongoDB storage) ← YOU ARE HERE
 * * @author Linda Schönfeldt
 * @version 1.0.0
 * @created June 2025
 * @updated June 2025
 */

import mongoose from 'mongoose'

// Make sure required fields have proper default values
const thoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 140
  },
  tags: [
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

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

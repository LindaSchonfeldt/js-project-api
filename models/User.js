/**
 * USER MODEL
 *
 * Mongoose schema and model definition for User entities
 *
 * This model defines the structure and validation rules for user data
 * in the Happy Thoughts API. Users can authenticate and manage their
 * thoughts through secure access tokens.
 *
 * Schema Features:
 * - User identification with unique names
 * - Secure password storage
 * - Automatic access token generation for authentication
 * - Cryptographically secure token creation
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

import bcrypt from 'bcrypt'
import crypto from 'crypto'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
    // must contain a number and letter
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

// Add pre-save hook to hash passwords
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

// Add this method to your userSchema
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User

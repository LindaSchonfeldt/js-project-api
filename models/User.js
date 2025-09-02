/**
 * User Model (Mongoose)
 * Purpose: Defines the schema and model for User documents in MongoDB.
 * Usage: Imported by controllers/services to interact with users collection.
 * Author: Linda Schonfeldt
 * Last Updated: June, 2025
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

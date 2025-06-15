import User from '../models/User.js'

export const registerUser = async (req, res, next) => {
  try {
    const { name, password } = req.body

    const user = new User({ name, password })
    await user.save()

    res.status(201).json({
      success: true,
      response: {
        userId: user._id,
        name: user.name,
        accessToken: user.accessToken
      },
      message: 'User successfully registered'
    })
  } catch (error) {
    next(error)
  }
}

export const loginUser = async (req, res, next) => {
  try {
    const { name, password } = req.body

    const user = await User.findOne({ name })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    res.json({
      success: true,
      response: {
        userId: user._id,
        name: user.name,
        accessToken: user.accessToken
      },
      message: 'Login successful'
    })
  } catch (error) {
    next(error)
  }
}

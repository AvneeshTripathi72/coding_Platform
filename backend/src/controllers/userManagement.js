import bcrypt from 'bcryptjs'
import Submission from '../models/submission.js'
import User from '../models/user.js'

export const getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called - User:', req.user)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const search = req.query.search

    const query = {}
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { emailId: { $regex: search, $options: 'i' } }
      ]
    }

    console.log('Query:', query, 'Page:', page, 'Limit:', limit)

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('problemsSolved', 'title difficulty')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query)
    ])

    const usersWithStats = users.map(user => {
      return {
        ...user,
        solvedCount: Array.isArray(user.problemsSolved) ? user.problemsSolved.length : 0,
        _id: user._id.toString()
      }
    })

    console.log(`Fetched ${usersWithStats.length} users (total: ${total})`)
    res.status(200).json({ users: usersWithStats, total, page, limit })
  } catch (err) {
    console.error('Error in getAllUsers:', err)
    console.error('Error stack:', err.stack)
    res.status(500).json({ message: 'Error fetching users: ' + err.message, error: err.stack })
  }
}

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, age, role } = req.body

    if (!firstName || !emailId || !password) {
      return res.status(400).json({ message: 'First name, email, and password are required' })
    }

    const existingUser = await User.findOne({ emailId })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      age,
      role: role || 'user'
    })

    const userObj = newUser.toObject()
    delete userObj.password

    res.status(201).json({ message: 'User created successfully', user: userObj })
  } catch (err) {
    res.status(400).json({ message: 'Error creating user: ' + err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { firstName, lastName, age, role, password } = req.body

    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (age !== undefined) updateData.age = age
    if (role) updateData.role = role
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser })
  } catch (err) {
    res.status(400).json({ message: 'Error updating user: ' + err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    await Submission.deleteMany({ userId: id })

    const deletedUser = await User.findByIdAndDelete(id)
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user: ' + err.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
      .select('-password')
      .populate('problemsSolved', 'title difficulty')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userObj = user.toObject()
    userObj.solvedCount = user.problemsSolved?.length || 0

    res.status(200).json({ user: userObj })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user: ' + err.message })
  }
}

export const toggleSubscriptionLock = async (req, res) => {
  try {
    const { id } = req.params
    const { lock } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (lock === true) {
      user.subscription.isActive = false
      await user.save()
      return res.status(200).json({ 
        message: 'Subscription locked successfully', 
        subscription: user.subscription 
      })
    } else if (lock === false) {
      if (user.subscription.expiryDate) {
        const expiryDate = new Date(user.subscription.expiryDate)
        const now = new Date()
        user.subscription.isActive = now <= expiryDate
      } else {
        user.subscription.isActive = false
      }
      await user.save()
      return res.status(200).json({ 
        message: 'Subscription unlocked successfully', 
        subscription: user.subscription 
      })
    } else {
      return res.status(400).json({ message: 'Invalid lock parameter. Use true to lock or false to unlock' })
    }
  } catch (err) {
    res.status(500).json({ message: 'Error toggling subscription lock: ' + err.message })
  }
}

export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive, planType, expiryDate } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (isActive !== undefined) user.subscription.isActive = isActive
    if (planType) user.subscription.planType = planType
    if (expiryDate) user.subscription.expiryDate = new Date(expiryDate)

    await user.save()

    res.status(200).json({ 
      message: 'Subscription updated successfully', 
      subscription: user.subscription 
    })
  } catch (err) {
    res.status(500).json({ message: 'Error updating subscription: ' + err.message })
  }
}

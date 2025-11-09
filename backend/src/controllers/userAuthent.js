import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { client as redisClient } from "../config/redis.js";
import Submission from '../models/submission.js';
import User from '../models/user.js';
import validate from '../utils/validator.js';

dotenv.config()

const register = async (req, res) => {

    try {

        const { firstName, lastName, emailId, password, age } = req.body
       console.log("User registration data:", req.body);
         
        // Validate required fields
        if (!firstName || !emailId || !password) {
            return res.status(400).json({ message: 'First name, email, and password are required' });
        }

        // Validate firstName length (matches schema minLength: 3)
        if (firstName.length < 3) {
            return res.status(400).json({ message: 'First name must be at least 3 characters long' });
        }

        // Validate lastName if provided (matches schema minLength: 3)
        if (lastName && lastName.length > 0 && lastName.length < 3) {
            return res.status(400).json({ message: 'Last name must be at least 3 characters long if provided' });
        }

         req.body.role = 'user'
     console.log("User registration data:", req.body);

         // Find existing user (emailId is lowercased by schema)
         const existingUser = await User.findOne({ emailId: emailId.toLowerCase().trim() })

         if (existingUser) return res.status(400).json({ message: 'User already exists' })

         const hashedPassword = await bcrypt.hash(password, 10)

      console.log("firstName = " +  firstName + ", lastName = " + lastName + ", email = " + emailId + ", password = " + password + ", age = " + age);
         // Only include fields that are provided
         const userData = {
            firstName: firstName.trim(),
            emailId: emailId.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user'
         };
         
         // Add optional fields only if provided
         if (lastName && lastName.trim().length > 0) {
            userData.lastName = lastName.trim();
         }
         if (age) {
            userData.age = age;
         }
         
         const newUser = await User.create(userData)

        const token = jwt.sign(
            { 
                _id: newUser._id, 
                userId: newUser._id,
                emailId: newUser.emailId, 
                name: newUser.firstName, 
                role: newUser.role 
            }, 
            process.env.JWT_SECRET || 'Avanish', 
            { expiresIn: '7d' }
        )
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax', secure: false })
        console.log(`user registered:`, newUser.emailId);
        
        res.status(201).json({ 
            message: `${newUser.role} registered successfully`, 
            token,
            user: {
                _id: newUser._id,
                emailId: newUser.emailId,
                firstName: newUser.firstName,
                lastName: newUser.lastName || '',
                role: newUser.role,
                subscription: newUser.subscription || {
                    isActive: false,
                    planType: 'free'
                }
            }
        })
    } catch (err) {
        console.error("Registration error:", err);
        
        // Handle MongoDB validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ message: `Validation error: ${validationErrors}` });
        }
        
        // Handle duplicate key errors (unique constraint)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Generic error
        res.status(400).json({ message: err.message || 'Registration failed' });
    }
}

const login = async (req, res) => {
    const { emailId, password } = req.body
    try {
        if (!emailId || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }
        
        const user = await User.findOne({ emailId: emailId.toLowerCase().trim() })
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }
        
        const token = jwt.sign(
            { 
                _id: user._id, 
                userId: user._id,
                emailId: user.emailId, 
                name: user.firstName, 
                role: user.role 
            }, 
            process.env.JWT_SECRET || 'Avanish', 
            { expiresIn: '7d' }
        )
        
        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            sameSite: 'lax', 
            secure: false 
        })
        
        console.log(`${user.role} logged in:`, user.emailId);
        
        res.status(200).json({ 
            message: `${user.role} logged in successfully`, 
            token,
            user: {
                _id: user._id,
                emailId: user.emailId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscription: user.subscription || {
                    isActive: false,
                    planType: 'free'
                }
            }
        })
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ message: err.message || 'Login failed' })
    }
}

const logout = async (req, res) => {
    try {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ message: "No token found" });

    const decoded = jwt.decode(token);

    let expiresIn = decoded?.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 3600;

    if (expiresIn <= 0) expiresIn = 1;

    await redisClient.set(`blacklist:${token}`, "blacklisted", { EX: expiresIn });

    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
}

    const adminRegister = async (req, res) => {
    try {
        validate(req.body)
        console.log("Admin registration data:", req.body);
        const { firstName, lastName, emailId, password, age } = req.body
        const existingUser = await User.findOne({ emailId })
        if (existingUser) return res.status(400).json({ message: 'User already exists' })
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ firstName, lastName, emailId, password: hashedPassword, age , role: 'admin' })
        res.status(201).json({ message: `Admin registered successfully`, user: { _id: newUser._id, firstName: newUser.firstName, emailId: newUser.emailId, role: newUser.role } })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })

        res.status(200).json({ 
            user: {
                _id: user._id,
                emailId: user.emailId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                subscription: user.subscription || {
                    isActive: false,
                    planType: 'free'
                }
            }
        })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

const deleteUserProfile = async (req,res) => {
    try{
      const userId = req.user._id;

     await User.findByIdAndDelete(userId);

   await   Submission.deleteMany({ user: userId });
    res.status(200).json("Succesfull Delete");

    }
    catch(err){

    }

}

export { adminRegister, deleteUserProfile, getUserProfile, login, logout, register };

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { client as redisClient } from "../config/redis.js";
import Submission from '../models/submission.js';
import User from '../models/user.js';
import validate from '../utils/validator.js';

dotenv.config()

const register = async (req, res) => {
 //   console.log("User registration data:", req.body);
    try {
       // validate(req.body)
        const { firstName, lastName, emailId, password, age } = req.body
       console.log("User registration data:", req.body);
         req.body.role = 'user'
     console.log("User registration data:", req.body);

         const existingUser = await User.findOne({ emailId })

         if (existingUser) return res.status(400).json({ message: 'User already exists' })

         const hashedPassword = await bcrypt.hash(password, 10)

      console.log("firstName = " +  firstName + ", lastName = " + lastName + ", email = " + emailId + ", password = " + password + ", age = " + age);
         const newUser = await User.create({ firstName, lastName, emailId, password: hashedPassword, age })



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
        
        // Return user object for frontend
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
        console.error("Registration error:", err.message);
        res.status(400).json({ message: err.message + " from register controller" })
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
        
        // Return user object for frontend
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
    // 
    let expiresIn = decoded?.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 3600; // default 1 hour

    if (expiresIn <= 0) expiresIn = 1;

    // Blacklist the token in Redis (using same key format as middleware)
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
        // Return in same format as login for consistency
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
      // user schema delete
     await User.findByIdAndDelete(userId);

     // delete also submission schema
   await   Submission.deleteMany({ user: userId });
    res.status(200).json("Succesfull Delete");

    }
    catch(err){

    }

}

export { adminRegister, deleteUserProfile, getUserProfile, login, logout, register };


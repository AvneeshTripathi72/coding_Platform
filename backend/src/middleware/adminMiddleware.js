import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { client as redisClient } from "../config/redis.js";
dotenv.config();

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const isBlacklisted1 = await redisClient.get(`blacklist:${token}`);
    const isBlacklisted2 = await redisClient.get(`bl_${token}`);
    if (isBlacklisted1 || isBlacklisted2) {
      return res.status(401).json({ message: "Unauthorized: Token has been logged out" });
    }
       
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Admin middleware - User role:", decoded.role);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default adminMiddleware;

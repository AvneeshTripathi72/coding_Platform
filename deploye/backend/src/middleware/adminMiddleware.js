import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { safeRedis } from "../config/redis.js";
import { getTokenFromRequest } from "./userMiddleware.js";

dotenv.config();

const adminMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const isBlacklisted = await safeRedis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token has been logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Avanish');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Admin verification error:", err.message);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};

export default adminMiddleware;

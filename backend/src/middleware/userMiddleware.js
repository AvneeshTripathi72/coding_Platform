import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { client as redisClient } from "../config/redis.js";
dotenv.config();

const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      return next();
    }

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Optional auth: Invalid token, treating as guest");
    next();
  }
};

const userMiddleware = async (req, res, next) => {
    const token = req.cookies.token
    console.log("Token from cookies:", token);

  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized: Token has been logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    console.log("Username from token:", decoded);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

 const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.ip;
    const key = `rateLimiter:${userId}`;

    const currentTime = Date.now();
    const windowSize = 5000;
    const maxRequests = 1;

    const requests = (await redisClient.lRange(key, 0, -1)).map(Number);

    const recentRequests = requests.filter(
      (t) => currentTime - t < windowSize
    );

    if (recentRequests.length >= maxRequests) {
      const retryAfter =
        (windowSize - (currentTime - recentRequests[0])) / 20;
      res.setHeader("Retry-After", Math.ceil(retryAfter));
      return res
        .status(429)
        .json({ message: `Please wait ${Math.ceil(retryAfter)} s before retrying.` });
    }

    await redisClient.rPush(key, currentTime.toString());
    await redisClient.expire(key, Math.ceil(windowSize / 1000) + 1);

    next();
  } catch (err) {
    console.error("Rate limiter error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { optionalAuthMiddleware, rateLimiterMiddleware, userMiddleware };


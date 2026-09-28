import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { safeRedis } from "../config/redis.js";

dotenv.config();

const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const optionalAuthMiddleware = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  try {
    if (!token) {
      return next();
    }

    const isBlacklisted = await safeRedis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Avanish');
    req.user = decoded;
    next();
  } catch (err) {
    // Treat as guest if token is invalid
    next();
  }
};

const userMiddleware = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  try {
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const isBlacklisted = await safeRedis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: "Unauthorized: Token has been logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Avanish');
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.ip || 'unknown_client';
    const key = `rateLimiter:${userId}`;

    const currentTime = Date.now();
    const windowSize = 5000;
    const maxRequests = 5; // Allow reasonable burst in serverless

    const requestsData = await safeRedis.lRange(key, 0, -1);
    const requests = (requestsData || []).map(Number).filter(Boolean);

    const recentRequests = requests.filter(
      (t) => currentTime - t < windowSize
    );

    if (recentRequests.length >= maxRequests) {
      const retryAfter = Math.ceil((windowSize - (currentTime - recentRequests[0])) / 1000);
      res.setHeader("Retry-After", Math.max(retryAfter, 1));
      return res
        .status(429)
        .json({ success: false, message: `Please wait ${Math.max(retryAfter, 1)}s before retrying.` });
    }

    await safeRedis.rPush(key, currentTime.toString());
    await safeRedis.expire(key, Math.ceil(windowSize / 1000) + 1);

    next();
  } catch (err) {
    console.error("Rate limiter error (gracefully passing):", err.message);
    next(); // Pass request through on rate limiter failure to avoid false 500s
  }
};

export { optionalAuthMiddleware, rateLimiterMiddleware, userMiddleware, getTokenFromRequest };

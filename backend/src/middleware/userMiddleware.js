import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { client as redisClient } from "../config/redis.js";
dotenv.config();


/**
 * Optional middleware to verify JWT if token exists (doesn't fail if no token)
 * Used for routes that support both authenticated and guest users
 */
const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      // No token - user is a guest, continue without setting req.user
      return next();
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      // Token is blacklisted, treat as guest
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token - treat as guest, continue without setting req.user
    console.log("Optional auth: Invalid token, treating as guest");
    next();
  }
};

/**
 * Middleware to verify JWT and check Redis blacklist (required auth)
 */
const userMiddleware = async (req, res, next) => {
    const token = req.cookies.token
    console.log("Token from cookies:", token);

  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Check if token is blacklisted in Redis
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

// first rate limiter error     "message": "Internal server error\"arguments[2]\" must be of type \"string | Buffer\", got number instead."
// const rateLimiterMiddleware = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const currentTime = Date.now();
//     const windowSize = 60000; // 1 minute
//     const maxRequests = 10; // Max 10 requests per minute

//     const requests = await redisClient.lRange(`rateLimiter:${userId}`, 0, -1);
//     const recentRequests = requests.filter(timestamp => currentTime - timestamp < windowSize);

//     if (recentRequests.length >= maxRequests) {
//       return res.status(429).json({ message: "Too many requests. Please try again later." });
//     }

//     await redisClient.rPush(`rateLimiter:${userId}`, currentTime);
//     await redisClient.expire(`rateLimiter:${userId}`, Math.ceil(windowSize / 1000));

//     next();
//   } catch (err) {
//     console.error("Rate limiter error:", err.message);
//     res.status(500).json({ message: "Internal server error" + err.message });
//   }
// };



// second rate limiter error  "message": "Too many requests. they have fix to only 10 submissions per minute"
// const rateLimiterMiddleware = async (req, res, next) => {
//   try {
//     const userId = req.user?._id || req.ip; // fallback for guests
//     const currentTime = Date.now();
//     const windowSize = 60000; // 1 minute
//     const maxRequests = 10;   // Max 10 requests per minute

//     const requests = await redisClient.lRange(`rateLimiter:${userId}`, 0, -1);

//     // Convert strings to numbers for comparison
//     const recentRequests = requests.filter(
//       timestamp => currentTime - Number(timestamp) < windowSize
//     );

//     if (recentRequests.length >= maxRequests) {
//       return res
//         .status(429)
//         .json({ message: "Too many requests. Please try again later." });
//     }

//     // Convert timestamp to string before pushing to Redis
//     await redisClient.rPush(`rateLimiter:${userId}`, currentTime.toString());
//     await redisClient.expire(`rateLimiter:${userId}`, Math.ceil(windowSize / 1000));

//     next();
//   } catch (err) {
//     console.error("Rate limiter error:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// Third rate limiter are too many requests only 1 submission per 5 seconds
//  const rateLimiterMiddleware = async (req, res, next) => {
//   try {
//     const userId = req.user?._id || req.ip; // fallback to IP if not logged in
//     const currentTime = Date.now();
//     const windowSize = 5000; // 5 seconds
//     const maxRequests = 1;   // Allow only 1 request per 5 seconds

//     // Get all previous request timestamps for this user
//     const requests = await redisClient.lRange(`rateLimiter:${userId}`, 0, -1);

//     // Keep only recent requests within 5-second window
//     const recentRequests = requests.filter(
//       (timestamp) => currentTime - Number(timestamp) < windowSize
//     );

//     if (recentRequests.length >= maxRequests) {
//       const retryAfter = Math.ceil(
//         (windowSize - (currentTime - Number(recentRequests[0]))) / 200
//       );
//       res.setHeader("Retry-After", retryAfter);
//       return res.status(429).json({
//         message: `Too many requests. Please wait ${retryAfter} seconds.`,
//       });
//     }

//     // Record new request timestamp
//     await redisClient.rPush(`rateLimiter:${userId}`, currentTime.toString());
//     await redisClient.expire(`rateLimiter:${userId}`, Math.ceil(windowSize / 1000));

//     next(); // Continue to route handler
//   } catch (err) {
//     console.error("Rate limiter error:", err.message);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };




 const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // ✅ Identify the user consistently
    const userId = req.user?._id || req.ip;
    const key = `rateLimiter:${userId}`;

    const currentTime = Date.now();
    const windowSize = 5000; // 5 seconds
    const maxRequests = 1;   // only 1 request allowed per window

    // ✅ Fetch timestamps as strings and convert to numbers
    const requests = (await redisClient.lRange(key, 0, -1)).map(Number);

    // ✅ Filter requests within the window
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

    // ✅ Record this request
    await redisClient.rPush(key, currentTime.toString());
    // Keep the key alive at least 1 second longer than the window
    await redisClient.expire(key, Math.ceil(windowSize / 1000) + 1);

    next();
  } catch (err) {
    console.error("Rate limiter error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};




export { optionalAuthMiddleware, rateLimiterMiddleware, userMiddleware };


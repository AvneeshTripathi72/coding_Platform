// redisClient.js
import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();
// Create a Redis client with safe reconnect strategy
const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || undefined,
    reconnectStrategy: (retries) => {
      // backoff: 100ms, 200ms, ... capped at 2s
      const delay = Math.min(retries * 100, 2000);
      console.warn(`Redis reconnect attempt ${retries}, retrying in ${delay}ms`);
      return delay;
    },
    keepAlive: 1,
  },
});

// Prevent process crash on transient errors
client.on("error", (err) => {
  console.error("Redis client error:", err?.message || err);
});
client.on("end", () => {
  console.warn("Redis connection ended");
});
client.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

// Function to connect to Redis
const connectRedis = async () => {
  try {
    await client.connect();
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
};

// Export the client and the connect function
export { client, connectRedis };

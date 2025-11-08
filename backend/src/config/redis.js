import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();
const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || undefined,
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 2000);
      console.warn(`Redis reconnect attempt ${retries}, retrying in ${delay}ms`);
      return delay;
    },
    keepAlive: 1,
  },
});

client.on("error", (err) => {
  console.error("Redis client error:", err?.message || err);
});
client.on("end", () => {
  console.warn("Redis connection ended");
});
client.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
};

export { client, connectRedis };


import mongoose from "mongoose";
import dns from "dns";

// Fix Windows DNS SRV lookup issues for MongoDB Atlas locally
if (!process.env.VERCEL && typeof process !== "undefined" && process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore
  }
}

const rawUri = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "callshild";

// If URI is missing or contains placeholder <db_password>, fallback to local MongoDB
const MONGODB_URI =
  rawUri && !rawUri.includes("<db_password>") && !rawUri.includes("<password>")
    ? rawUri
    : "mongodb://localhost:27017/callshild";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 3000, // Timeout fast (3s) instead of hanging 10s
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        console.warn("MongoDB connection failed:", err.message);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection exception:", e);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;

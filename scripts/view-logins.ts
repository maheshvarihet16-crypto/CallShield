import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

import { MongoClient } from "mongodb";

async function showLoginData() {
  console.log("==================================================");
  console.log("🔍 FETCHING USER LOGIN & ACCOUNT DATA FROM MONGODB");
  console.log("==================================================\n");

  const rawUri = process.env.MONGODB_URI || "mongodb://localhost:27017/callshild";
  const dbName = process.env.MONGODB_DB_NAME || "callshild";

  let client: MongoClient | null = null;
  let db: ReturnType<MongoClient["db"]> | null = null;

  try {
    console.log("📡 Connecting to MongoDB URI...");
    client = new MongoClient(rawUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Successfully connected to MongoDB database:", dbName);
  } catch (err: any) {
    console.warn("⚠️ Atlas connection attempt failed:", err?.message || err);
    console.log("📡 Attempting local MongoDB connection fallback...");
    try {
      client = new MongoClient("mongodb://127.0.0.1:27017/" + dbName, {
        serverSelectionTimeoutMS: 5000,
      });
      await client.connect();
      db = client.db(dbName);
      console.log("✅ Connected to Local MongoDB!");
    } catch (localErr: any) {
      console.error("❌ Both MongoDB Atlas and Local connections failed.");
      console.error("Atlas Error:", err?.message);
      console.error("Local Error:", localErr?.message);
      process.exit(1);
    }
  }

  if (!db) {
    console.error("❌ Could not get database reference.");
    process.exit(1);
  }

  // List all collections in database
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  console.log("📦 Available collections in MongoDB:", collectionNames.join(", "));
  console.log("--------------------------------------------------\n");

  // 1. Fetch Users from 'user' or 'users' collection
  const userCollName = collectionNames.find((n) => n === "user" || n === "users") || "user";
  const users = await db.collection(userCollName).find({}).toArray();

  console.log(`👤 REGISTERED USERS (${users.length} found):`);
  if (users.length === 0) {
    console.log("   No registered users found in collection:", userCollName);
  } else {
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ID: ${u._id.toString()}`);
      console.log(`      Name: ${u.name || "N/A"}`);
      console.log(`      Email: ${u.email || "N/A"}`);
      console.log(`      Role: ${u.role || "user"}`);
      console.log(`      Created At: ${u.createdAt ? new Date(u.createdAt).toLocaleString("en-IN") : "N/A"}`);
      console.log(`      Email Verified: ${u.emailVerified ?? false}`);
      console.log("      ---");
    });
  }

  // 2. Fetch Sessions from 'session' or 'sessions' collection
  const sessionCollName = collectionNames.find((n) => n === "session" || n === "sessions") || "session";
  const sessions = await db.collection(sessionCollName).find({}).toArray();

  console.log(`\n🔑 LOGIN SESSIONS (${sessions.length} active/recent sessions found):`);
  if (sessions.length === 0) {
    console.log("   No login sessions found in collection:", sessionCollName);
  } else {
    sessions.forEach((s, i) => {
      // Find matching user
      const user = users.find((u) => u._id.toString() === s.userId?.toString() || u.id === s.userId);
      console.log(`   ${i + 1}. Session ID: ${s._id.toString()}`);
      console.log(`      User: ${user ? `${user.name} (${user.email})` : s.userId}`);
      console.log(`      Created At / Login Time: ${s.createdAt ? new Date(s.createdAt).toLocaleString("en-IN") : "N/A"}`);
      console.log(`      Expires At: ${s.expiresAt ? new Date(s.expiresAt).toLocaleString("en-IN") : "N/A"}`);
      console.log(`      IP Address: ${s.ipAddress || "N/A"}`);
      console.log(`      User Agent: ${s.userAgent || "N/A"}`);
      console.log("      ---");
    });
  }

  // 3. Fetch Accounts from 'account' or 'accounts' collection (Google OAuth vs Email/Password)
  const accountCollName = collectionNames.find((n) => n === "account" || n === "accounts") || "account";
  if (collectionNames.includes(accountCollName)) {
    const accounts = await db.collection(accountCollName).find({}).toArray();
    console.log(`\n🔐 AUTHENTICATION METHODS (${accounts.length} linked accounts found):`);
    accounts.forEach((a, i) => {
      const user = users.find((u) => u._id.toString() === a.userId?.toString() || u.id === a.userId);
      console.log(`   ${i + 1}. Provider: ${a.providerId || "credential"}`);
      console.log(`      User: ${user ? `${user.name} (${user.email})` : a.userId}`);
      console.log(`      Account ID: ${a.accountId || "N/A"}`);
      console.log("      ---");
    });
  }

  console.log("\n==================================================");
  process.exit(0);
}

showLoginData().catch((err) => {
  console.error("Error executing script:", err);
  process.exit(1);
});

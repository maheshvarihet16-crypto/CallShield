import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dns from "dns";

// Fix Windows DNS SRV lookup issues for MongoDB Atlas
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

const mongodbUri = process.env.MONGODB_URI;

const isMongoConfigured = Boolean(
  mongodbUri &&
    !mongodbUri.includes("<db_password>") &&
    !mongodbUri.includes("<password>")
);

let db: ReturnType<MongoClient["db"]> | undefined;

if (isMongoConfigured && mongodbUri) {
  try {
    const client = new MongoClient(mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    db = client.db(process.env.MONGODB_DB_NAME || "callshild");
  } catch (err) {
    console.warn("MongoDB initialization warning in auth.ts:", err);
  }
}

const hasGoogleAuth = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0
);

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes("localhost")) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) return process.env.NEXT_PUBLIC_APP_URL;
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const trustedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://*.vercel.app",
];

export const auth = betterAuth({
  ...(db ? { database: mongodbAdapter(db) } : {}),
  emailAndPassword: {
    enabled: true,
  },
  ...(hasGoogleAuth
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "callshield_dev_secret_32_characters_long",
  baseURL: getBaseUrl(),
  trustedOrigins,
});

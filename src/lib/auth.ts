import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const mongodbUri = process.env.MONGODB_URI;

// Ensure MONGODB_URI does not contain un-replaced placeholders like <db_password>
const isMongoConfigured = Boolean(
  mongodbUri &&
    !mongodbUri.includes("<db_password>") &&
    !mongodbUri.includes("<password>")
);

let db;
if (isMongoConfigured && mongodbUri) {
  try {
    const client = new MongoClient(mongodbUri);
    db = client.db(process.env.MONGODB_DB_NAME || "callshild");
  } catch (err) {
    console.warn("MongoDB initialization error in auth.ts:", err);
  }
}

export const auth = betterAuth({
  ...(db ? { database: mongodbAdapter(db) } : {}),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
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
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

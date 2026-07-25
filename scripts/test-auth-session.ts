import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

import { auth } from "../src/lib/auth";

async function testSession() {
  console.log("Testing auth session creation...");
  try {
    const signupRes = await auth.api.signUpEmail({
      body: {
        email: "testuser_" + Date.now() + "@example.com",
        password: "Password123!",
        name: "Test User",
      },
    });
    console.log("SignUp Result:", signupRes);
  } catch (err: any) {
    console.error("SignUp Error:", err);
  }
  process.exit(0);
}

testSession();

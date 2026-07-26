import dns from "dns";

if (!process.env.VERCEL && typeof process !== "undefined" && process.platform === "win32") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore
  }
}

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

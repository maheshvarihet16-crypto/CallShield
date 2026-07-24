import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

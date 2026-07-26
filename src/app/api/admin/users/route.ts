import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const mongooseInstance = await connectToDatabase();
    if (!mongooseInstance || !mongooseInstance.connection.db) {
      return NextResponse.json({ error: "Database connection failed." }, { status: 500 });
    }

    const db = mongooseInstance.connection.db;

    // Check user permissions
    const currentUser = await User.findOne({ email: session.user.email });
    const userRole = (session.user as { role?: string })?.role || currentUser?.role || "user";

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    // List collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Get Users
    const userCollName = collectionNames.find((n) => n === "user" || n === "users") || "user";
    const usersRaw = await db.collection(userCollName).find({}).toArray();

    // Get Sessions
    const sessionCollName = collectionNames.find((n) => n === "session" || n === "sessions") || "session";
    const sessionsRaw = await db.collection(sessionCollName).find({}).sort({ createdAt: -1 }).toArray();

    // Get Accounts
    const accountCollName = collectionNames.find((n) => n === "account" || n === "accounts") || "account";
    const accountsRaw = collectionNames.includes(accountCollName)
      ? await db.collection(accountCollName).find({}).toArray()
      : [];

    const usersData = usersRaw.map((u) => {
      const userIdStr = u._id.toString();
      const userSessions = sessionsRaw.filter(
        (s) => s.userId?.toString() === userIdStr || s.userId === u.id
      );
      const userAccounts = accountsRaw.filter(
        (a) => a.userId?.toString() === userIdStr || a.userId === u.id
      );

      const providers = userAccounts.map((a) => a.providerId || "email");
      if (providers.length === 0) providers.push("email");

      return {
        id: userIdStr,
        name: u.name || "Anonymous",
        email: u.email,
        role: u.role || "user",
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        emailVerified: Boolean(u.emailVerified),
        authProviders: Array.from(new Set(providers)),
        totalSessionsCount: userSessions.length,
        lastLoginAt: userSessions[0]?.createdAt
          ? new Date(userSessions[0].createdAt).toISOString()
          : null,
        recentSessions: userSessions.slice(0, 5).map((s) => ({
          sessionId: s._id.toString(),
          createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
          expiresAt: s.expiresAt ? new Date(s.expiresAt).toISOString() : null,
          ipAddress: s.ipAddress || "N/A",
          userAgent: s.userAgent || "N/A",
        })),
      };
    });

    return NextResponse.json({
      success: true,
      users: usersData,
      totalUsers: usersData.length,
      totalSessions: sessionsRaw.length,
    });
  } catch (error) {
    console.error("Error fetching admin user login data:", error);
    return NextResponse.json({ error: "Failed to fetch user login data." }, { status: 500 });
  }
}

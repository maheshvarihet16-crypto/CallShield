import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import connectToDatabase from "@/lib/db";
import { Report } from "@/models/Report";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required to flag reports." }, { status: 401 });
    }

    const { reportId, reason } = await req.json();

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    await connectToDatabase();

    const report = await Report.findByIdAndUpdate(
      reportId,
      { isFlagged: true, flagReason: reason || "User reported as inappropriate/false" },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Report flagged for moderation review." });
  } catch (error) {
    console.error("Error flagging report:", error);
    return NextResponse.json({ error: "Failed to flag report." }, { status: 500 });
  }
}

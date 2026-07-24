import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import connectToDatabase from "@/lib/db";
import { Report } from "@/models/Report";
import { NumberModel } from "@/models/Number";
import { User } from "@/models/User";
import { calculateFraudScore } from "@/lib/fraudScore";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.user.email });
    const userRole = (session.user as { role?: string })?.role || userDoc?.role || "user";

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    const { reportId, action } = await req.json();

    if (!reportId || !action) {
      return NextResponse.json({ error: "Report ID and action ('approve' | 'delete') are required." }, { status: 400 });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const numberId = report.numberId;

    if (action === "approve") {
      // Unflag report
      report.isFlagged = false;
      report.flagReason = undefined;
      await report.save();
      return NextResponse.json({ success: true, message: "Report approved and unflagged." });
    }

    if (action === "delete") {
      // Delete report document
      await Report.findByIdAndDelete(reportId);

      // Recalculate remaining reports and update Number document metrics
      const remainingReports = await Report.find({ numberId }).lean();
      const numberDoc = await NumberModel.findById(numberId);

      if (numberDoc) {
        if (remainingReports.length === 0) {
          numberDoc.fraudScore = 0;
          numberDoc.totalReports = 0;
          numberDoc.topCategory = undefined;
        } else {
          const { score } = calculateFraudScore(
            remainingReports.map((r) => ({ category: r.category, createdAt: r.createdAt }))
          );

          const categoryCounts: Record<string, number> = {};
          remainingReports.forEach((r) => {
            categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
          });
          const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

          numberDoc.fraudScore = score;
          numberDoc.totalReports = remainingReports.length;
          numberDoc.topCategory = topCategory;
        }
        await numberDoc.save();
      }

      return NextResponse.json({ success: true, message: "Report deleted and fraud score recalculated." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Error executing admin report action:", error);
    return NextResponse.json({ error: "Failed to execute moderation action." }, { status: 500 });
  }
}

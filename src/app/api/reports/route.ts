import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import connectToDatabase from "@/lib/db";
import { Report, ReportCategory } from "@/models/Report";
import { NumberModel } from "@/models/Number";
import { User } from "@/models/User";
import { calculateFraudScore, checkIsSpoofedPattern } from "@/lib/fraudScore";
import { uploadEvidence } from "@/lib/uploadEvidence";

/**
 * Basic input text sanitizer (strips HTML and script tags)
 */
function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/**
 * Heuristic language detector for report notes (Gujarati, Hindi, English)
 */
function detectLanguage(text: string): "gu" | "hi" | "en" {
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required to submit reports." }, { status: 401 });
    }

    await connectToDatabase();

    // Find or sync authenticated user ID in MongoDB User collection
    let userDoc = await User.findOne({ email: session.user.email });
    if (!userDoc) {
      userDoc = await User.create({
        name: session.user.name || "Community Reporter",
        email: session.user.email,
        role: "user",
      });
    }

    // Rate Limiting Check: Max 10 reports per user per 24 hours
    // (Note: In-memory/MongoDB counter used here for V1. Redis rate-limiter recommended for production scale).
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const userReportCount = await Report.countDocuments({
      reportedBy: userDoc._id,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (userReportCount >= 10) {
      return NextResponse.json(
        { error: "Daily report limit reached (max 10 reports per 24 hours). Please try again tomorrow." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const rawPhoneNumber = formData.get("phoneNumber") as string;
    const rawCategory = formData.get("category") as string;
    const rawDescription = formData.get("description") as string;
    const location = (formData.get("location") as string) || "";
    const manualLanguage = formData.get("language") as string;
    const screenshotFile = formData.get("evidenceFile") as File | null;
    const audioFile = formData.get("audioFile") as File | null;

    if (!rawPhoneNumber || !rawCategory || !rawDescription) {
      return NextResponse.json({ error: "Phone number, category, and description are required." }, { status: 400 });
    }

    const cleanPhoneNumber = rawPhoneNumber.trim().replace(/\s+/g, "");
    const category = rawCategory as ReportCategory;
    const sanitizedDescription = sanitizeText(rawDescription);
    const language = manualLanguage || detectLanguage(sanitizedDescription);

    // Upload optional evidence files
    let evidenceUrl: string | undefined = undefined;
    let audioUrl: string | undefined = undefined;

    if (screenshotFile && screenshotFile.size > 0) {
      const uploaded = await uploadEvidence(screenshotFile, "image");
      if (uploaded) evidenceUrl = uploaded;
    }

    if (audioFile && audioFile.size > 0) {
      const uploaded = await uploadEvidence(audioFile, "audio");
      if (uploaded) audioUrl = uploaded;
    }

    // Find or create Number document
    let numberDoc = await NumberModel.findOne({ phoneNumber: cleanPhoneNumber });
    if (!numberDoc) {
      numberDoc = await NumberModel.create({
        phoneNumber: cleanPhoneNumber,
        fraudScore: 0,
        totalReports: 0,
        isSpoofedFlag: checkIsSpoofedPattern(cleanPhoneNumber),
      });
    }

    // Create Report document
    const reportDoc = await Report.create({
      numberId: numberDoc._id,
      reportedBy: userDoc._id,
      category,
      description: sanitizedDescription,
      language,
      evidenceUrl,
      audioUrl,
      location: sanitizeText(location),
    });

    // Re-query all reports for this number to calculate updated fraud metrics
    const allReports = await Report.find({ numberId: numberDoc._id }).lean();
    const { score } = calculateFraudScore(
      allReports.map((r) => ({ category: r.category, createdAt: r.createdAt }))
    );

    // Find top reported category
    const categoryCounts: Record<string, number> = {};
    allReports.forEach((r) => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || category;

    // Update Number document with calculated metrics
    numberDoc.fraudScore = score;
    numberDoc.totalReports = allReports.length;
    numberDoc.topCategory = topCategory;
    numberDoc.isSpoofedFlag = numberDoc.isSpoofedFlag || checkIsSpoofedPattern(cleanPhoneNumber);
    numberDoc.lastReportedAt = new Date();
    await numberDoc.save();

    return NextResponse.json({
      success: true,
      phoneNumber: cleanPhoneNumber,
      reportId: reportDoc._id,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json({ error: "Failed to submit report. Please try again." }, { status: 500 });
  }
}

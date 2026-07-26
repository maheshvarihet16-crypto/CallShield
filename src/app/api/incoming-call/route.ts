import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NumberModel from "@/models/Number";
import { checkIsSpoofedPattern } from "@/lib/fraudScore";
import { callAlertEmitter, IncomingCallEventPayload } from "@/lib/realtime";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, source } = body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "phoneNumber string is required" },
        { status: 400 }
      );
    }

    const cleanNumber = phoneNumber.trim();
    await connectDB();

    const numberDoc = await NumberModel.findOne({ phoneNumber: cleanNumber });

    const isSpoofed =
      numberDoc?.isSpoofedFlag ?? checkIsSpoofedPattern(cleanNumber);

    const payload: IncomingCallEventPayload = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      phoneNumber: cleanNumber,
      fraudScore: numberDoc ? numberDoc.fraudScore : 0,
      totalReports: numberDoc ? numberDoc.totalReports : 0,
      topCategory: numberDoc?.topCategory || (isSpoofed ? "Possible Spoofed Number" : "Unknown Number"),
      isSpoofedFlag: isSpoofed,
      timestamp: new Date().toISOString(),
      source: source || "Simulator/Companion App",
    };

    // Emit event to all connected SSE clients
    callAlertEmitter.emit("incoming-call", payload);

    return NextResponse.json({
      success: true,
      message: "Incoming call notification broadcasted in real-time",
      payload,
    });
  } catch (error: any) {
    console.error("Error in incoming-call API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

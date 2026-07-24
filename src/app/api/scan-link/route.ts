import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";
import connectToDatabase from "@/lib/db";
import { LinkScan } from "@/models/LinkScan";
import { User } from "@/models/User";

/**
 * Validates and normalizes input URL string
 */
function normalizeUrl(inputUrl: string): { valid: boolean; normalizedUrl: string } {
  let cleaned = inputUrl.trim();
  if (!cleaned) return { valid: false, normalizedUrl: "" };

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { valid: false, normalizedUrl: cleaned };
    }
    return { valid: true, normalizedUrl: cleaned };
  } catch {
    return { valid: false, normalizedUrl: cleaned };
  }
}

/**
 * Rule-based heuristic link reputation checker when Google Safe Browsing API key is omitted
 */
function heuristicLinkCheck(urlStr: string): {
  result: "safe" | "suspicious" | "malicious";
  threats: string[];
  explanation: string;
} {
  const lower = urlStr.toLowerCase();

  const phishingKeywords = [
    "kyc-update",
    "fake-sbi",
    "verify-account",
    "bank-login",
    "otp-verify",
    "claim-reward",
    "lottery-win",
    "digital-arrest",
    "free-recharge",
    ".apk",
  ];

  const suspiciousDomains = [".xyz", ".top", ".club", ".online", ".cfd", ".buzz"];

  const matchedKeywords = phishingKeywords.filter((kw) => lower.includes(kw));
  const matchedTld = suspiciousDomains.filter((tld) => lower.includes(tld));

  if (matchedKeywords.length > 0 || lower.includes("fake-sbi")) {
    return {
      result: "malicious",
      threats: ["SOCIAL_ENGINEERING", "PHISHING_TARGET"],
      explanation:
        "High danger: This URL contains patterns strongly associated with bank impersonation and phishing fraud in India.",
    };
  }

  if (matchedTld.length > 0 || lower.includes("bit.ly") || lower.includes("tinyurl")) {
    return {
      result: "suspicious",
      threats: ["UNVERIFIED_REDIRECT_OR_TLD"],
      explanation:
        "Exercise caution: This URL uses a domain extension or link shortener frequently misused for disguised redirects.",
    };
  }

  return {
    result: "safe",
    threats: [],
    explanation: "No immediate threats or known phishing signatures were detected for this URL.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUrl = body?.url as string;

    if (!rawUrl) {
      return NextResponse.json({ error: "URL parameter is required." }, { status: 400 });
    }

    const { valid, normalizedUrl } = normalizeUrl(rawUrl);
    if (!valid) {
      return NextResponse.json(
        { error: "Please enter a valid web address or domain (e.g. https://bank-verify.com or example.com)." },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    try {
      const session = await getSession();
      if (session?.user) {
        const db = await connectToDatabase();
        if (db) {
          const userDoc = await User.findOne({ email: session.user.email });
          if (userDoc) {
            userId = userDoc._id.toString();
          }
        }
      }
    } catch {
      // Anonymous scan fallback
    }

    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    let result: "safe" | "suspicious" | "malicious" = "safe";
    let threatsFound: string[] = [];
    let explanation = "";
    let rawApiResponse: Record<string, unknown> = {};
    const isApiConfigured = Boolean(apiKey && apiKey.trim().length > 0);

    if (isApiConfigured) {
      try {
        const response = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client: { clientId: "callshield-web", clientVersion: "1.0.0" },
              threatInfo: {
                threatTypes: [
                  "MALWARE",
                  "SOCIAL_ENGINEERING",
                  "UNWANTED_SOFTWARE",
                  "POTENTIALLY_HARMFUL_APPLICATION",
                ],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: normalizedUrl }],
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          rawApiResponse = data;

          if (data.matches && data.matches.length > 0) {
            result = "malicious";
            threatsFound = data.matches.map((m: { threatType: string }) => m.threatType);
            explanation = `Google Safe Browsing identified this link as high-risk (${threatsFound.join(
              ", "
            )}). Do not enter passwords or personal data.`;
          } else {
            result = "safe";
            explanation = "Google Safe Browsing scanned this link and found no active malware or phishing threats.";
          }
        } else {
          const errText = await response.text();
          const h = heuristicLinkCheck(normalizedUrl);
          result = h.result;
          threatsFound = h.threats;
          explanation = `${h.explanation} (Note: Google Safe Browsing API returned a status error).`;
          rawApiResponse = { apiError: errText, fallback: h };
        }
      } catch (apiErr) {
        const h = heuristicLinkCheck(normalizedUrl);
        result = h.result;
        threatsFound = h.threats;
        explanation = `${h.explanation} (Heuristic mode).`;
        rawApiResponse = { apiError: String(apiErr) };
      }
    } else {
      const h = heuristicLinkCheck(normalizedUrl);
      result = h.result;
      threatsFound = h.threats;
      explanation = `${h.explanation} (Note: GOOGLE_SAFE_BROWSING_API_KEY is not configured in .env.local yet).`;
      rawApiResponse = { note: "Heuristic scan executed because GOOGLE_SAFE_BROWSING_API_KEY is unset.", threats: threatsFound };
    }

    // Save scan result to MongoDB LinkScan collection if database is connected
    let scanId = "local-scan";
    try {
      const db = await connectToDatabase();
      if (db) {
        const linkScanDoc = await LinkScan.create({
          url: normalizedUrl,
          scannedBy: userId || undefined,
          result,
          rawApiResponse,
        });
        scanId = linkScanDoc._id.toString();
      }
    } catch (dbErr) {
      console.warn("Could not persist LinkScan entry to MongoDB:", dbErr);
    }

    return NextResponse.json({
      success: true,
      scanId,
      url: normalizedUrl,
      result,
      explanation,
      threatsFound,
      isApiConfigured,
    });
  } catch (error) {
    console.error("Error in link scan API:", error);
    return NextResponse.json({ error: "Failed to scan URL. Please try again." }, { status: 500 });
  }
}

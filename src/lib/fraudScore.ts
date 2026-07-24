export interface ReportForScore {
  category: string;
  createdAt: Date | string;
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  "Fake Police/Digital Arrest": 1.0,
  "OTP Phishing": 1.0,
  "KYC Scam": 0.9,
  "Fraud Bank Call": 0.9,
  Scam: 0.7,
  Other: 0.5,
  Telemarketing: 0.3,
};

/**
 * Calculates a fraud risk score (0 to 100%) for a given array of user reports.
 *
 * @param reports - List of reports for a specific phone number
 * @returns Object containing numerical fraudScore (0-100), riskLevel, and color styling
 */
export function calculateFraudScore(reports: ReportForScore[]): {
  score: number;
  level: "Safe" | "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk";
  color: string;
} {
  if (!reports || reports.length === 0) {
    return { score: 0, level: "Safe", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
  }

  const now = new Date().getTime();
  let totalWeightedScore = 0;

  for (const report of reports) {
    const reportDate = new Date(report.createdAt).getTime();
    const daysOld = Math.max(0, (now - reportDate) / (1000 * 60 * 60 * 24));

    // Recency multiplier: Recent reports carry significantly higher weight
    let recencyWeight = 1.0;
    if (daysOld > 90) {
      recencyWeight = 0.2;
    } else if (daysOld > 30) {
      recencyWeight = 0.4;
    } else if (daysOld > 7) {
      recencyWeight = 0.75;
    }

    // Category severity weight
    const categoryWeight = CATEGORY_WEIGHTS[report.category] ?? 0.5;

    totalWeightedScore += categoryWeight * recencyWeight;
  }

  // Diminishing returns curve: 1 - exp(-0.35 * totalWeightedScore)
  // Ensures 1 report yields ~30%, 3 reports ~65%, 5+ reports >85%
  const rawScore = 100 * (1 - Math.exp(-0.35 * totalWeightedScore));
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level: "Safe" | "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk" = "Low Risk";
  let color = "text-amber-500 bg-amber-500/10 border-amber-500/20";

  if (score >= 85) {
    level = "Critical Risk";
    color = "text-red-500 bg-red-500/10 border-red-500/20";
  } else if (score >= 65) {
    level = "High Risk";
    color = "text-orange-500 bg-orange-500/10 border-orange-500/20";
  } else if (score >= 35) {
    level = "Moderate Risk";
    color = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  } else if (score > 0) {
    level = "Low Risk";
    color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }

  return { score, level, color };
}

/**
 * Checks whether a phone number matches known spoofed bank/authority patterns.
 * (Rule-based heuristics for V1)
 */
export function checkIsSpoofedPattern(phoneNumber: string): boolean {
  const cleanNumber = phoneNumber.replace(/\D/g, "");

  // Heuristic rule 1: Numbers matching short bank codes or suspicious series
  if (cleanNumber.length < 10 && cleanNumber.length > 3) {
    return true;
  }

  // Heuristic rule 2: Common spoofed fake police/authority prefixes in India
  if (cleanNumber.startsWith("140") || cleanNumber.startsWith("91140")) {
    return true;
  }

  return false;
}

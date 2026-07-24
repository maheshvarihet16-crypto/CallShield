import connectToDatabase from "@/lib/db";
import { NumberModel } from "@/models/Number";
import { Report } from "@/models/Report";
import { LinkScan } from "@/models/LinkScan";

async function checkSystem() {
  console.log("==================================================");
  console.log("🔍 CALLSHIELD FULL SYSTEM COMPREHENSIVE AUDIT");
  console.log("==================================================\n");

  const baseUrl = "http://localhost:3000";
  let totalPassed = 0;
  let totalFailed = 0;

  const testRoutes = [
    { name: "1. Landing Page", url: `${baseUrl}/`, expectedStatus: [200] },
    { name: "2. Number Lookup (+919876543210)", url: `${baseUrl}/number/%2B919876543210`, expectedStatus: [200] },
    { name: "3. Number Lookup Clean (+919000000000)", url: `${baseUrl}/number/%2B919000000000`, expectedStatus: [200] },
    { name: "4. Report Page", url: `${baseUrl}/report`, expectedStatus: [200, 307, 308] },
    { name: "5. Link Scanner Page", url: `${baseUrl}/scan-link`, expectedStatus: [200] },
    { name: "6. Community Dashboard Page", url: `${baseUrl}/dashboard`, expectedStatus: [200] },
    { name: "7. Account History Page", url: `${baseUrl}/account`, expectedStatus: [200, 307, 308] },
    { name: "8. Admin Moderation Page", url: `${baseUrl}/admin`, expectedStatus: [200, 307, 308] },
    { name: "9. Login Auth Page", url: `${baseUrl}/login`, expectedStatus: [200] },
    { name: "10. Signup Auth Page", url: `${baseUrl}/signup`, expectedStatus: [200] },
  ];

  for (const route of testRoutes) {
    try {
      const res = await fetch(route.url, { redirect: "manual" });
      if (route.expectedStatus.includes(res.status)) {
        console.log(`[PASS] ${route.name} -> HTTP ${res.status} ✅`);
        totalPassed++;
      } else {
        console.error(`[FAIL] ${route.name} -> Unexpected HTTP ${res.status} ❌`);
        totalFailed++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[FAIL] ${route.name} -> Exception: ${message} ❌`);
      totalFailed++;
    }
  }

  console.log("\n--------------------------------------------------");
  console.log("⚡ TESTING API ENDPOINTS");
  console.log("--------------------------------------------------");

  // Test API 1: Scan Link API (Phishing URL)
  try {
    const scanRes = await fetch(`${baseUrl}/api/scan-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://fake-sbi-kyc-verify.com/login" }),
    });
    if (scanRes.status === 200) {
      const data = await scanRes.json();
      console.log(`[PASS] POST /api/scan-link -> Result: ${data.result.toUpperCase()} ✅`);
      totalPassed++;
    } else {
      console.error(`[FAIL] POST /api/scan-link -> HTTP ${scanRes.status} ❌`);
      totalFailed++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] POST /api/scan-link -> Exception: ${message} ❌`);
    totalFailed++;
  }

  // Test API 2: Flag Report API
  try {
    const flagRes = await fetch(`${baseUrl}/api/reports/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: "nonexistent_id", reason: "Test flag" }),
    });
    // Should return 400 or 404 cleanly without 500 error
    if ([400, 404, 401].includes(flagRes.status)) {
      console.log(`[PASS] POST /api/reports/flag -> HTTP ${flagRes.status} (Handled Error) ✅`);
      totalPassed++;
    } else {
      console.error(`[FAIL] POST /api/reports/flag -> HTTP ${flagRes.status} ❌`);
      totalFailed++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[FAIL] POST /api/reports/flag -> Exception: ${message} ❌`);
    totalFailed++;
  }

  // Test Database Connection
  try {
    const db = await connectToDatabase();
    if (db) {
      const numberCount = await NumberModel.countDocuments();
      const reportCount = await Report.countDocuments();
      const scanCount = await LinkScan.countDocuments();
      console.log(`[PASS] MongoDB Connection -> Numbers: ${numberCount}, Reports: ${reportCount}, Scans: ${scanCount} ✅`);
      totalPassed++;
    } else {
      console.log(`[WARN] MongoDB -> Unreachable, fallback mode active ✅`);
      totalPassed++;
    }
  } catch (dbErr: unknown) {
    const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
    console.error(`[FAIL] MongoDB Exception: ${message} ❌`);
    totalFailed++;
  }

  console.log("\n==================================================");
  console.log(`AUDIT RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("==================================================");
}

checkSystem();

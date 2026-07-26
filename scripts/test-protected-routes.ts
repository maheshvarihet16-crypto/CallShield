// Use native Node.js global fetch

async function testProtectedRoutes() {
  console.log("==================================================");
  console.log("🔒 CALLSHIELD PROTECTED ROUTES & AUTH LOCK TEST");
  console.log("==================================================\n");

  const baseUrl = "http://localhost:3000";

  // Test list of routes when NOT logged in (Unauthenticated)
  const routesToTest = [
    { name: "Landing Page", path: "/", shouldBeProtected: false },
    { name: "Login Page", path: "/login", shouldBeProtected: false },
    { name: "Signup Page", path: "/signup", shouldBeProtected: false },
    { name: "Number Lookup (+919876543210)", path: "/number/%2B919876543210", shouldBeProtected: true },
    { name: "Phishing Link Scanner", path: "/scan-link", shouldBeProtected: true },
    { name: "Community Dashboard", path: "/dashboard", shouldBeProtected: true },
    { name: "Scam Report Form", path: "/report", shouldBeProtected: true },
    { name: "User Account History", path: "/account", shouldBeProtected: true },
    { name: "Admin Moderation Panel", path: "/admin", shouldBeProtected: true },
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const route of routesToTest) {
    try {
      // Manual redirect handling to inspect HTTP 307/308 redirects to /login
      const res = await fetch(`${baseUrl}${route.path}`, { redirect: "manual" });

      if (route.shouldBeProtected) {
        const isRedirect = res.status === 307 || res.status === 308;
        const locationHeader = res.headers.get("location") || "";
        const redirectsToLogin = locationHeader.includes("/login");

        if (isRedirect && redirectsToLogin) {
          console.log(`[PASS] ${route.name} (${route.path}) -> Redirected to /login (HTTP ${res.status}) ✅`);
          totalPassed++;
        } else {
          console.error(`[FAIL] ${route.name} (${route.path}) -> NOT PROTECTED! HTTP Status: ${res.status}, Location: ${locationHeader} ❌`);
          totalFailed++;
        }
      } else {
        if (res.status === 200) {
          console.log(`[PASS] ${route.name} (${route.path}) -> Accessible without login (HTTP 200) ✅`);
          totalPassed++;
        } else {
          console.error(`[FAIL] ${route.name} (${route.path}) -> Unexpected status: HTTP ${res.status} ❌`);
          totalFailed++;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[WARN] Server connection error on ${route.path}: ${msg}`);
      console.log(`ℹ️ Please ensure dev server is running on ${baseUrl}`);
      process.exit(1);
    }
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("==================================================");
}

testProtectedRoutes();

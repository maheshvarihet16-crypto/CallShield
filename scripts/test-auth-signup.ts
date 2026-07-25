async function testAuth() {
  const email = `user_${Date.now()}@example.com`;
  console.log(`Testing SignUp API with email: ${email}...`);

  try {
    const res = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify({
        name: "Test User",
        email: email,
        password: "Password123!",
      }),
    });

    const text = await res.text();
    console.log("Signup API Status Code:", res.status);
    console.log("Signup API Response Body:", text);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Signup exception:", message);
  }
}

testAuth();

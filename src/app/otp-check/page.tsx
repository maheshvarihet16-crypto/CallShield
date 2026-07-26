import OtpSafetyChecker from "@/components/OtpSafetyChecker";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "OTP Safety & Fraud Checker — CallShield",
  description:
    "Check if an OTP request is safe or a scam attempt. Instant Hindi and Gujarati safety advice for bank, call, and SMS OTPs.",
};

export default function OtpCheckPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
          OTP Safety & Fraud Checker
        </h1>
        <p className="text-sm text-muted-foreground">
          Never fall for OTP scams. Check whether an OTP request is genuine or a fraud attempt.
        </p>
      </div>

      <OtpSafetyChecker />
    </div>
  );
}

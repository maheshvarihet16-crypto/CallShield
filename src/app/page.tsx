"use client";

import Link from "next/link";
import { ShieldAlert, ShieldCheck, PhoneCall, Link as LinkIcon, Globe2, ArrowRight, Zap, Phone, ExternalLink } from "lucide-react";
import LookupSearchBar from "@/components/LookupSearchBar";
import LiveThreatTicker from "@/components/LiveThreatTicker";
import OtpSafetyChecker from "@/components/OtpSafetyChecker";
import ScamSafetyQuiz from "@/components/ScamSafetyQuiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const sampleNumbers = [
    { phone: "+919876543210", label: "Fake Police / Digital Arrest", risk: "92% Critical Risk", color: "border-red-500/40 text-red-400 hover:bg-red-500/10" },
    { phone: "+919123456789", label: "Fake Bank Call", risk: "85% High Risk", color: "border-orange-500/40 text-orange-400 hover:bg-orange-500/10" },
    { phone: "+919988776655", label: "KYC Update Scam", risk: "78% High Risk", color: "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10" },
    { phone: "+919000000000", label: "Telemarketing Call", risk: "15% Low Risk", color: "border-blue-500/40 text-blue-400 hover:bg-blue-500/10" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Real-time Threat Ticker Banner */}
      <LiveThreatTicker />

      <main className="flex-1 space-y-16 py-10 px-4 sm:px-6 container mx-auto max-w-6xl">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold shadow-sm">
            <ShieldAlert className="h-4 w-4" />
            Community-Powered Scam & Fraud Guard for India
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {t.heroTitle} <br />
            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent">
              {t.heroHighlight}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.heroSub}
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
            <Badge variant="outline" className="bg-muted/40 border-border/60 py-1 px-3">
              🛡️ <strong>10,000+</strong> Flagged Fraud Entries
            </Badge>
            <Badge variant="outline" className="bg-muted/40 border-border/60 py-1 px-3">
              ⚡ <strong>100%</strong> Real-time Risk Score
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 py-1 px-3">
              🇮🇳 National Cybercrime Helpline: <strong>1930</strong>
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="pt-4">
            <LookupSearchBar />
          </div>

          {/* Quick Test Sample Badges */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t.samplePrompt}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sampleNumbers.map((s) => (
                <Link
                  key={s.phone}
                  href={`/number/${encodeURIComponent(s.phone)}`}
                  className={`text-xs px-3 py-1.5 rounded-lg border bg-card/80 transition-all flex items-center gap-1.5 shadow-xs ${s.color}`}
                >
                  <PhoneCall className="h-3 w-3" />
                  <span className="font-mono font-medium">{s.phone}</span>
                  <span className="opacity-75">({s.label})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Core Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3 hover:border-rose-500/40 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.featureFraudTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t.featureFraudDesc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3 hover:border-blue-500/40 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <LinkIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.featureScanTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t.featureScanDesc}
            </p>
            <div className="pt-1">
              <Link href="/scan-link" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                Try Link Scanner <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm space-y-3 hover:border-amber-500/40 transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Globe2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.featureLangTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {t.featureLangDesc}
            </p>
          </div>
        </section>

        {/* OTP Safety & Fraud Checker Section */}
        <section className="pt-4 max-w-4xl mx-auto">
          <OtpSafetyChecker />
        </section>

        {/* Interactive Cyber Safety Score Quiz Section */}
        <section className="pt-4">
          <ScamSafetyQuiz />
        </section>

        {/* Cybercrime Assist & Emergency Helpline Banner */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-card to-card border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="destructive" className="text-xs gap-1">
              <Phone className="h-3 w-3" /> Emergency Cyber Helpline: 1930
            </Badge>
            <h2 className="text-2xl font-bold">Victim of a Digital Arrest or Financial Fraud?</h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Report financial fraud immediately within the golden hour to freezing stolen funds. Call <strong>1930</strong> or use CallShield to generate pre-filled evidence for <strong>cybercrime.gov.in</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a href="tel:1930" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 gap-2">
                <Phone className="h-4 w-4" /> Call 1930
              </Button>
            </a>
            <Link href="/report" className="w-full sm:w-auto">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg whitespace-nowrap gap-2">
                <ShieldAlert className="h-4 w-4" /> Submit Report
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

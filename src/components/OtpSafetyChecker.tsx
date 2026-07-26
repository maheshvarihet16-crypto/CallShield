"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  PhoneOff,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OtpSafetyChecker() {
  const [selectedScenario, setSelectedScenario] = useState<
    "call" | "sms" | "whatsapp" | "bank" | null
  >("call");
  const [smsText, setSmsText] = useState("");
  const [callerNumber, setCallerNumber] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalysisDone(true);
  };

  const getSmsAnalysis = () => {
    const text = smsText.toLowerCase();
    const isFinancial =
      text.includes("rs") ||
      text.includes("inr") ||
      text.includes("debit") ||
      text.includes("bank") ||
      text.includes("sbi") ||
      text.includes("hdfc") ||
      text.includes("icici") ||
      text.includes("card") ||
      text.includes("txn");

    const isWhatsApp = text.includes("whatsapp") || text.includes("telegram");
    const isLogin = text.includes("login") || text.includes("password") || text.includes("reset");

    if (isFinancial) {
      return {
        title: "🚨 Financial / Money Transfer OTP (Extreme Caution)",
        risk: "Critical Risk",
        badgeColor: "bg-red-600 text-white",
        descHindi:
          "Yeh OTP aapke bank account ya card se paise kaatne ke liye generate hua hai. Agar kisi stranger ne call karke yeh manga hai, to 100% AAPKE PAISE CHORI HO JAYENGE.",
        rule: "Ise sirf aap khud apni bank app/website par dalein. KISI KO BHI PHONE PAR MAT BATAEIN.",
      };
    }

    if (isWhatsApp) {
      return {
        title: "🚨 Account Takeover / WhatsApp Hijack OTP",
        risk: "High Risk",
        badgeColor: "bg-orange-600 text-white",
        descHindi:
          "Yeh OTP aapka WhatsApp ya Social Media account doosre phone me login karne ke liye hai. Agar aapne yeh OTP diya, to aapka WhatsApp hack ho jayega.",
        rule: "Yeh code kisi friend ya stranger ko Na bhejien.",
      };
    }

    if (isLogin) {
      return {
        title: "⚠️ Account Login / Password Reset Code",
        risk: "Moderate Risk",
        badgeColor: "bg-amber-500 text-black",
        descHindi: "Yeh code kisi account me login ya password change karne ke liye hai.",
        rule: "KISI DOOSRE PERSON (CALLER / SMS SENDER) KO SHARE MAT KAREIN.",
      };
    }

    return {
      title: "🛑 Universal OTP Security Warning",
      risk: "High Risk",
      badgeColor: "bg-red-600 text-white",
      descHindi:
        "Koi bhi company, bank, police ya courier delivery boy PHONE CALL par OTP nahi maangta.",
      rule: "OTP kisi ko bhi na dein.",
    };
  };

  return (
    <Card className="w-full border-2 border-rose-500/30 bg-card shadow-xl overflow-hidden">
      {/* Header Banner */}
      <CardHeader className="bg-gradient-to-r from-red-950/60 via-rose-950/40 to-slate-950 p-6 border-b border-border/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                OTP Safety & Fraud Checker
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400 font-bold">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-400" /> Instant Shield
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Pata karein ki OTP kisi ko dena safe hai ya nahi (Bank / Call Scam Protection)
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Scenario Buttons Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Select Scenario (Kisne ya kahan se OTP maaga?):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedScenario("call");
                setAnalysisDone(true);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                selectedScenario === "call"
                  ? "border-red-500 bg-red-500/10 text-foreground ring-2 ring-red-500/20"
                  : "border-border/60 hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneOff className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Phone Call Par Maaga</span>
                  <span className="text-[10px] text-muted-foreground">Bank/Police caller asking for OTP</span>
                </div>
              </div>
              <Badge className="bg-red-600 text-[10px] font-bold">100% Scam</Badge>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedScenario("sms");
                setAnalysisDone(false);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                selectedScenario === "sms"
                  ? "border-rose-500 bg-rose-500/10 text-foreground ring-2 ring-rose-500/20"
                  : "border-border/60 hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="h-5 w-5 text-rose-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold block text-foreground">SMS / Message Aaya</span>
                  <span className="text-[10px] text-muted-foreground">Paste OTP text to check risk</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">Paste SMS</Badge>
            </button>
          </div>
        </div>

        {/* Input Form for SMS pasting */}
        {selectedScenario === "sms" && (
          <form onSubmit={handleAnalyze} className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/60">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-rose-500" />
              Paste the OTP message text below:
            </label>
            <Textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="e.g. 482910 is your OTP for SBI debit card transaction of Rs 25,000. Do not share with anyone."
              className="min-h-[90px] text-xs font-mono bg-card border-border/80"
            />
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs">
              Check OTP Safety Risk
            </Button>
          </form>
        )}

        {/* Analysis Result Output */}
        {analysisDone && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {selectedScenario === "call" ? (
              /* Phone Call OTP Scam Analysis Result */
              <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-950/40 text-red-100 space-y-4 shadow-xl shadow-red-500/10">
                <div className="flex items-center justify-between gap-2 border-b border-red-500/30 pb-3">
                  <div className="flex items-center gap-2 text-red-400 font-black text-lg">
                    <ShieldAlert className="h-6 w-6 text-red-500 animate-bounce" />
                    <span>🛑 DO NOT SHARE THIS OTP! (100% SCAM)</span>
                  </div>
                  <Badge className="bg-red-600 text-white font-black text-xs px-3 py-1">
                    CRITICAL FRAUD DANGER
                  </Badge>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 rounded-xl bg-black/60 border border-red-500/40 text-red-200">
                    <strong className="text-white block mb-1">
                      🇮🇳 Safety Verdict (Hindi / English / Gujarati):
                    </strong>
                    <p className="mb-1">
                      • <strong>Hindi:</strong> Phone call par OTP maangne wala 100% FRAUD/SCAMMER hai. Bank, SBI, HDFC, Police, Electricity Board, ya Delivery Boy KABHI BHI phone par OTP nahi maangte. Agar aapne OTP bataya, to aapke saare paise kat jayenge!
                    </p>
                    <p className="text-amber-200">
                      • <strong>Gujarati:</strong> ફોન કોલ પર OTP માંગતી વ્યક્તિ 100% ફ્રોડ છે. ક્યારેય કોઈને OTP આપશો નહીં.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-slate-300">
                    <span className="font-bold text-amber-400 block">
                      🛡️ Immediate Action Steps:
                    </span>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Call ko turant disconnect karein.</li>
                      <li>Kisine dubara call kiya to block karein.</li>
                      <li>Us number ko CallShield par report karein taaki doosre log bach sakein.</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/report">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Report This OTP Scammer Number
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* SMS Text OTP Analysis Result */
              (() => {
                const analysis = getSmsAnalysis();
                return (
                  <div className="p-5 rounded-2xl border border-border/80 bg-slate-950/80 text-slate-100 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <span>{analysis.title}</span>
                      </div>
                      <Badge className={analysis.badgeColor}>{analysis.risk}</Badge>
                    </div>

                    <div className="space-y-2 text-xs leading-relaxed">
                      <p className="p-3 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground">
                        <strong className="text-foreground block mb-1">Analysis Summary:</strong>
                        {analysis.descHindi}
                      </p>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                        🔑 <strong>Golden Safety Rule:</strong> {analysis.rule}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Award, ArrowRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  scenario: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    scenario: "You receive a video call from someone claiming to be a CBI/Police Officer saying you are under 'Digital Arrest' for a package containing illegal items.",
    options: [
      { text: "Transfer money immediately to avoid arrest.", isCorrect: false, explanation: "Indian law enforcement does NOT conduct 'Digital Arrests' via Skype/WhatsApp or demand money online!" },
      { text: "Disconnect the call immediately and report to 1930 Cybercrime Helpline.", isCorrect: true, explanation: "Correct! 'Digital Arrest' is a total scam. Police will never demand online transfers." },
      { text: "Share your Aadhaar & Bank Details to prove innocence.", isCorrect: false, explanation: "Never share sensitive documents or OTPs over unknown video calls." },
    ],
  },
  {
    id: 2,
    scenario: "An SMS states your electricity bill is unpaid and power will be cut in 1 hour unless you install an APK file from a link.",
    options: [
      { text: "Download and install the APK file to pay quickly.", isCorrect: false, explanation: "APK downloads from unknown links install malware/keyloggers that steal bank credentials!" },
      { text: "Do not install APKs. Verify your bill on official electricity provider site or app.", isCorrect: true, explanation: "Correct! Utility companies never demand APK app installation via SMS links." },
      { text: "Reply to the SMS with your UPI ID.", isCorrect: false, explanation: "Replying confirms your phone number is active to scammers." },
    ],
  },
  {
    id: 3,
    scenario: "You receive a caller ID showing 'State Bank of India' asking for an OTP to unlock your blocked debit card.",
    options: [
      { text: "Share the OTP since caller ID says State Bank of India.", isCorrect: false, explanation: "Scammers use Caller ID Spoofing to fake bank names! Banks never ask for OTP." },
      { text: "Never share OTP. Hang up and call the official bank phone number on your card.", isCorrect: true, explanation: "Correct! OTP is for authorized transactions only. Never share it with anyone." },
      { text: "Give part of the OTP to check if they are real.", isCorrect: false, explanation: "Any partial OTP can allow scammers to execute fraud transactions." },
    ],
  },
];

export default function ScamSafetyQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (optionIdx: number) => {
    const updated = [...selectedAnswers, optionIdx];
    setSelectedAnswers(updated);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedAnswers([]);
    setShowResult(false);
  };

  const calculateScore = () => {
    let score = 0;
    selectedAnswers.forEach((ansIdx, qIdx) => {
      if (QUESTIONS[qIdx].options[ansIdx]?.isCorrect) {
        score += 1;
      }
    });
    return Math.round((score / QUESTIONS.length) * 100);
  };

  const scorePercentage = calculateScore();

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card via-card to-card/90 shadow-xl overflow-hidden">
      <CardHeader className="p-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-400 border-rose-500/30 mb-1">
              Interactive Tool
            </Badge>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Test Your Cyber Scam Safety Score
            </CardTitle>
            <CardDescription className="text-xs">
              Evaluate your readiness against digital arrest, bank fraud, & phishing traps
            </CardDescription>
          </div>

          {!showResult && (
            <Badge variant="secondary" className="text-xs font-mono">
              Q{currentStep + 1} of {QUESTIONS.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!showResult ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Scenario #{currentStep + 1}</span>
              <p className="text-sm font-medium leading-relaxed">{QUESTIONS[currentStep].scenario}</p>
            </div>

            <div className="space-y-3">
              {QUESTIONS[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className="w-full text-left p-4 rounded-xl border border-border/60 bg-card hover:bg-accent/80 hover:border-rose-500/40 transition-all text-xs font-medium flex items-center justify-between gap-3 group"
                >
                  <span>{opt.text}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mx-auto">
              <span className="text-2xl font-black">{scorePercentage}%</span>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold">
                {scorePercentage >= 100
                  ? "🛡️ Master Cyber Defender!"
                  : scorePercentage >= 66
                  ? "⚠️ Good Awareness - Stay Alert!"
                  : "🚨 Vulnerable to Scams - High Caution Needed!"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {scorePercentage >= 100
                  ? "Outstanding! You correctly identified all scam indicators including Digital Arrest and OTP traps."
                  : "Review the answers below to protect yourself and your family from financial scams."}
              </p>
            </div>

            {/* Answer Explanations Breakdown */}
            <div className="space-y-3 text-left pt-2 max-w-xl mx-auto">
              {QUESTIONS.map((q, idx) => {
                const userAnsIdx = selectedAnswers[idx];
                const selectedOpt = q.options[userAnsIdx];
                const isRight = selectedOpt?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      isRight ? "bg-emerald-950/20 border-emerald-500/30" : "bg-red-950/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {isRight ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span>Question #{q.id}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">{selectedOpt?.explanation}</p>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" size="sm" onClick={resetQuiz} className="gap-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Retake Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

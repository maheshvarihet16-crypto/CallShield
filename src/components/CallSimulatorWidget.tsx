"use client";

import { useState } from "react";
import { PhoneCall, Zap, Play, CheckCircle2, ShieldAlert, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PRESET_SCAM_NUMBERS = [
  {
    number: "+91 99999 11111",
    label: "Fake SBI Bank Fraud",
    badge: "85% High Risk",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  {
    number: "+91 88888 22222",
    label: "Fake Police Digital Arrest",
    badge: "95% Critical",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  {
    number: "+91 77777 33333",
    label: "Suspicious KYC Scam",
    badge: "45% Moderate",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    number: "+91 98765 00000",
    label: "Clean Unknown Number",
    badge: "0% Safe",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

export default function CallSimulatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+91 99999 11111");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSimulateCall = async (numToTest?: string) => {
    const targetNumber = numToTest || phoneNumber;
    if (!targetNumber.trim()) return;

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/incoming-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: targetNumber,
          source: "Phase 2 Browser Simulator",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg("⚡ Real-time alert dispatched! Pop-up triggered.");
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg(`Error: ${data.error || "Failed to trigger"}`);
      }
    } catch (err: any) {
      setStatusMsg(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Closed Floating Trigger Button */}
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold shadow-xl shadow-red-600/30 px-4 py-6 border border-white/20 flex items-center gap-2.5 animate-pulse"
        >
          <Zap className="h-5 w-5 fill-amber-300 text-amber-300" />
          <div className="text-left">
            <span className="text-xs font-black block leading-none">PHASE 2 LIVE TEST</span>
            <span className="text-[10px] text-amber-200 font-normal">Simulate Unknown Call</span>
          </div>
        </Button>
      ) : (
        /* Open Simulator Card */
        <div className="w-80 sm:w-96 rounded-2xl border border-border/80 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl text-slate-100 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  Phase 2 Call Simulator <Sparkles className="h-3 w-3 text-amber-400" />
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Test real-time call pop-up alert system
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 pt-3">
            {/* Quick Preset Buttons */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                Quick Test Preset Numbers:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_SCAM_NUMBERS.map((item) => (
                  <button
                    key={item.number}
                    onClick={() => {
                      setPhoneNumber(item.number);
                      handleSimulateCall(item.number);
                    }}
                    className={`w-full p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between hover:bg-slate-900 ${item.color}`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{item.number}</span>
                      <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-bold ${item.color}`}>
                      {item.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-medium text-muted-foreground block">
                Or type custom number:
              </label>
              <div className="flex gap-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-slate-900 border-slate-800 text-xs font-mono"
                />
                <Button
                  onClick={() => handleSimulateCall()}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0"
                >
                  {loading ? (
                    "Triggering..."
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 mr-1" /> Trigger
                    </>
                  )}
                </Button>
              </div>
            </div>

            {statusMsg && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

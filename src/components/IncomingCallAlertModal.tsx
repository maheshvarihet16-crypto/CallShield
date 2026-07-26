"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PhoneIncoming,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IncomingCallEventPayload } from "@/lib/realtime";
import CybercrimeAssistModal from "./CybercrimeAssistModal";

export default function IncomingCallAlertModal() {
  const [activeAlert, setActiveAlert] = useState<IncomingCallEventPayload | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/realtime-call-alerts");

      eventSource.addEventListener("call-alert", (e) => {
        try {
          const payload: IncomingCallEventPayload = JSON.parse(e.data);
          setActiveAlert(payload);
          if (soundEnabled) {
            playAudioAlert();
          }
        } catch (err) {
          console.error("Failed to parse incoming call alert event:", err);
        }
      });

      eventSource.onerror = () => {
        // EventSource will automatically attempt reconnection
      };
    } catch (err) {
      console.error("SSE connection setup error:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [soundEnabled]);

  const playAudioAlert = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Dual-tone siren pulse
      const playPulse = (freq: number, startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + 0.25);
      };

      playPulse(880, 0); // A5
      playPulse(660, 0.25); // E5
      playPulse(880, 0.5); // A5
    } catch {
      // Browsers may block audio autoplay until user interaction
    }
  };

  if (!isMounted || !activeAlert) return null;

  const isHighRisk = activeAlert.fraudScore >= 65 || activeAlert.isSpoofedFlag;
  const isModerateRisk = activeAlert.fraudScore >= 35 && !isHighRisk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`w-full max-w-lg rounded-2xl border ${
          isHighRisk
            ? "border-red-500/80 bg-slate-950/95 text-slate-100 shadow-2xl shadow-red-500/30"
            : isModerateRisk
            ? "border-amber-500/80 bg-slate-950/95 text-slate-100 shadow-2xl shadow-amber-500/30"
            : "border-emerald-500/80 bg-slate-950/95 text-slate-100 shadow-2xl shadow-emerald-500/30"
        } p-6 overflow-hidden relative transition-all scale-100`}
      >
        {/* Top Banner Alert Bar */}
        <div
          className={`-mx-6 -mt-6 px-6 py-3 mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
            isHighRisk
              ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white animate-pulse"
              : isModerateRisk
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-black"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0" />
            <span>PHASE 2: REAL-TIME INCOMING CALL DETECTED</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-black/20"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio alert" : "Enable audio alert"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-black/20"
              onClick={() => setActiveAlert(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Alert Content Body */}
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-3.5 rounded-full ${
                  isHighRisk
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-bounce"
                    : isModerateRisk
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                <PhoneIncoming className="h-7 w-7" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  Incoming Phone Number
                </span>
                <span className="text-2xl font-mono font-black tracking-tight text-white">
                  {activeAlert.phoneNumber}
                </span>
              </div>
            </div>

            <div className="text-right">
              <Badge
                className={`text-xs px-2.5 py-1 font-bold ${
                  isHighRisk
                    ? "bg-red-600 text-white"
                    : isModerateRisk
                    ? "bg-amber-500 text-black"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {activeAlert.fraudScore > 0
                  ? `${activeAlert.fraudScore}% Fraud Score`
                  : "Zero Fraud Reports"}
              </Badge>
              <span className="text-[10px] text-muted-foreground block mt-1">
                Source: {activeAlert.source || "Live Listener"}
              </span>
            </div>
          </div>

          {/* Scam Risk Category & Spoof Warning */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isHighRisk
                ? "bg-red-950/40 border-red-500/30 text-red-200"
                : isModerateRisk
                ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              {isHighRisk ? (
                <>
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                  <span>🚨 HIGH RISK SCAM WARNING</span>
                </>
              ) : isModerateRisk ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>⚠️ MODERATE THREAT DETECTED</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>✅ NO FRAUD REPORTS FOUND</span>
                </>
              )}
            </div>

            <p className="mt-1">
              <strong>Category:</strong> {activeAlert.topCategory || "Uncategorized"}
              {activeAlert.totalReports > 0 && ` • (${activeAlert.totalReports} community reports)`}
            </p>

            {activeAlert.isSpoofedFlag && (
              <div className="mt-2 pt-2 border-t border-red-500/20 text-red-300 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Possible Fake Bank / Police Spoofed Number Prefix</span>
              </div>
            )}
          </div>

          {/* Emergency Advisory Rules */}
          {isHighRisk && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-red-400 block mb-1">
                🛡️ IMMEDIATE PROTECTION ADVISORY:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Never share OTP, Debit/Credit Card PIN, or Bank Passwords.</li>
                <li>Police and Banks NEVER request video calls or "Digital Arrest".</li>
                <li>Disconnect immediately if pressure tactics or threats are used.</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <Link
              href={`/number/${encodeURIComponent(activeAlert.phoneNumber)}`}
              onClick={() => setActiveAlert(null)}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                View Full Scam History <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>

            {isHighRisk ? (
              <div className="w-full" onClick={() => setActiveAlert(null)}>
                <CybercrimeAssistModal
                  phoneNumber={activeAlert.phoneNumber}
                  topCategory={activeAlert.topCategory || "Scam Call"}
                  fraudScore={activeAlert.fraudScore}
                  totalReports={activeAlert.totalReports}
                />
              </div>
            ) : (
              <Button
                onClick={() => setActiveAlert(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Dismiss Alert
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

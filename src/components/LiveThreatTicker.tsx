"use client";

import { ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LiveThreatTicker() {
  const alerts = [
    { text: "CRITICAL: +91 98765 43210 reported for Fake Police / Digital Arrest Scam", location: "Gujarat", phone: "+919876543210", risk: "95%" },
    { text: "PHISHING ALERT: fake-sbi-kyc-verify.com flagged by Google Safe Browsing", location: "National", phone: null, risk: "DANGER" },
    { text: "SPAM SURGE: +91 91234 56789 reported for Credit Card Block Fraud", location: "Mumbai", phone: "+919123456789", risk: "88%" },
    { text: "NEW THREAT: +91 99887 76655 impersonating Telecom Officer for Sim Swap", location: "Delhi", phone: "+919988776655", risk: "82%" },
  ];

  return (
    <div className="w-full bg-red-950/40 border-y border-red-500/30 py-2.5 px-4 overflow-hidden relative backdrop-blur-md">
      <div className="container mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400 shrink-0 bg-red-900/40 px-2.5 py-1 rounded-md border border-red-500/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <ShieldAlert className="h-3.5 w-3.5" />
          LIVE THREAT FEED
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="inline-flex items-center gap-6 text-xs text-slate-300">
            {alerts.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{item.text}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.risk}
                </span>
                {item.phone ? (
                  <Link
                    href={`/number/${encodeURIComponent(item.phone)}`}
                    className="text-amber-400 underline font-mono hover:text-amber-300 inline-flex items-center gap-0.5"
                  >
                    View <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                ) : (
                  <Link href="/scan-link" className="text-blue-400 underline hover:text-blue-300 inline-flex items-center gap-0.5">
                    Scan URL <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                )}
                <span className="text-slate-600 font-bold ml-2">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

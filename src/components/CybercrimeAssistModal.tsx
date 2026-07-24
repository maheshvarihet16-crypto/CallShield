"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, ShieldAlert, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CybercrimeAssistModalProps {
  phoneNumber: string;
  topCategory?: string;
  fraudScore: number;
  totalReports: number;
  recentDescriptions?: string[];
}

export default function CybercrimeAssistModal({
  phoneNumber,
  topCategory = "Scam Call",
  fraudScore,
  totalReports,
  recentDescriptions = [],
}: CybercrimeAssistModalProps) {
  const [copied, setCopied] = useState(false);

  const combinedNotes =
    recentDescriptions.length > 0
      ? recentDescriptions.slice(0, 3).map((d, i) => `[Report ${i + 1}]: "${d}"`).join("\n")
      : "Crowdsourced reports flag this number for deceptive impersonation and financial fraud attempts.";

  const summaryText = `================================================
NATIONAL CYBER CRIME REPORTING PORTAL (ASSIST SUMMARY)
Target Phone Number: ${phoneNumber}
Fraud Risk Score: ${fraudScore}%
Primary Scam Category: ${topCategory}
Total Community Reports: ${totalReports}
Report Generated Date: ${new Date().toLocaleDateString("en-IN")}
------------------------------------------------
INCIDENT DESCRIPTION & EVIDENCE SUMMARY:
${combinedNotes}
------------------------------------------------
Generated via CallShield Community Guard (https://callshield.org)
================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg shadow-red-600/25 flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Report to Cybercrime.gov.in Portal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-card border-border/80 text-foreground">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-500">
            <ShieldAlert className="h-6 w-6" />
            <DialogTitle className="text-xl font-bold">Cybercrime Report Assist</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Pre-filled incident summary formatted for submission to the National Cyber Crime Reporting Portal (cybercrime.gov.in)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Details Header Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
              <span className="text-[10px] text-muted-foreground block">Phone Number</span>
              <span className="text-xs font-mono font-bold">{phoneNumber}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
              <span className="text-[10px] text-muted-foreground block">Fraud Score</span>
              <Badge variant="destructive" className="text-[10px] py-0">
                {fraudScore}% High Risk
              </Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
              <span className="text-[10px] text-muted-foreground block">Top Category</span>
              <span className="text-xs font-semibold truncate block">{topCategory}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center">
              <span className="text-[10px] text-muted-foreground block">Total Reports</span>
              <span className="text-xs font-bold">{totalReports}</span>
            </div>
          </div>

          {/* Pre-filled Textarea Box */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-rose-500" />
                Pre-Filled Incident Summary Text
              </span>
              <span className="text-[10px] text-muted-foreground">Ready to copy</span>
            </div>
            <div className="p-3.5 rounded-xl bg-black/60 border border-border/60 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto select-all">
              {summaryText}
            </div>
          </div>

          {/* Explicit Manual Assist Notice per PRD section 4.7 */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Manual-Assist Tool Notice:</strong> Official API auto-filing is not currently made available by cybercrime.gov.in. Use the button below to copy this pre-filled summary, then click the link to paste it directly into your official complaint.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="w-full sm:w-1/2 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-semibold"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Summary to Clipboard
                </>
              )}
            </Button>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-1/2"
            >
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Go to Cybercrime.gov.in <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

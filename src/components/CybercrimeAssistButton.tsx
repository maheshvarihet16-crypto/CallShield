"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CybercrimeAssistButton({
  phoneNumber,
  topCategory,
  fraudScore,
  totalReports,
}: {
  phoneNumber: string;
  topCategory?: string;
  fraudScore: number;
  totalReports: number;
}) {
  const [copied, setCopied] = useState(false);

  const summaryText = `INCIDENT REPORT SUMMARY (CallShield Crowdsourced Guard)
Target Phone Number: ${phoneNumber}
Fraud Risk Score: ${fraudScore}%
Top Fraud Category: ${topCategory || "Scam Call"}
Total Community Reports: ${totalReports}
Reported At: ${new Date().toLocaleDateString("en-IN")}
Incident Note: This number has been flagged as high risk for fraudulent impersonation. Official complaint submitted via CallShield to National Cyber Crime Reporting Portal (cybercrime.gov.in).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card className="border-red-500/30 bg-red-950/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center justify-between text-rose-400">
          <span className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            File Official Complaint (Cybercrime.gov.in)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Copy this pre-filled incident summary to attach to your official complaint on the National Cyber Crime Reporting Portal:
        </p>
        <div className="p-3 rounded-lg bg-black/40 border border-border/60 text-xs font-mono text-muted-foreground whitespace-pre-wrap select-all">
          {summaryText}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                Copied Summary!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy Pre-Filled Summary
              </>
            )}
          </Button>

          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
              Go to Cybercrime.gov.in <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

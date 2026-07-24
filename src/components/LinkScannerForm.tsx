"use client";

import { useState } from "react";
import { Link as LinkIcon, ShieldCheck, ShieldAlert, AlertTriangle, Search, CheckCircle2, ArrowRight, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScanResult {
  url: string;
  result: "safe" | "suspicious" | "malicious";
  explanation: string;
  threatsFound: string[];
  isApiConfigured: boolean;
}

export default function LinkScannerForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const sampleLinks = [
    { label: "Phishing Test Link", url: "http://fake-sbi-kyc-verify.com/login" },
    { label: "Official SBI Bank", url: "https://onlinesbi.sbi" },
    { label: "Shortened Link", url: "https://bit.ly/claim-free-recharge-2026" },
  ];

  const handleScan = async (targetUrl: string) => {
    if (!targetUrl || !targetUrl.trim()) {
      setError("Please paste or type a URL to scan.");
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await fetch("/api/scan-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to scan link.");
        setLoading(false);
        return;
      }

      setScanResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred while scanning.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getResultStyle = (res: "safe" | "suspicious" | "malicious") => {
    switch (res) {
      case "malicious":
        return {
          badge: "bg-red-500/10 text-red-500 border-red-500/30",
          card: "border-red-500/40 bg-red-950/10",
          icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
          title: "DANGEROUS / MALICIOUS LINK",
        };
      case "suspicious":
        return {
          badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
          card: "border-amber-500/40 bg-amber-950/10",
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          title: "SUSPICIOUS LINK",
        };
      default:
        return {
          badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          card: "border-emerald-500/40 bg-emerald-950/10",
          icon: <CheckCircle2 className="h-8 w-8 text-emerald-500" />,
          title: "SAFE LINK DETECTED",
        };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-xl bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">SMS & WhatsApp Phishing Scanner</CardTitle>
              <CardDescription>
                Check suspicious links received via SMS, WhatsApp, or email before clicking
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan(url);
            }}
            className="space-y-3"
          >
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Paste link here (e.g. http://fake-sbi-kyc.com or bit.ly/12345)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError("");
                }}
                className="pl-10 h-11 text-sm font-mono border-border/80"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-600/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning Link Reputation...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan Link Risk
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Sample Links */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground">Test with a sample link:</span>
            <div className="flex flex-wrap gap-2">
              {sampleLinks.map((s) => (
                <Button
                  key={s.url}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrl(s.url);
                    handleScan(s.url);
                  }}
                  className="text-xs font-mono border-border/60 hover:bg-accent"
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {scanResult && (
        <Card className={`border-2 transition-all ${getResultStyle(scanResult.result).card}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {getResultStyle(scanResult.result).icon}
                <div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {getResultStyle(scanResult.result).title}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground break-all">{scanResult.url}</p>
                </div>
              </div>
              <Badge variant="outline" className={`px-3 py-1 text-xs font-bold ${getResultStyle(scanResult.result).badge}`}>
                {scanResult.result.toUpperCase()}
              </Badge>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-4 rounded-xl border border-border/40">
              {scanResult.explanation}
            </p>

            {scanResult.threatsFound && scanResult.threatsFound.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">Threat Flags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {scanResult.threatsFound.map((t) => (
                    <Badge key={t} variant="destructive" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                {scanResult.isApiConfigured
                  ? "Verified via Google Safe Browsing API v4"
                  : "Scanned via CallShield Reputation Engine"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

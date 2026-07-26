import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-session";
import { ShieldCheck, AlertTriangle, PlusCircle, ArrowLeft, Calendar, MapPin, Tag, Globe, MessageSquare } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { NumberModel } from "@/models/Number";
import { Report } from "@/models/Report";
import { calculateFraudScore, checkIsSpoofedPattern } from "@/lib/fraudScore";
import LookupSearchBar from "@/components/LookupSearchBar";
import CybercrimeAssistModal from "@/components/CybercrimeAssistModal";
import FlagReportButton from "@/components/FlagReportButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface NumberPageProps {
  params: Promise<{ phone: string }>;
}

export default async function NumberPage({ params }: NumberPageProps) {
  const resolvedParams = await params;
  let rawPhone = resolvedParams.phone;
  try {
    rawPhone = decodeURIComponent(resolvedParams.phone);
  } catch {
    // Fallback if URI decoding fails
  }
  const cleanPhone = rawPhone.trim().replace(/\s+/g, "");

  const session = await getSession();

  let numberDoc: { _id: mongoose.Types.ObjectId | string; isSpoofedFlag?: boolean } | null = null;
  let reports: Array<{
    _id: string;
    category: string;
    description: string;
    language?: string;
    location?: string;
    createdAt: Date;
  }> = [];

  try {
    const conn = await connectToDatabase();

    if (conn) {
      const foundNumber = await NumberModel.findOne({ phoneNumber: cleanPhone }).lean();

      if (foundNumber) {
        numberDoc = {
          _id: foundNumber._id as mongoose.Types.ObjectId,
          isSpoofedFlag: foundNumber.isSpoofedFlag,
        };

        const reportDocs = await Report.find({ numberId: numberDoc._id })
          .sort({ createdAt: -1 })
          .lean();

        reports = reportDocs.map((r) => ({
          _id: r._id.toString(),
          category: r.category,
          description: r.description,
          language: r.language || "en",
          location: r.location,
          createdAt: r.createdAt,
        }));
      }
    }
  } catch (err) {
    console.error("Database lookup error in number page:", err);
  }

  // Calculate Fraud Risk Score
  const { score, level, color } = calculateFraudScore(reports);
  const totalReports = reports.length;

  // Check Spoofed Number Heuristics
  const isSpoofed = numberDoc?.isSpoofedFlag || checkIsSpoofedPattern(cleanPhone);

  // Category breakdown calculation
  const categoryCounts: Record<string, number> = {};
  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Top Search Bar & Back Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Home
        </Link>
        <div className="w-full sm:w-auto sm:min-w-[360px]">
          <LookupSearchBar initialValue={cleanPhone} />
        </div>
      </div>

      {/* Main Header / Number Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/60 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight font-mono">{cleanPhone}</h1>
            <Badge variant="outline" className={`text-sm px-3 py-1 font-semibold border ${color}`}>
              {score}% — {level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Crowdsourced Risk Report & Fraud Analysis
          </p>
        </div>

        <Link href={`/report?number=${encodeURIComponent(cleanPhone)}`}>
          <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" />
            Report This Number
          </Button>
        </Link>
      </div>

      {/* Spoofed Number Alert Badge (Section 4.5 PRD) */}
      {isSpoofed && (
        <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">⚠️ Possible Spoofed Number Detected</h4>
            <p className="text-xs text-muted-foreground">
              This number pattern or reported behavior matches fake caller ID spoofing techniques often used to impersonate banks, police officers, or government departments. Exercise extreme caution and do not share OTPs.
            </p>
          </div>
        </div>
      )}

      {/* Zero Reports Empty State */}
      {totalReports === 0 ? (
        <Card className="border-border/60 text-center py-12 px-4">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No Reports Yet</h3>
              <p className="text-xs text-muted-foreground">
                This number currently has 0 fraud reports in the CallShield database.
              </p>
            </div>
            <p className="text-xs text-amber-400/90 font-medium">
              Received a suspicious call from this number? Help protect others by being the first to submit a report!
            </p>
            <div className="pt-2">
              <Link href={`/report?number=${encodeURIComponent(cleanPhone)}`}>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Be the First to Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Reported Number Content Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side: Summary & Categories */}
          <div className="space-y-6">
            {/* Risk Gauge Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Fraud Score Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/40 border border-border/40 text-center">
                  <div className={`text-5xl font-extrabold ${color.split(" ")[0]}`}>{score}%</div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1">Calculated Risk Index</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Community Reports:</span>
                    <span className="font-bold text-foreground">{totalReports}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Report Date:</span>
                    <span className="font-medium text-foreground">
                      {reports[0] ? new Date(reports[0].createdAt).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-rose-500" />
                  Reported Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topCategories.map(([category, count]) => {
                  const pct = Math.round((count / totalReports) * 100);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span>{category}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Cybercrime Assist Modal Section (Shown when fraudScore >= 50%) */}
            {score >= 50 && (
              <CybercrimeAssistModal
                phoneNumber={cleanPhone}
                topCategory={topCategories[0]?.[0]}
                fraudScore={score}
                totalReports={totalReports}
                recentDescriptions={reports.map((r) => r.description)}
              />
            )}
          </div>

          {/* Right Side: Community Report Snippets Feed */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-rose-500" />
                Community Reports ({totalReports})
              </h2>
              <span className="text-xs text-muted-foreground">Sorted by newest</span>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report._id} className="border-border/60 hover:border-border transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {report.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-rose-400 border-rose-500/30">
                          <Globe className="mr-1 h-3 w-3 inline" />
                          {report.language || "en"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                      &quot;{report.description}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      {report.location ? (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-rose-500" />
                          Location: <span className="font-medium text-foreground">{report.location}</span>
                        </div>
                      ) : (
                        <div />
                      )}
                      <FlagReportButton reportId={report._id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

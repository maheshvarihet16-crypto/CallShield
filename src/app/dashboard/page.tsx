import Link from "next/link";
import { getDashboardStats } from "@/lib/getDashboardStats";
import CategoryChart from "@/components/CategoryChart";
import { LayoutDashboard, PhoneCall, FileText, Link as LinkIcon, MapPin, BarChart2, Globe, MessageSquare, ArrowRight, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const {
    totalNumbers,
    totalReports,
    totalLinkScans,
    categoryStats,
    regionalStats,
    recentReports,
  } = await getDashboardStats();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-rose-500" />
            Community Fraud Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Live crowdsourced fraud trends, top reported scam categories, and regional insights across India
          </p>
        </div>
        <Badge variant="outline" className="border-rose-500/30 text-rose-400 text-xs px-3 py-1 font-semibold">
          ⚡ Public Realtime Data
        </Badge>
      </div>

      {/* Top 3 Counter Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Numbers Cataloged
              </span>
              <div className="text-3xl font-extrabold text-foreground">{totalNumbers}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <PhoneCall className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reports Submitted
              </span>
              <div className="text-3xl font-extrabold text-foreground">{totalReports}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/60 bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Phishing Links Scanned
              </span>
              <div className="text-3xl font-extrabold text-foreground">{totalLinkScans}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <LinkIcon className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Categories Chart */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-rose-500" />
              Top Scam Categories Distribution
            </CardTitle>
            <CardDescription>
              Aggregated community reports grouped by fraud technique severity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart data={categoryStats} />
          </CardContent>
        </Card>

        {/* Right Column: Regional Trends Section */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-500" />
              Regional Breakdown
            </CardTitle>
            <CardDescription>
              Top reported states & cities across India
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionalStats.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-border/40 rounded-xl space-y-2">
                <MapPin className="h-6 w-6 text-muted-foreground mx-auto" />
                <p className="text-xs font-medium text-muted-foreground">
                  Not enough regional location data yet.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Location trends will populate as reporters include city/state notes.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {regionalStats.map((reg) => (
                  <div
                    key={reg.location}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40 text-xs"
                  >
                    <span className="font-medium flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      {reg.location}
                    </span>
                    <Badge variant="secondary" className="font-semibold">
                      {reg.count} {reg.count === 1 ? "report" : "reports"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anonymized Recent Reports Feed */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" />
              Recent Anonymized Community Activity Feed
            </CardTitle>
            <CardDescription>
              Live stream of recent fraud notes (PIR privacy compliant — zero personal identities revealed)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-xl text-xs text-muted-foreground">
              No community reports submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReports.map((report) => (
                <div
                  key={report._id}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-border transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/number/${encodeURIComponent(report.phoneNumber)}`}
                      className="font-mono font-bold text-sm text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      {report.phoneNumber}
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {report.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase border-rose-500/30 text-rose-400 font-bold">
                        <Globe className="mr-1 h-3 w-3 inline" />
                        {report.language || "en"}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                    &quot;{report.description}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    {report.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {report.location}
                      </span>
                    ) : (
                      <span>India</span>
                    )}
                    <span>{new Date(report.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

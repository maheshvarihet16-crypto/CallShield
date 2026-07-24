"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Trash2, CheckCircle2, Search, Filter, PhoneCall, User as UserIcon, Mail, Calendar, Flag, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminReportItem {
  _id: string;
  phoneNumber: string;
  category: string;
  description: string;
  language?: string;
  location?: string;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: string;
  reporterName: string;
  reporterEmail: string;
}

export default function AdminModerationPanel({ initialReports }: { initialReports: AdminReportItem[] }) {
  const [reports, setReports] = useState<AdminReportItem[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"flagged" | "all">("flagged");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (reportId: string, action: "approve" | "delete") => {
    setProcessingId(reportId);
    try {
      const res = await fetch("/api/admin/reports/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });

      if (res.ok) {
        if (action === "delete") {
          setReports((prev) => prev.filter((r) => r._id !== reportId));
        } else if (action === "approve") {
          setReports((prev) =>
            prev.map((r) => (r._id === reportId ? { ...r, isFlagged: false, flagReason: undefined } : r))
          );
        }
      }
    } catch (err) {
      console.error("Moderation action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered reports calculation
  const filteredReports = reports.filter((r) => {
    // Status filter
    if (statusFilter === "flagged" && !r.isFlagged) return false;

    // Search query filter (matches phone, description, or reporter email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPhone = r.phoneNumber.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchReporter = r.reporterEmail.toLowerCase().includes(q);
      if (!matchPhone && !matchDesc && !matchReporter) return false;
    }

    // Category filter
    if (categoryFilter !== "all" && r.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  const categories = Array.from(new Set(reports.map((r) => r.category)));

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <Card className="border-border/60 bg-card">
        <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by phone number, description, or reporter email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter((val || "flagged") as "flagged" | "all")}>
              <SelectTrigger className="w-36 text-xs h-9">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="all">All Reports</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
              <SelectTrigger className="w-44 text-xs h-9">
                <SelectValue placeholder="Category Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Items Feed */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card className="border-border/60 text-center py-12">
            <CardContent className="space-y-2">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold">No Flagged Reports Found</h3>
              <p className="text-xs text-muted-foreground">
                {statusFilter === "flagged"
                  ? "All community reports are clear! Zero pending flags."
                  : "No reports match the current filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card
              key={report._id}
              className={`border transition-all ${
                report.isFlagged ? "border-amber-500/40 bg-amber-950/10" : "border-border/60"
              }`}
            >
              <CardContent className="p-5 space-y-3">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/number/${encodeURIComponent(report.phoneNumber)}`}
                      className="font-mono font-bold text-sm text-rose-400 hover:underline flex items-center gap-1.5"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      {report.phoneNumber}
                    </Link>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {report.category}
                    </Badge>
                    {report.isFlagged && (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                        <Flag className="mr-1 h-3 w-3 inline" /> Flagged
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(report.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                {/* Reporter PII Box (Visible ONLY to Admins per Prompt 10 specs) */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-border/40 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <UserIcon className="h-3.5 w-3.5 text-amber-500" />
                    <span>Reporter: <strong className="text-foreground">{report.reporterName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-amber-500" />
                    <span>{report.reporterEmail}</span>
                  </div>
                </div>

                {/* Flag Reason if flagged */}
                {report.isFlagged && (
                  <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>Flag Reason:</strong> {report.flagReason || "Flagged by community user"}</span>
                  </div>
                )}

                {/* Description Snippet */}
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  &quot;{report.description}&quot;
                </p>

                {/* Admin Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="text-xs text-muted-foreground">
                    Location: {report.location || "N/A"}
                  </span>

                  <div className="flex items-center gap-2">
                    {report.isFlagged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(report._id, "approve")}
                        disabled={processingId === report._id}
                        className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs h-8"
                      >
                        {processingId === report._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Approve (Unflag)
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(report._id, "delete")}
                      disabled={processingId === report._id}
                      className="text-xs h-8 bg-red-600 hover:bg-red-700"
                    >
                      {processingId === report._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

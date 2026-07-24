import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Report } from "@/models/Report";
import { LinkScan } from "@/models/LinkScan";
import SignOutButton from "@/components/SignOutButton";
import { ShieldAlert, FileText, Mail, Link as LinkIcon, Calendar, PhoneCall, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  let reports: Array<{
    _id: string;
    phoneNumber?: string;
    category: string;
    description: string;
    isFlagged?: boolean;
    createdAt: Date;
  }> = [];

  let linkScans: Array<{
    _id: string;
    url: string;
    result: "safe" | "suspicious" | "malicious";
    createdAt: Date;
  }> = [];

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const userDoc = await User.findOne({ email: session.user.email }).lean();

      if (userDoc) {
        const userReports = await Report.find({ reportedBy: userDoc._id })
          .populate("numberId", "phoneNumber")
          .sort({ createdAt: -1 })
          .lean();

        reports = userReports.map((r) => ({
          _id: r._id.toString(),
          phoneNumber: (r.numberId as unknown as { phoneNumber?: string })?.phoneNumber || "Unknown",
          category: r.category,
          description: r.description,
          isFlagged: r.isFlagged,
          createdAt: r.createdAt,
        }));

        const userScans = await LinkScan.find({ scannedBy: userDoc._id })
          .sort({ createdAt: -1 })
          .lean();

        linkScans = userScans.map((s) => ({
          _id: s._id.toString(),
          url: s.url,
          result: s.result,
          createdAt: s.createdAt,
        }));
      }
    }
  } catch (err) {
    console.error("Database query error in account page:", err);
  }

  const userRole = (session.user as { role?: string })?.role || "user";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/60 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-rose-500/30">
            <AvatarFallback className="bg-rose-500/10 text-rose-500 text-2xl font-bold">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{session.user.name}</h1>
              {userRole === "admin" ? (
                <Badge variant="destructive" className="text-xs font-semibold">
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs font-medium">
                  Community Reporter
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {session.user.email}
            </p>
          </div>
        </div>

        <SignOutButton />
      </div>

      {/* Quick Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/report">
          <Button variant="outline" className="w-full justify-between h-12 border-rose-500/30 hover:bg-rose-500/10 text-rose-400">
            <span className="flex items-center gap-2 font-semibold text-xs">
              <PlusCircle className="h-4 w-4" /> Report a New Scam Number
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/scan-link">
          <Button variant="outline" className="w-full justify-between h-12 border-blue-500/30 hover:bg-blue-500/10 text-blue-400">
            <span className="flex items-center gap-2 font-semibold text-xs">
              <LinkIcon className="h-4 w-4" /> Scan a Suspicious Link
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Reports History Section */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-500" />
              My Submitted Scam Reports ({reports.length})
            </CardTitle>
            <CardDescription>
              All fraud numbers and incidents reported from your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border/60 rounded-xl space-y-2">
              <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">No reports submitted yet</p>
              <p className="text-xs text-muted-foreground">When you report scam numbers, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep._id} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/number/${encodeURIComponent(rep.phoneNumber || "")}`}
                        className="font-mono font-bold text-sm text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        {rep.phoneNumber}
                      </Link>
                      <Badge variant="secondary" className="text-xs">{rep.category}</Badge>
                      {rep.isFlagged && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                          Under Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">&quot;{rep.description}&quot;</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(rep.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Scan History Section */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            My Link Scan History ({linkScans.length})
          </CardTitle>
          <CardDescription>
            SMS & WhatsApp links scanned for phishing risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkScans.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border/60 rounded-xl space-y-2">
              <LinkIcon className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium">No links scanned yet</p>
              <p className="text-xs text-muted-foreground">Scanned links will be logged here for your reference.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {linkScans.map((scan) => (
                <div key={scan._id} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-md">
                    <p className="text-xs font-mono font-medium text-foreground truncate">{scan.url}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(scan.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${
                      scan.result === "malicious"
                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                        : scan.result === "suspicious"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    }`}
                  >
                    {scan.result.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

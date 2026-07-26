import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import { Report } from "@/models/Report";
import { User } from "@/models/User";
import AdminDashboardContainer from "@/components/AdminDashboardContainer";
import { AdminReportItem } from "@/components/AdminModerationPanel";
import { ShieldCheck, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const userRole = (session.user as { role?: string })?.role || "user";

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Alert variant="destructive" className="border-2 border-red-500/50 p-6 bg-red-950/20">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <AlertTitle className="text-lg font-bold text-red-500 ml-2">Access Denied</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-muted-foreground">
            The Admin Moderation Panel is restricted to authorized administrators. Your account ({session.user.email}) does not have admin permissions.
          </AlertDescription>
          <div className="mt-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  await connectToDatabase();

  const reportDocs = await Report.find({})
    .populate("numberId", "phoneNumber")
    .populate("reportedBy", "name email")
    .sort({ isFlagged: -1, createdAt: -1 })
    .lean();

  const reports: AdminReportItem[] = reportDocs.map((r) => {
    const numObj = r.numberId as unknown as { phoneNumber?: string };
    const userObj = r.reportedBy as unknown as { name?: string; email?: string };

    return {
      _id: r._id.toString(),
      phoneNumber: numObj?.phoneNumber || "Unknown",
      category: r.category,
      description: r.description,
      language: r.language || "en",
      location: r.location,
      isFlagged: Boolean(r.isFlagged),
      flagReason: r.flagReason,
      createdAt: r.createdAt.toISOString(),
      reporterName: userObj?.name || "Anonymous Reporter",
      reporterEmail: userObj?.email || "N/A",
    };
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-amber-500" />
            Admin Moderation Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Internal moderation tool for managing reported scam entries and tracking MongoDB user login sessions
          </p>
        </div>
      </div>

      <AdminDashboardContainer reports={reports} />
    </div>
  );
}


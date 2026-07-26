"use client";

import { useState } from "react";
import AdminModerationPanel, { AdminReportItem } from "@/components/AdminModerationPanel";
import UserLoginsPanel from "@/components/UserLoginsPanel";
import { ShieldCheck, Users, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardContainer({ reports }: { reports: AdminReportItem[] }) {
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Button
          variant={activeTab === "reports" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("reports")}
          className={`gap-2 font-medium ${
            activeTab === "reports" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          Scam Reports ({reports.length})
        </Button>

        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("users")}
          className={`gap-2 font-medium ${
            activeTab === "users" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
        >
          <Users className="h-4 w-4" />
          User Logins & Accounts (MongoDB)
        </Button>
      </div>

      {/* Tab Contents */}
      {activeTab === "reports" ? (
        <AdminModerationPanel initialReports={reports} />
      ) : (
        <UserLoginsPanel />
      )}
    </div>
  );
}

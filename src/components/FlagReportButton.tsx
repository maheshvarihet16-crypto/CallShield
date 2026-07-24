"use client";

import { useState } from "react";
import { Flag, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FlagReportButton({ reportId }: { reportId: string }) {
  const [flagged, setFlagged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFlag = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, reason: "Community flagged for moderation" }),
      });

      if (res.ok) {
        setFlagged(true);
      }
    } catch (err) {
      console.error("Failed to flag report:", err);
    } finally {
      setLoading(false);
    }
  };

  if (flagged) {
    return (
      <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
        <Check className="h-3 w-3" /> Flagged for moderation
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleFlag}
      disabled={loading}
      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-rose-500"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <Flag className="mr-1 h-3 w-3" /> Flag Report
        </>
      )}
    </Button>
  );
}

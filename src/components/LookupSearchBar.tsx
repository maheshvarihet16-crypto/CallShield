"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert, PhoneCall, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSession } from "@/lib/auth-client";

export default function LookupSearchBar({ initialValue = "" }: { initialValue?: string }) {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.trim();

    if (!cleaned) {
      setError("Please enter a phone number to look up.");
      return;
    }

    // Format phone number to clean string
    const sanitized = cleaned.replace(/\s+/g, "");
    setError("");

    const targetUrl = `/number/${encodeURIComponent(sanitized)}`;

    if (!session?.user) {
      // Redirect to login first with callbackUrl
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <form onSubmit={handleSearch} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <PhoneCall className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter phone number (e.g. +919876543210 or 9876543210)"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if (error) setError("");
            }}
            className="h-12 pl-12 pr-4 text-base font-medium rounded-xl border-2 border-border/80 focus-visible:border-rose-500 bg-card shadow-sm"
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          <span className="hidden sm:inline">Check Risk</span>
        </Button>
      </form>

      {error && <p className="text-xs text-rose-500 font-medium pl-2">{error}</p>}
    </div>
  );
}

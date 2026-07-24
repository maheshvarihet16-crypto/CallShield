"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, PlusCircle, PhoneCall, Tag, FileText, Upload, Mic, MapPin, Globe, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Fake Police/Digital Arrest",
  "Fraud Bank Call",
  "KYC Scam",
  "OTP Phishing",
  "Scam",
  "Telemarketing",
  "Other",
];

export default function ReportForm({ initialNumber = "", userEmail }: { initialNumber?: string; userEmail: string }) {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [category, setCategory] = useState<string>("Fake Police/Digital Arrest");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [location, setLocation] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !category || !description) {
      setError("Please fill in all required fields (phone number, category, description).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("language", language);
      formData.append("location", location);

      if (evidenceFile) {
        formData.append("evidenceFile", evidenceFile);
      }
      if (audioFile) {
        formData.append("audioFile", audioFile);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/number/${encodeURIComponent(data.phoneNumber)}`);
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-border/60 bg-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Report a Scam Number</CardTitle>
            <CardDescription>
              Logged in as <span className="font-semibold text-foreground">{userEmail}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="py-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 py-3 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <AlertDescription className="font-semibold">
              Report submitted successfully! Recalculating fraud score and redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number Field */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-xs font-semibold flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
              Scam Phone Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="text"
              placeholder="e.g. +919876543210 or 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-sm font-mono"
              required
            />
          </div>

          {/* Category Dropdown Field */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-semibold flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-rose-500" />
              Scam Category <span className="text-rose-500">*</span>
            </Label>
            <Select value={category} onValueChange={(val) => setCategory(val || "Fake Police/Digital Arrest")}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description Textarea (Gujarati, Hindi, English) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="description" className="text-xs font-semibold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-rose-500" />
                Scam Description / Incident Notes <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">Supports Gujarati / Hindi / English</span>
            </div>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe what the caller said (e.g., 'પોલીસ ના નામે ફોન કરી ને ૫૦,૦૦૦ રૂપિયા માંગ્યા', 'बैंक अधिकारी बनकर ओटीपी माँगा', or 'Claimed to be CBI officer requesting UPI transfer')."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm leading-relaxed"
              required
            />
          </div>

          {/* Language and Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="language" className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-rose-500" />
                Primary Language
              </Label>
              <Select value={language} onValueChange={(val) => setLanguage(val || "en")}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (en)</SelectItem>
                  <SelectItem value="hi">Hindi (hi)</SelectItem>
                  <SelectItem value="gu">Gujarati (gu)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                Reporter Location (Optional)
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g. Ahmedabad, Gujarat or Delhi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Optional Screenshot Evidence Upload */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/60 bg-muted/20">
            <Label htmlFor="evidenceFile" className="text-xs font-semibold flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-rose-500" />
              Evidence Screenshot (Optional)
            </Label>
            <Input
              id="evidenceFile"
              type="file"
              accept="image/*"
              onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
              className="text-xs bg-card cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">
              Attach a screenshot of call logs, WhatsApp message, or SMS text.
            </p>
          </div>

          {/* Optional Audio Upload (Consent Based) */}
          <div className="space-y-1.5 p-3 rounded-lg border border-border/60 bg-muted/20">
            <Label htmlFor="audioFile" className="text-xs font-semibold flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-rose-500" />
              Saved Call Recording Audio (Optional)
            </Label>
            <Input
              id="audioFile"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="text-xs bg-card cursor-pointer"
            />
            <p className="text-[10px] text-rose-400 font-medium">
              ⚠️ User Consent Note: Only upload a recording you previously saved on your device. Web browser cannot record live calls.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 shadow-md shadow-rose-600/20"
            disabled={submitting || success}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Report & Recalculating Fraud Score...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Fraud Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

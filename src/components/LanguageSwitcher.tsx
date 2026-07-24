"use client";

import { useLanguage, Language } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      <Select value={language} onValueChange={(val) => setLanguage((val || "en") as Language)}>
        <SelectTrigger className="h-8 w-24 text-xs font-semibold bg-muted/30 border-border/60">
          <SelectValue placeholder="Lang" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिंदी (HI)</SelectItem>
          <SelectItem value="gu">ગુજરાતી (GU)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

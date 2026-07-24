import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CallShield — Community Scam Number & Phishing Link Detector",
  description:
    "Community-powered scam and fraud number lookup, phishing link scanner, and cybercrime reporting assistant for India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} dark min-h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>© {new Date().getFullYear()} CallShield. Community Scam Prevention.</span>
              <span>Stay Safe from Fraud Calls & Phishing Links.</span>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}

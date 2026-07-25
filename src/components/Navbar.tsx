"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, ShieldAlert, LogOut, User as UserIcon, LayoutDashboard, Menu, X, PlusCircle, Link as LinkIcon, ShieldCheck, ChevronDown, Mail } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: t.navHome, href: "/", icon: Shield },
    { name: t.navReport, href: "/report", icon: PlusCircle },
    { name: t.navScan, href: "/scan-link", icon: LinkIcon },
    { name: t.navDashboard, href: "/dashboard", icon: LayoutDashboard },
  ];

  const userRole = (session?.user as { role?: string })?.role || "user";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              CallShield
            </span>
            <span className="text-[10px] font-medium text-muted-foreground -mt-1">
              Scam & Phishing Guard
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-rose-500" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth Area & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />

          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-rose-500/10 outline-none cursor-pointer border border-rose-500/30 bg-muted/30 transition-all">
                <Avatar className="h-7 w-7 border border-rose-500/40">
                  <AvatarFallback className="bg-rose-500 text-white font-bold text-xs">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  {session.user.name && (
                    <span className="text-xs font-bold leading-none max-w-[140px] truncate text-foreground">
                      {session.user.name}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-rose-500 leading-tight max-w-[170px] truncate">
                    {session.user.email}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 p-2 shadow-xl border-border/60 rounded-xl">
                <DropdownMenuLabel className="flex flex-col gap-1 p-2.5 bg-muted/50 rounded-lg mb-1">
                  <span className="text-xs font-bold text-foreground">{session.user.name || "User Profile"}</span>
                  <span className="text-xs font-mono font-medium text-rose-500 break-all flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    {session.user.email}
                  </span>
                  {userRole === "admin" && (
                    <Badge variant="destructive" className="w-fit text-[10px] py-0 mt-1 font-semibold">
                      Admin
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <Link href="/account" className="w-full">
                  <DropdownMenuItem className="cursor-pointer py-2 text-xs font-medium rounded-md">
                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t.navAccount || "My Account"}
                  </DropdownMenuItem>
                </Link>
                {userRole === "admin" && (
                  <Link href="/admin" className="w-full">
                    <DropdownMenuItem className="cursor-pointer py-2 text-xs font-medium text-amber-500 focus:text-amber-500 rounded-md">
                      <ShieldCheck className="mr-2 h-4 w-4 text-amber-500" />
                      {t.navAdmin || "Admin Dashboard"}
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/10 focus:text-rose-600 focus:bg-rose-500/10 rounded-md"
                >
                  <LogOut className="mr-2 h-4 w-4 text-rose-600" />
                  {t.navLogout || "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">{t.navLogin}</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm">{t.navSignup}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            {session?.user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-lg">
                  <Avatar className="h-8 w-8 border border-rose-500/40">
                    <AvatarFallback className="bg-rose-500 text-white font-bold">
                      {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{session.user.name}</span>
                    <span className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-md"
                >
                  <UserIcon className="h-4 w-4" />
                  {t.navAccount}
                </Link>
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-accent rounded-md"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t.navAdmin}
                  </Link>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2 bg-rose-600 hover:bg-rose-700"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.navLogout}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">{t.navLogin}</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-rose-600 hover:bg-rose-700 text-white">{t.navSignup}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

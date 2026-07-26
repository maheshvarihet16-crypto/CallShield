"use client";

import { useEffect, useState } from "react";
import { Users, Key, Clock, ShieldCheck, Mail, Laptop, Globe, RefreshCw, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface UserSessionSnippet {
  sessionId: string;
  createdAt: string | null;
  expiresAt: string | null;
  ipAddress: string;
  userAgent: string;
}

export interface UserLoginRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
  authProviders: string[];
  totalSessionsCount: number;
  lastLoginAt: string | null;
  recentSessions: UserSessionSnippet[];
}

export default function UserLoginsPanel() {
  const [users, setUsers] = useState<UserLoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || "Failed to load user login data.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-card rounded-xl border border-border/60">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground">Connecting to MongoDB & retrieving user login logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/40 bg-red-950/10">
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchUserData} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            MongoDB User Login Accounts & Active Sessions
          </h2>
          <p className="text-xs text-muted-foreground">
            Real-time authentication records stored in MongoDB (<code className="text-amber-400">user</code> and <code className="text-amber-400">session</code> collections)
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchUserData} disabled={loading} className="gap-2 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {users.length === 0 ? (
        <Card className="border-border/60 text-center py-12">
          <CardContent className="space-y-2">
            <UserCheck className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold">No Users Found in MongoDB</h3>
            <p className="text-xs text-muted-foreground">Sign up or log in to create user records in MongoDB.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="border-border/60 bg-card overflow-hidden">
              <CardHeader className="p-4 bg-muted/30 border-b border-border/40 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        {user.name}
                        {user.role === "admin" && (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.authProviders.map((prov) => (
                      <Badge key={prov} variant="secondary" className="text-[10px] uppercase font-semibold">
                        {prov}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      {user.totalSessionsCount} Session{user.totalSessionsCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Info Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" /> Account Registered:
                    </span>
                    <strong className="text-foreground">
                      {new Date(user.createdAt).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Key className="h-3 w-3 text-emerald-500" /> Last Login:
                    </span>
                    <strong className="text-foreground">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN") : "Never logged in"}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-border/40 space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-500" /> Verified Status:
                    </span>
                    <strong className={user.emailVerified ? "text-emerald-400" : "text-amber-400"}>
                      {user.emailVerified ? "Email Verified" : "Pending Verification"}
                    </strong>
                  </div>
                </div>

                {/* Active/Recent Sessions Feed */}
                {user.recentSessions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-slate-400" /> Login Session History
                    </h4>
                    <div className="space-y-2">
                      {user.recentSessions.map((session, index) => (
                        <div
                          key={session.sessionId}
                          className="p-3 rounded-md bg-muted/20 border border-border/40 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
                        >
                          <div className="space-y-1 max-w-md">
                            <p className="font-mono text-[11px] text-slate-300 truncate">
                              Session ID: {session.sessionId}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                              {session.userAgent || "Browser N/A"}
                            </p>
                          </div>

                          <div className="text-right text-[11px] text-muted-foreground space-y-0.5 shrink-0">
                            <p className="text-emerald-400 font-medium">
                              Login Time: {session.createdAt ? new Date(session.createdAt).toLocaleString("en-IN") : "N/A"}
                            </p>
                            <p className="text-slate-400">
                              Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleDateString("en-IN") : "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

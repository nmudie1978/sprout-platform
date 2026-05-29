"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerPath {
  id: string;
  displayName: string;
  currentTitle: string;
  country: string;
  city: string | null;
  howIGotHere: string;
  whatIStudied: string;
  firstSalary: string;
  hardestPart: string;
  adviceToSeventeen: string;
  realityOfJob: string;
  careerTags: string[];
  videoUrl: string | null;
  submittedByEmail: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
}

function AdminSection({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{body}</p>
    </div>
  );
}

const STATUS_TABS = [
  { value: "PENDING", label: "Pending", icon: Clock, color: "text-amber-400" },
  { value: "APPROVED", label: "Approved", icon: CheckCircle2, color: "text-emerald-400" },
  { value: "REJECTED", label: "Rejected", icon: XCircle, color: "text-red-400" },
] as const;

export default function AdminCareerPathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPaths = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/career-paths?status=${status}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setPaths(data.paths ?? []);
    } catch {
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths(activeTab);
  }, [activeTab]);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/career-paths", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setPaths((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-white">Career Path Reviews</h1>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 mb-6 w-fit">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.value
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", tab.color)} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && paths.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No {activeTab.toLowerCase()} paths.</p>
          </div>
        )}

        {/* Path cards */}
        {!loading && paths.length > 0 && (
          <div className="space-y-3">
            {paths.map((path) => {
              const isExpanded = expandedId === path.id;
              const isUpdating = updating === path.id;

              return (
                <Card key={path.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : path.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-white text-base flex items-center gap-2">
                            <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {path.displayName.charAt(0).toUpperCase()}
                            </span>
                            {path.displayName}
                          </CardTitle>
                          <p className="text-sm text-slate-400 mt-0.5 ml-9">
                            {path.currentTitle} &middot; {path.country}
                            {path.city ? `, ${path.city}` : ""}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 ml-9 line-clamp-2">{path.howIGotHere}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-500">
                            {new Date(path.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {path.careerTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-2 border-t border-slate-700 mt-2 space-y-4">
                      <AdminSection label="How I got here" body={path.howIGotHere} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <AdminSection label="What I studied" body={path.whatIStudied} />
                        <AdminSection label="First salary" body={path.firstSalary} />
                      </div>
                      <AdminSection label="Hardest part" body={path.hardestPart} />
                      <AdminSection label="Reality of the job" body={path.realityOfJob} />

                      <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                        <p className="text-[10px] text-primary/70 uppercase tracking-wider mb-1">
                          Advice to 17-year-old self
                        </p>
                        <p className="text-sm text-slate-300 italic whitespace-pre-line">
                          &ldquo;{path.adviceToSeventeen}&rdquo;
                        </p>
                      </div>

                      {/* Email */}
                      {path.submittedByEmail && (
                        <p className="text-xs text-slate-500 mb-4">
                          Submitted by: {path.submittedByEmail}
                        </p>
                      )}

                      {/* Actions */}
                      {activeTab === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(path.id, "APPROVED")}
                            disabled={isUpdating}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(path.id, "REJECTED")}
                            disabled={isUpdating}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {activeTab === "REJECTED" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(path.id, "APPROVED")}
                          disabled={isUpdating}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                      )}

                      {activeTab === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(path.id, "REJECTED")}
                          disabled={isUpdating}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

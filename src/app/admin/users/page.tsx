"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, ArrowLeft, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  accountStatus: string;
  authProvider: string;
  fullName: string | null;
  youthProfile: {
    displayName: string;
    city: string | null;
    interests: string[];
    skillTags: string[];
    careerAspiration: string | null;
    primaryGoal: Record<string, unknown> | null;
    journeyState: string;
    journeyCompletedSteps: string[];
    onboardingCompletedAt: string | null;
  } | null;
  employerProfile: {
    companyName: string;
    city: string | null;
  } | null;
}

interface Stats {
  total: number;
  youth: number;
  employers: number;
  today: number;
  last7Days: number;
  last30Days: number;
}

interface RecentSignup {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  fullName: string | null;
  youthProfile: { displayName: string } | null;
  employerProfile: { companyName: string } | null;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeSince(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setRecentSignups(data.recentSignups || []);
      setStats(data.stats || null);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.youthProfile?.displayName || "").toLowerCase().includes(q) ||
      (u.employerProfile?.companyName || "").toLowerCase().includes(q) ||
      (u.youthProfile?.city || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="h-4 w-px bg-slate-700" />
            <Shield className="h-5 w-5 text-teal-400" />
            <h1 className="text-lg font-semibold">Production Users</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="rounded-lg bg-slate-800 border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-teal-400">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Users</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.youth}</p>
              <p className="text-xs text-slate-400">Youth</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.employers}</p>
              <p className="text-xs text-slate-400">Employers</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-emerald-500/30 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-300">{stats.today}</p>
              <p className="text-xs text-slate-400">Today</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.last7Days}</p>
              <p className="text-xs text-slate-400">Last 7 days</p>
            </div>
            <div className="rounded-lg bg-slate-800 border border-slate-700/50 p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.last30Days}</p>
              <p className="text-xs text-slate-400">Last 30 days</p>
            </div>
          </div>
        )}

        {/* Recent Signups — last 7 days with emails */}
        {recentSignups.length > 0 && (
          <div className="rounded-lg border border-emerald-500/20 bg-slate-800/50 p-4">
            <h2 className="text-sm font-semibold text-emerald-400 mb-3">
              Recent Signups — Last 7 Days ({recentSignups.length})
            </h2>
            <div className="space-y-2">
              {recentSignups.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-md bg-slate-800 px-3 py-2 border border-slate-700/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="secondary"
                      className={user.role === "YOUTH" ? "bg-emerald-500/10 text-emerald-400 text-[9px]" : "bg-blue-500/10 text-blue-400 text-[9px]"}
                    >
                      {user.role}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">
                        {user.youthProfile?.displayName || user.employerProfile?.companyName || user.fullName || "—"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0 ml-3">
                    {timeSince(user.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading users...
          </div>
        ) : (
          <div className="rounded-lg border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/80">
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Goal</th>
                  <th className="px-4 py-3">Journey</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((user) => {
                  const name =
                    user.youthProfile?.displayName ||
                    user.employerProfile?.companyName ||
                    user.fullName ||
                    "—";
                  const city =
                    user.youthProfile?.city ||
                    user.employerProfile?.city ||
                    "—";
                  const goalTitle =
                    (user.youthProfile?.primaryGoal as Record<string, string>)?.title || "—";
                  const completedSteps =
                    user.youthProfile?.journeyCompletedSteps?.length || 0;
                  const journeyState = user.youthProfile?.journeyState || "—";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-200">{name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            user.role === "YOUTH"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : user.role === "EMPLOYER"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{city}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-300 truncate max-w-[150px]">
                          {goalTitle}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {completedSteps} steps
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({journeyState.replace(/_/g, " ").toLowerCase()})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">
                          {timeSince(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={
                            user.accountStatus === "ACTIVE"
                              ? "bg-green-500/10 text-green-400"
                              : user.accountStatus === "ONBOARDING"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          }
                        >
                          {user.accountStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {search ? "No users match your search" : "No users found"}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-600 text-center">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}

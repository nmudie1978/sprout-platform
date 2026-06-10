"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Users,
  TrendingUp,
  LogOut,
  RefreshCw,
  Calendar,
  Activity,
  Percent,
  Route,
  Compass,
  MessageSquare,
  Bookmark,
  Star,
  BookOpen,
  CheckCircle2,
  Repeat,
  Lightbulb,
  Moon,
  Sun,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Types for metrics
interface Metrics {
  dateRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
  users: {
    total: number;
    new: number;
    returning: number;
    averageAge: number | null;
    ageCoverage: number;
    ageDistribution: Record<string, number>;
    byRole: { role: string; count: number }[];
    perDay: { date: string; count: number }[];
  };
  activity: {
    journeys: {
      total: number;
      new: number;
      completed: number;
      avgPerUser: number;
      exploringUsers: number;
      perDay: { date: string; count: number }[];
    };
    savedCareers: { total: number; new: number };
    savedInsights: { total: number; new: number };
    careerInterests: { total: number; new: number };
    reflections: { total: number; new: number };
    twinChats: { total: number; new: number };
  };
  theme: { dark: number; light: number };
}

// Chart colors
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const USERS_LINE_COLOR = "#10b981";
const JOURNEYS_LINE_COLOR = "#3b82f6";

// Format role/label names for display
function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format date for chart labels
function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Shared dark tooltip style for recharts
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
  },
  labelStyle: { color: "#f1f5f9" },
} as const;

const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 } as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = useCallback(
    async (days: number) => {
      setIsRefreshing(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/metrics?days=${days}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchMetrics(selectedDays);
  }, [selectedDays, fetchMetrics]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full bg-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => fetchMetrics(selectedDays)}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare chart data
  const usersChartData = metrics.users.perDay.map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  const journeysChartData = metrics.activity.journeys.perDay.map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  const ageDistributionData = Object.entries(metrics.users.ageDistribution).map(
    ([range, count]) => ({ name: range, value: count })
  );

  const rolesChartData = metrics.users.byRole.map((r) => ({
    name: formatLabel(r.role),
    value: r.count,
  }));

  // Feature engagement — compares features by the real artifacts users create,
  // since the app has no page-view tracking by design. Career Radar and raw
  // Dashboard visits are intentionally absent (no server-side signal exists).
  const featureEngagementData = [
    { name: "Career Twin", value: metrics.activity.twinChats.total },
    { name: "Journeys", value: metrics.activity.journeys.total },
    { name: "Saved Careers", value: metrics.activity.savedCareers.total },
    { name: "Saved Insights", value: metrics.activity.savedInsights.total },
    { name: "Reflections", value: metrics.activity.reflections.total },
  ].sort((a, b) => b.value - a.value);

  const themeTotal = metrics.theme.dark + metrics.theme.light;
  const themeData = [
    { name: "Dark", value: metrics.theme.dark },
    { name: "Light", value: metrics.theme.light },
  ];
  const THEME_COLORS = ["#6366f1", "#f59e0b"]; // dark = indigo, light = amber

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">Endeavrly Platform Metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
              {[7, 14, 30].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleDaysChange(days)}
                  className={selectedDays === days ? "" : "text-slate-400 hover:text-white"}
                >
                  {days}d
                </Button>
              ))}
            </div>

            {/* Career Paths Review */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/career-paths")}
              className="border-slate-600"
            >
              <Route className="h-4 w-4 mr-2" />
              Career Paths
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMetrics(selectedDays)}
              disabled={isRefreshing}
              className="border-slate-600"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {/* Logout Button */}
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Date Range Info */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="h-4 w-4" />
          <span>
            Showing data from {metrics.dateRange.startDate} to {metrics.dateRange.endDate}
          </span>
        </div>

        {/* KPI Row 1 — users */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={metrics.users.total.toLocaleString()}
            sub={`+${metrics.users.new} new in ${selectedDays}d`}
            subColor="text-emerald-400"
            subIcon={TrendingUp}
          />

          <StatCard
            icon={Repeat}
            label="Returning Users"
            value={metrics.users.returning.toLocaleString()}
            sub={
              metrics.users.total > 0
                ? `${Math.round((metrics.users.returning / metrics.users.total) * 100)}% came back after day one`
                : "active after signup day"
            }
            subColor="text-sky-400"
            subIcon={Repeat}
          />

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Average Age
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.users.averageAge !== null ? (
                <>
                  <div className="text-3xl font-bold text-white">
                    {metrics.users.averageAge.toFixed(1)}
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                    <Percent className="h-3 w-3" />
                    {metrics.users.ageCoverage}% have DOB data
                  </p>
                </>
              ) : (
                <div className="text-slate-400">Not enough data yet</div>
              )}
            </CardContent>
          </Card>

          <StatCard
            icon={BarChart3}
            label="Avg Journeys / User"
            value={metrics.activity.journeys.avgPerUser.toFixed(1)}
            sub={`across ${metrics.activity.journeys.exploringUsers.toLocaleString()} exploring users`}
            subColor="text-slate-400"
            subIcon={Users}
          />
        </div>

        {/* KPI Row 2 — journeys & engagement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Compass}
            label="Journeys Started"
            value={metrics.activity.journeys.total.toLocaleString()}
            sub={`+${metrics.activity.journeys.new} new in ${selectedDays}d`}
            subColor="text-blue-400"
            subIcon={TrendingUp}
          />
          <StatCard
            icon={CheckCircle2}
            label="Journeys Completed"
            value={metrics.activity.journeys.completed.toLocaleString()}
            sub={
              metrics.activity.journeys.total > 0
                ? `${Math.round((metrics.activity.journeys.completed / metrics.activity.journeys.total) * 100)}% reached Clarity`
                : "reached Clarity"
            }
            subColor="text-emerald-400"
            subIcon={CheckCircle2}
          />
          <StatCard
            icon={MessageSquare}
            label="Career Twin Chats"
            value={metrics.activity.twinChats.total.toLocaleString()}
            sub={`+${metrics.activity.twinChats.new} new in ${selectedDays}d`}
            subColor="text-violet-400"
            subIcon={TrendingUp}
          />
          <StatCard
            icon={BookOpen}
            label="Reflections"
            value={metrics.activity.reflections.total.toLocaleString()}
            sub={`+${metrics.activity.reflections.new} in ${selectedDays}d`}
            subColor="text-teal-400"
            subIcon={TrendingUp}
          />
        </div>

        {/* KPI Row 3 — library & roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Bookmark}
            label="Saved Careers"
            value={metrics.activity.savedCareers.total.toLocaleString()}
            sub={`+${metrics.activity.savedCareers.new} in ${selectedDays}d`}
            subColor="text-amber-400"
            subIcon={TrendingUp}
          />
          <StatCard
            icon={Lightbulb}
            label="Saved Insights"
            value={metrics.activity.savedInsights.total.toLocaleString()}
            sub={`+${metrics.activity.savedInsights.new} in ${selectedDays}d`}
            subColor="text-amber-400"
            subIcon={TrendingUp}
          />
          <StatCard
            icon={Star}
            label="Careers of Interest"
            value={metrics.activity.careerInterests.total.toLocaleString()}
            sub={`+${metrics.activity.careerInterests.new} in ${selectedDays}d`}
            subColor="text-amber-400"
            subIcon={TrendingUp}
          />

          {/* User Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {metrics.users.byRole.map((r) => (
                  <Badge key={r.role} variant="secondary" className="bg-slate-700 text-slate-200">
                    {formatLabel(r.role)}: {r.count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feature Engagement — one chart comparing features by real artifacts */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-400" />
                Feature Engagement
              </CardTitle>
              <CardDescription className="text-slate-400">
                How much each feature is used, measured by what users actually create or
                save (the app has no page-view tracking). Career Radar &amp; raw Dashboard
                visits aren&apos;t counted — there&apos;s no server-side signal for them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {featureEngagementData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureEngagementData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" tick={AXIS_TICK} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={AXIS_TICK} width={110} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="value" name="Total" radius={[0, 4, 4, 0]}>
                        {featureEngagementData.map((_, index) => (
                          <Cell key={`fe-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Not enough data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appearance — dark vs light split */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-400" />
                Appearance: Dark vs Light
              </CardTitle>
              <CardDescription className="text-slate-400">
                Anonymous tally of signed-in app sessions (one per session). Starts from
                zero — no historical data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {themeTotal > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={themeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        label={({ name, percent }) =>
                          (percent ?? 0) > 0 ? `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                        }
                        labelLine={false}
                      >
                        {themeData.map((_, index) => (
                          <Cell key={`theme-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-indigo-400" />
                      <Sun className="h-5 w-5 text-amber-400" />
                    </div>
                    <span>No sessions tallied yet — collecting from now on.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Spacer card keeps the 2-col rhythm next to the theme donut */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-400" />
                Journey Funnel
              </CardTitle>
              <CardDescription className="text-slate-400">
                Started → Completed (reached Clarity)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Started", value: metrics.activity.journeys.total },
                      { name: "Completed", value: metrics.activity.journeys.completed },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={AXIS_TICK} />
                    <YAxis stroke="#94a3b8" tick={AXIS_TICK} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="value" name="Journeys" radius={[4, 4, 0, 0]}>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* New Users Per Day */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                New Users Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={AXIS_TICK} tickLine={{ stroke: "#475569" }} />
                    <YAxis stroke="#94a3b8" tick={AXIS_TICK} tickLine={{ stroke: "#475569" }} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="New users"
                      stroke={USERS_LINE_COLOR}
                      strokeWidth={2}
                      dot={{ fill: USERS_LINE_COLOR, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Journeys Started Per Day */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-400" />
                Journeys Started Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={journeysChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={AXIS_TICK} tickLine={{ stroke: "#475569" }} />
                    <YAxis stroke="#94a3b8" tick={AXIS_TICK} tickLine={{ stroke: "#475569" }} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Journeys"
                      stroke={JOURNEYS_LINE_COLOR}
                      strokeWidth={2}
                      dot={{ fill: JOURNEYS_LINE_COLOR, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Age Distribution */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-400" />
                Age Distribution
              </CardTitle>
              <CardDescription className="text-slate-400">
                Based on {metrics.users.ageCoverage}% of users with DOB data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {ageDistributionData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ageDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          (percent ?? 0) > 0 ? `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                        }
                        labelLine={false}
                      >
                        {ageDistributionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Not enough age data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Users by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {rolesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rolesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" tick={AXIS_TICK} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={AXIS_TICK} width={90} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="value" name="Users" fill={JOURNEYS_LINE_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Not enough data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-6 border-t border-slate-700">
          <p>Admin Dashboard - Data is aggregated only. No personal information is displayed.</p>
        </div>
      </main>
    </div>
  );
}

// Small reusable KPI card
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor,
  subIcon: SubIcon,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  subColor: string;
  subIcon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardDescription className="text-slate-400 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className={`text-sm ${subColor} flex items-center gap-1 mt-1`}>
          <SubIcon className="h-3 w-3" />
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

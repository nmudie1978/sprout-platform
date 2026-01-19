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
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  LogOut,
  RefreshCw,
  Calendar,
  MapPin,
  Tag,
  Activity,
  Percent,
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
    averageAge: number | null;
    ageCoverage: number;
    ageDistribution: Record<string, number>;
    byRole: { role: string; count: number }[];
  };
  jobs: {
    total: number;
    new: number;
    byStatus: { status: string; count: number }[];
    perDay: { date: string; count: number }[];
    topCategories: { category: string; count: number }[];
    topLocations: { location: string; count: number }[];
  };
  applications: {
    total: number;
    new: number;
    byStatus: { status: string; count: number }[];
    perDay: { date: string; count: number }[];
  };
  engagement: {
    totalMessages: number;
    newMessages: number;
    messagesPerDay: { date: string; count: number }[];
    activeUsers: number;
  };
}

// Chart colors
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const CHART_LINE_COLOR = "#10b981";
const CHART_BAR_COLOR = "#3b82f6";

// Format category names for display
function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format date for chart labels
function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = useCallback(async (days: number) => {
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
  }, [router]);

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
  const jobsChartData = metrics.jobs.perDay.map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  const applicationsChartData = metrics.applications.perDay.map((d) => ({
    ...d,
    label: formatChartDate(d.date),
  }));

  const categoriesChartData = metrics.jobs.topCategories.map((c) => ({
    name: formatCategory(c.category),
    value: c.count,
  }));

  const locationsChartData = metrics.jobs.topLocations.map((l) => ({
    name: l.location,
    value: l.count,
  }));

  const ageDistributionData = Object.entries(metrics.users.ageDistribution).map(
    ([range, count]) => ({
      name: range,
      value: count,
    })
  );

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
              <p className="text-sm text-slate-400">Sprout Platform Metrics</p>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.users.total.toLocaleString()}</div>
              <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +{metrics.users.new} new in {selectedDays}d
              </p>
            </CardContent>
          </Card>

          {/* Average Age */}
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

          {/* Total Jobs */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Total Jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.jobs.total.toLocaleString()}</div>
              <p className="text-sm text-blue-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +{metrics.jobs.new} new in {selectedDays}d
              </p>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics.applications.total.toLocaleString()}
              </div>
              <p className="text-sm text-amber-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +{metrics.applications.new} new in {selectedDays}d
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Users ({selectedDays}d)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.engagement.activeUsers}</div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages ({selectedDays}d)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.engagement.newMessages}</div>
            </CardContent>
          </Card>

          {/* User Roles */}
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
                    {formatCategory(r.role)}: {r.count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs Per Day Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                Jobs Posted Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={jobsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickLine={{ stroke: "#475569" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickLine={{ stroke: "#475569" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_LINE_COLOR}
                      strokeWidth={2}
                      dot={{ fill: CHART_LINE_COLOR, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Applications Per Day Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Applications Per Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={applicationsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickLine={{ stroke: "#475569" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickLine={{ stroke: "#475569" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Categories Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-400" />
                Top Job Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {categoriesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoriesChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Bar dataKey="value" fill={CHART_BAR_COLOR} radius={[0, 4, 4, 0]} />
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

          {/* Top Locations Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-rose-400" />
                Top Job Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {locationsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationsChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} />
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

          {/* Age Distribution Chart */}
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
                          (percent ?? 0) > 0 ? `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                        }
                        labelLine={false}
                      >
                        {ageDistributionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
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

          {/* Job Status Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-400" />
                Job Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {metrics.jobs.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.jobs.byStatus.map((s) => ({
                          name: formatCategory(s.status),
                          value: s.count,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          (percent ?? 0) > 0.05 ? `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%` : ""
                        }
                        labelLine={false}
                      >
                        {metrics.jobs.byStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400">Not enough data yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-6 border-t border-slate-700">
          <p>
            Admin Dashboard - Data is aggregated only. No personal information is displayed.
          </p>
        </div>
      </main>
    </div>
  );
}

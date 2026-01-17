"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Briefcase,
  DollarSign,
  Star,
  MessageSquare,
  TrendingUp,
  Trophy,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  UserCheck,
  FileText,
  AlertTriangle,
  Award,
  Zap,
} from "lucide-react";

// Admin emails that can access analytics
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "admin@sprout.no",
].filter(Boolean);

const categoryLabels: Record<string, string> = {
  BABYSITTING: "Babysitting",
  DOG_WALKING: "Dog Walking",
  SNOW_CLEARING: "Snow Clearing",
  CLEANING: "Cleaning",
  DIY_HELP: "DIY Help",
  TECH_HELP: "Tech Help",
  ERRANDS: "Errands",
  OTHER: "Other",
};

const badgeLabels: Record<string, string> = {
  FIRST_JOB: "First Job",
  FIVE_JOBS: "Rising Star",
  TEN_JOBS: "On Fire",
  TWENTY_FIVE_JOBS: "Diamond",
  FIFTY_JOBS: "Legend",
  FIVE_STAR_RATING: "Five Star",
  RATING_STREAK: "Streak Master",
  QUICK_RESPONDER: "Quick Responder",
  RELIABLE: "Reliable",
  SUPER_RELIABLE: "Super Reliable",
  EARLY_BIRD: "Early Bird",
  CATEGORY_MASTER: "Category Master",
  MULTI_TALENTED: "Multi-Talented",
  FIRST_REVIEW: "First Review",
  HIGHLY_RATED: "Highly Rated",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = "emerald",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full -mr-16 -mt-16`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && trendLabel && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"
              }`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : null}
                {trendLabel}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-${color}-500/10`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopList({
  title,
  items,
  renderItem,
  emptyMessage = "No data yet",
}: {
  title: string;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check admin access
  const isAdmin = session?.user?.role === "ADMIN" ||
                  ADMIN_EMAILS.includes(session?.user?.email || "");

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, router]);

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics");
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
    enabled: isAdmin,
    refetchInterval: 60000, // Refresh every minute
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-500/20">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-500/20">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-violet-600" />
                </div>
                Platform Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive overview of your platform performance
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Updated {data?.generatedAt ? formatDate(data.generatedAt) : "now"}
            </Badge>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Total Users"
            value={data?.overview?.totalUsers || 0}
            icon={Users}
            trend="up"
            trendLabel={`+${data?.users?.newThisWeek || 0} this week`}
            color="blue"
          />
          <StatCard
            title="Total Jobs"
            value={data?.overview?.totalJobs || 0}
            icon={Briefcase}
            trend="up"
            trendLabel={`+${data?.jobs?.newThisWeek || 0} this week`}
            color="emerald"
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(data?.overview?.totalEarnings || 0)}
            icon={DollarSign}
            subtitle={`${formatCurrency(data?.financial?.earningsThisMonth || 0)} this month`}
            color="amber"
          />
          <StatCard
            title="Avg Rating"
            value={(data?.overview?.averageRating || 0).toFixed(1)}
            icon={Star}
            subtitle={`${data?.overview?.totalReviews || 0} reviews`}
            color="yellow"
          />
        </motion.div>

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            title="Applications"
            value={data?.overview?.totalApplications || 0}
            icon={FileText}
            subtitle={`${data?.applications?.thisWeek || 0} this week`}
            color="purple"
          />
          <StatCard
            title="Messages"
            value={data?.overview?.totalMessages || 0}
            icon={MessageSquare}
            subtitle={`${data?.engagement?.messagesThisWeek || 0} this week`}
            color="cyan"
          />
          <StatCard
            title="Completion Rate"
            value={`${data?.overview?.completionRate || 0}%`}
            icon={CheckCircle}
            subtitle={`${data?.jobs?.completed || 0} completed`}
            color="green"
          />
          <StatCard
            title="Active Users"
            value={data?.users?.activeThisWeek || 0}
            icon={Activity}
            subtitle="Active this week"
            color="orange"
          />
        </motion.div>

        {/* Users & Jobs Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Users by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data?.users?.byRole || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          role === "YOUTH" ? "bg-blue-500" :
                          role === "EMPLOYER" ? "bg-emerald-500" :
                          role === "ADMIN" ? "bg-violet-500" : "bg-amber-500"
                        }`} />
                        <span className="text-sm capitalize">{role.toLowerCase().replace("_", " ")}</span>
                      </div>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Jobs by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  Jobs by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(data?.jobs?.byCategory || []).slice(0, 6).map((item: any, index: number) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryLabels[item.category] || item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.count / (data?.overview?.totalJobs || 1)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Earners & Spenders */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Youth Earners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TopList
              title="Top Youth Earners"
              items={data?.financial?.topYouthEarners || []}
              renderItem={(item, index) => (
                <div key={item.youthId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" : "bg-muted text-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.displayName}</p>
                      <p className="text-xs text-muted-foreground">{item._count.id} jobs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(item._sum.amount || 0)}</p>
                    {item.averageRating && (
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {item.averageRating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
          </motion.div>

          {/* Top Employer Spenders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <TopList
              title="Top Employer Spenders"
              items={data?.financial?.topEmployerSpenders || []}
              renderItem={(item, index) => (
                <div key={item.postedById} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-violet-500 text-white" :
                      index === 1 ? "bg-violet-400 text-white" :
                      index === 2 ? "bg-violet-300 text-white" : "bg-muted text-foreground"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.companyName}</p>
                      <p className="text-xs text-muted-foreground">{item._count.id} jobs</p>
                    </div>
                  </div>
                  <p className="font-bold text-violet-600">{formatCurrency(item._sum.payAmount || 0)}</p>
                </div>
              )}
            />
          </motion.div>
        </div>

        {/* Top Performers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Rated Youth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TopList
              title="Top Rated Youth Workers"
              items={data?.topPerformers?.topRatedYouth || []}
              renderItem={(item, index) => (
                <div key={item.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.completedJobsCount} jobs | {item.reliabilityScore}% reliable
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="h-4 w-4 fill-amber-400" />
                    {item.averageRating?.toFixed(1)}
                  </div>
                </div>
              )}
            />
          </motion.div>

          {/* Most Active Employers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <TopList
              title="Most Active Employers"
              items={data?.topPerformers?.mostActiveEmployers || []}
              renderItem={(item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.companyName}</p>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{item.jobsPosted} jobs</Badge>
                </div>
              )}
            />
          </motion.div>
        </div>

        {/* Badge Distribution & Recent Signups */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Badge Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-amber-600" />
                  Badge Distribution
                  <Badge variant="secondary" className="ml-auto">
                    {data?.achievements?.totalBadges || 0} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {(data?.achievements?.distribution || []).slice(0, 10).map((item: any) => (
                    <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs">{badgeLabels[item.type] || item.type}</span>
                      <span className="text-xs font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Signups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Recent Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(data?.users?.recentSignups || []).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">
                          {user.youthProfile?.displayName || user.employerProfile?.companyName || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${
                          user.role === "YOUTH" ? "border-blue-500/30 text-blue-600" : "border-emerald-500/30 text-emerald-600"
                        }`}>
                          {user.role}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          user.accountStatus === "ACTIVE" ? "border-green-500/30 text-green-600" :
                          user.accountStatus === "ONBOARDING" ? "border-amber-500/30 text-amber-600" :
                          "border-gray-500/30 text-gray-600"
                        }`}>
                          {user.accountStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Job & Application Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Jobs by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Jobs by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(data?.jobs?.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm capitalize">{status.toLowerCase().replace("_", " ")}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Applications by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(data?.applications?.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {status === "ACCEPTED" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        {status === "PENDING" && <Clock className="h-4 w-4 text-amber-500" />}
                        {status === "REJECTED" && <XCircle className="h-4 w-4 text-red-500" />}
                        {status === "WITHDRAWN" && <XCircle className="h-4 w-4 text-gray-500" />}
                        <span className="text-sm capitalize">{status.toLowerCase()}</span>
                      </div>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Community Reports */}
        {(data?.community?.totalReports || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                  Community Reports
                  <Badge variant="destructive" className="ml-auto">
                    {data?.community?.totalReports || 0} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(data?.community?.reportsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm capitalize">{status.toLowerCase().replace("_", " ")}</span>
                      <Badge variant={status === "OPEN" || status === "ESCALATED" ? "destructive" : "secondary"}>
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-violet-600" />
                  <span className="font-medium">Platform Health</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Avg Job Value:</span>
                    <span className="font-bold">{formatCurrency(data?.overview?.averageJobValue || 0)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Communities:</span>
                    <span className="font-bold">{data?.community?.totalCommunities || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Conversations:</span>
                    <span className="font-bold">{data?.overview?.totalConversations || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Badges Awarded:</span>
                    <span className="font-bold">{data?.overview?.totalBadgesAwarded || 0}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  Users,
  TrendingUp,
  Sparkles,
  Bookmark,
  Star,
  Clock,
  Shield,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Compass,
  Heart,
  Repeat,
  Info,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { LaunchStats } from "@/lib/admin/launch-stats";

const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  "admin@endeavrly.no",
].filter(Boolean);

// Static color map — Tailwind only generates classes it sees as literal
// strings, so dynamic `bg-${color}-500` template classes never render.
const COLORS: Record<string, { blob: string; iconBg: string; icon: string; bar: string }> = {
  teal: { blob: "bg-teal-500/5", iconBg: "bg-teal-500/10", icon: "text-teal-600", bar: "bg-teal-500" },
  blue: { blob: "bg-blue-500/5", iconBg: "bg-blue-500/10", icon: "text-blue-600", bar: "bg-blue-500" },
  emerald: { blob: "bg-emerald-500/5", iconBg: "bg-emerald-500/10", icon: "text-emerald-600", bar: "bg-emerald-500" },
  green: { blob: "bg-green-500/5", iconBg: "bg-green-500/10", icon: "text-green-600", bar: "bg-green-500" },
  violet: { blob: "bg-violet-500/5", iconBg: "bg-violet-500/10", icon: "text-violet-600", bar: "bg-violet-500" },
  rose: { blob: "bg-rose-500/5", iconBg: "bg-rose-500/10", icon: "text-rose-600", bar: "bg-rose-500" },
  amber: { blob: "bg-amber-500/5", iconBg: "bg-amber-500/10", icon: "text-amber-600", bar: "bg-amber-500" },
  yellow: { blob: "bg-yellow-500/5", iconBg: "bg-yellow-500/10", icon: "text-yellow-600", bar: "bg-yellow-500" },
  gray: { blob: "bg-gray-500/5", iconBg: "bg-gray-500/10", icon: "text-gray-600", bar: "bg-gray-500" },
};
const colorset = (c: string) => COLORS[c] ?? COLORS.teal;

// ---------- small building blocks ----------

function EstimatedBadge({ tip }: { tip: string }) {
  return (
    <span title={tip} className="inline-flex items-center gap-1">
      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600">
        <Info className="h-3 w-3 mr-1" />
        Estimated
      </Badge>
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "teal",
  estimatedTip,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  estimatedTip?: string;
}) {
  const cs = colorset(color);
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${cs.blob} rounded-full -mr-16 -mt-16`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              {estimatedTip && <EstimatedBadge tip={estimatedTip} />}
            </div>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${cs.iconBg} shrink-0`}>
            <Icon className={`h-5 w-5 ${cs.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  estimatedTip,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  estimatedTip?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-teal-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
        {estimatedTip && <EstimatedBadge tip={estimatedTip} />}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-muted-foreground text-center py-6">{message}</p>
  );
}

function BarList({
  items,
  emptyMessage,
  accent = "teal",
  valueSuffix = "",
}: {
  items: { key: string; label: string; count?: number; average?: number }[];
  emptyMessage: string;
  accent?: string;
  valueSuffix?: string;
}) {
  if (items.length === 0) return <EmptyState message={emptyMessage} />;
  const max = Math.max(...items.map((i) => i.average ?? i.count ?? 0), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const v = item.average ?? item.count ?? 0;
        return (
          <div key={item.key} className="flex items-center gap-3">
            <span className="text-sm truncate w-40 shrink-0" title={item.label}>
              {item.label}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${colorset(accent).bar} rounded-full`}
                style={{ width: `${Math.max(4, (v / max) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {v}
              {valueSuffix}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- page ----------

export default function AdminStatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin =
    session?.user?.role === "ADMIN" ||
    ADMIN_EMAILS.includes(session?.user?.email || "");

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) router.push("/dashboard");
  }, [status, isAdmin, router]);

  const { data, isLoading, error } = useQuery<LaunchStats>({
    queryKey: ["admin-launch-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Unauthorized" : "Failed to fetch statistics");
      }
      return res.json();
    },
    enabled: isAdmin,
    refetchInterval: 60000,
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin || error) {
    const unauthorized = !isAdmin;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-500/20">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              {unauthorized ? (
                <Shield className="h-8 w-8 text-red-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {unauthorized ? "Access Denied" : "Couldn't load statistics"}
            </h2>
            <p className="text-muted-foreground">
              {unauthorized
                ? "You don't have permission to view this page."
                : (error as Error)?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { userGrowth, journeys, funnel, twin, retention, saved, interest, health } = data;

  const funnelSteps = [
    { label: "Viewed a career", value: funnel.viewed, estimated: true },
    { label: "Started a journey", value: funnel.started, estimated: false },
    { label: "Completed Discover", value: funnel.discover, estimated: false },
    { label: "Completed Understand", value: funnel.understand, estimated: false },
    { label: "Completed Clarity", value: funnel.clarity, estimated: false },
    { label: "Journey complete", value: funnel.clarity, estimated: false },
  ];
  const funnelMax = Math.max(funnel.viewed, funnel.started, 1);

  const healthItems = [
    { label: "Are people signing up?", ok: health.signingUp, detail: `${userGrowth.thisWeek} new this week` },
    { label: "Are people completing journeys?", ok: health.completingJourneys, detail: `${journeys.completed} completed · ${journeys.completionRate}% rate` },
    { label: "Are people using Career Twin?", ok: health.usingTwin, detail: `${twin.usersOpened} users · ${twin.engagementRate}% engaged` },
    { label: "Are people returning?", ok: health.returning, detail: `${retention.returning} returning · ${retention.repeatRate}% (est.)` },
  ];

  return (
    <div className="min-h-screen dark:bg-gradient-to-b dark:from-background dark:to-muted/20">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/15">
                <BarChart3 className="h-6 w-6 text-teal-600" />
              </div>
              Launch Statistics
            </h1>
            <p className="text-muted-foreground mt-1">
              Is the product being validated? Real sign-ups, journeys, Career Twin and return visits.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Updated {data.generatedAt ? formatDate(data.generatedAt) : "now"}
          </Badge>
        </motion.div>

        {/* 8. Launch Health Summary (top) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-8 border-teal-500/20 bg-gradient-to-r from-teal-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-teal-600" />
                Launch health at a glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {healthItems.map((h) => (
                  <div key={h.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                    {h.ok ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{h.label}</p>
                      <p className="text-xs text-muted-foreground">{h.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10">
                  <ThumbsUp className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Strongest signal:</span>{" "}
                    <span className="font-medium">{health.strongest?.label ?? "Not enough data yet"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10">
                  <ThumbsDown className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">Weakest signal:</span>{" "}
                    <span className="font-medium">{health.weakest?.label ?? "Not enough data yet"}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 1. User Growth */}
        <Section title="User growth" icon={Users}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Total users" value={userGrowth.total} icon={Users} color="blue" />
            <StatCard title="New today" value={userGrowth.today} icon={TrendingUp} color="teal" />
            <StatCard title="New this week" value={userGrowth.thisWeek} icon={TrendingUp} color="emerald" />
            <StatCard title="New this month" value={userGrowth.thisMonth} icon={TrendingUp} color="green" />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sign-ups over time</CardTitle>
            </CardHeader>
            <CardContent>
              {userGrowth.trend.length === 0 ? (
                <EmptyState message="No sign-ups yet — your growth curve will appear here." />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={userGrowth.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fill="url(#growth)" name="Sign-ups" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Section>

        {/* 2. Journey Engagement */}
        <Section title="Journey engagement" icon={Compass}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Journeys started" value={journeys.started} icon={Compass} color="blue" />
            <StatCard title="Journeys completed" value={journeys.completed} icon={CheckCircle2} color="emerald" />
            <StatCard title="Completion rate" value={`${journeys.completionRate}%`} icon={TrendingUp} color="teal" />
            <StatCard title="Avg careers / user" value={journeys.avgCareersPerUser} icon={Users} color="green" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Most explored careers</CardTitle></CardHeader>
              <CardContent><BarList items={journeys.mostExplored} emptyMessage="No careers explored yet." accent="blue" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Most completed journeys</CardTitle></CardHeader>
              <CardContent><BarList items={journeys.mostCompleted} emptyMessage="No journeys completed yet — expected pre-launch." accent="emerald" /></CardContent>
            </Card>
          </div>
        </Section>

        {/* 3. Funnel */}
        <Section title="Journey funnel" icon={TrendingUp}>
          <Card>
            <CardContent className="p-6 space-y-3">
              {funnelSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="text-sm w-44 shrink-0 flex items-center gap-1.5">
                    {step.label}
                    {step.estimated && <EstimatedBadge tip="Approximated from journey-exploration events; a 'career viewed' event isn't tracked precisely yet." />}
                  </span>
                  <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-md flex items-center justify-end px-2"
                      style={{ width: `${Math.max(6, (step.value / funnelMax) * 100)}%`, opacity: 1 - i * 0.1 }}
                    >
                      <span className="text-xs font-semibold text-white">{step.value}</span>
                    </div>
                  </div>
                </div>
              ))}
              {funnel.viewed === 0 && funnel.started === 0 && (
                <EmptyState message="No journey activity yet — the funnel fills in as young people explore." />
              )}
            </CardContent>
          </Card>
        </Section>

        {/* 4. Career Twin */}
        <Section title="Career Twin usage" icon={Sparkles}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Twin sessions" value={twin.sessions} icon={Sparkles} color="violet" estimatedTip="A session is approximated as one user + career + day of Career Twin chat." />
            <StatCard title="Users who opened Twin" value={twin.usersOpened} icon={Users} color="blue" />
            <StatCard title="Avg sessions / user" value={twin.avgSessionsPerUser} icon={Repeat} color="teal" estimatedTip="Sessions per user who opened Career Twin." />
            <StatCard title="Engagement rate" value={`${twin.engagementRate}%`} icon={TrendingUp} color="emerald" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Most selected topics</CardTitle></CardHeader>
              <CardContent><BarList items={twin.topTopics} emptyMessage="No Career Twin topics used yet." accent="violet" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Careers used with Career Twin</CardTitle></CardHeader>
              <CardContent><BarList items={twin.topCareers} emptyMessage="No Career Twin conversations yet." accent="blue" /></CardContent>
            </Card>
          </div>
        </Section>

        {/* 5. Retention */}
        <Section
          title="Retention & repeat usage"
          icon={Repeat}
          estimatedTip="Approximated from when users last did something that saves data (journey edits, Twin chats, ratings, saves). Pure browsers who never write aren't counted."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Returning users" value={retention.returning} icon={Repeat} color="teal" />
            <StatCard title="Repeat-visit rate" value={`${retention.repeatRate}%`} icon={TrendingUp} color="emerald" />
            <StatCard title="Active last 7 days" value={retention.active7d} icon={Users} color="blue" />
            <StatCard title="Active last 30 days" value={retention.active30d} icon={Users} color="green" />
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Avg active days per user: <span className="font-medium">{retention.avgSessionsPerUser}</span> (estimate)
          </p>
        </Section>

        {/* 6. Saved careers */}
        <Section title="Saved & shortlisted careers" icon={Bookmark}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Total saved" value={saved.total} icon={Bookmark} color="teal" />
            <StatCard title="Avg saved / user" value={saved.avgPerUser} icon={Users} color="blue" />
            <StatCard title="Users with 3+ saved" value={saved.usersWith3Plus} icon={Heart} color="rose" />
            <StatCard title="Total comparisons" value="—" subtitle="Not recorded yet" icon={BarChart3} color="gray" />
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Most saved careers</CardTitle></CardHeader>
            <CardContent><BarList items={saved.mostSaved} emptyMessage="No careers saved yet." accent="teal" /></CardContent>
          </Card>
        </Section>

        {/* 7. Interest ratings */}
        <Section title="Interest ratings" icon={Star}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard title="Careers rated" value={interest.rated} icon={Star} color="amber" />
            <StatCard title="Average score" value={interest.average || "—"} subtitle="out of 5" icon={Star} color="yellow" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Score distribution</CardTitle></CardHeader>
              <CardContent>
                {interest.rated === 0 ? (
                  <EmptyState message="No ratings yet." />
                ) : (
                  <div className="space-y-2.5">
                    {interest.distribution.map((d) => {
                      const max = Math.max(...interest.distribution.map((x) => x.count), 1);
                      return (
                        <div key={d.level} className="flex items-center gap-3">
                          <span className="text-sm w-10 shrink-0 flex items-center gap-1">
                            {d.level}<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(2, (d.count / max) * 100)}%` }} />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{d.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Highest interest</CardTitle></CardHeader>
              <CardContent><BarList items={interest.highest} emptyMessage="No ratings yet." accent="emerald" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Lowest interest</CardTitle></CardHeader>
              <CardContent><BarList items={interest.lowest} emptyMessage="No ratings yet." accent="rose" /></CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

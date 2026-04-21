/**
 * Cohort detail — aggregated stats only, plus the join code so the
 * teacher can re-share it with latecomers. No per-student data ever
 * appears on this page.
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Users, TrendingUp, Compass, ShieldCheck } from "lucide-react";
import { CohortCodeShare } from "@/components/teacher/cohort-code-share";
import { getAllCareers } from "@/lib/career-pathways";

export const dynamic = "force-dynamic";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const { id } = await params;

  const cohort = await prisma.cohort.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      careerFocus: true,
      createdAt: true,
      teacherId: true,
      deletedAt: true,
    },
  });
  if (!cohort || cohort.deletedAt || cohort.teacherId !== session.user.id) {
    notFound();
  }

  const [studentCount, startedJourneyCount, topCareers] = await Promise.all([
    prisma.cohortMembership.count({ where: { cohortId: id } }),
    prisma.journeyGoalData
      .findMany({
        where: {
          user: { cohortMemberships: { some: { cohortId: id } } },
        },
        select: { userId: true },
        distinct: ["userId"],
      })
      .then((rows) => rows.length),
    prisma.journeyGoalData.groupBy({
      by: ["goalId"],
      where: {
        user: { cohortMemberships: { some: { cohortId: id } } },
      },
      _count: { _all: true },
      orderBy: { _count: { goalId: "desc" } },
      take: 5,
    }),
  ]);

  const allCareers = getAllCareers();
  const careerLabel = (slug: string) => {
    const found = allCareers.find((c) => c.id === slug);
    return found ? `${found.emoji ?? ""} ${found.title}`.trim() : slug;
  };

  const pct = (n: number) =>
    studentCount > 0 ? Math.round((n / studentCount) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Link
        href="/teacher/dashboard"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to classes
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{cohort.name}</h1>
        {cohort.careerFocus && (
          <p className="text-sm text-muted-foreground mt-1">
            Focus: {cohort.careerFocus}
          </p>
        )}
      </div>

      <CohortCodeShare code={cohort.code} cohortName={cohort.name} />

      <section className="rounded-xl border border-border/50 bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Cohort progress
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <StatBlock
            label="Students joined"
            value={studentCount}
            suffix=""
            Icon={Users}
          />
          <StatBlock
            label="Started a Journey"
            value={startedJourneyCount}
            suffix={studentCount > 0 ? `· ${pct(startedJourneyCount)}%` : ""}
            Icon={Compass}
          />
        </div>

        {studentCount === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No students have joined yet. Share the code above.
          </p>
        ) : topCareers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No one&rsquo;s picked a primary career yet. That&rsquo;s normal
            in the first week &mdash; the &ldquo;Discover&rdquo; tab
            often comes before a commitment.
          </p>
        ) : (
          <div className="pt-4 border-t border-border/30">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              What the class is exploring
            </h3>
            <ol className="space-y-2">
              {topCareers.map((c, i) => {
                const slug = c.goalId as string;
                return (
                  <li
                    key={slug}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 text-muted-foreground/50 text-xs font-mono">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-foreground/85">
                      {careerLabel(slug)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {c._count._all}{" "}
                      {c._count._all === 1 ? "student" : "students"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          <span className="font-medium">What you don&rsquo;t see:</span> which
          careers each individual student is considering, their reflections,
          Journey notes, or any private content. That&rsquo;s the trade
          that lets students be honest here. If you want a class
          conversation about a specific career, invite them to share it
          themselves in the classroom &mdash; not through Endeavrly.
        </p>
      </aside>
    </div>
  );
}

function StatBlock({
  label,
  value,
  suffix,
  Icon,
}: {
  label: string;
  value: number;
  suffix: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  );
}

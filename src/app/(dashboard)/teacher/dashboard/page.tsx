/**
 * Teacher dashboard — lists the signed-in teacher's cohorts.
 *
 * Never shows per-student content. The most granular data on this
 * page is "cohort X has 23 students and 18 have started a Journey".
 * Deeper drilldowns on /teacher/cohorts/[id] are also aggregate-only.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GraduationCap, Users, Plus, ChevronRight } from "lucide-react";
import { CreateCohortButton } from "@/components/teacher/create-cohort-button";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const cohorts = await prisma.cohort.findMany({
    where: { teacherId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      name: true,
      careerFocus: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Your classes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Create a class, share the code with your students, and see
            aggregated progress. You never see individual reflections or
            personal content — that&rsquo;s the deal that lets students
            be honest with themselves.
          </p>
        </div>
        <CreateCohortButton />
      </div>

      {cohorts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-foreground/90">
            No classes yet
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Create your first class. You&rsquo;ll get a short join code to
            share with students &mdash; they type it in on their profile
            to join.
          </p>
          <div className="mt-6 inline-block">
            <CreateCohortButton variant="primary" />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cohorts.map((c) => (
            <Link
              key={c.id}
              href={`/teacher/cohorts/${c.id}`}
              className="group rounded-xl border border-border/50 bg-card p-4 hover:border-primary/40 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold truncate">{c.name}</h3>
                  {c.careerFocus && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Focus: {c.careerFocus}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <code className="inline-block text-sm font-mono tracking-[0.18em] bg-muted/50 border border-border/40 rounded-md px-2.5 py-1">
                  {c.code}
                </code>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {c._count.memberships}{" "}
                  {c._count.memberships === 1 ? "student" : "students"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

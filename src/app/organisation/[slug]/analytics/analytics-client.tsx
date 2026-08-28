"use client";

/**
 * Programme analytics.
 *
 * Every figure here is a count that has already passed the k-anonymity floor
 * server-side. When a group is too small the API returns `suppressed` and no
 * numbers at all — the UI's job is to explain that clearly rather than show
 * an empty chart.
 */

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface Analytics {
  participants: number;
  suppressed: boolean;
  minimumGroupSize?: number;
  message?: string;
  scope?: { role: string; limitedToAssigned: boolean; cohortId: string | null };
  engagement?: {
    exploringCareers: number;
    exploringPct: number;
    withPrimaryGoal: number;
    withPrimaryGoalPct: number;
    withRoadmap: number;
    withRoadmapPct: number;
    savingCareers: number;
    savingCareersPct: number;
  };
  topCareers?: { careerId: string; count: number }[] | null;
  privacy?: { minimumGroupSize: number; individualViewsEnabled: boolean; note: string };
}

interface Cohort {
  id: string;
  name: string;
}

function Bar({ label, pct, detail }: { label: string; pct: number; detail: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {pct}% <span className="text-xs">({detail})</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyticsClient({ organisationId }: { organisationId: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortId, setCohortId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const search = cohortId ? `?cohortId=${encodeURIComponent(cohortId)}` : "";
      const response = await fetch(`/api/organisations/${organisationId}/analytics${search}`);
      if (response.ok) setData(await response.json());
    } finally {
      setLoading(false);
    }
  }, [organisationId, cohortId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/cohorts`)
      .then((r) => (r.ok ? r.json() : { cohorts: [] }))
      .then((d) => setCohorts(d.cohorts ?? []))
      .catch(() => setCohorts([]));
  }, [organisationId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            How this programme is going, in aggregate.
          </p>
        </div>
        {cohorts.length > 0 && (
          <select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All participants</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && !data ? (
        <Skeleton className="h-64 w-full" />
      ) : !data ? (
        <p className="text-muted-foreground">Couldn&apos;t load analytics.</p>
      ) : data.suppressed ? (
        <div className="rounded-xl border border-border/60 bg-card/40 p-6">
          <p className="text-2xl font-semibold">{data.participants}</p>
          <p className="text-sm text-muted-foreground">
            participant{data.participants === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{data.message}</p>
        </div>
      ) : (
        <>
          {data.scope?.limitedToAssigned && (
            <p className="text-sm text-muted-foreground">
              These figures cover only the participants assigned to you.
            </p>
          )}

          <div className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{data.participants}</span>
              <span className="text-sm text-muted-foreground">participants</span>
            </div>

            {data.engagement && (
              <div className="space-y-4 pt-2">
                <Bar
                  label="Exploring careers"
                  pct={data.engagement.exploringPct}
                  detail={`${data.engagement.exploringCareers} of ${data.participants}`}
                />
                <Bar
                  label="Saving careers"
                  pct={data.engagement.savingCareersPct}
                  detail={`${data.engagement.savingCareers} of ${data.participants}`}
                />
                <Bar
                  label="Have a direction set"
                  pct={data.engagement.withPrimaryGoalPct}
                  detail={`${data.engagement.withPrimaryGoal} of ${data.participants}`}
                />
                <Bar
                  label="Have a roadmap"
                  pct={data.engagement.withRoadmapPct}
                  detail={`${data.engagement.withRoadmap} of ${data.participants}`}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <h3 className="font-medium mb-3">Careers being explored</h3>
            {!data.topCareers || data.topCareers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No career is being explored by enough people yet to show without identifying
                someone.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.topCareers.map((career) => (
                  <li
                    key={career.careerId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{career.careerId.replace(/-/g, " ")}</span>
                    <span className="text-muted-foreground">{career.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.privacy && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex gap-3">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p>{data.privacy.note}</p>
                <p className="mt-1">
                  Any group or category smaller than {data.privacy.minimumGroupSize} is hidden.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

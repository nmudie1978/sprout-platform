// src/components/career-voices/real-voices.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, Quote } from "lucide-react";
import type { CareerLike } from "@/lib/career-voices/match";
import type { PublicStory, PublicContribution, VoicesResponse } from "@/lib/career-voices/public";

const EMPTY: VoicesResponse = { stories: [], contributions: [] };

export function RealVoices({ career }: { career: CareerLike }) {
  const [data, setData] = useState<VoicesResponse>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/careers/${career.id}/voices`)
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d: VoicesResponse) => active && (setData(d ?? EMPTY), setLoading(false)))
      .catch(() => active && (setData(EMPTY), setLoading(false)));
    return () => {
      active = false;
    };
  }, [career.id]);

  const total = data.stories.length + data.contributions.length;
  const contributeHref = `/contribute?career=${encodeURIComponent(career.id)}`;

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Users className="h-3 w-3 text-teal-500" />
        <span className="text-[10px] font-medium text-muted-foreground">Real voices</span>
      </div>

      {total === 0 ? (
        <Link
          href={contributeHref}
          className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-left hover:border-teal-500/40 transition-colors"
        >
          <span className="text-xs text-muted-foreground">
            No stories yet. Know someone in this field? Be the first to share what it&apos;s really like.
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-teal-500" />
        </Link>
      ) : (
        <div className="space-y-2.5">
          {data.stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
          {data.contributions.map((c) => (
            <ContributionCard key={c.id} contribution={c} />
          ))}
          <Link
            href={contributeHref}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Know someone in this field? Share their path
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: PublicStory }) {
  return (
    <a
      href={story.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border bg-card/50 p-3 hover:border-teal-500/40 transition-colors"
    >
      <p className="text-xs font-semibold leading-snug">{story.headline}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {story.name} · {story.jobTitle}
        {story.company ? ` · ${story.company}` : ""}
        {story.location ? ` · ${story.location}` : ""}
      </p>
      {story.takeaways.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {story.takeaways.slice(0, 3).map((t, i) => (
            <li key={i} className="text-[10px] text-muted-foreground/80">• {t}</li>
          ))}
        </ul>
      )}
    </a>
  );
}

function ContributionCard({ contribution: c }: { contribution: PublicContribution }) {
  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="flex items-center gap-1.5">
        <Quote className="h-3 w-3 text-teal-500 shrink-0" />
        <p className="text-[10px] font-medium">
          {c.displayName} · {c.currentTitle}
          {c.city ? ` · ${c.city}, ${c.country}` : ` · ${c.country}`}
        </p>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">{c.realityOfJob}</p>
      <details className="mt-1.5">
        <summary className="cursor-pointer text-[10px] text-teal-600 dark:text-teal-400">Their full path</summary>
        <dl className="mt-1.5 space-y-1.5 text-[10px] text-muted-foreground">
          <Prompt label="How I got here" value={c.howIGotHere} />
          <Prompt label="What I studied" value={c.whatIStudied} />
          <Prompt label="First salary" value={c.firstSalary} />
          <Prompt label="Hardest part" value={c.hardestPart} />
          <Prompt label="Advice to my 17-year-old self" value={c.adviceToSeventeen} />
        </dl>
      </details>
    </div>
  );
}

function Prompt({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground/70">{label}</dt>
      <dd className="leading-relaxed">{value}</dd>
    </div>
  );
}

'use client';

/**
 * Real-World Connections section, rendered inside the step detail
 * dialog. Surfaces 3–5 concrete external opportunities (universities,
 * courses, jobs, internships) tied to the step type and the user's
 * chosen career.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Building2,
  HeartHandshake,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import type { JourneyItem } from '@/lib/journey/career-journey-types';
import {
  getRealWorldConnections,
  type RealWorldItem,
  type RealWorldKind,
} from '@/lib/journey/real-world-provider';

const KIND_ICON: Record<RealWorldKind, typeof GraduationCap> = {
  university: GraduationCap,
  course: BookOpen,
  certification: Award,
  platform: BookOpen,
  job: Briefcase,
  internship: Building2,
  volunteering: HeartHandshake,
};

const KIND_COLOR: Record<RealWorldKind, string> = {
  university: 'text-blue-400',
  course: 'text-teal-400',
  certification: 'text-purple-400',
  platform: 'text-teal-400',
  job: 'text-amber-400',
  internship: 'text-orange-400',
  volunteering: 'text-rose-400',
};

interface RealWorldSectionProps {
  item: JourneyItem;
  career: string | null | undefined;
}

export function RealWorldSection({ item, career }: RealWorldSectionProps) {
  const connections = useMemo<RealWorldItem[]>(
    () => getRealWorldConnections({ step: item, career }),
    [item, career],
  );

  if (connections.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1.5">
        Where to go next
      </p>
      <ul className="divide-y divide-border/10 rounded-lg border border-border/15 bg-muted/[0.04]">
        {connections.map((c, i) => {
          const Icon = KIND_ICON[c.kind];
          const color = KIND_COLOR[c.kind];
          const isInternal = c.url.startsWith('/');
          const linkClass = "flex items-center gap-2.5 px-3 py-2 group hover:bg-muted/[0.08] transition-colors";
          const content = (
            <>
              <Icon className={`h-3 w-3 shrink-0 ${color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              <span className="text-[12px] text-foreground/75 group-hover:text-foreground/95 truncate flex-1">
                {c.title}
              </span>
              {isInternal ? (
                <ArrowRight className="h-2.5 w-2.5 text-teal-400/50 group-hover:text-teal-400 shrink-0" />
              ) : (
                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
              )}
            </>
          );
          return (
            <li key={`${c.url}-${i}`}>
              {isInternal ? (
                <Link href={c.url} className={linkClass}>{content}</Link>
              ) : (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className={linkClass}>{content}</a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

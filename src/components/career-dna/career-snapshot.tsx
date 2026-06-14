'use client';

/**
 * CareerSnapshot — a concise summary of the career alongside its DNA.
 * Income wording stays general (a band, not a precise figure).
 */

import { Briefcase, MapPin, TrendingUp, GraduationCap, Banknote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CareerDNASnapshot } from '@/types/career-dna';

export function CareerSnapshot({ snapshot }: { snapshot: CareerDNASnapshot }) {
  const rows: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: Briefcase, label: 'Career Type', value: snapshot.careerType },
    { icon: MapPin, label: 'Work Environment', value: snapshot.workEnvironment },
    { icon: Banknote, label: 'Income Potential', value: snapshot.incomePotential },
    { icon: TrendingUp, label: 'Job Outlook', value: snapshot.jobOutlook },
    { icon: GraduationCap, label: 'Education Path', value: snapshot.educationPath },
  ];
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
        Career Snapshot
      </h4>
      <dl className="space-y-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/55" />
            <div className="min-w-0">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
                {label}
              </dt>
              <dd className="text-xs text-foreground/85">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

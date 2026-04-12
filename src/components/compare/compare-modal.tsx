'use client';

/**
 * CompareModal — full-screen overlay that shows 2–3 careers side by side.
 *
 * Mobile: horizontal scroll-snap carousel.
 * Desktop: 2- or 3-column grid.
 *
 * Each card shows snapshot + fit dimensions + reality check + 3 day-to-day
 * tasks + an "Explore this path" CTA that sets the career as the user's
 * primary goal and routes to /my-journey.
 */

import { X, ArrowRight, Sparkles, Clock, Trophy, Download, GraduationCap } from 'lucide-react';
import type { Career, DiscoveryPreferences } from '@/lib/career-pathways';
import {
  getFitDimensions,
  estimateTimeToGetThere,
  estimateCompetitiveness,
  shortDayToDay,
  whyItMightSuitYou,
} from '@/lib/compare/fit-dimensions';
import { getValueSignals } from '@/lib/compare/value-signals';
import { getAcademicProfile, getDemandLabel, getPathwayLabel } from '@/lib/education/academic-readiness';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CompareModalProps {
  open: boolean;
  careers: Career[];
  preferences: DiscoveryPreferences | null | undefined;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function CompareModal({ open, careers, preferences, onClose, onRemove }: CompareModalProps) {
  if (!open || careers.length === 0) return null;

  const handleDownload = () => {
    try {
      const html = buildComparisonHtml(careers, preferences);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slugs = careers.map((c) => c.id).join('-vs-');
      a.download = `career-compare-${slugs}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Comparison downloaded', {
        description: 'Open the file in your browser to view, save as PDF, or share.',
      });
    } catch (e) {
      toast.error('Could not download — try again');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-5xl sm:max-h-[90vh] sm:my-8 sm:mx-4 bg-card border-y sm:border sm:rounded-2xl sm:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground/90 truncate">Compare paths you&apos;re curious about</h2>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {careers.length} career{careers.length !== 1 ? 's' : ''} side by side
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-[11px] font-medium text-foreground/75 hover:text-foreground hover:bg-muted/30 hover:border-border/60 transition-colors"
              title="Download this comparison as a file you can save, share, or print to PDF"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Close compare"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cards — carousel on mobile, subgrid on desktop so each
            section (snapshot / fit / reality / day-to-day / signals)
            aligns row-by-row across cards for clean comparison. */}
        <div
          className={cn(
            'flex-1 overflow-auto',
            'flex sm:grid sm:gap-4 sm:p-4',
            // 5 explicit row tracks — one per section. Cards span all 5
            // and use grid-rows-subgrid so a long description in one
            // card doesn't push that card's "Reality check" out of line
            // with the others.
            'sm:grid-rows-[auto_auto_auto_auto_auto_auto]',
            careers.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
          )}
        >
          {careers.map((career) => (
            <CompareCard
              key={career.id}
              career={career}
              preferences={preferences}
              onRemove={() => onRemove(career.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Compare card ────────────────────────────────────────────────────

interface CompareCardProps {
  career: Career;
  preferences: DiscoveryPreferences | null | undefined;
  onRemove: () => void;
}

function CompareCard({ career, preferences, onRemove }: CompareCardProps) {
  const dims = getFitDimensions(career);
  const time = estimateTimeToGetThere(career);
  const comp = estimateCompetitiveness(career);
  const tasks = shortDayToDay(career);
  const why = whyItMightSuitYou(career, preferences);
  const signals = getValueSignals(career);
  const academic = getAcademicProfile(career);
  const essentialSubjects = academic.subjects.filter(s => s.importance === 'essential');
  const importantSubjects = academic.subjects.filter(s => s.importance === 'important');

  const titleClass = 'text-xs font-semibold uppercase tracking-wider text-emerald-500/80';

  return (
    <div
      className={cn(
        // Mobile: snap carousel item (margin gives breathing room)
        'snap-start shrink-0 w-[85vw] mx-2 my-4',
        // Desktop: span all 5 row tracks of the parent grid so each
        // section row aligns row-by-row with sibling cards.
        'sm:w-auto sm:m-0 sm:grid sm:grid-rows-subgrid sm:row-span-6',
        // Card shell — same on both sizes
        'rounded-xl border-2 border-border/70 bg-card shadow-md overflow-hidden flex flex-col sm:flex-none',
      )}
    >
      {/* Snapshot — row 1 */}
      <div className="relative p-4 border-b border-border/30">
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label={`Remove ${career.title}`}
          title="Remove from comparison"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start gap-2.5 mb-2 pr-8">
          <span className="text-2xl leading-none shrink-0">{career.emoji}</span>
          <h3 className="text-sm font-bold text-foreground/95 leading-tight">{career.title}</h3>
        </div>
        <p className="text-[11px] text-muted-foreground/75 leading-relaxed mb-2.5">
          {career.description}
        </p>
        <div className="flex items-start gap-1.5 rounded-lg bg-muted/20 px-2.5 py-1.5 border border-border/30">
          <Sparkles className="h-3 w-3 text-muted-foreground/50 shrink-0 mt-0.5" />
          <p className="text-[10px] text-foreground/70 leading-snug">{why}</p>
        </div>
      </div>

      {/* Fit dimensions — row 2 */}
      <div className="p-4 border-b border-border/30 space-y-2">
        <p className={cn(titleClass, 'mb-1')}>How it feels</p>
        {dims.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5" title={d.highMeans}>
            <span className="text-[10px] text-foreground/70 w-[64px] shrink-0">{d.label}</span>
            <div className="relative flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-amber-400/50 transition-all duration-300"
                style={{ width: `${(d.score / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reality check — row 3 */}
      <div className="p-4 border-b border-border/30 space-y-2">
        <p className={cn(titleClass, 'mb-1')}>Reality check</p>
        <div className="flex items-center gap-3">
          <RealityPill icon={Clock} label="Time" value={time} />
          <RealityPill icon={Trophy} label="Compete" value={comp} />
        </div>
        <div className="flex items-center gap-3">
          <RealityPill icon={GraduationCap} label="Demand" value={getDemandLabel(academic.demand)} />
        </div>
      </div>

      {/* Day-to-day — row 4 */}
      <div className="p-4 border-b border-border/30 space-y-1.5">
        <p className={cn(titleClass, 'mb-1.5')}>Day-to-day</p>
        <ul className="space-y-1">
          {tasks.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/75 leading-snug">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Things to consider — row 5 */}
      <div className="p-4 border-b border-border/30">
        {signals.length > 0 ? (
          <>
            <p className={cn(titleClass, 'mb-1.5')}>Things to consider</p>
            <ul className="space-y-1">
              {signals.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/75 leading-snug">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                  {s}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={cn(titleClass)}>Things to consider</p>
        )}
      </div>

      {/* Study path & readiness — row 6 */}
      <div className="p-4 space-y-2.5">
        <p className={cn(titleClass, 'mb-1')}>Study path &amp; readiness</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2 text-[10px]">
            <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 mt-px" />
            <span className="text-foreground/75 leading-snug">{getPathwayLabel(academic.pathwayType)}</span>
          </div>
          <div className="flex items-start gap-2 text-[10px]">
            <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 mt-px" />
            <span className="text-foreground/75 leading-snug">{career.educationPath.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()}</span>
          </div>
          {academic.grade.hasCutoff && academic.grade.gradeMin !== null && (
            <p className="text-[9px] text-muted-foreground/50">
              Typical grades: {academic.grade.gradeMin}&ndash;{academic.grade.gradeMax} (Norwegian 1&ndash;6)
            </p>
          )}
        </div>
        {(essentialSubjects.length > 0 || importantSubjects.length > 0) && (
          <div className="space-y-1.5 pt-1">
            {essentialSubjects.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground/50 mb-1">Key subjects</p>
                <div className="flex flex-wrap gap-1">
                  {essentialSubjects.map(s => (
                    <span key={s.name} className="rounded border border-border/20 bg-muted/10 px-1.5 py-0.5 text-[9px] text-foreground/65">{s.name}</span>
                  ))}
                </div>
              </div>
            )}
            {importantSubjects.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground/50 mb-1">Also useful</p>
                <div className="flex flex-wrap gap-1">
                  {importantSubjects.map(s => (
                    <span key={s.name} className="rounded border border-border/15 bg-muted/5 px-1.5 py-0.5 text-[9px] text-muted-foreground/55">{s.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <p className="text-[8px] text-muted-foreground/35 leading-relaxed pt-0.5">
          {academic.variabilityNote}
        </p>
      </div>
    </div>
  );
}

// ── Reality pill ────────────────────────────────────────────────────
// Neutral by design — only the bars and titles carry colour. The pill
// just shows label + value in muted tones so cards stay scannable.

function RealityPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/20 text-foreground/75 px-2 py-0.5 text-[9px] font-medium">
      <Icon className="h-2.5 w-2.5 text-muted-foreground/55" />
      <span className="text-muted-foreground/55">{label}:</span>
      {value}
    </span>
  );
}

// ── Download / save helper ──────────────────────────────────────────
//
// Builds a self-contained, print-friendly HTML document for the
// current comparison. Users can save it, share it, or print to PDF
// from their browser. No external assets — fully offline.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildComparisonHtml(careers: Career[], preferences: DiscoveryPreferences | null | undefined): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const titles = careers.map((c) => c.title).join(' vs ');

  const cardsHtml = careers
    .map((career) => {
      const dims = getFitDimensions(career);
      const time = estimateTimeToGetThere(career);
      const comp = estimateCompetitiveness(career);
      const tasks = shortDayToDay(career);
      const why = whyItMightSuitYou(career, preferences);
      const signals = getValueSignals(career);
      const ap = getAcademicProfile(career);

      const dimsHtml = dims
        .map((d) => {
          const pct = (d.score / 5) * 100;
          return `<div class="dim"><span class="dim-label">${escapeHtml(d.label)}</span><span class="dim-bar"><span class="dim-fill" style="width:${pct}%"></span></span></div>`;
        })
        .join('');

      const tasksHtml = tasks
        .map((t) => `<li>${escapeHtml(t)}</li>`)
        .join('');

      const signalsHtml = signals
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('');

      return `
        <article class="card">
          <header class="card-head">
            <span class="emoji">${escapeHtml(career.emoji)}</span>
            <h2>${escapeHtml(career.title)}</h2>
          </header>
          <p class="desc">${escapeHtml(career.description)}</p>
          <div class="why">★ ${escapeHtml(why)}</div>

          <h3>How it feels</h3>
          <div class="dims">${dimsHtml}</div>

          <h3>Reality check</h3>
          <p class="meta">Time: <strong>${escapeHtml(time)}</strong>  ·  Competitiveness: <strong>${escapeHtml(comp)}</strong>  ·  Demand: <strong>${escapeHtml(getDemandLabel(ap.demand))}</strong></p>

          <h3>Study path</h3>
          <p class="path">→ ${escapeHtml(getPathwayLabel(ap.pathwayType))}</p>
          <p class="path">→ ${escapeHtml(career.educationPath.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim())}</p>
          ${ap.subjects.filter(s => s.importance === 'essential').length > 0 ? `<p class="meta">Key subjects: <strong>${ap.subjects.filter(s => s.importance === 'essential').map(s => escapeHtml(s.name)).join(', ')}</strong></p>` : ''}

          <h3>Day-to-day</h3>
          <ul>${tasksHtml}</ul>

          ${
            signals.length > 0
              ? `<h3 class="warn">Things to consider</h3><ul class="warn-list">${signalsHtml}</ul>`
              : ''
          }
        </article>
      `;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Career Compare — ${escapeHtml(titles)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #fafafa;
    color: #1a1a1a;
    margin: 0;
    padding: 24px;
    line-height: 1.5;
  }
  .doc { max-width: 1100px; margin: 0 auto; }
  .doc-head { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e5e5e5; }
  .doc-head h1 { font-size: 22px; margin: 0 0 6px 0; color: #0d9488; }
  .doc-head p { font-size: 12px; color: #666; margin: 0; }
  .grid {
    display: grid;
    grid-template-columns: repeat(${careers.length}, 1fr);
    gap: 16px;
  }
  @media (max-width: 720px) {
    .grid { grid-template-columns: 1fr; }
  }
  .card {
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    page-break-inside: avoid;
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .emoji { font-size: 28px; line-height: 1; }
  .card h2 { font-size: 16px; margin: 0; color: #1a1a1a; }
  .desc { font-size: 12px; color: #555; margin: 0 0 12px 0; }
  .why {
    background: #f0fdfa;
    border: 1px solid #ccfbf1;
    color: #0f766e;
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 11px;
    margin-bottom: 14px;
  }
  .card h3 {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin: 14px 0 6px 0;
    font-weight: 700;
  }
  .card h3.warn { color: #b45309; }
  .dim { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .dim-label { font-size: 10px; color: #555; width: 70px; flex-shrink: 0; }
  .dim-bar { position: relative; flex: 1; height: 5px; background: #e5e5e5; border-radius: 99px; overflow: hidden; }
  .dim-fill { position: absolute; inset: 0 auto 0 0; background: rgba(251, 191, 36, 0.5); border-radius: 99px; }
  .path { font-size: 11px; color: #444; margin: 0 0 4px 0; }
  .meta { font-size: 10px; color: #777; margin: 0 0 4px 0; }
  .meta strong { color: #1a1a1a; }
  .card ul { margin: 0; padding-left: 16px; }
  .card ul li { font-size: 11px; color: #444; margin-bottom: 3px; line-height: 1.45; }
  .warn-list li::marker { color: #f59e0b; }
  .footer { text-align: center; font-size: 10px; color: #999; margin-top: 24px; }
  @media print {
    body { background: white; padding: 12px; }
    .card { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="doc">
    <header class="doc-head">
      <h1>Career Compare</h1>
      <p>${escapeHtml(titles)} · Generated ${escapeHtml(date)}</p>
    </header>
    <div class="grid">${cardsHtml}</div>
    <p class="footer">Generated by Endeavrly Career Radar — endeavrly.app</p>
  </div>
</body>
</html>`;
}

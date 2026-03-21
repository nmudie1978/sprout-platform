'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Briefcase,
  Compass,
  Target,
  Building2,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Star,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { JourneySummary, NextAction } from '@/lib/journey/types';

// ============================================
// TYPES
// ============================================

interface JourneySummaryPanelProps {
  summary: JourneySummary;
  className?: string;
}

// ============================================
// COMPACT STAT CARD
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  delay = 0,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  subtext?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-3"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      </div>
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
      {subtext && (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{subtext}</p>
      )}
    </motion.div>
  );
}

// ============================================
// COMPACT SECTION
// ============================================

function CompactSection({
  title,
  icon: Icon,
  children,
  isEmpty,
  emptyMessage,
  delay = 0,
  className,
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className={cn(
        'rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-3',
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{title}</h3>
      </div>
      {isEmpty ? (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">{emptyMessage || '—'}</p>
      ) : (
        children
      )}
    </motion.div>
  );
}

// ============================================
// COMPACT STRENGTH CHIP
// ============================================

function StrengthChip({ strength }: { strength: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <CheckCircle className="mr-1 h-3 w-3" />
      {strength}
    </span>
  );
}

// ============================================
// COMPACT NEXT ACTION
// ============================================

function CompactNextAction({ action }: { action: NextAction }) {
  const priorityColors = {
    high: 'border-l-amber-500',
    medium: 'border-l-blue-500',
    low: 'border-l-neutral-400',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border-l-2 bg-neutral-50 dark:bg-neutral-700/30 px-2 py-1.5',
        priorityColors[action.priority]
      )}
    >
      <Zap className="h-3 w-3 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
      <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{action.action}</span>
    </div>
  );
}

// ============================================
// JOURNEY SUMMARY PANEL - COMPACT GRID
// ============================================

export function JourneySummaryPanel({ summary, className }: JourneySummaryPanelProps) {
  const hasStrengths = summary.strengths.length > 0;
  const hasCareers = summary.careerInterests.length > 0 || summary.exploredRoles.length > 0;
  const hasPlan = summary.rolePlans.length > 0;
  const hasNextActions = summary.nextActions.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Your Snapshot</h2>
      </div>

      {/* Stats Row - Quick Numbers */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={Briefcase}
          label="Actions"
          value={summary.alignedActionsCount}
          subtext="completed"
          delay={0}
        />
        <StatCard
          icon={Star}
          label="Strengths"
          value={summary.strengths.length}
          subtext="identified"
          delay={0.05}
        />
        <StatCard
          icon={Compass}
          label="Careers"
          value={summary.careerInterests.length}
          subtext="exploring"
          delay={0.1}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Strengths */}
        <CompactSection
          title="Strengths"
          icon={Sparkles}
          isEmpty={!hasStrengths}
          emptyMessage="Complete reflection"
          delay={0.15}
        >
          <div className="flex flex-wrap gap-1">
            {summary.strengths.slice(0, 4).map((strength, index) => (
              <StrengthChip key={index} strength={strength} />
            ))}
            {summary.strengths.length > 4 && (
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-1">
                +{summary.strengths.length - 4}
              </span>
            )}
          </div>
        </CompactSection>

        {/* Primary Goal */}
        <CompactSection
          title="Primary Goal"
          icon={Target}
          isEmpty={!summary.primaryGoal?.title}
          emptyMessage="Select your goal"
          delay={0.2}
        >
          {summary.primaryGoal?.title && (
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {summary.primaryGoal.title}
              </p>
              {summary.primaryGoal?.selectedAt && (
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                  Selected {new Date(summary.primaryGoal.selectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </CompactSection>

        {/* Career Interests */}
        <CompactSection
          title="Career Interests"
          icon={Compass}
          isEmpty={!hasCareers}
          emptyMessage="Start exploring"
          delay={0.25}
        >
          <div className="flex flex-wrap gap-1">
            {summary.careerInterests.slice(0, 3).map((career, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              >
                {career}
              </Badge>
            ))}
            {summary.careerInterests.length > 3 && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                +{summary.careerInterests.length - 3}
              </span>
            )}
          </div>
          {summary.exploredRoles.length > 0 && (
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5">
              {summary.exploredRoles.length} deep dive{summary.exploredRoles.length !== 1 ? 's' : ''} completed
            </p>
          )}
        </CompactSection>

        {/* Plan Progress */}
        <CompactSection
          title="Plan Progress"
          icon={Target}
          isEmpty={!hasPlan}
          emptyMessage="Build your plan"
          delay={0.3}
        >
          {summary.rolePlans.slice(0, 1).map((plan, index) => (
            <div key={index}>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 truncate">
                {plan.roleTitle}
              </p>
              {plan.shortTermActions.length > 0 && (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {plan.shortTermActions.length} action{plan.shortTermActions.length !== 1 ? 's' : ''} planned
                </p>
              )}
              {plan.skillToBuild && (
                <div className="flex items-center gap-1 mt-1.5">
                  <GraduationCap className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
                    {plan.skillToBuild}
                  </span>
                </div>
              )}
            </div>
          ))}
        </CompactSection>
      </div>

      {/* Next Actions - Full Width */}
      {hasNextActions && (
        <CompactSection
          title="Next Actions"
          icon={TrendingUp}
          delay={0.35}
          className="col-span-2"
        >
          <div className="space-y-1.5">
            {summary.nextActions.slice(0, 2).map((action, index) => (
              <CompactNextAction key={index} action={action} />
            ))}
          </div>
        </CompactSection>
      )}

      {/* Companies of Interest - Subtle */}
      {summary.companiesOfInterest.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          <Building2 className="h-3 w-3" />
          <span>Companies: {summary.companiesOfInterest.slice(0, 3).join(', ')}</span>
          {summary.companiesOfInterest.length > 3 && (
            <span>+{summary.companiesOfInterest.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default JourneySummaryPanel;

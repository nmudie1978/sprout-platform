'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  JourneyStateId,
  StepCompletionData,
  ExploredRole,
  RolePlan,
} from '@/lib/journey/types';
import { getAllCareers, type Career } from '@/lib/career-pathways';

/** Look up career data for pre-populating Understand steps */
function findCareerByTitle(title: string | null | undefined): Career | null {
  if (!title) return null;
  return getAllCareers().find((c) => c.title === title) || null;
}

// ============================================
// TYPES
// ============================================

interface StepContentProps {
  stepId: JourneyStateId;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: StepCompletionData) => Promise<void>;
  existingData?: Partial<StepCompletionData>;
  context?: {
    completedJobs: number;
    savedCareers: string[];
    goalTitle?: string | null;
    profile?: {
      displayName?: string;
      bio?: string;
      city?: string;
    };
    summary?: Record<string, unknown>;
  };
}

// ============================================
// MODAL WRAPPER
// ============================================

function StepModal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border/50 shadow-2xl shadow-black/20"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-semibold text-foreground pr-8">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


// ============================================
// CAPABILITY REFLECTION STEP
// ============================================

const STRENGTH_OPTIONS = [
  'Reliability',
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Initiative',
  'Adaptability',
  'Time Management',
  'Attention to Detail',
  'Creativity',
  'Leadership',
  'Patience',
  'Empathy',
];

function CapabilityReflectionContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [customStrength, setCustomStrength] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStrength = (strength: string) => {
    if (selectedStrengths.includes(strength)) {
      setSelectedStrengths(selectedStrengths.filter((s) => s !== strength));
    } else if (selectedStrengths.length < 5) {
      setSelectedStrengths([...selectedStrengths, strength]);
    }
  };

  const addCustomStrength = () => {
    const trimmed = customStrength.trim();
    if (trimmed && !selectedStrengths.includes(trimmed) && selectedStrengths.length < 5) {
      setSelectedStrengths([...selectedStrengths, trimmed]);
      setCustomStrength('');
    }
  };

  const handleSubmit = async () => {
    if (selectedStrengths.length < 3) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        type: 'REFLECT_ON_STRENGTHS',
        topStrengths: selectedStrengths,
        demonstratedSkills: selectedStrengths,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-primary">
              Think about what you've done well in jobs, school, or personal projects.
              Select at least 3 strengths that best describe you.
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/80 mb-3">
          Select your top strengths ({selectedStrengths.length}/3 minimum, 5 max)
        </p>
        <div className="flex flex-wrap gap-2">
          {STRENGTH_OPTIONS.map((strength) => (
            <button
              key={strength}
              onClick={() => toggleStrength(strength)}
              className={cn(
                'px-3 py-2 rounded-full text-sm font-medium transition-colors',
                selectedStrengths.includes(strength)
                  ? 'bg-teal-500/15 text-teal-400 border-2 border-teal-500/40'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent'
              )}
            >
              {selectedStrengths.includes(strength) && (
                <Check className="inline-block mr-1 h-3.5 w-3.5" />
              )}
              {strength}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={customStrength}
          onChange={(e) => setCustomStrength(e.target.value)}
          placeholder="Add your own strength..."
          className="h-10"
          onKeyDown={(e) => e.key === 'Enter' && addCustomStrength()}
        />
        <Button variant="outline" onClick={addCustomStrength} size="sm">
          Add
        </Button>
      </div>

      {selectedStrengths.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground/80 mb-2">Your selections:</p>
          <div className="flex flex-wrap gap-2">
            {selectedStrengths.map((strength, index) => (
              <Badge
                key={strength}
                variant="secondary"
                className={cn(
                  'text-sm',
                  index < 3 ? 'bg-teal-500/15 text-teal-400' : 'bg-muted'
                )}
              >
                {index < 3 && <span className="mr-1">#{index + 1}</span>}
                {strength}
                <button
                  onClick={() => toggleStrength(strength)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedStrengths.length < 3 || isSubmitting}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Confirm Strengths
        </Button>
      </div>
    </div>
  );
}

// ============================================
// CAREER DISCOVERY STEP
// ============================================

const CAREER_OPTIONS = [
  { value: 'HEALTHCARE_LIFE_SCIENCES', label: 'Healthcare & Life Sciences' },
  { value: 'EDUCATION_TRAINING', label: 'Education & Training' },
  { value: 'TECHNOLOGY_IT', label: 'Technology & IT' },
  { value: 'BUSINESS_MANAGEMENT', label: 'Business & Management' },
  { value: 'FINANCE_BANKING', label: 'Finance & Banking' },
  { value: 'SALES_MARKETING', label: 'Sales & Marketing' },
  { value: 'MANUFACTURING_ENGINEERING', label: 'Engineering & Manufacturing' },
  { value: 'LOGISTICS_TRANSPORT', label: 'Logistics & Transport' },
  { value: 'HOSPITALITY_TOURISM', label: 'Hospitality & Tourism' },
  { value: 'REAL_ESTATE_PROPERTY', label: 'Real Estate & Property' },
  { value: 'SOCIAL_CARE_COMMUNITY', label: 'Social Care & Community' },
  { value: 'CONSTRUCTION_TRADES', label: 'Construction & Trades' },
];

function CareerDiscoveryContent({
  onComplete,
  onClose,
  context,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const [selectedCareers, setSelectedCareers] = useState<string[]>(
    context?.savedCareers || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCareer = (value: string) => {
    if (selectedCareers.includes(value)) {
      setSelectedCareers(selectedCareers.filter((c) => c !== value));
    } else if (selectedCareers.length < 3) {
      setSelectedCareers([...selectedCareers, value]);
    }
  };

  const handleSubmit = async () => {
    if (selectedCareers.length < 1) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        type: 'EXPLORE_CAREERS',
        selectedCareers,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal-400">
            Select up to 3 career categories you'd like to explore. Don't worry — you can always change
            these later!
          </p>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2">
          {CAREER_OPTIONS.map((career) => (
            <button
              key={career.value}
              onClick={() => toggleCareer(career.value)}
              className={cn(
                'p-3 rounded-xl text-sm font-medium text-left transition-all',
                selectedCareers.includes(career.value)
                  ? 'bg-teal-500/15 text-teal-400 border-2 border-teal-500/40 shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border-2 border-transparent'
              )}
            >
              {selectedCareers.includes(career.value) && (
                <Check className="inline-block mr-1 h-4 w-4" />
              )}
              {career.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedCareers.length < 1 || isSubmitting}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Continue
        </Button>
      </div>
    </div>
  );
}

// ============================================
// ROLE DEEP DIVE STEP
// ============================================

function RoleDeepDiveContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [roleTitle, setRoleTitle] = useState('');
  const [educationPaths, setEducationPaths] = useState('');
  const [certifications, setCertifications] = useState('');
  const [companies, setCompanies] = useState('');
  const [humanSkills, setHumanSkills] = useState('');
  const [entryExpectations, setEntryExpectations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!roleTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const role: ExploredRole = {
        title: roleTitle.trim(),
        exploredAt: new Date().toISOString(),
        educationPaths: educationPaths.split(',').map((s) => s.trim()).filter(Boolean),
        certifications: certifications.split(',').map((s) => s.trim()).filter(Boolean),
        companies: companies.split(',').map((s) => s.trim()).filter(Boolean),
        humanSkills: humanSkills.split(',').map((s) => s.trim()).filter(Boolean),
        entryExpectations: entryExpectations.trim(),
      };

      await onComplete({
        type: 'ROLE_DEEP_DIVE',
        role,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Research a specific role and capture what you learn. This helps you understand
            what it really takes to pursue this career.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Role Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g., Software Developer, Nurse, Marketing Manager"
            className="h-11"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Education Paths
          </label>
          <Input
            value={educationPaths}
            onChange={(e) => setEducationPaths(e.target.value)}
            placeholder="e.g., Bachelor's in CS, Bootcamp, Self-taught (comma separated)"
          />
          <p className="mt-1 text-xs text-muted-foreground">Separate multiple with commas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Required Certifications
          </label>
          <Input
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="e.g., AWS Certified, Nursing License (comma separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Example Companies (Norway + Global)
          </label>
          <Input
            value={companies}
            onChange={(e) => setCompanies(e.target.value)}
            placeholder="e.g., DNB, Equinor, Google, Microsoft (comma separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Human Skills Required
          </label>
          <Input
            value={humanSkills}
            onChange={(e) => setHumanSkills(e.target.value)}
            placeholder="e.g., Communication, Problem-solving (comma separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Entry Expectations
          </label>
          <Textarea
            value={entryExpectations}
            onChange={(e) => setEntryExpectations(e.target.value)}
            placeholder="What's typically expected to get started in this role?"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!roleTitle.trim() || isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save Research
        </Button>
      </div>
    </div>
  );
}

// ============================================
// PLAN BUILD STEP
// ============================================

function PlanBuildContent({
  onComplete,
  onClose,
  context,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const s = context?.summary as Record<string, unknown> | undefined;
  const existingPlan = ((s?.rolePlans as Array<Record<string, unknown>>) || [])[0];
  const existingActions = (existingPlan?.shortTermActions as string[]) || [];
  const roleTitle = context?.goalTitle || (existingPlan?.roleTitle as string) || '';
  const [action1, setAction1] = useState(existingActions[0] || '');
  const [action2, setAction2] = useState(existingActions[1] || '');
  const [skill, setSkill] = useState((existingPlan?.skillToBuild as string) || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!action1.trim() || !action2.trim() || !skill.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const plan: RolePlan = {
        roleTitle: roleTitle,
        shortTermActions: [action1.trim(), action2.trim()],
        midTermMilestone: '',
        skillToBuild: skill.trim(),
        createdAt: new Date().toISOString(),
      };

      await onComplete({
        type: 'CREATE_ACTION_PLAN',
        plan,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = action1.trim() && action2.trim() && skill.trim();

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Skill to Build Next <span className="text-red-500">*</span>
          </label>
          <Input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g., Python programming, Public speaking"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What skill will help you most as a {roleTitle || 'future professional'}?
          </p>
        </div>

        <div className="rounded-xl border border-border p-4 space-y-4">
          <div>
            <h4 className="font-medium text-foreground">Recommended Actions</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Two things you can do in the next 1-3 months</p>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Action 1 <span className="text-red-500">*</span></label>
            <Input
              value={action1}
              onChange={(e) => setAction1(e.target.value)}
              placeholder="e.g., Complete an online course on..."
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">Action 2 <span className="text-red-500">*</span></label>
            <Input
              value={action2}
              onChange={(e) => setAction2(e.target.value)}
              placeholder="e.g., Volunteer at a relevant organisation"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save Plan
        </Button>
      </div>
    </div>
  );
}

// ============================================
// INDUSTRY INSIGHTS STEP
// ============================================

function IndustryInsightsContent({
  onComplete,
  onClose,
  context,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const s = context?.summary as Record<string, unknown> | undefined;
  const career = findCareerByTitle(context?.goalTitle);
  const existingRole = (s?.roleRealityNotes as string[]) || [];
  const existingInsights = (s?.industryInsightNotes as string[]) || [];

  // Pre-populate from career data if user hasn't entered anything yet
  const defaultRole = existingRole.length > 0
    ? existingRole.join('\n')
    : career?.dailyTasks?.join('\n') || '';
  const defaultInsights = existingInsights.length > 0
    ? existingInsights.join('\n')
    : career
      ? [`Growth outlook: ${career.growthOutlook}`, `Average salary: ${career.avgSalary}`, career.description].join('\n')
      : '';

  const [roleReality, setRoleReality] = useState(defaultRole);
  const [industryInsights, setIndustryInsights] = useState(defaultInsights);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = roleReality.trim() || industryInsights.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const roleNotes = roleReality.split('\n').filter((l) => l.trim());
    const insightNotes = industryInsights.split('\n').filter((l) => l.trim());

    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        type: 'REVIEW_INDUSTRY_OUTLOOK',
        trendsReviewed: ['role_reality', 'industry_trends', 'skills_demand'],
        outlookNotes: [...roleNotes, ...insightNotes],
        roleRealityNotes: roleNotes,
        industryInsightNotes: insightNotes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Section 1: Role Reality */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">Role Reality</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          {career ? "We've filled in what we know — review and edit to match your research." : "What does this job actually involve day to day? What surprised you?"}
        </p>
        <Textarea
          value={roleReality}
          onChange={(e) => setRoleReality(e.target.value)}
          placeholder="e.g., The role involves more patient interaction than I expected&#10;Physical therapists need to keep up with new treatment methods&#10;Most work in hospitals, clinics, or private practices"
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      {/* Section 2: Industry Insights */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">Industry Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          {career ? "Review the industry data below and add anything you've found." : "Is this industry growing? What trends or changes matter? What are the opportunities?"}
        </p>
        <Textarea
          value={industryInsights}
          onChange={(e) => setIndustryInsights(e.target.value)}
          placeholder="e.g., Healthcare sector is growing due to ageing population&#10;Demand for physiotherapists is high in Norway&#10;Technology like telehealth is changing how care is delivered"
          rows={4}
          className="text-sm"
        />
      </div>

      <p className="text-[11px] text-muted-foreground/40">
        Write one point per line. Fill in at least one section to save.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

// ============================================
// (REMOVED: PRIMARY GOAL and REQUIREMENTS steps are no longer journey milestones)
// ============================================

// ============================================
// CAREER SHADOW STEP
// ============================================

function CareerShadowContent({
  onComplete,
  onClose,
  context,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const s = context?.summary as Record<string, unknown> | undefined;
  const career = findCareerByTitle(context?.goalTitle);
  const existingQualifications = (s?.pathQualifications as string[]) || [];
  const existingSkills = (s?.pathSkills as string[]) || [];
  const existingCourses = (s?.pathCourses as string[]) || [];
  const existingRequirements = (s?.pathRequirements as string[]) || [];

  // Pre-populate from career data if user hasn't entered anything yet
  const [qualifications, setQualifications] = useState(
    existingQualifications.length > 0 ? existingQualifications.join('\n') : career?.educationPath || ''
  );
  const [skills, setSkills] = useState(
    existingSkills.length > 0 ? existingSkills.join('\n') : career?.keySkills?.join('\n') || ''
  );
  const [courses, setCourses] = useState(
    existingCourses.length > 0
      ? existingCourses.join('\n')
      : career
        ? [
            career.educationPath,
            `Search vilbli.no for "${career.title}" programmes`,
          ].filter(Boolean).join('\n')
        : ''
  );
  const [requirements, setRequirements] = useState(
    existingRequirements.length > 0
      ? existingRequirements.join('\n')
      : career?.entryLevel
        ? 'No higher education required — entry-level accessible'
        : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = qualifications.trim() || skills.trim() || courses.trim() || requirements.trim();

  const toList = (text: string) => text.split('\n').filter((l) => l.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        type: 'CAREER_SHADOW',
        qualifications: toList(qualifications),
        keySkills: toList(skills),
        courses: toList(courses),
        requirements: toList(requirements),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Qualifications */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">Qualifications</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          {career ? "We've pre-filled what we know — adjust based on your own research." : "What degrees, diplomas, or certifications are needed?"}
        </p>
        <Textarea
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="e.g., Bachelor's in Physiotherapy (3 years)&#10;Must be authorised by the Norwegian Directorate of Health"
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      {/* Key Skills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">Key Skills</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          {career ? "Key skills for this role — edit or add your own." : "What skills are most important for this role?"}
        </p>
        <Textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Anatomy knowledge&#10;Communication and empathy&#10;Physical fitness and manual therapy"
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      {/* Courses */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">Relevant Courses</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Any specific courses or training programmes you've found?
        </p>
        <Textarea
          value={courses}
          onChange={(e) => setCourses(e.target.value)}
          placeholder="e.g., OsloMet Bachelor in Physiotherapy&#10;First Aid certification&#10;Sports Science modules"
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      {/* General Requirements */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold">General Requirements</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Any other entry requirements or things you need to know?
        </p>
        <Textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g., Good grades in science subjects&#10;Internship or practical experience preferred&#10;Police clearance certificate required"
          rows={3}
          className="text-sm"
        />
      </div>

      <p className="text-[11px] text-muted-foreground/40">
        One point per line. Fill in at least one section to save.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}

// ============================================
// ALIGNED ACTION STEP
// ============================================

function AlignedActionContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const ACTION_OPTIONS: { value: string; label: string }[] = [
    { value: 'PERSONAL_PROJECT', label: 'Personal Project' },
    { value: 'COURSE_OR_CERTIFICATION', label: 'Course or Certification' },
    { value: 'VOLUNTEER_WORK', label: 'Volunteer Work' },
    { value: 'INDUSTRY_EVENT', label: 'Industry Event' },
    { value: 'SMALL_JOB', label: 'Small Job' },
    { value: 'MENTORSHIP_SESSION', label: 'Mentorship' },
    { value: 'OTHER', label: 'Other' },
  ];

  const [actionType, setActionType] = useState('');
  const [customType, setCustomType] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveType = actionType === 'OTHER' ? customType.trim() : actionType;
  const canSubmit = effectiveType && actionTitle.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        type: 'COMPLETE_ALIGNED_ACTION',
        actionType: (actionType === 'OTHER' ? 'PERSONAL_PROJECT' : actionType) as import('@/lib/journey/types').AlignedActionType,
        actionId: `action-${Date.now()}`,
        actionTitle: actionType === 'OTHER' ? `[${customType.trim()}] ${actionTitle.trim()}` : actionTitle.trim(),
        linkedToGoal: true,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Type Selection */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">What did you do?</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActionType(opt.value)}
              className={cn(
                'p-2.5 rounded-lg text-xs font-medium text-left transition-all border-2',
                actionType === opt.value
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {actionType === 'OTHER' && (
          <Input
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="e.g. Shadowing, Research, Networking..."
            className="mt-2 text-sm"
            maxLength={60}
          />
        )}
      </div>

      <div className="border-t border-border/30" />

      {/* Action Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">Describe your action</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          What specifically did you do? Be concrete.
        </p>
        <Input
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          placeholder="e.g., Completed a first aid certification course"
          className="text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Log Action
        </Button>
      </div>
    </div>
  );
}

// ============================================
// ACTION REFLECTION STEP
// ============================================

function ActionReflectionContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [whatLearned, setWhatLearned] = useState('');
  const [whatNext, setWhatNext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = whatLearned.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = [whatLearned.trim(), whatNext.trim()].filter(Boolean).join('\n\n');
      await onComplete({
        type: 'SUBMIT_ACTION_REFLECTION',
        actionId: 'current',
        reflectionResponse: response,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">What did you learn?</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          How did this action help you progress toward your career goal?
        </p>
        <Textarea
          value={whatLearned}
          onChange={(e) => setWhatLearned(e.target.value)}
          placeholder="e.g., I learned that this field requires more hands-on skills than I expected..."
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">What will you do next?</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Based on what you learned, what's your next step?
        </p>
        <Textarea
          value={whatNext}
          onChange={(e) => setWhatNext(e.target.value)}
          placeholder="e.g., I'll focus on building practical experience through volunteering..."
          rows={3}
          className="text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="bg-amber-600 hover:bg-amber-700">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save Reflection
        </Button>
      </div>
    </div>
  );
}

// ============================================
// UPDATE PLAN STEP
// ============================================

function UpdatePlanContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [whatChanged, setWhatChanged] = useState('');
  const [newActions, setNewActions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = whatChanged.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        type: 'UPDATE_PLAN',
        updatedPlan: {
          roleTitle: '',
          shortTermActions: newActions.split('\n').filter((l) => l.trim()),
          midTermMilestone: '',
          skillToBuild: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        changeReason: whatChanged.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">What has changed?</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Based on your experience, what would you change about your plan?
        </p>
        <Textarea
          value={whatChanged}
          onChange={(e) => setWhatChanged(e.target.value)}
          placeholder="e.g., I realised I need more practical experience before applying..."
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="border-t border-border/30" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">New actions</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Any new steps you want to add to your plan?
        </p>
        <Textarea
          value={newActions}
          onChange={(e) => setNewActions(e.target.value)}
          placeholder="e.g., Sign up for a weekend workshop&#10;Start a portfolio website"
          rows={3}
          className="text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="bg-amber-600 hover:bg-amber-700">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Update Plan
        </Button>
      </div>
    </div>
  );
}

// ============================================
// EXTERNAL FEEDBACK STEP
// ============================================

function ExternalFeedbackContent({
  onComplete,
  onClose,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const SOURCES = [
    { value: 'employer', label: 'Employer' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'reviewer', label: 'Other' },
  ] as const;

  const [feedbackSource, setFeedbackSource] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = feedbackSource && feedbackSummary.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete({
        type: 'EXTERNAL_FEEDBACK',
        feedbackSource: feedbackSource as 'employer' | 'mentor' | 'reviewer',
        feedbackSummary: feedbackSummary.trim(),
        receivedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Source Selection */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">Who gave you feedback?</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SOURCES.map((src) => (
            <button
              key={src.value}
              onClick={() => setFeedbackSource(src.value)}
              className={cn(
                'p-2.5 rounded-lg text-xs font-medium text-left transition-all border-2',
                feedbackSource === src.value
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              )}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/30" />

      {/* Feedback Content */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold">What feedback did you receive?</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 mb-3">
          Summarise the key points — what went well and what to improve.
        </p>
        <Textarea
          value={feedbackSummary}
          onChange={(e) => setFeedbackSummary(e.target.value)}
          placeholder="e.g., My mentor said I should focus more on practical skills&#10;They recommended I look into certification programmes"
          rows={4}
          className="text-sm"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="bg-amber-600 hover:bg-amber-700">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save Feedback
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN STEP CONTENT COMPONENT
// ============================================

export function StepContent({
  stepId,
  isOpen,
  onClose,
  onComplete,
  existingData,
  context,
}: StepContentProps) {
  const stepTitles: Record<JourneyStateId, { title: string; description?: string }> = {
    // DISCOVER lens
    REFLECT_ON_STRENGTHS: {
      title: 'Know Your Strengths',
      description: 'Identify your top 3 strengths by taking a quick quiz or reflecting on what you excel at',
    },
    EXPLORE_CAREERS: {
      title: 'Explore Possibilities',
      description: 'Look up 3 career paths that interest you',
    },
    ROLE_DEEP_DIVE: {
      title: 'Set Your Career Direction',
      description: 'Pick a career path you like and find out more about what the job looks like daily',
    },
    // UNDERSTAND lens
    REVIEW_INDUSTRY_OUTLOOK: {
      title: 'Role Reality & Industry Insights',
      description: 'Capture what you\'ve learned about this career and its industry',
    },
    CAREER_SHADOW: {
      title: 'Path, Skills & Requirements',
      description: 'Capture the qualifications, skills, and courses needed for this career',
    },
    CREATE_ACTION_PLAN: {
      title: 'Short-term Actions',
      description: 'A couple of things you can focus on next',
    },
    // ACT lens
    COMPLETE_ALIGNED_ACTION: {
      title: 'Log an Action',
      description: 'Record a real step you\'ve taken toward your career goal',
    },
    SUBMIT_ACTION_REFLECTION: {
      title: 'Reflect on Your Action',
      description: 'What did you learn and what will you do next?',
    },
    UPDATE_PLAN: {
      title: 'Update Your Plan',
      description: 'Adjust your plan based on what you\'ve learned',
    },
    EXTERNAL_FEEDBACK: {
      title: 'Log Feedback',
      description: 'Record feedback you\'ve received from others',
    },
  };

  const { title, description } = stepTitles[stepId];

  const renderContent = () => {
    switch (stepId) {
      // DISCOVER lens
      case 'REFLECT_ON_STRENGTHS':
        return <CapabilityReflectionContent onComplete={onComplete} onClose={onClose} />;

      case 'EXPLORE_CAREERS':
        return (
          <CareerDiscoveryContent onComplete={onComplete} onClose={onClose} context={context} />
        );

      case 'ROLE_DEEP_DIVE':
        return <RoleDeepDiveContent onComplete={onComplete} onClose={onClose} />;

      // UNDERSTAND lens
      case 'REVIEW_INDUSTRY_OUTLOOK':
        return <IndustryInsightsContent onComplete={onComplete} onClose={onClose} context={context} />;

      case 'CAREER_SHADOW':
        return <CareerShadowContent onComplete={onComplete} onClose={onClose} context={context} />;

      case 'CREATE_ACTION_PLAN':
        return <PlanBuildContent onComplete={onComplete} onClose={onClose} context={context} />;

      // ACT lens
      case 'COMPLETE_ALIGNED_ACTION':
        return <AlignedActionContent onComplete={onComplete} onClose={onClose} context={context} />;

      case 'SUBMIT_ACTION_REFLECTION':
        return <ActionReflectionContent onComplete={onComplete} onClose={onClose} />;

      case 'UPDATE_PLAN':
        return <UpdatePlanContent onComplete={onComplete} onClose={onClose} />;

      case 'EXTERNAL_FEEDBACK':
        return <ExternalFeedbackContent onComplete={onComplete} onClose={onClose} />;

      default:
        return <p>Step content not available.</p>;
    }
  };

  return (
    <StepModal isOpen={isOpen} onClose={onClose} title={title} description={description}>
      {renderContent()}
    </StepModal>
  );
}

export default StepContent;

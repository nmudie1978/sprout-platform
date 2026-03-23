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
    profile?: {
      displayName?: string;
      bio?: string;
      city?: string;
    };
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
            Select up to 3 career areas you'd like to explore. Don't worry - you can always change
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
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [roleTitle, setRoleTitle] = useState('');
  const [action1, setAction1] = useState('');
  const [action2, setAction2] = useState('');
  const [milestone, setMilestone] = useState('');
  const [skill, setSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!roleTitle.trim() || !action1.trim() || !action2.trim() || !milestone.trim() || !skill.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const plan: RolePlan = {
        roleTitle: roleTitle.trim(),
        shortTermActions: [action1.trim(), action2.trim()],
        midTermMilestone: milestone.trim(),
        skillToBuild: skill.trim(),
        createdAt: new Date().toISOString(),
      };

      await onComplete({
        type: 'CREATE_ACTION_PLAN',
        plan,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = roleTitle.trim() && action1.trim() && action2.trim() && milestone.trim() && skill.trim();

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            Create an actionable plan to move toward your career goal.
            Focus on concrete steps you can take.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Target Role <span className="text-red-500">*</span>
          </label>
          <Input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="What role are you planning toward?"
            className="h-11"
          />
        </div>

        <div className="rounded-xl border border-border p-4 space-y-4">
          <h4 className="font-medium text-foreground">Short-term Actions (next 1-3 months)</h4>

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
              placeholder="e.g., Shadow someone in this role"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Mid-term Milestone (3-12 months) <span className="text-red-500">*</span>
          </label>
          <Input
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="e.g., Get an internship or entry-level position"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Skill to Build Next <span className="text-red-500">*</span>
          </label>
          <Input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g., Python programming, Public speaking"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-teal-600 hover:bg-teal-700"
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
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [roleReality, setRoleReality] = useState('');
  const [industryInsights, setIndustryInsights] = useState('');
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
          What does this job actually involve day to day? What surprised you?
        </p>
        <Textarea
          value={roleReality}
          onChange={(e) => setRoleReality(e.target.value)}
          placeholder="e.g., The role involves more patient interaction than I expected&#10;Physical therapists need to keep up with new treatment methods&#10;Most work in hospitals, clinics, or private practices"
          rows={4}
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
          Is this industry growing? What trends or changes matter? What are the opportunities?
        </p>
        <Textarea
          value={industryInsights}
          onChange={(e) => setIndustryInsights(e.target.value)}
          placeholder="e.g., Healthcare sector is growing due to ageing population&#10;Demand for physiotherapists is high in Norway&#10;Technology like telehealth is changing how care is delivered"
          rows={4}
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
}) {
  const [qualifications, setQualifications] = useState('');
  const [skills, setSkills] = useState('');
  const [courses, setCourses] = useState('');
  const [requirements, setRequirements] = useState('');
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
          What degrees, diplomas, or certifications are needed?
        </p>
        <Textarea
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          placeholder="e.g., Bachelor's in Physiotherapy (3 years)&#10;Must be authorised by the Norwegian Directorate of Health"
          rows={3}
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
          What skills are most important for this role?
        </p>
        <Textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Anatomy knowledge&#10;Communication and empathy&#10;Physical fitness and manual therapy"
          rows={3}
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
          className="text-sm border-border/80 focus:border-emerald-500/50"
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
  onClose,
  context,
}: {
  onComplete: (data: StepCompletionData) => Promise<void>;
  onClose: () => void;
  context?: StepContentProps['context'];
}) {
  const actionsCompleted = context?.completedJobs || 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            Pick a small action to get started. Apply for an internship, start a course, or build a portfolio.
          </p>
        </div>
      </div>

      <div className="text-center py-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/15 mb-4">
          <span className="text-3xl font-bold text-emerald-600">
            {actionsCompleted}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Actions Completed
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Complete jobs, shadows, projects, or courses that align with your goals.
        </p>
      </div>

      <div className="flex justify-center pt-4 border-t border-border">
        <Button onClick={onClose}>
          Got it
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
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reflection.trim()) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        type: 'SUBMIT_ACTION_REFLECTION',
        actionId: 'current',
        reflectionResponse: reflection.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">
            Reflecting on your experiences helps you grow and make better decisions.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          What did you learn from this experience? <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your thoughts, insights, and takeaways..."
          rows={5}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!reflection.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Submit Reflection
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
  const [changeReason, setChangeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!changeReason.trim()) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        type: 'UPDATE_PLAN',
        updatedPlan: {
          roleTitle: '',
          shortTermActions: [],
          midTermMilestone: '',
          skillToBuild: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        changeReason: changeReason.trim(),
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
            Based on what you've learned, update your action plan.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-2">
          What changes are you making and why?
        </label>
        <Textarea
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          placeholder="Describe the updates to your plan..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!changeReason.trim() || isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
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
  const [feedbackSource, setFeedbackSource] = useState<'employer' | 'mentor' | 'reviewer'>('employer');
  const [feedbackSummary, setFeedbackSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackSummary.trim()) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        type: 'EXTERNAL_FEEDBACK',
        feedbackSource,
        feedbackSummary: feedbackSummary.trim(),
        receivedAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-green-50 border border-green-100 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            External feedback helps you understand how others see your work and growth.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Feedback Source
          </label>
          <div className="flex gap-2">
            {(['employer', 'mentor', 'reviewer'] as const).map((source) => (
              <Button
                key={source}
                variant={feedbackSource === source ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackSource(source)}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Summary of Feedback <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={feedbackSummary}
            onChange={(e) => setFeedbackSummary(e.target.value)}
            placeholder="What feedback did you receive?"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!feedbackSummary.trim() || isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
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
      title: 'Deep Dive into a Role',
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
      title: 'Build Your Plan',
      description: 'Write down 3 actions you can take in the next month to move forward',
    },
    // ACT lens
    COMPLETE_ALIGNED_ACTION: {
      title: 'Complete an Aligned Action',
      description: 'Pick a small action to get started',
    },
    SUBMIT_ACTION_REFLECTION: {
      title: 'Reflect on Your Action',
      description: 'Reflect on what you\'ve learned and how it helped you progress',
    },
    UPDATE_PLAN: {
      title: 'Update Your Plan',
      description: 'Update your plan with new insights',
    },
    EXTERNAL_FEEDBACK: {
      title: 'External Feedback',
      description: 'Ask for feedback from someone you trust',
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
        return <IndustryInsightsContent onComplete={onComplete} onClose={onClose} />;

      case 'CAREER_SHADOW':
        return <CareerShadowContent onComplete={onComplete} onClose={onClose} />;

      case 'CREATE_ACTION_PLAN':
        return <PlanBuildContent onComplete={onComplete} onClose={onClose} />;

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

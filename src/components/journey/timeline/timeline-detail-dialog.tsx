'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { STAGE_CONFIG, type JourneyItem } from '@/lib/journey/career-journey-types';
import { classifyStepType, getWhyItMatters } from '@/lib/education/alignment';
import { STEP_TYPE_CONFIG } from '@/lib/education/types';
import { cn } from '@/lib/utils';
import {
  Check,
  Loader2,
  ExternalLink,
  BookOpen,
  Globe,
  Wrench,
  Play,
  GraduationCap,
  StickyNote,
  Circle,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';

interface TimelineDetailDialogProps {
  item: JourneyItem | null;
  allItems?: JourneyItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

interface CardData {
  status: 'not_started' | 'in_progress' | 'done';
  notes: string;
  resourceLink: string;
  confidence: string;
  completedMicroActions?: number[];
  stickyNote?: string;
}

const STORAGE_KEY = 'roadmap-card-data';

export function loadCardData(itemId: string): CardData {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[itemId] || { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  } catch {
    return { status: 'not_started', notes: '', resourceLink: '', confidence: '' };
  }
}

function saveCardData(itemId: string, data: CardData) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[itemId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent fail
  }
}

/** Cycle progress: not_started → in_progress → done → not_started */
export function cycleProgress(itemId: string): CardData['status'] {
  const data = loadCardData(itemId);
  const next: CardData['status'] =
    data.status === 'not_started' ? 'in_progress' :
    data.status === 'in_progress' ? 'done' : 'not_started';
  saveCardData(itemId, { ...data, status: next });
  return next;
}

const CONFIDENCE_OPTIONS = [
  { value: 'low', label: 'Low', emoji: '😟' },
  { value: 'medium', label: 'Medium', emoji: '😐' },
  { value: 'high', label: 'High', emoji: '😊' },
] as const;

const STATUS_OPTIONS = [
  { value: 'not_started' as const, label: 'Not started', icon: Circle, color: 'text-muted-foreground/50' },
  { value: 'in_progress' as const, label: 'In progress', icon: CircleDot, color: 'text-amber-500' },
  { value: 'done' as const, label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
];

const RESOURCE_TYPE_ICONS = {
  course: GraduationCap,
  article: BookOpen,
  tool: Wrench,
  platform: Globe,
  video: Play,
} as const;

/** Returns tailored placeholder text based on the step type and title */
function getStepPrompts(item: JourneyItem) {
  const stepType = classifyStepType(item);
  const title = item.title.toLowerCase();

  let notesLabel = 'Notes & Reflections';
  let notesPlaceholder = 'What did you learn? What happened?';
  let resourceLabel = 'Resource Link';
  let resourcePlaceholder = 'e.g., https://course-link.com or article title';
  let confidenceQuestion = 'How confident do you feel?';

  if (stepType === 'school' || stepType === 'qualification') {
    if (/degree|university|undergraduate|postgrad|master/i.test(title)) {
      notesLabel = 'Study Notes';
      notesPlaceholder = 'Which programmes have you looked at? What are the entry requirements? Any open days planned?';
      resourcePlaceholder = 'e.g., university website, programme page, or UCAS link';
      confidenceQuestion = 'How prepared do you feel for this step?';
    } else if (/exam|test|mcat|gre|assessment/i.test(title)) {
      notesLabel = 'Preparation Notes';
      notesPlaceholder = 'How is your preparation going? What areas need more work? What study methods are helping?';
      resourcePlaceholder = 'e.g., study guide, practice test, or revision resource';
      confidenceQuestion = 'How ready do you feel for this exam?';
    } else if (/certification|licence|accredit/i.test(title)) {
      notesLabel = 'Certification Progress';
      notesPlaceholder = 'Have you started the application? What requirements have you completed so far?';
      resourcePlaceholder = 'e.g., certification body website or application portal';
      confidenceQuestion = 'How confident do you feel about meeting the requirements?';
    } else {
      notesLabel = 'Study Notes';
      notesPlaceholder = 'What subjects are you focusing on? What has been challenging or interesting?';
      resourcePlaceholder = 'e.g., course page, textbook, or study resource';
      confidenceQuestion = 'How confident do you feel about your studies?';
    }
  } else if (stepType === 'real-world') {
    if (/volunteer/i.test(title)) {
      notesLabel = 'Experience Notes';
      notesPlaceholder = 'What did you do? What surprised you? What skills did you develop?';
      resourcePlaceholder = 'e.g., organisation website or volunteer programme link';
      confidenceQuestion = 'How valuable was this experience?';
    } else if (/intern|placement|work experience/i.test(title)) {
      notesLabel = 'Placement Notes';
      notesPlaceholder = 'What was the role like day-to-day? What did you enjoy most? What would you do differently?';
      resourcePlaceholder = 'e.g., company website or job listing';
      confidenceQuestion = 'How confident are you this career direction is right for you?';
    } else if (/portfolio|project/i.test(title)) {
      notesLabel = 'Project Notes';
      notesPlaceholder = 'What are you building? What have you learned so far? What are your next steps?';
      resourcePlaceholder = 'e.g., project link, GitHub repo, or portfolio URL';
      confidenceQuestion = 'How confident do you feel about your progress?';
    } else if (/shadow/i.test(title)) {
      notesLabel = 'Shadowing Notes';
      notesPlaceholder = 'Who did you shadow? What did a typical day look like? Did it match your expectations?';
      resourcePlaceholder = 'e.g., contact details or organisation link';
      confidenceQuestion = 'Did this experience confirm your interest?';
    } else {
      notesLabel = 'Experience Notes';
      notesPlaceholder = 'What did this experience teach you? How does it connect to your career goals?';
      resourcePlaceholder = 'e.g., relevant website or contact';
      confidenceQuestion = 'How confident do you feel after this experience?';
    }
  } else if (stepType === 'milestone') {
    notesLabel = 'Milestone Reflections';
    notesPlaceholder = 'How does reaching this point feel? What got you here? What would you tell your past self?';
    resourcePlaceholder = 'e.g., certificate, achievement, or evidence link';
    confidenceQuestion = 'How accomplished do you feel?';
  } else if (stepType === 'learning') {
    if (/personal development|self|growth|reflect|strengths/i.test(title)) {
      notesLabel = 'Personal Reflections';
      notesPlaceholder = 'What have you discovered about yourself? What strengths are emerging? What areas do you want to develop?';
      resourcePlaceholder = 'e.g., personality test, journal, or self-assessment tool';
      confidenceQuestion = 'How well do you understand your own direction?';
    } else if (/workshop|course|training|seminar/i.test(title)) {
      notesLabel = 'Learning Notes';
      notesPlaceholder = 'What key takeaways did you get? How will you apply what you learned?';
      resourcePlaceholder = 'e.g., course link, workshop materials, or notes';
      confidenceQuestion = 'How useful was this learning?';
    } else if (/network|connect|mentor|talk/i.test(title)) {
      notesLabel = 'Connection Notes';
      notesPlaceholder = 'Who did you speak with? What advice stood out? Any follow-up actions?';
      resourcePlaceholder = 'e.g., LinkedIn profile, contact info, or event link';
      confidenceQuestion = 'How helpful was this connection?';
    } else if (/research|explore|discover|investigate/i.test(title)) {
      notesLabel = 'Research Notes';
      notesPlaceholder = 'What did you find out? Did anything surprise you? Has it changed your thinking?';
      resourcePlaceholder = 'e.g., article, report, or website you found useful';
      confidenceQuestion = 'How clear is your understanding now?';
    } else {
      notesLabel = 'Learning Notes';
      notesPlaceholder = 'What did you learn? How does it connect to your goals?';
      resourcePlaceholder = 'e.g., resource link or reference';
      confidenceQuestion = 'How confident do you feel about this area?';
    }
  }

  return { notesLabel, notesPlaceholder, resourceLabel, resourcePlaceholder, confidenceQuestion };
}

export function TimelineDetailDialog({
  item,
  allItems,
  open,
  onOpenChange,
  onSaved,
}: TimelineDetailDialogProps) {
  const [status, setStatus] = useState<CardData['status']>('not_started');
  const [notes, setNotes] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [confidence, setConfidence] = useState('');
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [stickyNote, setStickyNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved data when item changes
  useEffect(() => {
    if (item && open) {
      const data = loadCardData(item.id);
      setStatus(data.status || 'not_started');
      setNotes(data.notes);
      setResourceLink(data.resourceLink);
      setConfidence(data.confidence);
      setCompletedActions(data.completedMicroActions || []);
      setStickyNote(data.stickyNote || '');
      setSaved(false);
    }
  }, [item?.id, open]);

  const toggleMicroAction = useCallback((index: number) => {
    setCompletedActions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!item) return;
    setIsSaving(true);
    saveCardData(item.id, {
      status,
      notes,
      resourceLink,
      confidence,
      completedMicroActions: completedActions,
      stickyNote: stickyNote.trim() || undefined,
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      onSaved?.();
      setTimeout(() => onOpenChange(false), 600);
    }, 300);
  }, [item, status, notes, resourceLink, confidence, completedActions, stickyNote, onOpenChange, onSaved]);

  if (!item) return null;

  const stage = STAGE_CONFIG[item.stage];
  const ageLabel = item.endAge
    ? `Age ${item.startAge}\u2013${item.endAge}`
    : `Age ${item.startAge}`;

  const prompts = getStepPrompts(item);
  const hasMicroActions = item.microActions && item.microActions.length > 0;
  const hasHowTo = item.howTo && item.howTo.length > 0;
  const hasResources = item.suggestedResources && item.suggestedResources.length > 0;
  const microActionsDone = hasMicroActions
    ? completedActions.filter((i) => i < item.microActions!.length).length
    : 0;
  const microActionsTotal = item.microActions?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              {stage.label} &middot; {ageLabel}
            </span>
          </div>
          <DialogTitle className="text-base">{item.title}</DialogTitle>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground/70">{item.subtitle}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium bg-muted/30 text-muted-foreground/60">
              {STEP_TYPE_CONFIG[classifyStepType(item)].icon} {STEP_TYPE_CONFIG[classifyStepType(item)].label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/50 italic mt-1">
            {getWhyItMatters(item)}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* ── Progress Status ── */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">Progress</p>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-all border',
                      status === opt.value
                        ? 'border-foreground/20 bg-foreground/5'
                        : 'border-transparent bg-muted/20 text-muted-foreground/50 hover:bg-muted/40'
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', status === opt.value ? opt.color : '')} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── How to Get Started ── */}
          {(hasHowTo || item.description) && (
            <div className="rounded-lg bg-muted/15 border border-border/20 p-3">
              <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider mb-2">
                How to get started
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground/70 mb-2 leading-relaxed">{item.description}</p>
              )}
              {hasHowTo && (
                <ol className="space-y-1.5">
                  {item.howTo!.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/10 text-[9px] font-bold text-foreground/60 shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-foreground/80">{h.step}</span>
                        {h.detail && (
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{h.detail}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* ── Micro-Action Checklist ── */}
          {hasMicroActions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground/70">Action checklist</p>
                <span className="text-[10px] text-muted-foreground/50">
                  {microActionsDone}/{microActionsTotal} done
                </span>
              </div>
              {/* Progress bar */}
              {microActionsTotal > 0 && (
                <div className="h-1 w-full rounded-full bg-foreground/5 mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(microActionsDone / microActionsTotal) * 100}%` }}
                  />
                </div>
              )}
              <ul className="space-y-1">
                {item.microActions!.map((action, i) => {
                  const isDone = completedActions.includes(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() => toggleMicroAction(i)}
                        className={cn(
                          'w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                          isDone ? 'bg-emerald-500/5' : 'hover:bg-muted/30'
                        )}
                      >
                        <div className={cn(
                          'flex h-4 w-4 items-center justify-center rounded border mt-0.5 shrink-0 transition-colors',
                          isDone
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-muted-foreground/30'
                        )}>
                          {isDone && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          'text-xs leading-snug',
                          isDone ? 'text-muted-foreground/50 line-through' : 'text-foreground/80'
                        )}>
                          {action}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ── Suggested Resources ── */}
          {hasResources && (
            <div>
              <p className="text-xs font-medium text-foreground/70 mb-2">Suggested resources</p>
              <div className="space-y-1">
                {item.suggestedResources!.map((res, i) => {
                  const TypeIcon = RESOURCE_TYPE_ICONS[res.type] || Globe;
                  return (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/30 transition-colors group"
                    >
                      <TypeIcon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="flex-1 text-foreground/70 group-hover:text-foreground/90 truncate">
                        {res.label}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Sticky Note ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <StickyNote className="h-3 w-3 text-amber-500/60" />
              <p className="text-xs font-medium text-foreground/70">Quick note</p>
            </div>
            <Input
              value={stickyNote}
              onChange={(e) => setStickyNote(e.target.value.slice(0, 120))}
              placeholder="Pin a short reminder to this step..."
              className="text-xs h-8"
              maxLength={120}
            />
            {stickyNote.length > 0 && (
              <p className="text-[9px] text-muted-foreground/30 text-right mt-0.5">
                {stickyNote.length}/120
              </p>
            )}
          </div>

          {/* ── Notes / Reflections ── */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">{prompts.notesLabel}</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={prompts.notesPlaceholder}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* ── Your Resource Link ── */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">{prompts.resourceLabel}</p>
            <Input
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
              placeholder={prompts.resourcePlaceholder}
              className="text-sm"
            />
          </div>

          {/* ── Confidence ── */}
          <div>
            <p className="text-xs font-medium text-foreground/70 mb-2">{prompts.confidenceQuestion}</p>
            <div className="grid grid-cols-3 gap-2">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setConfidence(opt.value)}
                  className={cn(
                    'p-2 rounded-lg text-xs font-medium text-center transition-all border-2 flex flex-col items-center gap-1',
                    confidence === opt.value
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                      : 'border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Save footer ── */}
        <div className="sticky bottom-0 pt-3 mt-2 border-t border-border/30 bg-card space-y-2">
          <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className={cn(
              'text-xs',
              saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : saved ? (
              <Check className="mr-1.5 h-3 w-3" />
            ) : null}
            {saved ? 'Saved' : 'Save'}
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Demo Career Journey — Data + Mermaid Pipeline
 *
 * Hardcoded Cybersecurity Analyst pathway that demonstrates
 * the Claude → JSON → Mermaid rendering pipeline.
 */

// ============================================
// TYPES
// ============================================

export interface CareerJourneyStage {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface CareerJourneyItem {
  title: string;
  stage: string;
  startYear: number;
  durationYears: number;
  isMilestone: boolean;
}

export interface CareerJourney {
  career: string;
  startAge: number;
  startYear: number;
  stages: CareerJourneyStage[];
  items: CareerJourneyItem[];
}

// ============================================
// DEMO DATA
// ============================================

export function getDemoCareerJourney(): CareerJourney {
  return {
    career: 'Cybersecurity Analyst',
    startAge: 17,
    startYear: 2025,
    stages: [
      { id: 'foundation', label: 'Foundation', color: '#14b8a6', icon: 'Sparkles' },
      { id: 'education', label: 'Education', color: '#3b82f6', icon: 'GraduationCap' },
      { id: 'experience', label: 'Experience', color: '#f97316', icon: 'Briefcase' },
      { id: 'career', label: 'Career', color: '#a855f7', icon: 'Target' },
    ],
    items: [
      {
        title: 'Core IT + Security Basics',
        stage: 'foundation',
        startYear: 2025,
        durationYears: 1,
        isMilestone: false,
      },
      {
        title: 'Build 2 security projects',
        stage: 'foundation',
        startYear: 2026,
        durationYears: 0,
        isMilestone: true,
      },
      {
        title: 'College - IT focus',
        stage: 'education',
        startYear: 2026,
        durationYears: 1,
        isMilestone: false,
      },
      {
        title: 'Cybersecurity certificate track',
        stage: 'education',
        startYear: 2027,
        durationYears: 1,
        isMilestone: false,
      },
      {
        title: 'CompTIA Security+',
        stage: 'education',
        startYear: 2028,
        durationYears: 0,
        isMilestone: true,
      },
      {
        title: 'Helpdesk / Junior IT role',
        stage: 'experience',
        startYear: 2028,
        durationYears: 1,
        isMilestone: false,
      },
      {
        title: 'Security internship',
        stage: 'experience',
        startYear: 2029,
        durationYears: 1,
        isMilestone: false,
      },
      {
        title: 'Junior SOC Analyst',
        stage: 'career',
        startYear: 2030,
        durationYears: 0,
        isMilestone: true,
      },
      {
        title: 'SOC Analyst (Level 1)',
        stage: 'career',
        startYear: 2030,
        durationYears: 1,
        isMilestone: false,
      },
    ],
  };
}

// ============================================
// MERMAID PIPELINE
// ============================================

export function careerJourneyToMermaid(journey: CareerJourney): string {
  const lines: string[] = [];

  // Theme configuration
  lines.push(
    `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#14b8a6', 'primaryBorderColor': '#0d9488', 'gridColor': '#e5e7eb', 'todayLineColor': '#6366f1'}}}%%`
  );
  lines.push('gantt');
  lines.push('  dateFormat  YYYY-MM-DD');
  lines.push('  axisFormat  %Y');
  lines.push(`  title Career Journey: ${journey.career}`);
  lines.push('');

  // Group items by stage
  const stageMap = new Map<string, CareerJourneyItem[]>();
  for (const stage of journey.stages) {
    stageMap.set(stage.id, []);
  }
  for (const item of journey.items) {
    const existing = stageMap.get(item.stage);
    if (existing) {
      existing.push(item);
    }
  }

  // Track task IDs for dependencies
  const taskCounters: Record<string, number> = {};
  let prevTaskId: string | null = null;

  for (const stage of journey.stages) {
    const items = stageMap.get(stage.id) || [];
    if (items.length === 0) continue;

    const prefix = stage.id.charAt(0);
    taskCounters[stage.id] = 0;

    lines.push(`  section ${stage.label}`);

    for (const item of items) {
      taskCounters[stage.id]++;
      const taskId = `${prefix}${taskCounters[stage.id]}`;
      const startDate = `${item.startYear}-01-01`;

      if (item.isMilestone) {
        if (prevTaskId) {
          lines.push(
            `  ${item.title}       :milestone, ${taskId}, after ${prevTaskId}, 0d`
          );
        } else {
          lines.push(
            `  ${item.title}       :milestone, ${taskId}, ${startDate}, 0d`
          );
        }
      } else {
        const days = Math.round(item.durationYears * 365);
        lines.push(
          `  ${item.title}       :${taskId}, ${startDate}, ${days}d`
        );
      }

      prevTaskId = taskId;
    }

    lines.push('');
  }

  return lines.join('\n');
}

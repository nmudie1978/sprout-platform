export interface TimelineMilestone {
  age: number;
  title: string;
  state: "done" | "current" | "future";
}

export interface MilestoneTimelineProps {
  milestones: TimelineMilestone[];
  className?: string;
}

export interface AcknowledgementMessage {
  id: string;
  text: string;
}

/**
 * Curated pool of calm acknowledgement messages.
 * All observational — no praise, no imperatives, no gamification.
 */
export const ACKNOWLEDGEMENT_MESSAGES: AcknowledgementMessage[] = [
  { id: 'check-in', text: 'You took a moment to check in with yourself.' },
  { id: 'noticing', text: 'Noticing how you work is a quiet kind of progress.' },
  { id: 'small-moments', text: 'Small moments of awareness add up.' },
  { id: 'paused', text: 'You paused to think about what matters to you.' },
  { id: 'honest-look', text: 'An honest look at yourself — that takes something.' },
  { id: 'reflection-counts', text: 'Every reflection is a conversation with yourself.' },
  { id: 'paying-attention', text: 'Paying attention to your own patterns is worthwhile.' },
  { id: 'took-time', text: 'You took the time. That counts for something.' },
];

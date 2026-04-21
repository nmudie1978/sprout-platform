/**
 * Interactive Day Simulation Engine
 *
 * Generates branching "day in the life" narratives from the career
 * typical-days data. Each simulation has 5-6 nodes; each node presents
 * a scenario + 2-3 choices. Choices lead to different nodes, revealing
 * different aspects of the career (teamwork, problem-solving, client
 * interaction, technical work, etc.).
 *
 * The simulation is deterministic per career — same career always
 * produces the same tree. No AI call needed; pure data transformation.
 */

export interface SimChoice {
  id: string;
  label: string;
  /** Which aspect of the career this choice reveals. */
  reveals: string;
}

export interface SimNode {
  id: string;
  /** Time of day label, e.g. "8:30 AM" */
  time: string;
  /** Scenario description — what's happening right now. */
  scenario: string;
  /** Choices the user can make. Empty array = end node. */
  choices: SimChoice[];
  /** What the user learns from this node (shown after choosing). */
  insight: string;
}

export interface DaySimulation {
  careerId: string;
  careerTitle: string;
  intro: string;
  nodes: Record<string, SimNode>;
  startNodeId: string;
  /** Map: choiceId → next nodeId */
  transitions: Record<string, string>;
}

/**
 * Build a day simulation for a career. Returns null if the career
 * doesn't have enough typical-day data.
 *
 * This is a TEMPLATE-BASED generator — it builds the narrative from
 * the career's daily tasks, tools, and work environment. Each career
 * gets a unique simulation but the structure is consistent.
 */
export function buildDaySimulation(
  careerId: string,
  careerTitle: string,
  dailyTasks: string[],
  tools: string[],
  workSetting: string,
): DaySimulation | null {
  if (dailyTasks.length < 4) return null;

  // Build 5 nodes from the daily tasks, distributing across the day
  const times = ['8:30 AM', '10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM'];
  const nodes: Record<string, SimNode> = {};
  const transitions: Record<string, string> = {};

  // Node 1: Morning start — first task
  nodes['start'] = {
    id: 'start',
    time: times[0],
    scenario: `You arrive at work as a ${careerTitle}. ${workSetting === 'office' ? 'You settle at your desk and open your laptop.' : workSetting === 'field' ? 'You check your gear and review today\'s schedule.' : 'You prepare your workspace for the day ahead.'} Two things need your attention: ${dailyTasks[0].toLowerCase()} and ${dailyTasks[1].toLowerCase()}.`,
    choices: [
      { id: 'start-a', label: `Start with ${dailyTasks[0].toLowerCase()}`, reveals: 'prioritisation' },
      { id: 'start-b', label: `Start with ${dailyTasks[1].toLowerCase()}`, reveals: 'task variety' },
    ],
    insight: `Most ${careerTitle}s start their day by prioritising — the order often depends on deadlines, team needs, and client expectations.`,
  };

  // Node 2: Mid-morning — collaboration vs solo
  nodes['mid-morning'] = {
    id: 'mid-morning',
    time: times[1],
    scenario: `You've made progress on your first task. A colleague asks if you can help with ${dailyTasks[2].toLowerCase()}. You also have ${tools[0] ? `a ${tools[0]} notification` : 'an email'} waiting.`,
    choices: [
      { id: 'mid-a', label: 'Help your colleague first', reveals: 'teamwork' },
      { id: 'mid-b', label: 'Check the notification and respond', reveals: 'communication tools' },
    ],
    insight: `Collaboration is a big part of being a ${careerTitle}. Balancing your own work with helping others is a daily skill.`,
  };

  // Node 3: Late morning — problem or challenge
  nodes['challenge'] = {
    id: 'challenge',
    time: times[2],
    scenario: `Something unexpected: ${dailyTasks.length > 3 ? `the work on ${dailyTasks[3].toLowerCase()} isn't going as planned` : 'a deadline has been moved forward'}. You need to decide how to handle it.`,
    choices: [
      { id: 'challenge-a', label: 'Pause and ask for advice from a senior colleague', reveals: 'mentorship culture' },
      { id: 'challenge-b', label: 'Try to solve it yourself first', reveals: 'independent problem-solving' },
    ],
    insight: `Unexpected problems are normal in this role. How you handle them — asking for help vs. trying solo — depends on the situation and workplace culture.`,
  };

  // Node 4: Afternoon — the rewarding part
  nodes['afternoon'] = {
    id: 'afternoon',
    time: times[3],
    scenario: `After lunch, you get into the most satisfying part of the day: ${dailyTasks[0].toLowerCase()} is coming together well. ${tools.length > 1 ? `You're using ${tools[1]} to finalise your work.` : 'You can see real progress.'} Someone compliments your approach.`,
    choices: [
      { id: 'afternoon-a', label: 'Keep the momentum going', reveals: 'deep work satisfaction' },
      { id: 'afternoon-b', label: 'Take a short break — you\'ve earned it', reveals: 'work-life balance' },
    ],
    insight: `The best part of being a ${careerTitle} is often the moment when your work comes together. Most professionals say these moments make the harder days worth it.`,
  };

  // Node 5: End of day — reflection
  nodes['end'] = {
    id: 'end',
    time: times[4],
    scenario: `The day is winding down. You review what you accomplished: ${dailyTasks.slice(0, 3).map(t => t.toLowerCase()).join(', ')}. Tomorrow looks busy too.`,
    choices: [],
    insight: `A typical day as a ${careerTitle} is a mix of planned tasks and unexpected challenges. The skills that matter most aren't just technical — they're communication, prioritisation, and resilience.`,
  };

  // Wire transitions (linear for now; could branch in future)
  transitions['start-a'] = 'mid-morning';
  transitions['start-b'] = 'mid-morning';
  transitions['mid-a'] = 'challenge';
  transitions['mid-b'] = 'challenge';
  transitions['challenge-a'] = 'afternoon';
  transitions['challenge-b'] = 'afternoon';
  transitions['afternoon-a'] = 'end';
  transitions['afternoon-b'] = 'end';

  return {
    careerId,
    careerTitle,
    intro: `Experience a day in the life of a ${careerTitle}. Make choices at each step to discover what this career really feels like.`,
    nodes,
    startNodeId: 'start',
    transitions,
  };
}

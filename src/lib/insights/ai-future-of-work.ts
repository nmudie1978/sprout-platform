/**
 * "AI & The Future of Work" — curated content for the /insights section.
 *
 * Pure data (no React/JSX) so the section component stays presentational and
 * the copy lives in one editable place — matching the src/lib/insights/* data
 * convention. Icons are referenced by KEY and mapped to components in the
 * section, keeping this module framework-free.
 *
 * Framing rule: AI as an ENABLER and a source of new roles — never fear-based
 * "replacement" messaging. Calm, intelligent, optimistic, grounded.
 */

/** Icon keys mapped to lucide components in ai-future-of-work-section.tsx. */
export type AiIconKey =
  | "changesWork"
  | "createsRoles"
  | "humanSkills"
  | "enhanced"
  | "changed"
  | "created"
  | "humanWork";

export type AiModalId = "examples" | "roles" | "skills";

export interface AiCard {
  id: string;
  icon: AiIconKey;
  title: string;
  body: string;
  cta: string;
  modal: AiModalId;
}

export interface AiImpactChip {
  id: string;
  icon: AiIconKey;
  label: string;
}

export interface AiRoleCluster {
  label: string;
  roles: string[];
}

export interface AiTimelineItem {
  era: string;
  label: string;
}

export interface AiFutureOfWork {
  header: { badge: string; title: string; subtitle: string };
  cards: AiCard[];
  impactChips: AiImpactChip[];
  modals: {
    examples: { title: string; subtitle: string; items: string[] };
    roles: { title: string; subtitle: string; clusters: AiRoleCluster[] };
    skills: { title: string; subtitle: string; items: string[] };
  };
  timeline: AiTimelineItem[];
}

export const aiFutureOfWork: AiFutureOfWork = {
  header: {
    badge: "Future Lens",
    title: "AI & The Future of Work",
    subtitle:
      "How AI is changing careers, creating new roles, and reshaping the skills young people will need.",
  },

  cards: [
    {
      id: "how-ai-changes-work",
      icon: "changesWork",
      title: "How AI Changes Work",
      body: "AI is automating routine tasks, speeding up research, supporting decision-making, and giving people new creative and technical tools.",
      cta: "View examples",
      modal: "examples",
    },
    {
      id: "careers-ai-creating",
      icon: "createsRoles",
      title: "Careers AI Is Creating",
      body: "New roles are emerging across engineering, product, safety, data, design, governance, and business operations.",
      cta: "Explore roles",
      modal: "roles",
    },
    {
      id: "human-skills-matter",
      icon: "humanSkills",
      title: "Human Skills Still Matter",
      body: "Judgement, empathy, leadership, trust, communication, creativity, and real-world problem solving become more valuable as AI grows.",
      cta: "See skills",
      modal: "skills",
    },
  ],

  impactChips: [
    { id: "enhanced", icon: "enhanced", label: "Enhanced by AI" },
    { id: "changed", icon: "changed", label: "Changed by AI" },
    { id: "created", icon: "created", label: "Created by AI" },
    { id: "human", icon: "humanWork", label: "Lower-risk human work" },
  ],

  modals: {
    examples: {
      title: "How people use AI today",
      subtitle: "Real, everyday uses — AI helping people do their work better.",
      items: [
        "Designers use AI to generate concepts faster.",
        "Doctors use AI to support diagnosis and research.",
        "Lawyers use AI to review documents and summarise cases.",
        "Teachers use AI to personalise learning support.",
      ],
    },
    roles: {
      title: "Careers AI is creating",
      subtitle: "New and expanding roles, grouped by the kind of work they do.",
      clusters: [
        {
          label: "Engineering",
          roles: [
            "AI Engineer",
            "Machine Learning Engineer",
            "LLM Engineer",
            "AI Infrastructure Engineer",
          ],
        },
        {
          label: "Product & Business",
          roles: [
            "AI Product Manager",
            "AI Workflow Consultant",
            "AI Solutions Architect",
            "AI Automation Specialist",
          ],
        },
        {
          label: "Safety & Governance",
          roles: [
            "AI Safety Specialist",
            "AI Ethics Specialist",
            "AI Governance Analyst",
            "AI Auditor",
          ],
        },
        {
          label: "Creative & Human",
          roles: [
            "AI Content Strategist",
            "AI Experience Designer",
            "Human-AI Interaction Designer",
          ],
        },
      ],
    },
    skills: {
      title: "Future-proof skills",
      subtitle: "The human strengths that grow more valuable alongside AI.",
      items: [
        "Critical thinking",
        "Communication",
        "AI literacy",
        "Ethical judgement",
        "Creativity",
        "Problem solving",
      ],
    },
  },

  timeline: [
    { era: "1950s", label: "AI research begins" },
    { era: "2010s", label: "Deep learning accelerates" },
    { era: "2022", label: "Generative AI goes mainstream" },
    { era: "2025+", label: "AI agents reshape workflows" },
  ],
};

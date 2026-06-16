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
 *
 * Where a role maps to a real catalogue career, `careerId` deep-links it to
 * `/careers?open=<id>` so a curious young person can jump straight in.
 */

/** Icon keys mapped to lucide components in ai-future-of-work-section.tsx. */
export type AiIconKey =
  | "changesWork"
  | "createsRoles"
  | "humanSkills"
  | "rag"
  | "generate"
  | "build"
  | "automate"
  | "research"
  | "assist"
  | "model"
  | "certificate"
  | "video"
  | "timeline";

export type AiModalId = "examples" | "roles" | "skills" | "timeline" | "models";

export interface AiCard {
  id: string;
  icon: AiIconKey;
  title: string;
  body: string;
  cta: string;
  modal: AiModalId;
}

export interface AiRole {
  label: string;
  /** Catalogue career id → deep-links to /careers?open=<id>. */
  careerId?: string;
}

export interface AiRoleCluster {
  label: string;
  roles: AiRole[];
}

export interface AiModel {
  name: string;
  provider: string;
  /** Country / region of the provider. */
  origin: string;
  /** One-line, neutral note. */
  note: string;
  /** Open weights vs closed/hosted. */
  access: "open" | "closed";
}

export interface AiCertification {
  name: string;
  provider: string;
  level: string;
  url: string;
}

export interface AiVideo {
  id: string;
  title: string;
  channel: string;
  blurb: string;
}

export interface AiTimelineItem {
  era: string;
  label: string;
  /** Optional longer line shown in the modal. */
  detail?: string;
}

export interface AiFutureOfWork {
  header: { badge: string; title: string; subtitle: string };
  cards: AiCard[];
  models: { heading: string; subheading: string; note: string; items: AiModel[] };
  certifications: { heading: string; subheading: string; items: AiCertification[] };
  videos: { heading: string; subheading: string; items: AiVideo[] };
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

  models: {
    heading: "Today's leading AI models",
    subheading: "The big model families — and who builds them.",
    note: "AI moves fast — this is a snapshot, not a ranking. Capabilities change month to month.",
    items: [
      { name: "Claude", provider: "Anthropic", origin: "USA", note: "Safety-focused; strong at writing, reasoning and code.", access: "closed" },
      { name: "ChatGPT / GPT", provider: "OpenAI", origin: "USA", note: "The most widely used assistant; broad general ability.", access: "closed" },
      { name: "Gemini", provider: "Google DeepMind", origin: "USA", note: "Multimodal; built into Google products.", access: "closed" },
      { name: "Llama", provider: "Meta", origin: "USA", note: "Open weights — popular for building your own AI.", access: "open" },
      { name: "Mistral", provider: "Mistral AI", origin: "France", note: "Efficient European models, many open.", access: "open" },
      { name: "Grok", provider: "xAI", origin: "USA", note: "Conversational model integrated with X.", access: "closed" },
      { name: "DeepSeek", provider: "DeepSeek", origin: "China", note: "Strong open reasoning models at low cost.", access: "open" },
      { name: "Qwen", provider: "Alibaba", origin: "China", note: "Open, highly multilingual model family.", access: "open" },
    ],
  },

  certifications: {
    heading: "AI certification tracks",
    subheading: "Recognised ways to prove AI and machine-learning skills.",
    items: [
      {
        name: "Professional Machine Learning Engineer",
        provider: "Google Cloud",
        level: "Professional",
        url: "https://cloud.google.com/learn/certification/machine-learning-engineer",
      },
      {
        name: "AWS Certified — ML & AI Practitioner",
        provider: "Amazon Web Services",
        level: "Foundational → Specialty",
        url: "https://aws.amazon.com/certification/",
      },
      {
        name: "Azure AI Engineer Associate (AI-102)",
        provider: "Microsoft",
        level: "Associate",
        url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/",
      },
      {
        name: "Machine Learning Specialization",
        provider: "DeepLearning.AI",
        level: "Beginner-friendly",
        url: "https://www.deeplearning.ai/courses/",
      },
      {
        name: "AI Engineering Professional Certificate",
        provider: "IBM",
        level: "Beginner → Intermediate",
        url: "https://www.coursera.org/professional-certificates/ai-engineer",
      },
      {
        name: "Deep Learning Institute",
        provider: "NVIDIA",
        level: "Hands-on workshops",
        url: "https://www.nvidia.com/en-us/training/",
      },
    ],
  },

  videos: {
    heading: "Watch: careers in AI",
    subheading: "Short, real looks at what working in AI is actually like.",
    items: [
      {
        id: "kKYloh7_k5s",
        title: "Life as an AI Researcher & Machine Learning Engineer",
        channel: "J.P. Morgan",
        blurb: "Inside real AI research and ML engineering work at a global company.",
      },
      {
        id: "Idrm5Bp805A",
        title: "Day in the Life of an AI Engineer",
        channel: "YouTube",
        blurb: "From working with data to building models and shipping features.",
      },
    ],
  },

  modals: {
    examples: {
      title: "How people use AI today",
      subtitle: "Real, everyday uses — AI helping people do their work better.",
      items: [
        "RAG systems answer questions over documents, PDFs and wikis — fast access to unstructured data.",
        "People generate slide decks, reports and documents from a few prompts with Claude, ChatGPT and Gemini.",
        "Developers (and beginners) build JavaScript apps, scripts and websites by describing what they want.",
        "Businesses automate processes — support replies, data entry, summaries, scheduling and onboarding.",
        "Designers generate concepts and variations faster.",
        "Doctors and researchers use AI to support diagnosis and speed up literature reviews.",
        "Lawyers review documents and summarise cases; teachers personalise learning support.",
      ],
    },
    roles: {
      title: "Careers AI is creating",
      subtitle: "New and expanding roles — tap a linked role to explore it in Endeavrly.",
      clusters: [
        {
          label: "Engineering",
          roles: [
            { label: "AI Engineer", careerId: "ai-engineer" },
            { label: "Machine Learning Engineer", careerId: "machine-learning-engineer" },
            { label: "LLM Engineer", careerId: "llm-engineer" },
            { label: "Computer Vision Engineer", careerId: "computer-vision-engineer" },
            { label: "NLP Engineer", careerId: "nlp-engineer" },
            { label: "MLOps Engineer", careerId: "mlops-engineer" },
          ],
        },
        {
          label: "Data & Research",
          roles: [
            { label: "Data Scientist", careerId: "data-scientist" },
            { label: "AI Research Scientist", careerId: "ai-research-scientist" },
            { label: "Generative AI Engineer", careerId: "generative-ai-engineer" },
            { label: "Prompt Engineer", careerId: "prompt-engineer" },
          ],
        },
        {
          label: "Product & Business",
          roles: [
            { label: "AI Product Manager", careerId: "ai-product-manager" },
            { label: "AI Solutions Architect", careerId: "ai-solutions-architect" },
            { label: "AI Consultant", careerId: "ai-consultant" },
            { label: "Applied AI Engineer", careerId: "applied-ai-engineer" },
          ],
        },
        {
          label: "Safety & Governance",
          roles: [
            { label: "AI Ethics Specialist", careerId: "ai-ethics-specialist" },
            { label: "AI Safety Researcher", careerId: "ai-safety-researcher" },
            { label: "AI Governance Analyst" },
            { label: "AI Auditor" },
          ],
        },
        {
          label: "Creative & Human",
          roles: [
            { label: "AI Experience Designer" },
            { label: "Human-AI Interaction Designer" },
            { label: "AI Content Strategist" },
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
    { era: "1950", label: "Turing asks: can machines think?", detail: "Alan Turing proposes the 'imitation game' (the Turing Test)." },
    { era: "1956", label: "'Artificial Intelligence' is born", detail: "The Dartmouth workshop names the field and sparks decades of research." },
    { era: "1997", label: "Deep Blue beats Kasparov", detail: "IBM's chess computer defeats the world champion." },
    { era: "2012", label: "Deep learning breakthrough", detail: "AlexNet wins ImageNet, igniting the modern neural-network era." },
    { era: "2016", label: "AlphaGo wins at Go", detail: "DeepMind's AlphaGo beats Lee Sedol — a game thought too hard for AI." },
    { era: "2017", label: "The Transformer", detail: "'Attention Is All You Need' introduces the architecture behind today's models." },
    { era: "2020", label: "Large language models scale", detail: "GPT-3 shows that scaling models unlocks surprising new abilities." },
    { era: "2022", label: "Generative AI goes mainstream", detail: "ChatGPT reaches millions in weeks; AI becomes an everyday tool." },
    { era: "2023–24", label: "Multimodal models arrive", detail: "Claude, Gemini and Llama handle text, images and voice together." },
    { era: "2025+", label: "AI agents reshape workflows", detail: "AI that can take actions starts changing how whole teams work." },
  ],
};

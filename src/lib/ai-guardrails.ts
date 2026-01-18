/**
 * AI Assistant Guardrails
 * Ensures the assistant stays within safe, helpful boundaries
 *
 * LANGUAGE POLICY: This app is English-only by design.
 * All AI-generated content must be in English, regardless of user input language.
 * See /docs/english-only.md for full policy documentation.
 */

import { getCondensedNorwegianContext } from "./norwegian-context";

/**
 * English-only enforcement rule - MUST be included in all AI prompts
 * This is a hard requirement, not a preference.
 */
export const ENGLISH_ONLY_RULE = `
LANGUAGE REQUIREMENT (MANDATORY - NO EXCEPTIONS):
- Output language: English (en) only.
- Always respond in English, even if the user writes in another language.
- Do NOT translate your response into other languages.
- Do NOT switch languages mid-response.
- If the user writes in Norwegian or another language, understand their intent but respond in English.
- Use simple, clear English suitable for ages 15-20.
- You may include Norwegian terminology for local concepts (e.g., "fagbrev", "NAV", "skattekort") but explain them in English.
`.trim();

// Intent types for logging
export type IntentType =
  | "concierge" // Platform navigation help
  | "career_explain" // Career information
  | "next_steps" // Actionable advice
  | "message_draft" // Help writing applications
  | "progress_check" // Asking about their progress
  | "off_topic" // Out of scope
  | "unsafe"; // Potentially harmful

/**
 * Classify user intent from their message
 */
export function classifyIntent(userMessage: string): IntentType {
  const lower = userMessage.toLowerCase();

  // Unsafe content detection
  const unsafeKeywords = [
    "suicide",
    "self-harm",
    "kill myself",
    "hurt myself",
    "depression",
    "anxiety disorder",
    "mental health crisis",
  ];

  if (unsafeKeywords.some((keyword) => lower.includes(keyword))) {
    return "unsafe";
  }

  // Platform navigation
  const conciergeKeywords = [
    "how do i",
    "where can i",
    "how to use",
    "navigate",
    "find",
    "create profile",
    "apply for job",
  ];

  if (conciergeKeywords.some((keyword) => lower.includes(keyword))) {
    return "concierge";
  }

  // Career explanation
  const careerKeywords = [
    "what is a",
    "what does a",
    "career",
    "job",
    "role",
    "designer",
    "engineer",
    "analyst",
    "developer",
  ];

  if (careerKeywords.some((keyword) => lower.includes(keyword))) {
    return "career_explain";
  }

  // Progress check questions
  const progressKeywords = [
    "how am i doing",
    "my progress",
    "am i making progress",
    "how far",
    "on track",
    "doing well",
    "skills so far",
    "what have i learned",
    "what skills",
  ];

  if (progressKeywords.some((keyword) => lower.includes(keyword))) {
    return "progress_check";
  }

  // Next steps / actionable advice
  const nextStepsKeywords = [
    "how do i become",
    "what should i learn",
    "where do i start",
    "next steps",
    "get started",
    "prepare for",
  ];

  if (nextStepsKeywords.some((keyword) => lower.includes(keyword))) {
    return "next_steps";
  }

  // Message drafting
  const draftKeywords = [
    "help me write",
    "draft",
    "application message",
    "cover letter",
    "what should i say",
  ];

  if (draftKeywords.some((keyword) => lower.includes(keyword))) {
    return "message_draft";
  }

  // Off-topic detection
  const offTopicKeywords = [
    "weather",
    "sports",
    "politics",
    "religion",
    "joke",
    "story",
    "game",
    "movie",
  ];

  if (offTopicKeywords.some((keyword) => lower.includes(keyword))) {
    return "off_topic";
  }

  // Default to career explain
  return "career_explain";
}

/**
 * Get system prompt based on intent and optional user context
 */
export function getSystemPrompt(intent: IntentType, careerAspiration?: string | null): string {
  // Get Norwegian-specific context
  const norwegianContext = getCondensedNorwegianContext();

  const basePrompt = `You are a helpful career guidance assistant for a Norwegian youth platform (ages 15-20). You help with:
- Platform navigation (how to find jobs, create profiles, explore careers)
- Career information (what careers involve, required skills, realistic salaries in Norway)
- Next steps advice (how to get started in a career, education paths)
- Application message drafting (professional but friendly tone)
- Norwegian-specific guidance (labor law, age restrictions, seasonal jobs)

${ENGLISH_ONLY_RULE}

CRITICAL RULES:
1. NEVER provide therapy, mental health counseling, or crisis support
2. If someone mentions self-harm, suicide, or mental health crisis, respond: "I'm sorry you're going through this. Please reach out to a trusted adult, school counselor, or call 116 111 (Mental Helse helpline in Norway). I'm here for career questions when you're ready."
3. Stay focused on careers, jobs, and platform features
4. Keep responses concise (2-3 short paragraphs max)
5. Use a friendly, encouraging tone suitable for teens
6. Mention specific platform features when relevant (e.g., "You can browse careers in the Explore section")
7. Always give Norwegian-specific advice (salaries in NOK, Norwegian companies, local education paths)
8. Be honest about age restrictions - don't recommend jobs that require 18+ to under-18 users

HONEST PROGRESS FRAMEWORK (VERY IMPORTANT):
The platform tracks three types of progress for career goals. ALWAYS be honest about what small jobs contribute:

1. FOUNDATIONAL WORK SKILLS (from small jobs):
   - Reliability (showing up on time, completing jobs)
   - Communication (professional messages, responsiveness)
   - Responsibility (being trusted, getting rehired)
   These matter for EVERY career but do NOT teach career-specific skills.

2. CAREER-SPECIFIC PROGRESS (real career advancement):
   - Courses, certifications, formal learning
   - Projects directly related to the career
   - Industry-specific training
   Small jobs do NOT count here unless they directly involve career skills.

3. RUNWAY & READINESS (enabling factors):
   - Earnings that can fund courses, materials, education
   - Time availability for learning
   - Saved learning paths and goals

CORE PRINCIPLE: "Small jobs don't teach you a career. They give you the time, trust, and resources to pursue it."

When users ask "How am I doing?" or about progress:
- Separate foundational skills from career skills
- Be honest if they haven't started formal career learning
- Highlight how earnings and reliability create "runway" for career pursuit
- NEVER imply that babysitting teaches coding or nursing skills

NORWEGIAN EMPLOYMENT KNOWLEDGE:
${norwegianContext}

WRITING STYLE:
- Use simple, clear language (avoid jargon)
- Include Norwegian terms when helpful (e.g., "fagbrev", "lærling", "sommerjobb") but always explain them in English
- Be encouraging but realistic about job prospects`;

  // Add personalization if user has a career aspiration
  const personalizationPrompt = careerAspiration
    ? `\n\nUSER CONTEXT:
- Career Goal: ${careerAspiration}

When relevant, connect your advice to how it helps them achieve their goal of becoming ${careerAspiration}. Reference their career goal naturally in your responses to make the advice feel personalised.`
    : "";

  switch (intent) {
    case "unsafe":
      return `${basePrompt}\n\nUSER IS IN DISTRESS. Immediately direct them to professional help resources. Do not attempt to provide counseling.`;

    case "concierge":
      return `${basePrompt}${personalizationPrompt}\n\nFocus on explaining platform features and navigation. Guide the user to the right page or feature.`;

    case "career_explain":
      return `${basePrompt}${personalizationPrompt}\n\nIMPORTANT: Answer the user's SPECIFIC question. If they ask "what does a day look like", describe a typical workday in detail. If they ask about skills, focus on skills. If they ask about salary, focus on salary.

When describing a career:
- If asked about "a day in the life": Describe morning routines, typical tasks, meetings, lunch, afternoon work, end of day
- If asked about skills: List specific technical and soft skills needed
- If asked about salary: Give Norwegian salary ranges in NOK
- If asked about how to get started: Give actionable first steps

Use the provided career card information to make your answer specific and accurate. Don't give generic "getting started" advice unless that's what they asked for.`;

    case "next_steps":
      return `${basePrompt}${personalizationPrompt}\n\nProvide actionable, realistic steps. Reference platform features like micro-jobs for skill building.`;

    case "progress_check":
      return `${basePrompt}${personalizationPrompt}\n\nThe user is asking about their progress. Be HONEST and use the three-area framework:

1. FOUNDATIONAL PROGRESS: Comment on their work skills from jobs (reliability, communication, getting rehired)
2. CAREER PROGRESS: Be honest if they haven't started formal learning for their career goal - that's normal!
3. RUNWAY: Mention how their earnings and experience create runway for future learning

IMPORTANT:
- DO NOT imply small jobs teach career-specific skills
- Celebrate foundational progress without overstating its career value
- Encourage starting formal learning when ready
- Frame earnings as "learning runway" not career progress`;

    case "message_draft":
      return `${basePrompt}${personalizationPrompt}\n\nHelp draft a professional but friendly message. Keep it brief (2-3 sentences). Show enthusiasm and relevant skills.`;

    case "off_topic":
      return `${basePrompt}\n\nPolitely redirect to career-related topics. Suggest exploring careers or asking about jobs.`;

    default:
      return basePrompt + personalizationPrompt;
  }
}

/**
 * Check if response is safe to send
 */
export function isResponseSafe(response: string): {
  safe: boolean;
  reason?: string;
} {
  const lower = response.toLowerCase();

  // Check for therapy language
  const therapyKeywords = [
    "diagnose",
    "medication",
    "prescription",
    "clinical",
    "therapy session",
  ];

  if (therapyKeywords.some((keyword) => lower.includes(keyword))) {
    return {
      safe: false,
      reason: "Response contains medical/therapy language",
    };
  }

  // Check for inappropriate content
  const inappropriateKeywords = [
    "violence",
    "illegal",
    "drugs",
    "alcohol",
    "explicit",
  ];

  if (inappropriateKeywords.some((keyword) => lower.includes(keyword))) {
    return {
      safe: false,
      reason: "Response contains inappropriate content",
    };
  }

  return { safe: true };
}

/**
 * Detect if AI response contains significant non-English content
 * Returns true if the response appears to be in a language other than English
 *
 * This is a lightweight heuristic check - not meant to be perfect,
 * but catches obvious cases of non-English output.
 */
export function detectNonEnglishResponse(response: string): {
  isNonEnglish: boolean;
  detectedPatterns?: string[];
} {
  // Common Norwegian/Scandinavian patterns that indicate non-English response
  const norwegianPatterns = [
    /\b(jeg|du|vi|de|han|hun|det|den)\b/gi, // Common pronouns
    /\b(er|var|har|blir|kan|skal|vil|må)\b/gi, // Common verbs
    /\b(og|eller|men|så|fordi|hvis|når|som)\b/gi, // Common conjunctions
    /\b(ikke|bare|også|veldig|litt|mange|noen|alle)\b/gi, // Common adverbs
    /\b(hei|takk|beklager|unnskyld|vennligst)\b/gi, // Common phrases
    /\b(jobb|arbeid|karriere|utdanning|skole)\b/gi, // Work/career terms in Norwegian
  ];

  // Known Norwegian terms we allow (these are used in English context)
  const allowedNorwegianTerms = [
    "fagbrev", "lærling", "sommerjobb", "skattekort", "nav",
    "videregående", "høgskole", "folkehøgskole", "tarifflønn",
    "helgetillegg", "feriepenger", "arbeidsmiljøloven",
    "studiespesialisering", "yrkesfag", "politiattest",
  ];

  const detectedPatterns: string[] = [];
  let matchCount = 0;

  // Check for Norwegian patterns, excluding allowed terms
  for (const pattern of norwegianPatterns) {
    const matches = response.match(pattern);
    if (matches) {
      // Filter out allowed terms
      const filteredMatches = matches.filter(
        (m) => !allowedNorwegianTerms.includes(m.toLowerCase())
      );
      if (filteredMatches.length > 0) {
        matchCount += filteredMatches.length;
        detectedPatterns.push(...filteredMatches.slice(0, 3)); // Keep first 3 for logging
      }
    }
  }

  // If more than 5 Norwegian words detected (excluding allowed terms), flag it
  // This threshold allows for occasional Norwegian terms in context
  const isNonEnglish = matchCount > 5;

  return {
    isNonEnglish,
    detectedPatterns: isNonEnglish ? [...new Set(detectedPatterns)].slice(0, 5) : undefined,
  };
}

/**
 * Get a stronger English-only instruction for regeneration
 * Used when initial response was detected as non-English
 */
export function getEnglishOnlyRegenerationPrompt(): string {
  return `CRITICAL INSTRUCTION: Your previous response was not in English.
Rewrite your response in English only. Do not include any translations.
Output language: English (en). No exceptions.
Respond in clear, simple English suitable for ages 15-20.`;
}

/**
 * Get fallback response when guardrails triggered
 */
export function getFallbackResponse(intent: IntentType): string {
  if (intent === "unsafe") {
    return "I'm sorry you're going through this. Please reach out to a trusted adult, school counselor, or call **116 111** (Mental Helse helpline in Norway). I'm here for career questions when you're ready. 💙";
  }

  if (intent === "off_topic") {
    return "I'm focused on helping with careers and jobs! Would you like to explore career options, get advice on finding work, or learn about building skills? 🚀";
  }

  return "I'm here to help with careers, jobs, and using the platform. What would you like to know?";
}

/**
 * Get a smart fallback response based on keywords when AI is unavailable
 * This provides helpful responses without needing an AI API
 */
export function getSmartFallbackResponse(message: string, intent: IntentType): string {
  const lower = message.toLowerCase();

  // Handle greetings
  if (/^(hi|hello|hey|hei|hallo|good morning|good afternoon|good evening)[\s!.?]*$/i.test(message.trim())) {
    return "Hi there! I'm your career assistant. I can help you with:\n\n" +
      "• **Exploring careers** - Learn about different job paths\n" +
      "• **Finding jobs** - Tips for getting your first job\n" +
      "• **Writing applications** - Help with job messages\n" +
      "• **Building skills** - What employers look for\n\n" +
      "What would you like to know about?";
  }

  // Handle thanks
  if (/^(thanks|thank you|takk|tusen takk)[\s!.?]*$/i.test(message.trim())) {
    return "You're welcome! Feel free to ask if you have more questions about careers, jobs, or the platform. Good luck!";
  }

  // Check if this is a "day in the life" question - extract career name for generic handling
  // This catches questions like "What does a day in the life of an accountant look like?"
  const dayInLifePattern = /(?:day in the life|typical day|daily routine|workday|what do .* do all day).*?(?:of |as |for )?(?:a |an )?([a-zA-ZæøåÆØÅ\s]+?)(?:\?|$|look|like)/i;
  const dayMatch = lower.match(dayInLifePattern);
  if (dayMatch && (lower.includes("day") || lower.includes("typical") || lower.includes("look like") || lower.includes("routine"))) {
    // Let career-specific handlers below take over if they match
    // This is just for logging/tracking that it's a day-in-life question
  }

  // Career exploration questions
  if (lower.includes("what career") || lower.includes("which career") || lower.includes("career for me") || lower.includes("right career")) {
    return "Great question! Finding the right career starts with understanding your interests and strengths.\n\n" +
      "Here's how to explore:\n" +
      "1. **Browse Careers** - Check out our career cards in the Explore section to see different roles\n" +
      "2. **Consider Your Interests** - What subjects do you enjoy? What activities make you lose track of time?\n" +
      "3. **Try Different Jobs** - Use micro-jobs on this platform to get real experience in different areas\n\n" +
      "Would you like to explore specific career areas like tech, healthcare, or creative fields?";
  }

  // Getting started / first job questions
  if (lower.includes("first job") || lower.includes("get started") || lower.includes("how do i start") || lower.includes("no experience")) {
    return "Starting your first job can feel daunting, but everyone starts somewhere!\n\n" +
      "**Tips for getting your first job:**\n" +
      "• **Start small** - Look for micro-jobs like dog walking, babysitting, or helping with errands\n" +
      "• **Build your profile** - Complete your profile here to show employers who you are\n" +
      "• **Highlight soft skills** - Reliability, punctuality, and good communication matter a lot\n" +
      "• **Ask around** - Family, neighbors, and friends often need help with tasks\n\n" +
      "Browse available jobs on this platform to find opportunities near you!";
  }

  // Progress check questions
  if (lower.includes("how am i doing") || lower.includes("my progress") || lower.includes("on track")) {
    return "Let me give you an honest view of your progress.\n\n" +
      "**Your progress has three parts:**\n\n" +
      "1. **Foundational Skills** (from jobs): Reliability, communication, and earning trust. These matter in EVERY career.\n\n" +
      "2. **Career-Specific Progress**: This comes from courses, certifications, and career-related learning. Small jobs don't directly build these skills.\n\n" +
      "3. **Your Runway**: Money earned + time available = resources to pursue your career goal through learning.\n\n" +
      "**Key insight:** Small jobs don't make you a developer/nurse/designer. They give you the time, trust, and resources to become one.\n\n" +
      "Check your **My Growth** page for detailed progress tracking!";
  }

  // Skills questions
  if (lower.includes("skill") || lower.includes("learn") || lower.includes("improve")) {
    return "Building skills is one of the best investments you can make!\n\n" +
      "**Key skills employers value:**\n" +
      "• **Communication** - Being clear and professional in messages\n" +
      "• **Reliability** - Showing up on time and following through\n" +
      "• **Problem-solving** - Figuring things out when challenges arise\n" +
      "• **Digital literacy** - Basic computer and smartphone skills\n\n" +
      "**How to build skills:**\n" +
      "• Take on diverse jobs to gain experience\n" +
      "• Ask for feedback after completing work\n" +
      "• Watch tutorials online for specific skills\n\n" +
      "Your completed jobs here automatically build your skill profile!";
  }

  // Tech/developer questions - check what type of question
  if (lower.includes("developer") || lower.includes("programmer") || lower.includes("coding") || lower.includes("tech") || lower.includes("software") || lower.includes("it ")) {
    // Check if asking about "day in the life" or typical day
    if (lower.includes("day") || lower.includes("typical") || lower.includes("look like") || lower.includes("daily") || lower.includes("routine")) {
      return "**A typical day as a developer:**\n\n" +
        "**Morning (9:00-12:00)**\n" +
        "• Check emails and Slack messages\n" +
        "• Daily standup meeting (15 min) - share what you're working on\n" +
        "• Focus time: writing code, fixing bugs, or reviewing others' code\n\n" +
        "**Afternoon (12:00-17:00)**\n" +
        "• Lunch break (often with colleagues)\n" +
        "• Meetings: planning features, discussing solutions with the team\n" +
        "• More coding and problem-solving\n" +
        "• Code reviews and helping teammates\n\n" +
        "**What developers actually do:**\n" +
        "• ~50% writing and reviewing code\n" +
        "• ~30% meetings and collaboration\n" +
        "• ~20% debugging and research\n\n" +
        "Most developers work normal office hours (flexible start times are common) and can often work remotely!";
    }
    // Default to getting started advice
    return "Tech careers are exciting and in high demand!\n\n" +
      "**Getting started in tech:**\n" +
      "• **Free resources** - Start with free coding courses on Codecademy, freeCodeCamp, or Khan Academy\n" +
      "• **Pick a language** - Python is great for beginners, JavaScript for web development\n" +
      "• **Build projects** - Create simple websites or apps to practice\n" +
      "• **Join communities** - Discord servers and local meetups can help you learn\n\n" +
      "In Norway, tech apprenticeships (lærling) are also a great path - no university required!";
  }

  // Healthcare careers
  if (lower.includes("health") || lower.includes("nurse") || lower.includes("doctor") || lower.includes("medical") || lower.includes("hospital") || lower.includes("sykepleier") || lower.includes("lege")) {
    // Check if asking about "day in the life" or typical day
    if (lower.includes("day") || lower.includes("typical") || lower.includes("look like") || lower.includes("daily") || lower.includes("routine") || lower.includes("workday")) {
      // Nurse-specific day
      if (lower.includes("nurse") || lower.includes("sykepleier")) {
        return "**A typical day as a Nurse (Sykepleier) in Norway:**\n\n" +
          "**Early shift example (07:00-15:00):**\n\n" +
          "**07:00** - Arrive and get report from night shift about patients\n" +
          "**07:30** - Morning rounds: check vitals, give medications, help with breakfast\n" +
          "**09:00** - Patient care: wound dressing, assisting doctors, blood tests\n" +
          "**11:00** - Documentation in patient records\n" +
          "**12:00** - Lunch break (30 min)\n" +
          "**12:30** - Afternoon medications, patient consultations, family meetings\n" +
          "**14:30** - Handover preparation and documentation\n" +
          "**15:00** - Report to evening shift and end of day\n\n" +
          "**What nurses actually do:**\n" +
          "• ~40% direct patient care (medications, treatments, comfort)\n" +
          "• ~25% documentation and charting\n" +
          "• ~20% coordination with doctors, families, other staff\n" +
          "• ~15% patient education and emotional support\n\n" +
          "**Reality check:** Nursing is physically demanding (lots of standing/walking) and emotionally challenging. But nurses say the reward of helping people through difficult times makes it worthwhile.";
      }
      // Doctor-specific day
      if (lower.includes("doctor") || lower.includes("lege")) {
        return "**A typical day as a Doctor (Lege) in Norway:**\n\n" +
          "**Hospital doctor example (08:00-16:00):**\n\n" +
          "**08:00** - Morning meeting: discuss overnight admissions, complex cases\n" +
          "**08:30** - Ward rounds: visit patients, review test results, adjust treatments\n" +
          "**10:30** - Outpatient clinic or procedures\n" +
          "**12:00** - Lunch and brief documentation catch-up\n" +
          "**12:30** - More patient consultations, referrals, discharge planning\n" +
          "**14:00** - Teaching medical students or meetings with team\n" +
          "**15:00** - Documentation, test result reviews, planning\n" +
          "**16:00** - Handover to on-call doctor\n\n" +
          "**What doctors actually do:**\n" +
          "• ~40% patient consultations and examinations\n" +
          "• ~25% documentation and administrative work\n" +
          "• ~20% procedures and treatments\n" +
          "• ~15% meetings, teaching, research\n\n" +
          "**Reality check:** The path is long (6 years + specialization) and on-call shifts can be tough. But doctors have high job security and make a real difference in people's lives.";
      }
      // General healthcare day
      return "**A typical day in healthcare depends on the role:**\n\n" +
        "**Healthcare Worker (Helsefagarbeider):**\n" +
        "• Help patients with daily activities (eating, dressing, mobility)\n" +
        "• Take vital signs and report changes to nurses\n" +
        "• Lots of direct patient contact and relationship building\n\n" +
        "**Paramedic (Ambulansearbeider):**\n" +
        "• 12-hour shifts, respond to emergency calls\n" +
        "• Assess patients, provide first aid, transport to hospital\n" +
        "• Adrenaline-filled moments mixed with quieter standby periods\n\n" +
        "**Common across healthcare:**\n" +
        "• Shift work (early, late, nights, weekends)\n" +
        "• Physically active - lots of standing and walking\n" +
        "• Emotionally rewarding but can be draining\n" +
        "• Strong teamwork with colleagues\n\n" +
        "Which healthcare career are you interested in? I can tell you more specifics!";
    }
    // Default to career path overview
    return "Healthcare is a meaningful and stable career path!\n\n" +
      "**Healthcare careers in Norway:**\n" +
      "• **Nurse (Sykepleier)** - 3-year bachelor's degree, great job security\n" +
      "• **Healthcare worker (Helsefagarbeider)** - 2-year vocational training (fagbrev)\n" +
      "• **Doctor (Lege)** - 6-year medical degree + specialization\n" +
      "• **Paramedic (Ambulansearbeider)** - Vocational training available\n\n" +
      "**Get started:** Volunteer at local healthcare facilities or apply for summer jobs at nursing homes to see if it's right for you!\n\n" +
      "Would you like to know what a typical day looks like in any of these roles?";
  }

  // Creative careers
  if (lower.includes("design") || lower.includes("creative") || lower.includes("art") || lower.includes("music") || lower.includes("film") || lower.includes("content") || lower.includes("ux") || lower.includes("ui")) {
    // Check if asking about "day in the life" or typical day
    if (lower.includes("day") || lower.includes("typical") || lower.includes("look like") || lower.includes("daily") || lower.includes("routine") || lower.includes("workday")) {
      // Designer-specific
      if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) {
        return "**A typical day as a Designer:**\n\n" +
          "**Morning (09:00-12:00)**\n" +
          "• Check emails, Slack, project updates\n" +
          "• Morning standup or team sync (15 min)\n" +
          "• Deep work: designing screens, creating mockups, iterating on feedback\n\n" +
          "**Afternoon (12:00-17:00)**\n" +
          "• Lunch (often with team or at desk)\n" +
          "• User research meetings or design critiques\n" +
          "• More design work: prototyping, refining details\n" +
          "• Collaborate with developers on implementation\n" +
          "• End of day: organize files, update project boards\n\n" +
          "**What designers actually do:**\n" +
          "• ~50% actual design work (in Figma, Sketch, Adobe)\n" +
          "• ~25% meetings and collaboration\n" +
          "• ~15% research and testing\n" +
          "• ~10% documentation and handoffs\n\n" +
          "**Reality check:** Design involves lots of iteration and feedback. You need thick skin for critiques, but seeing your work used by real people is incredibly satisfying!";
      }
      // Content creator
      if (lower.includes("content") || lower.includes("creator") || lower.includes("influencer")) {
        return "**A typical day as a Content Creator:**\n\n" +
          "**Morning**\n" +
          "• Check analytics from previous posts\n" +
          "• Plan content: brainstorm ideas, script writing\n" +
          "• Respond to comments and messages\n\n" +
          "**Afternoon**\n" +
          "• Film or create content (photos, videos, graphics)\n" +
          "• Editing and post-production\n" +
          "• Schedule posts, write captions\n\n" +
          "**Evening/Flexible**\n" +
          "• Engage with community\n" +
          "• Brand collaboration calls\n" +
          "• Stay updated on trends\n\n" +
          "**Reality check:** It looks glamorous, but it's a lot of work. Success requires consistency, creativity, and patience. Most creators don't earn a full living until they have large followings. Consider it a side project first!";
      }
      // General creative
      return "**A typical day in creative careers varies a lot!**\n\n" +
        "**Common patterns:**\n" +
        "• Flexible hours in many roles (especially freelance)\n" +
        "• Mix of solo creative work and collaboration\n" +
        "• Deadline-driven with busy periods\n" +
        "• Continuous learning (new tools, trends)\n\n" +
        "Which creative career interests you? I can give more specific details about a designer, content creator, artist, or other creative role!";
    }
    // Default creative overview
    return "Creative careers let you express yourself while earning a living!\n\n" +
      "**Popular creative paths:**\n" +
      "• **Graphic Design** - Logos, websites, marketing materials\n" +
      "• **UX/UI Design** - App and website user experience\n" +
      "• **Content Creation** - Social media, video, photography\n" +
      "• **Game Design** - Growing industry in Norway!\n\n" +
      "**Tips:**\n" +
      "• Build a portfolio with personal projects\n" +
      "• Learn industry tools (Figma, Adobe Creative Suite)\n" +
      "• Share your work online to get noticed\n\n" +
      "Would you like to know what a typical day looks like in any of these roles?";
  }

  // Interview questions
  if (lower.includes("interview") || lower.includes("meeting") || lower.includes("nervous") || lower.includes("scared") || lower.includes("anxious about job")) {
    return "Feeling nervous about interviews is totally normal!\n\n" +
      "**Interview tips:**\n" +
      "• **Prepare** - Know what job you applied for and why you want it\n" +
      "• **Be yourself** - Employers want to see the real you\n" +
      "• **Ask questions** - Shows you're interested (e.g., \"What does a typical day look like?\")\n" +
      "• **Arrive early** - 5-10 minutes is perfect\n\n" +
      "**Common questions to prepare for:**\n" +
      "• \"Tell me about yourself\"\n" +
      "• \"Why are you interested in this job?\"\n" +
      "• \"What are your strengths?\"\n\n" +
      "Remember: The employer already liked your application enough to meet you - that's a great sign!";
  }

  // CV/Resume questions
  if (lower.includes("cv") || lower.includes("resume") || lower.includes("curriculum")) {
    return "A good CV helps you stand out!\n\n" +
      "**For first-time job seekers, include:**\n" +
      "• **Contact info** - Name, phone, email\n" +
      "• **About you** - 2-3 sentences about who you are\n" +
      "• **Education** - Your school and grade level\n" +
      "• **Skills** - Languages, computer skills, soft skills\n" +
      "• **Experience** - Any jobs, volunteering, or school projects\n" +
      "• **References** - A teacher or adult who can vouch for you\n\n" +
      "**Tips:**\n" +
      "• Keep it to 1 page\n" +
      "• Use a clean, simple format\n" +
      "• No spelling mistakes!";
  }

  // School/education questions
  if (lower.includes("school") || lower.includes("university") || lower.includes("study") || lower.includes("degree") || lower.includes("education")) {
    return "Choosing your educational path is a big decision!\n\n" +
      "**Options in Norway:**\n" +
      "• **Vocational (Yrkesfag)** - Learn a trade, get a fagbrev, start working sooner\n" +
      "• **General Studies (Studiespesialisering)** - Prepares for university\n" +
      "• **Apprenticeship (Lærling)** - Learn while earning\n" +
      "• **Higher Education** - Universities and høgskoler\n\n" +
      "**Remember:** Many successful people change paths! It's okay not to have it all figured out.\n\n" +
      "Browse our career cards to see what education different jobs require!";
  }

  // Application/message help
  if (lower.includes("application") || lower.includes("message") || lower.includes("write") || lower.includes("apply")) {
    return "Writing a good application message is simpler than you think!\n\n" +
      "**Template for job applications:**\n\n" +
      "\"Hi! I'm [Name], and I'm interested in helping with [job]. I'm [age] and available [your availability]. " +
      "I'm reliable and eager to do a great job. Looking forward to hearing from you!\"\n\n" +
      "**Tips:**\n" +
      "• Keep it short and friendly\n" +
      "• Mention your availability\n" +
      "• Show enthusiasm\n" +
      "• Be professional but not too formal";
  }

  // Salary/money questions
  if (lower.includes("salary") || lower.includes("pay") || lower.includes("earn") || lower.includes("money")) {
    return "Pay varies by job type and experience in Norway.\n\n" +
      "**Typical rates for youth jobs:**\n" +
      "• Babysitting: 100-150 NOK/hour\n" +
      "• Dog walking: 80-120 NOK/hour\n" +
      "• Snow clearing: 100-150 NOK/hour\n" +
      "• Errands/helping: 80-120 NOK/hour\n\n" +
      "As you build experience and skills, you can charge more. Browse jobs on this platform to see current rates!";
  }

  // Platform navigation
  if (lower.includes("how do i") || lower.includes("where") || lower.includes("find")) {
    return "I can help you navigate the platform!\n\n" +
      "**Key areas:**\n" +
      "• **Small Jobs** - Browse available small jobs and apply\n" +
      "• **My Profile** - Update your info and track your skills\n" +
      "• **Messages** - Chat with employers about jobs\n" +
      "• **Explore Careers** - Discover different career paths\n\n" +
      "Use the menu or quick actions on your dashboard to navigate. What specific feature are you looking for?";
  }

  // Check for generic "day in the life" questions that didn't match specific careers
  if (lower.includes("day") && (lower.includes("life") || lower.includes("typical") || lower.includes("look like"))) {
    return "I'd be happy to tell you about a day in the life of different careers!\n\n" +
      "**Popular careers I can describe:**\n" +
      "• **Developer/Programmer** - Code, meetings, problem-solving\n" +
      "• **Nurse** - Patient care, teamwork, shift work\n" +
      "• **Doctor** - Rounds, consultations, treatments\n" +
      "• **Designer** - Creative work, collaboration, iteration\n" +
      "• **Content Creator** - Filming, editing, community building\n\n" +
      "Which career would you like to know more about? Just ask \"What does a typical day as a [career] look like?\"";
  }

  // Default response based on intent
  switch (intent) {
    case "career_explain":
      // Check if asking about a day or typical workday
      if (lower.includes("day") || lower.includes("typical") || lower.includes("routine")) {
        return "I can describe what a typical workday looks like for different careers!\n\n" +
          "Just tell me which career you're curious about. For example:\n" +
          "• \"What does a day in the life of a nurse look like?\"\n" +
          "• \"What's a typical day for a developer?\"\n" +
          "• \"What do designers do all day?\"\n\n" +
          "I have detailed info on tech, healthcare, creative, and many other careers!";
      }
      return "I'd love to tell you more about careers!\n\n" +
        "Check out our **Explore Careers** section to browse detailed career cards with info about different roles, " +
        "including what they involve, required skills, and typical salaries.\n\n" +
        "Is there a specific career area you're curious about?";

    case "next_steps":
      return "Here's a good path forward:\n\n" +
        "1. **Complete your profile** - This helps employers learn about you\n" +
        "2. **Browse jobs** - Find opportunities that match your interests\n" +
        "3. **Apply to a few** - Start with jobs that seem manageable\n" +
        "4. **Build experience** - Each completed job adds to your skills\n\n" +
        "Would you like to start by browsing available jobs?";

    case "message_draft":
      return "I can help with message writing!\n\n" +
        "**For job applications:**\n" +
        "Keep it short, friendly, and mention your availability.\n\n" +
        "**Example:**\n" +
        "\"Hi! I'm interested in this job and available [your times]. I'm reliable and would love to help. Let me know if you have any questions!\"\n\n" +
        "What kind of message do you need help with?";

    default:
      return "I'm here to help with careers and jobs!\n\n" +
        "**I can help you with:**\n" +
        "• Exploring different career paths\n" +
        "• Tips for finding your first job\n" +
        "• Building skills employers value\n" +
        "• Writing application messages\n" +
        "• Navigating this platform\n\n" +
        "What would you like to know more about?";
  }
}

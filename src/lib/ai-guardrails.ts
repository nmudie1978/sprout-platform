/**
 * AI Assistant Guardrails
 * Ensures the assistant stays within safe, helpful boundaries
 */

import { getCondensedNorwegianContext } from "./norwegian-context";

// Intent types for logging
export type IntentType =
  | "concierge" // Platform navigation help
  | "career_explain" // Career information
  | "next_steps" // Actionable advice
  | "message_draft" // Help writing applications
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

CRITICAL RULES:
1. NEVER provide therapy, mental health counseling, or crisis support
2. If someone mentions self-harm, suicide, or mental health crisis, respond: "I'm sorry you're going through this. Please reach out to a trusted adult, school counselor, or call 116 111 (Mental Helse helpline in Norway). I'm here for career questions when you're ready."
3. Stay focused on careers, jobs, and platform features
4. Keep responses concise (2-3 short paragraphs max)
5. Use a friendly, encouraging tone suitable for teens
6. Mention specific platform features when relevant (e.g., "You can browse careers in the Explore section")
7. Always give Norwegian-specific advice (salaries in NOK, Norwegian companies, local education paths)
8. Be honest about age restrictions - don't recommend jobs that require 18+ to under-18 users

NORWEGIAN EMPLOYMENT KNOWLEDGE:
${norwegianContext}

LANGUAGE:
- Respond in English (platform default)
- Use simple, clear language (avoid jargon)
- Include Norwegian terms when helpful (e.g., "fagbrev", "lærling", "sommerjobb")
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
  if (lower.includes("health") || lower.includes("nurse") || lower.includes("doctor") || lower.includes("medical") || lower.includes("hospital")) {
    return "Healthcare is a meaningful and stable career path!\n\n" +
      "**Healthcare careers in Norway:**\n" +
      "• **Nurse (Sykepleier)** - 3-year bachelor's degree, great job security\n" +
      "• **Healthcare worker (Helsefagarbeider)** - 2-year vocational training (fagbrev)\n" +
      "• **Doctor (Lege)** - 6-year medical degree + specialization\n" +
      "• **Paramedic (Ambulansearbeider)** - Vocational training available\n\n" +
      "**Get started:** Volunteer at local healthcare facilities or apply for summer jobs at nursing homes to see if it's right for you!";
  }

  // Creative careers
  if (lower.includes("design") || lower.includes("creative") || lower.includes("art") || lower.includes("music") || lower.includes("film") || lower.includes("content")) {
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
      "Check out our career cards for more creative roles!";
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
      "• **Find Jobs** - Browse available jobs and apply\n" +
      "• **My Profile** - Update your info and track your skills\n" +
      "• **Messages** - Chat with employers about jobs\n" +
      "• **Explore Careers** - Discover different career paths\n\n" +
      "Use the menu or quick actions on your dashboard to navigate. What specific feature are you looking for?";
  }

  // Default response based on intent
  switch (intent) {
    case "career_explain":
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

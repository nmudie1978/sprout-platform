/**
 * AI Assistant Guardrails
 * Ensures the assistant stays within safe, helpful boundaries
 */

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
 * Get system prompt based on intent
 */
export function getSystemPrompt(intent: IntentType): string {
  const basePrompt = `You are a helpful career guidance assistant for a Norwegian youth platform (ages 16-20). You help with:
- Platform navigation (how to find jobs, create profiles, explore careers)
- Career information (what careers involve, required skills)
- Next steps advice (how to get started in a career)
- Application message drafting (professional but friendly tone)

CRITICAL RULES:
1. NEVER provide therapy, mental health counseling, or crisis support
2. If someone mentions self-harm, suicide, or mental health crisis, respond: "I'm sorry you're going through this. Please reach out to a trusted adult, school counselor, or call 116 111 (Mental Helse helpline in Norway). I'm here for career questions when you're ready."
3. Stay focused on careers, jobs, and platform features
4. Keep responses concise (2-3 short paragraphs max)
5. Use a friendly, encouraging tone suitable for teens
6. Mention specific platform features when relevant (e.g., "You can browse careers in the Explore section")

LANGUAGE:
- Respond in English (platform default)
- Use simple, clear language (avoid jargon)
- Be encouraging but realistic`;

  switch (intent) {
    case "unsafe":
      return `${basePrompt}\n\nUSER IS IN DISTRESS. Immediately direct them to professional help resources. Do not attempt to provide counseling.`;

    case "concierge":
      return `${basePrompt}\n\nFocus on explaining platform features and navigation. Guide the user to the right page or feature.`;

    case "career_explain":
      return `${basePrompt}\n\nUse the provided career card information to explain the role. Highlight key traits, salary, and day-to-day activities.`;

    case "next_steps":
      return `${basePrompt}\n\nProvide actionable, realistic steps. Reference platform features like micro-jobs for skill building.`;

    case "message_draft":
      return `${basePrompt}\n\nHelp draft a professional but friendly message. Keep it brief (2-3 sentences). Show enthusiasm and relevant skills.`;

    case "off_topic":
      return `${basePrompt}\n\nPolitely redirect to career-related topics. Suggest exploring careers or asking about jobs.`;

    default:
      return basePrompt;
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

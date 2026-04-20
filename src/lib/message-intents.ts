/**
 * MESSAGE INTENTS - CORE SAFETY FEATURE
 *
 * This module defines the LOCKED message intents and their exact templates.
 * Users do NOT send arbitrary free-text messages.
 *
 * RULES:
 * - Each message consists of: intent, renderedMessage, optionalVariables, createdAt, senderId, jobId
 * - Free text input is ONLY allowed inside placeholder fields
 * - Entirely free-form messages are NOT allowed
 *
 * DO NOT modify the template text without safety review.
 */

import { MessageIntent, AgeBracket } from "@prisma/client";

// ============================================
// INTENT TEMPLATE DEFINITIONS
// ============================================

export interface IntentVariable {
  name: string;
  label: string;
  type: "text" | "date" | "time";
  required: boolean;
  maxLength?: number;
  placeholder?: string;
}

export interface IntentTemplate {
  intent: MessageIntent;
  label: string;
  description: string;
  template: string; // Exact template text with [placeholders]
  variables: IntentVariable[];
}

/**
 * User-selectable intents — everything except FREE_TEXT_LEGACY,
 * which exists only for back-compat rendering of pre-migration rows.
 */
export type SelectableMessageIntent = Exclude<MessageIntent, "FREE_TEXT_LEGACY">;

/**
 * LOCKED MESSAGE TEMPLATES
 * DO NOT modify without safety review.
 *
 * FREE_TEXT_LEGACY is deliberately absent — any attempt to call
 * getIntentTemplate("FREE_TEXT_LEGACY") is a bug: that intent has
 * no template (the raw `message` column holds the string).
 */
export const MESSAGE_INTENT_TEMPLATES: Record<SelectableMessageIntent, IntentTemplate> = {
  [MessageIntent.ASK_ABOUT_JOB]: {
    intent: MessageIntent.ASK_ABOUT_JOB,
    label: "Ask About Job",
    description: "Express interest and request more details about the job",
    template: "Hi, I'm interested in this job. Could you share a bit more detail about what's needed?",
    variables: [], // No variables - fixed text
  },

  [MessageIntent.CONFIRM_AVAILABILITY]: {
    intent: MessageIntent.CONFIRM_AVAILABILITY,
    label: "Confirm Availability",
    description: "Let them know when you're available",
    template: "I'm available on [days] at [time]. Does that work for you?",
    variables: [
      {
        name: "days",
        label: "Day(s)",
        type: "text",
        required: true,
        maxLength: 50,
        placeholder: "e.g., Monday, Tuesday and Wednesday",
      },
      {
        name: "time",
        label: "Time",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "e.g., 3pm or morning",
      },
    ],
  },

  [MessageIntent.CONFIRM_TIME_DATE]: {
    intent: MessageIntent.CONFIRM_TIME_DATE,
    label: "Confirm Time & Date",
    description: "Confirm the scheduled time and date",
    template: "Just to confirm, the job is scheduled for [date] at [time].",
    variables: [
      {
        name: "date",
        label: "Date",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "e.g., Monday 15th January",
      },
      {
        name: "time",
        label: "Time",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "e.g., 2pm",
      },
    ],
  },

  [MessageIntent.CONFIRM_LOCATION]: {
    intent: MessageIntent.CONFIRM_LOCATION,
    label: "Confirm Location",
    description: "Ask for location confirmation",
    template: "Could you confirm the location for this job?",
    variables: [], // No variables - fixed text
  },

  [MessageIntent.ASK_CLARIFICATION]: {
    intent: MessageIntent.ASK_CLARIFICATION,
    label: "Ask a Question",
    description: "Ask a quick question about the job",
    template: "I have a quick question about the job: [question].",
    variables: [
      {
        name: "question",
        label: "Your Question",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "What do I need to bring?",
      },
    ],
  },

  [MessageIntent.CONFIRM_COMPLETION]: {
    intent: MessageIntent.CONFIRM_COMPLETION,
    label: "Confirm Completion",
    description: "Let them know you've finished the job",
    template: "I've completed the job as agreed. Please let me know if anything else is needed.",
    variables: [], // No variables - fixed text
  },

  [MessageIntent.UNABLE_TO_PROCEED]: {
    intent: MessageIntent.UNABLE_TO_PROCEED,
    label: "Unable to Proceed",
    description: "Politely decline or withdraw from the job",
    template: "I'm no longer able to take this job. Thank you for understanding.",
    variables: [], // No variables - fixed text
  },
};

// ============================================
// VALIDATION
// ============================================

export interface MessageValidationResult {
  valid: boolean;
  errors: string[];
  renderedMessage?: string;
}

/**
 * Dangerous content patterns - reject any attempt to share contact info
 */
const DANGEROUS_PATTERNS = {
  url: /(?:https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|no|io|co|uk|de|fr|es|it))/gi,
  phone: /(?:\+?[0-9]{1,4}[-.\s]?)?(?:\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  social: /@[\w.-]+|(?:snapchat|instagram|tiktok|facebook|whatsapp|telegram|discord|signal)/gi,
  offPlatform: /(?:my|mine)\s+(?:number|phone|cell|mobile|email|snap|insta|ig)/gi,
  contactRequest: /(?:text|call|email|message|dm|reach|contact)\s+(?:me|us)/gi,
};

/**
 * Check if text contains dangerous content
 */
export function containsDangerousContent(text: string): { dangerous: boolean; type?: string } {
  if (!text || typeof text !== "string") {
    return { dangerous: false };
  }

  const normalizedText = text.toLowerCase().trim();

  for (const [type, pattern] of Object.entries(DANGEROUS_PATTERNS)) {
    pattern.lastIndex = 0;
    if (pattern.test(normalizedText)) {
      return { dangerous: true, type };
    }
  }

  return { dangerous: false };
}

/**
 * Validate variables for an intent
 */
export function validateIntentVariables(
  intent: MessageIntent,
  variables: Record<string, string>,
  userAgeBracket?: AgeBracket | null
): MessageValidationResult {
  // FREE_TEXT_LEGACY has no template and is never user-selectable;
  // reject early if a caller passes it (defensive — the frontend
  // type system already excludes it).
  if (intent === "FREE_TEXT_LEGACY") {
    return { valid: false, errors: ["FREE_TEXT_LEGACY is not a submittable intent"] };
  }
  const template = MESSAGE_INTENT_TEMPLATES[intent as SelectableMessageIntent];
  if (!template) {
    return { valid: false, errors: ["Invalid message intent"] };
  }

  const errors: string[] = [];

  // Check required variables
  for (const varDef of template.variables) {
    const value = variables[varDef.name];

    // Check required
    if (varDef.required && (!value || value.trim() === "")) {
      errors.push(`${varDef.label} is required`);
      continue;
    }

    // Skip validation if not provided and not required
    if (!value || value.trim() === "") {
      continue;
    }

    // Check max length
    if (varDef.maxLength && value.length > varDef.maxLength) {
      errors.push(`${varDef.label} must be ${varDef.maxLength} characters or less`);
    }

    // Check for dangerous content
    const dangerCheck = containsDangerousContent(value);
    if (dangerCheck.dangerous) {
      // Age-based handling
      if (userAgeBracket === "SIXTEEN_SEVENTEEN") {
        // BLOCK for 16-17 year olds
        errors.push(
          `For your safety, sharing contact information is not allowed. Please keep all communication on Endeavrly.`
        );
      } else if (userAgeBracket === "EIGHTEEN_TWENTY") {
        // WARN for 18-20 year olds (but still block)
        errors.push(
          `Please keep all communication on Endeavrly for your safety. Contact sharing detected.`
        );
      } else {
        // Block for all others too
        errors.push(`Sharing contact information is not allowed for safety reasons.`);
      }
    }
  }

  // Check for unknown variables
  for (const key of Object.keys(variables)) {
    if (!template.variables.find((v) => v.name === key)) {
      errors.push(`Unknown field: ${key}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Render the message
  const renderedMessage = renderIntentMessage(intent, variables);
  return { valid: true, errors: [], renderedMessage };
}

/**
 * Render the final message text from intent and variables
 */
export function renderIntentMessage(
  intent: MessageIntent,
  variables: Record<string, string>
): string {
  if (intent === "FREE_TEXT_LEGACY") {
    throw new Error("FREE_TEXT_LEGACY has no template — display the raw `message` column instead");
  }
  const template = MESSAGE_INTENT_TEMPLATES[intent as SelectableMessageIntent];
  if (!template) {
    throw new Error(`Unknown intent: ${intent}`);
  }

  let message = template.template;

  // Replace [placeholder] with actual values
  for (const varDef of template.variables) {
    const value = variables[varDef.name] || "";
    const placeholder = `[${varDef.name}]`;
    message = message.replace(placeholder, value.trim());
  }

  return message;
}

/**
 * Get list of all intents for UI
 */
export function getAllIntents(): IntentTemplate[] {
  return Object.values(MESSAGE_INTENT_TEMPLATES);
}

/**
 * Get intent template by intent enum
 */
export function getIntentTemplate(intent: MessageIntent): IntentTemplate | undefined {
  if (intent === "FREE_TEXT_LEGACY") return undefined;
  return MESSAGE_INTENT_TEMPLATES[intent as SelectableMessageIntent];
}

// ============================================
// APPLICATION MESSAGE DISPLAY (F10)
// ============================================

/**
 * Shape returned by `getApplicationMessageDisplay`. Employer views
 * that need to show an applicant's message (job-detail review,
 * employer dashboard, hire-confirmation screens) should consume
 * this shape rather than the raw columns — it handles legacy rows,
 * empty applications, and the structured case uniformly.
 */
export interface ApplicationMessageDisplay {
  /** Which row-variant this is. */
  kind: "none" | "structured" | "legacy";
  /** Human label to render above the text (e.g. "Confirm Availability"). Null for legacy + none. */
  label: string | null;
  /** The text to show to the employer. Null for `none`. */
  text: string | null;
  /** True when the application predates the intent system — render with a subtle "Legacy message" badge. */
  isLegacy: boolean;
}

/**
 * Build the display shape for an Application row. Accepts just the
 * three columns we touch (messageIntent, messageVariables, message)
 * so callers don't need to pass the whole row and can pluck from
 * partial selects. Pure function — safe in server and client.
 */
export function getApplicationMessageDisplay(input: {
  messageIntent: MessageIntent | null;
  messageVariables: unknown;
  message: string | null;
}): ApplicationMessageDisplay {
  // No message at all — youth skipped the intent picker.
  if (!input.messageIntent && !input.message) {
    return { kind: "none", label: null, text: null, isLegacy: false };
  }

  // Legacy free-text — render the raw string with a badge.
  if (input.messageIntent === "FREE_TEXT_LEGACY") {
    return {
      kind: "legacy",
      label: null,
      text: input.message ?? "",
      isLegacy: true,
    };
  }

  // Structured — render the intent label + re-render from variables.
  // We trust the pre-rendered `message` column as a fallback so
  // display still works if the template text later changes behind
  // us (the receiver always saw the original).
  if (input.messageIntent) {
    const template = getIntentTemplate(input.messageIntent);
    const vars =
      input.messageVariables && typeof input.messageVariables === "object"
        ? (input.messageVariables as Record<string, string>)
        : {};
    const rendered =
      template != null
        ? renderIntentMessage(input.messageIntent, vars)
        : input.message ?? "";
    return {
      kind: "structured",
      label: template?.label ?? null,
      text: rendered,
      isLegacy: false,
    };
  }

  // Fallback — message exists but intent is null (shouldn't happen
  // post-migration but tolerate it).
  return {
    kind: "legacy",
    label: null,
    text: input.message ?? "",
    isLegacy: true,
  };
}

// ============================================
// HARD BLOCKS
// ============================================

export interface HardBlockResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Check hard block conditions
 */
export function checkHardBlocks(
  intent: MessageIntent | null | undefined,
  variables: Record<string, string>,
  conversationId: string | null | undefined
): HardBlockResult {
  // Block empty intent
  if (!intent) {
    return { blocked: true, reason: "Please select a message type" };
  }

  // Block messages without conversation context
  if (!conversationId) {
    return { blocked: true, reason: "Messages must be sent within a conversation" };
  }

  // Check for emoji-only in any variable
  for (const [key, value] of Object.entries(variables)) {
    if (value && typeof value === "string") {
      // Remove all emojis and whitespace, check if anything remains
      const withoutEmoji = value.replace(/[\p{Emoji}\s]/gu, "").trim();
      if (value.trim() && !withoutEmoji) {
        return { blocked: true, reason: "Messages cannot contain only emojis" };
      }
    }
  }

  return { blocked: false };
}

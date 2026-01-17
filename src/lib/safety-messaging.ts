/**
 * Safety Messaging - Phase 1
 *
 * This module provides server-side validation and rendering for structured messages.
 * Key safety features:
 * - No free-text allowed
 * - Strict payload validation against templates
 * - URL/phone/email/social handle detection and rejection
 * - Server-side rendering of safe message text
 */

import { prisma } from "@/lib/prisma";
import { UserRole, AgeBracket, ConversationStatus, MessageTemplateDirection } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface TemplateField {
  name: string;
  type: "text" | "number" | "date" | "time" | "select" | "boolean";
  required?: boolean;
  maxLength?: number;
  options?: string[];
  min?: number;
  max?: number;
  label?: string;
}

export interface TemplateAllowedFields {
  fields: TemplateField[];
  renderTemplate: string; // Template string with {fieldName} placeholders
}

export interface MessagePayload {
  [key: string]: string | number | boolean | null;
}

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

// ============================================
// DANGEROUS CONTENT PATTERNS
// Phase 1 Safety: Reject any attempt to share contact info
// ============================================

const DANGEROUS_PATTERNS = {
  // URLs - any attempt to share links
  url: /(?:https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|no|io|co|uk|de|fr|es|it|ru|cn|jp|kr|au|ca|nl|se|be|ch|at|dk|fi|pl|pt|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|ie|gr|il|in|br|mx|ar|cl|za|nz|sg|my|ph|th|vn|id|tw|hk))/gi,

  // Phone numbers - various formats
  phone: /(?:\+?[0-9]{1,4}[-.\s]?)?(?:\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}(?:[-.\s]?[0-9]{1,4})?/g,

  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

  // Social media handles and platform names
  social: /@[\w.-]+|(?:snapchat|instagram|tiktok|facebook|whatsapp|telegram|discord|signal|viber|messenger|kik|skype|zoom|meet|teams|wechat|line|kakaotalk)[\s:]?[\w.-]*/gi,

  // Attempts to move off-platform
  offPlatform: /(?:(?:my|mine|our|the)\s+)?(?:number|phone|cell|mobile|email|snap|insta|ig|tt|fb|wa|whatsapp|tele|disc|signal)\s*(?:is|:|\-|=)?\s*[\w@.-]+/gi,

  // Direct requests for contact
  contactRequest: /(?:text|call|email|message|dm|reach|contact|hit)\s+(?:me|us)\s+(?:at|on|via|through|@)/gi,
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
    // Reset regex state
    pattern.lastIndex = 0;
    if (pattern.test(normalizedText)) {
      return { dangerous: true, type };
    }
  }

  return { dangerous: false };
}

// ============================================
// PAYLOAD VALIDATION
// ============================================

/**
 * Validate message payload against template allowed fields
 */
export function validatePayload(
  payload: MessagePayload,
  allowedFields: TemplateAllowedFields
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fieldMap = new Map(allowedFields.fields.map((f) => [f.name, f]));
  const providedFields = new Set(Object.keys(payload));

  // Check for unknown fields
  for (const fieldName of providedFields) {
    if (!fieldMap.has(fieldName)) {
      errors.push(`Unknown field: ${fieldName}`);
    }
  }

  // Validate each allowed field
  for (const field of allowedFields.fields) {
    const value = payload[field.name];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`Required field missing: ${field.name}`);
      continue;
    }

    // Skip validation if field not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    switch (field.type) {
      case "text":
        if (typeof value !== "string") {
          errors.push(`Field ${field.name} must be text`);
        } else {
          // Max length check (default 120 for safety)
          const maxLen = field.maxLength || 120;
          if (value.length > maxLen) {
            errors.push(`Field ${field.name} exceeds max length of ${maxLen}`);
          }
          // Check for dangerous content
          const dangerCheck = containsDangerousContent(value);
          if (dangerCheck.dangerous) {
            errors.push(
              `Field ${field.name} contains prohibited content (${dangerCheck.type})`
            );
          }
        }
        break;

      case "number":
        if (typeof value !== "number" && isNaN(Number(value))) {
          errors.push(`Field ${field.name} must be a number`);
        } else {
          const numValue = Number(value);
          if (field.min !== undefined && numValue < field.min) {
            errors.push(`Field ${field.name} must be at least ${field.min}`);
          }
          if (field.max !== undefined && numValue > field.max) {
            errors.push(`Field ${field.name} must be at most ${field.max}`);
          }
        }
        break;

      case "date":
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          errors.push(`Field ${field.name} must be a valid date (YYYY-MM-DD)`);
        }
        break;

      case "time":
        if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
          errors.push(`Field ${field.name} must be a valid time (HH:MM)`);
        }
        break;

      case "select":
        if (!field.options || !field.options.includes(String(value))) {
          errors.push(
            `Field ${field.name} must be one of: ${field.options?.join(", ")}`
          );
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Field ${field.name} must be true or false`);
        }
        break;

      default:
        errors.push(`Unknown field type: ${field.type}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// MESSAGE RENDERING
// Server-side safe text generation
// ============================================

/**
 * Render message text from template and payload
 * Always done server-side - never trust client rendering
 */
export function renderMessageText(
  templateLabel: string,
  renderTemplate: string,
  payload: MessagePayload
): string {
  let rendered = renderTemplate;

  // Replace all {fieldName} placeholders with values
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== "") {
      rendered = rendered.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
  }

  // Remove any unfilled placeholders
  rendered = rendered.replace(/\{[^}]+\}/g, "");

  // Clean up extra spaces
  rendered = rendered.replace(/\s+/g, " ").trim();

  // Add template label as prefix if not already in template
  if (!renderTemplate.startsWith("[")) {
    rendered = `[${templateLabel}] ${rendered}`;
  }

  return rendered;
}

// ============================================
// SAFETY GATES
// ============================================

/**
 * Check if a user can initiate a conversation with another user
 */
export async function canInitiateConversation(
  initiatorId: string,
  recipientId: string,
  jobId: string
): Promise<SafetyCheckResult> {
  // Get both users with their profiles
  const [initiator, recipient, job] = await Promise.all([
    prisma.user.findUnique({
      where: { id: initiatorId },
      select: {
        id: true,
        role: true,
        isVerifiedAdult: true,
        employerProfile: {
          select: {
            eidVerified: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        role: true,
        ageBracket: true,
        doNotDisturb: true,
      },
    }),
    prisma.microJob.findUnique({
      where: { id: jobId },
    }),
  ]);

  if (!initiator || !recipient) {
    return { allowed: false, reason: "User not found", code: "USER_NOT_FOUND" };
  }

  if (!job) {
    return { allowed: false, reason: "Job not found", code: "JOB_NOT_FOUND" };
  }

  // Check if job is paused or cancelled
  if (job.isPaused || job.status === "CANCELLED") {
    return { allowed: false, reason: "This job is not available", code: "JOB_UNAVAILABLE" };
  }

  // Check for blocks (either direction)
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: initiatorId, blockedId: recipientId },
        { blockerId: recipientId, blockedId: initiatorId },
      ],
    },
  });

  if (block) {
    return {
      allowed: false,
      reason: "Cannot message this user",
      code: "USER_BLOCKED",
    };
  }

  // Check if recipient has doNotDisturb enabled
  if (recipient.doNotDisturb) {
    return {
      allowed: false,
      reason: "This user is not accepting messages at this time",
      code: "DO_NOT_DISTURB",
    };
  }

  // Check adult-to-minor verification requirement
  // CRITICAL: Adults must be BankID verified to message youth under 18
  // Note: AgeBracket.SIXTEEN_SEVENTEEN means 16-17 year olds (minors)
  // AgeBracket.EIGHTEEN_TWENTY means 18-20 year olds (adults)
  const isInitiatorAdult = initiator.role === "EMPLOYER" || initiator.role === "ADMIN";
  const isRecipientMinor =
    recipient.role === "YOUTH" && recipient.ageBracket === "SIXTEEN_SEVENTEEN";

  if (isInitiatorAdult && isRecipientMinor) {
    // CRITICAL SAFETY: Adults MUST be verified via BankID to contact minors
    // Check both isVerifiedAdult (new field) and eidVerified (legacy field)
    const isVerified = initiator.isVerifiedAdult || initiator.employerProfile?.eidVerified || false;
    if (!isVerified) {
      return {
        allowed: false,
        reason: "BankID verification is required to contact youth workers. This protects young people on our platform.",
        code: "BANKID_REQUIRED",
      };
    }
  }

  // Check if there's already an existing conversation for this job
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      jobId,
      OR: [
        { participant1Id: initiatorId, participant2Id: recipientId },
        { participant1Id: recipientId, participant2Id: initiatorId },
      ],
    },
  });

  if (existingConversation) {
    return {
      allowed: true,
      reason: "Existing conversation found",
      code: "CONVERSATION_EXISTS",
    };
  }

  return { allowed: true };
}

/**
 * Check if a user can send a message in a conversation
 */
export async function canSendMessage(
  senderId: string,
  conversationId: string
): Promise<SafetyCheckResult> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participant1: true,
      participant2: true,
    },
  });

  if (!conversation) {
    return { allowed: false, reason: "Conversation not found", code: "NOT_FOUND" };
  }

  // Check if sender is a participant
  const isParticipant =
    conversation.participant1Id === senderId ||
    conversation.participant2Id === senderId;

  if (!isParticipant) {
    return { allowed: false, reason: "Not a participant", code: "NOT_PARTICIPANT" };
  }

  // Check conversation status
  if (conversation.status === "FROZEN") {
    return {
      allowed: false,
      reason: "This conversation has been frozen due to a safety report",
      code: "CONVERSATION_FROZEN",
    };
  }

  if (conversation.status === "CLOSED") {
    return {
      allowed: false,
      reason: "This conversation has been closed",
      code: "CONVERSATION_CLOSED",
    };
  }

  // Check for blocks
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedId: conversation.participant1Id },
        { blockerId: senderId, blockedId: conversation.participant2Id },
        { blockerId: conversation.participant1Id, blockedId: senderId },
        { blockerId: conversation.participant2Id, blockedId: senderId },
      ],
    },
  });

  if (block) {
    return {
      allowed: false,
      reason: "Cannot send messages to this user",
      code: "USER_BLOCKED",
    };
  }

  return { allowed: true };
}

/**
 * Check if a user can use a specific message template
 */
export async function canUseTemplate(
  senderId: string,
  recipientId: string,
  templateKey: string
): Promise<SafetyCheckResult> {
  const [sender, template] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId } }),
    prisma.messageTemplate.findUnique({ where: { key: templateKey } }),
  ]);

  if (!sender) {
    return { allowed: false, reason: "Sender not found", code: "SENDER_NOT_FOUND" };
  }

  if (!template) {
    return { allowed: false, reason: "Template not found", code: "TEMPLATE_NOT_FOUND" };
  }

  if (!template.isActive) {
    return { allowed: false, reason: "Template is not active", code: "TEMPLATE_INACTIVE" };
  }

  // Check direction restrictions
  const isYouth = sender.role === "YOUTH";
  const isAdult = sender.role === "EMPLOYER" || sender.role === "ADMIN";

  if (template.direction === "ADULT_TO_YOUTH" && !isAdult) {
    return {
      allowed: false,
      reason: "This message type is for employers only",
      code: "DIRECTION_RESTRICTED",
    };
  }

  if (template.direction === "YOUTH_TO_ADULT" && !isYouth) {
    return {
      allowed: false,
      reason: "This message type is for youth workers only",
      code: "DIRECTION_RESTRICTED",
    };
  }

  return { allowed: true };
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log a safety-related action
 */
export async function logSafetyAction(
  action: string,
  userId: string,
  actorId: string | null,
  targetType: string,
  targetId: string,
  metadata: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        actorId,
        action: action as any,
        targetType,
        targetId,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log safety action:", error);
    // Don't throw - logging should not block the main operation
  }
}

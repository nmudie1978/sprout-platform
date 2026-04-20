import { z } from "zod";
import { JobCategory, PayType, MessageIntent } from "@prisma/client";

export const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  category: z.nativeEnum(JobCategory),
  description: z.string().min(20, "Description must be at least 20 characters"),
  payType: z.nativeEnum(PayType),
  payAmount: z.number().min(0, "Pay must be positive"),
  location: z.string().min(3, "Location is required"),
  startDate: z.string().min(1, "Start date is required"), // When the job starts - REQUIRED
  endDate: z.string().min(1, "End date is required"), // When the job ends - REQUIRED
  dateTime: z.string().optional().nullable(), // Legacy field - kept for backward compatibility
  duration: z.number().min(0).optional().nullable(),
  requiredTraits: z.array(z.string()).default([]),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed").default([]),
  applicationDeadline: z.string().min(1, "Application deadline is required"), // ISO date string for application deadline - REQUIRED
  // Standard job category and template (taxonomy system)
  standardCategoryId: z.string().optional().nullable(),
  standardTemplateId: z.string().optional().nullable(),
});

/**
 * Application intents valid in the apply-to-job context.
 *
 * The full MessageIntent enum covers the whole lifecycle (scheduling,
 * location confirmation, completion, withdrawal) but only three make
 * sense at the initial-apply moment. FREE_TEXT_LEGACY is deliberately
 * excluded — it exists only for back-compat rendering, never for new
 * submissions.
 */
export const APPLICATION_INTENTS = [
  MessageIntent.ASK_ABOUT_JOB,
  MessageIntent.CONFIRM_AVAILABILITY,
  MessageIntent.ASK_CLARIFICATION,
] as const;

export type ApplicationIntent = (typeof APPLICATION_INTENTS)[number];

export const applicationSchema = z.object({
  jobId: z.string(),
  // Intent is optional — youth can submit an application with no
  // message at all. When provided, it must be one of the three
  // apply-context intents (not FREE_TEXT_LEGACY and not post-hire
  // intents like CONFIRM_COMPLETION).
  messageIntent: z.enum(APPLICATION_INTENTS).optional(),
  // Variable fill — validated against the chosen intent's template
  // in the API handler (presence-of-required, max-length, and
  // dangerous-content checks via validateIntentVariables).
  messageVariables: z.record(z.string(), z.string()).optional(),
});

export const reviewSchema = z.object({
  jobId: z.string(),
  reviewedId: z.string(),
  punctuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  reliability: z.number().min(1).max(5),
  overall: z.number().min(1).max(5),
  positiveTags: z.array(z.string()).default([]),
});

export type JobFormData = z.infer<typeof jobSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;

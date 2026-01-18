import { z } from "zod";
import { JobCategory, PayType } from "@prisma/client";

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

export const applicationSchema = z.object({
  jobId: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters").max(500),
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

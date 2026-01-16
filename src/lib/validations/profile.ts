import { z } from "zod";

export const youthProfileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(50),
  avatarId: z.string().optional(),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  availability: z.string().max(200).optional(),
  interests: z.array(z.string()).default([]),
  guardianEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  guardianConsent: z.boolean().optional(),
  careerAspiration: z.string().max(200, "Career aspiration must be less than 200 characters").optional().or(z.literal("")),
});

export const careerAspirationSchema = z.object({
  careerAspiration: z.string().max(200, "Career aspiration must be less than 200 characters").optional().or(z.literal("")),
});

export const profileVisibilitySchema = z.object({
  profileVisibility: z.boolean(),
});

export const avatarUpdateSchema = z.object({
  avatarId: z.string(),
});

export type YouthProfileFormData = z.infer<typeof youthProfileSchema>;
export type ProfileVisibilityData = z.infer<typeof profileVisibilitySchema>;
export type AvatarUpdateData = z.infer<typeof avatarUpdateSchema>;
export type CareerAspirationData = z.infer<typeof careerAspirationSchema>;

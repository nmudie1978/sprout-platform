-- Add an optional 1-5 platform rating to feedback (additive, nullable).
ALTER TABLE "Feedback" ADD COLUMN "rating" INTEGER;

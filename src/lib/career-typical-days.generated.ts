/**
 * AI-generated career details overlay.
 *
 * DO NOT HAND-EDIT THIS FILE. It is rewritten by
 * `scripts/generate-career-details.ts` whenever the script is run.
 *
 * Coverage strategy: this overlay fills in the gaps left by the
 * hand-curated `careerDetailsMap` in `./career-typical-days.ts`. Any
 * career listed in `getAllCareers()` that doesn't have a curated
 * entry is given an AI-authored entry here so the Understand tab
 * never falls back to the bland generic template.
 *
 * To regenerate (or to fill new careers added since last run):
 *
 *   npx tsx scripts/generate-career-details.ts
 *
 * Requires OPENAI_API_KEY in the environment. The script will
 * skip any career already present here, so re-runs are cheap and
 * incremental.
 */

import type { CareerDetails } from './career-typical-days';

export const generatedCareerDetailsMap: Record<string, CareerDetails> = {
  // Empty until the generation script is run.
};

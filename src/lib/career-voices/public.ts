// src/lib/career-voices/public.ts
import { matchesCareer, type CareerLike } from "./match";

const MAX_PER_LIST = 6;

// ── Raw rows (the subset of the Prisma models we read) ──────────────
export interface RawStory {
  id: string; videoUrl: string; videoId: string; duration: string | null;
  name: string; jobTitle: string; company: string | null; location: string | null;
  yearsInRole: number | null; careerTags: string[]; industry: string | null;
  headline: string; takeaways: string[]; featured: boolean; published: boolean;
  uploadedBy: string | null; createdAt: Date;
}
export interface RawContribution {
  id: string; displayName: string; currentTitle: string; country: string; city: string | null;
  howIGotHere: string; whatIStudied: string; firstSalary: string; hardestPart: string;
  adviceToSeventeen: string; realityOfJob: string; careerTags: string[]; videoUrl: string | null;
  status: string; reviewedAt: Date | null; reviewedBy: string | null;
  submittedByEmail: string | null; createdAt: Date;
}

// ── Public shapes (what the client receives — no private fields) ────
export interface PublicStory {
  id: string; videoUrl: string; videoId: string; duration: string | null;
  name: string; jobTitle: string; company: string | null; location: string | null;
  yearsInRole: number | null; industry: string | null; headline: string; takeaways: string[];
}
export interface PublicContribution {
  id: string; displayName: string; currentTitle: string; country: string; city: string | null;
  howIGotHere: string; whatIStudied: string; firstSalary: string; hardestPart: string;
  adviceToSeventeen: string; realityOfJob: string; videoUrl: string | null;
}

export interface VoicesResponse {
  stories: PublicStory[];
  contributions: PublicContribution[];
}

export function toPublicStory(s: RawStory): PublicStory {
  return {
    id: s.id, videoUrl: s.videoUrl, videoId: s.videoId, duration: s.duration,
    name: s.name, jobTitle: s.jobTitle, company: s.company, location: s.location,
    yearsInRole: s.yearsInRole, industry: s.industry, headline: s.headline, takeaways: s.takeaways,
  };
}

export function toPublicContribution(c: RawContribution): PublicContribution {
  return {
    id: c.id, displayName: c.displayName, currentTitle: c.currentTitle, country: c.country, city: c.city,
    howIGotHere: c.howIGotHere, whatIStudied: c.whatIStudied, firstSalary: c.firstSalary,
    hardestPart: c.hardestPart, adviceToSeventeen: c.adviceToSeventeen, realityOfJob: c.realityOfJob,
    videoUrl: c.videoUrl,
  };
}

/** Filter raw rows to those matching the career, newest/featured first, cap, and map to public shapes. */
export function buildVoicesResponse(
  career: CareerLike,
  stories: RawStory[],
  contributions: RawContribution[],
): VoicesResponse {
  const matchedStories = stories
    .filter((s) => matchesCareer(s.careerTags, career))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_PER_LIST)
    .map(toPublicStory);

  const matchedContributions = contributions
    .filter((c) => matchesCareer(c.careerTags, career))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_PER_LIST)
    .map(toPublicContribution);

  return { stories: matchedStories, contributions: matchedContributions };
}

// src/lib/career-voices/__tests__/public.test.ts
import { describe, it, expect } from "vitest";
import {
  toPublicStory,
  toPublicContribution,
  buildVoicesResponse,
  type RawStory,
  type RawContribution,
} from "../public";

const career = { id: "software-developer", title: "Software Developer" };

const rawStory: RawStory = {
  id: "s1", videoUrl: "https://youtu.be/x", videoId: "x", duration: "3:45",
  name: "Nicky M.", jobTitle: "Programme Manager", company: "Telenor", location: "Oslo",
  yearsInRole: 15, careerTags: ["software-developer"], industry: "Tech",
  headline: "From junior dev to lead", takeaways: ["Started as a dev"],
  featured: true, published: true, uploadedBy: "admin-123", createdAt: new Date("2026-01-01"),
};

const rawContribution: RawContribution = {
  id: "c1", displayName: "Ada", currentTitle: "Senior Engineer", country: "Norway", city: "Bergen",
  howIGotHere: "...", whatIStudied: "...", firstSalary: "350k kr", hardestPart: "...",
  adviceToSeventeen: "...", realityOfJob: "...", careerTags: ["Software Developer"], videoUrl: null,
  status: "APPROVED", reviewedAt: new Date(), reviewedBy: "mod-1",
  submittedByEmail: "secret@example.com", createdAt: new Date("2026-02-01"),
};

describe("toPublicStory", () => {
  it("keeps display fields and drops private ones", () => {
    const p = toPublicStory(rawStory) as Record<string, unknown>;
    expect(p.name).toBe("Nicky M.");
    expect(p.headline).toBe("From junior dev to lead");
    expect(p.videoId).toBe("x");
    expect("uploadedBy" in p).toBe(false);
    expect("published" in p).toBe(false);
  });
});

describe("toPublicContribution", () => {
  it("keeps prose fields and drops private ones", () => {
    const p = toPublicContribution(rawContribution) as Record<string, unknown>;
    expect(p.displayName).toBe("Ada");
    expect(p.adviceToSeventeen).toBe("...");
    expect("submittedByEmail" in p).toBe(false);
    expect("reviewedBy" in p).toBe(false);
    expect("status" in p).toBe(false);
  });
});

describe("buildVoicesResponse", () => {
  it("includes matching content and excludes non-matching", () => {
    const other: RawStory = { ...rawStory, id: "s2", careerTags: ["nurse"] };
    const res = buildVoicesResponse(career, [rawStory, other], [rawContribution]);
    expect(res.stories).toHaveLength(1);
    expect(res.stories[0].id).toBe("s1");
    expect(res.contributions).toHaveLength(1);
    expect(res.contributions[0].displayName).toBe("Ada");
  });

  it("caps each list at 6", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ ...rawStory, id: `s${i}` }));
    const res = buildVoicesResponse(career, many, []);
    expect(res.stories).toHaveLength(6);
  });
});

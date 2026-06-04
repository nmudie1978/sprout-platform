// src/components/career-depth/__tests__/career-depth.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CareerDepth } from "../career-depth";

const career = { id: "software-developer", title: "Software Developer" } as never;

afterEach(() => vi.unstubAllGlobals());

function mockDetails(body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
}

describe("CareerDepth", () => {
  it("renders pay progression and the day snapshot when present", async () => {
    mockDetails({
      hasDetails: true,
      details: { typicalDay: { morning: [], midday: [], afternoon: [] },
        whatYouActuallyDo: ["Write code", "Review PRs"], whoThisIsGoodFor: [], topSkills: [], entryPaths: [],
        realityCheck: "Lots of problem-solving and meetings." },
      progression: { careerId: "software-developer", levels: [
        { level: "entry", title: "Junior", yearsExperience: "0-2 years", salaryRange: "450-550k kr" },
        { level: "senior", title: "Senior", yearsExperience: "5-8 years", salaryRange: "700-900k kr" },
      ] },
    });
    render(<CareerDepth career={career} />);
    await waitFor(() => expect(screen.getByText("How your pay grows")).toBeTruthy());
    expect(screen.getByText("450-550k kr")).toBeTruthy();
    expect(screen.getByText(/Lots of problem-solving/)).toBeTruthy();
    expect(screen.getByText("A day in the life")).toBeTruthy();
  });

  it("renders nothing when there is no curated day and no progression", async () => {
    mockDetails({
      hasDetails: false,
      details: { typicalDay: { morning: [], midday: [], afternoon: [] },
        whatYouActuallyDo: ["generic"], whoThisIsGoodFor: [], topSkills: [], entryPaths: [] },
      progression: null,
    });
    const { container } = render(<CareerDepth career={career} />);
    await waitFor(() => expect((globalThis.fetch as ReturnType<typeof vi.fn>)).toHaveBeenCalled());
    expect(container.textContent).not.toContain("How your pay grows");
    expect(container.textContent).not.toContain("A day in the life");
  });
});

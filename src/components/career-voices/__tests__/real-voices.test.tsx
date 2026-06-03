// src/components/career-voices/__tests__/real-voices.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RealVoices } from "../real-voices";

const career = { id: "software-developer", title: "Software Developer" } as never;

afterEach(() => vi.unstubAllGlobals());

function mockVoices(body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));
}

describe("RealVoices", () => {
  it("shows the empty-state contribute CTA when there is no content", async () => {
    mockVoices({ stories: [], contributions: [] });
    render(<RealVoices career={career} />);
    await waitFor(() => expect(screen.getByText(/share/i)).toBeTruthy());
    const link = screen.getByRole("link", { name: /share/i }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toContain("/contribute?career=software-developer");
  });

  it("renders a story when content exists", async () => {
    mockVoices({
      stories: [{ id: "s1", videoUrl: "https://youtu.be/x", videoId: "x", duration: null,
        name: "Ada L.", jobTitle: "Engineer", company: null, location: "Oslo", yearsInRole: 5,
        industry: null, headline: "My path into engineering", takeaways: ["Started young"] }],
      contributions: [],
    });
    render(<RealVoices career={career} />);
    await waitFor(() => expect(screen.getByText("My path into engineering")).toBeTruthy());
    expect(screen.getByText(/Ada L\./)).toBeTruthy();
  });
});

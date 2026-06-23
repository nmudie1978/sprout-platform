import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoadmapTipsCard, ROADMAP_TIPS_SEEN_KEY } from "../roadmap-tips-card";

describe("RoadmapTipsCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("always shows the Starting Point tip on first view", () => {
    render(<RoadmapTipsCard showScenarios={false} />);
    expect(screen.getByText(/Your Starting Point/i)).toBeInTheDocument();
  });

  it("shows the Scenarios tip only when showScenarios is true", () => {
    const { rerender } = render(<RoadmapTipsCard showScenarios={false} />);
    expect(screen.queryByText(/Scenarios/i)).not.toBeInTheDocument();

    localStorage.clear();
    rerender(<RoadmapTipsCard showScenarios={true} />);
    expect(screen.getByText(/Scenarios/i)).toBeInTheDocument();
  });

  it("dismisses on 'Got it' and persists so it never returns", () => {
    const { unmount } = render(<RoadmapTipsCard showScenarios />);
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));

    // Gone from the DOM immediately…
    expect(screen.queryByText(/Your Starting Point/i)).not.toBeInTheDocument();
    // …and the flag is set…
    expect(localStorage.getItem(ROADMAP_TIPS_SEEN_KEY)).toBe("1");

    // …so a fresh mount renders nothing.
    unmount();
    render(<RoadmapTipsCard showScenarios />);
    expect(screen.queryByText(/Your Starting Point/i)).not.toBeInTheDocument();
  });

  it("renders nothing when the flag is already set on mount", () => {
    localStorage.setItem(ROADMAP_TIPS_SEEN_KEY, "1");
    const { container } = render(<RoadmapTipsCard showScenarios />);
    expect(container).toBeEmptyDOMElement();
  });

  it("dismisses via the close (✕) control too", () => {
    render(<RoadmapTipsCard showScenarios={false} />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByText(/Your Starting Point/i)).not.toBeInTheDocument();
    expect(localStorage.getItem(ROADMAP_TIPS_SEEN_KEY)).toBe("1");
  });
});

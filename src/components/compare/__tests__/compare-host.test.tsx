import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompareHost } from "../compare-host";
import type { Career } from "@/lib/career-pathways";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

let shortlist: Career[] = [];
const add = vi.fn(() => "added" as const);
const remove = vi.fn();
const clear = vi.fn();
vi.mock("@/hooks/use-compare-shortlist", () => ({
  useCompareShortlist: () => ({
    shortlist,
    add,
    remove,
    clear,
    max: 3,
    isInShortlist: (id: string) => shortlist.some((c) => c.id === id),
    toggle: vi.fn(),
    loadSet: vi.fn(),
  }),
}));

// Stub the heavy children so we test the host's own behaviour.
vi.mock("@/components/compare/compare-modal", () => ({
  CompareModal: ({ open }: { open: boolean }) => (open ? <div>MODAL_OPEN</div> : null),
}));
vi.mock("@/components/compare/floating-compare-cta", () => ({
  FloatingCompareCTA: ({ shortlist }: { shortlist: Career[] }) => (
    <div>PILL:{shortlist.length}</div>
  ),
}));

function career(id: string): Career {
  return { id, title: id, emoji: "🧭" } as unknown as Career;
}

const PROMPT = "You now have 3 careers to compare.";

describe("CompareHost", () => {
  beforeEach(() => {
    pathname = "/dashboard";
    shortlist = [];
    add.mockClear();
    remove.mockClear();
    clear.mockClear();
  });

  it("prompts when an add crosses up to 3", () => {
    shortlist = [career("a"), career("b")];
    const { rerender } = render(<CompareHost />);
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();

    shortlist = [career("a"), career("b"), career("c")];
    rerender(<CompareHost />);
    expect(screen.getByText(PROMPT)).toBeInTheDocument();
  });

  it("does NOT prompt when the shortlist is already full on mount", () => {
    shortlist = [career("a"), career("b"), career("c")];
    render(<CompareHost />);
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it("opens the compare modal on 'Yes, compare'", () => {
    shortlist = [career("a"), career("b")];
    const { rerender } = render(<CompareHost />);
    shortlist = [career("a"), career("b"), career("c")];
    rerender(<CompareHost />);

    fireEvent.click(screen.getByRole("button", { name: /yes, compare/i }));
    expect(screen.getByText("MODAL_OPEN")).toBeInTheDocument();
  });

  it("renders the floating pill off the radar when the shortlist is non-empty", () => {
    shortlist = [career("a")];
    render(<CompareHost />);
    expect(screen.getByText("PILL:1")).toBeInTheDocument();
  });

  it("suppresses the floating pill on the radar route", () => {
    pathname = "/careers/radar";
    shortlist = [career("a")];
    render(<CompareHost />);
    expect(screen.queryByText("PILL:1")).not.toBeInTheDocument();
  });

  it("handles the add-career-to-compare event off the radar", () => {
    render(<CompareHost />);
    window.dispatchEvent(new CustomEvent("add-career-to-compare", { detail: career("z") }));
    expect(add).toHaveBeenCalledTimes(1);
  });

  it("ignores the add event on the radar (radar owns it there)", () => {
    pathname = "/careers/radar";
    render(<CompareHost />);
    window.dispatchEvent(new CustomEvent("add-career-to-compare", { detail: career("z") }));
    expect(add).not.toHaveBeenCalled();
  });
});

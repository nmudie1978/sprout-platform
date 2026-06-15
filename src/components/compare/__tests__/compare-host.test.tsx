import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
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

// The "you now have 3 — compare?" nudge is a NON-BLOCKING toast (not a modal),
// so it can't deadlock on top of the open career detail dialog.
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: (...args: unknown[]) => toast(...args) }));
vi.mock("@/components/ui/toast", () => ({
  ToastAction: (props: { onClick?: () => void; children?: React.ReactNode }) => (
    <button onClick={props.onClick}>{props.children}</button>
  ),
}));

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

const PROMPT_TITLE = /3 careers to compare/i;

describe("CompareHost", () => {
  beforeEach(() => {
    pathname = "/dashboard";
    shortlist = [];
    add.mockClear();
    remove.mockClear();
    clear.mockClear();
    toast.mockClear();
  });

  it("toasts when a single add crosses up to 3", () => {
    shortlist = [career("a"), career("b")];
    const { rerender } = render(<CompareHost />);
    expect(toast).not.toHaveBeenCalled();

    shortlist = [career("a"), career("b"), career("c")];
    rerender(<CompareHost />);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].title).toMatch(PROMPT_TITLE);
  });

  it("does NOT toast when the shortlist is already full on mount", () => {
    shortlist = [career("a"), career("b"), career("c")];
    render(<CompareHost />);
    expect(toast).not.toHaveBeenCalled();
  });

  it("does NOT toast on a bulk 0→3 jump (localStorage hydration / loadSet on refresh)", () => {
    shortlist = [];
    const { rerender } = render(<CompareHost />);
    shortlist = [career("a"), career("b"), career("c")];
    rerender(<CompareHost />);
    expect(toast).not.toHaveBeenCalled();
  });

  it("the toast's Compare action opens the compare modal", () => {
    shortlist = [career("a"), career("b")];
    const { rerender } = render(<CompareHost />);
    shortlist = [career("a"), career("b"), career("c")];
    rerender(<CompareHost />);

    const action = toast.mock.calls[0][0].action as React.ReactElement<{ onClick: () => void }>;
    act(() => action.props.onClick());
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

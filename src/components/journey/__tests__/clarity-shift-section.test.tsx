import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClarityShiftSection } from "../clarity-shift-section";
import type { UseClarityShift } from "@/hooks/use-clarity-shift";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const setBefore = vi.fn();
const setAfter = vi.fn();
let hookState: UseClarityShift;

vi.mock("@/hooks/use-clarity-shift", () => ({
  useClarityShift: () => hookState,
}));

function state(overrides: Partial<UseClarityShift> = {}): UseClarityShift {
  return {
    beforeScore: null,
    afterScore: null,
    status: "ready",
    enabled: true,
    setBefore,
    setAfter,
    ...overrides,
  };
}

describe("ClarityShiftSection", () => {
  beforeEach(() => {
    setBefore.mockReset();
    setAfter.mockReset();
    hookState = state();
  });

  it("renders nothing when disabled (signed out / no career)", () => {
    hookState = state({ enabled: false });
    const { container } = render(<ClarityShiftSection careerId="nurse" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks the BEFORE question first", () => {
    render(<ClarityShiftSection careerId="nurse" />);
    expect(screen.getByText("clarityShift.prompt.before")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /levels\.unsure$/ }));
    expect(setBefore).toHaveBeenCalledWith(2);
  });

  it("offers the AFTER question once a before score exists", () => {
    hookState = state({ beforeScore: 2 });
    render(<ClarityShiftSection careerId="nurse" />);
    expect(screen.getByText("clarityShift.prompt.after")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /levels\.fairlyClear/ }));
    expect(setAfter).toHaveBeenCalledWith(4);
  });

  it("shows the reflection once both endpoints exist", () => {
    hookState = state({ beforeScore: 2, afterScore: 4 });
    render(<ClarityShiftSection careerId="nurse" />);
    expect(screen.getByText("clarityShift.narrative.clearer.big")).toBeInTheDocument();
  });
});

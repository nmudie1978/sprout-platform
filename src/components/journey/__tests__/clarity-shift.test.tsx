import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClarityShiftPrompt } from "../clarity-shift-prompt";
import { ClarityShiftReflection } from "../clarity-shift-reflection";

// useTranslations(ns) -> (key) => `${ns}.${key}`, with .rich/.markup fallthrough
// not needed here. Stable keys let us assert without real copy.
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

describe("ClarityShiftPrompt", () => {
  const onSelect = vi.fn();
  beforeEach(() => onSelect.mockReset());

  it("renders the before prompt and five clarity levels", () => {
    render(<ClarityShiftPrompt phase="before" value={null} onSelect={onSelect} />);
    expect(screen.getByText("clarityShift.prompt.before")).toBeInTheDocument();
    // Accessible name is the score + the label, e.g. "1 clarityShift.levels.veryUnsure".
    expect(screen.getByRole("button", { name: /levels\.veryUnsure/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /levels\.clear/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("renders the after prompt when phase is after", () => {
    render(<ClarityShiftPrompt phase="after" value={null} onSelect={onSelect} />);
    expect(screen.getByText("clarityShift.prompt.after")).toBeInTheDocument();
  });

  it("fires onSelect with the chosen score", () => {
    render(<ClarityShiftPrompt phase="before" value={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /levels\.gettingClearer/ }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});

describe("ClarityShiftReflection", () => {
  it("celebrates a big upward shift honestly", () => {
    render(<ClarityShiftReflection before={2} after={4} />);
    expect(screen.getByText("clarityShift.narrative.clearer.big")).toBeInTheDocument();
  });

  it("acknowledges a downward shift without spinning it as positive", () => {
    render(<ClarityShiftReflection before={4} after={3} />);
    expect(screen.getByText("clarityShift.narrative.lessSure.small")).toBeInTheDocument();
  });

  it("acknowledges a steady result", () => {
    render(<ClarityShiftReflection before={3} after={3} />);
    expect(screen.getByText("clarityShift.narrative.steady")).toBeInTheDocument();
  });
});

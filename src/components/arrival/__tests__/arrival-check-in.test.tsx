import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArrivalCheckIn } from "../arrival-check-in";
import type { UseArrivalCheckIn } from "@/hooks/use-arrival-check-in";

// useTranslations(ns) -> (key) => `${ns}.${key}` so we can assert on stable keys.
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const submit = vi.fn();
const skip = vi.fn();

let hookState: UseArrivalCheckIn;
vi.mock("@/hooks/use-arrival-check-in", () => ({
  useArrivalCheckIn: () => hookState,
}));

function baseState(overrides: Partial<UseArrivalCheckIn> = {}): UseArrivalCheckIn {
  return {
    today: null,
    acknowledgementKey: null,
    skipped: false,
    status: "ready",
    submit,
    skip,
    ...overrides,
  };
}

describe("ArrivalCheckIn", () => {
  beforeEach(() => {
    submit.mockReset();
    skip.mockReset();
    hookState = baseState();
  });

  it("renders the prompt and all four moods plus a skip", () => {
    render(<ArrivalCheckIn />);
    expect(screen.getByText("arrival.prompt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "arrival.moods.lost" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "arrival.moods.curious" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "arrival.moods.pressured" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "arrival.moods.motivated" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "arrival.skip" })).toBeInTheDocument();
  });

  it("renders nothing while loading", () => {
    hookState = baseState({ status: "loading" });
    const { container } = render(<ArrivalCheckIn />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing if the user skipped this session", () => {
    hookState = baseState({ skipped: true });
    const { container } = render(<ArrivalCheckIn />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing if the user already checked in earlier today", () => {
    hookState = baseState({ today: { mood: "curious" } });
    const { container } = render(<ArrivalCheckIn />);
    expect(container).toBeEmptyDOMElement();
  });

  it("submits the chosen mood and shows the calm acknowledgement", () => {
    render(<ArrivalCheckIn />);
    fireEvent.click(screen.getByRole("button", { name: "arrival.moods.pressured" }));
    expect(submit).toHaveBeenCalledWith("pressured");
    // The acknowledgement keyed to the mood replaces the prompt.
    expect(screen.getByText("arrival.ack.pressured")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "arrival.moods.lost" })).not.toBeInTheDocument();
  });

  it("calls skip when the user dismisses", () => {
    render(<ArrivalCheckIn />);
    fireEvent.click(screen.getByRole("button", { name: "arrival.skip" }));
    expect(skip).toHaveBeenCalledTimes(1);
  });
});

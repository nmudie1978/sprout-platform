import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FeedbackPage from "../page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("FeedbackPage", () => {
  it("renders the four feedback kinds and no stale concepts", () => {
    render(<FeedbackPage />);
    expect(screen.getByText("Something confused me")).toBeInTheDocument();
    expect(screen.getByText("Found a problem")).toBeInTheDocument();
    expect(screen.getByText("I have an idea")).toBeInTheDocument();
    expect(screen.getByText("Something I liked")).toBeInTheDocument();
    expect(screen.queryByText(/small job/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secondary goal/i)).not.toBeInTheDocument();
  });

  it("keeps submit disabled until a kind and a message are provided", () => {
    render(<FeedbackPage />);
    const submit = screen.getByRole("button", { name: /send feedback/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByText("I have an idea"));
    expect(submit).toBeDisabled(); // still no message

    fireEvent.change(screen.getByPlaceholderText(/tell us/i), {
      target: { value: "add a dark-mode toggle" },
    });
    expect(submit).not.toBeDisabled();
  });

  it("lets a star rating alone enable submit (no written feedback needed)", () => {
    render(<FeedbackPage />);
    const submit = screen.getByRole("button", { name: /send feedback/i });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/5 stars/i));
    expect(submit).not.toBeDisabled();
  });
});

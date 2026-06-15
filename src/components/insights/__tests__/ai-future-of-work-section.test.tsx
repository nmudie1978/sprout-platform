import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiFutureOfWorkSection } from "../ai-future-of-work-section";

describe("AiFutureOfWorkSection", () => {
  it("renders the header, three cards, and the impact chips", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByRole("heading", { name: "AI & The Future of Work" })).toBeInTheDocument();
    expect(screen.getByText("Future Lens")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "How AI Changes Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Careers AI Is Creating" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Human Skills Still Matter" })).toBeInTheDocument();

    expect(screen.getByText("Enhanced by AI")).toBeInTheDocument();
    expect(screen.getByText("Changed by AI")).toBeInTheDocument();
    expect(screen.getByText("Created by AI")).toBeInTheDocument();
    expect(screen.getByText("Lower-risk human work")).toBeInTheDocument();
  });

  it("opens the examples modal from the first card's CTA", () => {
    render(<AiFutureOfWorkSection />);
    expect(
      screen.queryByText("Designers use AI to generate concepts faster."),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /view examples/i }));

    expect(
      screen.getByText("Designers use AI to generate concepts faster."),
    ).toBeInTheDocument();
  });

  it("opens the roles modal with its clusters", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /explore roles/i }));
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("AI Safety Specialist")).toBeInTheDocument();
  });

  it("opens the skills modal with future-proof skills", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /see skills/i }));
    expect(screen.getByText("AI literacy")).toBeInTheDocument();
    expect(screen.getByText("Ethical judgement")).toBeInTheDocument();
  });
});

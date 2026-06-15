import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AiFutureOfWorkSection } from "../ai-future-of-work-section";

describe("AiFutureOfWorkSection", () => {
  it("renders the header and three pillar cards", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByRole("heading", { name: "AI & The Future of Work" })).toBeInTheDocument();
    expect(screen.getByText("Future Lens")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "How AI Changes Work" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Careers AI Is Creating" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Human Skills Still Matter" })).toBeInTheDocument();
  });

  it("does NOT render the removed 'AI impact at a glance' chips", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.queryByText(/AI impact at a glance/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Enhanced by AI")).not.toBeInTheDocument();
    expect(screen.queryByText("Lower-risk human work")).not.toBeInTheDocument();
  });

  it("renders the 'How people use AI today' uses, including RAG", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("How people use AI today")).toBeInTheDocument();
    expect(screen.getByText("Answers from messy data")).toBeInTheDocument();
    expect(screen.getByText(/RAG systems/)).toBeInTheDocument();
    expect(screen.getByText("Automate business processes")).toBeInTheDocument();
  });

  it("renders leading AI models with their providers", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("Today's leading AI models")).toBeInTheDocument();
    expect(screen.getAllByText(/Anthropic/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/OpenAI/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DeepSeek/).length).toBeGreaterThan(0);
  });

  it("renders the AI certification tracks as external links", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("AI certification tracks")).toBeInTheDocument();
    const cert = screen.getByText("Professional Machine Learning Engineer").closest("a");
    expect(cert).toHaveAttribute("href", expect.stringContaining("cloud.google.com"));
    expect(cert).toHaveAttribute("target", "_blank");
  });

  it("renders the careers-in-AI videos", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("Watch: careers in AI")).toBeInTheDocument();
    expect(
      screen.getByText("Life as an AI Researcher & Machine Learning Engineer"),
    ).toBeInTheDocument();
  });

  it("opens the examples modal (incl. RAG) from the first card", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /view examples/i }));
    expect(screen.getByText(/RAG systems answer questions over documents/)).toBeInTheDocument();
  });

  it("opens the roles modal with clickable career links", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /explore roles/i }));
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    const link = screen.getByText("AI Engineer").closest("a");
    expect(link).toHaveAttribute("href", "/careers?open=ai-engineer");
  });

  it("opens the evolution-of-AI timeline modal", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /explore the evolution of ai/i }));
    expect(screen.getByRole("heading", { name: "The evolution of AI" })).toBeInTheDocument();
    expect(screen.getByText(/Transformer/)).toBeInTheDocument();
  });

  it("opens a video player when a video card is clicked", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(
      screen.getByText("Life as an AI Researcher & Machine Learning Engineer"),
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTitle(/Life as an AI Researcher/)).toBeInTheDocument();
  });
});

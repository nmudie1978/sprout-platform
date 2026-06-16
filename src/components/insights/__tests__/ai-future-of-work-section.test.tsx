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

  it("renders the fun fact that Endeavrly was built with AI (Claude Code)", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("Fun fact:")).toBeInTheDocument();
    expect(screen.getByText(/built with AI/)).toBeInTheDocument();
    expect(screen.getByText(/Claude Code/)).toBeInTheDocument();
  });

  it("does NOT render the removed 'AI impact at a glance' chips", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.queryByText(/AI impact at a glance/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Enhanced by AI")).not.toBeInTheDocument();
    expect(screen.queryByText("Lower-risk human work")).not.toBeInTheDocument();
  });

  it("does NOT render the removed 'How people use AI today' section", () => {
    render(<AiFutureOfWorkSection />);
    // The pillar-card CTA still opens an "examples" modal of the same name, but
    // the standalone on-page uses grid (with "Answers from messy data") is gone.
    expect(screen.queryByText("Answers from messy data")).not.toBeInTheDocument();
    expect(screen.queryByText("Build apps by describing them")).not.toBeInTheDocument();
  });

  it("renders the leading AI models in the tabbed table (Models default)", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("AI models & certifications")).toBeInTheDocument();
    // Models tab is shown by default.
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    // "DeepSeek" is both the model name and its maker → appears twice.
    expect(screen.getAllByText("DeepSeek").length).toBeGreaterThan(0);
  });

  it("renders the certification tracks as external links under the Certifications tab", () => {
    render(<AiFutureOfWorkSection />);
    // Certs live behind the tab — not shown until selected (keeps the noise down).
    expect(
      screen.queryByText("Professional Machine Learning Engineer"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Certifications" }));
    const cert = screen.getByText("Professional Machine Learning Engineer").closest("a");
    expect(cert).toHaveAttribute("href", expect.stringContaining("cloud.google.com"));
    expect(cert).toHaveAttribute("target", "_blank");
  });

  it("opens the model-detail modal from the 'what sets each model apart' link", () => {
    render(<AiFutureOfWorkSection />);
    fireEvent.click(screen.getByRole("button", { name: /what sets each model apart/i }));
    expect(screen.getByText(/Safety-focused; strong at writing/)).toBeInTheDocument();
  });

  it("renders the careers-in-AI videos (expanded set across roles)", () => {
    render(<AiFutureOfWorkSection />);
    expect(screen.getByText("Watch: careers in AI")).toBeInTheDocument();
    expect(
      screen.getByText("Life as an AI Researcher & Machine Learning Engineer"),
    ).toBeInTheDocument();
    // AI engineer (two real videos share this exact title), ML engineer & data scientist.
    expect(
      screen.getAllByText("Day in the Life of an AI Engineer").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("A Day in the Life of a Machine Learning Engineer (Berlin)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Day in the Life of a Data Scientist in San Francisco"),
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

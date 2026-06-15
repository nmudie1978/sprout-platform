import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CareerSpecialisms } from "../career-specialisms";

// Resolve any career id so a promoted branch (linksToCareerId) renders its link.
vi.mock("@/hooks/use-career-catalog", () => ({
  useCareerCatalog: () => ({ getCareerById: (id: string) => ({ id }) }),
}));

describe("CareerSpecialisms (branch tree)", () => {
  it("renders nothing for a career with no branches", () => {
    const { container } = render(<CareerSpecialisms careerId="software-engineer" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the shared-foundation trunk node with the seeded foundation", () => {
    render(<CareerSpecialisms careerId="psychologist" />);
    expect(screen.getByText("Shared foundation")).toBeInTheDocument();
    expect(screen.getByText(/psychology degree/i)).toBeInTheDocument();
  });

  it("renders a branch node per specialism", () => {
    render(<CareerSpecialisms careerId="psychologist" />);
    expect(screen.getByText("Clinical Psychologist")).toBeInTheDocument();
    expect(screen.getByText("Forensic Psychologist")).toBeInTheDocument();
    expect(screen.getByText("Counselling Psychologist")).toBeInTheDocument();
  });

  it("expands a (non-promoted) branch inline on click", () => {
    render(<CareerSpecialisms careerId="psychologist" />);
    expect(screen.queryByText("A typical day leans on")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clinical psychologist/i }));
    expect(screen.getByText("A typical day leans on")).toBeInTheDocument();
    expect(screen.getByText("How you get here")).toBeInTheDocument();
  });

  it("renders a promoted branch as an 'Explore career' link, not an expander", () => {
    render(<CareerSpecialisms careerId="psychologist" />);
    // Sports Psychologist links out to its standalone career.
    const link = screen.getByRole("link", { name: /explore career/i });
    expect(link).toHaveAttribute("href", "/careers?open=sports-psychologist");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CareerProgressionFlow } from "../CareerProgressionFlow";

describe("CareerProgressionFlow", () => {
  it("renders two labelled tracks when both fork fields are present", () => {
    render(
      <CareerProgressionFlow
        progression={{ entry: ["Junior Dev"], core: ["Developer"], nextExpert: ["Staff Engineer"], nextLead: ["Engineering Manager"] }}
      />,
    );
    expect(screen.getByText("Expert")).toBeInTheDocument();
    expect(screen.getByText("Lead")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(screen.getByText("Engineering Manager")).toBeInTheDocument();
    expect(screen.getByText(/neither is higher/i)).toBeInTheDocument();
  });

  it("renders the flat next row (no fork caption) when only next is present", () => {
    render(
      <CareerProgressionFlow
        progression={{ entry: ["Apprentice"], core: ["Electrician"], next: ["Master Electrician"] }}
      />,
    );
    expect(screen.getByText("Master Electrician")).toBeInTheDocument();
    expect(screen.queryByText("Expert")).not.toBeInTheDocument();
    expect(screen.queryByText(/neither is higher/i)).not.toBeInTheDocument();
  });

  it("renders nothing when there is no progression data", () => {
    const { container } = render(
      <CareerProgressionFlow progression={{ entry: [], core: [], next: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

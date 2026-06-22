import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventsOpportunitiesView } from "../events-opportunities-view";

/** Most assertions use Norway, the platform default. */
const renderNO = () => render(<EventsOpportunitiesView country="Norway" />);

describe("Events & Opportunities view", () => {
  it("renders the header subtitle, helper line and both tabs", () => {
    renderNO();
    expect(screen.getByText(/Explore career events, open days, internships/i)).toBeInTheDocument();
    expect(screen.getByText(/ready to move from exploring careers to taking real-world next steps/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Opportunities" })).toBeInTheDocument();
  });

  it("does not render the Opportunity Types cards block", () => {
    renderNO();
    // The opportunity-type description cards are gone — the Type filter drives
    // the view directly.
    expect(screen.queryByText("Apprenticeships (Lærling)")).not.toBeInTheDocument();
    expect(screen.queryByText(/Short-term work experience, often for students/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Structured entry routes for recent graduates/i)).not.toBeInTheDocument();
    // The sources directory ("Where to look") is shown by default instead.
    expect(screen.getByText(/Where to look/i)).toBeInTheDocument();
  });

  it("renders external links that open safely in a new tab", () => {
    renderNO();
    const nav = screen.getByRole("link", { name: /Open NAV Arbeidsplassen/i });
    expect(nav).toHaveAttribute("href", "https://arbeidsplassen.nav.no/");
    expect(nav).toHaveAttribute("target", "_blank");
    expect(nav).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(nav.getAttribute("rel")).toContain("noreferrer");
  });

  it("switches to the Events tab and shows event categories", () => {
    renderNO();
    // Radix tabs use automatic activation (on focus), so focus then click.
    const eventsTab = screen.getByRole("tab", { name: "Events" });
    fireEvent.focus(eventsTab);
    fireEvent.click(eventsTab);
    expect(screen.getByText("Job Fairs")).toBeInTheDocument();
    expect(screen.getByText("Open Days")).toBeInTheDocument();
    expect(screen.getByText("Career Workshops")).toBeInTheDocument();
  });

  it("shows the filters but no search bar on the Opportunities tab", () => {
    renderNO();
    // Opportunities is the default tab.
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Audience")).toBeInTheDocument();
    // The free-text search bar has been removed entirely.
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("hides the filters on the Events tab", () => {
    renderNO();
    const eventsTab = screen.getByRole("tab", { name: "Events" });
    fireEvent.focus(eventsTab);
    fireEvent.click(eventsTab);
    // The filter controls belong only to the Opportunities section.
    expect(screen.queryByLabelText("Type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Audience")).not.toBeInTheDocument();
  });

  it("selecting a type shows only its 'Where to look' section", () => {
    renderNO();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "graduate-programs" } });
    expect(screen.getByText(/Where to look · Graduate Programs/i)).toBeInTheDocument();
    // Still no opportunity-type cards block.
    expect(screen.queryByText(/Structured entry routes for recent graduates/i)).not.toBeInTheDocument();
  });

  it("type filter narrows the source directory (Apprenticeships)", () => {
    renderNO();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "apprenticeships" } });
    expect(screen.getByRole("link", { name: /Open Jobbnorge/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open Glassdoor Norway Internships/i })).not.toBeInTheDocument();
  });

  it("type filter works for Internships", () => {
    renderNO();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "internships" } });
    expect(screen.getByRole("link", { name: /Open Glassdoor Norway Internships/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open The Hub/i })).toBeInTheDocument();
  });
});

describe("Events & Opportunities view — country tailoring", () => {
  it("a Norwegian user sees Norwegian portals and an 'All Norway' location", () => {
    render(<EventsOpportunitiesView country="Norway" />);
    expect(screen.getByRole("link", { name: /Open NAV Arbeidsplassen/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open FINN Jobb/i })).toBeInTheDocument();
    // Global sources are shared.
    expect(screen.getByRole("link", { name: /Open LinkedIn Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All Norway" })).toBeInTheDocument();
    // No Spanish portal.
    expect(screen.queryByRole("link", { name: /Open InfoJobs/i })).not.toBeInTheDocument();
  });

  it("a Spanish user sees Spanish portals (SEPE/InfoJobs), not Norwegian ones", () => {
    render(<EventsOpportunitiesView country="Spain" />);
    expect(screen.getByRole("link", { name: /Open SEPE/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open InfoJobs/i })).toBeInTheDocument();
    // Global sources still present.
    expect(screen.getByRole("link", { name: /Open LinkedIn Jobs/i })).toBeInTheDocument();
    // Location is tailored.
    expect(screen.getByRole("option", { name: "All Spain" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Madrid" })).toBeInTheDocument();
    // Norwegian portals are NOT shown.
    expect(screen.queryByRole("link", { name: /Open NAV Arbeidsplassen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open FINN Jobb/i })).not.toBeInTheDocument();
  });

  it("an unknown country sees global sources only (no wrong-country portals)", () => {
    render(<EventsOpportunitiesView country="Germany" />);
    expect(screen.getByRole("link", { name: /Open LinkedIn Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open EURES/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open NAV Arbeidsplassen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open SEPE/i })).not.toBeInTheDocument();
    // Neutral location label, no national cities.
    expect(screen.getByRole("option", { name: "All locations" })).toBeInTheDocument();
  });
});

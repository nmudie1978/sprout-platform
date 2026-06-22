import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EventsOpportunitiesView } from "../events-opportunities-view";

// The Events tab mounts <YouthEventsTable/>, which uses react-query + fetches
// /api/events/youth — so wrap in a client and stub fetch with an empty list.
function renderView(country: string | null = "Norway") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EventsOpportunitiesView country={country} />
    </QueryClientProvider>,
  );
}

// Opportunities is no longer the default tab (Events is), so opportunities
// content is unmounted on first render — switch to it before asserting on it.
function openOpportunities() {
  const tab = screen.getByRole("tab", { name: "Opportunities" });
  fireEvent.focus(tab);
  fireEvent.click(tab);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ events: [], total: 0, page: 1, pageSize: 8, isStale: false }),
  })) as unknown as typeof fetch);
});

describe("Events & Opportunities view", () => {
  it("renders the header subtitle, helper line and both tabs", () => {
    renderView();
    expect(screen.getByText(/Explore career events, open days, internships/i)).toBeInTheDocument();
    expect(screen.getByText(/ready to move from exploring careers to taking real-world next steps/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Opportunities" })).toBeInTheDocument();
  });

  it("does not render the Opportunity Types cards block", () => {
    renderView();
    openOpportunities();
    // The opportunity-type description cards are gone — the Type filter drives
    // the view directly.
    expect(screen.queryByText("Apprenticeships (Lærling)")).not.toBeInTheDocument();
    expect(screen.queryByText(/Short-term work experience, often for students/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Structured entry routes for recent graduates/i)).not.toBeInTheDocument();
    // The sources directory ("Where to look") is shown instead.
    expect(screen.getByText(/Where to look/i)).toBeInTheDocument();
  });

  it("renders external links that open safely in a new tab", () => {
    renderView();
    openOpportunities();
    const nav = screen.getByRole("link", { name: /Open NAV Arbeidsplassen/i });
    expect(nav).toHaveAttribute("href", "https://arbeidsplassen.nav.no/");
    expect(nav).toHaveAttribute("target", "_blank");
    expect(nav).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(nav.getAttribute("rel")).toContain("noreferrer");
  });

  it("switches to the Events tab and shows the events table + 'find more by type' categories", () => {
    renderView();
    // Radix tabs use automatic activation (on focus), so focus then click.
    const eventsTab = screen.getByRole("tab", { name: "Events" });
    fireEvent.focus(eventsTab);
    fireEvent.click(eventsTab);
    expect(screen.getByText(/Upcoming events/i)).toBeInTheDocument();
    expect(screen.getByText(/Find more, by type/i)).toBeInTheDocument();
    expect(screen.getByText("Job Fairs")).toBeInTheDocument();
    expect(screen.getByText("Open Days")).toBeInTheDocument();
    expect(screen.getByText("Career Workshops")).toBeInTheDocument();
  });

  it("shows the filters but no search bar on the Opportunities tab", () => {
    renderView();
    openOpportunities();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Audience")).toBeInTheDocument();
    // The free-text search bar has been removed entirely.
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("hides the filters on the Events tab", () => {
    renderView();
    const eventsTab = screen.getByRole("tab", { name: "Events" });
    fireEvent.focus(eventsTab);
    fireEvent.click(eventsTab);
    // The filter controls belong only to the Opportunities section.
    expect(screen.queryByLabelText("Type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Location")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Audience")).not.toBeInTheDocument();
  });

  it("selecting a type shows only its 'Where to look' section", () => {
    renderView();
    openOpportunities();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "graduate-programs" } });
    expect(screen.getByText(/Where to look · Graduate Programs/i)).toBeInTheDocument();
    // Still no opportunity-type cards block.
    expect(screen.queryByText(/Structured entry routes for recent graduates/i)).not.toBeInTheDocument();
  });

  it("type filter narrows the source directory (Apprenticeships)", () => {
    renderView();
    openOpportunities();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "apprenticeships" } });
    expect(screen.getByRole("link", { name: /Open Jobbnorge/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open Glassdoor Norway Internships/i })).not.toBeInTheDocument();
  });

  it("type filter works for Internships", () => {
    renderView();
    openOpportunities();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "internships" } });
    expect(screen.getByRole("link", { name: /Open Glassdoor Norway Internships/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open The Hub/i })).toBeInTheDocument();
  });
});

describe("Events & Opportunities view — country tailoring", () => {
  it("a Norwegian user sees Norwegian portals and an 'All Norway' location", () => {
    renderView("Norway");
    openOpportunities();
    expect(screen.getByRole("link", { name: /Open NAV Arbeidsplassen/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open FINN Jobb/i })).toBeInTheDocument();
    // Global sources are shared.
    expect(screen.getByRole("link", { name: /Open LinkedIn Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All Norway" })).toBeInTheDocument();
    // No Spanish portal.
    expect(screen.queryByRole("link", { name: /Open InfoJobs/i })).not.toBeInTheDocument();
  });

  it("a Spanish user sees Spanish portals (SEPE/InfoJobs), not Norwegian ones", () => {
    renderView("Spain");
    openOpportunities();
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
    renderView("Germany");
    openOpportunities();
    expect(screen.getByRole("link", { name: /Open LinkedIn Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open EURES/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open NAV Arbeidsplassen/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open SEPE/i })).not.toBeInTheDocument();
    // Neutral location label, no national cities.
    expect(screen.getByRole("option", { name: "All locations" })).toBeInTheDocument();
  });
});

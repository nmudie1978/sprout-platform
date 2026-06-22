import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EventsOpportunitiesPage from "../page";

// The Events tab mounts <YouthEventsTable/>, which uses react-query + fetches
// /api/events/youth — so wrap in a client and stub fetch with an empty list.
function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EventsOpportunitiesPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ events: [], total: 0, page: 1, pageSize: 8, isStale: false }),
  })) as unknown as typeof fetch);
});

describe("Events & Opportunities page", () => {
  it("renders the header subtitle, helper line and both tabs", () => {
    renderPage();
    expect(screen.getByText(/Explore career events, open days, internships/i)).toBeInTheDocument();
    expect(screen.getByText(/ready to move from exploring careers to taking real-world next steps/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Opportunities" })).toBeInTheDocument();
  });

  it("shows the five opportunity types by default (Opportunities tab)", () => {
    renderPage();
    // Match unique card text (plain labels collide with the <select> options).
    expect(screen.getByText("Apprenticeships (Lærling)")).toBeInTheDocument();
    expect(screen.getByText(/Short-term work experience, often for students/i)).toBeInTheDocument();
    expect(screen.getByText(/Structured entry routes for recent graduates/i)).toBeInTheDocument();
    expect(screen.getByText(/Part-time, flexible, or summer roles/i)).toBeInTheDocument();
    expect(screen.getByText(/First-step roles where experience requirements are low/i)).toBeInTheDocument();
  });

  it("renders external links that open safely in a new tab", () => {
    renderPage();
    const nav = screen.getByRole("link", { name: /Open NAV Arbeidsplassen/i });
    expect(nav).toHaveAttribute("href", "https://arbeidsplassen.nav.no/");
    expect(nav).toHaveAttribute("target", "_blank");
    expect(nav).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(nav.getAttribute("rel")).toContain("noreferrer");
  });

  it("switches to the Events tab and shows event categories", () => {
    renderPage();
    // Radix tabs use automatic activation (on focus), so focus then click.
    const eventsTab = screen.getByRole("tab", { name: "Events" });
    fireEvent.focus(eventsTab);
    fireEvent.click(eventsTab);
    expect(screen.getByText("Job Fairs")).toBeInTheDocument();
    expect(screen.getByText("Open Days")).toBeInTheDocument();
    expect(screen.getByText("Career Workshops")).toBeInTheDocument();
  });

  it("type filter narrows the source directory (Apprenticeships)", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "apprenticeships" } });
    expect(screen.getByRole("link", { name: /Open Jobbnorge/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open Glassdoor Norway Internships/i })).not.toBeInTheDocument();
  });

  it("type filter works for Internships", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "internships" } });
    expect(screen.getByRole("link", { name: /Open Glassdoor Norway Internships/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open The Hub/i })).toBeInTheDocument();
  });

  it("search filters the visible sources", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Search events and opportunities/i), { target: { value: "glassdoor" } });
    expect(screen.getByRole("link", { name: /Open Glassdoor Norway Internships/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open NAV Arbeidsplassen/i })).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Search events and opportunities/i), { target: { value: "zzzznope-not-a-thing" } });
    expect(screen.getByText(/No matching opportunities found yet/i)).toBeInTheDocument();
  });
});

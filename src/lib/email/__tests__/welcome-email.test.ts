import { describe, it, expect } from "vitest";
import { buildWelcomeEmail } from "../welcome-email";

describe("buildWelcomeEmail", () => {
  const url = "https://endeavrly.com/dashboard";

  it("returns a calm, on-brand subject", () => {
    const { subject } = buildWelcomeEmail("Mia", url);
    expect(subject.toLowerCase()).toContain("welcome");
    expect(subject).toContain("Endeavrly");
  });

  it("greets the user by first name in both text and html", () => {
    const { text, html } = buildWelcomeEmail("Mia", url);
    expect(text).toContain("Mia");
    expect(html).toContain("Mia");
  });

  it("falls back to a friendly greeting when no name is given", () => {
    const { text, html } = buildWelcomeEmail("", url);
    expect(text).toMatch(/Hi there/i);
    expect(html).toMatch(/Hi there/i);
    // No dangling "Hi ," artefact
    expect(text).not.toMatch(/Hi\s*,/);
  });

  it("includes the journey/dashboard call-to-action URL", () => {
    const { text, html } = buildWelcomeEmail("Mia", url);
    expect(text).toContain(url);
    expect(html).toContain(`href="${url}"`);
  });

  it("escapes HTML in the first name to prevent injection", () => {
    const { html } = buildWelcomeEmail('<script>alert(1)</script>', url);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("stays transactional — no marketing/unsubscribe-list language", () => {
    const { text } = buildWelcomeEmail("Mia", url);
    expect(text.toLowerCase()).not.toContain("unsubscribe");
    expect(text.toLowerCase()).not.toContain("newsletter");
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  buildFeedbackNotification,
  feedbackRecipient,
  notifyNewFeedback,
  type FeedbackNotificationInput,
} from "../feedback-notify";

const SENT = new Date("2026-08-29T09:41:00.000Z");

function input(overrides: Partial<FeedbackNotificationInput> = {}): FeedbackNotificationInput {
  return {
    id: "1f2e3d4c-aaaa-bbbb-cccc-000000000000",
    kind: "CONFUSED",
    area: "CAREER_TWIN",
    role: "TEEN_16_20",
    rating: null,
    message: "I dont know what career twin even does",
    signedIn: true,
    submittedAt: SENT,
    ...overrides,
  };
}

describe("notification content", () => {
  it("leads the subject with what happened and where", () => {
    const { subject } = buildFeedbackNotification(input());
    expect(subject).toBe("Something confused me — Career Twin");
  });

  it("puts the young person's actual words in the body", () => {
    const { text, html } = buildFeedbackNotification(input());
    expect(text).toContain("I dont know what career twin even does");
    expect(html).toContain("I dont know what career twin even does");
  });

  it("says so plainly when there is a rating but nothing written", () => {
    const { subject, text } = buildFeedbackNotification(
      input({ kind: null, area: null, message: null, rating: 4 })
    );
    expect(subject).toBe("New rating");
    expect(text).toContain("No written message");
    expect(text).toContain("★★★★☆");
  });

  it("falls back to a neutral subject when there is nothing to characterise it", () => {
    const { subject } = buildFeedbackNotification(
      input({ kind: null, area: null, rating: null })
    );
    expect(subject).toBe("New feedback");
  });

  it("links to the portal", () => {
    const { text, html } = buildFeedbackNotification(input());
    expect(text).toContain("/admin/feedback");
    expect(html).toContain("/admin/feedback");
  });
});

describe("data minimisation", () => {
  // The submitter may be fifteen. The email carries what is needed to triage
  // and nothing that identifies them.
  it("never contains an email address or display name", () => {
    const { text, html } = buildFeedbackNotification(input());
    for (const body of [text, html]) {
      expect(body).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    }
  });

  it("reports only whether the submitter was signed in", () => {
    expect(buildFeedbackNotification(input({ signedIn: true })).text).toContain(
      "Account: Signed in"
    );
    expect(buildFeedbackNotification(input({ signedIn: false })).text).toContain(
      "Account: Anonymous"
    );
  });

  it("includes only a short id prefix, never the whole record id", () => {
    const { text } = buildFeedbackNotification(input());
    expect(text).toContain("Ref: 1f2e3d4c");
    expect(text).not.toContain("1f2e3d4c-aaaa-bbbb-cccc-000000000000");
  });
});

describe("hostile input", () => {
  it("escapes HTML so feedback text can't inject markup into the email", () => {
    const { html } = buildFeedbackNotification(
      input({ message: '<img src=x onerror="alert(1)">' })
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });

  it("keeps the plain-text part unescaped and readable", () => {
    const { text } = buildFeedbackNotification(input({ message: "a < b & c" }));
    expect(text).toContain("a < b & c");
  });

  it.each([0, 6, -1, 99])("ignores an out-of-range rating (%i)", (rating) => {
    const { text } = buildFeedbackNotification(input({ rating, message: null }));
    expect(text).not.toContain("★");
  });
});

describe("recipient resolution", () => {
  const original = { ...process.env };
  beforeEach(() => {
    delete process.env.FEEDBACK_NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
  });
  afterEach(() => {
    process.env = { ...original };
  });

  it("prefers the dedicated var", () => {
    process.env.FEEDBACK_NOTIFY_TO = "feedback@example.com";
    process.env.ADMIN_EMAIL = "admin@example.com";
    expect(feedbackRecipient()).toBe("feedback@example.com");
  });

  it("falls back to the existing ADMIN_EMAIL", () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    expect(feedbackRecipient()).toBe("admin@example.com");
  });

  it("returns null when unset, so notifications disable rather than error", () => {
    expect(feedbackRecipient()).toBeNull();
  });

  it("rejects a value that isn't an address", () => {
    process.env.FEEDBACK_NOTIFY_TO = "not-an-email";
    expect(feedbackRecipient()).toBeNull();
  });
});

describe("notifyNewFeedback never throws", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("reports NO_RECIPIENT instead of failing when unconfigured", async () => {
    delete process.env.FEEDBACK_NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
    await expect(notifyNewFeedback(input())).resolves.toEqual({
      sent: false,
      reason: "NO_RECIPIENT",
    });
  });

  it("swallows a throwing mail transport", async () => {
    process.env.FEEDBACK_NOTIFY_TO = "feedback@example.com";
    vi.resetModules();
    vi.doMock("@/lib/mail", () => ({
      sendMail: vi.fn().mockRejectedValue(new Error("SMTP exploded")),
    }));
    const { notifyNewFeedback: fresh } = await import("../feedback-notify");
    const result = await fresh(input());
    expect(result).toEqual({ sent: false, reason: "MAIL_FAILED", error: "SMTP exploded" });
  });

  it("reports MAIL_SKIPPED when Resend isn't configured", async () => {
    process.env.FEEDBACK_NOTIFY_TO = "feedback@example.com";
    vi.resetModules();
    vi.doMock("@/lib/mail", () => ({
      sendMail: vi.fn().mockResolvedValue({ ok: true, skipped: true }),
    }));
    const { notifyNewFeedback: fresh } = await import("../feedback-notify");
    await expect(fresh(input())).resolves.toEqual({ sent: false, reason: "MAIL_SKIPPED" });
  });

  it("reports success with the provider id", async () => {
    process.env.FEEDBACK_NOTIFY_TO = "feedback@example.com";
    vi.resetModules();
    vi.doMock("@/lib/mail", () => ({
      sendMail: vi.fn().mockResolvedValue({ ok: true, id: "re_123" }),
    }));
    const { notifyNewFeedback: fresh } = await import("../feedback-notify");
    await expect(fresh(input())).resolves.toEqual({ sent: true, id: "re_123" });
  });
});

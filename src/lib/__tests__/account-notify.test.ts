import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Operator notifications for sign-ups and sign-ins.
 *
 * What's pinned here is the behaviour that protects people rather than the
 * copy: the operator's own sign-ins are not reported back to them, the only
 * personal field that ever leaves is the address itself, and a broken mailbox
 * can never throw into a signup or a login.
 */

const sent: { to: string; subject: string; text: string; html: string }[] = [];
let mailResult: { ok: boolean; skipped?: boolean; id?: string; error?: string } = {
  ok: true,
  id: "msg_1",
};
let mailThrows = false;

vi.mock("@/lib/mail", () => ({
  sendMail: vi.fn(async (args: { to: string; subject: string; text: string; html: string }) => {
    if (mailThrows) throw new Error("provider exploded");
    sent.push(args);
    return mailResult;
  }),
}));

import {
  buildAccountNotification,
  notifyAccountEvent,
  accountRecipient,
  isSelf,
} from "@/lib/account-notify";

const OPERATOR = "owner@endeavrly.com";
const AT = new Date("2026-09-01T12:34:56Z");

beforeEach(() => {
  sent.length = 0;
  mailResult = { ok: true, id: "msg_1" };
  mailThrows = false;
  process.env.ACCOUNT_NOTIFY_TO = OPERATOR;
});

afterEach(() => {
  delete process.env.ACCOUNT_NOTIFY_TO;
});

describe("recipient resolution", () => {
  it("uses ACCOUNT_NOTIFY_TO when set", () => {
    expect(accountRecipient()).toBe(OPERATOR);
  });

  it("returns null rather than a bogus address when unset", () => {
    delete process.env.ACCOUNT_NOTIFY_TO;
    const prevFeedback = process.env.FEEDBACK_NOTIFY_TO;
    const prevAdmin = process.env.ADMIN_EMAIL;
    delete process.env.FEEDBACK_NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
    try {
      expect(accountRecipient()).toBeNull();
    } finally {
      if (prevFeedback) process.env.FEEDBACK_NOTIFY_TO = prevFeedback;
      if (prevAdmin) process.env.ADMIN_EMAIL = prevAdmin;
    }
  });
});

describe("self-detection", () => {
  it("matches the operator regardless of case or padding", () => {
    expect(isSelf("  Owner@Endeavrly.COM ", OPERATOR)).toBe(true);
  });

  it("does not match a different address", () => {
    expect(isSelf("someone@else.com", OPERATOR)).toBe(false);
  });
});

describe("notifyAccountEvent", () => {
  it("does NOT report the operator's own sign-in back to them", async () => {
    const outcome = await notifyAccountEvent({ kind: "signin", email: OPERATOR });
    expect(outcome).toEqual({ sent: false, reason: "SELF" });
    expect(sent).toHaveLength(0);
  });

  it("still reports the operator's own SIGN-UP (a one-off worth seeing)", async () => {
    const outcome = await notifyAccountEvent({ kind: "signup", email: OPERATOR });
    expect(outcome.sent).toBe(true);
  });

  it("notifies for anyone else signing in", async () => {
    const outcome = await notifyAccountEvent({ kind: "signin", email: "teen@example.com" });
    expect(outcome.sent).toBe(true);
    expect(sent[0].to).toBe(OPERATOR);
    expect(sent[0].subject).toContain("teen@example.com");
  });

  it("does nothing when no recipient is configured", async () => {
    delete process.env.ACCOUNT_NOTIFY_TO;
    const prevFeedback = process.env.FEEDBACK_NOTIFY_TO;
    const prevAdmin = process.env.ADMIN_EMAIL;
    delete process.env.FEEDBACK_NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
    try {
      const outcome = await notifyAccountEvent({ kind: "signup", email: "a@b.com" });
      expect(outcome).toEqual({ sent: false, reason: "NO_RECIPIENT" });
      expect(sent).toHaveLength(0);
    } finally {
      if (prevFeedback) process.env.FEEDBACK_NOTIFY_TO = prevFeedback;
      if (prevAdmin) process.env.ADMIN_EMAIL = prevAdmin;
    }
  });

  it("reports a skipped send rather than claiming success", async () => {
    mailResult = { ok: true, skipped: true };
    const outcome = await notifyAccountEvent({ kind: "signup", email: "a@b.com" });
    expect(outcome).toEqual({ sent: false, reason: "MAIL_SKIPPED" });
  });

  it("never throws when the provider does", async () => {
    mailThrows = true;
    const outcome = await notifyAccountEvent({ kind: "signup", email: "a@b.com" });
    expect(outcome.sent).toBe(false);
    if (!outcome.sent) expect(outcome.reason).toBe("MAIL_FAILED");
  });
});

describe("message contents", () => {
  it("carries the address and nothing else identifying", () => {
    const { text, subject } = buildAccountNotification({
      kind: "signup",
      email: "teen@example.com",
      role: "YOUTH",
      country: "NO",
      at: AT,
    });
    expect(subject).toBe("New sign-up — teen@example.com");
    expect(text).toContain("teen@example.com");
    expect(text).toContain("YOUTH");
    expect(text).toContain("NO");
    // No IP, device, user-agent or location may appear.
    expect(text).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    expect(text.toLowerCase()).not.toContain("user-agent");
  });

  it("distinguishes a sign-in from a sign-up", () => {
    const signin = buildAccountNotification({ kind: "signin", email: "a@b.com", at: AT });
    expect(signin.subject).toBe("Sign-in — a@b.com");
    expect(signin.text).toContain("signed in");
  });

  it("escapes HTML so an address can't inject markup", () => {
    const { html } = buildAccountNotification({
      kind: "signup",
      email: '"><script>alert(1)</script>@x.com',
      at: AT,
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

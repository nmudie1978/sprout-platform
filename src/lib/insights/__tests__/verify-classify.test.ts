import { describe, it, expect } from "vitest";
import {
  classifyVerification,
  isLoginWall,
  MIN_BODY_LENGTH,
} from "../verify-classify";

const bigBody = "x".repeat(MIN_BODY_LENGTH + 100);

describe("classifyVerification", () => {
  describe("genuinely dead statuses (404 / 410)", () => {
    it("404 is failed even for a trusted domain", () => {
      expect(
        classifyVerification({ status: 404, trusted: true, contentType: "article" }),
      ).toBe("failed");
    });

    it("410 is failed even for a trusted domain", () => {
      expect(
        classifyVerification({ status: 410, trusted: true, contentType: "article" }),
      ).toBe("failed");
    });

    it("404 is failed for an untrusted domain", () => {
      expect(
        classifyVerification({ status: 404, trusted: false, contentType: "article" }),
      ).toBe("failed");
    });
  });

  describe("bot-block / transient statuses depend on trust", () => {
    it("403 from a trusted domain is verified (the WEF/OECD anti-bot fix)", () => {
      expect(
        classifyVerification({ status: 403, trusted: true, contentType: "article" }),
      ).toBe("verified");
    });

    it("403 from an untrusted domain is failed", () => {
      expect(
        classifyVerification({ status: 403, trusted: false, contentType: "article" }),
      ).toBe("failed");
    });

    it("429 from a trusted domain is verified", () => {
      expect(
        classifyVerification({ status: 429, trusted: true, contentType: "article" }),
      ).toBe("verified");
    });

    it("401 from a trusted domain is verified", () => {
      expect(
        classifyVerification({ status: 401, trusted: true, contentType: "article" }),
      ).toBe("verified");
    });

    it("503 from a trusted domain is verified (momentary server error)", () => {
      expect(
        classifyVerification({ status: 503, trusted: true, contentType: "article" }),
      ).toBe("verified");
    });

    it("503 from an untrusted domain is failed", () => {
      expect(
        classifyVerification({ status: 503, trusted: false, contentType: "article" }),
      ).toBe("failed");
    });
  });

  describe("2xx without a body (HEAD path)", () => {
    it("200 trusted, no body, is verified", () => {
      expect(
        classifyVerification({ status: 200, trusted: true, contentType: "article" }),
      ).toBe("verified");
    });

    it("200 untrusted, no body, is verified", () => {
      expect(
        classifyVerification({ status: 200, trusted: false, contentType: "article" }),
      ).toBe("verified");
    });
  });

  describe("2xx with a body — content sanity", () => {
    it("200 untrusted with a healthy body is verified", () => {
      expect(
        classifyVerification({
          status: 200,
          trusted: false,
          contentType: "article",
          body: bigBody,
          responseContentType: "text/html",
        }),
      ).toBe("verified");
    });

    it("200 untrusted with a tiny body is failed (soft 404)", () => {
      expect(
        classifyVerification({
          status: 200,
          trusted: false,
          contentType: "article",
          body: "tiny",
          responseContentType: "text/html",
        }),
      ).toBe("failed");
    });

    it("200 trusted with a tiny body is still failed (soft 404 guard applies to all)", () => {
      expect(
        classifyVerification({
          status: 200,
          trusted: true,
          contentType: "article",
          body: "tiny",
          responseContentType: "text/html",
        }),
      ).toBe("failed");
    });

    it("login wall fails an untrusted domain", () => {
      const body = '<html><body><form id="login-form"></form>' + bigBody + "</body></html>";
      expect(
        classifyVerification({
          status: 200,
          trusted: false,
          contentType: "article",
          body,
          responseContentType: "text/html",
          headers: new Headers(),
        }),
      ).toBe("failed");
    });

    it("login-wall heuristic is ignored for trusted domains (too noisy)", () => {
      const body = "<html><script>window.location='/x'</script>" + bigBody + "</html>";
      expect(
        classifyVerification({
          status: 200,
          trusted: true,
          contentType: "article",
          body,
          responseContentType: "text/html",
          headers: new Headers(),
        }),
      ).toBe("verified");
    });

    it("pdf expected but response is an image is failed", () => {
      expect(
        classifyVerification({
          status: 200,
          trusted: false,
          contentType: "pdf",
          body: bigBody,
          responseContentType: "image/png",
        }),
      ).toBe("failed");
    });

    it("pdf expected and response is html is allowed", () => {
      expect(
        classifyVerification({
          status: 200,
          trusted: false,
          contentType: "pdf",
          body: bigBody,
          responseContentType: "text/html",
        }),
      ).toBe("verified");
    });
  });
});

describe("isLoginWall", () => {
  it("detects a login form in the body", () => {
    expect(isLoginWall(new Headers(), '<div id="login-form">')).toBe(true);
  });

  it("detects an auth redirect in the location header", () => {
    const h = new Headers();
    h.set("location", "https://site.com/signin?next=/x");
    expect(isLoginWall(h)).toBe(true);
  });

  it("returns false for an ordinary page", () => {
    expect(isLoginWall(new Headers(), "<h1>Future of Jobs Report</h1>")).toBe(false);
  });
});

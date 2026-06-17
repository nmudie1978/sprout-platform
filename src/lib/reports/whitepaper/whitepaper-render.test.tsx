import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { WhitepaperDocument } from "./whitepaper-document";

describe("whitepaper PDF", () => {
  it("renders a 4-page document", async () => {
    const buf = await renderToBuffer(<WhitepaperDocument />);
    expect(buf.length).toBeGreaterThan(3000);
    const pages = (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    expect(pages).toBe(4);
  });
});

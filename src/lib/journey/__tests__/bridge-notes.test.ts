import { describe, it, expect } from "vitest";
import {
  applyBranchNote,
  sanitizeBranchId,
  sanitizeNote,
  readBridgeNotes,
  MAX_NOTE_LEN,
  MAX_NOTES,
} from "../bridge-notes";

describe("bridge-notes helpers", () => {
  it("sanitizes branch ids to [a-z0-9-]", () => {
    expect(sanitizeBranchId("workplace-nav")).toBe("workplace-nav");
    expect(sanitizeBranchId("Proof!! ")).toBe("proof");
    expect(sanitizeBranchId("")).toBeNull();
    expect(sanitizeBranchId(42)).toBeNull();
  });

  it("trims, collapses whitespace and caps note length", () => {
    expect(sanitizeNote("  hi   there  ")).toBe("hi there");
    expect(sanitizeNote("x".repeat(MAX_NOTE_LEN + 50)).length).toBe(MAX_NOTE_LEN);
    expect(sanitizeNote(123)).toBe("");
  });

  it("adds, edits and clears a branch note", () => {
    let n = applyBranchNote({}, "proof", "Start with the café rebrand shots");
    expect(n.proof).toBe("Start with the café rebrand shots");
    n = applyBranchNote(n, "proof", "Updated note");
    expect(n.proof).toBe("Updated note");
    n = applyBranchNote(n, "proof", "   "); // clear
    expect(n.proof).toBeUndefined();
    expect(Object.keys(n)).toHaveLength(0);
  });

  it("caps the number of distinct noted branches but still allows edits", () => {
    let n: Record<string, string> = {};
    for (let i = 0; i < MAX_NOTES + 5; i++) n = applyBranchNote(n, `b${i}`, `note ${i}`);
    expect(Object.keys(n)).toHaveLength(MAX_NOTES);
    // editing an existing one still works
    const firstKey = Object.keys(n)[0];
    n = applyBranchNote(n, firstKey, "edited");
    expect(n[firstKey]).toBe("edited");
  });

  it("readBridgeNotes drops junk and keeps valid entries", () => {
    expect(readBridgeNotes({ proof: "ok", "  ": "x", bad: 5 })).toEqual({ proof: "ok" });
    expect(readBridgeNotes(null)).toEqual({});
    expect(readBridgeNotes("nope")).toEqual({});
  });
});

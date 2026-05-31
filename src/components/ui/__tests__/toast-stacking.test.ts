/**
 * Stacking-order contract: toasts must render ABOVE modal dialogs.
 *
 * The Career Radar career-detail modal is a Radix Dialog with a
 * `backdrop-blur-sm` overlay. When the toast viewport and the dialog
 * overlay share the same z-index, the portaled dialog overlay paints on
 * top of the toast, so success toasts ("Set as Primary Goal!") appear
 * blurred and hidden behind the modal. This test guards the invariant by
 * parsing the z-index out of each component's source.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

function firstZIndex(relPath: string): number {
  const src = readFileSync(join(process.cwd(), relPath), "utf-8");
  const m = src.match(/z-\[(\d+)\]/);
  expect(m, `expected a z-[N] class in ${relPath}`).not.toBeNull();
  return Number(m![1]);
}

describe("toast vs dialog stacking order", () => {
  it("toast viewport sits strictly above the dialog overlay", () => {
    const toastZ = firstZIndex("src/components/ui/toast.tsx");
    const dialogZ = firstZIndex("src/components/ui/dialog.tsx");
    expect(toastZ).toBeGreaterThan(dialogZ);
  });
});

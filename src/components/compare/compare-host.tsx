"use client";

/**
 * CompareHost — the single, global owner of the Compare experience.
 *
 * Mounted once in the dashboard layout so it works on every surface, not just
 * the Career Radar. It:
 *   - reads the shared, persistent compare shortlist;
 *   - shows the "you now have 3 — compare?" prompt the moment an add crosses up
 *     to the max, no matter which surface added it (the prompt keys off the
 *     shared store's count, not any single event);
 *   - off the radar, handles the career modal's "add-career-to-compare" event
 *     and renders the floating compare pill;
 *   - owns a Compare modal that the prompt (or an `open-compare-modal` event)
 *     can open in place.
 *
 * Route-aware: on /careers/radar the radar already renders its own compare UI
 * and handles the add event, so the host suppresses its pill + event listener
 * there to avoid duplicates — but still shows the prompt + modal.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCompareShortlist } from "@/hooks/use-compare-shortlist";
import { CompareModal } from "@/components/compare/compare-modal";
import { FloatingCompareCTA } from "@/components/compare/floating-compare-cta";
import { shouldPromptForCompare } from "@/lib/compare/shortlist-store";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import type { Career } from "@/lib/career-pathways";

const RADAR_PATH = "/careers/radar";

export function CompareHost() {
  const pathname = usePathname();
  const isRadar = pathname?.startsWith(RADAR_PATH) ?? false;

  const { shortlist, add, remove, clear, max, isInShortlist } = useCompareShortlist();
  const [modalOpen, setModalOpen] = useState(false);

  // Seeded to the current count so a pre-filled shortlist never prompts on load.
  const prevCount = useRef(shortlist.length);

  // When an add lands on the max, nudge with a NON-BLOCKING toast (not a modal
  // dialog). A toast can't trap focus, so it never deadlocks on top of the
  // already-open career detail dialog the add came from — which previously
  // froze the whole tab when two trapped Radix focus scopes fought.
  useEffect(() => {
    const next = shortlist.length;
    if (shouldPromptForCompare(prevCount.current, next, max)) {
      toast({
        title: `You now have ${max} careers to compare.`,
        description: "Want to see them side by side?",
        action: (
          <ToastAction altText="Open the compare view" onClick={() => setModalOpen(true)}>
            Compare
          </ToastAction>
        ),
      });
    }
    prevCount.current = next;
  }, [shortlist.length, max]);

  // Off the radar, own the career modal's "add to compare" event. (On the radar
  // the radar handles it; suppress here so we don't double-add/double-toast.)
  useEffect(() => {
    if (isRadar) return;
    const handler = (e: Event) => {
      const career = (e as CustomEvent<Career>).detail;
      if (!career) return;
      if (isInShortlist(career.id)) {
        toast({ title: `${career.title} is already in your shortlist` });
        return;
      }
      const result = add(career);
      if (result === "full") {
        toast({
          title: `You can compare up to ${max} at a time`,
          description: "Remove one to add another.",
        });
      } else if (result === "added") {
        toast({ title: `${career.title} added to shortlist`, variant: "success" });
      }
    };
    window.addEventListener("add-career-to-compare", handler);
    return () => window.removeEventListener("add-career-to-compare", handler);
  }, [isRadar, add, isInShortlist, max]);

  // Let any surface request opening the compare modal in place.
  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener("open-compare-modal", open);
    return () => window.removeEventListener("open-compare-modal", open);
  }, []);

  return (
    <>
      {!isRadar && shortlist.length > 0 && (
        <FloatingCompareCTA
          shortlist={shortlist}
          max={max}
          onCompare={() => setModalOpen(true)}
          onClear={clear}
        />
      )}

      {/* preferences=null: the global host has no radar preference context, so
          the modal renders the full comparison minus preference-relative
          highlighting. (Follow-up: feed the user's discoveryPreferences here.) */}
      <CompareModal
        open={modalOpen}
        careers={shortlist}
        preferences={null}
        onClose={() => setModalOpen(false)}
        onRemove={remove}
      />
    </>
  );
}

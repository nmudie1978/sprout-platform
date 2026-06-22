/**
 * Dev preview — Bridge Routes Mindmap.
 *
 * Renders the deterministic mindmap for two personas so it can be eyeballed
 * (and screenshotted via headless Chrome) without auth. Not linked anywhere.
 *
 * Visit: /dev/bridge-mindmap
 */

"use client";

import { buildBridgeMindmap } from "../../../lib/journey/build-bridge-mindmap";
import type { BridgeInput } from "../../../lib/journey/bridge-mindmap-types";
import { CareerTransitionMap } from "../../../components/journey/career-transition-map/career-transition-map";

const PERSONAS: { name: string; input: BridgeInput }[] = [
  {
    name: "Career-changer · Interior Design → Project Manager · with NAV · stuck on callbacks · tried course+applications",
    input: {
      previousOccupation: "Interior designer",
      targetCareer: "Project Manager",
      withNav: true,
      triedRoutes: ["course", "applications"],
      blocker: "no-callbacks",
    },
  },
  {
    name: "Out of work · no occupation given · no NAV · no experience · nothing tried",
    input: {
      previousOccupation: null,
      targetCareer: "Software Developer",
      withNav: false,
      triedRoutes: [],
      blocker: "no-experience",
    },
  },
];

export default function BridgeMindmapDevPage() {
  return (
    <div className="space-y-10 p-6">
      <h1 className="text-xl font-semibold">Career Transition Map — preview</h1>
      {PERSONAS.map((p) => (
        <section key={p.name} className="space-y-3">
          <h2 className="text-sm text-muted-foreground">{p.name}</h2>
          <div className="h-[640px] rounded-2xl border bg-card p-4">
            <CareerTransitionMap
              model={buildBridgeMindmap(p.input)}
              targetCareer={p.input.targetCareer}
              previousOccupation={p.input.previousOccupation}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

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
import { BridgeMindmapView } from "../../../components/journey/bridge-routes-mindmap";

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
    <div className="space-y-10">
      <h1 className="text-xl font-semibold">Bridge Routes Mindmap — preview</h1>
      {PERSONAS.map((p) => (
        <section key={p.name} className="space-y-3">
          <h2 className="text-sm text-muted-foreground">{p.name}</h2>
          <div className="rounded-2xl border bg-card p-4">
            <BridgeMindmapView model={buildBridgeMindmap(p.input)} />
          </div>
        </section>
      ))}
    </div>
  );
}

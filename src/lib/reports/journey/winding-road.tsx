import React from "react";
import { View, Text, Svg, Path, Circle, G } from "@react-pdf/renderer";
import { palette, stageColors, type } from "./theme";
import type { RoadmapSection } from "./types";
import { layoutWindingRoad, truncate } from "./winding-road-layout";

// Report content width (A4 width − 2× horizontal margin). The road fills it.
const ROAD_WIDTH = 491;

/**
 * The Clarity-tab "Winding Road" roadmap, redrawn natively in @react-pdf and
 * styled for the clean report ground. Steps snake left→right then wrap to the
 * next row right→left, so the whole journey fits on one page — never chopped.
 *
 * Geometry is computed by the pure `layoutWindingRoad`; here we turn it into
 * an SVG road + stage-coloured nodes, with a centred title + age/year label
 * under each node.
 */
export function WindingRoad({ data }: { data: RoadmapSection }) {
  const items = data.items;
  if (items.length === 0) return null;

  // Reserve less height when a "Learning track" section follows on the same page.
  const maxHeight = data.schoolTrack.length > 0 ? 300 : 540;
  const layout = layoutWindingRoad(items.length, { width: ROAD_WIDTH, maxHeight });
  const s = layout.scale;

  return (
    <View
      style={{
        width: layout.width,
        height: layout.height,
        position: "relative",
        marginBottom: 6,
      }}
      wrap={false}
    >
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: layout.width, height: layout.height }}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
      >
        {/* The road itself — a soft slate stroke with rounded turns. */}
        <Path
          d={layout.path}
          stroke={palette.hairline}
          strokeWidth={3 * s}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Nodes, drawn on top of the road. */}
        {layout.nodes.map((nd, i) => {
          const step = items[i];
          const accent = stageColors[step.stage].accent;
          const r = (step.isMilestone ? 9.5 : 6.5) * s;
          return (
            <G key={i}>
              {/* White halo lifts the node off the road line. */}
              <Circle cx={nd.cx} cy={nd.cy} r={r + 2.6 * s} fill={palette.surface} />
              <Circle cx={nd.cx} cy={nd.cy} r={r} fill={accent} />
              {step.isMilestone && (
                <Circle cx={nd.cx} cy={nd.cy} r={3 * s} fill={palette.surface} />
              )}
            </G>
          );
        })}
      </Svg>

      {/* Labels — centred beneath each node. Positioned in the same point
          space as the SVG (the parent View is sized to the layout). */}
      {layout.nodes.map((nd, i) => {
        const step = items[i];
        const r = (step.isMilestone ? 9.5 : 6.5) * s;
        const startYear = data.birthYear != null ? data.birthYear + step.startAge : null;
        const endYear =
          data.birthYear != null && step.endAge != null ? data.birthYear + step.endAge : null;
        const ageLabel = step.endAge
          ? `Age ${step.startAge}–${step.endAge}`
          : `Age ${step.startAge}`;
        const yearLabel = startYear
          ? endYear && endYear !== startYear
            ? `${startYear}–${endYear}`
            : `${startYear}`
          : undefined;

        const labelWidth = layout.colWidth - 6 * s;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: nd.cx - labelWidth / 2,
              top: nd.cy + r + 5 * s,
              width: labelWidth,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: type.heading.family,
                fontWeight: type.heading.weight,
                fontSize: 7.5 * s,
                lineHeight: 1.2,
                color: palette.ink,
                textAlign: "center",
              }}
            >
              {truncate(step.title, 48)}
            </Text>
            <Text
              style={{
                // Poppins SemiBold (type.heading) — the report's lighter faces
                // (Inter / Poppins Medium) render blank in the PDF engine at
                // these sizes, so the proven face is used and toned down via a
                // muted colour instead of a lighter weight.
                fontFamily: type.heading.family,
                fontWeight: type.heading.weight,
                fontSize: 6 * s,
                color: palette.subtle,
                letterSpacing: 0.2,
                textAlign: "center",
                marginTop: 2 * s,
              }}
            >
              {ageLabel}
              {yearLabel ? `  ·  ${yearLabel}` : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

import React from "react";
import { Page, Text, View, Svg, Line, Rect, Circle, Path } from "@react-pdf/renderer";
import { motifState, palette, styles, type } from "./theme";

/**
 * Faint constellation of connected dots — the white-paper variant's
 * recurring motif. Rendered in the top-right corner of every content
 * page at low opacity so it never fights the body copy. The dot
 * positions are hand-tuned into a rough polygonal network; @react-pdf
 * doesn't support CSS `opacity` on SVG primitives uniformly, so we
 * rely on explicit per-element fill-/stroke-opacity.
 */
function ConstellationMotif({ color = palette.accent }: { color?: string }) {
  const lines: Array<[number, number, number, number]> = [
    [12, 8, 36, 20],
    [36, 20, 60, 6],
    [60, 6, 78, 24],
    [36, 20, 50, 44],
    [50, 44, 78, 24],
    [50, 44, 30, 56],
    [30, 56, 12, 40],
    [12, 40, 36, 20],
    [50, 44, 72, 52],
  ];
  const dots: Array<[number, number]> = [
    [12, 8],
    [36, 20],
    [60, 6],
    [78, 24],
    [50, 44],
    [30, 56],
    [12, 40],
    [72, 52],
  ];
  return (
    <Svg viewBox="0 0 90 64" style={{ width: 110, height: 78 }}>
      {lines.map(([x1, y1, x2, y2], i) => (
        <Line
          key={`l-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={0.35}
          strokeOpacity={0.55}
        />
      ))}
      {dots.map(([cx, cy], i) => (
        <Circle
          key={`d-${i}`}
          cx={cx}
          cy={cy}
          r={1}
          fill={color}
          fillOpacity={0.8}
        />
      ))}
    </Svg>
  );
}

/**
 * Reusable PDF primitives for the Journey Report — editorial edition.
 *
 * Preference order for separating content:
 *   1. Typographic hierarchy (heading sizes, weights, spacing).
 *   2. Hairline rules above labels (EditorialBlock).
 *   3. Subtle surface fills, used for emphasis (InsightCard / Callout).
 *   4. Strong fills — reserved for the cover and closing bookends.
 *
 * Components that end up on every content page (Running head, Footer)
 * live in PageFrame; components inside the content flow sit below.
 */

// ── Running-head brand mark ────────────────────────────────────────

function BrandMark({ color = palette.accent }: { color?: string }) {
  // Compact monogram — a calm triangular wedge. Stays under 10pt tall so
  // it never competes with the running head type.
  return (
    <Svg style={{ width: 9, height: 9 }} viewBox="0 0 20 20">
      <Path
        d="M10 2 L18 18 L10 13 L2 18 Z"
        fill={color}
      />
    </Svg>
  );
}
// ── Page frame: running head + content + footer ────────────────────

export function PageFrame({
  children,
  sectionLabel,
  pageNumber,
  totalPages,
  // Left in signature for backwards compatibility; the mosaic
  // background is dropped in the editorial redesign — the plain
  // ivory ground does the work.
  background: _background = true,
}: {
  children: React.ReactNode;
  sectionLabel?: string;
  pageNumber?: number;
  totalPages?: number;
  background?: boolean;
}) {
  // Suppress unused lint without making the rename load-bearing.
  void _background;
  const showConstellation = motifState.pageMotif === "constellation";
  return (
    <Page size="A4" style={styles.page}>
      {showConstellation ? (
        <View
          fixed
          style={{
            position: "absolute",
            top: 18,
            right: 22,
          }}
        >
          <ConstellationMotif color={palette.accent} />
        </View>
      ) : null}

      <View style={styles.pageHeader} fixed>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <BrandMark />
          <Text style={styles.pageHeaderText}>Endeavrly</Text>
        </View>
        {sectionLabel ? (
          <Text style={styles.pageHeaderText}>{sectionLabel}</Text>
        ) : null}
      </View>

      {children}

      <View
        fixed
        style={{
          position: "absolute",
          bottom: 40,
          left: 52,
          right: 52,
          height: 0.5,
          backgroundColor: palette.hairline,
        }}
      />
      <View style={styles.pageFooter} fixed>
        <Text style={styles.pageFooterText}>{motifState.footerBrand}</Text>
        {typeof pageNumber === "number" && (
          <Text style={styles.pageFooterText}>
            {`${pageNumber}${typeof totalPages === "number" ? `  /  ${totalPages}` : ""}`}
          </Text>
        )}
      </View>
    </Page>
  );
}

// ── Section header: large title + lead + rule.
//    The section name already appears in the running head (top
//    right of every page via PageFrame). Rendering it a second time
//    as an overline above the title was redundant — the `eyebrow`
//    prop is accepted for backwards compatibility but no longer
//    drawn, so callers don't have to change.

export function SectionHeader({
  eyebrow: _eyebrow,
  title,
  lead,
}: {
  /** Legacy — the running head carries the section name now. */
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  void _eyebrow;
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.displayL}>{title}</Text>
      {/* Short teal accent bar directly under the page title. Editorial
          convention — a single coloured mark that carries the brand
          without overpowering the headline. Matches the cover page's
          underline mark and the active-tab teal on the web app. */}
      <View
        style={{
          height: 2.25,
          width: 40,
          backgroundColor: palette.accent,
          marginTop: 10,
        }}
      />
      {lead ? (
        <Text style={[styles.lead, { marginTop: 12, maxWidth: 440 }]}>{lead}</Text>
      ) : null}
      <View style={{ height: 18 }} />
      <View style={styles.rule} />
    </View>
  );
}

// ── Editorial block — hairline rule + label + content. The primary
//    structural unit for editorial-feel content. No card fill.

export function EditorialBlock({
  label,
  children,
  keepTogether = true,
}: {
  label: string;
  children: React.ReactNode;
  keepTogether?: boolean;
}) {
  return (
    <View style={{ marginBottom: 18 }} wrap={!keepTogether}>
      <View style={styles.ruleSoft} />
      <View style={{ height: 8 }} />
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

// ── Callout — reserved for moments that need emphasis. Soft accent
//    tint, left rule, generous padding.

export function Callout({
  label,
  children,
  tone = "accent",
}: {
  label?: string;
  children: React.ReactNode;
  tone?: "accent" | "muted" | "ink";
}) {
  const bg =
    tone === "accent"
      ? palette.accentSoft
      : tone === "ink"
        ? palette.surfaceDeep
        : palette.surfaceAlt;
  const textColor = tone === "ink" ? "#F8FAFC" : palette.ink;
  const labelColor = tone === "ink" ? palette.cover.muted : palette.subtle;
  const accentStripe = tone === "accent";
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 14,
        ...(accentStripe ? { borderLeftWidth: 2, borderLeftColor: palette.accent } : {}),
      }}
      wrap={false}
    >
      {label ? (
        <Text style={[styles.label, { color: labelColor, marginBottom: 6 }]}>{label}</Text>
      ) : null}
      <View>
        {typeof children === "string" ? (
          <Text style={[styles.body, { color: textColor, lineHeight: 1.62 }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

// ── Insight card — soft white surface with hairline border. Used when
//    grouping content in a 2-col row. Much quieter than the old card.

export function InsightCard({
  label,
  children,
  tone = "surface",
  fill,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "surface" | "accent" | "muted";
  fill?: boolean;
}) {
  const bg =
    tone === "accent" ? palette.accentSoft : tone === "muted" ? palette.surfaceAlt : palette.surface;
  const isAccent = tone === "accent";
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingVertical: fill ? 16 : 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        ...(isAccent
          ? { borderLeftWidth: 2, borderLeftColor: palette.accent }
          : { borderWidth: 0.5, borderColor: palette.hairline }),
      }}
      wrap={false}
    >
      <Text style={[styles.label, { marginBottom: 6 }]}>{label}</Text>
      {children}
    </View>
  );
}

// ── Stat strip — a row of headline stats. Each cell has a small
//    tracked label, a short accent underline, and a value in a
//    refined medium weight. No inter-column hairlines; generous
//    horizontal gap carries the separation. Values wrap naturally
//    inside their column so a long educationPath doesn't blow up
//    the other cells.

export function StatStrip({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 32,
        paddingTop: 20,
        paddingBottom: 22,
        borderTopWidth: 0.75,
        borderTopColor: palette.ink,
        borderBottomWidth: 0.5,
        borderBottomColor: palette.hairline,
        marginBottom: 24,
      }}
      wrap={false}
    >
      {items.map((item, i) => (
        <View key={i} style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 7,
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              color: palette.subtle,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {item.label}
          </Text>
          <View
            style={{
              width: 18,
              height: 1,
              backgroundColor: palette.accent,
              marginBottom: 10,
            }}
          />
          <Text
            style={{
              fontFamily: type.heading.family,
              fontWeight: type.subheading.weight,
              fontSize: 12,
              lineHeight: 1.4,
              color: palette.ink,
              letterSpacing: -0.15,
            }}
          >
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Key-value list — label left column, value right column, hairline
//    separators between rows. For "at a glance" factual blocks.

export function KeyValueList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ marginBottom: 14 }}>
      {items.map((row, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            paddingVertical: 9,
            borderBottomWidth: 0.5,
            borderBottomColor: palette.hairline,
            gap: 18,
            alignItems: "flex-start",
          }}
          wrap={false}
        >
          <Text
            style={{
              width: 130,
              fontSize: 9,
              color: palette.subtle,
              lineHeight: 1.5,
            }}
          >
            {row.label}
          </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 10,
              color: palette.ink,
              lineHeight: 1.55,
              fontFamily: type.heading.family,
              fontWeight: type.subheading.weight,
            }}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Timeline — vertical rail for the roadmap. Stage-coloured dot +
//    optional milestone ring, age/year stamp, title, stage tag, summary.
//    Rows never break across pages (wrap=false).

export type TimelineStage = "foundation" | "education" | "certification" | "experience" | "career";

export interface TimelineItemProps {
  stage: TimelineStage;
  stageLabel: string;
  stageColor: string;
  stageBg: string;
  stageInk: string;
  title: string;
  summary?: string;
  ageLabel: string;
  yearLabel?: string;
  isMilestone?: boolean;
  isLast?: boolean;
}

export function TimelineItem({
  stage: _stage,
  stageLabel,
  stageColor,
  stageBg,
  stageInk,
  title,
  summary,
  ageLabel,
  yearLabel,
  isMilestone,
  isLast,
}: TimelineItemProps) {
  void _stage;
  return (
    <View style={{ flexDirection: "row", minHeight: 60 }} wrap={false}>
      {/* Rail column — stage-coloured dot; milestones get a larger
          dot with a white halo ring drawn via an inner fill. */}
      <View style={{ width: 56, alignItems: "center" }}>
        {isMilestone ? (
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: stageColor,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 0,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#FFFFFF",
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: stageColor,
              marginTop: 3,
            }}
          />
        )}
        {!isLast && (
          <View
            style={{
              flex: 1,
              width: 0.75,
              backgroundColor: palette.hairline,
              marginTop: 6,
              marginBottom: 2,
            }}
          />
        )}
      </View>

      {/* Content column */}
      <View style={{ flex: 1, paddingBottom: isLast ? 4 : 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 4,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <Text
              style={{
                fontFamily: type.heading.family,
                fontWeight: type.heading.weight,
                fontSize: 11,
                color: palette.ink,
                lineHeight: 1.25,
                flex: 1,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 7,
                fontFamily: type.bodyStrong.family,
                fontWeight: type.bodyStrong.weight,
                color: stageInk,
                backgroundColor: stageBg,
                paddingHorizontal: 7,
                paddingVertical: 2,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              {stageLabel}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontSize: 8.5,
            color: palette.subtle,
            fontFamily: type.bodyStrong.family,
            fontWeight: type.bodyStrong.weight,
            letterSpacing: 0.2,
            marginBottom: summary ? 5 : 0,
          }}
        >
          {ageLabel}
          {yearLabel ? `  ·  ${yearLabel}` : ""}
        </Text>
        {summary ? (
          <Text
            style={{
              fontSize: 9.5,
              color: palette.body,
              lineHeight: 1.55,
              maxWidth: 400,
            }}
          >
            {summary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Stage legend — compact horizontal legend for the roadmap header.

export function StageLegend({
  stages,
}: {
  stages: Array<{ label: string; color: string }>;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 18, marginBottom: 22 }}>
      {stages.map((s, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: s.color,
            }}
          />
          <Text
            style={{
              fontSize: 8.5,
              color: palette.muted,
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              letterSpacing: 0.3,
            }}
          >
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Action list item — numbered, priority chip, headline + body.
//    Used for the "next moves" page.

export function ActionListItem({
  number,
  priorityLabel,
  priorityInk,
  priorityBg,
  headline,
  body,
  isLast,
}: {
  number: number;
  priorityLabel: string;
  priorityInk: string;
  priorityBg: string;
  headline: string;
  body: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: 14,
        gap: 16,
        ...(isLast ? {} : { borderBottomWidth: 0.5, borderBottomColor: palette.hairline }),
      }}
      wrap={false}
    >
      {/* Number */}
      <Text
        style={{
          width: 28,
          fontFamily: type.display.family,
          fontWeight: type.display.weight,
          fontSize: 18,
          color: palette.faint,
          lineHeight: 1,
          letterSpacing: -0.2,
          paddingTop: 2,
        }}
      >
        {String(number).padStart(2, "0")}
      </Text>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Text
            style={{
              fontSize: 7,
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              color: priorityInk,
              backgroundColor: priorityBg,
              paddingHorizontal: 8,
              paddingVertical: 2.5,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {priorityLabel}
          </Text>
          <Text
            style={{
              flex: 1,
              fontFamily: type.heading.family,
              fontWeight: type.heading.weight,
              fontSize: 11.5,
              color: palette.ink,
              letterSpacing: -0.1,
              lineHeight: 1.3,
            }}
          >
            {headline}
          </Text>
        </View>
        <Text style={[styles.body, { lineHeight: 1.62, color: palette.muted }]}>{body}</Text>
      </View>
    </View>
  );
}

// ── Thin rule (backwards compatible)

export function Rule({ soft = false }: { soft?: boolean }) {
  return (
    <View
      style={[
        soft ? styles.ruleSoft : styles.rule,
        { marginVertical: soft ? 10 : 18 },
      ]}
    />
  );
}

// ── Tag list (chips) — slightly quieter in the editorial design.

export function TagList({
  items,
  color = palette.accent,
  bg = palette.accentSoft,
  max,
}: {
  items: string[];
  color?: string;
  bg?: string;
  max?: number;
}) {
  const list = typeof max === "number" ? items.slice(0, max) : items;
  if (list.length === 0) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {list.map((item, i) => (
        <Text
          key={i}
          style={{
            fontSize: 8,
            fontFamily: type.bodyStrong.family,
            fontWeight: type.bodyStrong.weight,
            paddingHorizontal: 9,
            paddingVertical: 3,
            marginRight: 5,
            marginBottom: 5,
            color,
            backgroundColor: bg,
          }}
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

// ── Bullet list — hairline em-dash, generous leading.

export function BulletList({
  items,
  max,
}: {
  items: string[];
  max?: number;
}) {
  const list = typeof max === "number" ? items.slice(0, max) : items;
  if (list.length === 0) return null;
  return (
    <View>
      {list.map((item, i) => (
        <View
          key={i}
          style={{ flexDirection: "row", marginBottom: 6, alignItems: "flex-start" }}
        >
          <Text
            style={{
              fontSize: 10,
              color: palette.accent,
              marginRight: 8,
              marginTop: 0,
              fontFamily: type.heading.family,
              width: 10,
            }}
          >
            —
          </Text>
          <Text style={[styles.body, { flex: 1 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Pull-quote (user reflection) — editorial treatment.

export function QuoteBlock({ text, attribution }: { text: string; attribution?: string }) {
  if (!text) return null;
  return (
    <View
      style={{
        paddingLeft: 18,
        paddingVertical: 8,
        marginBottom: 14,
        borderLeftWidth: 1.5,
        borderLeftColor: palette.accent,
      }}
    >
      <Text
        style={{
          fontFamily: type.heading.family,
          fontWeight: type.subheading.weight,
          fontSize: 12,
          lineHeight: 1.58,
          color: palette.ink,
          letterSpacing: -0.1,
        }}
      >
        {`\u201C${text}\u201D`}
      </Text>
      {attribution ? (
        <Text style={{ fontSize: 8.5, color: palette.subtle, marginTop: 6 }}>
          — {attribution}
        </Text>
      ) : null}
    </View>
  );
}

// ── Pair block — label + value (kept for backwards compatibility).

export function Pair({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.body,
          {
            color: palette.ink,
            fontFamily: type.heading.family,
            fontWeight: type.subheading.weight,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Empty-state message — calm, neutral.

export function EmptyState({ message }: { message: string }) {
  return (
    <View
      style={{
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: palette.hairline,
        marginBottom: 12,
      }}
    >
      <Text style={[styles.body, { color: palette.muted, textAlign: "center" }]}>
        {message}
      </Text>
    </View>
  );
}

// ── Phase marker — numbered pill, kept for TOC compatibility.

export function PhaseMarker({
  n,
  label,
  color = palette.accent,
}: {
  n: number;
  label: string;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: type.heading.family,
            fontWeight: type.heading.weight,
            fontSize: 9,
            color: "#FFFFFF",
          }}
        >
          {n}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: type.heading.family,
          fontWeight: type.subheading.weight,
          fontSize: 11,
          color: palette.ink,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Hairline rule (SVG) — for cover/closing pages.

export function HairlineRule({
  width = 48,
  color = palette.accent,
  height = 2,
}: {
  width?: number;
  color?: string;
  height?: number;
}) {
  return (
    <Svg style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height} rx={1} fill={color} />
    </Svg>
  );
}

// ── Stage dot + connector (kept for backwards compatibility — the new
//    TimelineItem handles its own rail now).

export function StageDot({ color, milestone = false }: { color: string; milestone?: boolean }) {
  return (
    <Svg style={{ width: 18, height: 18 }}>
      {milestone ? (
        <>
          <Circle cx={9} cy={9} r={8} fill={color} fillOpacity={0.18} />
          <Circle cx={9} cy={9} r={5} fill={color} />
          <Circle cx={9} cy={9} r={2.2} fill="#FFFFFF" />
        </>
      ) : (
        <>
          <Circle cx={9} cy={9} r={6} fill={color} fillOpacity={0.18} />
          <Circle cx={9} cy={9} r={3.5} fill={color} />
        </>
      )}
    </Svg>
  );
}

export function ConnectorLine({ height = 48 }: { height?: number }) {
  return (
    <Svg style={{ width: 2, height }}>
      <Line x1={1} y1={0} x2={1} y2={height} stroke={palette.divider} strokeWidth={1} />
    </Svg>
  );
}

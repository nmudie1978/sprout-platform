import React from "react";
import { Page, Text, View, Svg, Line, Rect, Circle } from "@react-pdf/renderer";
import { palette, page as pageGeom, styles, type } from "./theme";

/**
 * Reusable PDF primitives for the Journey Report.
 *
 * These are the building blocks: every page is assembled from these
 * components plus lightweight page-specific composition. Nothing here
 * knows about the view model — they accept plain props.
 */

// ── Mosaic background ──────────────────────────────────────────────
// A full-bleed SVG backdrop: four soft-tinted rectangles (teal, violet,
// amber, blue) at very low opacity, arranged in a staggered grid across
// the top third of the page. The bottom two-thirds remain untinted so
// body content reads cleanly. Page number picks a deterministic rotation
// of the palette so adjacent pages don't look identical.

const MOSAIC_PALETTES: Array<[string, string, string, string]> = [
  ["#14B8A6", "#8B5CF6", "#F59E0B", "#3B82F6"], // teal · violet · amber · blue
  ["#F59E0B", "#14B8A6", "#3B82F6", "#8B5CF6"], // amber · teal · blue · violet
  ["#8B5CF6", "#F59E0B", "#14B8A6", "#3B82F6"], // violet · amber · teal · blue
];

/** The mosaic opacity is intentionally tiny (~0.045). Enough to feel
 *  like a tinted paper; never enough to bleed through text. Adjust
 *  with care — printers over-saturate light tints. */
const MOSAIC_OPACITY = 0.045;

function MosaicBackground({ rotation = 0 }: { rotation?: number }) {
  const pal = MOSAIC_PALETTES[rotation % MOSAIC_PALETTES.length];
  const w = pageGeom.width;
  return (
    <View
      fixed
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: w,
        height: pageGeom.height,
      }}
    >
      <Svg style={{ width: w, height: pageGeom.height }}>
        {/* Four staggered rectangles across the upper third. These are
            placed with deliberate offsets so no edge aligns with the
            page margin — the blur-like softness comes from that slight
            misalignment, not from a real blur (which @react-pdf can't
            render). */}
        <Rect x={0} y={0} width={w * 0.42} height={190} fill={pal[0]} fillOpacity={MOSAIC_OPACITY} />
        <Rect
          x={w * 0.42}
          y={0}
          width={w * 0.34}
          height={140}
          fill={pal[1]}
          fillOpacity={MOSAIC_OPACITY * 1.1}
        />
        <Rect
          x={w * 0.76}
          y={0}
          width={w * 0.24}
          height={190}
          fill={pal[2]}
          fillOpacity={MOSAIC_OPACITY * 0.9}
        />
        <Rect
          x={w * 0.42}
          y={140}
          width={w * 0.58}
          height={60}
          fill={pal[3]}
          fillOpacity={MOSAIC_OPACITY * 0.8}
        />

        {/* A wide, barely-there horizon band — anchors the eye and
            softens the transition to the plain bottom. */}
        <Rect
          x={0}
          y={pageGeom.height - 120}
          width={w}
          height={120}
          fill={pal[0]}
          fillOpacity={MOSAIC_OPACITY * 0.55}
        />
      </Svg>
    </View>
  );
}

// ── Page frame: consistent header rule + footer bar on every content page

export function PageFrame({
  children,
  sectionLabel,
  pageNumber,
  totalPages,
  background = true,
}: {
  children: React.ReactNode;
  sectionLabel?: string;
  pageNumber?: number;
  totalPages?: number;
  /** Set false to opt out of the mosaic backdrop (e.g. for pages that
   *  ship their own). Defaults to true. */
  background?: boolean;
}) {
  return (
    <Page size="A4" style={styles.page}>
      {background && <MosaicBackground rotation={(pageNumber ?? 0) % MOSAIC_PALETTES.length} />}
      {children}
      <View style={styles.pageFooter} fixed>
        <Text style={styles.pageFooterText}>
          {`Endeavrly  ·  My Journey Report${sectionLabel ? `  ·  ${sectionLabel}` : ""}`}
        </Text>
        {typeof pageNumber === "number" && (
          <Text style={styles.pageFooterText}>
            {`${pageNumber}${typeof totalPages === "number" ? `  /  ${totalPages}` : ""}`}
          </Text>
        )}
      </View>
    </Page>
  );
}

// ── Section header: eyebrow + large title + lead paragraph

export function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.displayL}>{title}</Text>
      {lead ? (
        <Text style={[styles.lead, { marginTop: 10, marginBottom: 0 }]}>{lead}</Text>
      ) : null}
      <View style={{ height: 18 }} />
      <Rule />
    </View>
  );
}

// ── Thin rule

export function Rule({ soft = false }: { soft?: boolean }) {
  return <View style={soft ? styles.ruleSoft : styles.rule} />;
}

// ── Tag list (chips)

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
            paddingVertical: 4,
            borderRadius: 999,
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

// ── Bullet list (editorial style — em-dashes, generous line-height)

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
          style={{ flexDirection: "row", marginBottom: 5, alignItems: "flex-start" }}
        >
          <Text
            style={{
              fontSize: 10,
              color: palette.accent,
              marginRight: 8,
              marginTop: -1,
              fontFamily: type.heading.family,
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

// ── Insight card — labelled block with generous padding, subtle surface

export function InsightCard({
  label,
  children,
  tone = "surface",
  fill,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "surface" | "accent" | "muted";
  /** Give the card more vertical presence when it's meant to headline a page. */
  fill?: boolean;
}) {
  const bg =
    tone === "accent" ? palette.accentSoft : tone === "muted" ? palette.surfaceAlt : palette.surface;
  const accentStripe = tone === "accent" ? palette.accent : null;
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 6,
        paddingVertical: fill ? 16 : 12,
        paddingHorizontal: 14,
        marginBottom: 10,
        borderLeftWidth: accentStripe ? 2 : 0,
        borderLeftColor: accentStripe ?? undefined,
      }}
    >
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

// ── Quote block — for user reflections (editorial pull-quote feel)

export function QuoteBlock({ text, attribution }: { text: string; attribution?: string }) {
  if (!text) return null;
  return (
    <View
      style={{
        paddingLeft: 16,
        paddingVertical: 6,
        marginBottom: 10,
        borderLeftWidth: 2,
        borderLeftColor: palette.accent,
      }}
    >
      <Text
        style={{
          fontFamily: type.heading.family,
          fontWeight: type.subheading.weight,
          fontSize: 11.5,
          lineHeight: 1.55,
          color: palette.ink,
        }}
      >
        {`\u201C${text}\u201D`}
      </Text>
      {attribution ? (
        <Text style={{ fontSize: 8, color: palette.subtle, marginTop: 4 }}>
          — {attribution}
        </Text>
      ) : null}
    </View>
  );
}

// ── Pair block — two columns of label + value

export function Pair({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.body, { color: palette.ink, fontFamily: type.heading.family, fontWeight: type.subheading.weight }]}>
        {value}
      </Text>
    </View>
  );
}

// ── Empty-state card (used when a section has nothing to show)

export function EmptyState({ message }: { message: string }) {
  return (
    <View
      style={{
        backgroundColor: palette.surfaceAlt,
        borderRadius: 6,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <Text style={[styles.body, { color: palette.muted, textAlign: "center" }]}>
        {message}
      </Text>
    </View>
  );
}

// ── Phase marker — used in TOC + section dividers. A small numbered pill.

export function PhaseMarker({ n, label, color = palette.accent }: { n: number; label: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: type.heading.family,
            fontWeight: type.heading.weight,
            fontSize: 10,
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
          fontSize: 12,
          color: palette.ink,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Decorative hairline SVG (for cover rules etc.)

export function HairlineRule({ width = 48, color = palette.accent, height = 2 }: { width?: number; color?: string; height?: number }) {
  return (
    <Svg style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height} rx={1} fill={color} />
    </Svg>
  );
}

// ── Stage dot (used by roadmap + legend)

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

// ── Connector line between roadmap nodes

export function ConnectorLine({ height = 48 }: { height?: number }) {
  return (
    <Svg style={{ width: 2, height }}>
      <Line x1={1} y1={0} x2={1} y2={height} stroke={palette.divider} strokeWidth={1} />
    </Svg>
  );
}

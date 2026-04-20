import React from "react";
import { Page, Text, View, Svg, Path, Rect, Line, Circle, Defs, LinearGradient, Stop } from "@react-pdf/renderer";
import type { Variant } from "./variants";
import type { JourneyReportViewModel } from "../types";
import { type as typeTokens } from "../theme";

/**
 * Ten cover treatments. Each receives the variant palette + the report
 * view model. They share a rough layout rhythm — brand at top, title
 * block middle, metadata at foot — so comparisons isolate visual tone,
 * not composition.
 */

const PAGE_W = 595.28;
const PAGE_H = 841.89;

export function VariantCover({ variant, vm }: { variant: Variant; vm: JourneyReportViewModel }) {
  const { palette: pal, cover } = variant;
  const { cover: meta } = vm;

  // Common atoms
  const brandRow = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Svg style={{ width: 16, height: 16 }} viewBox="0 0 20 20">
        <Path d="M10 2 L18 18 L10 13 L2 18 Z" fill={pal.coverAccent} />
      </Svg>
      <Text
        style={{
          fontFamily: typeTokens.bodyStrong.family,
          fontWeight: typeTokens.bodyStrong.weight,
          fontSize: 9,
          color: pal.coverText,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Endeavrly
      </Text>
    </View>
  );

  const titleText = meta.careerTitle
    ? `A considered path to ${meta.careerTitle}.`
    : "A considered look at where you're going.";

  const title = (
    <Text
      style={{
        fontFamily: typeTokens.display.family,
        fontWeight: variant.coverTitleWeight,
        fontSize: 48,
        lineHeight: 1.04,
        color: pal.coverText,
        letterSpacing: -1.1,
        marginBottom: 20,
        maxWidth: 440,
      }}
    >
      {titleText}
    </Text>
  );

  const eyebrow = (
    <Text
      style={{
        fontFamily: typeTokens.bodyStrong.family,
        fontWeight: typeTokens.bodyStrong.weight,
        fontSize: 9,
        color: pal.coverAccent,
        letterSpacing: 2.2,
        textTransform: "uppercase",
        marginBottom: 22,
      }}
    >
      My Journey Report
    </Text>
  );

  const subtitle = (
    <Text
      style={{
        fontFamily: typeTokens.body.family,
        fontSize: 12,
        color: pal.coverMuted,
        lineHeight: 1.6,
        maxWidth: 400,
      }}
    >
      {meta.subtitle ||
        "A structured summary of what you're exploring, what you've learned, and what comes next."}
    </Text>
  );

  const footer = (
    <View>
      <View
        style={{ height: 0.5, backgroundColor: pal.coverRule, marginBottom: 22 }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text
            style={{
              fontFamily: typeTokens.bodyStrong.family,
              fontWeight: typeTokens.bodyStrong.weight,
              fontSize: 7.5,
              color: pal.coverMuted,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Generated
          </Text>
          <Text
            style={{
              fontFamily: typeTokens.heading.family,
              fontWeight: typeTokens.subheading.weight,
              fontSize: 13,
              color: pal.coverText,
              letterSpacing: -0.1,
            }}
          >
            {meta.generatedDate}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontFamily: typeTokens.bodyStrong.family,
              fontWeight: typeTokens.bodyStrong.weight,
              fontSize: 7.5,
              color: pal.coverMuted,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Style Variant
          </Text>
          <Text
            style={{
              fontFamily: typeTokens.heading.family,
              fontWeight: typeTokens.subheading.weight,
              fontSize: 13,
              color: pal.coverText,
              letterSpacing: -0.1,
            }}
          >
            {variant.name}
          </Text>
        </View>
      </View>
    </View>
  );

  // Constellation network — thin white lines connecting dots in a
  // polygonal pattern. Sits in the upper-right of the whitepaper cover.
  // Scaled larger than the page-interior version so it carries the
  // cover's decorative weight.
  const coverConstellation = (
    <Svg
      style={{
        position: "absolute",
        top: 40,
        right: 40,
        width: 320,
        height: 240,
      }}
      viewBox="0 0 320 240"
    >
      {[
        [40, 20, 110, 56],
        [110, 56, 190, 22],
        [190, 22, 272, 80],
        [272, 80, 300, 140],
        [110, 56, 160, 130],
        [160, 130, 272, 80],
        [160, 130, 82, 184],
        [82, 184, 40, 110],
        [40, 110, 110, 56],
        [160, 130, 230, 200],
        [230, 200, 300, 140],
        [82, 184, 160, 130],
      ].map(([x1, y1, x2, y2], i) => (
        <Line
          key={`cl-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#FFFFFF"
          strokeWidth={0.5}
          strokeOpacity={0.55}
        />
      ))}
      {[
        [40, 20],
        [110, 56],
        [190, 22],
        [272, 80],
        [300, 140],
        [160, 130],
        [82, 184],
        [40, 110],
        [230, 200],
      ].map(([cx, cy], i) => (
        <Circle
          key={`cd-${i}`}
          cx={cx}
          cy={cy}
          r={2}
          fill="#FFFFFF"
          fillOpacity={0.92}
        />
      ))}
    </Svg>
  );

  // Decorative backgrounds — each treatment renders its own. The common
  // elements (brand / title / footer) float above as absolute-positioned
  // stacks keyed off the page edges.
  const backgroundsByTreatment: Record<string, React.ReactNode> = {
    "dark-minimal": null,
    "ivory-editorial": null,
    "gradient-dawn": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Defs>
          <LinearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FBBF24" />
            <Stop offset="55%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#EF4444" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="url(#dawn)" />
        {/* Soft horizon band */}
        <Rect
          x={0}
          y={PAGE_H * 0.58}
          width={PAGE_W}
          height={1.5}
          fill="#FFFFFF"
          fillOpacity={0.35}
        />
      </Svg>
    ),
    "gradient-dusk": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Defs>
          <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1E1B4B" />
            <Stop offset="55%" stopColor="#6D28D9" />
            <Stop offset="100%" stopColor="#EC4899" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="url(#dusk)" />
      </Svg>
    ),
    "mosaic-soft": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* Four staggered tinted blocks across upper third */}
        <Rect x={0} y={0} width={PAGE_W * 0.42} height={260} fill="#14B8A6" fillOpacity={0.22} />
        <Rect x={PAGE_W * 0.42} y={0} width={PAGE_W * 0.34} height={180} fill="#8B5CF6" fillOpacity={0.2} />
        <Rect x={PAGE_W * 0.76} y={0} width={PAGE_W * 0.24} height={260} fill="#F59E0B" fillOpacity={0.2} />
        <Rect x={PAGE_W * 0.42} y={180} width={PAGE_W * 0.58} height={80} fill="#3B82F6" fillOpacity={0.18} />
      </Svg>
    ),
    "grid-swiss": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* 12 vertical guides */}
        {Array.from({ length: 13 }).map((_, i) => {
          const x = 40 + (PAGE_W - 80) * (i / 12);
          return (
            <Line
              key={`v-${i}`}
              x1={x}
              y1={40}
              x2={x}
              y2={PAGE_H - 40}
              stroke="#D4D4D8"
              strokeWidth={0.4}
            />
          );
        })}
        {/* Strong red block — Swiss anchor */}
        <Rect x={40} y={40} width={80} height={6} fill={pal.coverAccent} />
      </Svg>
    ),
    "kraft-catalogue": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* Cross-hatch texture — diagonal light strokes, very subtle */}
        {Array.from({ length: 36 }).map((_, i) => (
          <Line
            key={`h-${i}`}
            x1={-80 + i * 30}
            y1={0}
            x2={-80 + i * 30 + 900}
            y2={PAGE_H}
            stroke="#FBF7E9"
            strokeOpacity={0.08}
            strokeWidth={0.6}
          />
        ))}
        {Array.from({ length: 36 }).map((_, i) => (
          <Line
            key={`k-${i}`}
            x1={-80 + i * 30 + 900}
            y1={0}
            x2={-80 + i * 30}
            y2={PAGE_H}
            stroke="#FBF7E9"
            strokeOpacity={0.05}
            strokeWidth={0.6}
          />
        ))}
      </Svg>
    ),
    "navy-gold": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* Gold hairline frame */}
        <Rect
          x={32}
          y={32}
          width={PAGE_W - 64}
          height={PAGE_H - 64}
          stroke={pal.coverAccent}
          strokeWidth={0.75}
          fill="none"
        />
        {/* Thicker gold anchor line under brand mark */}
        <Rect x={58} y={110} width={72} height={2} fill={pal.coverAccent} />
      </Svg>
    ),
    "sage-stone": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* Scattered botanical dots — very soft, top half only */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = ((i * 83) % (PAGE_W - 100)) + 50;
          const y = ((i * 47) % 360) + 40;
          return (
            <Circle
              key={`d-${i}`}
              cx={x}
              cy={y}
              r={1.6}
              fill={pal.coverAccent}
              fillOpacity={0.18}
            />
          );
        })}
      </Svg>
    ),
    "blob-watercolour": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill={pal.coverBg} />
        {/* Three soft blobs in complementary tints */}
        <Circle cx={PAGE_W * 0.18} cy={PAGE_H * 0.22} r={180} fill="#14B8A6" fillOpacity={0.09} />
        <Circle cx={PAGE_W * 0.82} cy={PAGE_H * 0.3} r={160} fill="#A78BFA" fillOpacity={0.08} />
        <Circle cx={PAGE_W * 0.5} cy={PAGE_H * 0.78} r={220} fill="#F59E0B" fillOpacity={0.07} />
      </Svg>
    ),
    // Gradient Horizontal — simple left→right linear gradient between
    // the palette's coverGradientFrom / coverGradientTo colours. Used
    // by the Fresh Turboscent / Vine / Vasily variants. If the palette
    // doesn't define gradient stops, fall back to coverBg / coverAccent
    // so the treatment degrades gracefully.
    "gradient-horizontal": (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Defs>
          <LinearGradient id="gh" x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0%"
              stopColor={pal.coverGradientFrom ?? pal.coverBg}
            />
            <Stop
              offset="100%"
              stopColor={pal.coverGradientTo ?? pal.coverAccent}
            />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="url(#gh)" />
      </Svg>
    ),
    // Whitepaper — deep navy ground, magenta wash descending from the
    // upper-left corner. @react-pdf's SVG supports linearGradient (not
    // radial), so we simulate the radial blush by stacking two long
    // diagonal linear gradients plus a subtle magenta circle for the
    // corner hotspot. Keeps @react-pdf happy and renders identically in
    // print PDFs + on-screen.
    whitepaper: (
      <Svg
        style={{ position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H }}
      >
        <Defs>
          <LinearGradient id="wp-base" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#14094A" />
            <Stop offset="100%" stopColor="#1B0F3A" />
          </LinearGradient>
          <LinearGradient id="wp-blush" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#B91B5A" stopOpacity={0.85} />
            <Stop offset="35%" stopColor="#7E1340" stopOpacity={0.45} />
            <Stop offset="70%" stopColor="#1B0F3A" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="url(#wp-base)" />
        <Rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="url(#wp-blush)" />
        {/* Corner hotspot — concentrates the magenta in the lower-left
            edge the way the Visme reference does. */}
        <Circle cx={-60} cy={PAGE_H * 0.72} r={280} fill="#C21B5F" fillOpacity={0.18} />
      </Svg>
    ),
  };

  return (
    <Page
      size="A4"
      style={{
        backgroundColor: pal.coverBg,
        paddingHorizontal: 58,
        paddingVertical: 64,
        fontFamily: typeTokens.heading.family,
        justifyContent: "space-between",
      }}
    >
      {backgroundsByTreatment[cover]}
      {cover === "whitepaper" ? coverConstellation : null}
      <View>{brandRow}</View>
      {cover === "whitepaper" ? (
        <View>
          {/* Visme-style stack: title first, then the "WHITE PAPER"
              eyebrow underneath. No mid-block rule — the quiet magenta
              accent under the title does the separating work. */}
          <Text
            style={{
              fontFamily: typeTokens.display.family,
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.12,
              color: pal.coverText,
              letterSpacing: -0.6,
              marginBottom: 4,
              maxWidth: 420,
            }}
          >
            {meta.careerTitle ? "A considered path to" : "A considered look at"}
          </Text>
          <Text
            style={{
              fontFamily: typeTokens.display.family,
              fontWeight: 500,
              fontSize: 34,
              lineHeight: 1.12,
              color: pal.coverText,
              letterSpacing: -0.6,
              marginBottom: 22,
              maxWidth: 440,
            }}
          >
            {meta.careerTitle ? `${meta.careerTitle}.` : "where you're going."}
          </Text>
          <Text
            style={{
              fontFamily: typeTokens.bodyStrong.family,
              fontWeight: typeTokens.bodyStrong.weight,
              fontSize: 11,
              color: pal.coverText,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            White Paper
          </Text>
        </View>
      ) : (
        <View>
          {eyebrow}
          {title}
          <View style={{ height: 20 }} />
          <View
            style={{ height: 0.75, width: 64, backgroundColor: pal.coverAccent }}
          />
          <View style={{ height: 20 }} />
          {subtitle}
        </View>
      )}
      {cover === "whitepaper" ? (
        <View>
          <View
            style={{
              height: 0.5,
              backgroundColor: pal.coverRule,
              marginBottom: 18,
            }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text
              style={{
                fontFamily: typeTokens.body.family,
                fontSize: 9,
                color: pal.coverMuted,
                letterSpacing: 0.2,
              }}
            >
              {meta.generatedDate}
            </Text>
            <Text
              style={{
                fontFamily: typeTokens.body.family,
                fontSize: 9,
                color: pal.coverMuted,
                letterSpacing: 0.2,
              }}
            >
              endeavrly.com
            </Text>
          </View>
        </View>
      ) : (
        footer
      )}
    </Page>
  );
}

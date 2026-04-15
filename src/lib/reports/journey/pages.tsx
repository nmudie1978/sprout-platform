import React from "react";
import { Page, Text, View, Svg, Rect, Path, Circle } from "@react-pdf/renderer";
import { palette, stageColors, styles, type } from "./theme";
import {
  BulletList,
  ConnectorLine,
  EmptyState,
  HairlineRule,
  InsightCard,
  Pair,
  PageFrame,
  PhaseMarker,
  QuoteBlock,
  SectionHeader,
  StageDot,
  TagList,
} from "./primitives";
import type {
  ClaritySummary,
  DiscoverSummary,
  EducationContext,
  ExecutiveSummaryData,
  JourneyReportViewModel,
  NextStep,
  RoadmapSection,
  RouteVariant,
  UnderstandSummary,
} from "./types";

// ── Cover ───────────────────────────────────────────────────────────

export function CoverPage({ vm }: { vm: JourneyReportViewModel }) {
  const { cover } = vm;
  return (
    <Page
      size="A4"
      style={{
        backgroundColor: palette.cover.bg,
        paddingHorizontal: 52,
        paddingVertical: 56,
        fontFamily: type.heading.family,
        justifyContent: "space-between",
      }}
    >
      {/* Top — brand mark + wordmark */}
      <View>
        <HairlineRule width={56} color={palette.cover.accent} height={3} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 22 }}>
          <Svg style={{ width: 26, height: 26 }} viewBox="0 0 32 32">
            <Circle cx={16} cy={16} r={15} fill={palette.cover.accent} />
            <Path
              d="M16 7 L20 16 L16 14 L12 16 Z"
              fill={palette.cover.bg}
            />
            <Path
              d="M16 25 L12 16 L16 18 L20 16 Z"
              fill={palette.cover.bg}
              fillOpacity={0.55}
            />
          </Svg>
          <Text
            style={{
              fontFamily: type.heading.family,
              fontWeight: type.heading.weight,
              fontSize: 11,
              color: palette.cover.accent,
              letterSpacing: 3.5,
              textTransform: "uppercase",
            }}
          >
            Endeavrly
          </Text>
        </View>
      </View>

      {/* Centre — title block */}
      <View>
        <Text
          style={{
            fontFamily: type.display.family,
            fontWeight: type.display.weight,
            fontSize: 44,
            lineHeight: 1.05,
            color: palette.cover.text,
            letterSpacing: -0.8,
            marginBottom: 18,
          }}
        >
          My Journey
          {"\n"}
          Report
        </Text>

        <HairlineRule width={72} color={palette.cover.accent} height={3} />

        {cover.careerTitle ? (
          <Text
            style={{
              fontFamily: type.body.family,
              fontSize: 13,
              color: palette.cover.muted,
              lineHeight: 1.55,
              marginTop: 22,
              marginBottom: 4,
              maxWidth: 380,
            }}
          >
            A considered summary of exploring a future in{" "}
            <Text style={{ color: palette.cover.text, fontFamily: type.bodyStrong.family, fontWeight: type.bodyStrong.weight }}>
              {cover.careerTitle}
            </Text>
            .
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: type.body.family,
              fontSize: 13,
              color: palette.cover.muted,
              lineHeight: 1.55,
              marginTop: 22,
              maxWidth: 380,
            }}
          >
            {cover.subtitle}
          </Text>
        )}
      </View>

      {/* Bottom — metadata (no name; date only, left-aligned for a
          calmer, less "certificate-like" feel). */}
      <View>
        <View style={{ height: 1, backgroundColor: palette.cover.rule, marginBottom: 20 }} />
        <View>
          <Text
            style={{
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              fontSize: 7.5,
              color: palette.cover.muted,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Generated
          </Text>
          <Text
            style={{
              fontFamily: type.heading.family,
              fontWeight: type.subheading.weight,
              fontSize: 14,
              color: palette.cover.text,
            }}
          >
            {cover.generatedDate}
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ── TOC ─────────────────────────────────────────────────────────────

export interface TocEntry {
  n: number;
  title: string;
  pageNumber: number;
}

export function TocPage({
  entries,
  pageNumber,
  totalPages,
}: {
  entries: TocEntry[];
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageFrame sectionLabel="Contents" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Contents"
        title="Inside this report"
        lead="A structured walk-through of your journey — the career, the path in, your personal roadmap, and the next moves to make."
      />

      <View style={{ marginTop: 4 }}>
        {entries.map((entry, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: palette.hairlineSoft,
            }}
          >
            <Text
              style={{
                width: 28,
                fontFamily: type.heading.family,
                fontWeight: type.heading.weight,
                fontSize: 11,
                color: palette.accent,
              }}
            >
              {String(entry.n).padStart(2, "0")}
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: type.heading.family,
                fontWeight: type.subheading.weight,
                fontSize: 12,
                color: palette.ink,
              }}
            >
              {entry.title}
            </Text>
            <Text
              style={{
                fontFamily: type.body.family,
                fontSize: 10,
                color: palette.subtle,
              }}
            >
              p. {entry.pageNumber}
            </Text>
          </View>
        ))}
      </View>
    </PageFrame>
  );
}

// ── Executive summary ──────────────────────────────────────────────

export function ExecutivePage({
  data,
  pageNumber,
  totalPages,
}: {
  data: ExecutiveSummaryData;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageFrame sectionLabel="Summary" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Executive Summary"
        title={data.headline}
        lead="A short narrative of the exploration so far — what's been uncovered, what's been decided, and what's still open."
      />

      <View style={{ marginBottom: 18 }}>
        {data.paragraphs.map((p, i) => (
          <Text
            key={i}
            style={[styles.body, { fontSize: 10.5, lineHeight: 1.7, marginBottom: 10 }]}
          >
            {p}
          </Text>
        ))}
      </View>

      {data.highlights.length > 0 && (
        <>
          <Rule />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            {data.highlights.map((h, i) => (
              <View key={i} style={{ flex: 1 }}>
                <Text style={styles.label}>{h.label}</Text>
                <Text
                  style={{
                    fontFamily: type.display.family,
                    fontWeight: type.display.weight,
                    fontSize: 15,
                    color: palette.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {h.value}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </PageFrame>
  );
}

function Rule() {
  return <View style={styles.rule} />;
}

// ── Discover ───────────────────────────────────────────────────────

export function DiscoverPage({
  data,
  pageNumber,
  totalPages,
}: {
  data: DiscoverSummary;
  pageNumber: number;
  totalPages: number;
}) {
  const hasAnyContent =
    data.strengths.length > 0 ||
    data.motivations.length > 0 ||
    data.workStyle.length > 0 ||
    data.growthAreas.length > 0 ||
    data.careerInterests.length > 0 ||
    Boolean(data.roleModels) ||
    Boolean(data.experiences) ||
    Boolean(data.radar);

  return (
    <PageFrame sectionLabel="Discover" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Phase 01  ·  Discover"
        title="Who you are"
        lead="Self-awareness is the foundation. This section captures the signals that make your starting point unique — what you're good at, what pulls you, and what you still want to grow."
      />

      {!hasAnyContent && (
        <InsightCard label="Discover isn't empty — it's unwritten" tone="muted">
          <Text style={[styles.body, { marginBottom: 6 }]}>
            You haven't captured Discover answers yet. That's fine — the Journey works even when
            you start from the middle. When you're ready, Discover asks four things:
          </Text>
          <BulletList
            items={[
              "What are you good at — the three or four things that come more naturally to you than to other people?",
              "What pulls you — the kind of work, problems, or people you keep coming back to?",
              "How do you work best — pace, people, environment, what drains you and what fills you up?",
              "Where do you want to grow — the soft edges you already know you need to sharpen?",
            ]}
          />
        </InsightCard>
      )}

      {data.radar && (
        <InsightCard label="From your Career Radar" tone="accent">
          <BulletList items={data.radar.summaryLines} />
        </InsightCard>
      )}

      {data.strengths.length > 0 && (
        <InsightCard label="Top strengths">
          <TagList items={data.strengths} max={10} />
        </InsightCard>
      )}

      <View style={styles.row}>
        {data.motivations.length > 0 && (
          <View style={styles.col}>
            <InsightCard label="What drives you">
              <TagList items={data.motivations} color={palette.emerald} bg={palette.emeraldSoft} max={8} />
            </InsightCard>
          </View>
        )}
        {data.workStyle.length > 0 && (
          <View style={styles.col}>
            <InsightCard label="How you work best">
              <TagList items={data.workStyle} color={palette.violet} bg={palette.violetSoft} max={6} />
            </InsightCard>
          </View>
        )}
      </View>

      {data.growthAreas.length > 0 && (
        <InsightCard label="Areas to grow">
          <TagList items={data.growthAreas} color={palette.amber} bg={palette.amberSoft} max={6} />
        </InsightCard>
      )}

      {(data.roleModels || data.experiences) && (
        <>
          <View style={styles.sp8} />
          <View style={styles.row}>
            {data.roleModels && (
              <View style={styles.col}>
                <InsightCard label="Who inspires you">
                  <Text style={styles.body}>{data.roleModels}</Text>
                </InsightCard>
              </View>
            )}
            {data.experiences && (
              <View style={styles.col}>
                <InsightCard label="What you've tried">
                  <Text style={styles.body}>{data.experiences}</Text>
                </InsightCard>
              </View>
            )}
          </View>
        </>
      )}

      {data.careerInterests.length > 0 && (
        <InsightCard label="Career directions you've considered">
          <TagList items={data.careerInterests} color={palette.blue} bg={palette.blueSoft} max={10} />
        </InsightCard>
      )}
    </PageFrame>
  );
}

// ── Understand ─────────────────────────────────────────────────────

/**
 * Understand is the richest content section. When the user hasn't
 * written their own notes we still have a great deal to say about
 * the career itself — description, salary, demand, typical day,
 * required subjects, university path, certifications, and a salary
 * + sector line. We weave user-authored content in as its own card
 * at the top when present, so the reader sees the user's voice
 * first and the catalog data as supporting colour.
 */
export function UnderstandPage({
  data,
  career,
  pageNumber,
  totalPages,
}: {
  data: UnderstandSummary;
  career: string | null;
  pageNumber: number;
  totalPages: number;
}) {
  const userHasNotes =
    data.roleReality.length > 0 ||
    data.industryInsights.length > 0 ||
    data.qualifications.length > 0 ||
    data.keySkills.length > 0 ||
    data.courses.length > 0 ||
    Boolean(data.actionPlan);

  const hasCatalog = Boolean(
    data.facts || data.insights || data.requirements || data.certifications || data.programmes.length,
  );

  return (
    <PageFrame sectionLabel="Career Summary" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Career Summary"
        title={career ? `Career Summary for: ${career}` : "Career Summary"}
        lead={
          career
            ? `What the role actually looks like, what it asks of you, and what you'd need to build to get there. Signals below are drawn from the app's verified career catalog.`
            : "Exploration is what turns a career name into a decision."
        }
      />

      {/* Fact strip — headline facts about the career */}
      {data.facts && (
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          {data.facts.avgSalary && (
            <View
              style={{
                flex: 1,
                backgroundColor: palette.surface,
                borderRadius: 6,
                padding: 12,
                borderLeftWidth: 2,
                borderLeftColor: palette.accent,
              }}
            >
              <Text style={styles.label}>Entry salary (NO)</Text>
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.subheading.weight,
                  fontSize: 11,
                  color: palette.ink,
                }}
              >
                {data.facts.avgSalary}
              </Text>
            </View>
          )}
          {data.facts.growthOutlookLabel && (
            <View
              style={{
                flex: 1,
                backgroundColor: palette.surface,
                borderRadius: 6,
                padding: 12,
                borderLeftWidth: 2,
                borderLeftColor: palette.emerald,
              }}
            >
              <Text style={styles.label}>Demand outlook</Text>
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.subheading.weight,
                  fontSize: 11,
                  color: palette.ink,
                }}
              >
                {data.facts.growthOutlookLabel}
              </Text>
            </View>
          )}
          {data.facts.educationPath && (
            <View
              style={{
                flex: 1,
                backgroundColor: palette.surface,
                borderRadius: 6,
                padding: 12,
                borderLeftWidth: 2,
                borderLeftColor: palette.blue,
              }}
            >
              <Text style={styles.label}>Education path</Text>
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.subheading.weight,
                  fontSize: 11,
                  color: palette.ink,
                }}
              >
                {data.facts.educationPath}
              </Text>
            </View>
          )}
        </View>
      )}

      {data.facts?.description && (
        <Text style={[styles.body, { fontSize: 10.5, lineHeight: 1.7, marginBottom: 12 }]}>
          {data.facts.description}
        </Text>
      )}

      {/* User-authored role reality first, if present */}
      {data.roleReality.length > 0 && (
        <InsightCard label="What you noted about the role" tone="accent">
          <BulletList items={data.roleReality} max={6} />
        </InsightCard>
      )}

      {/* Catalog signals */}
      {data.insights?.whatYouActuallyDo && data.insights.whatYouActuallyDo.length > 0 && (
        <InsightCard label="What you actually do day-to-day">
          <BulletList items={data.insights.whatYouActuallyDo} max={6} />
        </InsightCard>
      )}

      <View style={styles.row}>
        {data.insights?.topSkills && data.insights.topSkills.length > 0 && (
          <View style={styles.col}>
            <InsightCard label="Key skills to build">
              <TagList
                items={data.insights.topSkills}
                color={palette.blue}
                bg={palette.blueSoft}
                max={10}
              />
            </InsightCard>
          </View>
        )}
        {data.insights?.whoThisIsGoodFor && data.insights.whoThisIsGoodFor.length > 0 && (
          <View style={styles.col}>
            <InsightCard label="Who this suits">
              <BulletList items={data.insights.whoThisIsGoodFor} max={5} />
            </InsightCard>
          </View>
        )}
      </View>

      {data.insights?.realityCheck && (
        <InsightCard label="Reality check" tone="muted">
          <Text style={styles.body}>{data.insights.realityCheck}</Text>
        </InsightCard>
      )}

      {data.industryInsights.length > 0 && (
        <InsightCard label="Your industry notes">
          <BulletList items={data.industryInsights} max={6} />
        </InsightCard>
      )}

      {!userHasNotes && !hasCatalog && (
        <EmptyState message="Nothing has been captured in Understand yet. Reading the role reality, making notes, and saving a few qualifications or courses will fill this section with substance." />
      )}
    </PageFrame>
  );
}

/**
 * A second Understand page — renders when we have path / programme /
 * certification content. Keeps the first page readable and gives the
 * requirements their own breathing room.
 */
export function UnderstandPathPage({
  data,
  career,
  pageNumber,
  totalPages,
}: {
  data: UnderstandSummary;
  career: string | null;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageFrame sectionLabel="Understand · path" pageNumber={pageNumber} totalPages={totalPages}>
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.eyebrow}>Phase 02  ·  Understand</Text>
        <Text style={styles.h1}>{career ? `The path to ${career}` : "The path to the role"}</Text>
        <View style={{ height: 10 }} />
        <Rule />
      </View>

      {data.requirements && (
        <>
          <View style={styles.row}>
            <View style={styles.col}>
              <InsightCard label="Required school subjects">
                {data.requirements.subjects.required.length > 0 ? (
                  <TagList items={data.requirements.subjects.required} max={8} />
                ) : (
                  <Text style={styles.bodyMuted}>Not specified for this career.</Text>
                )}
                {data.requirements.subjects.minimumGrade && (
                  <>
                    <View style={styles.sp8} />
                    <Text style={styles.caption}>
                      Grade expectation: {data.requirements.subjects.minimumGrade}
                    </Text>
                  </>
                )}
              </InsightCard>
            </View>
            {data.requirements.subjects.recommended.length > 0 && (
              <View style={styles.col}>
                <InsightCard label="Recommended subjects">
                  <TagList
                    items={data.requirements.subjects.recommended}
                    color={palette.violet}
                    bg={palette.violetSoft}
                    max={8}
                  />
                </InsightCard>
              </View>
            )}
          </View>

          {data.requirements.universityPath.programme && (
            <InsightCard label="University path" tone="accent">
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.subheading.weight,
                  fontSize: 11,
                  color: palette.ink,
                  marginBottom: 3,
                }}
              >
                {data.requirements.universityPath.programme}
                {data.requirements.universityPath.duration
                  ? `  ·  ${data.requirements.universityPath.duration}`
                  : ""}
              </Text>
              {data.requirements.universityPath.examples.length > 0 && (
                <Text style={styles.body}>
                  Examples: {data.requirements.universityPath.examples.slice(0, 6).join(", ")}.
                </Text>
              )}
              {data.requirements.universityPath.applicationRoute && (
                <Text style={[styles.caption, { marginTop: 4 }]}>
                  Apply via {data.requirements.universityPath.applicationRoute}.
                </Text>
              )}
              {data.requirements.universityPath.competitiveness && (
                <Text style={[styles.caption, { marginTop: 2 }]}>
                  {data.requirements.universityPath.competitiveness}
                </Text>
              )}
            </InsightCard>
          )}

          {(data.requirements.entryLevel.title ||
            data.requirements.qualifiesFor.immediate ||
            data.requirements.qualifiesFor.seniorPath) && (
            <View style={styles.row}>
              {data.requirements.entryLevel.title && (
                <View style={styles.col}>
                  <InsightCard label="Entry-level stage">
                    <Text
                      style={{
                        fontFamily: type.heading.family,
                        fontWeight: type.subheading.weight,
                        fontSize: 10.5,
                        color: palette.ink,
                      }}
                    >
                      {data.requirements.entryLevel.title}
                    </Text>
                    {data.requirements.entryLevel.description && (
                      <Text style={[styles.body, { marginTop: 3 }]}>
                        {data.requirements.entryLevel.description}
                      </Text>
                    )}
                    {data.requirements.entryLevel.whatYouNeed && (
                      <Text style={[styles.caption, { marginTop: 4 }]}>
                        {data.requirements.entryLevel.whatYouNeed}
                      </Text>
                    )}
                  </InsightCard>
                </View>
              )}
              <View style={styles.col}>
                <InsightCard label="What this qualifies you for">
                  {data.requirements.qualifiesFor.immediate && (
                    <Text style={[styles.body, { marginBottom: 2 }]}>
                      Immediately: {data.requirements.qualifiesFor.immediate}
                    </Text>
                  )}
                  {data.requirements.qualifiesFor.withExperience && (
                    <Text style={[styles.body, { marginBottom: 2 }]}>
                      With experience: {data.requirements.qualifiesFor.withExperience}
                    </Text>
                  )}
                  {data.requirements.qualifiesFor.seniorPath && (
                    <Text style={styles.body}>
                      Senior path: {data.requirements.qualifiesFor.seniorPath}
                    </Text>
                  )}
                </InsightCard>
              </View>
            </View>
          )}
        </>
      )}

      {data.programmes.length > 0 && (
        <InsightCard label="Programmes that lead here">
          {data.programmes.slice(0, 5).map((p, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 5,
                borderBottomWidth: i === Math.min(4, data.programmes.length - 1) ? 0 : 0.5,
                borderBottomColor: palette.hairlineSoft,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={{
                    fontFamily: type.heading.family,
                    fontWeight: type.subheading.weight,
                    fontSize: 9.5,
                    color: palette.ink,
                  }}
                >
                  {p.programme}
                </Text>
                <Text style={styles.caption}>
                  {[p.institution, p.city, p.country].filter(Boolean).join(", ")}
                </Text>
              </View>
              <Text style={[styles.caption, { paddingTop: 2, minWidth: 64, textAlign: "right" }]}>
                {[p.duration, p.language].filter(Boolean).join("  ·  ")}
              </Text>
            </View>
          ))}
        </InsightCard>
      )}

      {data.certifications && data.certifications.certifications.length > 0 && (
        <InsightCard label={data.certifications.summary || "Professional certifications"}>
          {data.certifications.certifications.map((c, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                borderBottomWidth: i === data.certifications!.certifications.length - 1 ? 0 : 0.5,
                borderBottomColor: palette.hairlineSoft,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text
                  style={{
                    fontFamily: type.heading.family,
                    fontWeight: type.subheading.weight,
                    fontSize: 9.5,
                    color: palette.ink,
                  }}
                >
                  {c.name}
                </Text>
                <Text style={styles.caption}>
                  {[c.provider, c.duration, c.cost].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
              {c.recognised && (
                <Text style={[styles.caption, { paddingTop: 2, maxWidth: 110, textAlign: "right" }]}>
                  {c.recognised}
                </Text>
              )}
            </View>
          ))}
        </InsightCard>
      )}

      {data.facts?.pensionNote && (
        <InsightCard label="Sector & pension" tone="muted">
          <Text style={styles.body}>{data.facts.pensionNote}</Text>
        </InsightCard>
      )}

      {data.actionPlan && (
        <>
          <Rule />
          <Text style={styles.h2}>Your action plan</Text>
          {data.actionPlan.roleTitle && (
            <InsightCard label="Target role" tone="accent">
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.subheading.weight,
                  fontSize: 11,
                  color: palette.ink,
                }}
              >
                {data.actionPlan.roleTitle}
              </Text>
            </InsightCard>
          )}
          <View style={styles.row}>
            {data.actionPlan.shortTermActions && data.actionPlan.shortTermActions.length > 0 && (
              <View style={styles.col}>
                <InsightCard label="Next steps">
                  <BulletList items={data.actionPlan.shortTermActions} max={5} />
                </InsightCard>
              </View>
            )}
            {(data.actionPlan.skillToBuild || data.actionPlan.midTermMilestone) && (
              <View style={styles.col}>
                {data.actionPlan.skillToBuild && (
                  <InsightCard label="Skill to build">
                    <Text style={styles.body}>{data.actionPlan.skillToBuild}</Text>
                  </InsightCard>
                )}
                {data.actionPlan.midTermMilestone && (
                  <InsightCard label="Mid-term milestone">
                    <Text style={styles.body}>{data.actionPlan.midTermMilestone}</Text>
                  </InsightCard>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </PageFrame>
  );
}

// ── Roadmap ─────────────────────────────────────────────────────────

const ITEMS_PER_ROADMAP_PAGE = 5;

export function RoadmapPages({
  data,
  education,
  startingPageNumber,
  totalPages,
  itemsPerPage,
}: {
  data: RoadmapSection;
  education: EducationContext;
  startingPageNumber: number;
  totalPages: number;
  /** Optional override; defaults to the module constant. */
  itemsPerPage?: number;
}): React.ReactElement[] {
  const perPage = itemsPerPage ?? ITEMS_PER_ROADMAP_PAGE;
  const hasItems = data.items.length > 0;
  const hasSchoolTrack = data.schoolTrack.length > 0;
  // `education` is no longer rendered — "Current education" was removed
  // from the report because it duplicates content on the roadmap's
  // first step. Keep the prop so callers don't have to change shape.
  void education;

  if (!hasItems && !hasSchoolTrack) {
    return [
      <PageFrame
        key="rm-empty"
        sectionLabel="Your path"
        pageNumber={startingPageNumber}
        totalPages={totalPages}
      >
        <SectionHeader
          eyebrow="Your path"
          title="Your personal roadmap"
          lead="The path from where you are today to the career you're exploring — mapped around your age, your education stage, and your chosen direction."
        />
        <EmptyState message="Your roadmap will appear here once you've set a primary goal and generated your personalised timeline in the Clarity tab." />
      </PageFrame>,
    ];
  }

  const pageCount = Math.max(1, Math.ceil(data.items.length / perPage));
  const out: React.ReactElement[] = [];

  for (let p = 0; p < pageCount; p++) {
    const slice = data.items.slice(p * perPage, (p + 1) * perPage);
    const isFirst = p === 0;
    const isLastRoadmapPage = p === pageCount - 1;
    const pageNumber = startingPageNumber + p;

    out.push(
      <PageFrame
        key={`rm-${p}`}
        sectionLabel="Your path"
        pageNumber={pageNumber}
        totalPages={totalPages}
      >
        {isFirst ? (
          <SectionHeader
            eyebrow="Your path"
            title={data.career ? `Your path to ${data.career}` : "Your personal roadmap"}
            lead={
              data.isFallback
                ? "A draft roadmap built from the career's real requirements and your current age. Open the Clarity tab in-app to refine it into your personalised version."
                : "An age-anchored timeline from today to a senior role. Every milestone is editable in-app — this is the version captured on the day this report was generated."
            }
          />
        ) : (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.eyebrow}>Continued</Text>
            <Text style={styles.h1}>Your path, continued</Text>
            <View style={styles.ruleSoft} />
          </View>
        )}

        {isFirst && hasItems && (
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {(["foundation", "education", "experience", "career"] as const).map((stage) => {
              const s = stageColors[stage];
              return (
                <View
                  key={stage}
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <StageDot color={s.accent} />
                  <Text
                    style={{
                      fontSize: 8.5,
                      color: palette.muted,
                      textTransform: "capitalize",
                      letterSpacing: 0.3,
                    }}
                  >
                    {stage}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {slice.length > 0 && (
          <View>
            {slice.map((item, i) => (
              <RoadmapRow
                key={i}
                step={item}
                birthYear={data.birthYear}
                last={
                  isLastRoadmapPage && i === slice.length - 1
                }
              />
            ))}
          </View>
        )}

        {/* Learning track renders once, on the final roadmap page.
            "Current education" was removed — it duplicates the
            starting-point info already inline on the roadmap. */}
        {isLastRoadmapPage && hasSchoolTrack && (
          <View style={{ marginTop: 18 }}>
            <View style={styles.rule} />
            <Text style={styles.h1}>Learning track</Text>
            <Text style={[styles.bodyMuted, { marginBottom: 10 }]}>
              The subjects and personal learning that run alongside your roadmap.
            </Text>
            {data.schoolTrack.map((item, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: palette.surface,
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 2,
                  borderLeftColor: palette.blue,
                }}
                wrap={false}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: type.heading.family,
                      fontWeight: type.subheading.weight,
                      fontSize: 10,
                      color: palette.ink,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: type.bodyStrong.family,
                      fontWeight: type.bodyStrong.weight,
                      color: stageColors[item.stage].ink,
                      backgroundColor: stageColors[item.stage].bg,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderRadius: 10,
                      textTransform: "capitalize",
                      letterSpacing: 0.4,
                    }}
                  >
                    {item.stage}
                  </Text>
                </View>
                {item.subjects.length > 0 && (
                  <TagList items={item.subjects} color={palette.blue} bg={palette.blueSoft} max={10} />
                )}
                {item.personalLearning && (
                  <Text style={[styles.caption, { marginTop: 4 }]}>
                    Self-directed: {item.personalLearning}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </PageFrame>,
    );
  }

  return out;
}

function RoadmapRow({
  step,
  birthYear,
  last,
}: {
  step: RoadmapSection["items"][number];
  birthYear: number | null;
  last: boolean;
}) {
  const stage = stageColors[step.stage];
  const stageLabel = step.stage[0].toUpperCase() + step.stage.slice(1);

  // Compact age + year label. Year range only renders when we know the
  // user's birth year — otherwise we fall back to age only.
  const startYear = birthYear != null ? birthYear + step.startAge : null;
  const endYear =
    birthYear != null && step.endAge != null ? birthYear + step.endAge : null;
  const ageStr = step.endAge ? `${step.startAge}\u2013${step.endAge}` : `${step.startAge}`;
  const yearStr = startYear
    ? endYear && endYear !== startYear
      ? ` \u00B7 ${startYear}\u2013${endYear}`
      : ` \u00B7 ${startYear}`
    : "";
  const ageYearLabel = `Age ${ageStr}${yearStr}`;

  // Single-line summary: prefer subtitle, then description — never both.
  // microActions are dropped from the PDF entirely to fit the roadmap
  // on one page; they remain visible in-app.
  const summary = step.subtitle || step.description || null;

  return (
    <View
      style={{ flexDirection: "row", marginBottom: last ? 0 : 4 }}
      wrap={false}
    >
      {/* Left rail — tightened connector so more rows fit per page. */}
      <View style={{ width: 22, alignItems: "center" }}>
        <StageDot color={stage.accent} milestone={step.isMilestone} />
        {!last && (
          <View style={{ flex: 1, marginTop: 2 }}>
            <ConnectorLine height={14} />
          </View>
        )}
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          backgroundColor: stage.bg,
          borderRadius: 5,
          paddingHorizontal: 9,
          paddingVertical: 6,
          borderLeftWidth: 2,
          borderLeftColor: stage.accent,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6,
            marginBottom: summary ? 2 : 0,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontFamily: type.heading.family,
              fontWeight: type.heading.weight,
              fontSize: 9.5,
              color: stage.ink,
            }}
          >
            {step.isMilestone ? `${step.title}  \u2605` : step.title}
          </Text>
          <Text
            style={{
              fontSize: 6.5,
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              color: stage.ink,
              backgroundColor: "rgba(255,255,255,0.6)",
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderRadius: 8,
              letterSpacing: 0.4,
            }}
          >
            {stageLabel}
          </Text>
          <Text style={{ fontSize: 7.5, color: palette.subtle }}>
            {ageYearLabel}
          </Text>
        </View>
        {summary && (
          <Text
            style={{
              fontSize: 8,
              color: palette.muted,
              lineHeight: 1.35,
            }}
          >
            {summary}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Alternative routes ─────────────────────────────────────────────

export function RoutesPage({
  routes,
  career,
  pageNumber,
  totalPages,
}: {
  routes: RouteVariant[];
  career: string | null;
  pageNumber: number;
  totalPages: number;
}) {
  if (routes.length === 0) return null;

  const tints: { bg: string; ink: string; accent: string }[] = [
    { bg: palette.accentSoft, ink: palette.accent, accent: palette.accent },
    { bg: palette.violetSoft, ink: palette.violet, accent: palette.violet },
    { bg: palette.amberSoft, ink: palette.amber, accent: palette.amber },
  ];

  return (
    <PageFrame sectionLabel="Alternative routes" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Phase 03  ·  Clarity"
        title="More than one way in"
        lead={
          career
            ? `Real paths people take to ${career} — each with a specific university and a realistic first employer. Any of these can get you there.`
            : "Real paths people take into this career — each with a specific university and a realistic first employer."
        }
      />

      {routes.map((route, i) => {
        const tint = tints[i % tints.length];
        return (
          <View
            key={i}
            style={{
              backgroundColor: palette.surface,
              borderRadius: 6,
              padding: 14,
              marginBottom: 10,
              borderLeftWidth: 2,
              borderLeftColor: tint.accent,
            }}
            wrap={false}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.heading.weight,
                  fontSize: 12,
                  color: palette.ink,
                }}
              >
                {route.label}
              </Text>
              {route.university.country && (
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: type.bodyStrong.family,
                    fontWeight: type.bodyStrong.weight,
                    color: tint.ink,
                    backgroundColor: tint.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                  }}
                >
                  {route.university.country}
                </Text>
              )}
            </View>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Study</Text>
                <Text style={[styles.body, { color: palette.ink, fontSize: 10, fontFamily: type.heading.family, fontWeight: type.subheading.weight }]}>
                  {route.university.name}
                </Text>
                {route.university.programme && (
                  <Text style={styles.body}>{route.university.programme}</Text>
                )}
                {route.university.city && (
                  <Text style={styles.caption}>
                    {[route.university.city, route.university.country].filter(Boolean).join(", ")}
                  </Text>
                )}
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>First role</Text>
                <Text style={[styles.body, { color: palette.ink, fontSize: 10, fontFamily: type.heading.family, fontWeight: type.subheading.weight }]}>
                  {route.employer.name}
                </Text>
                <Text style={styles.body}>{route.employer.role}</Text>
                {route.employer.city && <Text style={styles.caption}>{route.employer.city}</Text>}
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.sp8} />
      <InsightCard label="Why this matters" tone="accent">
        <Text style={styles.body}>
          International routes often come with lower tuition, English-taught programmes, and the
          kind of language, cultural, and network advantages employers value when you return home.
          Keep more than one route in view — it makes a single rejection or change of plan far less
          fatal.
        </Text>
      </InsightCard>
    </PageFrame>
  );
}

// ── Clarity (momentum + actions + reflections) ─────────────────────

export function ClarityPage({
  data,
  pageNumber,
  totalPages,
}: {
  data: ClaritySummary;
  pageNumber: number;
  totalPages: number;
}) {
  const momentumDone = data.momentum.filter((m) => m.done).length;
  const empty =
    data.momentum.length === 0 &&
    data.alignedActions.length === 0 &&
    data.reflections.length === 0;

  return (
    <PageFrame sectionLabel="Clarity" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Phase 03  ·  Clarity"
        title="Momentum and what you've decided"
        lead="Clarity is what exploration earns. This section captures the actions you've committed to, the ones you've already done, and the reflections you've written along the way."
      />

      {empty && (
        <EmptyState message="Momentum is where Clarity becomes real. Adding one concrete move in the Momentum panel will fill this section with substance." />
      )}

      {data.momentum.length > 0 && (
        <InsightCard
          label={`Your momentum  ·  ${momentumDone} of ${data.momentum.length} done`}
          tone="accent"
        >
          {data.momentum.map((action, i) => {
            const status =
              action.status === "done" || action.done
                ? { label: "Done", bg: palette.emeraldSoft, fg: palette.emerald }
                : action.status === "in_progress"
                  ? { label: "In progress", bg: palette.amberSoft, fg: palette.amber }
                  : { label: "Next", bg: palette.surfaceAlt, fg: palette.muted };
            return (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 7,
                  marginBottom: 6,
                }}
                wrap={false}
              >
                <Text
                  style={{
                    fontSize: 6.5,
                    fontFamily: type.bodyStrong.family,
                    fontWeight: type.bodyStrong.weight,
                    color: status.fg,
                    backgroundColor: status.bg,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 10,
                    letterSpacing: 0.7,
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  {status.label}
                </Text>
                {action.type && (
                  <Text
                    style={{
                      fontSize: 6.5,
                      fontFamily: type.bodyStrong.family,
                      fontWeight: type.bodyStrong.weight,
                      color: palette.violet,
                      backgroundColor: palette.violetSoft,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderRadius: 10,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      marginTop: 1,
                    }}
                  >
                    {action.type}
                  </Text>
                )}
                <Text
                  style={[
                    styles.body,
                    {
                      flex: 1,
                      textDecoration: action.done ? "line-through" : "none",
                    },
                  ]}
                >
                  {action.text}
                </Text>
              </View>
            );
          })}
        </InsightCard>
      )}

      {data.alignedActions.length > 0 && (
        <InsightCard label="Real-world actions completed">
          {data.alignedActions.map((action, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
                gap: 8,
              }}
            >
              <Svg style={{ width: 6, height: 6 }}>
                <Circle cx={3} cy={3} r={3} fill={palette.emerald} />
              </Svg>
              <Text
                style={{
                  fontSize: 6.5,
                  fontFamily: type.bodyStrong.family,
                  fontWeight: type.bodyStrong.weight,
                  color: palette.emerald,
                  backgroundColor: palette.emeraldSoft,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 10,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {action.type.replace(/_/g, " ")}
              </Text>
              <Text style={[styles.body, { flex: 1 }]}>{action.title}</Text>
            </View>
          ))}
        </InsightCard>
      )}

      {data.reflections.length > 0 && (
        <>
          <View style={styles.rule} />
          <Text style={styles.h1}>Reflections</Text>
          {data.reflections.slice(0, 6).map((r, i) => (
            <QuoteBlock key={i} text={r} />
          ))}
        </>
      )}
    </PageFrame>
  );
}

// ── Next steps ──────────────────────────────────────────────────────

export function NextStepsPage({
  steps,
  pageNumber,
  totalPages,
}: {
  steps: NextStep[];
  pageNumber: number;
  totalPages: number;
}) {
  const priorityTone: Record<
    NextStep["priority"],
    { bg: string; ink: string; label: string }
  > = {
    foundational: { bg: palette.roseSoft, ink: palette.rose, label: "Foundational" },
    next: { bg: palette.accentSoft, ink: palette.accent, label: "Next move" },
    stretch: { bg: palette.violetSoft, ink: palette.violet, label: "Stretch" },
  };

  return (
    <PageFrame sectionLabel="Next steps" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="What to do next"
        title="Your next six moves"
        lead="Recommendations that follow directly from what you've explored. Each one is concrete, small enough to act on, and chosen to move you forward without overwhelming."
      />

      {steps.map((step, i) => {
        const tone = priorityTone[step.priority];
        return (
          <View
            key={i}
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 10,
              paddingBottom: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: palette.hairlineSoft,
            }}
            wrap={false}
          >
            <View style={{ width: 82, paddingTop: 3 }}>
              <Text
                style={{
                  fontSize: 6.5,
                  fontFamily: type.bodyStrong.family,
                  fontWeight: type.bodyStrong.weight,
                  color: tone.ink,
                  backgroundColor: tone.bg,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 10,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  alignSelf: "flex-start",
                }}
              >
                {tone.label}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: type.heading.family,
                  fontWeight: type.heading.weight,
                  fontSize: 11,
                  color: palette.ink,
                  marginBottom: 3,
                }}
              >
                {step.headline}
              </Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          </View>
        );
      })}
    </PageFrame>
  );
}

// ── Closing page ───────────────────────────────────────────────────

export function ClosingPage({
  vm,
  pageNumber,
  totalPages,
}: {
  vm: JourneyReportViewModel;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageFrame sectionLabel="Closing" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader
        eyebrow="Closing"
        title="A journey, not a verdict"
        lead="Everything in this report is a draft of a future — considered, not decided. You can open My Journey again any time and move it forward at your own pace."
      />

      {vm.closingReflections.length > 0 && (
        <>
          <Text style={styles.h1}>In your own words</Text>
          {vm.closingReflections.slice(0, 4).map((r, i) => (
            <QuoteBlock key={i} text={r} />
          ))}
          <View style={styles.sp16} />
        </>
      )}

      <View
        style={{
          backgroundColor: palette.surfaceDeep,
          borderRadius: 8,
          padding: 22,
          marginTop: 6,
        }}
      >
        <Text
          style={{
            fontFamily: type.display.family,
            fontWeight: type.display.weight,
            fontSize: 16,
            color: "#FFFFFF",
            marginBottom: 10,
            letterSpacing: -0.2,
          }}
        >
          Your journey is uniquely yours.
        </Text>
        <Text
          style={{
            fontFamily: type.body.family,
            fontSize: 10.5,
            color: "#CBD5E1",
            lineHeight: 1.65,
          }}
        >
          Every step you take — whether exploring, learning, or doing — builds toward the future
          you want. Pace is a feature, not a bug. Keep one thing moving at a time, revisit this
          report when you need perspective, and trust that clarity is something you build, not
          something that arrives.
        </Text>
        <View style={{ height: 14 }} />
        <HairlineRule width={40} color={palette.cover.accent} height={2} />
        <Text
          style={{
            fontFamily: type.bodyStrong.family,
            fontWeight: type.bodyStrong.weight,
            fontSize: 8,
            color: palette.cover.muted,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginTop: 12,
          }}
        >
          Endeavrly  ·  My Journey
        </Text>
      </View>

      <View style={styles.sp16} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.caption}>
          {`Report generated on ${vm.cover.generatedDate}${vm.cover.careerTitle ? `  ·  ${vm.cover.careerTitle}` : ""}`}
        </Text>
        <PhaseMarker n={pageNumber} label="End of report" color={palette.accent} />
      </View>
    </PageFrame>
  );
}

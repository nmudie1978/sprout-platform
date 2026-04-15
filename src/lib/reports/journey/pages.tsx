import React from "react";
import { Page, Text, View, Svg, Rect, Path, Circle } from "@react-pdf/renderer";
import { palette, stageColors, styles, type } from "./theme";
import {
  ActionListItem,
  BulletList,
  Callout,
  EditorialBlock,
  EmptyState,
  HairlineRule,
  InsightCard,
  KeyValueList,
  PageFrame,
  QuoteBlock,
  SectionHeader,
  StageLegend,
  StatStrip,
  TagList,
  TimelineItem,
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

// ═══════════════════════════════════════════════════════════════════
//  Cover
// ═══════════════════════════════════════════════════════════════════

/**
 * A dark, editorial cover. Title sits in the upper third; subtitle
 * anchors the middle; generated-date block closes out at the bottom.
 * All spacing uses `justifyContent: space-between` to stay balanced
 * regardless of career-title length.
 */
export function CoverPage({ vm }: { vm: JourneyReportViewModel }) {
  const { cover } = vm;
  return (
    <Page
      size="A4"
      style={{
        backgroundColor: palette.cover.bg,
        paddingHorizontal: 58,
        paddingVertical: 64,
        fontFamily: type.heading.family,
        justifyContent: "space-between",
      }}
    >
      {/* Top — brand line */}
      <View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Svg style={{ width: 16, height: 16 }} viewBox="0 0 20 20">
            <Path d="M10 2 L18 18 L10 13 L2 18 Z" fill={palette.cover.accent} />
          </Svg>
          <Text
            style={{
              fontFamily: type.bodyStrong.family,
              fontWeight: type.bodyStrong.weight,
              fontSize: 9,
              color: palette.cover.text,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Endeavrly
          </Text>
        </View>
      </View>

      {/* Middle — title block */}
      <View>
        <Text
          style={{
            fontFamily: type.bodyStrong.family,
            fontWeight: type.bodyStrong.weight,
            fontSize: 9,
            color: palette.cover.accent,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          My Journey Report
        </Text>

        <Text
          style={{
            fontFamily: type.display.family,
            fontWeight: type.display.weight,
            fontSize: 52,
            lineHeight: 1.04,
            color: palette.cover.text,
            letterSpacing: -1.2,
            marginBottom: 18,
            maxWidth: 440,
          }}
        >
          {cover.careerTitle
            ? `A considered path to ${cover.careerTitle}.`
            : "A considered look at where you're going."}
        </Text>

        <View style={{ height: 20 }} />
        <View style={{ height: 0.75, width: 64, backgroundColor: palette.cover.accent }} />
        <View style={{ height: 20 }} />

        <Text
          style={{
            fontFamily: type.body.family,
            fontSize: 12,
            color: palette.cover.muted,
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          {cover.subtitle ||
            "A structured summary of what you're exploring, what you've learned, and what comes next."}
        </Text>
      </View>

      {/* Bottom — metadata */}
      <View>
        <View style={{ height: 0.5, backgroundColor: palette.cover.rule, marginBottom: 22 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                fontSize: 13,
                color: palette.cover.text,
                letterSpacing: -0.1,
              }}
            >
              {cover.generatedDate}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
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
              Prepared by
            </Text>
            <Text
              style={{
                fontFamily: type.heading.family,
                fontWeight: type.subheading.weight,
                fontSize: 13,
                color: palette.cover.text,
                letterSpacing: -0.1,
              }}
            >
              Endeavrly · My Journey
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Contents
// ═══════════════════════════════════════════════════════════════════

export interface TocEntry {
  n: number;
  title: string;
  pageNumber: number;
}

/**
 * Editorial contents page. Number column, title (flex), page number.
 * Rows separated by hairlines for that magazine-index feel.
 */
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

      <View style={{ marginTop: 8 }}>
        {entries.map((entry, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              borderBottomWidth: 0.5,
              borderBottomColor: palette.hairline,
            }}
          >
            <Text
              style={{
                width: 36,
                fontFamily: type.display.family,
                fontWeight: type.display.weight,
                fontSize: 12,
                color: palette.accent,
                letterSpacing: -0.2,
              }}
            >
              {String(entry.n).padStart(2, "0")}
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: type.heading.family,
                fontWeight: type.subheading.weight,
                fontSize: 12.5,
                color: palette.ink,
                letterSpacing: -0.1,
              }}
            >
              {entry.title}
            </Text>
            <Text
              style={{
                fontFamily: type.body.family,
                fontSize: 9.5,
                color: palette.subtle,
                letterSpacing: 0.4,
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

// Legacy export kept for backwards compatibility.
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
      <SectionHeader eyebrow="Summary" title={data.headline} />
      {data.paragraphs.map((p, i) => (
        <Text key={i} style={[styles.bodyLg, { marginBottom: 10 }]}>
          {p}
        </Text>
      ))}
    </PageFrame>
  );
}

// Legacy export kept for backwards compatibility.
export function DiscoverPage({
  data,
  pageNumber,
  totalPages,
}: {
  data: DiscoverSummary;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <PageFrame sectionLabel="Discover" pageNumber={pageNumber} totalPages={totalPages}>
      <SectionHeader eyebrow="Discover" title="Who you are" />
      {data.radar?.summaryLines.length ? (
        <BulletList items={data.radar.summaryLines} />
      ) : (
        <EmptyState message="Discover reflections haven't been captured yet." />
      )}
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Career Summary (Understand)
// ═══════════════════════════════════════════════════════════════════

/**
 * A career-summary page in the editorial mode:
 *   1. Overview (catalog description + user's role-reality notes).
 *   2. Stat strip — salary / demand outlook / education path.
 *   3. Structured two-column blocks — what you do, who suits, skills,
 *      reality check.
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
  const stats: Array<{ label: string; value: string }> = [];
  if (data.facts?.avgSalary) stats.push({ label: "Entry salary", value: data.facts.avgSalary });
  if (data.facts?.growthOutlookLabel)
    stats.push({ label: "Demand outlook", value: data.facts.growthOutlookLabel });
  if (data.facts?.educationPath)
    stats.push({ label: "Education path", value: data.facts.educationPath });

  const hasAnything =
    data.facts ||
    data.insights ||
    data.requirements ||
    data.programmes.length > 0 ||
    data.certifications ||
    data.roleReality.length > 0 ||
    data.industryInsights.length > 0;

  return (
    <PageFrame
      sectionLabel="Career Summary"
      pageNumber={pageNumber}
      totalPages={totalPages}
    >
      <SectionHeader
        eyebrow="Career Summary"
        title={career ? career : "Career Summary"}
        lead={
          career
            ? `What the role actually looks like, what it asks of you, and what you'd need to build to get there.`
            : "Exploration is what turns a career name into a decision."
        }
      />

      {/* Stat strip — headline facts */}
      {stats.length > 0 && <StatStrip items={stats} />}

      {/* Overview paragraph — from catalog */}
      {data.facts?.description && (
        <View style={{ marginBottom: 22 }}>
          <Text style={styles.bodyLg}>{data.facts.description}</Text>
        </View>
      )}

      {/* User's notes — elevated, surfaces the user's voice before
          catalog content. */}
      {data.roleReality.length > 0 && (
        <Callout label="What you noted about the role" tone="accent">
          <BulletList items={data.roleReality} max={6} />
        </Callout>
      )}

      {/* What you actually do — full-width because this is long-form */}
      {data.insights?.whatYouActuallyDo && data.insights.whatYouActuallyDo.length > 0 && (
        <EditorialBlock label="What you actually do day-to-day">
          <BulletList items={data.insights.whatYouActuallyDo} max={6} />
        </EditorialBlock>
      )}

      {/* Two-column — skills + who this suits */}
      <View style={{ flexDirection: "row", gap: 22, marginBottom: 12 }}>
        {data.insights?.topSkills && data.insights.topSkills.length > 0 && (
          <View style={{ flex: 1 }}>
            <View style={styles.ruleSoft} />
            <View style={{ height: 8 }} />
            <Text style={styles.label}>Key skills to build</Text>
            <TagList
              items={data.insights.topSkills}
              color={palette.blue}
              bg={palette.blueSoft}
              max={10}
            />
          </View>
        )}
        {data.insights?.whoThisIsGoodFor && data.insights.whoThisIsGoodFor.length > 0 && (
          <View style={{ flex: 1 }}>
            <View style={styles.ruleSoft} />
            <View style={{ height: 8 }} />
            <Text style={styles.label}>Who this suits</Text>
            <BulletList items={data.insights.whoThisIsGoodFor} max={5} />
          </View>
        )}
      </View>

      {data.insights?.realityCheck && (
        <Callout label="Reality check" tone="muted">
          {data.insights.realityCheck}
        </Callout>
      )}

      {data.industryInsights.length > 0 && (
        <EditorialBlock label="Your industry notes">
          <BulletList items={data.industryInsights} max={6} />
        </EditorialBlock>
      )}

      {!hasAnything && (
        <EmptyState message="Nothing has been captured in Understand yet. Reading the role reality, making notes, and saving a few qualifications or courses will fill this section with substance." />
      )}
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  The Path (Understand, subpage)
// ═══════════════════════════════════════════════════════════════════

/**
 * Structured breakdown of how someone qualifies for this career:
 *   - Required / recommended subjects
 *   - Grade expectation
 *   - University programme
 *   - Entry role
 *   - Qualifies for (immediate / with experience)
 *   - Certifications
 *
 * Uses KeyValueList for the factual core and TagList for subject chips.
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
  const req = data.requirements;

  const pathFacts: Array<{ label: string; value: string }> = [];
  if (req?.universityPath?.programme)
    pathFacts.push({ label: "Programme", value: req.universityPath.programme });
  if (req?.universityPath?.duration)
    pathFacts.push({ label: "Duration", value: req.universityPath.duration });
  if (req?.universityPath?.type)
    pathFacts.push({
      label: "Qualification",
      value: capitalise(req.universityPath.type),
    });
  if (req?.universityPath?.applicationRoute)
    pathFacts.push({ label: "Apply via", value: req.universityPath.applicationRoute });
  if (req?.subjects?.minimumGrade)
    pathFacts.push({ label: "Grade expectation", value: req.subjects.minimumGrade });

  const entryFacts: Array<{ label: string; value: string }> = [];
  if (req?.entryLevel?.title)
    entryFacts.push({ label: "First role", value: req.entryLevel.title });
  if (req?.qualifiesFor?.immediate)
    entryFacts.push({ label: "Qualifies you for", value: req.qualifiesFor.immediate });
  if (req?.qualifiesFor?.withExperience)
    entryFacts.push({
      label: "With experience",
      value: req.qualifiesFor.withExperience,
    });

  const hasSubjects =
    (req?.subjects?.required?.length ?? 0) > 0 ||
    (req?.subjects?.recommended?.length ?? 0) > 0;

  return (
    <PageFrame
      sectionLabel="The Path"
      pageNumber={pageNumber}
      totalPages={totalPages}
    >
      <SectionHeader
        eyebrow="Understand · The Path"
        title={career ? `The path to ${career}` : "The path to the role"}
        lead="How people qualify: the school subjects, university route, and first role you'd be ready to step into."
      />

      {/* Subjects */}
      {hasSubjects && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.h2, { marginBottom: 14 }]}>School subjects</Text>
          <View style={{ flexDirection: "row", gap: 24 }}>
            {(req?.subjects.required.length ?? 0) > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Required</Text>
                <TagList
                  items={req!.subjects.required}
                  color={palette.accent}
                  bg={palette.accentSoft}
                  max={10}
                />
              </View>
            )}
            {(req?.subjects.recommended.length ?? 0) > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Recommended</Text>
                <TagList
                  items={req!.subjects.recommended}
                  color={palette.violet}
                  bg={palette.violetSoft}
                  max={10}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* University programme + key facts */}
      {pathFacts.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.h2, { marginBottom: 14 }]}>University route</Text>
          <KeyValueList items={pathFacts} />
          {(req?.universityPath?.examples?.length ?? 0) > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.label, { marginBottom: 6 }]}>Example institutions</Text>
              <Text style={[styles.body, { color: palette.body }]}>
                {req!.universityPath.examples.slice(0, 6).join(" · ")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Entry level + progression */}
      {entryFacts.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.h2, { marginBottom: 14 }]}>Where you start</Text>
          <KeyValueList items={entryFacts} />
          {req?.entryLevel?.description && (
            <Text
              style={[styles.body, { color: palette.muted, marginTop: 4, lineHeight: 1.62 }]}
            >
              {req.entryLevel.description}
            </Text>
          )}
        </View>
      )}

      {/* Certifications — treated as a stand-alone page section */}
      {data.certifications && data.certifications.certifications.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.h2, { marginBottom: 6 }]}>Certifications worth knowing</Text>
          {data.certifications.summary && (
            <Text
              style={[styles.body, { color: palette.muted, marginBottom: 12, maxWidth: 440 }]}
            >
              {data.certifications.summary}
            </Text>
          )}
          <View>
            {data.certifications.certifications.slice(0, 6).map((c, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0.5,
                  borderBottomColor: palette.hairline,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 16,
                  ...(i === 0 ? { borderTopWidth: 0.75, borderTopColor: palette.divider } : {}),
                }}
                wrap={false}
              >
                <View style={{ flex: 2 }}>
                  <Text
                    style={{
                      fontFamily: type.heading.family,
                      fontWeight: type.subheading.weight,
                      fontSize: 10.5,
                      color: palette.ink,
                      marginBottom: 2,
                      letterSpacing: -0.05,
                    }}
                  >
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 8.5, color: palette.subtle }}>{c.provider}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 9, color: palette.muted }}>
                  {c.duration}
                </Text>
                <Text style={{ flex: 1, fontSize: 9, color: palette.muted }}>
                  {c.recognised}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.facts?.pensionNote && (
        <Callout label="Pension & benefits note" tone="muted">
          {data.facts.pensionNote}
        </Callout>
      )}
    </PageFrame>
  );
}

function capitalise(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// ═══════════════════════════════════════════════════════════════════
//  Roadmap
// ═══════════════════════════════════════════════════════════════════

const ITEMS_PER_ROADMAP_PAGE = 7;

/**
 * A true vertical timeline. Each step is a TimelineItem (stage dot +
 * connector rail + content column); @react-pdf auto-breaks across
 * pages if the step count would overflow, and TimelineItem is
 * wrap={false} so no single step splits mid-row.
 */
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
  itemsPerPage?: number;
}): React.ReactElement[] {
  const perPage = itemsPerPage ?? ITEMS_PER_ROADMAP_PAGE;
  const hasItems = data.items.length > 0;
  const hasSchoolTrack = data.schoolTrack.length > 0;
  void education;

  if (!hasItems && !hasSchoolTrack) {
    return [
      <PageFrame
        key="rm-empty"
        sectionLabel="Your Path"
        pageNumber={startingPageNumber}
        totalPages={totalPages}
      >
        <SectionHeader
          eyebrow="Your Path"
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
    const sliceLastIdx = slice.length - 1;

    out.push(
      <PageFrame
        key={`rm-${p}`}
        sectionLabel="Your Path"
        pageNumber={pageNumber}
        totalPages={totalPages}
      >
        {isFirst ? (
          <SectionHeader
            eyebrow="Your Path"
            title={data.career ? `Your path to ${data.career}` : "Your personal roadmap"}
            lead={
              data.isFallback
                ? "A draft roadmap built from the career's real requirements and your current age. Open the Clarity tab in-app to refine it."
                : "An age-anchored timeline from today to a senior role — the version captured on the day this report was generated."
            }
          />
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.h1}>Your path, continued</Text>
            <View style={{ height: 14 }} />
            <View style={styles.rule} />
          </View>
        )}

        {isFirst && hasItems && (
          <StageLegend
            stages={[
              { label: "Foundation", color: stageColors.foundation.accent },
              { label: "Education", color: stageColors.education.accent },
              { label: "Experience", color: stageColors.experience.accent },
              { label: "Career", color: stageColors.career.accent },
            ]}
          />
        )}

        {slice.length > 0 && (
          <View>
            {slice.map((step, i) => {
              const stage = stageColors[step.stage];
              const stageLabel = step.stage[0].toUpperCase() + step.stage.slice(1);
              const startYear =
                data.birthYear != null ? data.birthYear + step.startAge : null;
              const endYear =
                data.birthYear != null && step.endAge != null
                  ? data.birthYear + step.endAge
                  : null;
              const ageLabel = step.endAge
                ? `Age ${step.startAge}–${step.endAge}`
                : `Age ${step.startAge}`;
              const yearLabel = startYear
                ? endYear && endYear !== startYear
                  ? `${startYear}–${endYear}`
                  : `${startYear}`
                : undefined;
              const isLast = i === sliceLastIdx && isLastRoadmapPage && !hasSchoolTrack;
              const summary = step.subtitle || step.description || undefined;
              return (
                <TimelineItem
                  key={i}
                  stage={step.stage}
                  stageLabel={stageLabel}
                  stageColor={stage.accent}
                  stageBg={stage.bg}
                  stageInk={stage.ink}
                  title={step.title}
                  summary={summary}
                  ageLabel={ageLabel}
                  yearLabel={yearLabel}
                  isMilestone={step.isMilestone}
                  isLast={isLast}
                />
              );
            })}
          </View>
        )}

        {isLastRoadmapPage && hasSchoolTrack && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.rule} />
            <View style={{ height: 18 }} />
            <Text style={[styles.h2, { marginBottom: 6 }]}>Learning track</Text>
            <Text style={[styles.bodyMuted, { marginBottom: 14, maxWidth: 440 }]}>
              The subjects and personal learning that run alongside your roadmap.
            </Text>
            {data.schoolTrack.map((item, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 0.5,
                  borderBottomColor: palette.hairline,
                  ...(i === 0 ? { borderTopWidth: 0.5, borderTopColor: palette.hairline } : {}),
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
                      fontSize: 10.5,
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
                      paddingVertical: 2.5,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.stage}
                  </Text>
                </View>
                {item.subjects.length > 0 && (
                  <TagList
                    items={item.subjects}
                    color={palette.blue}
                    bg={palette.blueSoft}
                    max={10}
                  />
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

// ═══════════════════════════════════════════════════════════════════
//  Alternative routes
// ═══════════════════════════════════════════════════════════════════

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

  return (
    <PageFrame
      sectionLabel="Alternative Routes"
      pageNumber={pageNumber}
      totalPages={totalPages}
    >
      <SectionHeader
        eyebrow="Alternative Routes"
        title="More than one way in"
        lead={
          career
            ? `Real paths people take to ${career} — each with a specific university and a realistic first employer. Any of these can get you there.`
            : "Real paths people take into this career — each with a specific university and a realistic first employer."
        }
      />

      <View>
        {routes.map((route, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: palette.hairline,
              ...(i === 0 ? { borderTopWidth: 0.75, borderTopColor: palette.divider } : {}),
            }}
            wrap={false}
          >
            {/* Route header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
                <Text
                  style={{
                    fontFamily: type.display.family,
                    fontWeight: type.display.weight,
                    fontSize: 10,
                    color: palette.faint,
                    letterSpacing: -0.2,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text
                  style={{
                    fontFamily: type.heading.family,
                    fontWeight: type.heading.weight,
                    fontSize: 13,
                    color: palette.ink,
                    letterSpacing: -0.1,
                  }}
                >
                  {route.label}
                </Text>
              </View>
              {route.university.country && (
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: type.bodyStrong.family,
                    fontWeight: type.bodyStrong.weight,
                    color: palette.subtle,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  {route.university.country}
                </Text>
              )}
            </View>

            {/* Two-column route detail */}
            <View style={{ flexDirection: "row", gap: 22 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 6 }]}>Study</Text>
                <Text
                  style={{
                    fontFamily: type.heading.family,
                    fontWeight: type.subheading.weight,
                    fontSize: 10.5,
                    color: palette.ink,
                    marginBottom: 2,
                    letterSpacing: -0.05,
                  }}
                >
                  {route.university.name}
                </Text>
                {route.university.programme && (
                  <Text style={[styles.body, { color: palette.muted, marginBottom: 2 }]}>
                    {route.university.programme}
                  </Text>
                )}
                {route.university.city && (
                  <Text style={styles.caption}>
                    {[route.university.city, route.university.country]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { marginBottom: 6 }]}>First role</Text>
                <Text
                  style={{
                    fontFamily: type.heading.family,
                    fontWeight: type.subheading.weight,
                    fontSize: 10.5,
                    color: palette.ink,
                    marginBottom: 2,
                    letterSpacing: -0.05,
                  }}
                >
                  {route.employer.name}
                </Text>
                <Text style={[styles.body, { color: palette.muted, marginBottom: 2 }]}>
                  {route.employer.role}
                </Text>
                {route.employer.city && (
                  <Text style={styles.caption}>{route.employer.city}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
      <Callout label="Why this matters" tone="accent">
        International routes often come with lower tuition, English-taught programmes, and the kind
        of language, cultural, and network advantages employers value when you return home. Keep
        more than one route in view — it makes a single rejection or change of plan far less fatal.
      </Callout>
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Clarity (legacy)
// ═══════════════════════════════════════════════════════════════════

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
        eyebrow="Clarity"
        title="Momentum and what you've decided"
        lead="Clarity is what exploration earns. This section captures the actions you've committed to, the ones you've already done, and the reflections you've written along the way."
      />

      {empty && (
        <EmptyState message="Momentum is where Clarity becomes real. Adding one concrete move in the Momentum panel will fill this section with substance." />
      )}

      {data.momentum.length > 0 && (
        <EditorialBlock label={`Your momentum  ·  ${momentumDone} of ${data.momentum.length} done`}>
          {data.momentum.map((action, i) => {
            const statusStyle =
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
                  gap: 8,
                  paddingVertical: 6,
                }}
                wrap={false}
              >
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: type.bodyStrong.family,
                    fontWeight: type.bodyStrong.weight,
                    color: statusStyle.fg,
                    backgroundColor: statusStyle.bg,
                    paddingHorizontal: 7,
                    paddingVertical: 2.5,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {statusStyle.label}
                </Text>
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
        </EditorialBlock>
      )}

      {data.reflections.length > 0 && (
        <>
          <View style={styles.sp16} />
          <Text style={[styles.h2, { marginBottom: 12 }]}>Reflections</Text>
          {data.reflections.slice(0, 6).map((r, i) => (
            <QuoteBlock key={i} text={r} />
          ))}
        </>
      )}
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Next steps
// ═══════════════════════════════════════════════════════════════════

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
    <PageFrame
      sectionLabel="Next Moves"
      pageNumber={pageNumber}
      totalPages={totalPages}
    >
      <SectionHeader
        eyebrow="Your Next Moves"
        title="Six concrete moves from here"
        lead="Each one is small enough to act on, chosen to follow directly from what you've explored, and placed on the right priority ladder."
      />

      {steps.length === 0 ? (
        <EmptyState message="Your next moves will appear here once your journey has enough context to recommend specific actions." />
      ) : (
        <View>
          {steps.map((step, i) => {
            const tone = priorityTone[step.priority];
            return (
              <ActionListItem
                key={i}
                number={i + 1}
                priorityLabel={tone.label}
                priorityInk={tone.ink}
                priorityBg={tone.bg}
                headline={step.headline}
                body={step.body}
                isLast={i === steps.length - 1}
              />
            );
          })}
        </View>
      )}
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Closing
// ═══════════════════════════════════════════════════════════════════

/**
 * Spacious, calm ending. Reflections rendered as pull-quotes, closing
 * statement on an inked panel, tiny meta row at the bottom.
 */
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
        <View style={{ marginBottom: 28 }}>
          <Text style={[styles.h2, { marginBottom: 12 }]}>In your own words</Text>
          {vm.closingReflections.slice(0, 4).map((r, i) => (
            <QuoteBlock key={i} text={r} />
          ))}
        </View>
      )}

      <View
        style={{
          backgroundColor: palette.surfaceDeep,
          padding: 28,
          marginTop: 6,
        }}
      >
        <Text
          style={{
            fontFamily: type.display.family,
            fontWeight: type.display.weight,
            fontSize: 20,
            color: "#FFFFFF",
            marginBottom: 14,
            letterSpacing: -0.4,
            lineHeight: 1.22,
            maxWidth: 400,
          }}
        >
          Your journey is uniquely yours.
        </Text>
        <Text
          style={{
            fontFamily: type.body.family,
            fontSize: 11,
            color: "#CBD5E1",
            lineHeight: 1.68,
            maxWidth: 440,
          }}
        >
          Every step you take — whether exploring, learning, or doing — builds toward the future
          you want. Pace is a feature, not a bug. Keep one thing moving at a time, revisit this
          report when you need perspective, and trust that clarity is something you build, not
          something that arrives.
        </Text>
        <View style={{ height: 18 }} />
        <HairlineRule width={36} color={palette.cover.accent} height={1.5} />
        <Text
          style={{
            fontFamily: type.bodyStrong.family,
            fontWeight: type.bodyStrong.weight,
            fontSize: 8,
            color: palette.cover.muted,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            marginTop: 14,
          }}
        >
          Endeavrly  ·  My Journey
        </Text>
      </View>

      <View style={{ height: 20 }} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTopWidth: 0.5,
          borderTopColor: palette.hairline,
        }}
      >
        <Text style={styles.caption}>
          {`Report generated on ${vm.cover.generatedDate}${vm.cover.careerTitle ? `  ·  ${vm.cover.careerTitle}` : ""}`}
        </Text>
        <Text style={[styles.caption, { letterSpacing: 0.4 }]}>End of report</Text>
      </View>
    </PageFrame>
  );
}

// Keep secondary SVG primitive exports for legacy consumers.
export { Svg, Rect, Path, Circle };

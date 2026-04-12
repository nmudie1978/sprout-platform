import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Line,
  Rect,
  Path,
} from "@react-pdf/renderer";

// ── Color Palette ──────────────────────────────────────────────────

const c = {
  // Core
  ink: "#0F172A",
  body: "#334155",
  muted: "#475569",
  subtle: "#94A3B8",
  faint: "#CBD5E1",
  // Backgrounds
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#F1F5F9",
  // Accents
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  tealMid: "#99F6E4",
  emerald: "#059669",
  emeraldLight: "#D1FAE5",
  violet: "#7C3AED",
  violetLight: "#EDE9FE",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  blue: "#2563EB",
  blueLight: "#DBEAFE",
  rose: "#E11D48",
  roseLight: "#FFE4E6",
  // Dividers
  divider: "#E2E8F0",
  dividerLight: "#F1F5F9",
  // Cover
  coverBg: "#0F172A",
  coverAccent: "#0D9488",
  coverText: "#F8FAFC",
  coverMuted: "#94A3B8",
};

// ── Stage Colors ──────────────────────────────────────────────────

const stageColors = {
  foundation: { bg: "#ECFDF5", text: "#059669", accent: "#10B981" },
  education: { bg: "#DBEAFE", text: "#2563EB", accent: "#3B82F6" },
  experience: { bg: "#FFF7ED", text: "#C2410C", accent: "#F97316" },
  career: { bg: "#FEF3C7", text: "#B45309", accent: "#F59E0B" },
};

// ── Styles ─────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Pages
  page: {
    backgroundColor: c.bg,
    paddingTop: 44,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    fontSize: 9.5,
    lineHeight: 1.55,
    color: c.body,
  },
  coverPage: {
    backgroundColor: c.coverBg,
    paddingHorizontal: 52,
    paddingVertical: 52,
    fontFamily: "Poppins",
    justifyContent: "space-between" as const,
  },

  // Footer / Page Number
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 44,
    fontSize: 8,
    color: c.subtle,
    fontFamily: "Inter",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    fontSize: 7,
    color: c.faint,
    fontFamily: "Inter",
    letterSpacing: 0.3,
  },

  // Typography
  h1: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 1.15,
    color: c.ink,
    marginBottom: 2,
  },
  h2: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1.2,
    color: c.ink,
    marginBottom: 10,
  },
  h3: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 11,
    color: c.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: c.muted,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  label: {
    fontSize: 7.5,
    fontWeight: 500,
    color: c.subtle,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 5,
  },

  // Cards
  card: {
    backgroundColor: c.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  cardAccent: {
    backgroundColor: c.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: c.teal,
  },

  // Tags
  tag: {
    fontSize: 8,
    fontWeight: 500,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },

  // Bullets
  bullet: {
    fontSize: 9,
    color: c.body,
    marginBottom: 4,
    paddingLeft: 10,
    lineHeight: 1.5,
  },

  // Layout
  divider: {
    height: 1,
    backgroundColor: c.divider,
    marginVertical: 16,
  },
  row: {
    flexDirection: "row" as const,
    gap: 10,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 14,
    gap: 8,
  },
  badge: {
    fontSize: 7,
    fontWeight: 600,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    letterSpacing: 0.5,
  },

  // Spacers
  spacerSm: { height: 8 },
  spacerMd: { height: 16 },
  spacerLg: { height: 24 },
});

// ── Types ────────────────────────────────────────────────────────────

export interface RoadmapItem {
  stage: "foundation" | "education" | "experience" | "career";
  title: string;
  subtitle?: string;
  startAge: number;
  endAge?: number;
  isMilestone: boolean;
  description?: string;
  microActions?: string[];
}

export interface SchoolTrackItem {
  stage: "foundation" | "education" | "experience" | "career";
  title: string;
  subjects: string[];
  personalLearning?: string;
  startAge: number;
  endAge?: number;
}

export interface JourneyReportData {
  userName: string;
  goalTitle: string | null;
  generatedDate: string;
  // Discover
  strengths: string[];
  motivations: string[];
  workStyle: string[];
  growthAreas: string[];
  roleModels: string;
  experiences: string;
  careerInterests: string[];
  // Understand
  roleRealityNotes: string[];
  industryInsightNotes: string[];
  pathQualifications: string[];
  pathSkills: string[];
  pathCourses: string[];
  pathRequirements: string[];
  actionPlan: {
    roleTitle?: string;
    shortTermActions?: string[];
    midTermMilestone?: string;
    skillToBuild?: string;
  } | null;
  // Clarity
  alignedActions: { type: string; title: string }[];
  reflections: string[];
  // School
  educationStage: string | null;
  schoolName: string | null;
  subjects: string[];
  expectedCompletion: string | null;
  // Education Roadmap (from Clarity section)
  roadmapItems: RoadmapItem[];
  schoolTrack: SchoolTrackItem[];
  roadmapCareer: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────

function TagList({
  items,
  color = c.teal,
  bgColor = c.tealLight,
}: {
  items: string[];
  color?: string;
  bgColor?: string;
}) {
  if (items.length === 0) return null;
  return (
    <View style={s.tagRow}>
      {items.map((item, i) => (
        <Text key={i} style={[s.tag, { color, backgroundColor: bgColor }]}>
          {item}
        </Text>
      ))}
    </View>
  );
}

function BulletList({
  items,
  color = c.body,
}: {
  items: string[];
  color?: string;
}) {
  if (items.length === 0) return null;
  return (
    <View>
      {items.map((item, i) => (
        <Text key={i} style={[s.bullet, { color }]}>
          {"\u2022"}  {item}
        </Text>
      ))}
    </View>
  );
}

function Section({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <View style={accent ? s.cardAccent : s.card}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function StageBadge({
  stage,
  label,
}: {
  stage: number;
  label: string;
}) {
  const configs = [
    { bg: c.tealLight, color: c.teal },
    { bg: c.emeraldLight, color: c.emerald },
    { bg: c.amberLight, color: c.amber },
  ];
  const cfg = configs[stage - 1] || configs[0];
  return (
    <View style={s.sectionHeader}>
      <Text style={[s.badge, { backgroundColor: cfg.bg, color: cfg.color }]}>
        STAGE {stage}
      </Text>
      <Text style={s.h2}>{label}</Text>
    </View>
  );
}

function MetricCard({
  value,
  label,
  color = c.teal,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.surface,
        borderRadius: 8,
        padding: 12,
        alignItems: "center" as const,
      }}
    >
      <Text
        style={{
          fontFamily: "Poppins",
          fontWeight: 600,
          fontSize: 20,
          color,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 7.5, color: c.subtle, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View
      style={{
        backgroundColor: c.surfaceAlt,
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          color: c.subtle,
          textAlign: "center" as const,
          fontStyle: "italic" as const,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

// ── Roadmap Visual Components ─────────────────────────────────────

function RoadmapTimelineNode({
  item,
  index,
  isLast,
}: {
  item: RoadmapItem;
  index: number;
  isLast: boolean;
}) {
  const colors = stageColors[item.stage] || stageColors.foundation;
  const stageLabel = item.stage.charAt(0).toUpperCase() + item.stage.slice(1);
  const ageText = item.endAge
    ? `Age ${item.startAge}–${item.endAge}`
    : `Age ${item.startAge}`;

  return (
    <View
      style={{
        flexDirection: "row" as const,
        marginBottom: isLast ? 0 : 4,
        minHeight: 48,
      }}
      wrap={false}
    >
      {/* Timeline connector */}
      <View
        style={{
          width: 32,
          alignItems: "center" as const,
          position: "relative" as const,
        }}
      >
        {/* Vertical line */}
        {!isLast && (
          <Svg
            style={{
              position: "absolute",
              top: 10,
              left: 14,
              width: 4,
              height: "100%",
            }}
          >
            <Line
              x1="2"
              y1="0"
              x2="2"
              y2="100"
              stroke={c.divider}
              strokeWidth={1.5}
            />
          </Svg>
        )}
        {/* Node dot */}
        <Svg style={{ width: 20, height: 20 }}>
          {item.isMilestone ? (
            <>
              <Circle cx="10" cy="10" r="9" fill={colors.bg} />
              <Circle cx="10" cy="10" r="6" fill={colors.accent} />
              <Circle cx="10" cy="10" r="3" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <Circle cx="10" cy="10" r="7" fill={colors.bg} />
              <Circle cx="10" cy="10" r="4.5" fill={colors.accent} />
            </>
          )}
        </Svg>
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          borderRadius: 6,
          padding: 10,
          marginBottom: 4,
          borderLeftWidth: 2,
          borderLeftColor: colors.accent,
        }}
      >
        <View
          style={{
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            alignItems: "center" as const,
            marginBottom: 3,
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: 9.5,
              color: colors.text,
            }}
          >
            {item.title}
          </Text>
          <View style={{ flexDirection: "row" as const, gap: 4 }}>
            <Text
              style={[
                s.badge,
                {
                  backgroundColor: `${colors.accent}20`,
                  color: colors.text,
                  fontSize: 6.5,
                },
              ]}
            >
              {stageLabel}
            </Text>
            <Text
              style={{
                fontSize: 7,
                color: c.subtle,
                paddingVertical: 2,
              }}
            >
              {ageText}
            </Text>
          </View>
        </View>
        {item.subtitle && (
          <Text style={{ fontSize: 8, color: c.muted, marginBottom: 2 }}>
            {item.subtitle}
          </Text>
        )}
        {item.description && (
          <Text style={{ fontSize: 8, color: c.body, marginBottom: 3, lineHeight: 1.4 }}>
            {item.description}
          </Text>
        )}
        {item.microActions && item.microActions.length > 0 && (
          <View style={{ marginTop: 2 }}>
            {item.microActions.map((action, i) => (
              <Text
                key={i}
                style={{ fontSize: 7.5, color: c.muted, paddingLeft: 6, marginBottom: 1 }}
              >
                {"\u2192"} {action}
              </Text>
            ))}
          </View>
        )}
        {item.isMilestone && (
          <View
            style={{
              flexDirection: "row" as const,
              alignItems: "center" as const,
              marginTop: 3,
              gap: 3,
            }}
          >
            <Svg style={{ width: 8, height: 8 }}>
              <Path
                d="M4 0 L5.2 2.8 L8 3.2 L6 5.4 L6.4 8 L4 6.8 L1.6 8 L2 5.4 L0 3.2 L2.8 2.8 Z"
                fill={colors.accent}
              />
            </Svg>
            <Text
              style={{
                fontSize: 7,
                fontWeight: 500,
                color: colors.text,
              }}
            >
              Key Milestone
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function SchoolTrackCard({ item }: { item: SchoolTrackItem }) {
  const colors = stageColors[item.stage] || stageColors.foundation;
  const stageLabel = item.stage.charAt(0).toUpperCase() + item.stage.slice(1);

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 6,
        padding: 10,
        marginBottom: 6,
        borderLeftWidth: 2,
        borderLeftColor: c.blue,
      }}
      wrap={false}
    >
      <View
        style={{
          flexDirection: "row" as const,
          justifyContent: "space-between" as const,
          alignItems: "center" as const,
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: 9,
            color: c.ink,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={[
            s.badge,
            {
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: 6.5,
            },
          ]}
        >
          {stageLabel}
        </Text>
      </View>
      <View style={s.tagRow}>
        {item.subjects.map((subject, i) => (
          <Text
            key={i}
            style={[s.tag, { color: c.blue, backgroundColor: c.blueLight, fontSize: 7.5 }]}
          >
            {subject}
          </Text>
        ))}
      </View>
      {item.personalLearning && (
        <Text style={{ fontSize: 7.5, color: c.muted, marginTop: 3 }}>
          Self-directed: {item.personalLearning}
        </Text>
      )}
    </View>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────

function ProgressBar({
  value,
  total,
  color = c.teal,
  bgColor = c.dividerLight,
}: {
  value: number;
  total: number;
  color?: string;
  bgColor?: string;
}) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  const barWidth = Math.max(pct, 2);

  return (
    <View style={{ marginTop: 4, marginBottom: 2 }}>
      <Svg style={{ width: "100%", height: 6 }}>
        <Rect x="0" y="0" width="100%" height="6" rx="3" fill={bgColor} />
        <Rect
          x="0"
          y="0"
          width={`${barWidth}%`}
          height="6"
          rx="3"
          fill={color}
        />
      </Svg>
    </View>
  );
}

// ── Cover Page ───────────────────────────────────────────────────

function CoverPage({ data }: { data: JourneyReportData }) {
  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top section: branding */}
      <View>
        {/* Accent bar */}
        <Svg style={{ width: 48, height: 4, marginBottom: 24 }}>
          <Rect x="0" y="0" width="48" height="4" rx="2" fill={c.coverAccent} />
        </Svg>

        <Text
          style={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: 12,
            color: c.coverAccent,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            marginBottom: 40,
          }}
        >
          ENDEAVRLY
        </Text>
      </View>

      {/* Center: title block */}
      <View>
        <Text
          style={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: 36,
            color: c.coverText,
            lineHeight: 1.1,
            marginBottom: 12,
          }}
        >
          My Journey{"\n"}Report
        </Text>

        {/* Accent line */}
        <Svg style={{ width: 64, height: 3, marginBottom: 20 }}>
          <Rect x="0" y="0" width="64" height="3" rx="1.5" fill={c.coverAccent} />
        </Svg>

        {data.goalTitle && (
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 13,
              color: c.coverMuted,
              lineHeight: 1.5,
              marginBottom: 4,
            }}
          >
            Career Goal: {data.goalTitle}
          </Text>
        )}
      </View>

      {/* Bottom: metadata */}
      <View>
        <View style={{ height: 1, backgroundColor: "#1E293B", marginBottom: 20 }} />

        <View
          style={{
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
          }}
        >
          <View>
            <Text style={{ fontSize: 8, color: c.coverMuted, marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" as const }}>
              Prepared for
            </Text>
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: 14,
                color: c.coverText,
              }}
            >
              {data.userName}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" as const }}>
            <Text style={{ fontSize: 8, color: c.coverMuted, marginBottom: 4, letterSpacing: 0.5, textTransform: "uppercase" as const }}>
              Generated
            </Text>
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: 14,
                color: c.coverText,
              }}
            >
              {data.generatedDate}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// ── Summary Page ──────────────────────────────────────────────────

function SummaryPage({ data }: { data: JourneyReportData }) {
  const totalActions = data.alignedActions.length;
  const totalReflections = data.reflections.length;
  const totalSkills = data.pathSkills.length;
  const hasRoadmap = data.roadmapItems.length > 0;

  // Calculate journey completeness
  let sectionsCompleted = 0;
  const totalSections = 3;
  if (data.strengths.length > 0 || data.motivations.length > 0) sectionsCompleted++;
  if (data.roleRealityNotes.length > 0 || data.industryInsightNotes.length > 0) sectionsCompleted++;
  if (totalActions > 0 || totalReflections > 0) sectionsCompleted++;

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.h1}>Journey Overview</Text>
      <Text style={s.subtitle}>
        A snapshot of where you are on your journey toward{" "}
        {data.goalTitle || "finding your path"}.
      </Text>

      {/* Metrics Row */}
      <View style={[s.row, { marginBottom: 16 }]}>
        <MetricCard
          value={`${sectionsCompleted}/${totalSections}`}
          label="Stages Active"
          color={c.teal}
        />
        <MetricCard
          value={String(totalActions)}
          label="Actions Taken"
          color={c.emerald}
        />
        <MetricCard
          value={String(totalReflections)}
          label="Reflections"
          color={c.violet}
        />
        <MetricCard
          value={String(totalSkills)}
          label="Skills Mapped"
          color={c.blue}
        />
      </View>

      {/* Journey Progress */}
      <View style={[s.card, { marginBottom: 12 }]}>
        <Text style={s.label}>JOURNEY PROGRESS</Text>
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 2 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 500, color: c.teal }}>Discover</Text>
            <Text style={{ fontSize: 7.5, color: c.subtle }}>
              {data.strengths.length > 0 || data.motivations.length > 0 ? "Complete" : "In progress"}
            </Text>
          </View>
          <ProgressBar
            value={data.strengths.length > 0 && data.motivations.length > 0 && data.careerInterests.length > 0 ? 3 : data.strengths.length > 0 ? 1 : 0}
            total={3}
            color={c.teal}
          />
        </View>
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 2 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 500, color: c.emerald }}>Understand</Text>
            <Text style={{ fontSize: 7.5, color: c.subtle }}>
              {data.roleRealityNotes.length > 0 ? "Complete" : "In progress"}
            </Text>
          </View>
          <ProgressBar
            value={
              (data.roleRealityNotes.length > 0 ? 1 : 0) +
              (data.industryInsightNotes.length > 0 ? 1 : 0) +
              (data.actionPlan ? 1 : 0)
            }
            total={3}
            color={c.emerald}
          />
        </View>
        <View>
          <View style={{ flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 2 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 500, color: c.amber }}>Clarity</Text>
            <Text style={{ fontSize: 7.5, color: c.subtle }}>
              {totalActions > 0 ? "Active" : "Not started"}
            </Text>
          </View>
          <ProgressBar
            value={(totalActions > 0 ? 1 : 0) + (totalReflections > 0 ? 1 : 0)}
            total={2}
            color={c.amber}
          />
        </View>
      </View>

      {/* Key Highlights */}
      <View style={s.divider} />
      <Text style={s.h3}>Key Highlights</Text>

      <View style={s.row}>
        <View style={s.col}>
          {data.strengths.length > 0 && (
            <Section label="Top Strengths">
              <TagList items={data.strengths.slice(0, 5)} />
            </Section>
          )}
          {data.careerInterests.length > 0 && (
            <Section label="Career Interests">
              <TagList
                items={data.careerInterests.slice(0, 4)}
                color={c.violet}
                bgColor={c.violetLight}
              />
            </Section>
          )}
        </View>
        <View style={s.col}>
          {data.pathSkills.length > 0 && (
            <Section label="Skills to Develop">
              <TagList
                items={data.pathSkills.slice(0, 5)}
                color={c.blue}
                bgColor={c.blueLight}
              />
            </Section>
          )}
          {hasRoadmap && (
            <View style={[s.card, { backgroundColor: c.tealLight }]}>
              <Text style={[s.label, { color: c.teal }]}>EDUCATION ROADMAP</Text>
              <Text style={{ fontSize: 9, fontWeight: 500, color: c.teal }}>
                {data.roadmapItems.length} milestones mapped
              </Text>
              <Text style={{ fontSize: 7.5, color: c.muted, marginTop: 2 }}>
                See detailed roadmap on pages {data.roadmapItems.length > 4 ? "4–5" : "4"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
      <Text style={s.pageNumber}>1</Text>
    </Page>
  );
}

// ── Page: Discover ──────────────────────────────────────────────────

function DiscoverPage({ data }: { data: JourneyReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <StageBadge stage={1} label="Discover — Who You Are" />

      <Text style={{ fontSize: 9, color: c.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Self-awareness is the foundation of every great career decision. This section captures what makes you unique.
      </Text>

      {data.strengths.length > 0 && (
        <Section label="Your Strengths" accent>
          <TagList items={data.strengths} />
        </Section>
      )}

      <View style={s.row}>
        {data.motivations.length > 0 && (
          <View style={s.col}>
            <Section label="What Drives You">
              <TagList
                items={data.motivations}
                color={c.emerald}
                bgColor={c.emeraldLight}
              />
            </Section>
          </View>
        )}
        {data.workStyle.length > 0 && (
          <View style={s.col}>
            <Section label="How You Work Best">
              <TagList
                items={data.workStyle}
                color={c.violet}
                bgColor={c.violetLight}
              />
            </Section>
          </View>
        )}
      </View>

      {data.growthAreas.length > 0 && (
        <Section label="Areas for Growth">
          <TagList
            items={data.growthAreas}
            color={c.amber}
            bgColor={c.amberLight}
          />
        </Section>
      )}

      {(data.roleModels || data.experiences) && (
        <>
          <View style={s.spacerSm} />
          <View style={s.row}>
            {data.roleModels && (
              <View style={s.col}>
                <Section label="Who Inspires You">
                  <Text style={{ fontSize: 9, color: c.body, lineHeight: 1.5 }}>
                    {data.roleModels}
                  </Text>
                </Section>
              </View>
            )}
            {data.experiences && (
              <View style={s.col}>
                <Section label="What You've Tried">
                  <Text style={{ fontSize: 9, color: c.body, lineHeight: 1.5 }}>
                    {data.experiences}
                  </Text>
                </Section>
              </View>
            )}
          </View>
        </>
      )}

      {data.careerInterests.length > 0 && (
        <>
          <View style={s.spacerSm} />
          <Section label="Career Interests">
            <TagList
              items={data.careerInterests}
              color={c.blue}
              bgColor={c.blueLight}
            />
          </Section>
        </>
      )}

      <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
      <Text style={s.pageNumber}>2</Text>
    </Page>
  );
}

// ── Page: Understand ────────────────────────────────────────────────

function UnderstandPage({ data }: { data: JourneyReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <StageBadge stage={2} label="Understand — What You Learned" />

      <Text style={{ fontSize: 9, color: c.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Research and exploration help you validate your direction. Here is what you discovered about your chosen path.
      </Text>

      {data.goalTitle && (
        <View
          style={[
            s.card,
            {
              backgroundColor: c.emeraldLight,
              borderLeftWidth: 3,
              borderLeftColor: c.emerald,
            },
          ]}
        >
          <Text style={[s.label, { color: c.emerald }]}>CAREER DIRECTION</Text>
          <Text
            style={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: 13,
              color: c.ink,
            }}
          >
            {data.goalTitle}
          </Text>
        </View>
      )}

      {data.roleRealityNotes.length > 0 && (
        <Section label="What the Role Involves">
          <BulletList items={data.roleRealityNotes} />
        </Section>
      )}

      {data.industryInsightNotes.length > 0 && (
        <Section label="Industry Insights">
          <BulletList items={data.industryInsightNotes} />
        </Section>
      )}

      <View style={s.row}>
        {data.pathQualifications.length > 0 && (
          <View style={s.col}>
            <Section label="Qualifications Needed">
              <BulletList items={data.pathQualifications} />
            </Section>
          </View>
        )}
        {data.pathSkills.length > 0 && (
          <View style={s.col}>
            <Section label="Key Skills">
              <TagList items={data.pathSkills} color={c.blue} bgColor={c.blueLight} />
            </Section>
          </View>
        )}
      </View>

      {data.pathCourses.length > 0 && (
        <Section label="Courses to Consider">
          <BulletList items={data.pathCourses} />
        </Section>
      )}

      {data.actionPlan && (
        <>
          <View style={s.divider} />
          <Text style={s.h3}>Your Action Plan</Text>
          {data.actionPlan.roleTitle && (
            <Section label="Target Role" accent>
              <Text style={{ fontSize: 10, fontWeight: 500, color: c.ink }}>
                {data.actionPlan.roleTitle}
              </Text>
            </Section>
          )}
          <View style={s.row}>
            {data.actionPlan.shortTermActions &&
              data.actionPlan.shortTermActions.length > 0 && (
                <View style={s.col}>
                  <Section label="Next Steps">
                    <BulletList items={data.actionPlan.shortTermActions} />
                  </Section>
                </View>
              )}
            {(data.actionPlan.skillToBuild || data.actionPlan.midTermMilestone) && (
              <View style={s.col}>
                {data.actionPlan.skillToBuild && (
                  <Section label="Skill to Build">
                    <Text style={{ fontSize: 9, color: c.body }}>
                      {data.actionPlan.skillToBuild}
                    </Text>
                  </Section>
                )}
                {data.actionPlan.midTermMilestone && (
                  <Section label="Mid-Term Milestone">
                    <Text style={{ fontSize: 9, color: c.body }}>
                      {data.actionPlan.midTermMilestone}
                    </Text>
                  </Section>
                )}
              </View>
            )}
          </View>
        </>
      )}

      <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
      <Text style={s.pageNumber}>3</Text>
    </Page>
  );
}

// ── Page: Education Roadmap (Standout Feature) ───────────────────

function EducationRoadmapPages({ data }: { data: JourneyReportData }) {
  const hasRoadmap = data.roadmapItems.length > 0;
  const hasSchoolTrack = data.schoolTrack.length > 0;
  const hasSchoolInfo = data.educationStage || data.subjects.length > 0;

  if (!hasRoadmap && !hasSchoolTrack && !hasSchoolInfo) {
    return (
      <Page size="A4" style={s.page}>
        {/* Header with highlighted styling */}
        <View
          style={{
            backgroundColor: c.tealLight,
            marginHorizontal: -44,
            marginTop: -44,
            paddingHorizontal: 44,
            paddingTop: 36,
            paddingBottom: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 8 }}>
            <Svg style={{ width: 20, height: 20 }}>
              <Circle cx="10" cy="10" r="10" fill={c.teal} />
              <Path d="M6 10 L9 13 L14 7" stroke="#FFFFFF" strokeWidth={1.5} fill="none" />
            </Svg>
            <Text
              style={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: 18,
                color: c.ink,
              }}
            >
              Education Roadmap
            </Text>
          </View>
          <Text style={{ fontSize: 9, color: c.muted }}>
            from the Clarity Section
          </Text>
        </View>

        <EmptyState message="Your education roadmap will appear here once you set a Primary Goal and generate your personalised timeline in the Clarity section." />

        <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
        <Text style={s.pageNumber}>4</Text>
      </Page>
    );
  }

  // Split items across pages if needed (max ~5 items per page for readability)
  const ITEMS_PER_PAGE = 5;
  const roadmapPages: RoadmapItem[][] = [];
  for (let i = 0; i < data.roadmapItems.length; i += ITEMS_PER_PAGE) {
    roadmapPages.push(data.roadmapItems.slice(i, i + ITEMS_PER_PAGE));
  }

  // If no roadmap items but we have school info, still show one page
  if (roadmapPages.length === 0) {
    roadmapPages.push([]);
  }

  return (
    <>
      {roadmapPages.map((pageItems, pageIndex) => (
        <Page key={`roadmap-${pageIndex}`} size="A4" style={s.page}>
          {/* Highlighted header on first page */}
          {pageIndex === 0 && (
            <View
              style={{
                backgroundColor: c.tealLight,
                marginHorizontal: -44,
                marginTop: -44,
                paddingHorizontal: 44,
                paddingTop: 36,
                paddingBottom: 20,
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 6 }}>
                <Svg style={{ width: 22, height: 22 }}>
                  <Circle cx="11" cy="11" r="11" fill={c.teal} />
                  <Path
                    d="M7 11.5 L10 14.5 L15 8.5"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    fill="none"
                  />
                </Svg>
                <Text
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    fontSize: 18,
                    color: c.ink,
                  }}
                >
                  Education Roadmap
                </Text>
              </View>
              <Text style={{ fontSize: 9.5, color: c.muted, lineHeight: 1.5 }}>
                {data.roadmapCareer
                  ? `Your personalised pathway to becoming a ${data.roadmapCareer}. This roadmap maps key milestones, learning stages, and actions from where you are now to your career goal.`
                  : "Your personalised education and career pathway, generated from your Clarity section data."}
              </Text>
            </View>
          )}

          {/* Continuation header */}
          {pageIndex > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[s.h2, { color: c.teal }]}>
                Education Roadmap (continued)
              </Text>
            </View>
          )}

          {/* Stage legend on first page */}
          {pageIndex === 0 && hasRoadmap && (
            <View
              style={{
                flexDirection: "row" as const,
                gap: 10,
                marginBottom: 16,
              }}
            >
              {(["foundation", "education", "experience", "career"] as const).map(
                (stage) => {
                  const colors = stageColors[stage];
                  return (
                    <View
                      key={stage}
                      style={{
                        flexDirection: "row" as const,
                        alignItems: "center" as const,
                        gap: 4,
                      }}
                    >
                      <Svg style={{ width: 8, height: 8 }}>
                        <Circle cx="4" cy="4" r="4" fill={colors.accent} />
                      </Svg>
                      <Text style={{ fontSize: 7.5, color: c.muted, textTransform: "capitalize" as const }}>
                        {stage}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          )}

          {/* Timeline items */}
          {pageItems.length > 0 && (
            <View>
              {pageIndex === 0 && (
                <Text style={[s.h3, { marginBottom: 10 }]}>Career Milestones</Text>
              )}
              {pageItems.map((item, i) => (
                <RoadmapTimelineNode
                  key={i}
                  item={item}
                  index={pageIndex * ITEMS_PER_PAGE + i}
                  isLast={
                    pageIndex === roadmapPages.length - 1 &&
                    i === pageItems.length - 1
                  }
                />
              ))}
            </View>
          )}

          {/* School Track — only on last roadmap page */}
          {pageIndex === roadmapPages.length - 1 && hasSchoolTrack && (
            <View style={{ marginTop: 16 }}>
              <View style={s.divider} />
              <View style={{ flexDirection: "row" as const, alignItems: "center" as const, gap: 6, marginBottom: 10 }}>
                <Svg style={{ width: 14, height: 14 }}>
                  <Circle cx="7" cy="7" r="7" fill={c.blueLight} />
                  <Circle cx="7" cy="7" r="4" fill={c.blue} />
                </Svg>
                <Text style={s.h3}>Learning Track</Text>
              </View>
              <Text style={{ fontSize: 8, color: c.muted, marginBottom: 10 }}>
                Subjects and learning activities aligned to each stage of your roadmap.
              </Text>
              {data.schoolTrack.map((item, i) => (
                <SchoolTrackCard key={i} item={item} />
              ))}
            </View>
          )}

          {/* Current Education — only on last page if we have school info */}
          {pageIndex === roadmapPages.length - 1 && hasSchoolInfo && (
            <View style={{ marginTop: hasSchoolTrack ? 12 : 16 }}>
              {!hasSchoolTrack && <View style={s.divider} />}
              <Text style={s.h3}>Current Education</Text>
              <View style={s.row}>
                <View style={s.col}>
                  <Section label="Education Stage">
                    <Text style={{ fontSize: 10, fontWeight: 500, color: c.ink }}>
                      {data.educationStage || "Not specified"}
                    </Text>
                    {data.schoolName && (
                      <Text style={{ fontSize: 9, color: c.muted, marginTop: 2 }}>
                        {data.schoolName}
                      </Text>
                    )}
                    {data.expectedCompletion && (
                      <Text style={{ fontSize: 8, color: c.subtle, marginTop: 2 }}>
                        Expected completion: {data.expectedCompletion}
                      </Text>
                    )}
                  </Section>
                </View>
                {data.subjects.length > 0 && (
                  <View style={s.col}>
                    <Section label="Current Subjects">
                      <TagList
                        items={data.subjects}
                        color={c.blue}
                        bgColor={c.blueLight}
                      />
                    </Section>
                  </View>
                )}
              </View>
            </View>
          )}

          <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
          <Text style={s.pageNumber}>{4 + pageIndex}</Text>
        </Page>
      ))}
    </>
  );
}

// ── Page: Clarity — Actions & Reflections ───────────────────────────

function ClarityPage({
  data,
  pageNum,
}: {
  data: JourneyReportData;
  pageNum: number;
}) {
  return (
    <Page size="A4" style={s.page}>
      <StageBadge stage={3} label="Clarity — Actions & Reflections" />

      <Text style={{ fontSize: 9, color: c.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Real growth comes from doing. This section captures the real-world actions you have taken and what you learned from them.
      </Text>

      {data.alignedActions.length > 0 ? (
        <Section label="Real-World Actions Completed" accent>
          {data.alignedActions.map((action, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row" as const,
                alignItems: "center" as const,
                marginBottom: 5,
                gap: 6,
              }}
            >
              <Svg style={{ width: 6, height: 6 }}>
                <Circle cx="3" cy="3" r="3" fill={c.emerald} />
              </Svg>
              <Text
                style={[
                  s.tag,
                  {
                    backgroundColor: c.emeraldLight,
                    color: c.emerald,
                    fontSize: 7,
                    marginBottom: 0,
                  },
                ]}
              >
                {action.type.replace(/_/g, " ")}
              </Text>
              <Text style={{ fontSize: 9, color: c.body, flex: 1 }}>
                {action.title}
              </Text>
            </View>
          ))}
        </Section>
      ) : (
        <EmptyState message="No actions recorded yet. Complete your first aligned action in the Clarity stage to see it here." />
      )}

      {data.reflections.length > 0 && (
        <>
          <View style={s.spacerSm} />
          <Section label="What You Reflected On">
            {data.reflections.map((reflection, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: c.violetLight,
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 6,
                  borderLeftWidth: 2,
                  borderLeftColor: c.violet,
                }}
              >
                <Text style={{ fontSize: 8.5, color: c.body, lineHeight: 1.5, fontStyle: "italic" as const }}>
                  &ldquo;{reflection}&rdquo;
                </Text>
              </View>
            ))}
          </Section>
        </>
      )}

      <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
      <Text style={s.pageNumber}>{pageNum}</Text>
    </Page>
  );
}

// ── Page: Recommendations ───────────────────────────────────────

function RecommendationsPage({
  data,
  pageNum,
}: {
  data: JourneyReportData;
  pageNum: number;
}) {
  const recommendations: { priority: string; text: string; color: string; bgColor: string }[] = [];

  // Generate contextual recommendations
  if (data.strengths.length === 0) {
    recommendations.push({
      priority: "HIGH",
      text: "Complete the Discover stage to identify your strengths and motivations — this is the foundation for everything else.",
      color: c.rose,
      bgColor: c.roseLight,
    });
  }

  if (data.roleRealityNotes.length === 0 && data.goalTitle) {
    recommendations.push({
      priority: "HIGH",
      text: `Research what a career as a ${data.goalTitle} really involves. Talk to people in the field or explore industry content.`,
      color: c.rose,
      bgColor: c.roseLight,
    });
  }

  if (data.pathSkills.length > 0 && data.alignedActions.length === 0) {
    recommendations.push({
      priority: "MEDIUM",
      text: `You have identified ${data.pathSkills.length} key skills. Start building them through real-world actions — volunteering, projects, or small jobs.`,
      color: c.amber,
      bgColor: c.amberLight,
    });
  }

  if (data.alignedActions.length > 0 && data.reflections.length === 0) {
    recommendations.push({
      priority: "MEDIUM",
      text: "You have completed actions but not yet reflected on them. Take time to process what you learned — reflection turns experience into growth.",
      color: c.amber,
      bgColor: c.amberLight,
    });
  }

  if (!data.educationStage) {
    recommendations.push({
      priority: "LOW",
      text: "Add your current education details to help align your learning with your career goals.",
      color: c.blue,
      bgColor: c.blueLight,
    });
  }

  if (data.roadmapItems.length === 0 && data.goalTitle) {
    recommendations.push({
      priority: "MEDIUM",
      text: "Generate your personalised education roadmap in the Clarity section to see a clear path from where you are to where you want to be.",
      color: c.amber,
      bgColor: c.amberLight,
    });
  }

  if (!data.actionPlan && data.goalTitle) {
    recommendations.push({
      priority: "MEDIUM",
      text: "Create an action plan in the Understand stage to break your career goal into concrete next steps.",
      color: c.amber,
      bgColor: c.amberLight,
    });
  }

  if (data.alignedActions.length > 2 && data.reflections.length > 1) {
    recommendations.push({
      priority: "NEXT",
      text: "You are making great progress. Consider seeking external feedback from a mentor or professional to gain new perspectives.",
      color: c.teal,
      bgColor: c.tealLight,
    });
  }

  // Fallback if nothing to recommend
  if (recommendations.length === 0) {
    recommendations.push({
      priority: "NEXT",
      text: "Keep exploring, learning, and taking action. Every step forward builds your unique path.",
      color: c.teal,
      bgColor: c.tealLight,
    });
  }

  return (
    <Page size="A4" style={s.page}>
      <Text style={s.h1}>What to Do Next</Text>
      <Text style={s.subtitle}>
        Personalised recommendations based on your current journey progress.
      </Text>

      {recommendations.map((rec, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row" as const,
            backgroundColor: rec.bgColor,
            borderRadius: 8,
            padding: 14,
            marginBottom: 8,
            gap: 10,
          }}
          wrap={false}
        >
          <View style={{ paddingTop: 1 }}>
            <Text
              style={[
                s.badge,
                {
                  backgroundColor: rec.color,
                  color: "#FFFFFF",
                  fontSize: 6.5,
                  letterSpacing: 0.5,
                },
              ]}
            >
              {rec.priority}
            </Text>
          </View>
          <Text style={{ fontSize: 9.5, color: c.ink, flex: 1, lineHeight: 1.5 }}>
            {rec.text}
          </Text>
        </View>
      ))}

      {/* Closing message */}
      <View style={{ marginTop: 24 }}>
        <View style={s.divider} />
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: 8,
            padding: 20,
            alignItems: "center" as const,
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: 12,
              color: c.ink,
              marginBottom: 6,
              textAlign: "center" as const,
            }}
          >
            Your journey is uniquely yours.
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: c.muted,
              textAlign: "center" as const,
              lineHeight: 1.6,
              maxWidth: 380,
            }}
          >
            Every step you take — whether exploring, learning, or doing — builds toward the future you want. Keep going at your own pace.
          </Text>
        </View>
      </View>

      <Text style={s.footer}>Endeavrly  |  My Journey Report</Text>
      <Text style={s.pageNumber}>{pageNum}</Text>
    </Page>
  );
}

// ── Main Document ────────────────────────────────────────────────

export function MyJourneyPdfDocument({ data }: { data: JourneyReportData }) {
  // Calculate the page number for Clarity and Recommendations
  // Cover (no number) + Summary (1) + Discover (2) + Understand (3) + Roadmap pages (4+) + Clarity + Recs
  const roadmapPageCount = Math.max(1, Math.ceil(data.roadmapItems.length / 5));
  const clarityPageNum = 4 + roadmapPageCount;
  const recsPageNum = clarityPageNum + 1;

  return (
    <Document>
      <CoverPage data={data} />
      <SummaryPage data={data} />
      <DiscoverPage data={data} />
      <UnderstandPage data={data} />
      <EducationRoadmapPages data={data} />
      <ClarityPage data={data} pageNum={clarityPageNum} />
      <RecommendationsPage data={data} pageNum={recsPageNum} />
    </Document>
  );
}

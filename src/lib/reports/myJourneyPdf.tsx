import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CareerGoal, GoalStatus } from "@/lib/goals/types";

// Note: Fonts are registered in the API route for server-side rendering

// Color palette
const colors = {
  ink: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  divider: "#E2E8F0",
  sproutGreen: "#10B981",
  sproutGreenLight: "#D1FAE5",
  sproutGreenDark: "#059669",
  // Status colors
  exploringBg: "#DBEAFE",
  exploringText: "#1D4ED8",
  committedBg: "#D1FAE5",
  committedText: "#047857",
  pausedBg: "#FEF3C7",
  pausedText: "#92400E",
};

// Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 36,
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.45,
    color: colors.ink,
  },
  // Typography
  h1: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 26,
    lineHeight: 1.15,
    color: colors.ink,
    marginBottom: 8,
  },
  h2: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 1.15,
    color: colors.ink,
    marginBottom: 16,
  },
  h3: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 12,
    color: colors.ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10.5,
    lineHeight: 1.45,
    color: colors.ink,
  },
  small: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    lineHeight: 1.35,
    color: colors.subtle,
  },
  labelCaps: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 4,
  },
  muted: {
    color: colors.muted,
  },
  subtle: {
    color: colors.subtle,
  },
  // Layout
  card: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  rowGap: {
    marginRight: 16,
  },
  col60: {
    width: "58%",
    marginRight: 16,
  },
  col40: {
    width: "38%",
  },
  col50: {
    width: "46%",
    marginRight: 16,
    marginBottom: 16,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  footerText: {
    fontFamily: "Inter",
    fontSize: 8.5,
    color: colors.subtle,
  },
  // Cover specific
  wordmark: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 14,
    color: colors.sproutGreen,
  },
  accentBar: {
    width: 6,
    height: 72,
    backgroundColor: colors.sproutGreen,
    borderRadius: 3,
    marginRight: 12,
  },
  titleBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 120,
    marginBottom: 40,
  },
  coverSubtitle: {
    fontFamily: "Inter",
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  infoBlock: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 14,
    marginTop: "auto",
    marginBottom: 40,
  },
  disclaimer: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.subtle,
    textAlign: "center",
    marginTop: "auto",
  },
  // Status chip
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 9,
  },
  // Goal title
  goalTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 8,
  },
  goalTitleSmall: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  // Next steps
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  stepCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.sproutGreen,
    marginRight: 8,
    marginTop: 2,
  },
  stepCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.sproutGreen,
    marginRight: 8,
    marginTop: 2,
  },
  stepText: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.ink,
    flex: 1,
  },
  // Skill chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: colors.sproutGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 9,
    color: colors.sproutGreenDark,
  },
  // Notes
  noteBlock: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  noteDate: {
    fontFamily: "Inter",
    fontSize: 8,
    color: colors.subtle,
    marginBottom: 4,
  },
  noteText: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.ink,
    lineHeight: 1.4,
  },
  // List items
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.muted,
  },
  listText: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.ink,
    flex: 1,
  },
});

// Types for report data
export interface UserNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface ReportData {
  userName: string;
  ageBand: string;
  generatedDate: string;
  primaryGoal: CareerGoal | null;
  secondaryGoal: CareerGoal | null;
  notes: UserNote[];
  exploredCareers: string[];
  insightsViewed: string[];
  podcasts: string[];
  smallJobs: string[];
  // Options
  includeNotes: boolean;
  includeSmallJobs: boolean;
  includeInsightsPodcasts: boolean;
}

// Helper to get status colors
function getStatusColors(status: GoalStatus): { bg: string; text: string } {
  switch (status) {
    case "exploring":
      return { bg: colors.exploringBg, text: colors.exploringText };
    case "committed":
      return { bg: colors.committedBg, text: colors.committedText };
    case "paused":
      return { bg: colors.pausedBg, text: colors.pausedText };
  }
}

// Helper to get status label
function getStatusLabel(status: GoalStatus): string {
  switch (status) {
    case "exploring":
      return "Exploring";
    case "committed":
      return "Committed";
    case "paused":
      return "Paused";
  }
}

// Helper to get timeframe label
function getTimeframeLabel(timeframe: string): string {
  switch (timeframe) {
    case "this-year":
      return "This year";
    case "1-2-years":
      return "1-2 years";
    case "3-plus-years":
      return "3+ years";
    default:
      return timeframe;
  }
}

// Footer Component
function Footer({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Sprout • My Journey Report</Text>
      <Text style={styles.footerText}>
        Page {pageNumber} / {totalPages}
      </Text>
    </View>
  );
}

// Status Chip Component
function StatusChip({ status }: { status: GoalStatus }) {
  const { bg, text } = getStatusColors(status);
  return (
    <View style={[styles.statusChip, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

// Cover Page
function CoverPage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={[styles.page, { paddingBottom: 36 }]}>
      {/* Wordmark */}
      <Text style={styles.wordmark}>Sprout</Text>

      {/* Title Block with accent bar */}
      <View style={styles.titleBlock}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.h1}>My Journey Report</Text>
          <Text style={styles.coverSubtitle}>
            Career exploration and progress summary
          </Text>
        </View>
      </View>

      {/* Info Block */}
      <View style={styles.infoBlock}>
        <Text style={[styles.labelCaps, { marginBottom: 8 }]}>ABOUT</Text>
        <Text style={[styles.body, { fontWeight: 500, marginBottom: 4 }]}>
          {data.userName}
        </Text>
        <Text style={[styles.body, styles.muted, { marginBottom: 4 }]}>
          Age: {data.ageBand}
        </Text>
        <Text style={[styles.body, styles.muted]}>
          Generated: {data.generatedDate}
        </Text>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This report reflects my current goals and interests. These may change over time.
      </Text>
    </Page>
  );
}

// Snapshot Page
function SnapshotPage({ data }: { data: ReportData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Snapshot</Text>

      <View style={styles.row}>
        {/* Left: My Focus */}
        <View style={[styles.card, styles.col60]}>
          <Text style={styles.labelCaps}>MY FOCUS</Text>
          {data.primaryGoal ? (
            <>
              <Text style={[styles.h3, { marginTop: 4 }]}>
                {data.primaryGoal.title}
              </Text>
              {data.primaryGoal.why && (
                <Text style={[styles.body, styles.muted]}>
                  {data.primaryGoal.why}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.body, styles.muted]}>No primary goal set</Text>
          )}
        </View>

        {/* Right: At a Glance */}
        <View style={[styles.card, styles.col40]}>
          <Text style={styles.labelCaps}>AT A GLANCE</Text>
          <View style={{ marginTop: 8 }}>
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.small}>Age Band</Text>
              <Text style={styles.body}>{data.ageBand}</Text>
            </View>
            {data.primaryGoal && (
              <>
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.small}>Status</Text>
                  <Text style={styles.body}>
                    {getStatusLabel(data.primaryGoal.status)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.small}>Timeframe</Text>
                  <Text style={styles.body}>
                    {getTimeframeLabel(data.primaryGoal.timeframe)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <Text style={[styles.body, { marginTop: 8 }]}>
        This document summarises where I am today in my career exploration journey.
        It captures my goals, the skills I am developing, and the steps I am taking
        to move forward.
      </Text>

      <Footer pageNumber={2} totalPages={data.secondaryGoal ? 8 : 7} />
    </Page>
  );
}

// Primary Goal Page
function PrimaryGoalPage({ data }: { data: ReportData }) {
  const goal = data.primaryGoal;
  if (!goal) return null;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Primary Career Goal</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <StatusChip status={goal.status} />
      </View>

      {/* Why this goal */}
      {goal.why && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>WHY THIS GOAL</Text>
          <Text style={[styles.body, { marginTop: 4 }]}>{goal.why}</Text>
        </View>
      )}

      {/* Next Steps */}
      {goal.nextSteps.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>MY NEXT STEPS</Text>
          <View style={{ marginTop: 8 }}>
            {goal.nextSteps.slice(0, 5).map((step) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={step.completed ? styles.stepCircleFilled : styles.stepCircle} />
                <Text style={[styles.stepText, step.completed ? { color: colors.muted } : {}]}>
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills */}
      {goal.skills.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>SKILLS I&apos;M BUILDING</Text>
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {goal.skills.map((skill, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Footer pageNumber={3} totalPages={data.secondaryGoal ? 8 : 7} />
    </Page>
  );
}

// Secondary Goal Page
function SecondaryGoalPage({ data }: { data: ReportData }) {
  const goal = data.secondaryGoal;
  if (!goal) return null;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Secondary Goal</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <Text style={styles.goalTitleSmall}>{goal.title}</Text>
        <StatusChip status={goal.status} />
      </View>

      <Text style={[styles.small, { marginBottom: 16 }]}>
        This is an alternative path I am also considering.
      </Text>

      {/* Why this goal */}
      {goal.why && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>WHY THIS GOAL</Text>
          <Text style={[styles.body, { marginTop: 4 }]}>{goal.why}</Text>
        </View>
      )}

      {/* Next Steps */}
      {goal.nextSteps.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>NEXT STEPS</Text>
          <View style={{ marginTop: 8 }}>
            {goal.nextSteps.slice(0, 5).map((step) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={step.completed ? styles.stepCircleFilled : styles.stepCircle} />
                <Text style={[styles.stepText, step.completed ? { color: colors.muted } : {}]}>
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills */}
      {goal.skills.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>SKILLS</Text>
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {goal.skills.map((skill, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Footer pageNumber={4} totalPages={8} />
    </Page>
  );
}

// Skills & Actions Page
function SkillsActionsPage({ data }: { data: ReportData }) {
  const allSkills = [
    ...(data.primaryGoal?.skills || []),
    ...(data.secondaryGoal?.skills || []),
  ].filter((skill, idx, arr) => arr.indexOf(skill) === idx);

  const allSteps = [
    ...(data.primaryGoal?.nextSteps || []),
    ...(data.secondaryGoal?.nextSteps || []),
  ].slice(0, 8);

  const pageNum = data.secondaryGoal ? 5 : 4;
  const totalPages = data.secondaryGoal ? 8 : 7;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Skills & Actions</Text>

      <View style={styles.row}>
        {/* Skills */}
        <View style={[styles.card, styles.col50]}>
          <Text style={styles.labelCaps}>SKILLS I&apos;M WORKING ON</Text>
          {allSkills.length > 0 ? (
            <View style={[styles.chipRow, { marginTop: 8 }]}>
              {allSkills.map((skill, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.body, styles.muted, { marginTop: 8 }]}>
              No skills added yet
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.card, styles.col50]}>
          <Text style={styles.labelCaps}>ACTIONS I&apos;M TAKING</Text>
          {allSteps.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              {allSteps.map((step) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={step.completed ? styles.stepCircleFilled : styles.stepCircle} />
                  <Text style={[styles.stepText, step.completed ? { color: colors.muted } : {}]}>
                    {step.text}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.body, styles.muted, { marginTop: 8 }]}>
              No actions added yet
            </Text>
          )}
        </View>
      </View>

      <Footer pageNumber={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// Experience & Exposure Page
function ExperienceExposurePage({ data }: { data: ReportData }) {
  const pageNum = data.secondaryGoal ? 6 : 5;
  const totalPages = data.secondaryGoal ? 8 : 7;

  const showCareers = data.exploredCareers.length > 0;
  const showInsights = data.includeInsightsPodcasts && data.insightsViewed.length > 0;
  const showPodcasts = data.includeInsightsPodcasts && data.podcasts.length > 0;
  const showJobs = data.includeSmallJobs && data.smallJobs.length > 0;

  if (!showCareers && !showInsights && !showPodcasts && !showJobs) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Experience & Exposure</Text>

      <View style={[styles.row, { flexWrap: "wrap" }]}>
        {/* Careers Explored */}
        {showCareers && (
          <View style={[styles.card, styles.col50]}>
            <Text style={styles.labelCaps}>CAREERS EXPLORED</Text>
            <View style={{ marginTop: 8 }}>
              {data.exploredCareers.slice(0, 10).map((career, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{career}</Text>
                </View>
              ))}
              {data.exploredCareers.length > 10 && (
                <Text style={[styles.small, { marginTop: 4 }]}>
                  and {data.exploredCareers.length - 10} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Insights Viewed */}
        {showInsights && (
          <View style={[styles.card, styles.col50]}>
            <Text style={styles.labelCaps}>INSIGHTS VIEWED</Text>
            <View style={{ marginTop: 8 }}>
              {data.insightsViewed.slice(0, 6).map((insight, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{insight}</Text>
                </View>
              ))}
              {data.insightsViewed.length > 6 && (
                <Text style={[styles.small, { marginTop: 4 }]}>
                  and {data.insightsViewed.length - 6} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Podcasts */}
        {showPodcasts && (
          <View style={[styles.card, styles.col50]}>
            <Text style={styles.labelCaps}>PODCASTS</Text>
            <View style={{ marginTop: 8 }}>
              {data.podcasts.slice(0, 6).map((podcast, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{podcast}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Small Jobs */}
        {showJobs && (
          <View style={[styles.card, styles.col50]}>
            <Text style={styles.labelCaps}>WORK EXPERIENCE</Text>
            <View style={{ marginTop: 8 }}>
              {data.smallJobs.slice(0, 6).map((job, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{job}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Footer pageNumber={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// Notes Page
function NotesPage({ data }: { data: ReportData }) {
  if (!data.includeNotes || data.notes.length === 0) {
    return null;
  }

  const pageNum = data.secondaryGoal ? 7 : 6;
  const totalPages = data.secondaryGoal ? 8 : 7;

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Notes & Reflection</Text>

      {data.notes.slice(0, 8).map((note, idx) => (
        <View key={note.id} style={[styles.noteBlock, idx === Math.min(7, data.notes.length - 1) ? { borderBottomWidth: 0 } : {}]}>
          <Text style={styles.noteDate}>
            {new Date(note.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.noteText}>{note.content}</Text>
        </View>
      ))}

      {data.notes.length > 8 && (
        <Text style={[styles.small, { textAlign: "center", marginTop: 8 }]}>
          and {data.notes.length - 8} more notes
        </Text>
      )}

      <Footer pageNumber={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// Closing Page
function ClosingPage({ data }: { data: ReportData }) {
  const pageNum = data.secondaryGoal ? 8 : 7;
  const totalPages = data.secondaryGoal ? 8 : 7;

  const nextStep = data.primaryGoal?.nextSteps.find((s) => !s.completed);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.h2}>Closing</Text>

      <Text style={[styles.body, { marginBottom: 24 }]}>
        This report is intended to support conversations with parents, teachers,
        or mentors about my career exploration. It represents a snapshot of where
        I am today, and my goals and interests may evolve over time.
      </Text>

      {data.primaryGoal && (
        <View style={styles.card}>
          <Text style={styles.labelCaps}>NEXT FOCUS</Text>
          <Text style={[styles.h3, { marginTop: 8, marginBottom: 4 }]}>
            {data.primaryGoal.title}
          </Text>
          {nextStep && (
            <Text style={[styles.body, styles.muted]}>
              Next step: {nextStep.text}
            </Text>
          )}
        </View>
      )}

      {/* Sprout wordmark at bottom */}
      <View style={{ marginTop: "auto", alignItems: "center" }}>
        <Text style={[styles.wordmark, { fontSize: 12 }]}>Sprout</Text>
        <Text style={[styles.small, { marginTop: 4 }]}>
          Supporting youth in their career journey
        </Text>
      </View>

      <Footer pageNumber={pageNum} totalPages={totalPages} />
    </Page>
  );
}

// Main Document
export function MyJourneyPdfDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title="My Journey Report"
      author="Sprout"
      subject="Career exploration and progress summary"
      creator="Sprout"
    >
      <CoverPage data={data} />
      <SnapshotPage data={data} />
      {data.primaryGoal && <PrimaryGoalPage data={data} />}
      {data.secondaryGoal && <SecondaryGoalPage data={data} />}
      <SkillsActionsPage data={data} />
      <ExperienceExposurePage data={data} />
      {data.includeNotes && data.notes.length > 0 && <NotesPage data={data} />}
      <ClosingPage data={data} />
    </Document>
  );
}

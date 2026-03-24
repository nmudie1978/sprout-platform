import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const c = {
  ink: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  divider: "#E2E8F0",
  teal: "#0D9488",
  tealLight: "#CCFBF1",
  emerald: "#059669",
  emeraldLight: "#D1FAE5",
  violet: "#7C3AED",
  violetLight: "#EDE9FE",
  amber: "#D97706",
  amberLight: "#FEF3C7",
};

const s = StyleSheet.create({
  page: { backgroundColor: c.bg, paddingTop: 36, paddingBottom: 50, paddingHorizontal: 36, fontFamily: "Inter", fontSize: 10, lineHeight: 1.5, color: c.ink },
  pageNumber: { position: "absolute", bottom: 20, right: 36, fontSize: 8, color: c.subtle },
  footer: { position: "absolute", bottom: 20, left: 36, fontSize: 7, color: c.subtle },
  h1: { fontFamily: "Poppins", fontWeight: 600, fontSize: 22, lineHeight: 1.2, color: c.ink, marginBottom: 4 },
  h2: { fontFamily: "Poppins", fontWeight: 600, fontSize: 14, lineHeight: 1.2, color: c.ink, marginBottom: 10 },
  h3: { fontFamily: "Poppins", fontWeight: 500, fontSize: 11, color: c.ink, marginBottom: 6 },
  sub: { fontSize: 9, color: c.subtle, marginBottom: 16 },
  label: { fontSize: 8, fontWeight: 500, color: c.subtle, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 4 },
  card: { backgroundColor: c.surface, borderRadius: 6, padding: 12, marginBottom: 8 },
  tag: { backgroundColor: c.tealLight, color: c.teal, fontSize: 8, fontWeight: 500, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginRight: 4, marginBottom: 3 },
  tagRow: { flexDirection: "row" as const, flexWrap: "wrap" as const },
  bullet: { fontSize: 9, color: c.muted, marginBottom: 3, paddingLeft: 8 },
  divider: { height: 1, backgroundColor: c.divider, marginVertical: 12 },
  row: { flexDirection: "row" as const, gap: 8 },
  col: { flex: 1 },
  sectionHeader: { flexDirection: "row" as const, alignItems: "center" as const, marginBottom: 12, gap: 6 },
  badge: { fontSize: 7, fontWeight: 500, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
});

// ── Types ────────────────────────────────────────────────────────────

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
  actionPlan: { roleTitle?: string; shortTermActions?: string[]; midTermMilestone?: string; skillToBuild?: string } | null;
  // Grow
  alignedActions: { type: string; title: string }[];
  reflections: string[];
  // School
  educationStage: string | null;
  schoolName: string | null;
  subjects: string[];
  expectedCompletion: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────

function TagList({ items, color = c.teal, bgColor = c.tealLight }: { items: string[]; color?: string; bgColor?: string }) {
  if (items.length === 0) return null;
  return (
    <View style={s.tagRow}>
      {items.map((item, i) => (
        <Text key={i} style={[s.tag, { color, backgroundColor: bgColor }]}>{item}</Text>
      ))}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View>
      {items.map((item, i) => (
        <Text key={i} style={s.bullet}>• {item}</Text>
      ))}
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

// ── Document ─────────────────────────────────────────────────────────

export function MyJourneyPdfDocument({ data }: { data: JourneyReportData }) {
  return (
    <Document>
      {/* PAGE 1: DISCOVER — About You */}
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>My Journey Report</Text>
        <Text style={s.sub}>
          {data.userName} · {data.generatedDate}
          {data.goalTitle ? ` · Goal: ${data.goalTitle}` : ""}
        </Text>

        <View style={s.sectionHeader}>
          <Text style={[s.badge, { backgroundColor: c.tealLight, color: c.teal }]}>Stage 1</Text>
          <Text style={s.h2}>Discover — Who You Are</Text>
        </View>

        {data.strengths.length > 0 && (
          <Section label="Your Strengths">
            <TagList items={data.strengths} />
          </Section>
        )}

        {data.motivations.length > 0 && (
          <Section label="What Drives You">
            <TagList items={data.motivations} color={c.emerald} bgColor={c.emeraldLight} />
          </Section>
        )}

        {data.workStyle.length > 0 && (
          <Section label="How You Work Best">
            <TagList items={data.workStyle} color={c.violet} bgColor={c.violetLight} />
          </Section>
        )}

        {data.growthAreas.length > 0 && (
          <Section label="Where You Want to Grow">
            <TagList items={data.growthAreas} color={c.amber} bgColor={c.amberLight} />
          </Section>
        )}

        {data.roleModels && (
          <Section label="Who Inspires You">
            <Text style={{ fontSize: 9, color: c.muted }}>{data.roleModels}</Text>
          </Section>
        )}

        {data.experiences && (
          <Section label="What You've Tried">
            <Text style={{ fontSize: 9, color: c.muted }}>{data.experiences}</Text>
          </Section>
        )}

        <Text style={s.footer}>Endeavrly — My Journey Report</Text>
        <Text style={s.pageNumber}>1</Text>
      </Page>

      {/* PAGE 2: UNDERSTAND — What You Learned */}
      <Page size="A4" style={s.page}>
        <View style={s.sectionHeader}>
          <Text style={[s.badge, { backgroundColor: c.emeraldLight, color: c.emerald }]}>Stage 2</Text>
          <Text style={s.h2}>Understand — What You Learned</Text>
        </View>

        {data.goalTitle && (
          <Section label="Career Direction">
            <Text style={{ fontSize: 11, fontWeight: 500, color: c.ink }}>{data.goalTitle}</Text>
          </Section>
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
                <TagList items={data.pathSkills} />
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
            <Text style={s.h3}>Your Plan</Text>
            {data.actionPlan.roleTitle && (
              <Section label="Target Role">
                <Text style={{ fontSize: 10, color: c.ink }}>{data.actionPlan.roleTitle}</Text>
              </Section>
            )}
            {data.actionPlan.shortTermActions && data.actionPlan.shortTermActions.length > 0 && (
              <Section label="Next Steps">
                <BulletList items={data.actionPlan.shortTermActions} />
              </Section>
            )}
            {data.actionPlan.skillToBuild && (
              <Section label="Skill to Build">
                <Text style={{ fontSize: 9, color: c.muted }}>{data.actionPlan.skillToBuild}</Text>
              </Section>
            )}
          </>
        )}

        <Text style={s.footer}>Endeavrly — My Journey Report</Text>
        <Text style={s.pageNumber}>2</Text>
      </Page>

      {/* PAGE 3: GROW — Actions & Reflections + School */}
      <Page size="A4" style={s.page}>
        <View style={s.sectionHeader}>
          <Text style={[s.badge, { backgroundColor: c.amberLight, color: c.amber }]}>Stage 3</Text>
          <Text style={s.h2}>Grow — Actions & Reflections</Text>
        </View>

        {data.alignedActions.length > 0 && (
          <Section label="Real-World Actions Completed">
            {data.alignedActions.map((action, i) => (
              <View key={i} style={{ flexDirection: "row" as const, marginBottom: 4 }}>
                <Text style={[s.tag, { backgroundColor: c.emeraldLight, color: c.emerald }]}>{action.type}</Text>
                <Text style={{ fontSize: 9, color: c.muted }}>{action.title}</Text>
              </View>
            ))}
          </Section>
        )}

        {data.reflections.length > 0 && (
          <Section label="What You Reflected On">
            <BulletList items={data.reflections} />
          </Section>
        )}

        {data.alignedActions.length === 0 && data.reflections.length === 0 && (
          <View style={s.card}>
            <Text style={{ fontSize: 9, color: c.subtle, textAlign: "center" as const }}>
              No actions or reflections recorded yet. Complete the Grow stage to see your progress here.
            </Text>
          </View>
        )}

        <View style={s.divider} />

        {/* School & Education */}
        <Text style={s.h2}>School & Education</Text>

        {data.educationStage ? (
          <View style={s.row}>
            <View style={s.col}>
              <Section label="Education Stage">
                <Text style={{ fontSize: 10, color: c.ink }}>{data.educationStage}</Text>
                {data.schoolName && <Text style={{ fontSize: 9, color: c.muted, marginTop: 2 }}>{data.schoolName}</Text>}
                {data.expectedCompletion && <Text style={{ fontSize: 8, color: c.subtle, marginTop: 2 }}>Finishing {data.expectedCompletion}</Text>}
              </Section>
            </View>
            {data.subjects.length > 0 && (
              <View style={s.col}>
                <Section label="Current Subjects">
                  <TagList items={data.subjects} />
                </Section>
              </View>
            )}
          </View>
        ) : (
          <View style={s.card}>
            <Text style={{ fontSize: 9, color: c.subtle, textAlign: "center" as const }}>
              Add your education details in the School & Learning Alignment section.
            </Text>
          </View>
        )}

        <Text style={s.footer}>Endeavrly — My Journey Report</Text>
        <Text style={s.pageNumber}>3</Text>
      </Page>
    </Document>
  );
}

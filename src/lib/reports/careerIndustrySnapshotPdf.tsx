import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Color palette - calm, professional tones
const colors = {
  ink: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#F1F5F9",
  divider: "#E2E8F0",
  sproutGreen: "#10B981",
  sproutGreenLight: "#D1FAE5",
  sproutGreenDark: "#059669",
  // Chart colors
  blue: "#3B82F6",
  rose: "#F43F5E",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  orange: "#F97316",
  cyan: "#06B6D4",
  emerald: "#10B981",
  pink: "#EC4899",
  slate: "#94A3B8",
};

// Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.ink,
  },
  // Typography
  h1: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 1.2,
    color: colors.ink,
    marginBottom: 8,
  },
  h2: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.2,
    color: colors.ink,
    marginBottom: 12,
  },
  h3: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 11,
    color: colors.ink,
    marginBottom: 6,
  },
  body: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.ink,
  },
  bodyLarge: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: colors.ink,
  },
  small: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    lineHeight: 1.4,
    color: colors.subtle,
  },
  labelCaps: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: 6,
  },
  muted: {
    color: colors.muted,
  },
  // Layout
  card: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  cardAlt: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  col50: {
    width: "48%",
    marginRight: "4%",
  },
  col50Last: {
    width: "48%",
  },
  col33: {
    width: "30%",
    marginRight: "5%",
  },
  // Stats
  statNumber: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 28,
    color: colors.sproutGreen,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.3,
  },
  // Bar chart
  barContainer: {
    marginBottom: 8,
  },
  barLabel: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.ink,
    marginBottom: 3,
  },
  barWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  barTrack: {
    height: 14,
    backgroundColor: colors.divider,
    borderRadius: 3,
    flex: 1,
    marginRight: 8,
  },
  barFill: {
    height: 14,
    borderRadius: 3,
  },
  barValue: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 9,
    color: colors.muted,
    width: 32,
    textAlign: "right",
  },
  // Lists
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 10,
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.muted,
  },
  listText: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.ink,
    flex: 1,
  },
  // Chips
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
    fontSize: 8,
    color: colors.sproutGreenDark,
  },
  // Salary range
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  salaryCategory: {
    fontFamily: "Inter",
    fontSize: 9,
    color: colors.ink,
    flex: 1,
  },
  salaryRange: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 9,
    color: colors.muted,
    width: 100,
    textAlign: "right",
  },
  // Employer logos placeholder
  employerBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    alignItems: "center",
  },
  employerName: {
    fontFamily: "Inter",
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  footerText: {
    fontFamily: "Inter",
    fontSize: 7.5,
    color: colors.subtle,
  },
  // Cover page
  wordmark: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 14,
    color: colors.sproutGreen,
  },
  accentBar: {
    width: 5,
    height: 60,
    backgroundColor: colors.sproutGreen,
    borderRadius: 2.5,
    marginRight: 12,
  },
  titleBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 100,
    marginBottom: 32,
  },
  coverSubtitle: {
    fontFamily: "Inter",
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 16,
    marginTop: "auto",
    marginBottom: 40,
  },
  infoItem: {
    width: "50%",
    marginBottom: 12,
  },
  disclaimer: {
    fontFamily: "Inter",
    fontSize: 8,
    color: colors.subtle,
    textAlign: "center",
    marginTop: "auto",
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.sproutGreenLight,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconText: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 10,
    color: colors.sproutGreenDark,
  },
});

// Footer Component
function Footer({ pageNumber }: { pageNumber: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Sprout - The World of Work: Career & Industry Snapshot
      </Text>
      <Text style={styles.footerText}>Page {pageNumber}</Text>
    </View>
  );
}

// Section Header Component
function SectionHeader({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Text style={styles.sectionIconText}>{number}</Text>
      </View>
      <Text style={styles.h2}>{title}</Text>
    </View>
  );
}

// Stat Card Component
function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={[styles.card, { width: "23%", marginRight: "2.6%" }]}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Bar Chart Item
function BarChartItem({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const widthPercent = (value / maxValue) * 100;
  return (
    <View style={styles.barContainer}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barWrapper}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${widthPercent}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.barValue}>{value}%</Text>
      </View>
    </View>
  );
}

// Cover Page
function CoverPage() {
  const today = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
      {/* Wordmark */}
      <Text style={styles.wordmark}>Sprout</Text>

      {/* Title Block */}
      <View style={styles.titleBlock}>
        <View style={styles.accentBar} />
        <View>
          <Text style={styles.h1}>The World of Work</Text>
          <Text style={styles.coverSubtitle}>
            Career & Industry Snapshot
          </Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.labelCaps}>AUDIENCE</Text>
          <Text style={styles.body}>Young people aged 15-20</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.labelCaps}>PURPOSE</Text>
          <Text style={styles.body}>Career exploration overview</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.labelCaps}>DATA SOURCES</Text>
          <Text style={styles.body}>ILO, WEF, OECD, McKinsey</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.labelCaps}>LAST UPDATED</Text>
          <Text style={styles.body}>{today}</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This document provides general information to support career exploration.
        Data represents global averages and may vary by region.
      </Text>
    </Page>
  );
}

// Page 1: Executive Overview
function ExecutiveOverviewPage() {
  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="1" title="Executive Overview" />

      <Text style={[styles.bodyLarge, { marginBottom: 20 }]}>
        The world of work is large, diverse, and constantly evolving. Understanding
        the big picture can help you explore careers with clarity and confidence.
      </Text>

      {/* Key Stats */}
      <Text style={[styles.labelCaps, { marginBottom: 10 }]}>
        KEY GLOBAL FIGURES
      </Text>
      <View style={[styles.row, { marginBottom: 20 }]}>
        <StatCard value="3.4B" label="People employed globally" />
        <StatCard value="200+" label="Recognised occupations" />
        <StatCard value="40%" label="Jobs may evolve by 2030" />
        <StatCard value="22%" label="Tech sector growth rate" />
      </View>

      {/* Context Cards */}
      <View style={styles.row}>
        <View style={[styles.card, styles.col50]}>
          <Text style={styles.h3}>What this means</Text>
          <Text style={styles.body}>
            Most jobs today did not exist 50 years ago, and many jobs in the future
            have not been invented yet. The key is to build adaptable skills and stay
            curious about different industries.
          </Text>
        </View>
        <View style={[styles.card, styles.col50Last]}>
          <Text style={styles.h3}>How to use this report</Text>
          <Text style={styles.body}>
            This snapshot gives you a broad view of industries, salaries, and trends.
            Use it as a starting point for deeper exploration, not as a definitive guide
            to your future.
          </Text>
        </View>
      </View>

      {/* Data Note */}
      <View style={[styles.cardAlt, { marginTop: 8 }]}>
        <Text style={[styles.small, { marginBottom: 0 }]}>
          Data sourced from International Labour Organization, World Economic Forum,
          OECD, and McKinsey Global Institute. Figures represent developed economy
          averages (2023-2025).
        </Text>
      </View>

      <Footer pageNumber={1} />
    </Page>
  );
}

// Page 2: Career Categories by Workforce Size
function CareerCategoriesPage() {
  const categories = [
    { name: "Retail & Services", value: 28, color: colors.blue },
    { name: "Healthcare", value: 15, color: colors.rose },
    { name: "Manufacturing", value: 14, color: colors.amber },
    { name: "Education", value: 10, color: colors.purple },
    { name: "Construction & Trades", value: 9, color: colors.orange },
    { name: "Tech & Digital", value: 6, color: colors.cyan },
    { name: "Other sectors", value: 18, color: colors.slate },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="2" title="Where People Work" />

      <Text style={[styles.body, { marginBottom: 16 }]}>
        Global employment is distributed across many industries. Retail and services
        employ the most people, while technology - though growing fast - currently
        represents a smaller share of total jobs.
      </Text>

      {/* Bar Chart */}
      <View style={[styles.card, { marginBottom: 16 }]}>
        <Text style={styles.labelCaps}>EMPLOYMENT BY INDUSTRY (GLOBAL)</Text>
        <View style={{ marginTop: 10 }}>
          {categories.map((cat) => (
            <BarChartItem
              key={cat.name}
              label={cat.name}
              value={cat.value}
              maxValue={30}
              color={cat.color}
            />
          ))}
        </View>
        <Text style={[styles.small, { marginTop: 8 }]}>
          Source: ILO World Employment & Social Outlook 2024
        </Text>
      </View>

      {/* Insights */}
      <View style={styles.row}>
        <View style={[styles.cardAlt, styles.col50]}>
          <Text style={styles.h3}>Service economy</Text>
          <Text style={styles.body}>
            In developed economies, service jobs (retail, hospitality, admin)
            dominate. This includes customer service, sales, and administrative roles.
          </Text>
        </View>
        <View style={[styles.cardAlt, styles.col50Last]}>
          <Text style={styles.h3}>Healthcare growth</Text>
          <Text style={styles.body}>
            Healthcare employs 15% of workers globally and is growing due to aging
            populations and increased focus on wellbeing.
          </Text>
        </View>
      </View>

      <Footer pageNumber={2} />
    </Page>
  );
}

// Page 3: Salary Reality Check
function SalaryRealityPage() {
  const salaryRanges = [
    {
      category: "Executive & Senior Management",
      range: "$80K - $200K+",
      note: "Typically requires 15+ years experience",
    },
    {
      category: "Technology & Engineering",
      range: "$50K - $150K",
      note: "High demand, varies by specialisation",
    },
    {
      category: "Healthcare Professionals",
      range: "$45K - $120K",
      note: "Doctors, specialists higher; nurses, aides lower",
    },
    {
      category: "Skilled Trades",
      range: "$35K - $80K",
      note: "Electricians, plumbers, technicians",
    },
    {
      category: "Education & Training",
      range: "$35K - $75K",
      note: "Teachers, trainers, education support",
    },
    {
      category: "Creative & Media",
      range: "$30K - $90K",
      note: "Wide range; depends on role and market",
    },
    {
      category: "Administrative & Office",
      range: "$30K - $55K",
      note: "Support roles, office administration",
    },
    {
      category: "Retail & Hospitality",
      range: "$25K - $45K",
      note: "Entry-level accessible; management pays more",
    },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="3" title="Salary Reality Check" />

      <Text style={[styles.body, { marginBottom: 16 }]}>
        Salaries vary widely based on industry, location, experience, and role.
        These ranges represent typical annual salaries in developed economies
        (USD equivalent). Starting salaries are usually at the lower end.
      </Text>

      {/* Salary Table */}
      <View style={[styles.card, { marginBottom: 16 }]}>
        <Text style={styles.labelCaps}>TYPICAL SALARY RANGES BY SECTOR</Text>
        <View style={{ marginTop: 8 }}>
          {salaryRanges.map((item, idx) => (
            <View
              key={item.category}
              style={[
                styles.salaryRow,
                idx === salaryRanges.length - 1 ? { borderBottomWidth: 0 } : {},
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.salaryCategory}>{item.category}</Text>
                <Text style={[styles.small, { marginTop: 1 }]}>{item.note}</Text>
              </View>
              <Text style={styles.salaryRange}>{item.range}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Important Notes */}
      <View style={styles.cardAlt}>
        <Text style={styles.h3}>What affects salary</Text>
        <View style={{ marginTop: 6 }}>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Location: Salaries in major cities are often 20-50% higher
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Experience: Entry-level roles start lower; growth happens over time
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Specialisation: Niche skills often command higher pay
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Company size: Larger companies may offer more benefits
            </Text>
          </View>
        </View>
        <Text style={[styles.small, { marginTop: 8 }]}>
          Salary data compiled from OECD, national statistics, and industry surveys.
          Figures are indicative and should be verified for your specific region.
        </Text>
      </View>

      <Footer pageNumber={3} />
    </Page>
  );
}

// Page 4: Major Global Employers
function GlobalEmployersPage() {
  const sectors = [
    {
      name: "Technology",
      employers: ["Google", "Microsoft", "Apple", "Amazon", "IBM", "SAP"],
    },
    {
      name: "Healthcare",
      employers: [
        "NHS (UK)",
        "Kaiser Permanente",
        "UnitedHealth",
        "Ramsay Health",
        "Siemens Healthineers",
        "Fresenius",
      ],
    },
    {
      name: "Retail & Consumer",
      employers: ["Walmart", "Amazon", "IKEA", "Costco", "Woolworths", "Tesco"],
    },
    {
      name: "Manufacturing",
      employers: ["Toyota", "Volkswagen", "Samsung", "Siemens", "GE", "3M"],
    },
    {
      name: "Finance & Banking",
      employers: ["JPMorgan", "HSBC", "Goldman Sachs", "BlackRock", "Visa", "PayPal"],
    },
    {
      name: "Energy & Utilities",
      employers: ["Shell", "ExxonMobil", "Enel", "Vestas", "NextEra", "Orsted"],
    },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="4" title="Major Global Employers" />

      <Text style={[styles.body, { marginBottom: 16 }]}>
        Large organisations employ millions of people worldwide. These examples
        show the diversity of employers across different industries. Many smaller
        companies and local businesses also offer excellent career opportunities.
      </Text>

      {/* Employer Grid */}
      <View style={styles.rowWrap}>
        {sectors.map((sector) => (
          <View key={sector.name} style={[styles.card, { width: "48%", marginRight: "4%", marginBottom: 12 }]}>
            <Text style={styles.labelCaps}>{sector.name.toUpperCase()}</Text>
            <View style={[styles.chipRow, { marginTop: 8 }]}>
              {sector.employers.map((employer) => (
                <View key={employer} style={styles.employerBox}>
                  <Text style={styles.employerName}>{employer}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Note */}
      <View style={styles.cardAlt}>
        <Text style={styles.h3}>Beyond big names</Text>
        <Text style={styles.body}>
          While large employers are well-known, most jobs are with small and
          medium-sized businesses. Local companies, startups, government, and
          non-profits also offer meaningful career paths.
        </Text>
      </View>

      <Footer pageNumber={4} />
    </Page>
  );
}

// Page 5: Future of Work
function FutureOfWorkPage() {
  const growingIndustries = [
    { name: "Technology & Data", growth: 22, color: colors.cyan },
    { name: "Care & Wellness", growth: 18, color: colors.rose },
    { name: "Green & Energy", growth: 15, color: colors.emerald },
    { name: "Education & Training", growth: 10, color: colors.purple },
    { name: "Logistics & Supply", growth: 8, color: colors.amber },
    { name: "Creative & Media", growth: 5, color: colors.pink },
  ];

  const futureSkills = [
    "Analytical thinking",
    "Creative thinking",
    "AI & big data literacy",
    "Curiosity & lifelong learning",
    "Resilience & flexibility",
    "Tech literacy",
    "Leadership",
    "Empathy & active listening",
  ];

  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="5" title="Future of Work" />

      <Text style={[styles.body, { marginBottom: 16 }]}>
        The job market is evolving due to technology, demographics, and global
        challenges. Some industries are growing faster than others, and certain
        skills are becoming more valuable across all fields.
      </Text>

      {/* Growing Industries */}
      <View style={[styles.card, { marginBottom: 12 }]}>
        <Text style={styles.labelCaps}>PROJECTED GROWTH (2025-2030)</Text>
        <View style={{ marginTop: 10 }}>
          {growingIndustries.map((ind) => (
            <BarChartItem
              key={ind.name}
              label={ind.name}
              value={ind.growth}
              maxValue={25}
              color={ind.color}
            />
          ))}
        </View>
        <Text style={[styles.small, { marginTop: 8 }]}>
          Source: World Economic Forum Future of Jobs Report 2025
        </Text>
      </View>

      {/* Skills */}
      <View style={styles.row}>
        <View style={[styles.card, styles.col50]}>
          <Text style={styles.labelCaps}>SKILLS THAT MATTER</Text>
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {futureSkills.map((skill) => (
              <View key={skill} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[styles.cardAlt, styles.col50Last]}>
          <Text style={styles.h3}>Technology and jobs</Text>
          <Text style={styles.body}>
            About 40% of current work tasks may be affected by technology by 2030.
            This does not mean jobs will disappear - they will evolve. The key is
            building skills that complement technology.
          </Text>
        </View>
      </View>

      <Footer pageNumber={5} />
    </Page>
  );
}

// Page 6: How Sprout Helps
function SproutHelpPage() {
  const features = [
    {
      title: "Explore careers",
      description:
        "Browse hundreds of career profiles with realistic information about day-to-day work, required skills, and pathways.",
    },
    {
      title: "Set goals",
      description:
        "Define and track your career exploration goals at your own pace, with no pressure to decide too early.",
    },
    {
      title: "Build skills",
      description:
        "Identify skills you want to develop and find practical ways to build them through experience.",
    },
    {
      title: "Stay informed",
      description:
        "Access curated industry insights from trusted sources to understand how the world of work is changing.",
    },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <SectionHeader number="6" title="How Sprout Helps You Start" />

      <Text style={[styles.body, { marginBottom: 20 }]}>
        Sprout is designed to support young people in exploring careers without
        pressure. We believe career exploration should be curious, honest, and
        grounded in reality.
      </Text>

      {/* Features Grid */}
      <View style={styles.rowWrap}>
        {features.map((feature) => (
          <View key={feature.title} style={[styles.card, { width: "48%", marginRight: "4%", marginBottom: 12 }]}>
            <Text style={styles.h3}>{feature.title}</Text>
            <Text style={styles.body}>{feature.description}</Text>
          </View>
        ))}
      </View>

      {/* Values */}
      <View style={[styles.cardAlt, { marginTop: 8 }]}>
        <Text style={styles.labelCaps}>OUR APPROACH</Text>
        <View style={{ marginTop: 8 }}>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              No promises - We present realistic information, not guarantees
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              No pressure - Explore at your own pace; uncertainty is normal
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Trusted sources - All data comes from Tier-1 global organisations
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              Youth-first - Designed for young people, not employers
            </Text>
          </View>
        </View>
      </View>

      {/* Footer CTA */}
      <View
        style={{
          marginTop: "auto",
          alignItems: "center",
          paddingTop: 24,
        }}
      >
        <Text style={[styles.wordmark, { fontSize: 12 }]}>Sprout</Text>
        <Text style={[styles.small, { marginTop: 4, textAlign: "center" }]}>
          Supporting young people in exploring their future
        </Text>
        <Text
          style={[
            styles.body,
            { marginTop: 8, color: colors.muted, textAlign: "center" },
          ]}
        >
          sprout.app
        </Text>
      </View>

      <Footer pageNumber={6} />
    </Page>
  );
}

// Main Document
export function CareerIndustrySnapshotPdf() {
  return (
    <Document
      title="The World of Work - Career & Industry Snapshot"
      author="Sprout"
      subject="A high-level overview of careers, industries, and salaries for young people"
      creator="Sprout"
    >
      <CoverPage />
      <ExecutiveOverviewPage />
      <CareerCategoriesPage />
      <SalaryRealityPage />
      <GlobalEmployersPage />
      <FutureOfWorkPage />
      <SproutHelpPage />
    </Document>
  );
}

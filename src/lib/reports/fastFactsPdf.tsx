import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Color palette - calm, modern, trustworthy
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
  accent: "#3B82F6",
  accentLight: "#DBEAFE",
};

// Mobile-first styles - optimised for vertical phone viewing
const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.ink,
  },
  // Typography - Large, clear headings
  pageTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 18,
    lineHeight: 1.2,
    color: colors.ink,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 12,
    color: colors.ink,
    marginBottom: 8,
    marginTop: 16,
  },
  bigSignal: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 14,
    lineHeight: 1.4,
    color: colors.sproutGreenDark,
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.sproutGreen,
  },
  body: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.ink,
    marginBottom: 8,
  },
  bodyMuted: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 9,
    lineHeight: 1.5,
    color: colors.muted,
    marginBottom: 4,
  },
  small: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    lineHeight: 1.4,
    color: colors.subtle,
  },
  // Bullet lists
  bulletItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingRight: 8,
  },
  bullet: {
    width: 14,
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.sproutGreen,
  },
  bulletText: {
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.ink,
    flex: 1,
  },
  // Cards / Boxes
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  calloutBox: {
    backgroundColor: colors.sproutGreenLight,
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  calloutTitle: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 11,
    color: colors.sproutGreenDark,
    marginBottom: 8,
  },
  calloutText: {
    fontFamily: "Inter",
    fontSize: 9.5,
    lineHeight: 1.5,
    color: colors.ink,
  },
  // Figure placeholder
  figurePlaceholder: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    borderStyle: "dashed",
  },
  figureLabel: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  // Closing message
  closingBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginTop: "auto",
    alignItems: "center",
  },
  closingText: {
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.muted,
    textAlign: "center",
  },
  closingBold: {
    fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: 10,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontFamily: "Inter",
    fontSize: 7,
    color: colors.subtle,
  },
  // Wordmark
  wordmark: {
    fontFamily: "Poppins",
    fontWeight: 600,
    fontSize: 10,
    color: colors.sproutGreen,
  },
});

// Bullet Item Component
function BulletItem({ children }: { children: string }) {
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

// Figure Placeholder Component
function FigurePlaceholder({ label }: { label: string }) {
  return (
    <View style={styles.figurePlaceholder}>
      <Text style={styles.figureLabel}>{label}</Text>
    </View>
  );
}

// PAGE 1: The World at a Glance
function Page1() {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.wordmark}>Sprout</Text>

      {/* Page Title */}
      <Text style={[styles.pageTitle, { marginTop: 16 }]}>
        Fast Facts: The World of Innovation
      </Text>

      {/* Big Signal */}
      <Text style={styles.bigSignal}>
        Innovation is shaping where jobs, money, and opportunities appear.
      </Text>

      {/* Top Innovation Countries */}
      <Text style={styles.sectionTitle}>Top Innovation Countries</Text>
      <View style={styles.card}>
        <BulletItem>Switzerland — leads in research and patents</BulletItem>
        <BulletItem>Sweden — strong tech ecosystem</BulletItem>
        <BulletItem>United States — global innovation hub</BulletItem>
        <BulletItem>United Kingdom — finance and creative industries</BulletItem>
        <BulletItem>Singapore — Asia-Pacific tech gateway</BulletItem>
        <BulletItem>South Korea — electronics and digital leader</BulletItem>
        <Text style={[styles.bodyMuted, { marginTop: 8, marginBottom: 0 }]}>
          These countries invest heavily in education, research, and technology —
          creating more opportunities for skilled workers.
        </Text>
      </View>

      <FigurePlaceholder label="Figure 1 — World map: Top innovation economies" />

      {/* Where Innovation Happens */}
      <Text style={styles.sectionTitle}>Where Innovation Happens</Text>
      <View style={styles.card}>
        <BulletItem>San Francisco / Silicon Valley — tech startups</BulletItem>
        <BulletItem>London — fintech and creative</BulletItem>
        <BulletItem>Tokyo — robotics and electronics</BulletItem>
        <BulletItem>Shenzhen — hardware manufacturing</BulletItem>
        <BulletItem>Tel Aviv — cybersecurity and AI</BulletItem>
        <Text style={[styles.bodyMuted, { marginTop: 8, marginBottom: 0 }]}>
          Innovation concentrates in specific cities and hubs — not spread evenly
          across countries. These places attract talent and investment.
        </Text>
      </View>

      <FigurePlaceholder label="Figure 2 — Top global science & technology hubs" />

      {/* What Drives Innovation */}
      <Text style={styles.sectionTitle}>What Drives Innovation</Text>
      <View style={styles.card}>
        <BulletItem>Education — skilled people with fresh ideas</BulletItem>
        <BulletItem>Technology — tools that enable new solutions</BulletItem>
        <BulletItem>Business — companies willing to invest in the new</BulletItem>
        <BulletItem>Creativity — connecting ideas in unexpected ways</BulletItem>
        <Text style={[styles.bodyMuted, { marginTop: 8, marginBottom: 0 }]}>
          Innovation happens when these four pillars work together.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Sprout Fast Facts</Text>
        <Text style={styles.footerText}>Page 1 of 2</Text>
      </View>
    </Page>
  );
}

// PAGE 2: What This Means for You
function Page2() {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.wordmark}>Sprout</Text>

      {/* Page Title */}
      <Text style={[styles.pageTitle, { marginTop: 16 }]}>
        Fast Facts: Your Future in This World
      </Text>

      {/* Fast-Growing Signals */}
      <Text style={styles.sectionTitle}>Fast-Growing Signals</Text>
      <View style={styles.card}>
        <BulletItem>Digital skills — needed in almost every industry now</BulletItem>
        <BulletItem>AI & data — transforming how work gets done</BulletItem>
        <BulletItem>Green tech — growing fast as climate action accelerates</BulletItem>
        <BulletItem>Health & care — ageing populations driving demand</BulletItem>
        <BulletItem>Creative tech — design, content, and media evolving</BulletItem>
      </View>

      <FigurePlaceholder label="Figure 3 — Technology adoption and skill demand trends" />

      {/* Countries to Watch */}
      <Text style={styles.sectionTitle}>Countries to Watch</Text>
      <View style={styles.card}>
        <BulletItem>India — fast-growing tech talent pool</BulletItem>
        <BulletItem>Vietnam — manufacturing and digital growth</BulletItem>
        <BulletItem>Estonia — digital government pioneer</BulletItem>
        <BulletItem>Kenya — mobile innovation leader in Africa</BulletItem>
        <Text style={[styles.bodyMuted, { marginTop: 8, marginBottom: 0 }]}>
          Opportunity exists beyond the usual names. These "overperformers" are
          creating new pathways for young people.
        </Text>
      </View>

      {/* Why Innovation = Jobs */}
      <Text style={styles.sectionTitle}>Why Innovation = Jobs</Text>
      <Text style={styles.body}>
        New ideas create new industries. New industries create new roles.
        Many jobs that exist today didn't exist ten years ago — and the same
        will be true ten years from now.
      </Text>
      <Text style={styles.body}>
        You don't need to predict the future. You need to stay curious,
        build useful skills, and be ready to adapt.
      </Text>

      {/* Sprout Callout Box */}
      <View style={styles.calloutBox}>
        <Text style={styles.calloutTitle}>What This Means for You on Sprout</Text>
        <Text style={styles.calloutText}>
          • Small jobs help you build independence and real experience
        </Text>
        <Text style={styles.calloutText}>
          • Skill discovery shows you what you're good at — and what you enjoy
        </Text>
        <Text style={styles.calloutText}>
          • Confidence grows through doing, not just thinking
        </Text>
        <Text style={styles.calloutText}>
          • Exploring careers before choosing lets you decide with clarity
        </Text>
      </View>

      {/* Your Next Step */}
      <View style={styles.closingBox}>
        <Text style={styles.closingBold}>Your Next Step</Text>
        <Text style={styles.closingText}>
          Careers are journeys, not destinations.
        </Text>
        <Text style={styles.closingText}>
          Curiosity matters more than early decisions.
        </Text>
        <Text style={[styles.closingText, { marginTop: 8 }]}>
          Sprout helps you explore safely and gradually —
          at your own pace, on your own terms.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Sprout Fast Facts</Text>
        <Text style={styles.footerText}>Page 2 of 2</Text>
      </View>
    </Page>
  );
}

// Main Document
export function FastFactsPdf() {
  return (
    <Document
      title="Fast Facts: The World of Innovation"
      author="Sprout"
      subject="A quick snapshot of global innovation and what it means for young people"
      creator="Sprout"
    >
      <Page1 />
      <Page2 />
    </Document>
  );
}

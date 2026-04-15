#!/usr/bin/env ts-node
/**
 * RESEARCH FACTS REFRESH SCRIPT
 *
 * This script generates a report of research facts that need updating.
 * It checks for:
 * - Facts nearing expiration (within 6 months)
 * - Already expired facts
 * - Facts that need source verification
 *
 * Usage:
 *   npm run refresh:research-facts
 *   npx ts-node scripts/refresh-research-facts.ts
 *
 * This script produces a REPORT only - it does NOT auto-update facts.
 * Manual verification is required before updating any sources.
 */

import {
  _RESEARCH_FACTS_RAW_FOR_TESTING as FACTS,
  MAX_FACT_AGE_MONTHS,
  isFactRecent,
  type ResearchFact,
} from "../src/lib/researchFacts";

import {
  _RESEARCH_STATS_RAW_FOR_TESTING as STATS,
  MAX_EVIDENCE_AGE_MONTHS,
  isRecent,
  type ResearchStat,
} from "../src/lib/researchEvidence";

const MONTHS_UNTIL_WARNING = 6; // Warn about facts expiring within 6 months

interface ReportItem {
  id: string;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  status: "expired" | "expiring-soon" | "ok";
  daysUntilExpiry: number;
}

function analyzeItem(
  item: { id: string; headline: string; sourceName: string; sourceUrl: string; sourcePublishedAt: string; evergreen?: boolean },
  maxAgeMonths: number
): ReportItem {
  const publishedDate = new Date(item.sourcePublishedAt);
  const now = new Date();

  // Calculate expiry date
  const expiryDate = new Date(publishedDate);
  expiryDate.setMonth(expiryDate.getMonth() + maxAgeMonths);

  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: ReportItem["status"] = "ok";

  if (item.evergreen) {
    status = "ok";
  } else if (daysUntilExpiry < 0) {
    status = "expired";
  } else if (daysUntilExpiry < MONTHS_UNTIL_WARNING * 30) {
    status = "expiring-soon";
  }

  return {
    id: item.id,
    headline: item.headline.substring(0, 60) + (item.headline.length > 60 ? "..." : ""),
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    publishedAt: item.sourcePublishedAt,
    status,
    daysUntilExpiry,
  };
}

function printSection(title: string, items: ReportItem[], color: string) {
  if (items.length === 0) return;

  console.log(`\n${color}${"=".repeat(60)}`);
  console.log(title);
  console.log(`${"=".repeat(60)}\x1b[0m\n`);

  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.headline}`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Source: ${item.sourceName}`);
    console.log(`   Published: ${item.publishedAt}`);
    console.log(`   Days until expiry: ${item.daysUntilExpiry < 0 ? `${Math.abs(item.daysUntilExpiry)} days OVERDUE` : item.daysUntilExpiry}`);
    console.log(`   URL: ${item.sourceUrl}`);
    console.log("");
  });
}

function main() {
  console.log("\n\x1b[1m📊 RESEARCH FACTS & EVIDENCE REFRESH REPORT\x1b[0m");
  console.log(`Generated: ${new Date().toISOString()}\n`);

  // Analyze research facts
  console.log("\x1b[36m--- RESEARCH FACTS (researchFacts.ts) ---\x1b[0m");
  console.log(`Total facts: ${FACTS.length}`);
  console.log(`Max age: ${MAX_FACT_AGE_MONTHS} months`);

  const factReports = FACTS.map(f => analyzeItem(f, MAX_FACT_AGE_MONTHS));
  const expiredFacts = factReports.filter(r => r.status === "expired");
  const expiringSoonFacts = factReports.filter(r => r.status === "expiring-soon");
  const okFacts = factReports.filter(r => r.status === "ok");

  console.log(`✅ Current: ${okFacts.length}`);
  console.log(`⚠️  Expiring soon: ${expiringSoonFacts.length}`);
  console.log(`❌ Expired: ${expiredFacts.length}`);

  // Analyze research evidence
  console.log("\n\x1b[36m--- RESEARCH EVIDENCE (researchEvidence.ts) ---\x1b[0m");
  console.log(`Total stats: ${STATS.length}`);
  console.log(`Max age: ${MAX_EVIDENCE_AGE_MONTHS} months`);

  const statReports = STATS.map(s => analyzeItem(s, MAX_EVIDENCE_AGE_MONTHS));
  const expiredStats = statReports.filter(r => r.status === "expired");
  const expiringSoonStats = statReports.filter(r => r.status === "expiring-soon");
  const okStats = statReports.filter(r => r.status === "ok");

  console.log(`✅ Current: ${okStats.length}`);
  console.log(`⚠️  Expiring soon: ${expiringSoonStats.length}`);
  console.log(`❌ Expired: ${expiredStats.length}`);

  // Print detailed sections
  printSection(
    "❌ EXPIRED FACTS (Need immediate replacement)",
    expiredFacts,
    "\x1b[31m" // Red
  );

  printSection(
    "❌ EXPIRED EVIDENCE (Need immediate replacement)",
    expiredStats,
    "\x1b[31m" // Red
  );

  printSection(
    `⚠️  FACTS EXPIRING WITHIN ${MONTHS_UNTIL_WARNING} MONTHS (Plan updates)`,
    expiringSoonFacts,
    "\x1b[33m" // Yellow
  );

  printSection(
    `⚠️  EVIDENCE EXPIRING WITHIN ${MONTHS_UNTIL_WARNING} MONTHS (Plan updates)`,
    expiringSoonStats,
    "\x1b[33m" // Yellow
  );

  // Summary
  const totalIssues = expiredFacts.length + expiredStats.length + expiringSoonFacts.length + expiringSoonStats.length;

  console.log("\n\x1b[1m" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60) + "\x1b[0m\n");

  if (totalIssues === 0) {
    console.log("\x1b[32m✅ All research facts and evidence are current!\x1b[0m\n");
  } else {
    console.log(`Total items needing attention: ${totalIssues}`);
    console.log("");
    console.log("Recommended sources for updates:");
    console.log("  • OECD: https://www.oecd.org/en/publications.html");
    console.log("  • WEF: https://www.weforum.org/publications/");
    console.log("  • ILO: https://www.ilo.org/publications");
    console.log("  • McKinsey: https://www.mckinsey.com/mgi/our-research");
    console.log("  • Gallup: https://news.gallup.com/");
    console.log("");
    console.log("\x1b[33mNote: Never auto-update statistics. Always verify sources manually.\x1b[0m\n");
  }

  // Exit with error code if there are expired items
  if (expiredFacts.length > 0 || expiredStats.length > 0) {
    process.exit(1);
  }
}

main();

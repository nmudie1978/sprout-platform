#!/usr/bin/env tsx
/**
 * RESEARCH FACTS REFRESH REPORT
 *
 * Reports research facts + evidence that are expiring or expired against the
 * 24-month recency rule (MAX_FACT_AGE_MONTHS / MAX_EVIDENCE_AGE_MONTHS). The
 * classification lives in src/lib/research-freshness.ts (pure + unit-tested).
 *
 * Usage:
 *   npm run refresh:research-facts            # console report
 *   npm run refresh:research-facts -- --json  # also write a status JSON
 *
 * REPORT ONLY — never auto-updates facts. Manual source verification required.
 * Exits 1 if any non-evergreen item is already expired (so a scheduled audit
 * goes red as an early warning before the data hard-blocks CI).
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  _RESEARCH_FACTS_RAW_FOR_TESTING as FACTS,
  MAX_FACT_AGE_MONTHS,
} from "../src/lib/researchFacts";
import {
  _RESEARCH_STATS_RAW_FOR_TESTING as STATS,
  MAX_EVIDENCE_AGE_MONTHS,
} from "../src/lib/researchEvidence";
import {
  analyzeResearchFreshness,
  type ResearchFreshnessItem,
  type ResearchSourceItem,
} from "../src/lib/research-freshness";

const WRITE_JSON = process.argv.slice(2).includes("--json");
const OUT_PATH = resolve(__dirname, "output", "research-facts-status.json");

function printSection(title: string, items: ResearchFreshnessItem[], color: string) {
  if (items.length === 0) return;
  console.log(`\n${color}${"=".repeat(60)}`);
  console.log(title);
  console.log(`${"=".repeat(60)}\x1b[0m\n`);
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.headline}`);
    console.log(`   ID: ${item.id}`);
    console.log(`   Source: ${item.sourceName}`);
    console.log(`   Published: ${item.publishedAt}`);
    console.log(
      `   Days until expiry: ${
        item.daysUntilExpiry < 0 ? `${Math.abs(item.daysUntilExpiry)} days OVERDUE` : item.daysUntilExpiry
      }`,
    );
    console.log(`   URL: ${item.sourceUrl}`);
    console.log("");
  });
}

function main() {
  const report = analyzeResearchFreshness(
    FACTS as ResearchSourceItem[],
    STATS as ResearchSourceItem[],
    {
      maxFactAgeMonths: MAX_FACT_AGE_MONTHS,
      maxEvidenceAgeMonths: MAX_EVIDENCE_AGE_MONTHS,
      now: new Date(),
    },
  );

  console.log("\n\x1b[1m📊 RESEARCH FACTS & EVIDENCE FRESHNESS REPORT\x1b[0m");
  console.log(`Generated: ${report.generatedAt}\n`);

  console.log("\x1b[36m--- RESEARCH FACTS (researchFacts.ts) ---\x1b[0m");
  console.log(`Total: ${report.summary.facts.total} · Max age: ${report.maxFactAgeMonths} months`);
  console.log(`✅ Current: ${report.summary.facts.ok}`);
  console.log(`⚠️  Expiring soon: ${report.summary.facts.expiringSoon}`);
  console.log(`❌ Expired: ${report.summary.facts.expired}`);

  console.log("\n\x1b[36m--- RESEARCH EVIDENCE (researchEvidence.ts) ---\x1b[0m");
  console.log(`Total: ${report.summary.evidence.total} · Max age: ${report.maxEvidenceAgeMonths} months`);
  console.log(`✅ Current: ${report.summary.evidence.ok}`);
  console.log(`⚠️  Expiring soon: ${report.summary.evidence.expiringSoon}`);
  console.log(`❌ Expired: ${report.summary.evidence.expired}`);

  const expired = (its: ResearchFreshnessItem[]) => its.filter((i) => i.status === "expired");
  const soon = (its: ResearchFreshnessItem[]) => its.filter((i) => i.status === "expiring-soon");

  printSection("❌ EXPIRED FACTS (replace now)", expired(report.facts), "\x1b[31m");
  printSection("❌ EXPIRED EVIDENCE (replace now)", expired(report.evidence), "\x1b[31m");
  printSection("⚠️  FACTS EXPIRING WITHIN 6 MONTHS", soon(report.facts), "\x1b[33m");
  printSection("⚠️  EVIDENCE EXPIRING WITHIN 6 MONTHS", soon(report.evidence), "\x1b[33m");

  console.log("\n\x1b[1m" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60) + "\x1b[0m\n");
  if (report.summary.totalIssues === 0) {
    console.log("\x1b[32m✅ All research facts and evidence are current!\x1b[0m\n");
  } else {
    console.log(`Total items needing attention: ${report.summary.totalIssues}`);
    console.log("\nRecommended sources for updates:");
    console.log("  • OECD: https://www.oecd.org/en/publications.html");
    console.log("  • WEF: https://www.weforum.org/publications/");
    console.log("  • ILO: https://www.ilo.org/publications");
    console.log("  • McKinsey: https://www.mckinsey.com/mgi/our-research");
    console.log("  • Gallup: https://news.gallup.com/");
    console.log("\n\x1b[33mNever auto-update statistics. Always verify sources manually.\x1b[0m\n");
  }

  if (WRITE_JSON) {
    const dir = resolve(__dirname, "output");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify(report, null, 2) + "\n", "utf-8");
    console.log(`Wrote ${OUT_PATH}`);
  }

  // Red on expired so a scheduled audit warns before the data hard-blocks CI.
  if (report.summary.hasExpired) process.exit(1);
}

main();

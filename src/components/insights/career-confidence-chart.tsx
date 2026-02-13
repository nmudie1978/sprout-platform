"use client";

import { VegaLiteChart } from "./vega-lite-chart";
import type { VisualizationSpec } from "vega-embed";

const spec: VisualizationSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  title: {
    text: "How Confident Do Young People Feel About Their Career Path?",
    subtitle: [
      "Self-reported confidence by age group (ages 15–21)  ·  Values estimated from aggregated youth surveys",
    ],
    fontSize: 15,
    subtitleFontSize: 11,
    anchor: "start",
    color: "#44403c",
    subtitleColor: "#a8a29e",
    offset: 16,
  },
  width: "container",
  height: 380,
  autosize: { type: "fit", contains: "padding" },
  background: "#fafaf9",
  padding: { top: 20, bottom: 40, left: 16, right: 16 },
  config: {
    font: "Inter, system-ui, sans-serif",
    axis: {
      labelColor: "#78716c",
      titleColor: "#57534e",
      gridColor: "#e7e5e4",
      domainColor: "#d6d3d1",
      tickColor: "#d6d3d1",
      labelFontSize: 12,
      titleFontSize: 12,
      titlePadding: 12,
    },
    legend: {
      labelColor: "#78716c",
      titleColor: "#57534e",
      labelFontSize: 11,
      symbolSize: 120,
      orient: "bottom",
      direction: "horizontal",
      columns: 5,
      titleFontSize: 0,
    },
    view: { stroke: null },
    bar: { cornerRadiusEnd: 3 },
  },
  data: {
    values: [
      { age_group: "15–17", confidence: "Very Confident",     percentage: 12, note: "Many are still exploring — this is completely normal",   source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "15–17", confidence: "Somewhat Confident", percentage: 27, note: "A good number feel they're on the right track",          source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "15–17", confidence: "Neutral",            percentage: 31, note: "Feeling unsure at this stage is very common",            source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "15–17", confidence: "Less Confident",     percentage: 18, note: "Confidence often grows with experience",                 source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "15–17", confidence: "Unsure",             percentage: 12, note: "Not knowing yet is a valid starting point",              source: "Pew Research / YouthSight, 2024 (est.)" },

      { age_group: "18–19", confidence: "Very Confident",     percentage: 18, note: "Confidence tends to grow after school transitions",      source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "18–19", confidence: "Somewhat Confident", percentage: 31, note: "Many feel more direction after first experiences",       source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "18–19", confidence: "Neutral",            percentage: 25, note: "Still figuring things out — and that's okay",            source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "18–19", confidence: "Less Confident",     percentage: 16, note: "New responsibilities can feel overwhelming at first",    source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "18–19", confidence: "Unsure",             percentage: 10, note: "Fewer feel completely unsure as they gain exposure",     source: "Pew Research / YouthSight, 2024 (est.)" },

      { age_group: "20–21", confidence: "Very Confident",     percentage: 24, note: "Confidence often doubles from the mid-teens",            source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "20–21", confidence: "Somewhat Confident", percentage: 34, note: "Most young adults feel at least somewhat clear",         source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "20–21", confidence: "Neutral",            percentage: 21, note: "Some uncertainty is healthy even at this stage",         source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "20–21", confidence: "Less Confident",     percentage: 13, note: "A smaller share — but the feeling is still valid",      source: "Pew Research / YouthSight, 2024 (est.)" },
      { age_group: "20–21", confidence: "Unsure",             percentage:  8, note: "Career clarity is a journey, not a deadline",            source: "Pew Research / YouthSight, 2024 (est.)" },
    ],
  },
  encoding: {
    x: {
      field: "age_group",
      type: "nominal",
      axis: { title: "Age Group", labelAngle: 0 },
      sort: ["15–17", "18–19", "20–21"],
    },
    y: {
      field: "percentage",
      type: "quantitative",
      stack: "normalize",
      axis: { title: "Share of Respondents", format: ".0%", grid: true },
    },
    color: {
      field: "confidence",
      type: "nominal",
      sort: ["Very Confident", "Somewhat Confident", "Neutral", "Less Confident", "Unsure"],
      scale: {
        domain: ["Very Confident", "Somewhat Confident", "Neutral", "Less Confident", "Unsure"],
        range:  ["#34d399",        "#86efac",             "#d4d4d8", "#e2c8a4",        "#c2b5a3"],
      },
      legend: { title: null },
    },
    order: { field: "confidence", sort: "ascending" },
    tooltip: [
      { field: "age_group",  type: "nominal",      title: "Age Group" },
      { field: "confidence", type: "nominal",      title: "Confidence" },
      { field: "percentage", type: "quantitative", title: "Approx. %", format: ".0f" },
      { field: "note",       type: "nominal",      title: "Context" },
      { field: "source",     type: "nominal",      title: "Source" },
    ],
  },
  layer: [
    {
      mark: {
        type: "bar",
        width: { band: 0.6 },
        cursor: "pointer",
      },
    },
    {
      mark: {
        type: "text",
        align: "center",
        baseline: "middle",
        fontSize: 11,
        fontWeight: 500,
        color: "#44403c",
      },
      encoding: {
        y: {
          field: "percentage",
          type: "quantitative",
          stack: "normalize",
          bandPosition: 0.5,
        },
        text: {
          condition: {
            test: "datum.percentage >= 15",
            field: "percentage",
            type: "quantitative",
            format: ".0f",
          },
          value: "",
        },
      },
    },
  ],
} as VisualizationSpec;

/**
 * Career Confidence Chart — Vega-Lite stacked bar showing
 * self-reported career confidence across youth age groups.
 */
export function CareerConfidenceChart() {
  return (
    <VegaLiteChart
      spec={spec}
      className="w-full"
    />
  );
}

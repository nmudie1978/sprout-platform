/**
 * CATEGORY TO RISK MAPPING
 *
 * This file defines the mapping from job categories to risk levels.
 * Risk levels determine the minimum age requirements for jobs.
 *
 * IMPORTANT: This is a SINGLE SOURCE OF TRUTH for category-risk mapping.
 * Update this file when adding new categories or changing risk assessments.
 *
 * Risk Categories:
 * - LOW_RISK (15+): Safe activities with minimal supervision needs
 * - MEDIUM_RISK (16+): Activities requiring some physical capability or judgment
 * - HIGH_RISK (18+): Activities involving children, power tools, chemicals, or heights
 */

import type { JobRiskCategory } from '@prisma/client'

/**
 * Mapping from JobCategory enum values to risk categories.
 * Keep this aligned with the JobCategory enum in Prisma schema.
 */
export const CATEGORY_RISK_MAP: Record<string, JobRiskCategory> = {
  // HIGH_RISK (18+) - Requires adult judgment, involves vulnerable people, or physical danger
  BABYSITTING: 'HIGH_RISK', // Working with children requires adult responsibility
  DIY_HELP: 'HIGH_RISK',    // May involve power tools, ladders, electrical work

  // MEDIUM_RISK (16+) - Physical outdoor work or animal handling
  DOG_WALKING: 'MEDIUM_RISK',    // Handling animals, outdoor navigation
  SNOW_CLEARING: 'MEDIUM_RISK',  // Physical labor, cold weather exposure
  CLEANING: 'MEDIUM_RISK',       // Chemical exposure, physical work

  // LOW_RISK (15+) - Safe indoor/digital activities
  TECH_HELP: 'LOW_RISK',   // Computer/phone assistance
  ERRANDS: 'LOW_RISK',     // Simple tasks, shopping
  OTHER: 'LOW_RISK',       // Default for unspecified (will be reviewed)
}

/**
 * Mapping from standard job category slugs to risk categories.
 * For the standardized taxonomy system.
 */
export const STANDARD_CATEGORY_RISK_MAP: Record<string, JobRiskCategory> = {
  // HIGH_RISK (18+)
  'child-family-support': 'HIGH_RISK',       // Childcare, tutoring
  'home-yard-help': 'HIGH_RISK',             // May involve tools, heights

  // MEDIUM_RISK (16+)
  'pet-animal-care': 'MEDIUM_RISK',          // Animal handling
  'cleaning-organizing': 'MEDIUM_RISK',      // Chemicals, physical work
  'fitness-activity-help': 'MEDIUM_RISK',    // Physical activities

  // LOW_RISK (15+)
  'tech-digital-help': 'LOW_RISK',           // Computer assistance
  'errands-local-tasks': 'LOW_RISK',         // Shopping, delivery
  'events-community-help': 'LOW_RISK',       // Event assistance
  'creative-media-gigs': 'LOW_RISK',         // Photography, design
  'education-learning-support': 'LOW_RISK',  // Tutoring (non-child)
  'retail-microbusiness-help': 'LOW_RISK',   // Shop assistance
  'online-ai-age-jobs': 'LOW_RISK',          // Digital work
}

/**
 * Default risk category for jobs that don't have a mapping.
 * Use LOW_RISK as default to be permissive, but flag for review.
 */
export const DEFAULT_RISK_CATEGORY: JobRiskCategory = 'LOW_RISK'

/**
 * Get risk category for a job category.
 * Checks both legacy and standard category mappings.
 */
export function getRiskForCategory(
  category?: string | null,
  standardCategorySlug?: string | null
): JobRiskCategory {
  // Check standard category first (more specific)
  if (standardCategorySlug && STANDARD_CATEGORY_RISK_MAP[standardCategorySlug]) {
    return STANDARD_CATEGORY_RISK_MAP[standardCategorySlug]
  }

  // Fall back to legacy category
  if (category && CATEGORY_RISK_MAP[category]) {
    return CATEGORY_RISK_MAP[category]
  }

  // Default
  return DEFAULT_RISK_CATEGORY
}

/**
 * Human-readable descriptions for risk categories.
 * Use in UI to explain why a job has a certain minimum age.
 */
export const RISK_CATEGORY_DESCRIPTIONS: Record<JobRiskCategory, string> = {
  LOW_RISK: 'Safe activities suitable for all workers aged 15+',
  MEDIUM_RISK: 'Activities requiring physical capability or judgment, suitable for workers aged 16+',
  HIGH_RISK: 'Activities involving children, tools, or higher responsibility, requiring workers aged 18+',
}

/**
 * Examples of jobs in each risk category.
 * Use in UI and documentation.
 */
export const RISK_CATEGORY_EXAMPLES: Record<JobRiskCategory, string[]> = {
  LOW_RISK: ['Tech support', 'Running errands', 'Photography', 'Online tasks'],
  MEDIUM_RISK: ['Dog walking', 'Snow clearing', 'House cleaning', 'Pet sitting'],
  HIGH_RISK: ['Babysitting', 'DIY repairs', 'Home maintenance with tools'],
}

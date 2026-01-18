/**
 * SEED AGE POLICY
 *
 * Creates the initial version 1 age policy in the database.
 * This should be run as part of the main seed or standalone.
 *
 * SAFETY CRITICAL - This policy controls job visibility and application eligibility.
 */

import { PrismaClient, AgePolicyStatus } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Initial age policy configuration (Version 1)
 *
 * Risk Categories:
 * - LOW_RISK: 15+ (safe indoor/digital activities)
 * - MEDIUM_RISK: 16+ (physical outdoor work, animal handling)
 * - HIGH_RISK: 18+ (children, power tools, chemicals)
 */
const INITIAL_POLICY_JSON = {
  LOW_RISK: { minAge: 15 },
  MEDIUM_RISK: { minAge: 16 },
  HIGH_RISK: { minAge: 18 },
}

export async function seedAgePolicy() {
  console.log('🔒 Seeding age policy...')

  // Check if any policy already exists
  const existingPolicy = await prisma.agePolicy.findFirst({
    where: { status: 'ACTIVE' },
  })

  if (existingPolicy) {
    console.log(`  ✓ Active age policy v${existingPolicy.version} already exists, skipping`)
    return existingPolicy
  }

  // Create version 1 policy
  const policy = await prisma.agePolicy.create({
    data: {
      version: 1,
      status: AgePolicyStatus.ACTIVE,
      policyJson: INITIAL_POLICY_JSON,
      description: 'Initial age policy - baseline minimum ages by risk category',
      createdById: null, // System-created
    },
  })

  console.log(`  ✓ Created age policy v${policy.version}`)
  console.log('    Risk levels:')
  console.log('    - LOW_RISK:    15+ (tech help, errands)')
  console.log('    - MEDIUM_RISK: 16+ (dog walking, cleaning, snow clearing)')
  console.log('    - HIGH_RISK:   18+ (babysitting, DIY with tools)')

  return policy
}

// Run standalone if this file is executed directly
if (require.main === module) {
  seedAgePolicy()
    .then(() => {
      console.log('\n✅ Age policy seed complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Age policy seed failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

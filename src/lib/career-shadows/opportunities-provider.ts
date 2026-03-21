/**
 * Career Shadow Opportunities Provider
 *
 * Provides searchable shadow opportunities from hosts/employers.
 * Includes mock provider for development and testing.
 *
 * USAGE:
 *   const provider = getOpportunitiesProvider();
 *   const opps = await provider.searchOpportunities({ roleTitle: 'Developer' });
 */

import { faker } from '@faker-js/faker';

// ============================================
// TYPES
// ============================================

export interface ShadowOpportunity {
  id: string;
  hostId: string;
  hostName: string;
  hostCompany: string;
  hostRole: string;
  hostVerified: boolean;
  hostAvatarUrl?: string;

  roleTitle: string;
  roleCategory: string;
  description: string;

  location: string;
  city: string;
  remoteAllowed: boolean;

  format: 'WALKTHROUGH' | 'HALF_DAY' | 'FULL_DAY';
  duration: string; // e.g., "2-3 hours", "Half day"

  ageRequirement: number; // Minimum age
  availableDays: string[];
  availableSlots: number;

  tags: string[];
  createdAt: string;
}

export interface SearchOpportunitiesParams {
  roleTitle?: string;
  roleCategory?: string;
  city?: string;
  remoteAllowed?: boolean;
  minAge?: number;
  maxAge?: number;
  format?: 'WALKTHROUGH' | 'HALF_DAY' | 'FULL_DAY';
  limit?: number;
  offset?: number;
}

export interface OpportunitiesProvider {
  searchOpportunities(params: SearchOpportunitiesParams): Promise<ShadowOpportunity[]>;
  getOpportunityById(id: string): Promise<ShadowOpportunity | null>;
  getCategories(): Promise<string[]>;
  getCities(): Promise<string[]>;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_ROLES = [
  { title: 'Software Developer', category: 'Technology' },
  { title: 'UX Designer', category: 'Design' },
  { title: 'Data Analyst', category: 'Technology' },
  { title: 'Marketing Manager', category: 'Business' },
  { title: 'Nurse', category: 'Healthcare' },
  { title: 'Physical Therapist', category: 'Healthcare' },
  { title: 'Veterinarian', category: 'Healthcare' },
  { title: 'Teacher', category: 'Education' },
  { title: 'Electrician', category: 'Trades' },
  { title: 'Plumber', category: 'Trades' },
  { title: 'Architect', category: 'Design' },
  { title: 'Civil Engineer', category: 'Engineering' },
  { title: 'Mechanical Engineer', category: 'Engineering' },
  { title: 'Accountant', category: 'Finance' },
  { title: 'Financial Analyst', category: 'Finance' },
  { title: 'Graphic Designer', category: 'Design' },
  { title: 'Chef', category: 'Hospitality' },
  { title: 'Hotel Manager', category: 'Hospitality' },
  { title: 'Journalist', category: 'Media' },
  { title: 'Photographer', category: 'Media' },
];

const MOCK_COMPANIES = [
  'Tech Solutions AS',
  'Nordic Innovations',
  'HealthFirst Clinic',
  'Green Energy Co',
  'Design Studio Oslo',
  'Finance Partners',
  'Construction Group',
  'Media House Norway',
  'Education Center',
  'Hospitality Services',
];

const CITIES = [
  'Oslo',
  'Bergen',
  'Trondheim',
  'Stavanger',
  'Drammen',
  'Kristiansand',
  'Tromsø',
  'Ålesund',
  'Fredrikstad',
  'Sandnes',
];

const FORMATS: Array<'WALKTHROUGH' | 'HALF_DAY' | 'FULL_DAY'> = ['WALKTHROUGH', 'HALF_DAY', 'FULL_DAY'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ============================================
// MOCK PROVIDER
// ============================================

export class MockOpportunitiesProvider implements OpportunitiesProvider {
  private opportunities: ShadowOpportunity[] = [];
  private initialized = false;

  private initialize(): void {
    if (this.initialized) return;

    // Use deterministic seed for consistent mock data
    faker.seed(42);

    // Generate 30-50 opportunities
    const count = faker.number.int({ min: 30, max: 50 });

    for (let i = 0; i < count; i++) {
      const role = MOCK_ROLES[i % MOCK_ROLES.length];
      const format = FORMATS[i % FORMATS.length];
      const city = CITIES[i % CITIES.length];

      this.opportunities.push({
        id: `opp_${i.toString().padStart(3, '0')}`,
        hostId: `host_${i}`,
        hostName: faker.person.fullName(),
        hostCompany: MOCK_COMPANIES[i % MOCK_COMPANIES.length],
        hostRole: role.title,
        hostVerified: faker.datatype.boolean(0.8),
        hostAvatarUrl: undefined,

        roleTitle: role.title,
        roleCategory: role.category,
        description: `Experience a day in the life of a ${role.title}. Learn about daily responsibilities, required skills, and career growth opportunities in ${role.category}.`,

        location: `${faker.location.streetAddress()}, ${city}`,
        city,
        remoteAllowed: faker.datatype.boolean(0.3),

        format,
        duration: format === 'WALKTHROUGH' ? '1-2 hours' : format === 'HALF_DAY' ? '3-4 hours' : 'Full day (6-8 hours)',

        ageRequirement: faker.helpers.arrayElement([15, 16, 17, 18]),
        availableDays: faker.helpers.arrayElements(DAYS, { min: 2, max: 4 }),
        availableSlots: faker.number.int({ min: 1, max: 5 }),

        tags: faker.helpers.arrayElements(
          ['hands-on', 'mentorship', 'networking', 'portfolio', 'certificate', 'lunch provided'],
          { min: 1, max: 3 }
        ),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
      });
    }

    this.initialized = true;
  }

  async searchOpportunities(params: SearchOpportunitiesParams): Promise<ShadowOpportunity[]> {
    this.initialize();

    let results = [...this.opportunities];

    // Filter by roleTitle (keyword search)
    if (params.roleTitle) {
      const keyword = params.roleTitle.toLowerCase();
      results = results.filter(
        (o) =>
          o.roleTitle.toLowerCase().includes(keyword) ||
          o.roleCategory.toLowerCase().includes(keyword) ||
          o.description.toLowerCase().includes(keyword)
      );
    }

    // Filter by category
    if (params.roleCategory) {
      results = results.filter(
        (o) => o.roleCategory.toLowerCase() === params.roleCategory!.toLowerCase()
      );
    }

    // Filter by city
    if (params.city) {
      const cityLower = params.city.toLowerCase();
      results = results.filter(
        (o) => o.city.toLowerCase() === cityLower || (params.remoteAllowed && o.remoteAllowed)
      );
    }

    // Filter by remote allowed
    if (params.remoteAllowed !== undefined) {
      results = results.filter((o) => o.remoteAllowed === params.remoteAllowed);
    }

    // Filter by age requirement
    if (params.minAge !== undefined) {
      results = results.filter((o) => o.ageRequirement <= params.minAge!);
    }

    // Filter by format
    if (params.format) {
      results = results.filter((o) => o.format === params.format);
    }

    // Apply pagination
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    results = results.slice(offset, offset + limit);

    return results;
  }

  async getOpportunityById(id: string): Promise<ShadowOpportunity | null> {
    this.initialize();
    return this.opportunities.find((o) => o.id === id) || null;
  }

  async getCategories(): Promise<string[]> {
    return [...new Set(MOCK_ROLES.map((r) => r.category))].sort();
  }

  async getCities(): Promise<string[]> {
    return [...CITIES].sort();
  }
}

// ============================================
// DATABASE PROVIDER (stub for future)
// ============================================

export class DatabaseOpportunitiesProvider implements OpportunitiesProvider {
  async searchOpportunities(params: SearchOpportunitiesParams): Promise<ShadowOpportunity[]> {
    // TODO: Implement database queries when opportunity table is added
    // For now, fall back to mock
    const mock = new MockOpportunitiesProvider();
    return mock.searchOpportunities(params);
  }

  async getOpportunityById(id: string): Promise<ShadowOpportunity | null> {
    const mock = new MockOpportunitiesProvider();
    return mock.getOpportunityById(id);
  }

  async getCategories(): Promise<string[]> {
    const mock = new MockOpportunitiesProvider();
    return mock.getCategories();
  }

  async getCities(): Promise<string[]> {
    const mock = new MockOpportunitiesProvider();
    return mock.getCities();
  }
}

// ============================================
// FACTORY
// ============================================

let provider: OpportunitiesProvider | null = null;

export function getOpportunitiesProvider(): OpportunitiesProvider {
  if (!provider) {
    const providerType = process.env.CAREER_SHADOWS_PROVIDER || 'mock';

    switch (providerType) {
      case 'db':
      case 'database':
        provider = new DatabaseOpportunitiesProvider();
        break;
      case 'mock':
      default:
        provider = new MockOpportunitiesProvider();
        break;
    }
  }

  return provider;
}

export function resetOpportunitiesProvider(): void {
  provider = null;
}

/**
 * Career Shadows Module
 *
 * Provides career shadow opportunities search and management.
 */

export {
  getOpportunitiesProvider,
  resetOpportunitiesProvider,
  MockOpportunitiesProvider,
  DatabaseOpportunitiesProvider,
  type OpportunitiesProvider,
  type ShadowOpportunity,
  type SearchOpportunitiesParams,
} from './opportunities-provider';

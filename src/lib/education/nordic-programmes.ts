/**
 * DEPRECATED — import from '@/lib/education' instead.
 *
 * This file exists only as a backward-compat shim during migration.
 * All data and logic now live in:
 *   src/lib/education/data/institutions.json
 *   src/lib/education/data/programmes.json
 *   src/lib/education/index.ts
 */

export {
  getNorwayProgrammes,
  getCertificationPath,
  getProgrammesForCareer,
  getCoveredCareerIds,
  getProgrammeCount,
  getProgrammesByCountry,
  getInstitutionsForCareer,
  getAdvancedCareerMapping,
  resolveCareer,
} from './index';

export type {
  NordicCountry,
  ProgrammeType,
  ProgrammeWithInstitution,
  ProgrammeFilter,
  CareerEducationPath,
  Institution,
  Programme,
  AdvancedCareerMapping,
  CertificationPath,
} from './index';

/** @deprecated Use ProgrammeWithInstitution instead */
export type { ProgrammeWithInstitution as NordicProgramme } from './index';
/** @deprecated Use CareerEducationPath instead */
export type { CareerEducationPath as NorwayProgramme } from './index';

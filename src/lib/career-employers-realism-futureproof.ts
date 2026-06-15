/**
 * Career-employer REALISM overrides — future-proof additions (2026-06-15).
 *
 * Employer lists for the ~21 future-proof careers added alongside the Career
 * Radar "Future-Proof Careers" filter rebuild. Norway-first, real employers.
 * Consulted by getTopEmployers() so these new careers don't fall to an
 * implausible category fallback.
 */
import type { Employer } from './career-employers';

export const REALISM_EMPLOYERS_FUTUREPROOF: Record<string, Employer[]> = {
  "ai-infrastructure-engineer": [
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Schibsted", industry: "Media / technology", size: "Large", careersUrl: "https://schibsted.com/career" },
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
  ],
  "ai-platform-engineer": [
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "Visma", industry: "Business software", size: "Enterprise", careersUrl: "https://www.visma.com/careers" },
    { name: "Schibsted", industry: "Media / technology", size: "Large", careersUrl: "https://schibsted.com/career" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Bekk", industry: "Technology consulting", size: "Large", careersUrl: "https://www.bekk.no" },
  ],
  "ai-regulation-specialist": [
    { name: "PwC Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www.pwc.no/no/karriere.html" },
    { name: "Deloitte Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www2.deloitte.com/no/no/careers.html" },
    { name: "EY Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www.ey.com/en_no/careers" },
    { name: "Norwegian Data Protection Authority (Datatilsynet)", industry: "Public regulator", size: "Medium", careersUrl: "https://www.datatilsynet.no" },
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
  ],
  "ai-security-engineer": [
    { name: "Mnemonic", industry: "Cybersecurity", size: "Large", careersUrl: "https://www.mnemonic.io/careers" },
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Sopra Steria", industry: "IT consulting", size: "Enterprise", careersUrl: "https://www.soprasteria.no/karriere" },
  ],
  "ai-systems-architect": [
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "Bekk", industry: "Technology consulting", size: "Large", careersUrl: "https://www.bekk.no" },
    { name: "Sopra Steria", industry: "IT consulting", size: "Enterprise", careersUrl: "https://www.soprasteria.no/karriere" },
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
  ],
  "autonomous-systems-engineer": [
    { name: "Kongsberg Gruppen", industry: "Maritime / defence technology", size: "Enterprise", careersUrl: "https://www.kongsberg.com/careers" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "Zeabuz", industry: "Autonomous maritime", size: "Small" },
  ],
  "carbon-analyst": [
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
    { name: "PwC Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www.pwc.no/no/karriere.html" },
    { name: "EY Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www.ey.com/en_no/careers" },
    { name: "Bellona", industry: "Environmental NGO", size: "Medium", careersUrl: "https://bellona.org" },
    { name: "Equinor", industry: "Energy", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
  ],
  "chief-ai-officer": [
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Cognite", industry: "Industrial software / AI", size: "Large", careersUrl: "https://www.cognite.com/careers" },
    { name: "Schibsted", industry: "Media / technology", size: "Large", careersUrl: "https://schibsted.com/career" },
  ],
  "chief-executive-officer": [
    { name: "Equinor", industry: "Energy", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Norsk Hydro", industry: "Materials / aluminium", size: "Enterprise", careersUrl: "https://www.hydro.com/careers" },
    { name: "Varies / many employers", industry: "Cross-sector", size: "Varies" },
  ],
  "chief-operating-officer": [
    { name: "Equinor", industry: "Energy", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Norsk Hydro", industry: "Materials / aluminium", size: "Enterprise", careersUrl: "https://www.hydro.com/careers" },
    { name: "Schibsted", industry: "Media / technology", size: "Large", careersUrl: "https://schibsted.com/career" },
    { name: "Varies / many employers", industry: "Cross-sector", size: "Varies" },
  ],
  "data-center-architect": [
    { name: "Green Mountain", industry: "Data centres", size: "Large", careersUrl: "https://greenmountain.no/career" },
    { name: "GlobalConnect", industry: "Digital infrastructure", size: "Large", careersUrl: "https://www.globalconnect.no" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Bulk Infrastructure", industry: "Data centres / infrastructure", size: "Large" },
  ],
  "defence-systems-engineer": [
    { name: "Kongsberg Defence & Aerospace", industry: "Defence technology", size: "Enterprise", careersUrl: "https://www.kongsberg.com/careers" },
    { name: "Nammo", industry: "Defence / aerospace", size: "Large", careersUrl: "https://www.nammo.com/careers" },
    { name: "Norwegian Defence Research Establishment (FFI)", industry: "Defence research", size: "Large", careersUrl: "https://www.ffi.no/en/career" },
    { name: "Forsvaret", industry: "Armed forces", size: "Enterprise", careersUrl: "https://www.forsvaret.no" },
    { name: "Thales Norway", industry: "Defence electronics", size: "Large" },
  ],
  "educational-psychologist": [
    { name: "PPT (Pedagogisk-psykologisk tjeneste)", industry: "Municipal education support", size: "Large", careersUrl: "https://www.udir.no" },
    { name: "BUP (Barne- og ungdomspsykiatrisk poliklinikk)", industry: "Child mental health services", size: "Large" },
    { name: "Statped", industry: "Special needs education", size: "Large", careersUrl: "https://www.statped.no" },
    { name: "Oslo kommune", industry: "Municipal government", size: "Enterprise", careersUrl: "https://www.oslo.kommune.no/jobb" },
    { name: "Varies / many schools and municipalities", industry: "Public education", size: "Varies" },
  ],
  "energy-transition-consultant": [
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
    { name: "McKinsey & Company Norway", industry: "Management consulting", size: "Large", careersUrl: "https://www.mckinsey.com/careers" },
    { name: "BCG Norway", industry: "Management consulting", size: "Large", careersUrl: "https://careers.bcg.com" },
    { name: "Multiconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.multiconsult.no/karriere" },
    { name: "Statkraft", industry: "Renewable energy", size: "Enterprise", careersUrl: "https://www.statkraft.com/career" },
  ],
  "environmental-engineer": [
    { name: "Multiconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.multiconsult.no/karriere" },
    { name: "Norconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.norconsult.no/karriere" },
    { name: "COWI", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.cowi.com/careers" },
    { name: "Sweco Norge", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.sweco.no/karriere" },
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
  ],
  "fiber-optic-technician": [
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "Telia Norge", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telia.no" },
    { name: "Nettpartner", industry: "Power / telecom infrastructure", size: "Large" },
    { name: "GlobalConnect", industry: "Digital infrastructure", size: "Large", careersUrl: "https://www.globalconnect.no" },
    { name: "Caverion", industry: "Technical building services", size: "Large", careersUrl: "https://www.caverion.no" },
  ],
  "nuclear-engineer": [
    { name: "Institute for Energy Technology (IFE)", industry: "Nuclear research", size: "Large", careersUrl: "https://ife.no/en/career" },
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
    { name: "Norwegian Radiation and Nuclear Safety Authority (DSA)", industry: "Public safety authority", size: "Medium", careersUrl: "https://dsa.no" },
    { name: "Equinor", industry: "Energy", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Norsk Kjernekraft", industry: "Nuclear power development", size: "Small" },
  ],
  "renewable-energy-engineer": [
    { name: "Statkraft", industry: "Renewable energy", size: "Enterprise", careersUrl: "https://www.statkraft.com/career" },
    { name: "Equinor", industry: "Energy", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Multiconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.multiconsult.no/karriere" },
    { name: "DNV", industry: "Assurance / risk management", size: "Enterprise", careersUrl: "https://www.dnv.com/careers" },
    { name: "Aker Solutions", industry: "Energy engineering", size: "Enterprise", careersUrl: "https://www.akersolutions.com/careers" },
  ],
  "security-consultant": [
    { name: "Mnemonic", industry: "Cybersecurity", size: "Large", careersUrl: "https://www.mnemonic.io/careers" },
    { name: "Sopra Steria", industry: "IT consulting", size: "Enterprise", careersUrl: "https://www.soprasteria.no/karriere" },
    { name: "PwC Norway", industry: "Professional services", size: "Enterprise", careersUrl: "https://www.pwc.no/no/karriere.html" },
    { name: "Bekk", industry: "Technology consulting", size: "Large", careersUrl: "https://www.bekk.no" },
    { name: "Netsecurity", industry: "Cybersecurity", size: "Medium" },
  ],
  "security-operations-manager": [
    { name: "Mnemonic", industry: "Cybersecurity", size: "Large", careersUrl: "https://www.mnemonic.io/careers" },
    { name: "Telenor", industry: "Telecommunications", size: "Enterprise", careersUrl: "https://www.telenor.com/careers" },
    { name: "DNB", industry: "Banking / finance", size: "Enterprise", careersUrl: "https://www.dnb.no/karriere" },
    { name: "Equinor", industry: "Energy / digital", size: "Enterprise", careersUrl: "https://www.equinor.com/careers" },
    { name: "Sopra Steria", industry: "IT consulting", size: "Enterprise", careersUrl: "https://www.soprasteria.no/karriere" },
  ],
  "structural-engineer": [
    { name: "Multiconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.multiconsult.no/karriere" },
    { name: "Norconsult", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.norconsult.no/karriere" },
    { name: "COWI", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.cowi.com/careers" },
    { name: "Sweco Norge", industry: "Engineering consulting", size: "Large", careersUrl: "https://www.sweco.no/karriere" },
    { name: "Aker Solutions", industry: "Energy engineering", size: "Enterprise", careersUrl: "https://www.akersolutions.com/careers" },
  ],
};

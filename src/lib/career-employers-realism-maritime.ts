/**
 * Career-employer REALISM overrides — merchant-fleet deck careers (2026-06-26).
 * Norway-first shipping companies for the deck career ladder (ordinary seaman →
 * master mariner) + the coastal pilot service. Wired into getCareerEmployers().
 */
import type { Employer } from "./career-employers";

const FLEET: Employer[] = [
  { name: "Wallenius Wilhelmsen", industry: "Shipping (Ro-Ro)", size: "8,000+", careersUrl: "https://www.walleniuswilhelmsen.com/careers" },
  { name: "Wilhelmsen Group", industry: "Maritime", size: "5,000+", careersUrl: "https://www.wilhelmsen.com/careers/" },
  { name: "DOF Group", industry: "Offshore Shipping", size: "3,000+", careersUrl: "https://www.dof.com" },
  { name: "Solstad Offshore", industry: "Offshore Shipping", size: "2,000+", careersUrl: "https://www.solstad.com" },
  { name: "Hurtigruten", industry: "Coastal & Cruise Shipping", size: "2,000+", careersUrl: "https://www.hurtigruten.com" },
  { name: "Color Line", industry: "Passenger & Cargo Ferries", size: "2,000+", careersUrl: "https://www.colorline.com" },
];

export const REALISM_EMPLOYERS_MARITIME: Record<string, Employer[]> = {
  "ordinary-seaman": FLEET,
  "able-seaman": FLEET,
  "deck-cadet": FLEET,
  "deck-officer": FLEET,
  "chief-officer": FLEET,
  "master-mariner": [
    ...FLEET,
    { name: "Grieg Star", industry: "Shipping", size: "1,000+" },
    { name: "Odfjell", industry: "Chemical Tanker Shipping", size: "2,000+", careersUrl: "https://www.odfjell.com" },
  ],
  "maritime-pilot": [
    { name: "Kystverket — Lostjenesten (Norwegian Coastal Administration)", industry: "Coastal Pilotage & Government", size: "1,000+", careersUrl: "https://www.kystverket.no" },
    { name: "Wilhelmsen Group", industry: "Maritime (port & marine services)", size: "5,000+", careersUrl: "https://www.wilhelmsen.com/careers/" },
    { name: "Hurtigruten", industry: "Coastal Shipping", size: "2,000+", careersUrl: "https://www.hurtigruten.com" },
    { name: "Color Line", industry: "Ferries", size: "2,000+", careersUrl: "https://www.colorline.com" },
  ],
};

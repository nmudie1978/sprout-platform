/**
 * Career-employer REALISM overrides — built-environment + sports careers
 * (2026-06-23). Norway-first, real employers for the 22 architecture/built-
 * environment and sports careers added in the catalogue expansion. Wired into
 * getCareerEmployers() in career-employers.ts.
 */
import type { Employer } from "./career-employers";

export const REALISM_EMPLOYERS_BUILTSPORT: Record<string, Employer[]> = {
  // ── Architecture & design ───────────────────────────────────────────
  "interior-architect": [
    { name: "Snøhetta", industry: "Architecture & Design", size: "300+", careersUrl: "https://snohetta.com" },
    { name: "LINK Arkitektur", industry: "Architecture", size: "500+", careersUrl: "https://linkarkitektur.com" },
    { name: "Dark Arkitekter", industry: "Architecture & Interior", size: "50+", careersUrl: "https://dark.no" },
    { name: "Metropolis arkitektur & design", industry: "Architecture & Interior", size: "50+" },
    { name: "Gensler", industry: "Architecture & Design", size: "5,000+", careersUrl: "https://www.gensler.com" },
  ],
  "landscape-architect": [
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Bjørbekk & Lindheim", industry: "Landscape Architecture", size: "50+" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.com" },
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Sweco", industry: "Engineering & Architecture", size: "5,000+", careersUrl: "https://www.sweco.no" },
  ],
  "urban-designer": [
    { name: "Nordic — Office of Architecture", industry: "Architecture & Urbanism", size: "200+", careersUrl: "https://nordicarch.com" },
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Henning Larsen", industry: "Architecture & Urban Design", size: "500+", careersUrl: "https://henninglarsen.com" },
    { name: "COWI", industry: "Engineering Consultancy", size: "7,000+", careersUrl: "https://www.cowi.com" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.com" },
  ],
  "sustainable-design-architect": [
    { name: "Snøhetta", industry: "Architecture & Design", size: "300+", careersUrl: "https://snohetta.com" },
    { name: "Henning Larsen", industry: "Architecture", size: "500+", careersUrl: "https://henninglarsen.com" },
    { name: "LINK Arkitektur", industry: "Architecture", size: "500+", careersUrl: "https://linkarkitektur.com" },
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Rambøll", industry: "Engineering Consultancy", size: "10,000+", careersUrl: "https://www.ramboll.com" },
  ],
  "conservation-architect": [
    { name: "Riksantikvaren (Directorate for Cultural Heritage)", industry: "Public Heritage", size: "200+", careersUrl: "https://www.riksantikvaren.no" },
    { name: "NIKU (Cultural Heritage Research)", industry: "Heritage Research", size: "200+", careersUrl: "https://www.niku.no" },
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "LINK Arkitektur", industry: "Architecture", size: "500+", careersUrl: "https://linkarkitektur.com" },
  ],
  "architectural-visualisation-artist": [
    { name: "MIR", industry: "Architectural Visualisation", size: "50+", careersUrl: "https://mir.no" },
    { name: "Squint/Opera", industry: "Design & Visualisation", size: "50+", careersUrl: "https://squintopera.com" },
    { name: "Brick Visual", industry: "Architectural Visualisation", size: "100+", careersUrl: "https://brickvisual.com" },
    { name: "Snøhetta", industry: "Architecture & Design", size: "300+", careersUrl: "https://snohetta.com" },
    { name: "Nordic — Office of Architecture", industry: "Architecture", size: "200+", careersUrl: "https://nordicarch.com" },
  ],

  // ── Built-environment engineering ───────────────────────────────────
  "building-services-engineer": [
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.no" },
    { name: "Sweco", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.sweco.no" },
    { name: "Rambøll", industry: "Engineering Consultancy", size: "10,000+", careersUrl: "https://www.ramboll.com" },
    { name: "AFRY", industry: "Engineering Consultancy", size: "10,000+", careersUrl: "https://www.afry.com" },
    { name: "COWI", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.cowi.com" },
  ],
  "fire-engineer": [
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.no" },
    { name: "Sweco", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.sweco.no" },
    { name: "COWI", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.cowi.com" },
    { name: "Arup", industry: "Engineering Consultancy", size: "18,000+", careersUrl: "https://www.arup.com" },
  ],
  "architectural-technologist": [
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.no" },
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Veidekke", industry: "Construction", size: "8,000+", careersUrl: "https://www.veidekke.no" },
    { name: "Sweco", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.sweco.no" },
  ],
  "bim-manager": [
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Norconsult", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.norconsult.no" },
    { name: "Veidekke", industry: "Construction", size: "8,000+", careersUrl: "https://www.veidekke.no" },
    { name: "Skanska", industry: "Construction", size: "27,000+", careersUrl: "https://www.skanska.no" },
    { name: "AF Gruppen", industry: "Construction", size: "5,000+", careersUrl: "https://www.afgruppen.no" },
  ],
  "bim-coordinator": [
    { name: "Asplan Viak", industry: "Engineering & Architecture", size: "1,000+", careersUrl: "https://www.asplanviak.no" },
    { name: "Multiconsult", industry: "Engineering Consultancy", size: "3,000+", careersUrl: "https://www.multiconsult.no" },
    { name: "Sweco", industry: "Engineering Consultancy", size: "5,000+", careersUrl: "https://www.sweco.no" },
    { name: "Veidekke", industry: "Construction", size: "8,000+", careersUrl: "https://www.veidekke.no" },
    { name: "AF Gruppen", industry: "Construction", size: "5,000+", careersUrl: "https://www.afgruppen.no" },
  ],

  // ── Sports ──────────────────────────────────────────────────────────
  "basketball-player": [
    { name: "Bærum Basket", industry: "Basketball club", size: "50+", careersUrl: "https://www.baerumbasket.no" },
    { name: "Norges Basketballforbund", industry: "Sports federation", size: "50+" },
    { name: "EuroLeague Basketball", industry: "Basketball league", size: "200+" },
    { name: "NBA", industry: "Basketball league", size: "1,000+" },
    { name: "FIBA", industry: "Basketball federation", size: "200+" },
  ],
  "golf-professional": [
    { name: "Norges Golfforbund", industry: "Sports federation", size: "50+", careersUrl: "https://www.golfforbundet.no" },
    { name: "Oslo Golfklubb", industry: "Golf club", size: "50+" },
    { name: "PGA of Norway", industry: "Golf professionals body", size: "50+" },
    { name: "DP World Tour", industry: "Professional golf tour", size: "200+" },
    { name: "PGA Tour", industry: "Professional golf tour", size: "500+" },
  ],
  "formula-one-driver": [
    { name: "Mercedes-AMG Petronas F1 Team", industry: "Motorsport", size: "1,000+", careersUrl: "https://www.mercedesamgf1.com/careers" },
    { name: "Oracle Red Bull Racing", industry: "Motorsport", size: "1,000+" },
    { name: "Scuderia Ferrari", industry: "Motorsport", size: "1,000+" },
    { name: "McLaren Racing", industry: "Motorsport", size: "1,000+" },
    { name: "FIA", industry: "Motorsport governing body", size: "200+" },
  ],
  "competitive-swimmer": [
    { name: "Norges Svømmeforbund", industry: "Sports federation", size: "50+", careersUrl: "https://svomming.no" },
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+" },
    { name: "Bergen Svømmeklubb", industry: "Swimming club", size: "50+" },
    { name: "World Aquatics", industry: "Aquatics federation", size: "200+" },
    { name: "LEN (European Aquatics)", industry: "Aquatics federation", size: "100+" },
  ],
  "professional-cyclist": [
    { name: "Uno-X Mobility Pro Cycling Team", industry: "Pro cycling team", size: "100+", careersUrl: "https://www.unoxteam.com" },
    { name: "Norges Cykleforbund", industry: "Sports federation", size: "50+" },
    { name: "UCI", industry: "Cycling governing body", size: "200+" },
    { name: "Team Visma–Lease a Bike", industry: "Pro cycling team", size: "100+" },
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+" },
  ],
  "sporting-director": [
    { name: "FK Bodø/Glimt", industry: "Football club", size: "100+", careersUrl: "https://www.glimt.no" },
    { name: "Rosenborg BK", industry: "Football club", size: "100+", careersUrl: "https://www.rbk.no" },
    { name: "Molde FK", industry: "Football club", size: "100+", careersUrl: "https://www.moldefk.no" },
    { name: "Vålerenga Fotball", industry: "Football club", size: "100+" },
    { name: "Norges Fotballforbund", industry: "Sports federation", size: "200+" },
  ],
  "sports-ai-data-scientist": [
    { name: "Hudl", industry: "Sports analytics software", size: "3,000+", careersUrl: "https://www.hudl.com/about/careers" },
    { name: "Second Spectrum", industry: "Sports tracking & AI", size: "200+" },
    { name: "Catapult", industry: "Sports performance tech", size: "500+" },
    { name: "Stats Perform", industry: "Sports data & AI", size: "1,000+" },
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+" },
  ],
  "sports-technology-specialist": [
    { name: "Catapult", industry: "Sports performance tech", size: "500+", careersUrl: "https://www.catapult.com/careers" },
    { name: "STATSports", industry: "GPS player tracking", size: "200+" },
    { name: "Hudl", industry: "Sports analytics software", size: "3,000+" },
    { name: "Polar", industry: "Wearable technology", size: "1,000+" },
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+" },
  ],
  "sports-content-creator": [
    { name: "TV 2 Sport", industry: "Sports media", size: "1,000+" },
    { name: "Viaplay Group", industry: "Streaming & sports media", size: "1,000+" },
    { name: "FK Bodø/Glimt", industry: "Football club", size: "100+", careersUrl: "https://www.glimt.no" },
    { name: "Norges Fotballforbund", industry: "Sports federation", size: "200+" },
    { name: "Red Bull Media House", industry: "Sports & media", size: "1,000+" },
  ],
  "team-doctor": [
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+", careersUrl: "https://olympiatoppen.no" },
    { name: "Oslo universitetssykehus", industry: "Hospital", size: "20,000+" },
    { name: "Idrettens Helsesenter", industry: "Sports medicine clinic", size: "50+" },
    { name: "Norges Fotballforbund", industry: "Sports federation", size: "200+" },
    { name: "NIMI (sports medicine clinics)", industry: "Sports medicine clinic", size: "100+" },
  ],
  "athletic-development-coach": [
    { name: "Olympiatoppen", industry: "Elite sport development", size: "200+", careersUrl: "https://olympiatoppen.no" },
    { name: "Norges Idrettsforbund", industry: "Sports confederation", size: "500+", careersUrl: "https://www.idrettsforbundet.no" },
    { name: "Norges Toppidrettsgymnas (NTG)", industry: "Elite sport school", size: "200+" },
    { name: "FK Bodø/Glimt Akademi", industry: "Football academy", size: "50+" },
  ],
};

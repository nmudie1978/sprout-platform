import { describe, it, expect } from "vitest";
import {
  getRepresentativeEmployers,
  getCareerEmployers,
  hasCareerEmployers,
  employersApplyTo,
} from "../career-employers";
import { getAllCareers, getCategoryForCareer } from "../career-pathways";

describe("AI-focused career additions (2026-06-15)", () => {
  const NEW = [
    "llm-engineer", "ai-agent-engineer", "deep-learning-engineer", "multi-agent-systems-engineer",
    "ai-governance-specialist", "ai-cloud-architect", "gpu-infrastructure-engineer", "computer-vision-researcher",
    "head-of-ai", "ai-strategy-director", "ai-sales-engineer", "robotics-software-engineer",
    "autonomous-vehicle-engineer", "ai-orchestration-engineer", "responsible-ai-lead", "analytics-engineer",
  ];
  it("the new AI-focused careers exist in the catalogue", () => {
    const ids = new Set(getAllCareers().map((c) => c.id));
    for (const id of NEW) expect(ids.has(id), `missing career ${id}`).toBe(true);
  });
  it("each new AI-focused career resolves to realistic (non-empty) employers", () => {
    const byId = new Map(getAllCareers().map((c) => [c.id, c]));
    for (const id of NEW) {
      const c = byId.get(id)!;
      const list = getCareerEmployers(id, getCategoryForCareer(id), c.country);
      expect(list.length, `${id} has no employers`).toBeGreaterThan(0);
      for (const e of list) { expect(e.name).toBeTruthy(); expect(e.industry).toBeTruthy(); expect(e.size).toBeTruthy(); if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//); }
    }
  });
});

describe("high-earning career additions (2026-06-15)", () => {
  const NEW = [
    "chief-information-security-officer", "distinguished-engineer", "private-equity-partner",
    "venture-capital-partner", "portfolio-manager", "corporate-finance-director", "asset-manager",
    "law-firm-partner", "offshore-installation-manager", "test-pilot", "chief-commercial-officer",
    "chief-revenue-officer", "vp-sales", "real-estate-fund-manager", "technology-founder", "telecom-practice-lead",
  ];
  it("the new high-earning careers exist in the catalogue", () => {
    const ids = new Set(getAllCareers().map((c) => c.id));
    for (const id of NEW) expect(ids.has(id), `missing career ${id}`).toBe(true);
  });
  it("each new high-earning career resolves to realistic (non-empty) employers", () => {
    const byId = new Map(getAllCareers().map((c) => [c.id, c]));
    for (const id of NEW) {
      const c = byId.get(id)!;
      const list = getCareerEmployers(id, getCategoryForCareer(id), c.country);
      expect(list.length, `${id} has no employers`).toBeGreaterThan(0);
      for (const e of list) { expect(e.name).toBeTruthy(); expect(e.industry).toBeTruthy(); expect(e.size).toBeTruthy(); if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//); }
    }
  });
});

describe("future-proof career additions (2026-06-15)", () => {
  const NEW = [
    "ai-infrastructure-engineer", "ai-systems-architect", "ai-platform-engineer",
    "ai-security-engineer", "data-center-architect", "fiber-optic-technician",
    "structural-engineer", "renewable-energy-engineer", "nuclear-engineer",
    "environmental-engineer", "chief-executive-officer", "chief-ai-officer",
    "ai-regulation-specialist", "carbon-analyst", "educational-psychologist",
  ];

  it("the new future-proof careers exist in the catalogue", () => {
    const ids = new Set(getAllCareers().map((c) => c.id));
    for (const id of NEW) expect(ids.has(id), `missing career ${id}`).toBe(true);
  });

  it("each new future-proof career resolves to realistic (non-empty) employers", () => {
    const byId = new Map(getAllCareers().map((c) => [c.id, c]));
    for (const id of NEW) {
      const c = byId.get(id)!;
      const list = getCareerEmployers(id, getCategoryForCareer(id), c.country);
      expect(list.length, `${id} has no employers`).toBeGreaterThan(0);
      for (const e of list) {
        expect(e.name).toBeTruthy();
        expect(e.industry).toBeTruthy();
        expect(e.size).toBeTruthy();
        if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("physically-demanding career additions (2026-06-15)", () => {
  const NEW = [
    "farmer", "logger", "commercial-fisherman", "roofer", "stonemason",
    "boxer", "mma-fighter", "navy-diver", "mine-worker", "telecom-tower-climber",
    "deckhand", "ski-patrol-officer", "crane-rigger", "industrial-cleaner",
  ];

  it("the new physically-demanding careers exist in the catalogue", () => {
    const ids = new Set(getAllCareers().map((c) => c.id));
    for (const id of NEW) expect(ids.has(id), `missing career ${id}`).toBe(true);
  });

  it("each new career resolves to realistic (non-empty, curated) employers — not the bare category fallback", () => {
    const byId = new Map(getAllCareers().map((c) => [c.id, c]));
    for (const id of NEW) {
      const c = byId.get(id)!;
      const list = getCareerEmployers(id, getCategoryForCareer(id), c.country);
      expect(list.length, `${id} has no employers`).toBeGreaterThan(0);
      for (const e of list) {
        expect(e.name).toBeTruthy();
        expect(e.industry).toBeTruthy();
        expect(e.size).toBeTruthy();
        if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//);
      }
    }
    // sanity: a farmer must NOT show the MANUFACTURING_ENGINEERING oil-major fallback
    const farmer = getCareerEmployers("farmer", "MANUFACTURING_ENGINEERING").map((e) => e.name).join(" ");
    expect(farmer).not.toMatch(/Equinor|Aker Solutions|Kongsberg/);
  });
});

describe("country-localised employers", () => {
  it("employersApplyTo: true for Norway/Spain/unknown, false for countries without data", () => {
    for (const c of ["Norway", "NO", "no", "Norge", "Spain", "ES", "España"]) expect(employersApplyTo(c)).toBe(true);
    expect(employersApplyTo(undefined)).toBe(true); // app default is Norway
    expect(employersApplyTo(null)).toBe(true);
    for (const c of ["Sweden", "SE", "Italy", "IT"]) expect(employersApplyTo(c)).toBe(false);
  });

  it("returns Spanish employers (not Norwegian) for a Spain user", () => {
    const es = getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Spain");
    expect(es.length).toBeGreaterThan(0);
    // must be Spanish companies, not the curated Norwegian list (Bekk/Visma)
    const names = es.map((e) => e.name).join(" ");
    expect(names).toMatch(/Indra|Telefónica|Amadeus|NTT/);
    expect(names).not.toMatch(/Bekk|Visma|Telenor/);
    expect(hasCareerEmployers("software-developer", "TECHNOLOGY_IT", "ES")).toBe(true);
  });

  it("returns Norwegian employers for Norway / unset country", () => {
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Norway")[0].name).toBe("Bekk");
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT").length).toBeGreaterThan(0);
    expect(hasCareerEmployers("software-developer", "TECHNOLOGY_IT", "NO")).toBe(true);
  });

  it("returns [] for a country we have no employer data for", () => {
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Sweden")).toEqual([]);
    expect(hasCareerEmployers("doctor", "HEALTHCARE_LIFE_SCIENCES", "Italy")).toBe(false);
  });

  it("phase-2 realism corrects professional roles mis-served by the category fallback", () => {
    // A vet must NOT show a hospital; a fashion designer must NOT show a broadcaster;
    // an auditor must NOT show DNB/Equinor — these were the category-fallback mismatches.
    const vet = getCareerEmployers("veterinarian", "HEALTHCARE_LIFE_SCIENCES").map((e) => e.name).join(" ");
    expect(vet).not.toMatch(/universitetssykehus|Haukeland|St\. Olavs/);
    expect(vet).toMatch(/AniCura|Evidensia|Mattilsynet|klinikk/i);

    const fashion = getCareerEmployers("fashion-designer", "CREATIVE_MEDIA").map((e) => e.name).join(" ");
    expect(fashion).not.toMatch(/NRK|Schibsted|TV 2/);
    expect(fashion).toMatch(/Holzweiler|Helly Hansen|Varner|Norrøna|self-employed/i);

    const auditor = getCareerEmployers("auditor", "FINANCE_BANKING").map((e) => e.name).join(" ");
    expect(auditor).toMatch(/PwC|EY|Deloitte|KPMG|BDO/);
  });

  it("every phase-2 realism employer is well-formed (name/industry/size; valid https link when present)", () => {
    for (const id of ["veterinarian", "fashion-designer", "auditor", "real-estate-agent", "sports-journalist"]) {
      const list = getCareerEmployers(id, undefined);
      expect(list.length).toBeGreaterThan(0);
      for (const e of list) {
        expect(e.name).toBeTruthy();
        expect(e.industry).toBeTruthy();
        expect(e.size).toBeTruthy();
        if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//);
      }
    }
  });

  it("realism overrides win over the coarse category fallback for trade/service roles", () => {
    // A welder must NOT show oil/energy majors; a hairdresser must NOT show hotels;
    // a taxi driver must NOT show freight/postal — these were the broken defaults.
    const welder = getCareerEmployers("welder", "MANUFACTURING_ENGINEERING").map((e) => e.name).join(" ");
    expect(welder).not.toMatch(/Aker Solutions|Equinor|Kongsberg/);
    expect(welder).toMatch(/Vard|Ulstein|fabrication/i);

    const hair = getCareerEmployers("hairdresser", "HOSPITALITY_TOURISM").map((e) => e.name).join(" ");
    expect(hair).not.toMatch(/Scandic|Strawberry|SAS/);
    expect(hair).toMatch(/Nikita|Cutters|salon/i);

    const taxi = getCareerEmployers("taxi-driver", "LOGISTICS_TRANSPORT").map((e) => e.name).join(" ");
    expect(taxi).not.toMatch(/Posten|Schenker|Wilhelmsen/);
    expect(taxi).toMatch(/Taxi|Bolt|Uber/i);
  });

  it("realism overrides never override a hand-authored CAREER_EMPLOYERS entry", () => {
    // airline-pilot is hand-authored — must still lead with the airlines.
    expect(getCareerEmployers("airline-pilot", "LOGISTICS_TRANSPORT")[0].name).toMatch(/SAS|Norwegian|Widerøe/);
  });

  it("every realism employer is well-formed (name/industry/size; valid https link when present)", () => {
    for (const id of ["welder", "hairdresser", "taxi-driver", "plumber", "chef", "bus-driver"]) {
      const list = getCareerEmployers(id, undefined);
      expect(list.length).toBeGreaterThan(0);
      for (const e of list) {
        expect(e.name).toBeTruthy();
        expect(e.industry).toBeTruthy();
        expect(e.size).toBeTruthy();
        if (e.careersUrl) expect(e.careersUrl).toMatch(/^https:\/\//);
      }
    }
  });

  it("every Spanish sector employer has a valid https link", () => {
    for (const cat of ["HEALTHCARE_LIFE_SCIENCES", "FINANCE_BANKING", "CONSTRUCTION_TRADES", "TELECOMMUNICATIONS"]) {
      const es = getCareerEmployers("x", cat, "ES");
      expect(es.length).toBeGreaterThan(0);
      for (const e of es) {
        expect(() => new URL(e.careersUrl as string)).not.toThrow();
        expect(e.careersUrl as string).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("getRepresentativeEmployers", () => {
  it("prefers curated employers (top 2) when the career has them", () => {
    // project-manager has a curated list led by Capgemini, Sopra Steria.
    const result = getRepresentativeEmployers("project-manager", "BUSINESS_MANAGEMENT");
    expect(result).toEqual(["Capgemini", "Sopra Steria"]);
  });

  it("follows curated aliases (telco-project-manager → project-manager)", () => {
    const result = getRepresentativeEmployers("telco-project-manager");
    expect(result).toEqual(["Capgemini", "Sopra Steria"]);
  });

  it("falls back to category representatives when the career is uncurated", () => {
    // A finance career not in CAREER_EMPLOYERS still gets a realistic example.
    const result = getRepresentativeEmployers("financial-advisor", "FINANCE_BANKING");
    expect(result).toEqual(["DNB", "Storebrand"]);
  });

  it("uses the telecom category for the user's telco-engineer example", () => {
    const result = getRepresentativeEmployers("telecoms-network-engineer", "TELECOMMUNICATIONS");
    expect(result[0]).toBe("Telenor");
  });

  it("returns at most two names", () => {
    const result = getRepresentativeEmployers("unknown-career", "MANUFACTURING_ENGINEERING");
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("returns empty when neither the career nor its category is known", () => {
    expect(getRepresentativeEmployers("unknown-career", undefined)).toEqual([]);
    expect(getRepresentativeEmployers("unknown-career", "NOT_A_CATEGORY")).toEqual([]);
  });
});

describe("getCareerEmployers", () => {
  it("returns the full curated list when the career has one", () => {
    const result = getCareerEmployers("software-developer", "TECHNOLOGY_IT");
    expect(result.length).toBeGreaterThan(2);
    expect(result[0].name).toBe("Bekk");
  });

  it("falls back to the full sector list for an uncurated career", () => {
    // dermatologist is not curated → healthcare sector employers.
    const result = getCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES");
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.map((e) => e.name)).toContain("Oslo universitetssykehus");
  });

  it("every returned employer has a working careers/site link", () => {
    const result = getCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES");
    for (const emp of result) {
      // Each sector employer must carry a valid absolute URL so the UI
      // never renders a dead 'Careers' affordance.
      expect(() => new URL(emp.careersUrl as string)).not.toThrow();
      expect(emp.careersUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns [] when neither career nor category is known", () => {
    expect(getCareerEmployers("unknown-career", undefined)).toEqual([]);
    expect(getCareerEmployers("unknown-career", "NOT_A_CATEGORY")).toEqual([]);
  });
});

describe("hasCareerEmployers", () => {
  it("is true for an uncurated career with a known category (sector fallback)", () => {
    expect(hasCareerEmployers("dermatologist", "HEALTHCARE_LIFE_SCIENCES")).toBe(true);
  });

  it("is false when neither career nor category is known", () => {
    expect(hasCareerEmployers("unknown-career", undefined)).toBe(false);
  });
});

describe("consulting employers", () => {
  it("a consultant sees consultancy firms (not sector clients), in NO and ES", () => {
    for (const country of ["Norway", "Spain"]) {
      const e = getCareerEmployers("management-consultant", "BUSINESS_MANAGEMENT", country);
      const names = e.map((x) => x.name).join(" ");
      expect(names).toMatch(/McKinsey|BCG|Bain|Accenture|Deloitte/);
      expect(names).not.toMatch(/DNB|Equinor|Telefónica|Santander/);
    }
  });

  it("telco-strategy careers are led by Analysys Mason", () => {
    const e = getCareerEmployers("telco-strategy-manager", "TELECOMMUNICATIONS", "Norway");
    expect(e[0].name).toBe("Analysys Mason");
    expect(getCareerEmployers("telco-business-analyst", "TELECOMMUNICATIONS", "Spain")[0].name).toBe("Analysys Mason");
  });

  it("non-consultant careers are unaffected (software-developer still sector/curated)", () => {
    expect(getCareerEmployers("software-developer", "TECHNOLOGY_IT", "Norway")[0].name).toBe("Bekk");
  });

  it("every consulting employer has a valid https link", () => {
    const all = getCareerEmployers("strategy-consultant", "BUSINESS_MANAGEMENT", "Norway")
      .concat(getCareerEmployers("telco-pricing-analyst", "TELECOMMUNICATIONS", "Norway"));
    for (const e of all) {
      expect(() => new URL(e.careersUrl as string)).not.toThrow();
      expect(e.careersUrl as string).toMatch(/^https:\/\//);
    }
  });
});

describe("AI / ML / data role employers", () => {
  it("AI Infrastructure Network Engineer sees AI-infra firms, NOT IT consultancies", () => {
    const e = getCareerEmployers("ai-network-engineer", "TECHNOLOGY_IT", "Norway");
    const names = e.map((x) => x.name).join(" ");
    expect(names).toMatch(/nscale|NVIDIA|TikTok/);
    // the exact firms the user flagged as wrong must not appear
    expect(names).not.toMatch(/Bekk|TietoEVRY|Sopra Steria/);
  });

  it("AI roles get the global list in both Norway and Spain", () => {
    for (const country of ["Norway", "Spain"]) {
      const e = getCareerEmployers("machine-learning-engineer", "ARTIFICIAL_INTELLIGENCE", country);
      const names = e.map((x) => x.name).join(" ");
      expect(names).toMatch(/Google DeepMind|NVIDIA|Meta/);
      expect(names).not.toMatch(/Bekk|Indra|Telefónica/);
    }
  });

  it("ai-engineer ignores its legacy software-developer alias in favour of AI firms", () => {
    // CAREER_ID_ALIASES maps ai-engineer → software-developer (Bekk…); the AI
    // override must win so an AI engineer doesn't see consultancies.
    const names = getCareerEmployers("ai-engineer", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name).join(" ");
    expect(names).toMatch(/OpenAI|Anthropic/);
    expect(names).not.toMatch(/Bekk|Visma/);
  });

  it("seniority/variant ids fold onto the canonical AI role", () => {
    const applied = getCareerEmployers("applied-ai-engineer", "TECHNOLOGY_IT").map((e) => e.name);
    expect(applied).toEqual(getCareerEmployers("ai-engineer", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name));
    const seniorDS = getCareerEmployers("senior-data-scientist", "TECHNOLOGY_IT").map((e) => e.name);
    expect(seniorDS).toEqual(getCareerEmployers("data-scientist", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name));
  });

  it("research/ethics roles surface labs + institutions, not consultancies", () => {
    expect(getCareerEmployers("ai-research-scientist", "TECHNOLOGY_IT").map((e) => e.name).join(" ")).toMatch(/OpenAI|DeepMind|NTNU|Simula/);
    expect(getCareerEmployers("ai-ethics-specialist", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name).join(" ")).toMatch(/Anthropic|Datatilsynet/);
  });

  it("robotics / computer-vision lean on Norway's robotics & vision cluster", () => {
    expect(getCareerEmployers("robotics-engineer", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name).join(" ")).toMatch(/1X Technologies|AutoStore/);
    expect(getCareerEmployers("computer-vision-engineer", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name).join(" ")).toMatch(/Zivid|Huddly/);
  });

  it("ai-consultant stays in the consulting list (it is about consulting)", () => {
    const names = getCareerEmployers("ai-consultant", "ARTIFICIAL_INTELLIGENCE").map((e) => e.name).join(" ");
    expect(names).toMatch(/McKinsey|Accenture|Deloitte/);
  });

  it("every AI-role employer has a valid https link", () => {
    const ids = [
      "ai-network-engineer", "mlops-engineer", "machine-learning-engineer", "ai-engineer",
      "ai-research-scientist", "ai-safety-researcher", "ai-ethics-specialist", "nlp-engineer",
      "computer-vision-engineer", "robotics-engineer", "ai-solutions-architect", "prompt-engineer",
      "ai-product-manager", "data-scientist", "data-engineer",
    ];
    for (const id of ids) {
      const e = getCareerEmployers(id, "ARTIFICIAL_INTELLIGENCE", "Norway");
      expect(e.length).toBeGreaterThan(0);
      for (const emp of e) {
        expect(() => new URL(emp.careersUrl as string)).not.toThrow();
        expect(emp.careersUrl as string).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("emergency / law-enforcement employers", () => {
  it("a police officer sees Politiet — NOT NAV/Skatteetaten — in Norway", () => {
    const e = getCareerEmployers("police-officer", "PUBLIC_SERVICE_SAFETY", "Norway");
    const names = e.map((x) => x.name).join(" ");
    expect(names).toMatch(/Politiet/);
    expect(names).not.toMatch(/NAV|Skatteetaten|Oslo kommune/);
  });

  it("a police officer sees the national/regional forces in Spain", () => {
    const e = getCareerEmployers("police-officer", "PUBLIC_SERVICE_SAFETY", "Spain");
    const names = e.map((x) => x.name).join(" ");
    expect(names).toMatch(/Policía Nacional|Guardia Civil|Mossos/);
    expect(names).not.toMatch(/Administración General|Ayuntamiento/);
  });

  it("firefighter / customs / corrections get their own institutions (NO + ES)", () => {
    expect(getCareerEmployers("firefighter", "PUBLIC_SERVICE_SAFETY", "Norway").map(e=>e.name).join(" ")).toMatch(/brann|DSB/i);
    expect(getCareerEmployers("customs-officer", "PUBLIC_SERVICE_SAFETY", "Norway")[0].name).toBe("Tolletaten");
    expect(getCareerEmployers("corrections-officer", "PUBLIC_SERVICE_SAFETY", "Spain")[0].name).toMatch(/Penitenciarias/);
  });

  it("every safety employer has a valid https link, both countries", () => {
    for (const c of ["police-officer", "firefighter", "coast-guard-officer", "immigration-officer"]) {
      for (const country of ["Norway", "Spain"]) {
        const e = getCareerEmployers(c, "PUBLIC_SERVICE_SAFETY", country);
        expect(e.length).toBeGreaterThan(0);
        for (const emp of e) expect(emp.careersUrl as string).toMatch(/^https:\/\//);
      }
    }
  });
});

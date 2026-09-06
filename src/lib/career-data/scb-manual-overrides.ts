/**
 * Human-resolved STYRK-08 → SSYK 2012 mappings.
 *
 * scripts/build-scb-crosswalk.ts accepts an automatic mapping only when the
 * two classifications' labels agree. Everything else lands here for a person
 * to decide, because the alternative — trusting a matching four-digit code —
 * silently produces salaries from the wrong occupation. Measured on this
 * dataset, 30 of 154 shared codes disagreed; the worst would have stamped a
 * trainee doctor's pay as a verified specialist salary across 50 careers.
 *
 * `ssykCode: null` means "reviewed: SCB has no comparable occupation". Those
 * careers show no Swedish salary, which is the correct outcome.
 *
 * MANAGER LEVELS — a decision worth revisiting. SSYK 2012 splits managers into
 * level 1 (senior, nearest the top of the organisation) and level 2 (middle /
 * unit managers). ISCO-08 and STYRK do not. Every manager mapping below picks
 * **level 2**, on the grounds that it is the tier far more people actually
 * occupy, so it is the more honest figure to show a 15-year-old considering
 * the role. Switching to level 1 would raise every manager salary materially.
 */
export interface ManualSsykOverride {
  /** The SSYK 2012 code, or null when SCB has no equivalent. */
  ssykCode: string | null;
  /** Why this mapping is right — read by the next person to touch it. */
  note: string;
}

export const MANUAL_SSYK_OVERRIDES: Record<string, ManualSsykOverride> = {
  // ── Collisions: the code exists in SSYK but means something else ──────────
  "2212": {
    ssykCode: "2211",
    note: "STYRK 2212 specialist medical practitioners. SSYK 2212 is 'Resident physicians' (doctors in training) — SSYK 2211 'Specialist physicians' is the match. Affects ~50 careers.",
  },
  "2211": {
    ssykCode: "2211",
    note: "STYRK 2211 generalist medical practitioners. NOT SSYK 2213: its English label reads 'General medical practitioners' but the Swedish code is AT-läkare, the pre-registration internship grade — SCB puts it at a 39 700 median, BELOW residents (2212, 56 300) and far below specialists (2211, 96 800). In Sweden general practice is itself a specialty (specialist i allmänmedicin), so SSYK 2211 is the qualified doctor. Lesson: SSYK English labels are translations and can mislead; check the figures' ordering.",
  },
  "3412": {
    ssykCode: "3411",
    note: "STYRK 3412 social work associate professionals. SSYK 3412 is 'Religious associate professionals' — an unrelated occupation. SSYK 3411 is the match.",
  },
  "1412": {
    ssykCode: "1722",
    note: "STYRK 1412 restaurant managers. SSYK 1412 is 'Headmasters, level 2'. SSYK 1722 'Restaurant managers, level 2' is the match.",
  },
  "2519": {
    ssykCode: "2512",
    note: "STYRK 2519 software/applications developers n.e.c. → SSYK 2512 'Software- and system developers'. SSYK 2519 is the broader ICT-specialist residual.",
  },
  "2351": {
    ssykCode: null,
    note: "STYRK 2351 education methods specialists. SSYK 2351 is 'Special teachers' — different job, and SSYK has no education-methods equivalent.",
  },
  "2342": {
    ssykCode: "2341",
    note: "STYRK 2342 early childhood teachers. SSYK 2342 is 'Recreation leaders'; SSYK 2341 is the pre-school teacher code.",
  },

  // ── No such SSYK code: renumbered between the classifications ─────────────
  "1330": {
    ssykCode: "1312",
    note: "ICT service managers → SSYK 1312 'Information and communications technology service managers, level 2'.",
  },
  "1223": {
    ssykCode: "1332",
    note: "R&D managers → SSYK 1332 'Research and development managers, level 2'.",
  },
  "1213": {
    ssykCode: "1592",
    note: "Policy and planning managers are predominantly public sector → SSYK 1592 'Operations managers in public services n.e.c., level 2'.",
  },
  "1219": {
    ssykCode: "1292",
    note: "Business services and administration managers n.e.c. → SSYK 1292 'Administration and service managers n.e.c., level 2'.",
  },
  "1323": {
    ssykCode: "1362",
    note: "Construction managers → SSYK 1362 'Production managers in construction and mining, level 2'.",
  },
  "1324": {
    ssykCode: "1322",
    note: "Supply and distribution managers → SSYK 1322 'Supply, logistics and transport managers, level 2'.",
  },
  "1431": {
    ssykCode: "1742",
    note: "Sports, recreation and cultural centre managers → SSYK 1742 'Sports, leisure and wellness managers, level 2'.",
  },
  "2523": {
    ssykCode: "3514",
    note: "Computer network professionals → SSYK 3514 'Computer network and systems technicians'. SSYK classes this as a technician occupation.",
  },
  "2529": {
    ssykCode: "2519",
    note: "Database and network professionals n.e.c. → SSYK 2519 'ICT-specialist professionals not elsewhere classified'.",
  },
  "2522": {
    ssykCode: "2515",
    note: "Systems administrators → SSYK 2515 'System administrators'.",
  },
  "2521": {
    ssykCode: "2519",
    note: "Database designers and administrators → SSYK 2519 ICT-specialist residual; SSYK has no dedicated database-professional code.",
  },
  "2635": {
    ssykCode: "2661",
    note: "Social work and counselling professionals → SSYK 2661 'Social work professionals'.",
  },
  "2634": {
    ssykCode: "2241",
    note: "Psychologists → SSYK 2241 'Psychologists'.",
  },
  "2166": {
    ssykCode: "2172",
    note: "Graphic and multimedia designers → SSYK 2172 'Graphic designers'.",
  },
  "2153": {
    ssykCode: "2143",
    note: "Telecommunications engineers → SSYK 2143 'Engineering professionals in electrical, electronics and telecommunications'.",
  },
  "2151": {
    ssykCode: "2143",
    note: "Electrical engineers → SSYK 2143, which covers electrical, electronics and telecoms engineering as one occupation.",
  },
  "2152": {
    ssykCode: "2143",
    note: "Electronics engineers → SSYK 2143, as above.",
  },
  "2120": {
    ssykCode: "2121",
    note: "Mathematicians, actuaries and statisticians → SSYK 2121 'Mathematicians and actuaries'. SSYK splits statisticians into 2122.",
  },
  "2310": {
    ssykCode: "2312",
    note: "University and higher education teachers → SSYK 2312 'University and higher education lecturers'.",
  },
  "2165": {
    ssykCode: "2164",
    note: "Cartographers and surveyors → SSYK 2164, same occupation, renumbered.",
  },
  "2261": {
    ssykCode: "2260",
    note: "Dentists → SSYK 2260 'Dentists'.",
  },
  "2264": {
    ssykCode: "2272",
    note: "Physiotherapists → SSYK 2272 'Physiotherapists'.",
  },
  "2434": {
    ssykCode: "3322",
    note: "ICT sales professionals → SSYK 3322 'Commercial sales representatives'; SSYK has no ICT-specific sales code.",
  },
  "7541": {
    ssykCode: "7115",
    note: "Underwater divers → SSYK 7115 'Construction diver'. Note SSYK 7115 is NOT the STYRK 7115 carpenter code — this is a renumbering, not a collision.",
  },

  // ── Second review pass ───────────────────────────────────────────────────
  "1221": {
    ssykCode: "1252",
    note: "STYRK 1221 sales and marketing managers. SSYK 1221 is 'Human resource managers, level 1'. SSYK 1252 'Sales and marketing managers, level 2' is the match.",
  },
  "1222": {
    ssykCode: "1242",
    note: "STYRK 1222 advertising and PR managers. SSYK 1222 is HR managers. SSYK 1242 'Information, communication and public relations managers, level 2' is the match.",
  },
  "1342": {
    ssykCode: "1512",
    note: "STYRK 1342 health services managers. SSYK 1342 is 'Architectural and engineering managers'. SSYK 1512 'Department and unit managers in health care, level 2' is the match.",
  },
  "2131": {
    ssykCode: "2131",
    note: "Biologists/botanists/zoologists. The label check flagged this, but SSYK 2131 'Cell and molecular biologists and related professionals' is the same broad biology occupation — confirmed, not a collision.",
  },
  "2221": {
    ssykCode: "2221",
    note: "Nursing professionals vs SSYK 'Professional nurses' — the same occupation, differently worded. Confirmed, not a collision.",
  },
  "7126": {
    ssykCode: "7126",
    note: "Plumbers and pipe fitters vs SSYK 'Heating and air conditioning mechanics'. In Sweden this trade is VVS (heating, ventilation, sanitation) and covers plumbing. Confirmed, not a collision.",
  },
  "3312": {
    ssykCode: null,
    note: "Credit and loans officers vs SSYK 3312 'Bank clerk'. Reviewed and rejected: a bank clerk is a materially more junior role, so the salary would understate the occupation. No suitable SSYK equivalent.",
  },

  // ── Third pass: caught by the generic-word rule ──────────────────────────
  "1212": {
    ssykCode: "1222",
    note: "STYRK 1212 human resource managers. SSYK 1212 is 'Finance managers, level 2'. SSYK 1222 'Human resource managers, level 2' is the match.",
  },
  "1321": {
    ssykCode: "1372",
    note: "Manufacturing managers → SSYK 1372 'Production managers in manufacturing, level 2'.",
  },
  "1322": {
    ssykCode: "1362",
    note: "Mining managers → SSYK 1362 'Production managers in construction and mining, level 2'.",
  },
  "1411": {
    ssykCode: "1712",
    note: "STYRK 1411 hotel managers. SSYK 1411 is a school-management code. SSYK 1712 'Hotel and conference managers, level 2' is the match.",
  },
  "2142": {
    ssykCode: "2142",
    note: "Civil engineers vs SSYK 'Engineering professionals in building construction'. Confirmed the same occupation — civil engineering is building construction in SSYK's wording.",
  },
  "3115": {
    ssykCode: null,
    note: "STYRK 3115 mechanical engineering technicians. SSYK 3115 is 'Chemical engineering technicians' — a different field. Reviewed: no clean SSYK equivalent, so no Swedish salary rather than a chemical technician's pay.",
  },
};

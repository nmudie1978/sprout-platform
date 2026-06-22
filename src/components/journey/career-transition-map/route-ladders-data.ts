/**
 * Curated route-ladder data — assembled from curation (do not hand-edit shape;
 * see route-ladders.ts for types). Keyed by target-career slug. 15 targets.
 */
import type { CareerRoutes } from "./route-ladders";

export const CURATED_ROUTES: Record<string, CareerRoutes> = {
  "software-developer": {
    "shortest": [
      {
        "role": "Self-taught learner / online courses",
        "duration": "6–12 months",
        "why": "Build core programming fundamentals and a small portfolio without formal study."
      },
      {
        "role": "Coding bootcamp graduate (e.g. Kodeskolen, Noroff)",
        "duration": "3–6 months",
        "why": "Intensive practical training in a real stack accelerates job-readiness."
      },
      {
        "role": "Software Developer",
        "duration": "ongoing",
        "why": "Entry-level developer role, often junior, building real products."
      }
    ],
    "realistic": [
      {
        "role": "Self-study / introductory courses",
        "duration": "6–12 months",
        "why": "Test interest and learn the basics before committing further."
      },
      {
        "role": "Bootcamp or vocational programme",
        "duration": "3–12 months",
        "why": "Structured curriculum and a portfolio employers recognise."
      },
      {
        "role": "Junior Developer / internship",
        "duration": "6–18 months",
        "why": "First paid experience working in a real codebase and team."
      },
      {
        "role": "Software Developer",
        "duration": "ongoing",
        "why": "Confident, independent developer trusted with full features."
      }
    ],
    "highestSuccess": [
      {
        "role": "Bachelor in Computer Science / Informatics",
        "duration": "3 years",
        "why": "A degree opens the widest range of employers and graduate schemes in Norway."
      },
      {
        "role": "Summer internship / part-time dev role",
        "duration": "3–12 months",
        "why": "Real-world experience while studying makes the first job far easier to land."
      },
      {
        "role": "Junior Developer",
        "duration": "1–2 years",
        "why": "Consolidate skills under mentorship and learn professional practices."
      },
      {
        "role": "Software Developer",
        "duration": "2–4 years",
        "why": "Owns substantial features and mentors newer joiners."
      },
      {
        "role": "Senior Software Developer",
        "duration": "ongoing",
        "why": "Technical lead on systems, shaping architecture and team direction."
      }
    ],
    "lowestBarrier": [
      {
        "role": "IT support / helpdesk role",
        "duration": "1–2 years",
        "why": "An accessible tech job with no degree needed, building practical familiarity."
      },
      {
        "role": "Free online courses + personal projects",
        "duration": "6–18 months",
        "why": "Learn to code in your own time while earning, lowering the risk."
      },
      {
        "role": "Apprenticeship / fagbrev in IT-utvikler",
        "duration": "2 years",
        "why": "A funded vocational route to developer work without university."
      },
      {
        "role": "Junior Developer",
        "duration": "1–2 years",
        "why": "First developer post building on apprenticeship experience."
      },
      {
        "role": "Software Developer",
        "duration": "ongoing",
        "why": "Fully independent developer delivering production code."
      }
    ]
  },
  "data-analyst": {
    "shortest": [
      {
        "role": "Self-study in Excel, SQL and a BI tool",
        "duration": "3–6 months",
        "why": "These three skills cover the bulk of everyday analyst work."
      },
      {
        "role": "Analyst certificate / short course",
        "duration": "2–4 months",
        "why": "A recognised credential and portfolio of sample dashboards."
      },
      {
        "role": "Data Analyst",
        "duration": "ongoing",
        "why": "Turns raw data into reports and insights for the business."
      }
    ],
    "realistic": [
      {
        "role": "Office or operations role using data",
        "duration": "1–2 years",
        "why": "Everyday spreadsheet work reveals an interest and aptitude for analysis."
      },
      {
        "role": "Self-study / online courses in SQL and statistics",
        "duration": "6–12 months",
        "why": "Add the technical depth that distinguishes an analyst from a spreadsheet user."
      },
      {
        "role": "Junior Data Analyst / reporting analyst",
        "duration": "1–2 years",
        "why": "First dedicated analyst post producing routine reports."
      },
      {
        "role": "Data Analyst",
        "duration": "ongoing",
        "why": "Trusted to scope questions and deliver insight independently."
      }
    ],
    "highestSuccess": [
      {
        "role": "Bachelor in economics, statistics or informatics",
        "duration": "3 years",
        "why": "Quantitative grounding makes you credible across any sector."
      },
      {
        "role": "Internship / part-time reporting role",
        "duration": "3–12 months",
        "why": "Practical experience with real business data while studying."
      },
      {
        "role": "Junior Data Analyst",
        "duration": "1–2 years",
        "why": "Learn the tooling and stakeholder communication on the job."
      },
      {
        "role": "Data Analyst",
        "duration": "2–3 years",
        "why": "Owns reporting domains and drives data-informed decisions."
      },
      {
        "role": "Senior / Lead Data Analyst",
        "duration": "ongoing",
        "why": "Sets analytics standards and mentors a small team."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Administrative or customer-service role",
        "duration": "1–2 years",
        "why": "An accessible entry job where you naturally work with data."
      },
      {
        "role": "Free online analytics courses",
        "duration": "6–12 months",
        "why": "Learn Excel, SQL and visualisation at your own pace and cost."
      },
      {
        "role": "Reporting / operations analyst (internal move)",
        "duration": "1–2 years",
        "why": "Move sideways into a data-focused role using known business context."
      },
      {
        "role": "Junior Data Analyst",
        "duration": "1–2 years",
        "why": "Formal analyst title consolidating the skills built so far."
      },
      {
        "role": "Data Analyst",
        "duration": "ongoing",
        "why": "Delivers reliable analysis across the organisation."
      }
    ]
  },
  "data-scientist": {
    "shortest": [
      {
        "role": "Data Analyst",
        "duration": "1–2 years",
        "why": "Strong data and SQL foundations are the natural springboard."
      },
      {
        "role": "Self-study in Python, statistics and machine learning",
        "duration": "6–12 months",
        "why": "Adds the modelling skills that define a data scientist."
      },
      {
        "role": "Data Scientist",
        "duration": "ongoing",
        "why": "Builds predictive models and statistical analyses for the business."
      }
    ],
    "realistic": [
      {
        "role": "Bachelor in a quantitative field",
        "duration": "3 years",
        "why": "Maths and programming grounding is expected for the role."
      },
      {
        "role": "Data Analyst / junior data role",
        "duration": "1–2 years",
        "why": "Real data experience before moving into modelling."
      },
      {
        "role": "Self-study or master-level ML courses",
        "duration": "6–18 months",
        "why": "Deepen machine-learning and statistical knowledge."
      },
      {
        "role": "Data Scientist",
        "duration": "ongoing",
        "why": "Independently frames problems and ships models into production."
      }
    ],
    "highestSuccess": [
      {
        "role": "Bachelor in statistics, maths or informatics",
        "duration": "3 years",
        "why": "A rigorous quantitative base widely required by employers."
      },
      {
        "role": "Master in data science or machine learning",
        "duration": "2 years",
        "why": "Advanced methods open the strongest research and industry roles."
      },
      {
        "role": "Data Analyst / Junior Data Scientist",
        "duration": "1–2 years",
        "why": "Bridge from theory to applied, production work."
      },
      {
        "role": "Data Scientist",
        "duration": "2–4 years",
        "why": "Owns end-to-end modelling projects and their business impact."
      },
      {
        "role": "Senior / Lead Data Scientist",
        "duration": "ongoing",
        "why": "Guides modelling strategy and mentors the data team."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Data Analyst",
        "duration": "1–2 years",
        "why": "An accessible data role that pays while you learn the foundations."
      },
      {
        "role": "Free online Python and statistics courses",
        "duration": "9–18 months",
        "why": "Build modelling skills affordably alongside work."
      },
      {
        "role": "Part-time master or applied ML programme",
        "duration": "2–3 years",
        "why": "Formal credential studied flexibly while still employed."
      },
      {
        "role": "Junior Data Scientist",
        "duration": "1–2 years",
        "why": "First modelling role applying newly built skills."
      },
      {
        "role": "Data Scientist",
        "duration": "ongoing",
        "why": "Delivers reliable models and insight independently."
      }
    ]
  },
  "ux-designer": {
    "shortest": [
      {
        "role": "Self-study in UX fundamentals and Figma",
        "duration": "3–6 months",
        "why": "Learn core methods and the tool the industry runs on."
      },
      {
        "role": "UX course + portfolio of case studies",
        "duration": "3–6 months",
        "why": "A strong portfolio matters more than credentials in design hiring."
      },
      {
        "role": "UX Designer",
        "duration": "ongoing",
        "why": "Researches users and designs usable, calm interfaces."
      }
    ],
    "realistic": [
      {
        "role": "Related role (graphic design, marketing, support)",
        "duration": "1–2 years",
        "why": "Adjacent work builds empathy for users and an eye for design."
      },
      {
        "role": "UX course or bootcamp",
        "duration": "3–9 months",
        "why": "Structured grounding in research, IA and interaction design."
      },
      {
        "role": "Junior UX Designer / UX intern",
        "duration": "1–2 years",
        "why": "First design post working within a product team."
      },
      {
        "role": "UX Designer",
        "duration": "ongoing",
        "why": "Owns the design of features end to end."
      }
    ],
    "highestSuccess": [
      {
        "role": "Bachelor in interaction design or HCI",
        "duration": "3 years",
        "why": "Formal grounding in research methods and design theory."
      },
      {
        "role": "Design internship / part-time studio work",
        "duration": "3–12 months",
        "why": "Real client and product experience while studying."
      },
      {
        "role": "Junior UX Designer",
        "duration": "1–2 years",
        "why": "Develop craft and collaboration under senior guidance."
      },
      {
        "role": "UX Designer",
        "duration": "2–4 years",
        "why": "Leads research and design for whole product areas."
      },
      {
        "role": "Senior / Lead UX Designer",
        "duration": "ongoing",
        "why": "Sets design direction and mentors the design team."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Customer support or content role",
        "duration": "1–2 years",
        "why": "An accessible job that builds real understanding of user needs."
      },
      {
        "role": "Free UX courses + self-led case studies",
        "duration": "6–12 months",
        "why": "Learn the craft and build a portfolio at no cost."
      },
      {
        "role": "UX writer / junior researcher (internal move)",
        "duration": "1–2 years",
        "why": "A lower-barrier entry into the design team to build from."
      },
      {
        "role": "Junior UX Designer",
        "duration": "1–2 years",
        "why": "First full design role consolidating earlier experience."
      },
      {
        "role": "UX Designer",
        "duration": "ongoing",
        "why": "Designs usable, considered product experiences."
      }
    ]
  },
  "cybersecurity-analyst": {
    "shortest": [
      {
        "role": "IT support / sysadmin role",
        "duration": "1–2 years",
        "why": "Networking and systems knowledge is the bedrock of security work."
      },
      {
        "role": "Security certification (e.g. CompTIA Security+)",
        "duration": "3–6 months",
        "why": "A recognised credential that signals job-ready security basics."
      },
      {
        "role": "Cybersecurity Analyst",
        "duration": "ongoing",
        "why": "Monitors, detects and responds to security threats."
      }
    ],
    "realistic": [
      {
        "role": "Helpdesk / IT support role",
        "duration": "1–2 years",
        "why": "Accessible entry that teaches how systems and users behave."
      },
      {
        "role": "System or network administrator",
        "duration": "1–2 years",
        "why": "Deeper infrastructure experience underpins good security judgement."
      },
      {
        "role": "Security certifications + home lab",
        "duration": "6–12 months",
        "why": "Build and prove hands-on security skills."
      },
      {
        "role": "Cybersecurity Analyst",
        "duration": "ongoing",
        "why": "Defends the organisation in a security operations role."
      }
    ],
    "highestSuccess": [
      {
        "role": "Bachelor in IT security or informatics",
        "duration": "3 years",
        "why": "A degree opens larger employers and public-sector security roles."
      },
      {
        "role": "IT / security internship",
        "duration": "3–12 months",
        "why": "Applied experience while studying eases the first hire."
      },
      {
        "role": "Junior SOC Analyst",
        "duration": "1–2 years",
        "why": "Front-line monitoring builds real incident-handling skill."
      },
      {
        "role": "Cybersecurity Analyst",
        "duration": "2–4 years",
        "why": "Leads detection and response across the environment."
      },
      {
        "role": "Senior Security Analyst / Security Engineer",
        "duration": "ongoing",
        "why": "Designs defences and mentors the security team."
      }
    ],
    "lowestBarrier": [
      {
        "role": "IT helpdesk / support role",
        "duration": "1–2 years",
        "why": "A common no-degree entry point into the tech field."
      },
      {
        "role": "Free security courses + entry cert",
        "duration": "6–12 months",
        "why": "Learn fundamentals affordably and earn a first credential."
      },
      {
        "role": "IT / network administrator",
        "duration": "1–2 years",
        "why": "Hands-on systems work that maps directly to security roles."
      },
      {
        "role": "Junior SOC Analyst",
        "duration": "1–2 years",
        "why": "First dedicated security post, learning monitoring tools."
      },
      {
        "role": "Cybersecurity Analyst",
        "duration": "ongoing",
        "why": "Investigates and responds to threats independently."
      }
    ]
  },
  "project-manager": {
    "shortest": [
      {
        "role": "Project Coordinator",
        "duration": "1–2 years",
        "why": "Coordinating schedules and documents teaches the basics of running a project."
      },
      {
        "role": "Project Manager",
        "duration": "ongoing",
        "why": "Step up to owning delivery, budget and stakeholders on your own projects."
      }
    ],
    "realistic": [
      {
        "role": "Team Member / Specialist",
        "duration": "2–3 years",
        "why": "Working inside delivery gives you the domain knowledge a PM relies on."
      },
      {
        "role": "Project Coordinator",
        "duration": "1–2 years",
        "why": "You learn planning, reporting and coordination across a whole project."
      },
      {
        "role": "Junior Project Manager",
        "duration": "1–2 years",
        "why": "You run smaller projects with support before taking full responsibility."
      },
      {
        "role": "Project Manager",
        "duration": "ongoing",
        "why": "You now lead projects end-to-end with confidence."
      }
    ],
    "highestSuccess": [
      {
        "role": "Project Coordinator",
        "duration": "1–2 years",
        "why": "Builds the planning and reporting foundation employers expect."
      },
      {
        "role": "Project Manager",
        "duration": "3–4 years",
        "why": "Delivering real projects with a PRINCE2 or PMI certification proves your method."
      },
      {
        "role": "Senior Project Manager",
        "duration": "2–3 years",
        "why": "Handling larger, riskier projects deepens your judgement."
      },
      {
        "role": "Programme Manager",
        "duration": "ongoing",
        "why": "Leading several linked projects is the strongest long-term progression."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Administrative Coordinator",
        "duration": "1–2 years",
        "why": "An accessible office role where you start organising people and deadlines."
      },
      {
        "role": "Project Administrator",
        "duration": "1–2 years",
        "why": "You take on project paperwork, tracking and meeting support."
      },
      {
        "role": "Project Coordinator",
        "duration": "1–2 years",
        "why": "You coordinate a project's moving parts under a PM's guidance."
      },
      {
        "role": "Project Manager",
        "duration": "ongoing",
        "why": "Years of close support make the full role a natural next step."
      }
    ]
  },
  "product-manager": {
    "shortest": [
      {
        "role": "Associate Product Manager",
        "duration": "1–2 years",
        "why": "A structured entry role where you learn the craft alongside senior PMs."
      },
      {
        "role": "Product Manager",
        "duration": "ongoing",
        "why": "You take ownership of a product area, its roadmap and outcomes."
      }
    ],
    "realistic": [
      {
        "role": "Business Analyst / UX Designer / Developer",
        "duration": "2–3 years",
        "why": "A product-adjacent role builds the user and technical insight a PM needs."
      },
      {
        "role": "Product Owner",
        "duration": "1–2 years",
        "why": "You manage the backlog and priorities for one team."
      },
      {
        "role": "Associate Product Manager",
        "duration": "1–2 years",
        "why": "You broaden from delivery into strategy and discovery."
      },
      {
        "role": "Product Manager",
        "duration": "ongoing",
        "why": "You now own a product's direction and success metrics."
      }
    ],
    "highestSuccess": [
      {
        "role": "Product Owner",
        "duration": "1–2 years",
        "why": "Owning a backlog teaches prioritisation and working with engineers."
      },
      {
        "role": "Product Manager",
        "duration": "3–4 years",
        "why": "Shipping outcomes that move metrics establishes your track record."
      },
      {
        "role": "Senior Product Manager",
        "duration": "2–3 years",
        "why": "Leading a larger product and mentoring others deepens your strategy."
      },
      {
        "role": "Head of Product",
        "duration": "ongoing",
        "why": "Setting product vision across teams is the strongest long-term path."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Customer Support / Sales Specialist",
        "duration": "1–2 years",
        "why": "A reachable role that gives you deep, direct knowledge of user problems."
      },
      {
        "role": "Business Analyst",
        "duration": "1–2 years",
        "why": "You learn to turn customer needs into clear requirements."
      },
      {
        "role": "Product Owner",
        "duration": "1–2 years",
        "why": "You start prioritising and shaping what a team builds."
      },
      {
        "role": "Product Manager",
        "duration": "ongoing",
        "why": "Your closeness to users makes the strategic step natural."
      }
    ]
  },
  "business-analyst": {
    "shortest": [
      {
        "role": "Junior Business Analyst",
        "duration": "1–2 years",
        "why": "An entry role where you learn requirements-gathering and documentation."
      },
      {
        "role": "Business Analyst",
        "duration": "ongoing",
        "why": "You independently analyse needs and shape solutions for stakeholders."
      }
    ],
    "realistic": [
      {
        "role": "Domain Specialist / Coordinator",
        "duration": "2–3 years",
        "why": "Working in a business area gives you the context analysts must understand."
      },
      {
        "role": "Data or Reporting Analyst",
        "duration": "1–2 years",
        "why": "You build the analytical and tooling skills central to the role."
      },
      {
        "role": "Junior Business Analyst",
        "duration": "1–2 years",
        "why": "You start eliciting requirements and mapping processes formally."
      },
      {
        "role": "Business Analyst",
        "duration": "ongoing",
        "why": "You now own analysis across projects and stakeholders."
      }
    ],
    "highestSuccess": [
      {
        "role": "Data or Reporting Analyst",
        "duration": "1–2 years",
        "why": "Strong data skills set the best analysts apart early."
      },
      {
        "role": "Business Analyst",
        "duration": "3–4 years",
        "why": "Delivering process and system improvements proves your value."
      },
      {
        "role": "Senior Business Analyst",
        "duration": "2–3 years",
        "why": "Leading complex analysis and mentoring builds authority."
      },
      {
        "role": "Lead Business Analyst",
        "duration": "ongoing",
        "why": "Owning analysis strategy across programmes is the strongest progression."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Customer Service / Operations Associate",
        "duration": "1–2 years",
        "why": "An accessible role that teaches how the business actually works day to day."
      },
      {
        "role": "Process or Operations Coordinator",
        "duration": "1–2 years",
        "why": "You begin documenting and improving everyday workflows."
      },
      {
        "role": "Junior Business Analyst",
        "duration": "1–2 years",
        "why": "You formalise requirements and learn analyst methods on the job."
      },
      {
        "role": "Business Analyst",
        "duration": "ongoing",
        "why": "Your ground-level insight makes full analyst work a natural fit."
      }
    ]
  },
  "digital-marketer": {
    "shortest": [
      {
        "role": "Marketing Specialist",
        "duration": "2–3 years",
        "why": "You run campaigns and channels and learn what drives results."
      },
      {
        "role": "Marketing Manager",
        "duration": "ongoing",
        "why": "You step up to owning strategy, budget and a small team."
      }
    ],
    "realistic": [
      {
        "role": "Marketing Assistant",
        "duration": "1–2 years",
        "why": "An entry role supporting campaigns, content and events."
      },
      {
        "role": "Marketing Specialist",
        "duration": "2–3 years",
        "why": "You take ownership of channels like SEO, social or email."
      },
      {
        "role": "Senior Marketing Specialist",
        "duration": "1–2 years",
        "why": "You lead larger campaigns and begin guiding others."
      },
      {
        "role": "Marketing Manager",
        "duration": "ongoing",
        "why": "You now set marketing direction and manage the budget."
      }
    ],
    "highestSuccess": [
      {
        "role": "Marketing Specialist",
        "duration": "2–3 years",
        "why": "Mastering channels and analytics builds a measurable track record."
      },
      {
        "role": "Marketing Manager",
        "duration": "3–4 years",
        "why": "Owning strategy and a team proves you can drive growth."
      },
      {
        "role": "Senior Marketing Manager",
        "duration": "2–3 years",
        "why": "Leading bigger budgets and multiple channels sharpens your judgement."
      },
      {
        "role": "Head of Marketing",
        "duration": "ongoing",
        "why": "Setting marketing vision for the whole organisation is the strongest path."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Social Media / Content Coordinator",
        "duration": "1–2 years",
        "why": "An accessible, portfolio-friendly way into marketing."
      },
      {
        "role": "Marketing Assistant",
        "duration": "1–2 years",
        "why": "You support the wider marketing mix and learn the tools."
      },
      {
        "role": "Marketing Specialist",
        "duration": "2–3 years",
        "why": "You own a channel and start showing measurable results."
      },
      {
        "role": "Marketing Manager",
        "duration": "ongoing",
        "why": "Proven results across channels earn you the leadership step."
      }
    ]
  },
  "accountant": {
    "shortest": [
      {
        "role": "Accounting Assistant",
        "duration": "1–2 years",
        "why": "You learn bookkeeping, ledgers and the basics of the books."
      },
      {
        "role": "Accountant",
        "duration": "ongoing",
        "why": "With an økonomi/regnskap education you take ownership of the accounts."
      }
    ],
    "realistic": [
      {
        "role": "Bookkeeper",
        "duration": "1–2 years",
        "why": "Recording transactions builds the everyday foundation of accounting."
      },
      {
        "role": "Accounting Assistant",
        "duration": "1–2 years",
        "why": "You broaden into reconciliations, payroll and reporting support."
      },
      {
        "role": "Junior Accountant",
        "duration": "1–2 years",
        "why": "You prepare accounts and statements under supervision."
      },
      {
        "role": "Accountant",
        "duration": "ongoing",
        "why": "You now own the books and reporting for clients or a business."
      }
    ],
    "highestSuccess": [
      {
        "role": "Accounting Assistant",
        "duration": "1–2 years",
        "why": "Hands-on basics give context for formal qualifications."
      },
      {
        "role": "Junior Accountant",
        "duration": "1–2 years",
        "why": "Preparing real accounts while studying builds competence fast."
      },
      {
        "role": "Accountant",
        "duration": "3–4 years",
        "why": "Owning full accounts and pursuing authorisation (autorisert regnskapsfører) proves your expertise."
      },
      {
        "role": "Senior Accountant",
        "duration": "ongoing",
        "why": "Leading reporting and reviewing others' work is the strongest progression."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Accounts Payable / Receivable Clerk",
        "duration": "1–2 years",
        "why": "An accessible entry handling invoices and payments."
      },
      {
        "role": "Bookkeeper",
        "duration": "1–2 years",
        "why": "You learn double-entry recording and monthly closes."
      },
      {
        "role": "Accounting Assistant",
        "duration": "1–2 years",
        "why": "You support reconciliations and reporting across the ledgers."
      },
      {
        "role": "Accountant",
        "duration": "ongoing",
        "why": "Steady experience plus økonomi study makes the full role reachable."
      }
    ]
  },
  "registered-nurse": {
    "shortest": [
      {
        "role": "Nursing student (bachelor i sykepleie)",
        "duration": "3 years",
        "why": "Norway requires a 3-year bachelor's degree in nursing to qualify."
      },
      {
        "role": "Registered Nurse (autorisert sykepleier)",
        "duration": "ongoing",
        "why": "Helsedirektoratet authorisation on graduation makes you a registered nurse."
      }
    ],
    "realistic": [
      {
        "role": "Healthcare assistant (helsefagarbeider/pleieassistent)",
        "duration": "1 year",
        "why": "Many test the field in care work before committing to study."
      },
      {
        "role": "Nursing student (bachelor i sykepleie)",
        "duration": "3 years",
        "why": "The accredited bachelor with supervised clinical placements is mandatory."
      },
      {
        "role": "Newly qualified nurse on ward",
        "duration": "1 year",
        "why": "A first hospital or municipal post builds core bedside competence."
      },
      {
        "role": "Registered Nurse (autorisert sykepleier)",
        "duration": "ongoing",
        "why": "You settle into the full registered role with authorisation in hand."
      }
    ],
    "highestSuccess": [
      {
        "role": "Nursing student (bachelor i sykepleie)",
        "duration": "3 years",
        "why": "The bachelor is the entry requirement and foundation for progression."
      },
      {
        "role": "Ward nurse",
        "duration": "2 years",
        "why": "Broad ward experience opens doors to specialisation and trust."
      },
      {
        "role": "Registered Nurse (autorisert sykepleier)",
        "duration": "ongoing",
        "why": "Authorised practice across settings establishes your professional base."
      },
      {
        "role": "Specialist nurse (videreutdanning)",
        "duration": "1.5 years",
        "why": "Postgraduate specialisation lifts pay and long-term career security."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Care assistant (pleieassistent, no formal qualification)",
        "duration": "1 year",
        "why": "Care homes hire assistants with minimal prior experience."
      },
      {
        "role": "Helsefagarbeider (vocational health worker)",
        "duration": "2 years",
        "why": "A vocational health certificate confirms aptitude and aids study admission."
      },
      {
        "role": "Nursing student (bachelor i sykepleie)",
        "duration": "3 years",
        "why": "The bachelor remains required, but you enter it grounded in real care work."
      },
      {
        "role": "Registered Nurse (autorisert sykepleier)",
        "duration": "ongoing",
        "why": "Authorisation completes the regulated path to the role."
      }
    ]
  },
  "teacher": {
    "shortest": [
      {
        "role": "Subject graduate (relevant bachelor/master)",
        "duration": "3 years",
        "why": "A subject degree is the basis for the fastest teaching qualification route."
      },
      {
        "role": "PPU student (practical-pedagogical education)",
        "duration": "1 year",
        "why": "The one-year PPU adds the required teaching qualification on top of a degree."
      },
      {
        "role": "Teacher (lektor/lærer)",
        "duration": "ongoing",
        "why": "With PPU you are qualified to teach in Norwegian schools."
      }
    ],
    "realistic": [
      {
        "role": "Teacher-education student (grunnskolelærerutdanning)",
        "duration": "5 years",
        "why": "Most school teachers take the integrated 5-year master's teacher programme."
      },
      {
        "role": "Student teacher on placement (praksis)",
        "duration": "during study",
        "why": "Supervised classroom placements are built into the programme."
      },
      {
        "role": "Newly qualified teacher (nyutdannet lærer)",
        "duration": "1 year",
        "why": "A first post with mentoring eases you into full responsibility."
      },
      {
        "role": "Teacher (lærer)",
        "duration": "ongoing",
        "why": "You hold a permanent teaching post with full qualification."
      }
    ],
    "highestSuccess": [
      {
        "role": "Teacher-education student (master's)",
        "duration": "5 years",
        "why": "The master's qualification gives the strongest standing and pay grade."
      },
      {
        "role": "Newly qualified teacher",
        "duration": "2 years",
        "why": "Early classroom years build credibility and subject mastery."
      },
      {
        "role": "Teacher (lærer)",
        "duration": "ongoing",
        "why": "Established teaching practice is the foundation for leadership."
      },
      {
        "role": "Senior teacher / department lead (avdelingsleder)",
        "duration": "3 years",
        "why": "Subject leadership extends impact and long-term progression."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Teaching assistant (assistent i skole)",
        "duration": "1 year",
        "why": "Schools take classroom assistants without a teaching qualification."
      },
      {
        "role": "Substitute teacher (vikar)",
        "duration": "1 year",
        "why": "Supply work lets you confirm the calling before committing to study."
      },
      {
        "role": "Teacher-education student (or PPU if degree-holder)",
        "duration": "3 years",
        "why": "Formal qualification is still required to teach as a registered teacher."
      },
      {
        "role": "Teacher (lærer)",
        "duration": "ongoing",
        "why": "Qualification grounds your classroom experience in a permanent role."
      }
    ]
  },
  "psychologist": {
    "shortest": [
      {
        "role": "Profesjonsstudium psychology student",
        "duration": "6 years",
        "why": "Norway's psychologist title requires the 6-year professional psychology programme."
      },
      {
        "role": "Psychologist (autorisert psykolog)",
        "duration": "ongoing",
        "why": "Helsedirektoratet authorisation on completion confers the protected title."
      }
    ],
    "realistic": [
      {
        "role": "Profesjonsstudium psychology student",
        "duration": "6 years",
        "why": "The integrated professional degree with placements is the only authorisation route."
      },
      {
        "role": "Psychologist in clinical placement",
        "duration": "during study",
        "why": "Supervised clinical practice is embedded in the programme."
      },
      {
        "role": "Newly authorised psychologist",
        "duration": "1 year",
        "why": "A first supervised post consolidates clinical judgement."
      },
      {
        "role": "Psychologist (autorisert psykolog)",
        "duration": "ongoing",
        "why": "You practise independently with full authorisation."
      }
    ],
    "highestSuccess": [
      {
        "role": "Profesjonsstudium psychology student",
        "duration": "6 years",
        "why": "The professional degree is mandatory and the base for specialisation."
      },
      {
        "role": "Newly authorised psychologist",
        "duration": "2 years",
        "why": "Early supervised practice builds broad clinical foundations."
      },
      {
        "role": "Psychologist (autorisert psykolog)",
        "duration": "ongoing",
        "why": "Independent authorised practice anchors your career."
      },
      {
        "role": "Specialist psychologist (spesialistutdanning)",
        "duration": "5 years",
        "why": "Specialist certification brings the strongest prospects and autonomy."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Mental-health support worker (miljøterapeut/assistent)",
        "duration": "1 year",
        "why": "Support roles are open to those without a psychology degree."
      },
      {
        "role": "Bachelor psychology student (årsstudium/bachelor)",
        "duration": "3 years",
        "why": "An accessible first degree tests interest and aptitude."
      },
      {
        "role": "Profesjonsstudium psychology student",
        "duration": "6 years",
        "why": "The protected title still requires the full professional programme."
      },
      {
        "role": "Psychologist (autorisert psykolog)",
        "duration": "ongoing",
        "why": "Authorisation completes the regulated path to the title."
      }
    ]
  },
  "graphic-designer": {
    "shortest": [
      {
        "role": "Self-taught designer building a portfolio",
        "duration": "1 year",
        "why": "Graphic design is unregulated, so a strong portfolio can open the door directly."
      },
      {
        "role": "Junior graphic designer",
        "duration": "1 year",
        "why": "A first studio or in-house role turns the portfolio into paid experience."
      },
      {
        "role": "Graphic Designer",
        "duration": "ongoing",
        "why": "Proven client work establishes you in the full role."
      }
    ],
    "realistic": [
      {
        "role": "Design student (bachelor i grafisk design)",
        "duration": "3 years",
        "why": "Most designers train through a design or visual communication degree."
      },
      {
        "role": "Design intern / junior",
        "duration": "1 year",
        "why": "An internship or junior post bridges study and professional practice."
      },
      {
        "role": "Junior graphic designer",
        "duration": "2 years",
        "why": "Hands-on client projects build craft and a real portfolio."
      },
      {
        "role": "Graphic Designer",
        "duration": "ongoing",
        "why": "You take ownership of projects in the full role."
      }
    ],
    "highestSuccess": [
      {
        "role": "Design student (bachelor)",
        "duration": "3 years",
        "why": "Formal training gives a strong base in craft and theory."
      },
      {
        "role": "Junior graphic designer",
        "duration": "2 years",
        "why": "Early agency work develops range and client skills."
      },
      {
        "role": "Graphic Designer",
        "duration": "3 years",
        "why": "Independent project ownership builds reputation."
      },
      {
        "role": "Senior designer / art director",
        "duration": "ongoing",
        "why": "Creative leadership offers the strongest long-term prospects."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Design assistant / production artist",
        "duration": "1 year",
        "why": "Entry production roles welcome beginners with basic software skills."
      },
      {
        "role": "Online/evening design courses + portfolio",
        "duration": "1 year",
        "why": "Affordable courses build skills around work without a full degree."
      },
      {
        "role": "Junior graphic designer",
        "duration": "2 years",
        "why": "A junior role converts growing skills into professional experience."
      },
      {
        "role": "Graphic Designer",
        "duration": "ongoing",
        "why": "Accumulated work qualifies you for the full role."
      }
    ]
  },
  "electrician": {
    "shortest": [
      {
        "role": "Electro student (Vg1/Vg2 elektro)",
        "duration": "2 years",
        "why": "Vocational schooling plus apprenticeship is the standard fast route."
      },
      {
        "role": "Electrician apprentice (lærling)",
        "duration": "2.5 years",
        "why": "The apprenticeship period leads to the trade certificate exam."
      },
      {
        "role": "Electrician (fagbrev elektriker)",
        "duration": "ongoing",
        "why": "Passing the fagprøve grants the certified electrician trade certificate."
      }
    ],
    "realistic": [
      {
        "role": "Upper-secondary electro student (Vg1 + Vg2 elektro)",
        "duration": "2 years",
        "why": "School electro track gives the theory base before the workplace."
      },
      {
        "role": "Electrician apprentice (lærling)",
        "duration": "2.5 years",
        "why": "Paid on-the-job apprenticeship under a master electrician is required."
      },
      {
        "role": "Newly certified electrician",
        "duration": "1 year",
        "why": "A first post consolidates safe independent installation work."
      },
      {
        "role": "Electrician (fagbrev elektriker)",
        "duration": "ongoing",
        "why": "With the fagbrev you work as a fully certified electrician."
      }
    ],
    "highestSuccess": [
      {
        "role": "Electro student + apprentice (lærling)",
        "duration": "4.5 years",
        "why": "The full school-and-apprenticeship route earns the trade certificate."
      },
      {
        "role": "Newly certified electrician",
        "duration": "2 years",
        "why": "Early field years broaden skills across installation types."
      },
      {
        "role": "Electrician (fagbrev elektriker)",
        "duration": "3 years",
        "why": "Certified practice is the base for advancement."
      },
      {
        "role": "Master electrician (mesterbrev/installatør)",
        "duration": "2 years",
        "why": "Master certification allows running installations and a business."
      }
    ],
    "lowestBarrier": [
      {
        "role": "Electrician's helper / assistant on site",
        "duration": "1 year",
        "why": "Assistant roles let beginners enter without formal electro schooling."
      },
      {
        "role": "Adult apprenticeship (praksiskandidat)",
        "duration": "3 years",
        "why": "Documented work hours can substitute for the school track for adults."
      },
      {
        "role": "Apprentice sitting fagprøve",
        "duration": "1 year",
        "why": "Logged practice qualifies you to take the trade certificate exam."
      },
      {
        "role": "Electrician (fagbrev elektriker)",
        "duration": "ongoing",
        "why": "The fagbrev certifies you for the regulated electrician role."
      }
    ]
  }
};

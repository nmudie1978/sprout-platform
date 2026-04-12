/**
 * Career Pathways - Professional Career Categories and Jobs
 * Comprehensive career data for the Explore Careers section
 */

// Career categories for career exploration (separate from JobCategory for micro-jobs)
export type CareerCategory =
  | "HEALTHCARE_LIFE_SCIENCES"
  | "EDUCATION_TRAINING"
  | "TECHNOLOGY_IT"
  | "BUSINESS_MANAGEMENT"
  | "FINANCE_BANKING"
  | "SALES_MARKETING"
  | "MANUFACTURING_ENGINEERING"
  | "LOGISTICS_TRANSPORT"
  | "HOSPITALITY_TOURISM"
  | "TELECOMMUNICATIONS"
  | "CREATIVE_MEDIA"
  | "PUBLIC_SERVICE_SAFETY"
  | "MILITARY_DEFENCE"
  | "SPORT_FITNESS"
  | "REAL_ESTATE_PROPERTY"
  | "SOCIAL_CARE_COMMUNITY"
  | "CONSTRUCTION_TRADES";

export type WorkSetting = "hands-on" | "desk" | "outdoors" | "creative" | "mixed";
export type PeopleIntensity = "high" | "medium" | "low";

/** Careers with dedicated application paths where generic links
 *  (LinkedIn, utdanning.no, Samordna opptak, Coursera) are misleading. */
export type SpecialistPathType = "space" | "military" | "police" | "firefighter" | "elite-sport";

export interface Career {
  id: string;
  title: string;
  emoji: string;
  description: string;
  avgSalary: string;
  educationPath: string;
  keySkills: string[];
  dailyTasks: string[];
  growthOutlook: "high" | "medium" | "stable";
  entryLevel?: boolean; // True if accessible without higher education
  // Optional explicit tags. If absent, the Career Radar falls back to
  // category defaults + per-id overrides (see WORK_SETTING_DEFAULTS etc.)
  workSetting?: WorkSetting;
  peopleIntensity?: PeopleIntensity;
  /** Specialist careers with dedicated application routes (ESA, Forsvaret, etc.) */
  pathType?: SpecialistPathType;
  /** Primary employment sector. If absent, derived from category defaults. */
  sector?: "public" | "private" | "mixed";
}

export const CAREER_PATHWAYS: Record<CareerCategory, Career[]> = {
  // ========================================
  // HEALTHCARE & LIFE SCIENCES
  // ========================================
  HEALTHCARE_LIFE_SCIENCES: [
    {
      id: "doctor",
      title: "Doctor",
      emoji: "👨‍⚕️",
      description: "Diagnose and treat illnesses, prescribe medications, and provide preventive care to patients.",
      avgSalary: "700,000 - 1,400,000 kr/year",
      educationPath: "Medical Degree (6 years) + Specialisation (3-6 years)",
      keySkills: ["medical knowledge", "communication", "empathy", "decision-making", "stress management"],
      dailyTasks: ["Examine patients", "Diagnose conditions", "Prescribe treatments", "Perform procedures", "Document care"],
      growthOutlook: "high",
    },
    {
      id: "nurse",
      title: "Nurse",
      emoji: "👩‍⚕️",
      description: "Provide patient care, administer medications, and support doctors in hospitals and clinics.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Nursing (3 years)",
      keySkills: ["patient care", "medical knowledge", "communication", "empathy", "attention to detail"],
      dailyTasks: ["Monitor patients", "Administer medications", "Assist with procedures", "Document care", "Support families"],
      growthOutlook: "high",
    },
    {
      id: "healthcare-worker",
      title: "Healthcare Worker",
      emoji: "🏥",
      description: "Assist patients with daily activities and basic medical care in nursing homes and hospitals.",
      avgSalary: "350,000 - 450,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["patient care", "empathy", "physical stamina", "communication", "reliability"],
      dailyTasks: ["Help patients with hygiene", "Assist with meals", "Monitor wellbeing", "Support daily activities"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "dentist",
      title: "Dentist",
      emoji: "🦷",
      description: "Diagnose and treat dental issues, perform procedures, and promote oral health.",
      avgSalary: "650,000 - 1,200,000 kr/year",
      educationPath: "Dental Degree (5 years)",
      keySkills: ["precision", "medical knowledge", "patient communication", "manual dexterity", "attention to detail"],
      dailyTasks: ["Examine teeth", "Perform fillings and extractions", "Take X-rays", "Advise on dental hygiene"],
      growthOutlook: "stable",
    },
    {
      id: "pharmacist",
      title: "Pharmacist",
      emoji: "💊",
      description: "Dispense medications, advise patients on drug use, and ensure medication safety.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Master's in Pharmacy (5 years)",
      keySkills: ["pharmaceutical knowledge", "attention to detail", "communication", "problem-solving", "ethics"],
      dailyTasks: ["Dispense prescriptions", "Advise patients", "Check drug interactions", "Manage inventory"],
      growthOutlook: "stable",
    },
    {
      id: "physiotherapist",
      title: "Physiotherapist",
      emoji: "🏃",
      description: "Help patients recover from injuries and improve physical function through exercise and therapy.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Physiotherapy (3 years)",
      keySkills: ["anatomy knowledge", "manual therapy", "communication", "patience", "physical fitness"],
      dailyTasks: ["Assess patients", "Create treatment plans", "Guide exercises", "Track progress", "Provide manual therapy"],
      growthOutlook: "high",
    },
    {
      id: "psychologist",
      title: "Psychologist",
      emoji: "🧠",
      description: "Help people manage mental health challenges through therapy and counseling.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Master's/Doctorate in Psychology (6+ years)",
      keySkills: ["empathy", "active listening", "analytical thinking", "communication", "ethics"],
      dailyTasks: ["Conduct therapy sessions", "Assess patients", "Develop treatment plans", "Document progress"],
      growthOutlook: "high",
    },
    {
      id: "biomedical-scientist",
      title: "Biomedical Scientist",
      emoji: "🔬",
      description: "Research diseases and develop new treatments, working in labs and research institutions.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Master's/PhD in Biomedical Sciences",
      keySkills: ["research skills", "analytical thinking", "lab techniques", "attention to detail", "scientific writing"],
      dailyTasks: ["Conduct experiments", "Analyse data", "Write research papers", "Present findings"],
      growthOutlook: "high",
    },
    {
      id: "paramedic",
      title: "Paramedic",
      emoji: "🚑",
      description: "Provide emergency medical care and transport patients in ambulances.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational training + Paramedic certification",
      keySkills: ["emergency medicine", "calm under pressure", "physical fitness", "decision-making", "teamwork"],
      dailyTasks: ["Respond to emergencies", "Provide first aid", "Transport patients", "Document incidents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "veterinarian",
      title: "Veterinarian",
      emoji: "🐾",
      description: "Diagnose and treat animals, perform surgeries, and advise pet owners on animal health.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Veterinary Degree (5.5-6 years)",
      keySkills: ["animal medicine", "surgical skills", "communication", "empathy", "diagnostic reasoning"],
      dailyTasks: ["Examine animals", "Perform surgeries", "Prescribe treatments", "Advise owners", "Handle emergencies"],
      growthOutlook: "stable",
    },
    {
      id: "veterinary-assistant",
      title: "Veterinary Assistant",
      emoji: "🐕",
      description: "Assist veterinarians with animal care, restraint, and clinic operations.",
      avgSalary: "350,000 - 450,000 kr/year",
      educationPath: "Vocational training or on-the-job training",
      keySkills: ["animal handling", "basic medical care", "communication", "patience", "attention to detail"],
      dailyTasks: ["Restrain animals", "Assist in procedures", "Clean facilities", "Monitor recovering animals", "Handle client inquiries"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "dental-hygienist",
      title: "Dental Hygienist",
      emoji: "🦷",
      description: "Clean teeth, take X-rays, and educate patients on oral health prevention.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Dental Hygiene (3 years)",
      keySkills: ["dental procedures", "patient education", "attention to detail", "communication", "manual dexterity"],
      dailyTasks: ["Clean teeth", "Take X-rays", "Apply fluoride", "Educate patients", "Document treatments"],
      growthOutlook: "stable",
    },
    {
      id: "optician",
      title: "Optician",
      emoji: "👓",
      description: "Fit and dispense eyeglasses and contact lenses based on prescriptions.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Optometry or Vocational training",
      keySkills: ["optical knowledge", "customer service", "precision", "sales", "technical skills"],
      dailyTasks: ["Fit eyeglasses", "Adjust frames", "Advise on lenses", "Take measurements", "Manage inventory"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "lab-technician",
      title: "Lab Technician",
      emoji: "🧫",
      description: "Perform laboratory tests and analyses on blood, tissue, and other samples for medical diagnosis.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Biomedical Laboratory Science (3 years)",
      keySkills: ["laboratory techniques", "attention to detail", "analytical thinking", "quality control", "safety procedures"],
      dailyTasks: ["Analyse samples", "Operate lab equipment", "Document results", "Maintain quality standards", "Calibrate instruments"],
      growthOutlook: "stable",
    },
    {
      id: "medical-affairs-director",
      title: "Medical Affairs Director",
      emoji: "🏥",
      description: "Lead medical affairs strategy bridging clinical science and commercial operations for pharmaceutical or medical device companies.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Medical Degree or PhD + 8+ years medical affairs experience",
      keySkills: ["medical strategy", "KOL management", "clinical evidence", "regulatory affairs", "team leadership"],
      dailyTasks: ["Set medical affairs strategy", "Manage KOL relationships", "Review clinical data", "Support regulatory submissions", "Lead medical team"],
      growthOutlook: "high",
    },
    {
      id: "clinical-operations-director",
      title: "Clinical Operations Director",
      emoji: "🧪",
      description: "Direct clinical trial operations managing study execution, CRO relationships, and regulatory compliance across therapeutic areas.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's/PhD in Life Sciences + 10+ years clinical operations",
      keySkills: ["clinical trial management", "GCP compliance", "CRO management", "budget management", "regulatory knowledge"],
      dailyTasks: ["Direct clinical trials", "Manage CRO partnerships", "Ensure GCP compliance", "Control study budgets", "Report to clinical leadership"],
      growthOutlook: "high",
    },
    {
      id: "pharmaceutical-program-director",
      title: "Pharmaceutical Program Director",
      emoji: "💊",
      description: "Direct pharmaceutical development programmes from discovery through regulatory approval, managing cross-functional teams.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "PhD in Pharmaceutical Sciences + 10+ years pharma programme experience",
      keySkills: ["drug development", "programme management", "regulatory strategy", "cross-functional leadership", "risk management"],
      dailyTasks: ["Direct development programmes", "Coordinate cross-functional teams", "Manage regulatory strategy", "Control programme budgets", "Report to R&D leadership"],
      growthOutlook: "high",
    },
    {
      id: "biotech-rd-director",
      title: "Biotech R&D Director",
      emoji: "🔬",
      description: "Lead biotechnology research and development directing scientific programmes, IP strategy, and research team operations.",
      avgSalary: "1,000,000 - 1,700,000 kr/year",
      educationPath: "PhD in Biology/Biochemistry + 10+ years biotech R&D",
      keySkills: ["R&D leadership", "scientific strategy", "IP management", "team leadership", "grant/funding management"],
      dailyTasks: ["Set R&D strategy", "Lead research programmes", "Manage IP portfolio", "Secure funding", "Develop scientific talent"],
      growthOutlook: "high",
    },
    {
      id: "healthtech-product-director",
      title: "Healthtech Product Director",
      emoji: "📱",
      description: "Lead product strategy for health technology products ensuring clinical validity, regulatory compliance, and user adoption.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in CS/Health Informatics + 8+ years healthtech product experience",
      keySkills: ["healthtech product strategy", "clinical workflows", "regulatory compliance", "user research", "team leadership"],
      dailyTasks: ["Set healthtech product vision", "Navigate regulatory requirements", "Lead product teams", "Engage clinical stakeholders", "Drive user adoption"],
      growthOutlook: "high",
    },
    {
      id: "care-assistant",
      title: "Care Assistant",
      emoji: "🤲",
      description: "Support elderly and disabled people with daily living — washing, dressing, meals, medication reminders. Often the first step into healthcare; many move on to become Helsefagarbeider or Nurse.",
      avgSalary: "380,000 - 480,000 kr/year",
      educationPath: "On-the-job training + optional vocational courses (entry possible at 16+)",
      keySkills: ["empathy", "patience", "personal care", "communication", "reliability"],
      dailyTasks: ["Help with personal care", "Prepare meals", "Support mobility", "Document care", "Build trust with clients"],
      growthOutlook: "high",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Healthcare — Doctors & Specialists
    // ──────────────────────────────────────────────
    {
      id: "surgeon",
      title: "Surgeon",
      emoji: "🔪",
      description: "Perform operations to treat injuries, diseases, and deformities, working in operating theatres with surgical teams.",
      avgSalary: "1,100,000 - 2,000,000 kr/year",
      educationPath: "Medical Degree (6 years) + Surgical Specialisation (6+ years)",
      keySkills: ["precision", "stamina", "anatomy expertise", "teamwork", "stress management"],
      dailyTasks: ["Perform operations", "Plan surgical procedures", "Lead surgical teams", "Review imaging", "Follow up post-op"],
      growthOutlook: "high",
    },
    { id: "general-surgeon", title: "General Surgeon", emoji: "🔪", description: "Operate on a wide range of conditions affecting the abdomen, breast, skin, and soft tissues.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree (6 years) + General Surgery Specialisation (6+ years)", keySkills: ["broad surgical knowledge", "decision-making under pressure", "manual dexterity", "teamwork", "stamina"], dailyTasks: ["Perform abdominal surgeries", "Assess emergency cases", "Lead surgical teams", "Consult with other specialities", "Follow up post-op patients"], growthOutlook: "high" },
    { id: "colorectal-surgeon", title: "Colorectal Surgeon", emoji: "🔪", description: "Specialise in surgery of the colon, rectum, and anus, treating conditions like cancer and inflammatory bowel disease.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree + General Surgery + Colorectal Fellowship", keySkills: ["laparoscopic surgery", "oncological surgery", "patient communication", "precision", "endoscopy"], dailyTasks: ["Perform colorectal operations", "Review colonoscopy findings", "Plan cancer treatment pathways", "Multidisciplinary team meetings", "Post-operative care"], growthOutlook: "medium" },
    { id: "hepatobiliary-surgeon", title: "Hepatobiliary Surgeon", emoji: "🔪", description: "Operate on the liver, gallbladder, bile ducts, and pancreas — often for cancer or complex disease.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Medical Degree + General Surgery + Hepatobiliary Fellowship", keySkills: ["complex anatomy knowledge", "oncological surgery", "transplant techniques", "precision", "research skills"], dailyTasks: ["Perform liver and pancreatic surgeries", "Assess imaging and staging", "Plan complex resections", "Collaborate with oncology teams", "Manage post-op complications"], growthOutlook: "medium" },
    { id: "endocrine-surgeon", title: "Endocrine Surgeon", emoji: "🔪", description: "Operate on glands like the thyroid, parathyroid, and adrenal glands.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree + General Surgery + Endocrine Surgery Fellowship", keySkills: ["fine dissection", "ultrasound guidance", "endocrinology knowledge", "nerve monitoring", "precision"], dailyTasks: ["Perform thyroidectomies", "Operate on adrenal tumours", "Interpret hormone panels", "Manage intraoperative nerve monitoring", "Follow up hormone levels post-op"], growthOutlook: "medium" },
    { id: "cardiothoracic-surgeon", title: "Cardiothoracic Surgeon", emoji: "❤️", description: "Perform surgery on the heart, lungs, and chest — including bypasses, valve repairs, and lung resections.", avgSalary: "1,300,000 - 2,200,000 kr/year", educationPath: "Medical Degree + Cardiothoracic Surgery Specialisation (8+ years)", keySkills: ["cardiopulmonary bypass management", "minimally invasive techniques", "stamina", "crisis management", "teamwork"], dailyTasks: ["Perform heart and lung operations", "Manage cardiopulmonary bypass", "Review cardiac imaging", "Lead surgical teams", "Intensive care follow-up"], growthOutlook: "high" },
    { id: "cardiac-surgeon", title: "Cardiac Surgeon", emoji: "❤️", description: "Specialise in operations on the heart — bypass grafts, valve replacements, and congenital repairs.", avgSalary: "1,300,000 - 2,200,000 kr/year", educationPath: "Medical Degree + Cardiac Surgery Specialisation (8+ years)", keySkills: ["heart-lung machine management", "microsurgery", "crisis decision-making", "endurance", "teamwork"], dailyTasks: ["Perform coronary artery bypass grafts", "Replace heart valves", "Repair congenital defects", "Manage post-operative ICU care", "Consult with cardiologists"], growthOutlook: "high" },
    { id: "vascular-surgeon", title: "Vascular Surgeon", emoji: "🩸", description: "Operate on arteries and veins throughout the body, treating aneurysms, blockages, and vascular disease.", avgSalary: "1,100,000 - 1,900,000 kr/year", educationPath: "Medical Degree + Vascular Surgery Specialisation (6+ years)", keySkills: ["endovascular techniques", "open vascular surgery", "imaging interpretation", "catheter skills", "emergency management"], dailyTasks: ["Perform bypass grafts and stenting", "Treat aneurysms", "Manage diabetic vascular disease", "Emergency trauma repair", "Vascular imaging review"], growthOutlook: "high" },
    { id: "thoracic-surgeon", title: "Thoracic Surgeon", emoji: "🫁", description: "Operate on the lungs, oesophagus, and chest wall — often treating cancer, trauma, or infections.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Thoracic Surgery Specialisation (7+ years)", keySkills: ["thoracoscopy", "lung resection", "oncological staging", "airway management", "teamwork"], dailyTasks: ["Perform lung resections", "Treat oesophageal conditions", "Video-assisted thoracoscopic surgery", "Multidisciplinary cancer meetings", "Post-op chest drain management"], growthOutlook: "medium" },
    { id: "neurosurgeon", title: "Neurosurgeon", emoji: "🧠", description: "Operate on the brain, spinal cord, and nervous system — treating tumours, injuries, and neurological conditions.", avgSalary: "1,400,000 - 2,500,000 kr/year", educationPath: "Medical Degree + Neurosurgery Specialisation (7+ years)", keySkills: ["microsurgery", "neuroanatomy", "image-guided surgery", "crisis management", "fine motor skills"], dailyTasks: ["Perform brain tumour removals", "Spinal decompression surgery", "Treat head injuries", "Review MRI and CT scans", "Intensive care management"], growthOutlook: "high" },
    { id: "spinal-surgeon", title: "Spinal Surgeon", emoji: "🦴", description: "Specialise in surgery of the spine — treating disc herniations, deformities, fractures, and tumours.", avgSalary: "1,300,000 - 2,200,000 kr/year", educationPath: "Medical Degree + Orthopaedic or Neurosurgical Specialisation + Spine Fellowship", keySkills: ["spinal instrumentation", "minimally invasive spine surgery", "neuroimaging", "biomechanics", "patient assessment"], dailyTasks: ["Perform spinal fusions and decompressions", "Treat spinal fractures", "Review MRI and X-rays", "Rehabilitate post-operative patients", "Multidisciplinary spine clinics"], growthOutlook: "high" },
    { id: "orthopaedic-surgeon", title: "Orthopaedic Surgeon", emoji: "🦴", description: "Operate on bones, joints, ligaments, and muscles — treating fractures, joint replacements, and sports injuries.", avgSalary: "1,100,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Orthopaedic Surgery Specialisation (6+ years)", keySkills: ["fracture fixation", "joint replacement", "arthroscopy", "biomechanics", "rehabilitation planning"], dailyTasks: ["Perform joint replacements", "Fix fractures with plates and screws", "Arthroscopic knee and shoulder surgery", "Fracture clinic assessments", "Post-operative rehabilitation planning"], growthOutlook: "high" },
    { id: "trauma-surgeon", title: "Trauma Surgeon", emoji: "🚑", description: "Operate on patients with life-threatening injuries from accidents, falls, or violence — working in emergency settings.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Medical Degree + General Surgery + Trauma Fellowship", keySkills: ["emergency decision-making", "damage control surgery", "resuscitation", "multisystem injury management", "leadership under pressure"], dailyTasks: ["Operate on trauma patients", "Lead trauma teams in A&E", "Perform emergency laparotomies", "Manage polytrauma", "Debrief and teach trauma protocols"], growthOutlook: "high" },
    { id: "sports-medicine-surgeon", title: "Sports Medicine Surgeon", emoji: "⚽", description: "Reconstruct and repair injuries common in athletes — ACL tears, rotator cuff injuries, and cartilage damage.", avgSalary: "1,100,000 - 1,900,000 kr/year", educationPath: "Medical Degree + Orthopaedic Surgery + Sports Medicine Fellowship", keySkills: ["arthroscopy", "ligament reconstruction", "rehabilitation planning", "sports science", "patient communication"], dailyTasks: ["Perform ACL reconstructions", "Arthroscopic shoulder and knee surgery", "Assess athletes in clinic", "Collaborate with physiotherapists", "Return-to-sport planning"], growthOutlook: "high" },
    { id: "plastic-surgeon", title: "Plastic Surgeon", emoji: "✨", description: "Reconstruct and repair body structures affected by birth defects, trauma, burns, or disease.", avgSalary: "1,100,000 - 2,200,000 kr/year", educationPath: "Medical Degree + Plastic Surgery Specialisation (6+ years)", keySkills: ["microsurgery", "flap reconstruction", "aesthetic judgement", "hand surgery", "burn management"], dailyTasks: ["Perform reconstructive surgeries", "Treat burns and trauma wounds", "Microsurgical free-flap transfers", "Hand and nerve repair", "Assess patients in clinic"], growthOutlook: "high" },
    { id: "reconstructive-surgeon", title: "Reconstructive Surgeon", emoji: "🧩", description: "Restore form and function to body parts damaged by injury, disease, or congenital conditions.", avgSalary: "1,100,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Plastic Surgery Specialisation + Reconstructive Fellowship", keySkills: ["microsurgery", "tissue engineering", "flap design", "3D planning", "multidisciplinary teamwork"], dailyTasks: ["Reconstruct after cancer surgery", "Free-flap transfers", "Treat complex wounds", "Collaborate with oncology and orthopaedics", "Long-term patient follow-up"], growthOutlook: "medium" },
    { id: "cosmetic-surgeon", title: "Cosmetic Surgeon", emoji: "💎", description: "Perform elective procedures to enhance appearance — rhinoplasty, facelifts, body contouring, and more.", avgSalary: "1,200,000 - 3,000,000 kr/year", educationPath: "Medical Degree + Plastic Surgery Specialisation + Aesthetic Fellowship", keySkills: ["aesthetic judgement", "patient consultation", "minimally invasive techniques", "injectables", "business management"], dailyTasks: ["Perform rhinoplasty and facelifts", "Body contouring procedures", "Non-surgical aesthetic treatments", "Patient consultations", "Manage a private practice"], growthOutlook: "high" },
    { id: "ophthalmic-surgeon", title: "Ophthalmic Surgeon (Eye Surgeon)", emoji: "👁️", description: "Operate on the eye and surrounding structures — treating cataracts, glaucoma, retinal conditions, and trauma.", avgSalary: "1,100,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Ophthalmology Specialisation (5+ years)", keySkills: ["microsurgery", "laser techniques", "retinal imaging", "precision", "patient communication"], dailyTasks: ["Perform cataract surgery", "Treat retinal detachments", "Laser eye procedures", "Glaucoma management", "Eye injury repair"], growthOutlook: "high" },
    { id: "otolaryngologist", title: "Otolaryngologist (ENT Surgeon)", emoji: "👂", description: "Operate on the ear, nose, throat, and head and neck — treating conditions from hearing loss to cancer.", avgSalary: "1,100,000 - 1,900,000 kr/year", educationPath: "Medical Degree + ENT Specialisation (5+ years)", keySkills: ["endoscopic surgery", "microsurgery", "head and neck oncology", "audiology knowledge", "airway management"], dailyTasks: ["Perform tonsillectomies and sinus surgery", "Treat head and neck cancers", "Cochlear implant surgery", "Manage airway emergencies", "Hearing and balance assessments"], growthOutlook: "medium" },
    { id: "oral-maxillofacial-surgeon", title: "Oral and Maxillofacial Surgeon", emoji: "🦷", description: "Operate on the face, jaws, and mouth — treating fractures, tumours, and dental conditions requiring surgery.", avgSalary: "1,100,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Dental Degree + Maxillofacial Surgery Specialisation", keySkills: ["jaw reconstruction", "dental implantology", "facial fracture repair", "tumour surgery", "3D surgical planning"], dailyTasks: ["Repair facial fractures", "Remove jaw tumours", "Orthognathic surgery", "Place dental implants", "Treat complex dental infections"], growthOutlook: "medium" },
    { id: "urological-surgeon", title: "Urological Surgeon (Urologist)", emoji: "🔬", description: "Operate on the urinary tract and male reproductive system — treating kidney stones, prostate disease, and cancer.", avgSalary: "1,100,000 - 1,900,000 kr/year", educationPath: "Medical Degree + Urology Specialisation (6+ years)", keySkills: ["robotic surgery", "endoscopy", "laparoscopic surgery", "oncological surgery", "stone management"], dailyTasks: ["Perform prostatectomies", "Robotic and laparoscopic surgery", "Treat kidney stones", "Cystoscopy procedures", "Urological cancer management"], growthOutlook: "high" },
    { id: "paediatric-surgeon", title: "Paediatric Surgeon", emoji: "👶", description: "Operate on newborns, children, and adolescents — treating congenital anomalies, injuries, and childhood cancers.", avgSalary: "1,100,000 - 1,900,000 kr/year", educationPath: "Medical Degree + General Surgery + Paediatric Surgery Fellowship", keySkills: ["neonatal surgery", "minimally invasive paediatric surgery", "child communication", "congenital anomaly repair", "family-centred care"], dailyTasks: ["Operate on congenital conditions", "Treat childhood appendicitis and hernias", "Neonatal emergency surgery", "Collaborate with paediatricians", "Family communication and support"], growthOutlook: "medium" },
    { id: "obstetric-gynaecological-surgeon", title: "Obstetric and Gynaecological Surgeon", emoji: "🤰", description: "Perform surgery related to the female reproductive system — caesarean sections, hysterectomies, and fertility procedures.", avgSalary: "1,000,000 - 1,800,000 kr/year", educationPath: "Medical Degree + Obstetrics & Gynaecology Specialisation (5+ years)", keySkills: ["laparoscopic surgery", "obstetric emergencies", "fertility procedures", "oncological gynaecology", "patient counselling"], dailyTasks: ["Perform caesarean sections", "Laparoscopic gynaecological surgery", "Manage high-risk pregnancies", "Treat gynaecological cancers", "Fertility assessments and procedures"], growthOutlook: "high" },
    { id: "transplant-surgeon", title: "Transplant Surgeon", emoji: "🫀", description: "Transplant organs — kidneys, livers, hearts, lungs — from donors to patients with organ failure.", avgSalary: "1,300,000 - 2,200,000 kr/year", educationPath: "Medical Degree + General Surgery + Transplant Fellowship", keySkills: ["organ procurement", "vascular anastomosis", "immunology knowledge", "on-call readiness", "multidisciplinary coordination"], dailyTasks: ["Perform kidney and liver transplants", "Organ procurement operations", "Manage immunosuppression", "Coordinate with donor teams", "Long-term transplant follow-up"], growthOutlook: "medium" },
    { id: "bariatric-surgeon", title: "Bariatric Surgeon", emoji: "⚖️", description: "Perform weight-loss surgery — gastric bypass, sleeve gastrectomy — for patients with severe obesity.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree + General Surgery + Bariatric Fellowship", keySkills: ["laparoscopic surgery", "metabolic medicine", "patient counselling", "nutrition knowledge", "multidisciplinary teamwork"], dailyTasks: ["Perform gastric bypass and sleeve gastrectomy", "Pre-operative patient assessment", "Manage metabolic outcomes", "Collaborate with dietitians and psychologists", "Long-term follow-up clinics"], growthOutlook: "high" },
    { id: "oncological-surgeon", title: "Oncological Surgeon (Surgical Oncologist)", emoji: "🎗️", description: "Remove cancerous tumours surgically — working closely with oncology, radiology, and pathology teams.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Medical Degree + General Surgery + Surgical Oncology Fellowship", keySkills: ["tumour resection", "sentinel node biopsy", "multidisciplinary teamwork", "staging knowledge", "minimally invasive techniques"], dailyTasks: ["Perform cancer resections", "Multidisciplinary tumour board meetings", "Assess staging and imaging", "Plan neo-adjuvant and adjuvant treatment pathways", "Patient counselling on surgical options"], growthOutlook: "high" },
    { id: "hand-surgeon", title: "Hand Surgeon", emoji: "🤚", description: "Operate on the hand, wrist, and forearm — treating fractures, tendon injuries, nerve compression, and congenital conditions.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree + Orthopaedic or Plastic Surgery + Hand Surgery Fellowship", keySkills: ["microsurgery", "tendon repair", "nerve repair", "fracture fixation", "rehabilitation planning"], dailyTasks: ["Repair tendons and nerves", "Treat carpal tunnel syndrome", "Fix hand fractures", "Replantation microsurgery", "Hand therapy coordination"], growthOutlook: "medium" },
    { id: "breast-surgeon", title: "Breast Surgeon", emoji: "🎗️", description: "Operate on breast conditions — primarily breast cancer, but also benign conditions and reconstructive work.", avgSalary: "1,100,000 - 1,800,000 kr/year", educationPath: "Medical Degree + General Surgery + Breast Surgery Fellowship", keySkills: ["oncoplastic techniques", "sentinel node biopsy", "patient counselling", "multidisciplinary teamwork", "imaging interpretation"], dailyTasks: ["Perform mastectomies and lumpectomies", "Sentinel lymph node biopsies", "Oncoplastic breast conservation", "Multidisciplinary cancer meetings", "Patient counselling and support"], growthOutlook: "medium" },
    { id: "dermatologic-surgeon", title: "Dermatologic Surgeon", emoji: "🔬", description: "Perform surgical procedures on the skin — treating skin cancers, cysts, and cosmetic skin conditions.", avgSalary: "1,000,000 - 1,800,000 kr/year", educationPath: "Medical Degree + Dermatology Specialisation + Surgical Dermatology Fellowship", keySkills: ["Mohs surgery", "excision techniques", "skin flap closure", "dermoscopy", "pathology knowledge"], dailyTasks: ["Perform Mohs micrographic surgery", "Excise skin cancers", "Skin flap and graft procedures", "Dermoscopy assessments", "Follow-up clinics"], growthOutlook: "medium" },
    { id: "peripheral-nerve-surgeon", title: "Peripheral Nerve Surgeon", emoji: "⚡", description: "Operate on damaged or compressed peripheral nerves — restoring sensation and movement after injury or disease.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Medical Degree + Neurosurgery or Plastic Surgery + Peripheral Nerve Fellowship", keySkills: ["microsurgery", "nerve grafting", "electrodiagnostics", "anatomy expertise", "rehabilitation planning"], dailyTasks: ["Repair severed nerves", "Decompress trapped nerves", "Nerve transfer surgery", "Electrodiagnostic assessment", "Long-term rehabilitation coordination"], growthOutlook: "medium" },
    {
      id: "anesthesiologist",
      title: "Anesthesiologist",
      emoji: "💉",
      description: "Manage anaesthesia and patient vital signs during surgery, ensuring safety and pain control before, during, and after procedures.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Medical Degree (6 years) + Anaesthesiology Specialisation (5 years)",
      keySkills: ["pharmacology", "vigilance", "calm under pressure", "patient assessment", "teamwork"],
      dailyTasks: ["Assess patients pre-op", "Administer anaesthesia", "Monitor vitals during surgery", "Manage pain relief", "Handle emergencies"],
      growthOutlook: "high",
    },
    {
      id: "psychiatrist",
      title: "Psychiatrist",
      emoji: "🧠",
      description: "Medical doctor specialising in diagnosing and treating mental health conditions, including prescribing medication and therapy.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Medical Degree (6 years) + Psychiatry Specialisation (5 years)",
      keySkills: ["empathy", "diagnostic reasoning", "active listening", "pharmacology", "ethics"],
      dailyTasks: ["Assess mental health", "Diagnose conditions", "Prescribe medication", "Provide therapy", "Coordinate care"],
      growthOutlook: "high",
    },
    {
      id: "radiologist",
      title: "Radiologist",
      emoji: "🩻",
      description: "Doctor who interprets medical images such as X-rays, CT scans, and MRIs to diagnose disease and guide treatment.",
      avgSalary: "1,000,000 - 1,700,000 kr/year",
      educationPath: "Medical Degree (6 years) + Radiology Specialisation (5 years)",
      keySkills: ["image interpretation", "anatomy", "attention to detail", "technology", "clinical reasoning"],
      dailyTasks: ["Interpret scans", "Write radiology reports", "Consult with doctors", "Perform image-guided procedures", "Review complex cases"],
      growthOutlook: "high",
    },
    {
      id: "pathologist",
      title: "Pathologist",
      emoji: "🔬",
      description: "Doctor who examines tissues, blood, and body fluids to diagnose disease — often working behind the scenes to guide treatment decisions.",
      avgSalary: "950,000 - 1,500,000 kr/year",
      educationPath: "Medical Degree (6 years) + Pathology Specialisation (5 years)",
      keySkills: ["microscopy", "analytical thinking", "attention to detail", "biology", "report writing"],
      dailyTasks: ["Examine tissue samples", "Diagnose disease", "Write pathology reports", "Consult with clinicians", "Conduct autopsies"],
      growthOutlook: "high",
    },
    {
      id: "ophthalmologist",
      title: "Ophthalmologist",
      emoji: "👁️",
      description: "Eye doctor who diagnoses and treats eye conditions, performs eye surgery, and prescribes glasses or contacts.",
      avgSalary: "950,000 - 1,600,000 kr/year",
      educationPath: "Medical Degree (6 years) + Ophthalmology Specialisation (5 years)",
      keySkills: ["precision", "manual dexterity", "diagnostic skill", "patient care", "surgical technique"],
      dailyTasks: ["Examine eyes", "Diagnose eye disease", "Perform eye surgery", "Prescribe treatment", "Monitor chronic conditions"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Nursing & Midwifery
    // ──────────────────────────────────────────────
    {
      id: "registered-nurse",
      title: "Registered Nurse",
      emoji: "👩‍⚕️",
      description: "Provide and coordinate patient care in hospitals and clinics, administering treatments and supporting patients and families.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Nursing (3 years) + Registration",
      keySkills: ["clinical care", "communication", "empathy", "organisation", "teamwork"],
      dailyTasks: ["Administer medication", "Monitor patients", "Support families", "Document care", "Coordinate with doctors"],
      growthOutlook: "high",
    },
    {
      id: "nurse-practitioner",
      title: "Nurse Practitioner",
      emoji: "🩺",
      description: "Advanced practice nurse who can diagnose conditions, prescribe medication, and manage patient care more autonomously than a registered nurse.",
      avgSalary: "650,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Nursing + Master's in Advanced Practice (2 years)",
      keySkills: ["advanced clinical assessment", "decision-making", "prescribing", "patient education", "leadership"],
      dailyTasks: ["Diagnose conditions", "Prescribe treatments", "Manage caseloads", "Lead nursing teams", "Educate patients"],
      growthOutlook: "high",
    },
    {
      id: "midwife",
      title: "Midwife",
      emoji: "🤱",
      description: "Support women through pregnancy, birth, and the early weeks with a baby — providing clinical care and emotional support.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Nursing + Midwifery Specialisation (1.5-2 years)",
      keySkills: ["clinical skill", "empathy", "calm under pressure", "communication", "patient advocacy"],
      dailyTasks: ["Monitor pregnancies", "Support labour and birth", "Provide postnatal care", "Educate parents", "Coordinate with doctors"],
      growthOutlook: "high",
    },
    {
      id: "mental-health-nurse",
      title: "Mental Health Nurse",
      emoji: "💚",
      description: "Specialist nurse supporting people with mental health conditions across hospitals, clinics, and community settings.",
      avgSalary: "520,000 - 720,000 kr/year",
      educationPath: "Bachelor's in Nursing + Mental Health Specialisation",
      keySkills: ["empathy", "active listening", "de-escalation", "clinical care", "resilience"],
      dailyTasks: ["Assess mental health", "Build therapeutic relationships", "Administer treatments", "Support families", "Coordinate care plans"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Therapy & Allied Health
    // ──────────────────────────────────────────────
    {
      id: "occupational-therapist",
      title: "Occupational Therapist",
      emoji: "🖐️",
      description: "Help people of all ages take part in everyday activities after illness, injury, or disability through practical strategies and adaptations.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Occupational Therapy (3 years)",
      keySkills: ["empathy", "creativity", "problem-solving", "patience", "clinical assessment"],
      dailyTasks: ["Assess daily living needs", "Plan rehabilitation", "Teach adaptive techniques", "Recommend equipment", "Track progress"],
      growthOutlook: "high",
    },
    {
      id: "speech-language-therapist",
      title: "Speech and Language Therapist",
      emoji: "🗣️",
      description: "Assess and treat people with speech, language, communication, and swallowing difficulties across all ages.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Speech & Language Therapy (3 years)",
      keySkills: ["communication", "patience", "linguistics", "empathy", "creativity"],
      dailyTasks: ["Assess communication", "Plan therapy", "Run therapy sessions", "Support families", "Document progress"],
      growthOutlook: "high",
    },
    {
      id: "podiatrist",
      title: "Podiatrist",
      emoji: "🦶",
      description: "Diagnose and treat conditions of the foot, ankle, and lower limb — from sports injuries to diabetic foot care.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Podiatry (3 years)",
      keySkills: ["clinical assessment", "manual dexterity", "patient care", "anatomy", "minor surgery"],
      dailyTasks: ["Examine feet", "Treat foot conditions", "Perform minor procedures", "Fit orthotics", "Advise on foot health"],
      growthOutlook: "stable",
    },
    {
      id: "chiropractor",
      title: "Chiropractor",
      emoji: "💆",
      description: "Diagnose and treat musculoskeletal problems, especially back, neck, and joint issues, using manual adjustments and therapy.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Master's in Chiropractic (5 years)",
      keySkills: ["manual technique", "anatomy", "diagnosis", "patient communication", "physical stamina"],
      dailyTasks: ["Assess patients", "Perform adjustments", "Plan treatment", "Advise on posture", "Document outcomes"],
      growthOutlook: "stable",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Diagnostics & Imaging
    // ──────────────────────────────────────────────
    {
      id: "radiographer",
      title: "Radiographer",
      emoji: "📡",
      description: "Operate imaging equipment such as X-ray, CT, and MRI machines to produce diagnostic images for doctors.",
      avgSalary: "520,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Radiography (3 years)",
      keySkills: ["technical skill", "anatomy", "patient care", "attention to detail", "radiation safety"],
      dailyTasks: ["Position patients", "Operate imaging equipment", "Ensure image quality", "Follow safety protocols", "Support patients"],
      growthOutlook: "high",
    },
    {
      id: "sonographer",
      title: "Sonographer",
      emoji: "🤰",
      description: "Use ultrasound technology to capture images of organs, tissues, or unborn babies to support diagnosis and care.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Radiography + Ultrasound Specialisation",
      keySkills: ["ultrasound technique", "anatomy", "attention to detail", "patient care", "image interpretation"],
      dailyTasks: ["Perform ultrasound scans", "Capture diagnostic images", "Communicate with patients", "Document findings", "Liaise with doctors"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Emergency & Pre-hospital
    // ──────────────────────────────────────────────
    {
      id: "emt",
      title: "Emergency Medical Technician",
      emoji: "🚑",
      description: "Provide first-response emergency care at the scene of accidents and illnesses, transporting patients safely to hospital.",
      avgSalary: "440,000 - 580,000 kr/year",
      educationPath: "Vocational EMT training (1-2 years)",
      keySkills: ["first aid", "calm under pressure", "physical stamina", "teamwork", "communication"],
      dailyTasks: ["Respond to emergencies", "Provide basic life support", "Transport patients", "Assist paramedics", "Document incidents"],
      growthOutlook: "high",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Healthcare — Pharmacy & Dental Support
    // ──────────────────────────────────────────────
    {
      id: "pharmacy-technician",
      title: "Pharmacy Technician",
      emoji: "💊",
      description: "Support pharmacists by preparing and dispensing medication, managing stock, and helping customers in pharmacies and hospitals.",
      avgSalary: "420,000 - 550,000 kr/year",
      educationPath: "Vocational pharmacy technician programme (2-3 years)",
      keySkills: ["accuracy", "knowledge of medicines", "customer service", "organisation", "reliability"],
      dailyTasks: ["Dispense prescriptions", "Manage stock", "Advise customers", "Label medication", "Support pharmacists"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "dental-assistant",
      title: "Dental Assistant",
      emoji: "🦷",
      description: "Support dentists during treatment by preparing patients, sterilising tools, and helping with procedures in dental practices.",
      avgSalary: "400,000 - 520,000 kr/year",
      educationPath: "Vocational dental assistant training (2-3 years)",
      keySkills: ["manual dexterity", "patient care", "organisation", "hygiene practices", "teamwork"],
      dailyTasks: ["Prepare patients", "Assist during procedures", "Sterilise instruments", "Manage records", "Support dental hygiene"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Healthcare — Nutrition
    // ──────────────────────────────────────────────
    {
      id: "dietitian",
      title: "Dietitian",
      emoji: "🥗",
      description: "Qualified health professional who assesses nutrition needs and creates dietary plans to treat medical conditions.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Clinical Nutrition (3 years) + Registration",
      keySkills: ["nutritional science", "patient assessment", "communication", "empathy", "clinical reasoning"],
      dailyTasks: ["Assess nutritional needs", "Create meal plans", "Counsel patients", "Manage clinical conditions", "Educate groups"],
      growthOutlook: "high",
    },
    {
      id: "nutritionist",
      title: "Nutritionist",
      emoji: "🥑",
      description: "Advise people on food, healthy eating, and lifestyle to improve general wellbeing and prevent disease.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Nutrition or related field (3 years)",
      keySkills: ["nutrition knowledge", "communication", "motivation", "research", "client coaching"],
      dailyTasks: ["Advise on healthy eating", "Plan diets", "Coach clients", "Run workshops", "Stay current on research"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Food Science
    // ──────────────────────────────────────────────
    {
      id: "food-scientist",
      title: "Food Scientist",
      emoji: "🔬",
      description: "Apply chemistry, biology, and microbiology to study food — analysing nutritional content, shelf life, safety, and how ingredients behave during processing.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's or Master's in Food Science / Food Technology (3–5 years)",
      keySkills: ["food chemistry", "lab analysis", "microbiology", "research methods", "report writing"],
      dailyTasks: ["Run lab experiments", "Analyse samples", "Test new formulations", "Document findings", "Collaborate with R&D"],
      growthOutlook: "high",
    },
    {
      id: "food-technologist",
      title: "Food Technologist",
      emoji: "🥫",
      description: "Develop and refine the production processes that turn raw ingredients into safe, consistent, scalable food products on factory lines.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Food Technology / Food Science (3 years)",
      keySkills: ["process design", "food safety standards", "problem-solving", "quality control", "technical writing"],
      dailyTasks: ["Design recipes for scale", "Trial production runs", "Troubleshoot lines", "Test product quality", "Document processes"],
      growthOutlook: "high",
    },
    {
      id: "food-product-developer",
      title: "Food Product Developer",
      emoji: "🧪",
      description: "Create new food and drink products for brands — from first concept and kitchen prototypes through to shelf launch.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Food Science, Nutrition, or Culinary Arts + commercial experience",
      keySkills: ["recipe development", "consumer insight", "creativity", "sensory analysis", "project management"],
      dailyTasks: ["Develop prototypes", "Run taste panels", "Refine recipes", "Cost ingredients", "Brief packaging teams"],
      growthOutlook: "high",
    },
    {
      id: "food-safety-inspector",
      title: "Food Safety Inspector",
      emoji: "🛡️",
      description: "Inspect food businesses — restaurants, factories, farms — to make sure hygiene, labelling, and safety rules are being followed and the public is protected.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Food Science, Public Health, or Environmental Health + Mattilsynet training",
      keySkills: ["regulation knowledge", "attention to detail", "communication", "report writing", "independence"],
      dailyTasks: ["Inspect premises", "Review records", "Take samples", "Write reports", "Issue improvement notices"],
      growthOutlook: "stable",
    },
    {
      id: "quality-assurance-food",
      title: "Food Quality Assurance Specialist",
      emoji: "✅",
      description: "Make sure food products leaving a factory meet every quality, safety, and labelling standard — running tests, audits, and corrective actions.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Food Science / Quality Management (3 years)",
      keySkills: ["HACCP", "auditing", "lab testing", "documentation", "problem-solving"],
      dailyTasks: ["Audit production lines", "Test samples", "Review records", "Investigate complaints", "Train staff"],
      growthOutlook: "stable",
    },
    {
      id: "sports-nutritionist",
      title: "Sports Nutritionist",
      emoji: "💪",
      description: "Build performance-focused diets for athletes and active people — optimising fuelling, recovery, body composition, and competition strategy.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Nutrition + Sports Nutrition certification (e.g. ISSN)",
      keySkills: ["nutrition science", "exercise physiology", "client coaching", "meal planning", "data tracking"],
      dailyTasks: ["Assess athletes", "Design meal plans", "Adjust during training cycles", "Track outcomes", "Educate teams"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Public Health & Research
    // ──────────────────────────────────────────────
    {
      id: "epidemiologist",
      title: "Epidemiologist",
      emoji: "📊",
      description: "Study patterns, causes, and effects of disease in populations to inform public health policy and outbreak response.",
      avgSalary: "650,000 - 950,000 kr/year",
      educationPath: "Master's or PhD in Epidemiology / Public Health",
      keySkills: ["statistical analysis", "research design", "data interpretation", "writing", "critical thinking"],
      dailyTasks: ["Analyse health data", "Design studies", "Investigate outbreaks", "Publish findings", "Advise policy makers"],
      growthOutlook: "high",
    },
    {
      id: "public-health-specialist",
      title: "Public Health Specialist",
      emoji: "🌍",
      description: "Design and run programmes to improve health at the population level — from vaccination drives to anti-smoking campaigns.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Master's in Public Health (2 years)",
      keySkills: ["programme design", "data analysis", "communication", "policy understanding", "project management"],
      dailyTasks: ["Plan health programmes", "Analyse population data", "Coordinate stakeholders", "Evaluate impact", "Advocate for change"],
      growthOutlook: "high",
    },
    {
      id: "clinical-researcher",
      title: "Clinical Researcher",
      emoji: "🧪",
      description: "Run clinical trials and studies that test new treatments, drugs, and medical devices on patients under strict protocols.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Master's or PhD in Health Sciences / Medicine",
      keySkills: ["research design", "regulatory knowledge", "data analysis", "patient ethics", "attention to detail"],
      dailyTasks: ["Design trials", "Recruit participants", "Collect clinical data", "Analyse results", "Publish findings"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Healthcare — Administration & Management
    // ──────────────────────────────────────────────
    {
      id: "medical-secretary",
      title: "Medical Secretary",
      emoji: "📋",
      description: "Provide administrative support in clinics and hospitals — managing appointments, records, and patient correspondence.",
      avgSalary: "420,000 - 540,000 kr/year",
      educationPath: "Vocational medical secretary training (1-2 years)",
      keySkills: ["organisation", "medical terminology", "communication", "discretion", "computer skills"],
      dailyTasks: ["Schedule appointments", "Manage records", "Type medical letters", "Greet patients", "Handle phone calls"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "health-information-manager",
      title: "Health Information Manager",
      emoji: "💼",
      description: "Manage patient data, electronic health records, and information systems in hospitals and clinics — ensuring accuracy and privacy.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Health Informatics or related field (3 years)",
      keySkills: ["data management", "privacy regulations", "systems knowledge", "leadership", "attention to detail"],
      dailyTasks: ["Oversee health records", "Ensure data quality", "Manage systems", "Train staff", "Enforce privacy"],
      growthOutlook: "high",
    },
    {
      id: "hospital-administrator",
      title: "Hospital Administrator",
      emoji: "🏥",
      description: "Manage the day-to-day operations of a hospital or clinic — overseeing staff, budgets, and services to keep care running smoothly.",
      avgSalary: "750,000 - 1,300,000 kr/year",
      educationPath: "Master's in Health Administration / Management (2 years)",
      keySkills: ["leadership", "operations management", "finance", "healthcare knowledge", "communication"],
      dailyTasks: ["Manage operations", "Oversee staff", "Plan budgets", "Liaise with clinicians", "Improve services"],
      growthOutlook: "high",
    },
  ],

  // ========================================
  // EDUCATION & TRAINING
  // ========================================
  EDUCATION_TRAINING: [
    {
      id: "primary-teacher",
      title: "Primary School Teacher",
      emoji: "📚",
      description: "Educate children in elementary school, teaching foundational subjects and life skills.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's/Master's in Education (4-5 years)",
      keySkills: ["communication", "patience", "creativity", "organisation", "classroom management"],
      dailyTasks: ["Plan lessons", "Teach classes", "Grade assignments", "Meet with parents", "Support student development"],
      growthOutlook: "stable",
    },
    {
      id: "secondary-teacher",
      title: "Secondary School Teacher",
      emoji: "🎓",
      description: "Teach specialised subjects to teenagers in upper secondary school.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "Bachelor's/Master's in Subject + Teaching Qualification",
      keySkills: ["subject expertise", "communication", "mentoring", "assessment", "technology use"],
      dailyTasks: ["Teach specialised subjects", "Prepare students for exams", "Advise on career paths", "Grade work"],
      growthOutlook: "stable",
    },
    {
      id: "kindergarten-teacher",
      title: "Kindergarten Teacher",
      emoji: "🧒",
      description: "Nurture young children's development through play-based learning in kindergartens.",
      avgSalary: "420,000 - 550,000 kr/year",
      educationPath: "Bachelor's in Early Childhood Education (3 years)",
      keySkills: ["creativity", "patience", "communication", "play-based learning", "child development"],
      dailyTasks: ["Plan activities", "Supervise children", "Support social development", "Communicate with parents"],
      growthOutlook: "high",
    },
    {
      id: "special-needs-educator",
      title: "Special Needs Educator",
      emoji: "💙",
      description: "Support students with learning disabilities and special needs in educational settings.",
      avgSalary: "480,000 - 620,000 kr/year",
      educationPath: "Master's in Special Education",
      keySkills: ["patience", "adaptability", "communication", "individualized teaching", "empathy"],
      dailyTasks: ["Develop individual plans", "Adapt teaching methods", "Support students", "Collaborate with teams"],
      growthOutlook: "high",
    },
    {
      id: "university-lecturer",
      title: "University Lecturer",
      emoji: "🏛️",
      description: "Teach university courses, conduct research, and supervise student projects.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "PhD in relevant field",
      keySkills: ["research", "teaching", "public speaking", "academic writing", "mentoring"],
      dailyTasks: ["Lecture students", "Conduct research", "Write papers", "Supervise theses", "Attend conferences"],
      growthOutlook: "medium",
    },
    {
      id: "corporate-trainer",
      title: "Corporate Trainer",
      emoji: "👔",
      description: "Design and deliver training programs for employees in organisations.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's + Training certifications",
      keySkills: ["presentation", "curriculum design", "communication", "adaptability", "technology"],
      dailyTasks: ["Develop training materials", "Deliver workshops", "Assess learning outcomes", "Update content"],
      growthOutlook: "high",
    },
    {
      id: "childcare-assistant",
      title: "Childcare Assistant",
      emoji: "👶",
      description: "Support children's care and development in kindergartens and after-school programs.",
      avgSalary: "320,000 - 420,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship = Fagbrev",
      keySkills: ["patience", "creativity", "communication", "responsibility", "playfulness"],
      dailyTasks: ["Supervise activities", "Assist with meals", "Support learning through play", "Ensure safety"],
      growthOutlook: "high",
      entryLevel: true,
    },
    { id: "tutor", title: "Tutor", emoji: "📝", description: "Teach individual students one-on-one — usually in a specific subject, helping them catch up or excel.", avgSalary: "200,000 - 600,000 kr/year (often part-time)", educationPath: "Subject expertise — university student or graduate", keySkills: ["subject mastery", "patience", "explanation", "diagnosis", "adaptability"], dailyTasks: ["Plan lessons", "Teach students", "Mark work", "Track progress", "Brief parents"], growthOutlook: "high", entryLevel: true },
    { id: "career-coach", title: "Career Coach", emoji: "🧭", description: "Help people figure out career direction, write CVs, and prepare for interviews — through one-on-one coaching.", avgSalary: "450,000 - 900,000 kr/year", educationPath: "Bachelor's in Psychology / HR / Education + coaching certification (ICF)", keySkills: ["coaching", "empathy", "career knowledge", "questioning", "structure"], dailyTasks: ["Run sessions", "Review CVs", "Coach interviews", "Set goals", "Track progress"], growthOutlook: "high" },
  ],

  // ========================================
  // TECHNOLOGY & IT
  // ========================================
  TECHNOLOGY_IT: [
    {
      id: "software-developer",
      title: "Software Developer",
      emoji: "💻",
      description: "Design, build, and maintain software applications for web, mobile, or desktop.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Computer Science or self-taught with portfolio",
      keySkills: ["programming", "problem-solving", "logical thinking", "teamwork", "continuous learning"],
      dailyTasks: ["Write code", "Debug issues", "Review code", "Plan features", "Collaborate with team"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      emoji: "📊",
      description: "Analyse large datasets to find insights and build predictive models for businesses.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Master's in Data Science, Statistics, or Computer Science",
      keySkills: ["statistics", "machine learning", "programming", "data visualisation", "communication"],
      dailyTasks: ["Analyse data", "Build models", "Create visualisations", "Present findings", "Clean datasets"],
      growthOutlook: "high",
    },
    {
      id: "cybersecurity-analyst",
      title: "Cybersecurity Analyst",
      emoji: "🔐",
      description: "Protect organisations from cyber threats by monitoring systems and responding to incidents.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in IT Security + Certifications (CompTIA Security+, CEH)",
      keySkills: ["security knowledge", "analytical thinking", "attention to detail", "problem-solving", "ethics"],
      dailyTasks: ["Monitor systems", "Investigate threats", "Implement security measures", "Train staff"],
      growthOutlook: "high",
    },
    {
      id: "ux-designer",
      title: "UX Designer",
      emoji: "🎨",
      description: "Design user interfaces and experiences for websites and apps that are intuitive and beautiful.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Design or self-taught with strong portfolio",
      keySkills: ["design thinking", "user research", "prototyping", "visual design", "communication"],
      dailyTasks: ["Research users", "Create wireframes", "Design interfaces", "Test with users", "Collaborate with developers"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "cloud-engineer",
      title: "Cloud Engineer",
      emoji: "☁️",
      description: "Design and manage cloud infrastructure on platforms like AWS, Azure, or Google Cloud.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in IT + Cloud certifications (AWS, Azure)",
      keySkills: ["cloud platforms", "networking", "automation", "security", "problem-solving"],
      dailyTasks: ["Manage cloud infrastructure", "Optimise costs", "Ensure security", "Automate deployments"],
      growthOutlook: "high",
    },
    {
      id: "it-support",
      title: "IT Support Specialist",
      emoji: "🖥️",
      description: "Help users solve technical problems and maintain computer systems in organisations.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational IT training or Bachelor's in IT",
      keySkills: ["technical knowledge", "communication", "patience", "problem-solving", "customer service"],
      dailyTasks: ["Resolve user issues", "Set up equipment", "Maintain systems", "Document solutions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "devops-engineer",
      title: "DevOps Engineer",
      emoji: "⚙️",
      description: "Bridge development and operations by automating deployments and managing infrastructure.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in IT + DevOps experience",
      keySkills: ["automation", "scripting", "CI/CD", "cloud platforms", "monitoring"],
      dailyTasks: ["Automate deployments", "Monitor systems", "Optimise performance", "Collaborate with developers"],
      growthOutlook: "high",
    },
    {
      id: "ai-engineer",
      title: "AI Engineer",
      emoji: "🤖",
      description: "Build and deploy artificial intelligence and machine learning systems.",
      avgSalary: "650,000 - 1,100,000 kr/year",
      educationPath: "Master's in AI, Machine Learning, or Computer Science",
      keySkills: ["machine learning", "programming", "mathematics", "problem-solving", "research"],
      dailyTasks: ["Train models", "Process data", "Optimise algorithms", "Deploy AI systems"],
      growthOutlook: "high",
    },
    {
      id: "it-project-manager",
      title: "IT Project Manager",
      emoji: "📋",
      description: "Lead technology projects from planning to delivery, coordinating teams, budgets, and timelines.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in IT or Business + PMP/PRINCE2 certification",
      keySkills: ["project planning", "stakeholder management", "risk management", "communication", "agile methodologies"],
      dailyTasks: ["Plan project milestones", "Coordinate dev teams", "Manage budgets", "Report to stakeholders", "Mitigate risks"],
      growthOutlook: "high",
    },
    {
      id: "cio",
      title: "Chief Information Officer",
      emoji: "👔",
      description: "Executive responsible for IT strategy, infrastructure, and aligning technology with business goals.",
      avgSalary: "1,200,000 - 2,500,000 kr/year",
      educationPath: "Master's in IT/Business + 15+ years experience",
      keySkills: ["strategic thinking", "leadership", "business acumen", "technology vision", "stakeholder management"],
      dailyTasks: ["Set IT strategy", "Manage IT budget", "Lead digital transformation", "Report to board", "Oversee IT teams"],
      growthOutlook: "stable",
    },
    {
      id: "agile-coach",
      title: "SAFe Agile Coach",
      emoji: "🎯",
      description: "Guide organisations in adopting agile practices and the Scaled Agile Framework (SAFe) for large teams.",
      avgSalary: "700,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's + SAFe certifications (SA, SPC)",
      keySkills: ["agile frameworks", "coaching", "facilitation", "change management", "communication"],
      dailyTasks: ["Facilitate PI planning", "Coach teams on agile", "Remove impediments", "Train scrum masters", "Drive continuous improvement"],
      growthOutlook: "high",
    },
    {
      id: "network-engineer",
      title: "Network Engineer",
      emoji: "🌐",
      description: "Design, implement, and maintain computer networks including LANs, WANs, and cloud connectivity.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in IT + Cisco/Juniper certifications (CCNA, CCNP)",
      keySkills: ["networking protocols", "firewall configuration", "troubleshooting", "security", "cloud networking"],
      dailyTasks: ["Configure routers and switches", "Monitor network performance", "Troubleshoot connectivity", "Implement security policies", "Plan capacity"],
      growthOutlook: "stable",
    },
    {
      id: "solutions-architect",
      title: "Solutions Architect",
      emoji: "🏗️",
      description: "Design technical solutions and system architectures that meet business requirements at scale.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + AWS/Azure certifications",
      keySkills: ["system design", "cloud architecture", "technical leadership", "communication", "problem-solving"],
      dailyTasks: ["Design system architectures", "Evaluate technologies", "Create technical proposals", "Guide development teams", "Present to clients"],
      growthOutlook: "high",
    },
    {
      id: "database-administrator",
      title: "Database Administrator",
      emoji: "🗄️",
      description: "Manage, optimise, and secure databases to ensure data availability and performance.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's in IT + Database certifications (Oracle, SQL Server)",
      keySkills: ["SQL", "database optimisation", "backup/recovery", "security", "performance tuning"],
      dailyTasks: ["Monitor database performance", "Optimise queries", "Manage backups", "Ensure data security", "Plan capacity"],
      growthOutlook: "stable",
    },
    {
      id: "qa-engineer",
      title: "QA Engineer",
      emoji: "🧪",
      description: "Ensure software quality through testing strategies, test automation, and defect prevention.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in CS/IT or self-taught + ISTQB certification",
      keySkills: ["test automation", "manual testing", "programming", "attention to detail", "analytical thinking"],
      dailyTasks: ["Write test cases", "Automate tests", "Report bugs", "Review requirements", "Validate releases"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "scrum-master",
      title: "Scrum Master",
      emoji: "🔄",
      description: "Facilitate scrum processes, remove blockers, and help development teams deliver effectively.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's + Scrum certifications (CSM, PSM)",
      keySkills: ["scrum framework", "facilitation", "coaching", "conflict resolution", "servant leadership"],
      dailyTasks: ["Facilitate daily standups", "Run sprint ceremonies", "Remove impediments", "Coach team members", "Track metrics"],
      growthOutlook: "high",
    },
    {
      id: "systems-administrator",
      title: "Systems Administrator",
      emoji: "🖧",
      description: "Maintain and configure servers, operating systems, and IT infrastructure for organisations.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in IT or vocational training + certifications",
      keySkills: ["Linux/Windows administration", "scripting", "troubleshooting", "security", "virtualisation"],
      dailyTasks: ["Manage servers", "Install software", "Monitor systems", "Handle user issues", "Maintain security"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "product-manager-tech",
      title: "Technical Product Manager",
      emoji: "📱",
      description: "Define product vision and roadmap for technology products, bridging business and engineering.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in CS/Business + Product management experience",
      keySkills: ["product strategy", "user research", "data analysis", "communication", "technical knowledge"],
      dailyTasks: ["Define product roadmap", "Prioritise features", "Analyse user data", "Work with engineers", "Present to stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "rte",
      title: "Release Train Engineer",
      emoji: "🚂",
      description: "Facilitate Agile Release Trains in SAFe, coordinating multiple teams to deliver value at scale.",
      avgSalary: "750,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's + SAFe RTE certification + Agile experience",
      keySkills: ["SAFe framework", "facilitation", "program management", "risk management", "servant leadership"],
      dailyTasks: ["Facilitate PI planning", "Coordinate across teams", "Remove program-level impediments", "Track ART metrics", "Coach scrum masters"],
      growthOutlook: "high",
    },
    {
      id: "product-owner",
      title: "Product Owner",
      emoji: "📝",
      description: "Own the product backlog, prioritise features, and ensure teams build the right things for customers.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's + CSPO/PSPO certification + Domain experience",
      keySkills: ["backlog management", "stakeholder communication", "user stories", "prioritisation", "agile methodologies"],
      dailyTasks: ["Refine product backlog", "Write user stories", "Prioritize features", "Accept completed work", "Engage stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "technical-writer",
      title: "Technical Writer",
      emoji: "📖",
      description: "Create clear documentation, user guides, and API references for technical products.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Communications/CS + Writing portfolio",
      keySkills: ["technical writing", "information architecture", "research", "attention to detail", "tool proficiency"],
      dailyTasks: ["Write documentation", "Review technical accuracy", "Create diagrams", "Maintain doc systems", "Interview developers"],
      growthOutlook: "medium",
    },
    {
      id: "frontend-developer",
      title: "Frontend Developer",
      emoji: "🎨",
      description: "Build user interfaces and interactive web experiences using modern JavaScript frameworks.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in CS or self-taught with portfolio",
      keySkills: ["JavaScript/TypeScript", "React/Vue/Angular", "CSS", "responsive design", "accessibility"],
      dailyTasks: ["Build UI components", "Implement designs", "Optimise performance", "Write tests", "Review code"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "backend-developer",
      title: "Backend Developer",
      emoji: "⚙️",
      description: "Build server-side applications, APIs, and database systems that power applications.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in CS or equivalent experience",
      keySkills: ["server-side languages", "databases", "API design", "security", "system design"],
      dailyTasks: ["Design APIs", "Write server code", "Optimise queries", "Handle integrations", "Ensure security"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "mobile-developer",
      title: "Mobile Developer",
      emoji: "📲",
      description: "Build native or cross-platform mobile applications for iOS and Android devices.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in CS or self-taught with published apps",
      keySkills: ["Swift/Kotlin", "React Native/Flutter", "mobile UX", "app store guidelines", "performance optimisation"],
      dailyTasks: ["Develop mobile features", "Test on devices", "Optimise battery/performance", "Submit to app stores", "Fix bugs"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "game-developer",
      title: "Game Developer",
      emoji: "🎮",
      description: "Design and program video games, from gameplay mechanics to graphics and AI.",
      avgSalary: "480,000 - 750,000 kr/year",
      educationPath: "Bachelor's in CS/Game Design or strong portfolio",
      keySkills: ["game engines", "C++/C#", "3D mathematics", "game design", "performance optimisation"],
      dailyTasks: ["Implement game features", "Optimise performance", "Debug gameplay", "Collaborate with artists", "Playtest"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "sre",
      title: "Site Reliability Engineer",
      emoji: "🔧",
      description: "Ensure systems are reliable, scalable, and performant through automation and engineering practices.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Operations experience",
      keySkills: ["systems engineering", "automation", "monitoring", "incident response", "capacity planning"],
      dailyTasks: ["Monitor system health", "Automate operations", "Respond to incidents", "Improve reliability", "Define SLOs"],
      growthOutlook: "high",
    },
    {
      id: "data-engineer",
      title: "Data Engineer",
      emoji: "🔀",
      description: "Build and maintain data pipelines, warehouses, and infrastructure for analytics and ML.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in CS/Engineering + Data platform experience",
      keySkills: ["SQL", "Python/Scala", "data pipelines", "cloud platforms", "data modeling"],
      dailyTasks: ["Build ETL pipelines", "Optimise data models", "Ensure data quality", "Manage data infrastructure", "Support analysts"],
      growthOutlook: "high",
    },
    {
      id: "security-engineer",
      title: "Security Engineer",
      emoji: "🛡️",
      description: "Design and implement security systems, conduct penetration testing, and protect infrastructure.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/Security + Certifications (OSCP, CISSP)",
      keySkills: ["penetration testing", "security architecture", "cryptography", "incident response", "secure coding"],
      dailyTasks: ["Conduct security assessments", "Implement security controls", "Review code for vulnerabilities", "Respond to incidents", "Train developers"],
      growthOutlook: "high",
    },
    {
      id: "embedded-developer",
      title: "Embedded Systems Developer",
      emoji: "🔌",
      description: "Program microcontrollers and embedded systems for IoT devices, automotive, and industrial applications.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in EE/CS + Embedded experience",
      keySkills: ["C/C++", "microcontrollers", "RTOS", "hardware interfaces", "debugging"],
      dailyTasks: ["Write firmware", "Debug hardware issues", "Optimise for constraints", "Test embedded systems", "Work with hardware teams"],
      growthOutlook: "high",
    },
    {
      id: "enterprise-architect",
      title: "Enterprise Architect",
      emoji: "🏗️",
      description: "Design and oversee organisation-wide IT architecture, aligning technology strategy with business goals.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + TOGAF certification + 10+ years experience",
      keySkills: ["enterprise architecture", "TOGAF/Zachman", "business strategy", "stakeholder management", "technology roadmaps"],
      dailyTasks: ["Define architecture standards", "Align IT with business", "Review major projects", "Guide technology decisions", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "data-architect",
      title: "Data Architect",
      emoji: "🗄️",
      description: "Design and manage enterprise data architecture, ensuring data quality, governance, and accessibility.",
      avgSalary: "750,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Data Science + Data architecture experience",
      keySkills: ["data modeling", "data governance", "database design", "cloud data platforms", "data strategy"],
      dailyTasks: ["Design data models", "Define data standards", "Guide data platform decisions", "Ensure data quality", "Collaborate with stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "principal-engineer",
      title: "Principal Engineer",
      emoji: "🏅",
      description: "Set technical direction across multiple teams, make high-impact architectural decisions, and drive engineering excellence organisation-wide.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 12+ years engineering experience",
      keySkills: ["technical strategy", "cross-team influence", "system design", "mentoring", "innovation"],
      dailyTasks: ["Set technical direction", "Make architectural decisions", "Drive engineering excellence", "Mentor senior engineers", "Influence hiring standards"],
      growthOutlook: "high",
    },
    {
      id: "staff-engineer",
      title: "Staff Engineer",
      emoji: "⭐",
      description: "Tackle the hardest cross-cutting technical problems, resolve systemic technical debt, and raise the engineering bar across the organisation.",
      avgSalary: "850,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years engineering experience",
      keySkills: ["deep technical expertise", "cross-team collaboration", "problem decomposition", "code quality", "technical writing"],
      dailyTasks: ["Lead cross-cutting initiatives", "Resolve systemic tech debt", "Produce technical RFCs", "Influence engineering direction", "Review critical designs"],
      growthOutlook: "high",
    },
    {
      id: "platform-architect",
      title: "Platform Architect",
      emoji: "🏗️",
      description: "Architect the internal developer platform that engineering teams build upon, defining compute, CI/CD, data, and observability abstractions.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + Platform engineering experience",
      keySkills: ["platform design", "cloud architecture", "developer experience", "infrastructure as code", "API design"],
      dailyTasks: ["Design platform architecture", "Define platform abstractions", "Evaluate cloud-native technologies", "Improve developer productivity", "Set platform standards"],
      growthOutlook: "high",
    },
    {
      id: "software-architect",
      title: "Software Architect",
      emoji: "📐",
      description: "Define software architecture and technical standards for engineering teams, establishing design patterns and conducting architecture decision records.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 8+ years engineering experience",
      keySkills: ["system design", "design patterns", "API architecture", "technical leadership", "documentation"],
      dailyTasks: ["Define system architecture", "Establish technical standards", "Mentor engineers", "Conduct architecture reviews", "Write ADRs"],
      growthOutlook: "high",
    },
    {
      id: "fullstack-engineer",
      title: "Full-Stack Engineer",
      emoji: "🔗",
      description: "Work across the entire stack from database and APIs to frontend UI, owning features end-to-end from technical design to deployment.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in CS or equivalent experience",
      keySkills: ["React/Next.js", "Node.js/Python", "SQL/NoSQL", "API design", "DevOps basics"],
      dailyTasks: ["Build features across the stack", "Own projects end-to-end", "Debug cross-stack issues", "Improve developer tooling", "Write tests"],
      growthOutlook: "high",
    },
    {
      id: "platform-engineer",
      title: "Platform Engineer",
      emoji: "🛠️",
      description: "Build the internal developer platform that accelerates product engineering, managing Kubernetes clusters, service meshes, and deployment pipelines.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Platform engineering experience",
      keySkills: ["Kubernetes", "platform tooling", "developer experience", "Terraform/Pulumi", "observability"],
      dailyTasks: ["Build self-service platform capabilities", "Manage Kubernetes clusters", "Define platform SLOs", "Maintain deployment pipelines", "Support engineering teams"],
      growthOutlook: "high",
    },
    {
      id: "iac-specialist",
      title: "Infrastructure as Code Specialist",
      emoji: "📝",
      description: "Specialise in defining all infrastructure through code using Terraform, Pulumi, or similar tools, enforcing GitOps workflows and best practices.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in IT + Cloud certifications + IaC experience",
      keySkills: ["Terraform", "Pulumi", "cloud platforms", "GitOps", "module design"],
      dailyTasks: ["Write IaC modules", "Implement GitOps workflows", "Review infrastructure PRs", "Enforce IaC best practices", "Automate provisioning"],
      growthOutlook: "high",
    },
    {
      id: "mlops-engineer",
      title: "MLOps Engineer",
      emoji: "🔬",
      description: "Build the infrastructure and tooling for reliable ML model deployment, monitoring, versioning, and automated retraining pipelines.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + ML engineering experience",
      keySkills: ["ML pipelines", "model serving", "Kubernetes", "monitoring", "CI/CD for ML"],
      dailyTasks: ["Build ML training infrastructure", "Implement model versioning", "Monitor model drift", "Automate retraining triggers", "Manage model deployments"],
      growthOutlook: "high",
    },
    {
      id: "automation-engineer",
      title: "Automation Engineer",
      emoji: "🤖",
      description: "Automate business processes and workflows through scripting, API integrations, and workflow automation tools.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in CS/IT or equivalent experience",
      keySkills: ["Python", "workflow automation", "API integration", "scripting", "process analysis"],
      dailyTasks: ["Automate repetitive processes", "Build system integrations", "Document automated workflows", "Train teams on new processes", "Monitor automation health"],
      growthOutlook: "high",
    },
    {
      id: "test-architect",
      title: "Software Test Architect",
      emoji: "🧪",
      description: "Define organisation-wide test strategy, design test frameworks, and establish quality gates in CI/CD pipelines.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's in CS + 8+ years QA/testing experience",
      keySkills: ["test strategy", "test frameworks", "CI/CD integration", "performance testing", "quality metrics"],
      dailyTasks: ["Define test strategy", "Design test frameworks", "Establish quality gates", "Review test coverage", "Improve testing infrastructure"],
      growthOutlook: "high",
    },
    {
      id: "devsecops-engineer",
      title: "DevSecOps Engineer",
      emoji: "🔏",
      description: "Embed security into CI/CD pipelines and software supply chains, automating compliance checks and security policy enforcement.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/Security + DevOps experience",
      keySkills: ["security tooling", "CI/CD security", "container scanning", "supply chain security", "compliance"],
      dailyTasks: ["Integrate security scanning into CI/CD", "Manage supply chain security", "Automate compliance checks", "Respond to vulnerability findings", "Train developers on security"],
      growthOutlook: "high",
    },
    {
      id: "perf-test-engineer",
      title: "Load Test Engineer",
      emoji: "📈",
      description: "Design and execute performance and load tests to ensure systems scale reliably under production traffic patterns.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Performance testing experience",
      keySkills: ["k6/JMeter/Gatling", "performance analysis", "profiling", "monitoring", "report writing"],
      dailyTasks: ["Design load test scenarios", "Execute performance tests", "Analyse bottlenecks", "Recommend optimisations", "Produce benchmark reports"],
      growthOutlook: "high",
    },
    {
      id: "senior-software-engineer",
      title: "Senior Software Engineer",
      emoji: "💻",
      description: "Deliver high-quality software across the stack while mentoring junior engineers and leading technical design for complex features.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 5-8 years experience",
      keySkills: ["system design", "code review", "mentoring", "TypeScript/Python/Go", "distributed systems"],
      dailyTasks: ["Design and implement complex features", "Review code and mentor juniors", "Lead technical discussions", "Collaborate with product", "Improve engineering practices"],
      growthOutlook: "high",
    },
    {
      id: "backend-engineer-distributed",
      title: "Distributed Systems Engineer",
      emoji: "🔀",
      description: "Build and maintain distributed backend systems handling high concurrency, data replication, and fault tolerance at scale.",
      avgSalary: "650,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + Distributed systems experience",
      keySkills: ["distributed systems", "message queues", "consensus algorithms", "database internals", "performance tuning"],
      dailyTasks: ["Design distributed services", "Optimise for latency and throughput", "Debug concurrency issues", "Implement fault tolerance", "Write technical design docs"],
      growthOutlook: "high",
    },
    {
      id: "cloud-architect",
      title: "Cloud Architect",
      emoji: "☁️",
      description: "Design enterprise cloud strategy and multi-cloud architectures, guiding organisations through cloud adoption and migration.",
      avgSalary: "850,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + AWS/Azure/GCP Professional certifications",
      keySkills: ["cloud architecture", "multi-cloud strategy", "cost optimisation", "security", "migration planning"],
      dailyTasks: ["Design cloud architectures", "Lead cloud migration planning", "Optimise cloud costs", "Define security standards", "Evaluate cloud services"],
      growthOutlook: "high",
    },
    {
      id: "infrastructure-architect",
      title: "Infrastructure Architect",
      emoji: "🏗️",
      description: "Design and oversee enterprise infrastructure spanning on-premises, cloud, and hybrid environments for reliability and scale.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/IT + Infrastructure architecture experience",
      keySkills: ["infrastructure design", "networking", "storage", "virtualisation", "disaster recovery"],
      dailyTasks: ["Design infrastructure architectures", "Plan capacity and DR", "Evaluate technologies", "Set infrastructure standards", "Review designs"],
      growthOutlook: "high",
    },
    {
      id: "senior-sre",
      title: "Senior Site Reliability Engineer",
      emoji: "🔧",
      description: "Lead reliability engineering efforts defining SLO frameworks, incident management processes, and driving reliability culture across the organisation.",
      avgSalary: "750,000 - 1,150,000 kr/year",
      educationPath: "Bachelor's in CS/IT + 5+ years SRE/operations experience",
      keySkills: ["SRE leadership", "SLO frameworks", "incident management", "chaos engineering", "reliability culture"],
      dailyTasks: ["Define SLO frameworks", "Lead incident post-mortems", "Drive reliability improvements", "Mentor SRE team", "Establish on-call practices"],
      growthOutlook: "high",
    },
    {
      id: "senior-devops-engineer",
      title: "Senior DevOps Engineer",
      emoji: "⚙️",
      description: "Lead DevOps practices and CI/CD strategy, designing deployment pipelines and infrastructure automation at scale.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's in CS/IT + 5+ years DevOps experience",
      keySkills: ["CI/CD architecture", "infrastructure as code", "container orchestration", "GitOps", "developer experience"],
      dailyTasks: ["Design CI/CD strategies", "Lead infrastructure automation", "Mentor DevOps engineers", "Improve developer workflows", "Drive platform adoption"],
      growthOutlook: "high",
    },
    {
      id: "security-architect",
      title: "Security Architect",
      emoji: "🛡️",
      description: "Design enterprise security architecture, defining security frameworks, threat models, and zero-trust strategies across the organisation.",
      avgSalary: "850,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Security + CISSP/SABSA certifications",
      keySkills: ["security architecture", "threat modelling", "zero trust", "compliance frameworks", "risk assessment"],
      dailyTasks: ["Design security architectures", "Conduct threat modelling", "Define security standards", "Review solution designs", "Guide security strategy"],
      growthOutlook: "high",
    },
    {
      id: "application-security-lead",
      title: "Application Security Lead",
      emoji: "🔐",
      description: "Lead application security programmes establishing secure SDLC practices, vulnerability management, and security training across engineering.",
      avgSalary: "750,000 - 1,150,000 kr/year",
      educationPath: "Bachelor's in CS + Security certifications (OSCP, CSSLP)",
      keySkills: ["application security", "secure SDLC", "vulnerability management", "security training", "threat modelling"],
      dailyTasks: ["Lead AppSec programme", "Manage vulnerability backlog", "Train developers", "Define secure coding standards", "Review critical code"],
      growthOutlook: "high",
    },
    {
      id: "offensive-security-engineer",
      title: "Offensive Security Engineer",
      emoji: "⚔️",
      description: "Conduct penetration testing, red team operations, and adversarial simulations to identify and exploit security weaknesses before attackers do.",
      avgSalary: "700,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's in CS/Security + OSCP/OSCE certifications",
      keySkills: ["penetration testing", "red teaming", "exploit development", "social engineering", "security tools"],
      dailyTasks: ["Conduct penetration tests", "Run red team operations", "Write detailed findings reports", "Develop exploits", "Present to security leadership"],
      growthOutlook: "high",
    },
    {
      id: "senior-network-architect",
      title: "Senior Network Architect",
      emoji: "🌐",
      description: "Design large-scale enterprise network architectures spanning campus, WAN, cloud connectivity, and security segmentation.",
      avgSalary: "750,000 - 1,150,000 kr/year",
      educationPath: "Bachelor's in IT/EE + CCIE/JNCIE certifications",
      keySkills: ["network architecture", "SD-WAN", "cloud networking", "network security", "capacity planning"],
      dailyTasks: ["Design network architectures", "Plan SD-WAN and cloud connectivity", "Set network standards", "Review designs", "Lead network strategy"],
      growthOutlook: "high",
    },
    {
      id: "systems-architect",
      title: "Systems Architect",
      emoji: "🏛️",
      description: "Design end-to-end systems spanning hardware, software, networking, and integrations for complex enterprise environments.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Engineering + 10+ years systems experience",
      keySkills: ["systems thinking", "integration architecture", "performance engineering", "technical leadership", "vendor evaluation"],
      dailyTasks: ["Design end-to-end systems", "Evaluate technology platforms", "Lead architecture reviews", "Define integration patterns", "Guide implementation teams"],
      growthOutlook: "high",
    },
    {
      id: "senior-data-engineer",
      title: "Senior Data Engineer",
      emoji: "🔀",
      description: "Lead data platform engineering efforts designing scalable data pipelines, warehouses, and real-time streaming architectures.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 5+ years data engineering experience",
      keySkills: ["data architecture", "streaming systems", "data quality", "Spark/Flink", "cloud data platforms"],
      dailyTasks: ["Design data architectures", "Build streaming pipelines", "Ensure data quality", "Mentor data engineers", "Optimise data platform costs"],
      growthOutlook: "high",
    },
    {
      id: "machine-learning-engineer",
      title: "Machine Learning Engineer",
      emoji: "🧠",
      description: "Build, train, and deploy machine learning models at scale, bridging research and production ML systems.",
      avgSalary: "650,000 - 1,050,000 kr/year",
      educationPath: "Master's in CS/ML/Statistics + ML engineering experience",
      keySkills: ["PyTorch/TensorFlow", "model training", "feature engineering", "ML pipelines", "model optimisation"],
      dailyTasks: ["Train and evaluate ML models", "Build feature pipelines", "Deploy models to production", "Monitor model performance", "Optimise inference latency"],
      growthOutlook: "high",
    },
    {
      id: "applied-ai-engineer",
      title: "Applied AI Engineer",
      emoji: "🤖",
      description: "Build practical AI-powered products and features using LLMs, RAG, agents, and generative AI in production applications.",
      avgSalary: "650,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + Applied AI experience",
      keySkills: ["LLM APIs", "RAG patterns", "prompt engineering", "AI agents", "evaluation frameworks"],
      dailyTasks: ["Build LLM-powered features", "Implement RAG pipelines", "Evaluate AI outputs", "Design AI agent architectures", "Implement safety guardrails"],
      growthOutlook: "high",
    },
    {
      id: "ai-network-engineer",
      title: "AI Infrastructure Network Engineer",
      emoji: "🛰️",
      description: "Design and scale high-performance networks for AI training and inference clusters, working with NVIDIA GPUs, InfiniBand, and RDMA fabrics.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS or Network Engineering + GPU/HPC experience",
      keySkills: ["NVIDIA GPU networking", "InfiniBand/RoCE", "NCCL", "data centre fabrics", "low-latency networking"],
      dailyTasks: ["Design GPU cluster topologies", "Tune InfiniBand and RDMA fabrics", "Optimise NCCL collective performance", "Troubleshoot multi-node training", "Plan capacity for AI workloads"],
      growthOutlook: "high",
    },
    {
      id: "computer-vision-engineer",
      title: "Computer Vision Engineer",
      emoji: "👁️",
      description: "Build AI systems that interpret images and video for applications like medical imaging, autonomous vehicles, and industrial inspection.",
      avgSalary: "700,000 - 1,150,000 kr/year",
      educationPath: "Master's in CS/AI + Computer vision specialisation",
      keySkills: ["deep learning", "OpenCV", "PyTorch", "image processing", "model optimisation"],
      dailyTasks: ["Train vision models", "Annotate datasets", "Optimise inference on edge devices", "Evaluate model accuracy", "Integrate with hardware"],
      growthOutlook: "high",
    },
    {
      id: "nlp-engineer",
      title: "NLP Engineer",
      emoji: "💬",
      description: "Build natural language processing systems for translation, search, summarisation, and conversational AI using modern language models.",
      avgSalary: "700,000 - 1,150,000 kr/year",
      educationPath: "Master's in CS/Computational Linguistics + NLP experience",
      keySkills: ["transformers", "tokenisation", "fine-tuning LLMs", "Python", "evaluation metrics"],
      dailyTasks: ["Fine-tune language models", "Build text pipelines", "Evaluate NLP outputs", "Curate training data", "Ship multilingual features"],
      growthOutlook: "high",
    },
    {
      id: "ai-product-manager",
      title: "AI Product Manager",
      emoji: "🧭",
      description: "Define and ship AI-powered products, balancing technical feasibility, user value, and responsible AI considerations.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in CS/Business + Product management + AI literacy",
      keySkills: ["product strategy", "ML fundamentals", "user research", "evaluation design", "stakeholder communication"],
      dailyTasks: ["Define AI product roadmap", "Scope model requirements", "Run user research", "Coordinate with ML teams", "Track quality metrics"],
      growthOutlook: "high",
    },
    {
      id: "ai-safety-researcher",
      title: "AI Safety & Ethics Researcher",
      emoji: "🛡️",
      description: "Research and mitigate risks from AI systems, working on alignment, fairness, evaluation, and responsible deployment.",
      avgSalary: "800,000 - 1,300,000 kr/year",
      educationPath: "Master's/PhD in CS, ML, or Ethics + Research experience",
      keySkills: ["ML research", "red-teaming", "evaluation design", "policy awareness", "scientific writing"],
      dailyTasks: ["Run model evaluations", "Design red-team tests", "Publish research", "Advise product teams on risks", "Develop safety guidelines"],
      growthOutlook: "high",
    },
    {
      id: "senior-data-scientist",
      title: "Senior Data Scientist",
      emoji: "📊",
      description: "Lead data science projects delivering actionable insights, predictive models, and experimentation frameworks for business decision-making.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Master's/PhD in Statistics, Data Science, or related field",
      keySkills: ["statistical modelling", "experimentation", "Python/R", "machine learning", "stakeholder communication"],
      dailyTasks: ["Design experiments and A/B tests", "Build predictive models", "Present insights to leadership", "Mentor junior data scientists", "Define data science strategy"],
      growthOutlook: "high",
    },
    {
      id: "principal-data-scientist",
      title: "Principal Data Scientist",
      emoji: "📊",
      description: "Set data science strategy and methodology across the organisation, tackling the most complex analytical challenges.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "PhD in Statistics/ML + 10+ years data science experience",
      keySkills: ["advanced statistics", "causal inference", "research leadership", "cross-team influence", "technical strategy"],
      dailyTasks: ["Set data science methodology", "Advise on complex problems", "Review model approaches", "Mentor senior data scientists", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "quantitative-analyst",
      title: "Quantitative Analyst",
      emoji: "📈",
      description: "Develop mathematical models for financial trading, risk assessment, and pricing using advanced statistics and programming.",
      avgSalary: "800,000 - 1,400,000 kr/year",
      educationPath: "Master's/PhD in Mathematics, Physics, or Quantitative Finance",
      keySkills: ["mathematical modelling", "stochastic calculus", "Python/C++", "statistical analysis", "financial markets"],
      dailyTasks: ["Develop pricing models", "Analyse market data", "Backtest trading strategies", "Validate risk models", "Write research papers"],
      growthOutlook: "high",
    },
    {
      id: "quant-developer",
      title: "Quant Developer",
      emoji: "💹",
      description: "Build high-performance trading systems and quantitative tools implementing mathematical models in production environments.",
      avgSalary: "800,000 - 1,400,000 kr/year",
      educationPath: "Master's in CS/Mathematics + Low-latency systems experience",
      keySkills: ["C++/Python", "low-latency systems", "financial models", "distributed computing", "performance optimisation"],
      dailyTasks: ["Implement trading algorithms", "Optimise system latency", "Build quantitative tools", "Integrate market data feeds", "Collaborate with quant researchers"],
      growthOutlook: "high",
    },
    {
      id: "decision-science-lead",
      title: "Decision Science Lead",
      emoji: "🎯",
      description: "Lead decision science teams using data, analytics, and experimentation to drive strategic business decisions and operational optimisation.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Master's/PhD in Statistics, Economics, or Operations Research",
      keySkills: ["causal inference", "experimentation", "optimisation", "stakeholder influence", "team leadership"],
      dailyTasks: ["Design decision frameworks", "Lead experimentation programmes", "Present insights to executives", "Mentor analysts", "Define analytics strategy"],
      growthOutlook: "high",
    },
    {
      id: "engineering-manager",
      title: "Engineering Manager",
      emoji: "👥",
      description: "Lead a software engineering team, combining people management with technical guidance to deliver high-quality products.",
      avgSalary: "750,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 5+ years engineering + leadership experience",
      keySkills: ["people management", "technical leadership", "hiring", "project delivery", "team development"],
      dailyTasks: ["One-on-ones with engineers", "Sprint planning and delivery", "Hiring and onboarding", "Technical decision-making", "Cross-team coordination"],
      growthOutlook: "high",
    },
    {
      id: "senior-engineering-manager",
      title: "Senior Engineering Manager",
      emoji: "👥",
      description: "Manage multiple engineering teams or a larger organisation, setting technical direction and growing engineering leaders.",
      avgSalary: "900,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 8+ years engineering + management experience",
      keySkills: ["org design", "technical strategy", "leadership development", "cross-org collaboration", "delivery excellence"],
      dailyTasks: ["Lead multiple teams", "Develop engineering managers", "Set technical strategy", "Drive organisational health", "Coordinate cross-team delivery"],
      growthOutlook: "high",
    },
    {
      id: "director-of-engineering",
      title: "Director of Engineering",
      emoji: "🏢",
      description: "Lead an engineering department defining technical vision, organisational structure, and engineering culture.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years experience + senior leadership",
      keySkills: ["engineering leadership", "organisational design", "technical vision", "budget management", "executive communication"],
      dailyTasks: ["Set engineering vision", "Lead org design", "Manage department budget", "Report to VP/CTO", "Drive engineering culture"],
      growthOutlook: "high",
    },
    {
      id: "vp-engineering",
      title: "VP Engineering",
      emoji: "🏢",
      description: "Executive responsible for engineering organisation, strategy, delivery, and talent across multiple product lines.",
      avgSalary: "1,400,000 - 2,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 15+ years experience + executive leadership",
      keySkills: ["executive leadership", "engineering strategy", "talent management", "board communication", "P&L ownership"],
      dailyTasks: ["Set engineering strategy", "Lead executive meetings", "Drive talent acquisition", "Manage engineering P&L", "Represent engineering to board"],
      growthOutlook: "high",
    },
    {
      id: "head-of-engineering",
      title: "Head of Engineering",
      emoji: "🏢",
      description: "Lead the entire engineering function for a company or business unit, owning technical direction, team structure, and delivery outcomes.",
      avgSalary: "1,200,000 - 2,000,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 12+ years experience + senior leadership",
      keySkills: ["engineering leadership", "technical strategy", "org building", "stakeholder management", "delivery ownership"],
      dailyTasks: ["Own engineering outcomes", "Build and structure teams", "Set technical direction", "Collaborate with product and business", "Drive engineering excellence"],
      growthOutlook: "high",
    },
    {
      id: "technical-director",
      title: "Technical Director",
      emoji: "🎯",
      description: "Set technical direction and standards across engineering teams, making high-stakes technology decisions and guiding architecture.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 12+ years deep technical experience",
      keySkills: ["technical vision", "architecture leadership", "technology evaluation", "engineering standards", "cross-team influence"],
      dailyTasks: ["Set technology direction", "Lead architecture decisions", "Evaluate emerging technologies", "Define engineering standards", "Mentor technical leaders"],
      growthOutlook: "high",
    },
    {
      id: "technology-director",
      title: "Technology Director",
      emoji: "💼",
      description: "Lead technology strategy and operations for a business unit or organisation, aligning technology investments with business goals.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Business + 12+ years technology leadership",
      keySkills: ["technology strategy", "vendor management", "budget ownership", "digital transformation", "stakeholder management"],
      dailyTasks: ["Define technology strategy", "Manage technology budget", "Lead vendor relationships", "Drive digital transformation", "Report to C-suite"],
      growthOutlook: "high",
    },
    {
      id: "cto",
      title: "Chief Technology Officer",
      emoji: "👔",
      description: "Executive responsible for technology vision, engineering strategy, and innovation, reporting to the CEO and board.",
      avgSalary: "1,500,000 - 3,000,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 15+ years experience + executive track",
      keySkills: ["technology vision", "executive leadership", "innovation strategy", "board communication", "talent strategy"],
      dailyTasks: ["Set technology vision", "Lead executive team", "Drive innovation strategy", "Present to board", "Recruit technology leaders"],
      growthOutlook: "high",
    },
    {
      id: "chief-digital-officer",
      title: "Chief Digital Officer",
      emoji: "📱",
      description: "Executive driving digital transformation strategy, overseeing digital products, channels, and customer experience across the organisation.",
      avgSalary: "1,400,000 - 2,500,000 kr/year",
      educationPath: "Master's in Business/Technology + 15+ years digital leadership",
      keySkills: ["digital strategy", "transformation leadership", "product vision", "customer experience", "data-driven culture"],
      dailyTasks: ["Set digital strategy", "Lead digital transformation", "Own digital products", "Drive data-driven culture", "Report to CEO/board"],
      growthOutlook: "high",
    },
    {
      id: "senior-product-manager",
      title: "Senior Product Manager",
      emoji: "📱",
      description: "Own product strategy and roadmap for a key product area, leading cross-functional teams to deliver business outcomes.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's in CS/Business + 5+ years product management",
      keySkills: ["product strategy", "roadmap planning", "user research", "data analysis", "stakeholder management"],
      dailyTasks: ["Define product strategy", "Prioritise roadmap", "Analyse user data", "Lead cross-functional team", "Present to stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "principal-product-manager",
      title: "Principal Product Manager",
      emoji: "📱",
      description: "Lead product strategy across multiple product lines, defining vision and influencing company-wide product direction.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Business + 10+ years product management",
      keySkills: ["product vision", "cross-product strategy", "market analysis", "executive influence", "team development"],
      dailyTasks: ["Set cross-product vision", "Advise product managers", "Lead strategic initiatives", "Analyse market trends", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "group-product-manager",
      title: "Group Product Manager",
      emoji: "📋",
      description: "Manage a group of product managers and their product areas, ensuring alignment with business strategy and coordinating cross-product initiatives.",
      avgSalary: "900,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's + 8+ years product management + leadership",
      keySkills: ["product leadership", "people management", "portfolio strategy", "cross-functional coordination", "business metrics"],
      dailyTasks: ["Lead PM team", "Align product portfolio", "Coordinate cross-product work", "Develop product managers", "Own product metrics"],
      growthOutlook: "high",
    },
    {
      id: "director-of-product",
      title: "Director of Product",
      emoji: "🎯",
      description: "Lead the product function for a major business area, defining product vision and building high-performing product teams.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years product experience + leadership",
      keySkills: ["product vision", "team building", "business strategy", "market analysis", "executive communication"],
      dailyTasks: ["Set product vision", "Build and lead PM teams", "Own business outcomes", "Present to executives", "Drive product culture"],
      growthOutlook: "high",
    },
    {
      id: "vp-product",
      title: "VP Product",
      emoji: "🏢",
      description: "Executive leading the product organisation, responsible for product strategy, team structure, and product-market fit across all products.",
      avgSalary: "1,400,000 - 2,200,000 kr/year",
      educationPath: "Bachelor's/Master's + 15+ years product + executive leadership",
      keySkills: ["product strategy", "executive leadership", "market vision", "org design", "P&L ownership"],
      dailyTasks: ["Own product strategy", "Lead product organisation", "Drive product-market fit", "Report to CEO/board", "Set product culture"],
      growthOutlook: "high",
    },
    {
      id: "head-of-product",
      title: "Head of Product",
      emoji: "🎯",
      description: "Own the entire product function, defining strategy, building teams, and ensuring products drive business growth.",
      avgSalary: "1,200,000 - 2,000,000 kr/year",
      educationPath: "Bachelor's/Master's + 12+ years product + senior leadership",
      keySkills: ["product leadership", "business strategy", "team building", "customer insight", "market positioning"],
      dailyTasks: ["Own product outcomes", "Set product strategy", "Build product teams", "Align with business goals", "Drive customer-centric culture"],
      growthOutlook: "high",
    },
    {
      id: "product-strategy-lead",
      title: "Product Strategy Lead",
      emoji: "📊",
      description: "Define and drive product strategy through market research, competitive analysis, and strategic planning for product portfolio decisions.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Master's in Business/Strategy + Product strategy experience",
      keySkills: ["strategic analysis", "market research", "competitive intelligence", "business modelling", "executive communication"],
      dailyTasks: ["Conduct market analysis", "Define product strategy", "Build business cases", "Advise product leaders", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "game-director",
      title: "Game Director",
      emoji: "🎮",
      description: "Lead the creative and technical vision for game development projects, directing gameplay, narrative, and art direction.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's in Game Design/CS + 10+ years game development",
      keySkills: ["game design vision", "team leadership", "creative direction", "project management", "player psychology"],
      dailyTasks: ["Set game vision and direction", "Lead design reviews", "Coordinate art, design, and engineering", "Playtest and iterate", "Present to studio leadership"],
      growthOutlook: "medium",
    },
    {
      id: "technical-director-gaming",
      title: "Gaming Technical Director",
      emoji: "🎮",
      description: "Lead technical strategy and engineering for game studios, making engine, tool, and infrastructure decisions for game development.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years game engineering",
      keySkills: ["game engine expertise", "graphics programming", "performance optimisation", "technical leadership", "tool development"],
      dailyTasks: ["Set technical direction for studio", "Lead engine/tool decisions", "Solve complex technical problems", "Mentor engineering team", "Optimise game performance"],
      growthOutlook: "medium",
    },
    {
      id: "studio-director",
      title: "Studio Director",
      emoji: "🎬",
      description: "Lead an entire game or creative studio, managing the business, creative vision, and team to deliver successful products.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Bachelor's + 12+ years game/creative industry + studio leadership",
      keySkills: ["studio management", "P&L ownership", "creative vision", "team leadership", "publisher relations"],
      dailyTasks: ["Manage studio operations", "Set creative and business direction", "Lead studio team", "Manage publisher relationships", "Oversee project portfolio"],
      growthOutlook: "medium",
    },
    {
      id: "platform-director-media",
      title: "Streaming Platform Director",
      emoji: "📺",
      description: "Lead platform strategy and engineering for media and streaming products, ensuring scalable content delivery and user experience.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years platform/media experience",
      keySkills: ["platform strategy", "streaming architecture", "content delivery", "user experience", "scale engineering"],
      dailyTasks: ["Set platform strategy", "Lead engineering teams", "Drive platform reliability", "Optimise streaming quality", "Coordinate with content teams"],
      growthOutlook: "high",
    },
    {
      id: "product-director-consumer",
      title: "Consumer Product Director",
      emoji: "📱",
      description: "Lead product strategy for consumer-facing platforms, driving user growth, engagement, and retention at scale.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years consumer product experience",
      keySkills: ["consumer product strategy", "growth metrics", "user research", "A/B testing", "team leadership"],
      dailyTasks: ["Set consumer product vision", "Drive growth and retention", "Lead product teams", "Analyse user behaviour", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "site-reliability-engineer",
      title: "Production Engineer",
      emoji: "🔧",
      description: "Ensure large-scale systems are reliable, scalable, and efficient by combining software engineering with operations expertise.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in Computer Science or IT + cloud/DevOps experience",
      keySkills: ["Linux/systems administration", "automation", "monitoring", "incident response", "cloud platforms", "scripting"],
      dailyTasks: ["Monitor system health", "Automate infrastructure", "Respond to incidents", "Improve reliability", "Capacity planning"],
      growthOutlook: "high",
    },
    {
      id: "systems-engineer",
      title: "Systems Engineer",
      emoji: "🖥️",
      description: "Design, integrate, and maintain complex computing systems across hardware, software, and networks.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in Computer Science, IT, or Systems Engineering",
      keySkills: ["systems integration", "Linux/Windows", "networking", "scripting", "troubleshooting"],
      dailyTasks: ["Design system architectures", "Integrate hardware and software", "Monitor performance", "Troubleshoot issues", "Document systems"],
      growthOutlook: "high",
    },
    {
      id: "data-analyst",
      title: "Data Analyst",
      emoji: "📊",
      description: "Turn raw data into insights using SQL, spreadsheets, and visualisation tools to support business decisions.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Statistics, Maths, Computer Science, or related field",
      keySkills: ["SQL", "Excel", "data visualisation", "statistics", "business acumen"],
      dailyTasks: ["Query databases", "Build dashboards", "Analyse trends", "Present findings", "Support decision-making"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "ai-researcher",
      title: "AI Researcher",
      emoji: "🧠",
      description: "Advance the state of artificial intelligence through experimentation, novel algorithms, and academic publication.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "PhD in Computer Science, Machine Learning, or related field",
      keySkills: ["machine learning theory", "mathematics", "research methodology", "Python", "scientific writing"],
      dailyTasks: ["Design experiments", "Develop new models", "Publish papers", "Read literature", "Collaborate with peers"],
      growthOutlook: "high",
    },
    {
      id: "robotics-engineer",
      title: "Robotics Engineer",
      emoji: "🤖",
      description: "Design, build, and program robotic systems for industry, research, and consumer applications.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's/Master's in Robotics, Mechatronics, or Electrical Engineering",
      keySkills: ["robotics", "C++/Python", "control systems", "ROS", "mechanical design"],
      dailyTasks: ["Design robotic systems", "Program controllers", "Test prototypes", "Integrate sensors", "Debug hardware"],
      growthOutlook: "high",
    },
    {
      id: "test-automation-engineer",
      title: "Test Automation Engineer",
      emoji: "🧪",
      description: "Build automated test suites and frameworks to ensure software quality at scale.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Computer Science or equivalent experience",
      keySkills: ["test automation", "Selenium/Cypress", "CI/CD", "scripting", "QA methodology"],
      dailyTasks: ["Write automated tests", "Maintain test frameworks", "Integrate tests into CI", "Report bugs", "Collaborate with developers"],
      growthOutlook: "high",
    },
    {
      id: "technical-architect",
      title: "Technical Architect",
      emoji: "🏛️",
      description: "Define the technical vision and architecture for software projects, balancing trade-offs across systems.",
      avgSalary: "950,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's in Computer Science + 8+ years engineering experience",
      keySkills: ["software architecture", "system design", "cloud platforms", "leadership", "technical strategy"],
      dailyTasks: ["Design system architectures", "Review technical decisions", "Mentor engineers", "Evaluate technologies", "Document standards"],
      growthOutlook: "high",
    },
    {
      id: "product-manager",
      title: "Product Manager",
      emoji: "📋",
      description: "Own the product vision, prioritise the roadmap, and work with engineering, design, and stakeholders to ship features users love.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Business, Computer Science, or related field",
      keySkills: ["product strategy", "user research", "prioritisation", "communication", "data analysis"],
      dailyTasks: ["Define roadmap", "Talk to users", "Write specs", "Coordinate teams", "Measure outcomes"],
      growthOutlook: "high",
    },
    {
      id: "ui-designer",
      title: "UI Designer",
      emoji: "🎨",
      description: "Craft the visual interface of digital products — layouts, components, colours, and typography.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Design or self-taught with portfolio",
      keySkills: ["visual design", "Figma", "typography", "design systems", "attention to detail"],
      dailyTasks: ["Design interfaces", "Build component libraries", "Iterate on mockups", "Hand off to developers", "Maintain design systems"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "ux-researcher",
      title: "UX Researcher",
      emoji: "🔍",
      description: "Study how users behave and what they need through interviews, usability tests, and data to guide product decisions.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's/Master's in Psychology, HCI, or related field",
      keySkills: ["user interviews", "usability testing", "research methods", "synthesis", "communication"],
      dailyTasks: ["Plan studies", "Interview users", "Run usability tests", "Analyse findings", "Present insights"],
      growthOutlook: "high",
    },
    {
      id: "blockchain-developer",
      title: "Blockchain Developer",
      emoji: "⛓️",
      description: "Build decentralised applications, smart contracts, and blockchain infrastructure.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Computer Science + blockchain specialisation",
      keySkills: ["Solidity", "smart contracts", "cryptography", "distributed systems", "Web3"],
      dailyTasks: ["Write smart contracts", "Audit code", "Build dApps", "Integrate wallets", "Deploy to chains"],
      growthOutlook: "medium",
    },
    {
      id: "ar-vr-developer",
      title: "AR and VR Developer",
      emoji: "🥽",
      description: "Build immersive augmented and virtual reality experiences for headsets, mobile, and the web.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in Computer Science, Game Development, or related field",
      keySkills: ["Unity", "Unreal Engine", "C#/C++", "3D maths", "spatial design"],
      dailyTasks: ["Build immersive scenes", "Optimise for headsets", "Integrate sensors", "Test on devices", "Collaborate with designers"],
      growthOutlook: "high",
    },
    { id: "app-developer", title: "App Developer", emoji: "📱", description: "Build mobile apps for iOS and Android — designing features, writing code, and shipping to app stores.", avgSalary: "650,000 - 1,100,000 kr/year", educationPath: "Bachelor's in CS or self-taught with strong portfolio", keySkills: ["Swift / Kotlin", "React Native / Flutter", "UI design", "APIs", "testing"], dailyTasks: ["Write features", "Fix bugs", "Test on devices", "Ship updates", "Read crash reports"], growthOutlook: "high", entryLevel: true },
    { id: "web-developer", title: "Web Developer", emoji: "🌐", description: "Build websites and web apps — from landing pages to complex platforms — using HTML, CSS, JavaScript and frameworks.", avgSalary: "550,000 - 1,000,000 kr/year", educationPath: "Bachelor's in CS or self-taught with strong portfolio", keySkills: ["HTML/CSS", "JavaScript", "React or Vue", "responsive design", "performance"], dailyTasks: ["Build pages", "Write code", "Fix bugs", "Test browsers", "Deploy updates"], growthOutlook: "high", entryLevel: true },
  ],

  // ========================================
  // BUSINESS, MANAGEMENT & ADMINISTRATION
  // ========================================
  BUSINESS_MANAGEMENT: [
    {
      id: "project-manager",
      title: "Project Manager",
      emoji: "📋",
      description: "Plan, execute, and deliver projects on time and within budget across various industries.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Business + PMP or PRINCE2 certification",
      keySkills: ["leadership", "organisation", "communication", "risk management", "stakeholder management"],
      dailyTasks: ["Plan projects", "Coordinate teams", "Track progress", "Manage budgets", "Report to stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "hr-specialist",
      title: "HR Specialist",
      emoji: "👥",
      description: "Manage recruitment, employee relations, and organisational development.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Bachelor's in HR, Business, or Psychology",
      keySkills: ["communication", "empathy", "organisation", "conflict resolution", "legal knowledge"],
      dailyTasks: ["Recruit candidates", "Onboard employees", "Handle HR issues", "Develop policies"],
      growthOutlook: "stable",
    },
    {
      id: "management-consultant",
      title: "Management Consultant",
      emoji: "💼",
      description: "Advise organisations on strategy, operations, and business improvement.",
      avgSalary: "600,000 - 1,200,000 kr/year",
      educationPath: "Master's in Business (MBA) or related field",
      keySkills: ["analytical thinking", "problem-solving", "presentation", "client management", "business acumen"],
      dailyTasks: ["Analyse business problems", "Develop recommendations", "Present to clients", "Implement changes"],
      growthOutlook: "high",
    },
    {
      id: "office-administrator",
      title: "Office Administrator",
      emoji: "🗂️",
      description: "Manage daily office operations, schedules, and administrative tasks.",
      avgSalary: "380,000 - 500,000 kr/year",
      educationPath: "Vocational training or Bachelor's in Administration",
      keySkills: ["organisation", "communication", "multitasking", "computer skills", "attention to detail"],
      dailyTasks: ["Manage schedules", "Handle correspondence", "Organise meetings", "Maintain records"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "business-analyst",
      title: "Business Analyst",
      emoji: "📈",
      description: "Analyse business processes and data to improve efficiency and inform decisions.",
      avgSalary: "520,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Business, IT, or Economics",
      keySkills: ["analytical thinking", "data analysis", "communication", "process mapping", "stakeholder management"],
      dailyTasks: ["Gather requirements", "Analyse processes", "Create reports", "Propose improvements"],
      growthOutlook: "high",
    },
    {
      id: "executive-assistant",
      title: "Executive Assistant",
      emoji: "📱",
      description: "Support senior executives with scheduling, communication, and administrative tasks.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Business or extensive experience",
      keySkills: ["organisation", "discretion", "communication", "time management", "adaptability"],
      dailyTasks: ["Manage calendars", "Coordinate travel", "Prepare documents", "Handle confidential matters"],
      growthOutlook: "stable",
    },
    {
      id: "lawyer",
      title: "Lawyer",
      emoji: "⚖️",
      description: "Provide legal advice, represent clients in court, and draft legal documents.",
      avgSalary: "600,000 - 1,200,000 kr/year",
      educationPath: "Master of Law (5 years) + 2 years practice + Bar admission",
      keySkills: ["legal knowledge", "analytical thinking", "communication", "negotiation", "research"],
      dailyTasks: ["Advise clients", "Draft contracts", "Represent in court", "Research case law", "Negotiate settlements"],
      growthOutlook: "stable",
    },
    {
      id: "police-officer",
      title: "Police Officer",
      emoji: "👮",
      description: "Maintain public safety, enforce laws, investigate crimes, and assist communities across Norway. In Norway, police officers must complete a 3-year bachelor's degree at Politihøgskolen (Police University College) in Oslo, Stavern, or Bodø. Entry is highly competitive with strict physical, academic, and character requirements.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Politihøgskolen — 3-year Bachelor's in Police Studies",
      keySkills: ["law enforcement", "communication", "physical fitness", "conflict resolution", "decision-making", "Norwegian law"],
      dailyTasks: ["Patrol assigned districts", "Respond to emergency calls", "Investigate criminal cases", "Write reports and statements", "Community outreach"],
      growthOutlook: "stable",
      pathType: "police",
    },
    {
      id: "firefighter",
      title: "Firefighter",
      emoji: "🚒",
      description: "Respond to fires, accidents, and emergencies across Norway. Norwegian firefighters train through the Norges brannskole (Norwegian Fire Academy) in Tjeldsund. Many fire departments also require EMT/first responder certification. The role combines rescue work, fire suppression, hazmat response, and public education.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Norges brannskole (1 year) + fagbrev or relevant technical background",
      keySkills: ["physical fitness", "teamwork", "calm under pressure", "technical rescue", "first aid", "hazmat awareness"],
      dailyTasks: ["Respond to fire and rescue calls", "Maintain equipment and vehicles", "Conduct fire drills", "Inspect buildings for safety", "Train with new techniques"],
      growthOutlook: "stable",
      pathType: "firefighter",
    },
    {
      id: "social-worker",
      title: "Social Worker",
      emoji: "🤝",
      description: "Help individuals and families cope with challenges, access services, and improve their lives.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Social Work (3 years)",
      keySkills: ["empathy", "communication", "case management", "advocacy", "crisis intervention"],
      dailyTasks: ["Meet with clients", "Assess needs", "Develop care plans", "Connect to services", "Document cases"],
      growthOutlook: "high",
    },
    {
      id: "environmental-scientist",
      title: "Environmental Scientist",
      emoji: "🌍",
      description: "Study environmental problems and develop solutions for pollution, conservation, and sustainability.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's/Master's in Environmental Science",
      keySkills: ["environmental knowledge", "data analysis", "research", "report writing", "field work"],
      dailyTasks: ["Collect samples", "Analyse environmental data", "Write reports", "Advise on regulations", "Conduct field studies"],
      growthOutlook: "high",
    },
    {
      id: "program-director",
      title: "Program Director",
      emoji: "📋",
      description: "Direct large-scale programmes with multiple projects, managing interdependencies, budgets, and senior stakeholder relationships.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Business/Technology + PMP/MSP + 10+ years programme experience",
      keySkills: ["programme management", "stakeholder management", "budget ownership", "risk management", "executive reporting"],
      dailyTasks: ["Direct programme delivery", "Manage interdependencies", "Report to executives", "Manage programme budget", "Resolve escalations"],
      growthOutlook: "high",
    },
    {
      id: "transformation-director",
      title: "Transformation Director",
      emoji: "🔄",
      description: "Lead enterprise-wide transformation programmes driving business change, process improvement, and organisational redesign.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's in Business + 12+ years transformation experience",
      keySkills: ["transformation leadership", "change management", "business strategy", "org redesign", "executive influence"],
      dailyTasks: ["Lead transformation programmes", "Drive change management", "Align stakeholders", "Measure business outcomes", "Present to C-suite"],
      growthOutlook: "high",
    },
    {
      id: "digital-transformation-lead",
      title: "Digital Transformation Lead",
      emoji: "💡",
      description: "Lead digital transformation initiatives modernising business processes, customer experiences, and technology platforms.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in Business/Technology + Digital transformation experience",
      keySkills: ["digital strategy", "process automation", "customer experience", "agile delivery", "data-driven decisions"],
      dailyTasks: ["Lead digital initiatives", "Identify automation opportunities", "Drive CX improvements", "Measure transformation impact", "Coordinate cross-functional teams"],
      growthOutlook: "high",
    },
    {
      id: "technology-transformation-lead",
      title: "Technology Transformation Lead",
      emoji: "⚡",
      description: "Lead technology platform modernisation and migration programmes, moving organisations from legacy to modern architectures.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years technology + transformation experience",
      keySkills: ["platform modernisation", "migration planning", "technical leadership", "change management", "vendor management"],
      dailyTasks: ["Lead technology modernisation", "Plan platform migrations", "Manage vendor relationships", "Coordinate engineering teams", "Track transformation KPIs"],
      growthOutlook: "high",
    },
    {
      id: "portfolio-director",
      title: "Portfolio Director",
      emoji: "📊",
      description: "Manage a portfolio of programmes and projects, optimising resource allocation and ensuring strategic alignment with business objectives.",
      avgSalary: "1,100,000 - 1,700,000 kr/year",
      educationPath: "Master's in Business + PfMP/MoP certification + 12+ years experience",
      keySkills: ["portfolio management", "strategic alignment", "resource optimisation", "executive reporting", "investment decisions"],
      dailyTasks: ["Manage project portfolio", "Optimise resource allocation", "Ensure strategic alignment", "Report portfolio health", "Make investment decisions"],
      growthOutlook: "high",
    },
    {
      id: "delivery-director",
      title: "Delivery Director",
      emoji: "🚀",
      description: "Lead delivery teams ensuring projects and programmes are delivered on time, on budget, and to quality standards.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years delivery management + leadership",
      keySkills: ["delivery leadership", "agile/waterfall", "team management", "client management", "quality assurance"],
      dailyTasks: ["Lead delivery teams", "Manage client relationships", "Ensure delivery quality", "Resolve blockers", "Report delivery metrics"],
      growthOutlook: "high",
    },
    {
      id: "senior-project-director",
      title: "Senior Project Director",
      emoji: "📋",
      description: "Direct the largest and most complex projects, managing multi-million budgets, executive stakeholders, and cross-functional teams.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's + PMP/PRINCE2 Practitioner + 12+ years project leadership",
      keySkills: ["large programme delivery", "executive stakeholder management", "budget management", "risk management", "team leadership"],
      dailyTasks: ["Direct complex projects", "Manage executive stakeholders", "Own project budgets", "Lead cross-functional teams", "Report to steering committee"],
      growthOutlook: "high",
    },
    {
      id: "senior-management-consultant",
      title: "Senior Management Consultant",
      emoji: "💼",
      description: "Lead consulting engagements advising C-suite clients on strategy, operations, and transformation with hands-on delivery.",
      avgSalary: "800,000 - 1,400,000 kr/year",
      educationPath: "Master's (MBA preferred) + 5+ years consulting experience",
      keySkills: ["strategic analysis", "client management", "problem structuring", "presentation", "team leadership"],
      dailyTasks: ["Lead client engagements", "Structure complex problems", "Present to C-suite", "Manage project delivery", "Develop junior consultants"],
      growthOutlook: "high",
    },
    {
      id: "strategy-consultant",
      title: "Strategy Consultant",
      emoji: "🎯",
      description: "Advise organisations on corporate and business unit strategy including market entry, growth, M&A, and competitive positioning.",
      avgSalary: "700,000 - 1,300,000 kr/year",
      educationPath: "Master's (MBA or Economics) + Strategy consulting experience",
      keySkills: ["strategic thinking", "financial modelling", "market analysis", "presentation", "hypothesis-driven problem solving"],
      dailyTasks: ["Analyse markets and competitors", "Build strategic frameworks", "Model financial scenarios", "Present recommendations", "Workshop with leadership"],
      growthOutlook: "high",
    },
    {
      id: "principal-consultant",
      title: "Principal Consultant",
      emoji: "💼",
      description: "Lead major consulting engagements as the senior subject matter expert, managing client relationships and engagement delivery.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's + 10+ years consulting + deep domain expertise",
      keySkills: ["engagement leadership", "subject matter expertise", "business development", "client relationship", "thought leadership"],
      dailyTasks: ["Lead complex engagements", "Manage senior client relationships", "Contribute to business development", "Publish thought leadership", "Mentor consultants"],
      growthOutlook: "high",
    },
    {
      id: "consulting-partner",
      title: "Consulting Partner",
      emoji: "🤝",
      description: "Own a consulting practice area, responsible for client relationships, revenue targets, team growth, and market positioning.",
      avgSalary: "1,500,000 - 3,000,000+ kr/year",
      educationPath: "Master's (MBA preferred) + 15+ years consulting + partnership track",
      keySkills: ["business development", "practice leadership", "client relationships", "market positioning", "team building"],
      dailyTasks: ["Win new business", "Manage key client accounts", "Lead practice strategy", "Develop consulting talent", "Shape market positioning"],
      growthOutlook: "high",
    },
    {
      id: "independent-consultant",
      title: "Independent Consultant",
      emoji: "🧭",
      description: "Provide expert consulting services as an independent advisor, managing your own practice, clients, and engagements.",
      avgSalary: "800,000 - 2,000,000+ kr/year",
      educationPath: "Bachelor's/Master's + 10+ years domain expertise + entrepreneurial drive",
      keySkills: ["domain expertise", "business development", "client management", "adaptability", "self-management"],
      dailyTasks: ["Deliver client engagements", "Win new business", "Manage your practice", "Network and market yourself", "Stay current in domain"],
      growthOutlook: "high",
    },
    {
      id: "transformation-consultant",
      title: "Transformation Consultant",
      emoji: "🔄",
      description: "Advise organisations on large-scale business and technology transformations, from strategy through to implementation.",
      avgSalary: "800,000 - 1,400,000 kr/year",
      educationPath: "Master's in Business/Technology + Transformation consulting experience",
      keySkills: ["transformation strategy", "change management", "process redesign", "stakeholder engagement", "programme delivery"],
      dailyTasks: ["Assess transformation readiness", "Design target operating models", "Lead change workstreams", "Track transformation KPIs", "Coach client leaders"],
      growthOutlook: "high",
    },
    {
      id: "technology-strategy-consultant",
      title: "Technology Strategy Consultant",
      emoji: "💻",
      description: "Advise executives on technology strategy, IT operating models, and technology-enabled business transformation.",
      avgSalary: "800,000 - 1,400,000 kr/year",
      educationPath: "Master's in CS/Business + Technology strategy consulting experience",
      keySkills: ["technology strategy", "IT operating models", "vendor evaluation", "business case development", "executive advisory"],
      dailyTasks: ["Assess technology landscapes", "Define technology strategies", "Evaluate vendors", "Build business cases", "Present to CIOs/CTOs"],
      growthOutlook: "high",
    },
    {
      id: "enterprise-systems-consultant",
      title: "Enterprise Systems Consultant",
      emoji: "🏗️",
      description: "Advise on selection, implementation, and optimisation of enterprise systems such as ERP, CRM, and HCM platforms.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Business + Enterprise platform certifications",
      keySkills: ["enterprise platforms", "implementation methodology", "business process", "data migration", "change management"],
      dailyTasks: ["Advise on platform selection", "Lead implementation workstreams", "Configure enterprise systems", "Manage data migration", "Train end users"],
      growthOutlook: "high",
    },
    {
      id: "erp-transformation-lead",
      title: "ERP Transformation Lead",
      emoji: "🔗",
      description: "Lead enterprise resource planning transformations migrating organisations to modern ERP platforms like SAP S/4HANA or Oracle Cloud.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's/Master's + SAP/Oracle certifications + ERP programme experience",
      keySkills: ["ERP platforms", "business process redesign", "data migration", "change management", "programme management"],
      dailyTasks: ["Lead ERP programme delivery", "Coordinate business process redesign", "Manage data migration", "Drive change adoption", "Report to steering committee"],
      growthOutlook: "high",
    },
    {
      id: "oss-bss-transformation-lead",
      title: "Telecom Transformation Lead",
      emoji: "📡",
      description: "Lead telecom OSS/BSS transformation programmes modernising operations and business support systems for telco operators.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's/Master's + TM Forum knowledge + Telco transformation experience",
      keySkills: ["OSS/BSS platforms", "TM Forum standards", "programme management", "vendor management", "telco operations"],
      dailyTasks: ["Lead OSS/BSS modernisation", "Manage vendor delivery", "Align with TM Forum standards", "Coordinate business and IT", "Report to programme board"],
      growthOutlook: "high",
    },
    {
      id: "fractional-cto",
      title: "Fractional CTO",
      emoji: "👔",
      description: "Serve as a part-time CTO for multiple companies, providing senior technology leadership to startups and scale-ups that need strategic guidance.",
      avgSalary: "800,000 - 2,000,000+ kr/year",
      educationPath: "Bachelor's/Master's in CS + CTO/VP Engineering experience + advisory skills",
      keySkills: ["technology strategy", "startup advisory", "architecture guidance", "hiring", "investor communication"],
      dailyTasks: ["Advise multiple companies", "Set technology direction", "Guide architecture decisions", "Help with hiring", "Advise on investor conversations"],
      growthOutlook: "high",
    },
    {
      id: "fractional-cio",
      title: "Fractional CIO",
      emoji: "👔",
      description: "Serve as a part-time CIO for organisations needing senior IT leadership without a full-time executive hire.",
      avgSalary: "800,000 - 2,000,000+ kr/year",
      educationPath: "Master's in Business/IT + CIO experience + advisory skills",
      keySkills: ["IT strategy", "vendor management", "digital transformation", "governance", "executive advisory"],
      dailyTasks: ["Define IT strategy", "Manage vendor relationships", "Guide digital transformation", "Establish IT governance", "Advise multiple organisations"],
      growthOutlook: "high",
    },
    {
      id: "general-manager",
      title: "General Manager",
      emoji: "🏢",
      description: "Lead a business unit or region with full P&L responsibility, managing operations, sales, and teams to deliver business results.",
      avgSalary: "1,000,000 - 1,800,000 kr/year",
      educationPath: "Master's in Business + 12+ years cross-functional leadership",
      keySkills: ["P&L management", "leadership", "strategy", "operations", "commercial acumen"],
      dailyTasks: ["Manage P&L", "Lead business operations", "Set business strategy", "Develop leadership team", "Report to executives"],
      growthOutlook: "stable",
    },
    {
      id: "business-unit-director",
      title: "Business Unit Director",
      emoji: "🏢",
      description: "Lead a distinct business unit owning strategy, P&L, and team to achieve revenue and growth targets.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's in Business + 12+ years industry experience + leadership",
      keySkills: ["business strategy", "P&L ownership", "team leadership", "market development", "operational excellence"],
      dailyTasks: ["Set BU strategy", "Own P&L targets", "Lead leadership team", "Drive market growth", "Report to MD/CEO"],
      growthOutlook: "stable",
    },
    {
      id: "managing-director",
      title: "Managing Director",
      emoji: "👔",
      description: "Lead an entire company or major division with full operational, financial, and strategic responsibility.",
      avgSalary: "1,500,000 - 3,000,000+ kr/year",
      educationPath: "Master's (MBA preferred) + 15+ years senior leadership",
      keySkills: ["executive leadership", "strategy", "P&L management", "board governance", "stakeholder management"],
      dailyTasks: ["Lead company operations", "Set strategic direction", "Manage board relationships", "Drive financial performance", "Build executive team"],
      growthOutlook: "stable",
    },
    {
      id: "country-manager",
      title: "Country Manager",
      emoji: "🌍",
      description: "Lead all operations in a specific country, managing local teams, P&L, and market strategy while aligning with global HQ.",
      avgSalary: "1,200,000 - 2,000,000 kr/year",
      educationPath: "Master's in Business + 10+ years experience + country-level leadership",
      keySkills: ["market leadership", "P&L management", "cultural awareness", "local partnerships", "global alignment"],
      dailyTasks: ["Lead country operations", "Manage local P&L", "Build local partnerships", "Align with global strategy", "Develop local talent"],
      growthOutlook: "stable",
    },
    {
      id: "regional-director",
      title: "Regional Director",
      emoji: "🌐",
      description: "Lead operations across a geographic region, managing country managers and driving regional strategy and growth.",
      avgSalary: "1,300,000 - 2,200,000 kr/year",
      educationPath: "Master's in Business + 12+ years experience + regional leadership",
      keySkills: ["regional strategy", "multi-country management", "P&L ownership", "market expansion", "executive leadership"],
      dailyTasks: ["Set regional strategy", "Lead country managers", "Drive regional P&L", "Expand market presence", "Report to global executives"],
      growthOutlook: "stable",
    },
    {
      id: "operations-director",
      title: "Operations Director",
      emoji: "⚙️",
      description: "Lead operations across the organisation, optimising processes, efficiency, and service delivery.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years operations leadership",
      keySkills: ["operational excellence", "process optimisation", "team leadership", "KPI management", "continuous improvement"],
      dailyTasks: ["Lead operations teams", "Optimise processes", "Drive efficiency improvements", "Manage operational KPIs", "Report to CEO/MD"],
      growthOutlook: "stable",
    },
    {
      id: "head-of-operations",
      title: "Head of Operations",
      emoji: "⚙️",
      description: "Own all operational functions ensuring smooth service delivery, process efficiency, and scalability.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years operations + leadership experience",
      keySkills: ["operations management", "process design", "team leadership", "vendor management", "continuous improvement"],
      dailyTasks: ["Manage daily operations", "Improve process efficiency", "Lead operations teams", "Coordinate with vendors", "Track operational metrics"],
      growthOutlook: "stable",
    },
    {
      id: "corporate-lawyer",
      title: "Corporate Lawyer",
      emoji: "⚖️",
      description: "Provide legal advice on corporate matters including M&A, governance, contracts, and regulatory compliance.",
      avgSalary: "800,000 - 1,500,000 kr/year",
      educationPath: "Master of Law (5 years) + 5+ years corporate law experience",
      keySkills: ["corporate law", "contract drafting", "M&A", "governance", "regulatory compliance"],
      dailyTasks: ["Draft and review contracts", "Advise on corporate governance", "Support M&A transactions", "Ensure regulatory compliance", "Manage external counsel"],
      growthOutlook: "stable",
    },
    {
      id: "senior-legal-counsel",
      title: "Senior Legal Counsel",
      emoji: "⚖️",
      description: "Provide senior legal advice across the organisation, managing complex legal matters and leading junior lawyers.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Master of Law + 8+ years legal experience + specialisation",
      keySkills: ["legal advisory", "risk management", "contract negotiation", "team leadership", "business acumen"],
      dailyTasks: ["Advise on legal matters", "Negotiate complex contracts", "Lead junior lawyers", "Manage legal risk", "Support business decisions"],
      growthOutlook: "stable",
    },
    {
      id: "general-counsel",
      title: "General Counsel",
      emoji: "⚖️",
      description: "Chief legal officer responsible for all legal affairs of the organisation, managing the legal team and external counsel.",
      avgSalary: "1,300,000 - 2,200,000 kr/year",
      educationPath: "Master of Law + 12+ years legal experience + leadership",
      keySkills: ["legal leadership", "corporate governance", "risk management", "M&A", "board advisory"],
      dailyTasks: ["Lead legal function", "Advise board and CEO", "Manage legal risk", "Oversee M&A legal work", "Set legal strategy"],
      growthOutlook: "stable",
    },
    {
      id: "head-of-legal",
      title: "Head of Legal",
      emoji: "⚖️",
      description: "Lead the legal department managing all legal matters, compliance, and governance for the organisation.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master of Law + 10+ years legal experience + department leadership",
      keySkills: ["legal management", "compliance", "governance", "contract management", "team leadership"],
      dailyTasks: ["Manage legal department", "Oversee compliance", "Advise leadership team", "Manage external counsel", "Drive legal strategy"],
      growthOutlook: "stable",
    },
    {
      id: "compliance-director",
      title: "Compliance Director",
      emoji: "📋",
      description: "Lead the compliance function ensuring the organisation meets all regulatory requirements and industry standards.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Master's in Law/Business + Compliance certifications + 10+ years experience",
      keySkills: ["regulatory compliance", "risk management", "audit", "policy development", "stakeholder management"],
      dailyTasks: ["Lead compliance programme", "Manage regulatory relationships", "Conduct compliance assessments", "Develop policies", "Report to board"],
      growthOutlook: "high",
    },
    {
      id: "regulatory-affairs-director",
      title: "Regulatory Affairs Director",
      emoji: "📜",
      description: "Lead regulatory affairs managing relationships with regulators and ensuring products and operations meet regulatory requirements.",
      avgSalary: "1,000,000 - 1,500,000 kr/year",
      educationPath: "Master's in relevant field + Regulatory affairs experience + industry knowledge",
      keySkills: ["regulatory strategy", "regulator relationships", "compliance management", "policy analysis", "industry knowledge"],
      dailyTasks: ["Manage regulator relationships", "Ensure regulatory compliance", "Develop regulatory strategy", "Monitor regulatory changes", "Advise leadership"],
      growthOutlook: "high",
    },
    {
      id: "risk-and-compliance-director",
      title: "Risk and Compliance Director",
      emoji: "🛡️",
      description: "Lead integrated risk and compliance functions, managing enterprise risk frameworks and regulatory compliance programmes.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Law/Business/Finance + Risk management certifications",
      keySkills: ["enterprise risk management", "compliance frameworks", "audit", "governance", "board reporting"],
      dailyTasks: ["Manage risk framework", "Lead compliance programme", "Report to audit committee", "Assess emerging risks", "Drive risk culture"],
      growthOutlook: "high",
    },
    {
      id: "data-protection-officer",
      title: "Data Protection Officer",
      emoji: "🔒",
      description: "Ensure organisational compliance with data protection regulations (GDPR), managing privacy programmes and data subject rights.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Master's in Law/IT + CIPP/CIPM certification + Privacy experience",
      keySkills: ["GDPR", "privacy programme management", "data governance", "risk assessment", "stakeholder education"],
      dailyTasks: ["Manage GDPR compliance", "Conduct DPIAs", "Handle data subject requests", "Advise on privacy matters", "Train the organisation"],
      growthOutlook: "high",
    },
    {
      id: "chief-people-officer",
      title: "Chief People Officer",
      emoji: "👥",
      description: "Executive responsible for people strategy, organisational culture, talent acquisition, and employee experience across the organisation.",
      avgSalary: "1,300,000 - 2,200,000 kr/year",
      educationPath: "Master's in HR/Business/Psychology + 15+ years HR leadership",
      keySkills: ["people strategy", "organisational culture", "talent management", "executive leadership", "change management"],
      dailyTasks: ["Set people strategy", "Drive organisational culture", "Lead talent initiatives", "Advise CEO and board", "Shape employee experience"],
      growthOutlook: "high",
    },
    {
      id: "hr-director",
      title: "HR Director",
      emoji: "👥",
      description: "Lead the HR function managing talent acquisition, people development, compensation, and employee relations.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in HR/Business + 10+ years HR leadership",
      keySkills: ["HR leadership", "talent management", "compensation", "employee relations", "organisational development"],
      dailyTasks: ["Lead HR function", "Manage talent programmes", "Advise leadership", "Drive employee engagement", "Handle complex ER cases"],
      growthOutlook: "stable",
    },
    {
      id: "head-of-talent",
      title: "Head of Talent",
      emoji: "🌟",
      description: "Lead talent acquisition and development strategies, building the employer brand and attracting top talent.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in HR/Business + 8+ years talent management",
      keySkills: ["talent acquisition", "employer branding", "talent development", "succession planning", "HR analytics"],
      dailyTasks: ["Lead talent acquisition", "Build employer brand", "Design development programmes", "Plan succession", "Analyse talent metrics"],
      growthOutlook: "high",
    },
    {
      id: "org-transformation-director",
      title: "Organisational Transformation Director",
      emoji: "🔄",
      description: "Lead organisational transformation designing new operating models, restructuring, and change management at scale.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Business/OD + 10+ years transformation + change management",
      keySkills: ["organisational design", "change management", "operating models", "leadership alignment", "culture change"],
      dailyTasks: ["Design operating models", "Lead org restructuring", "Drive change management", "Align leadership", "Measure transformation outcomes"],
      growthOutlook: "high",
    },
    {
      id: "workforce-strategy-director",
      title: "Workforce Strategy Director",
      emoji: "📊",
      description: "Define workforce strategy including workforce planning, skills development, and future-of-work initiatives.",
      avgSalary: "1,000,000 - 1,500,000 kr/year",
      educationPath: "Master's in HR/Business + Workforce planning expertise",
      keySkills: ["workforce planning", "skills strategy", "future of work", "HR analytics", "strategic thinking"],
      dailyTasks: ["Define workforce strategy", "Lead workforce planning", "Drive skills development", "Analyse workforce data", "Advise executives"],
      growthOutlook: "high",
    },
    {
      id: "independent-contractor-technical",
      title: "Senior Technical Contractor",
      emoji: "🧑‍💻",
      description: "Provide senior technical expertise as an independent contractor, working on complex projects across multiple clients.",
      avgSalary: "800,000 - 1,800,000+ kr/year",
      educationPath: "Bachelor's/Master's in CS + 10+ years technical expertise + ENK/AS registration",
      keySkills: ["deep technical expertise", "self-management", "client management", "adaptability", "business development"],
      dailyTasks: ["Deliver technical work for clients", "Manage client relationships", "Invoice and manage finances", "Network for new opportunities", "Stay current in technology"],
      growthOutlook: "high",
    },
    {
      id: "independent-program-director",
      title: "Independent Program Director",
      emoji: "📋",
      description: "Direct complex programmes as an independent contractor, providing senior programme leadership to multiple organisations.",
      avgSalary: "1,000,000 - 2,000,000+ kr/year",
      educationPath: "Master's + PMP/MSP + 12+ years programme leadership + independent practice",
      keySkills: ["programme leadership", "stakeholder management", "client management", "business development", "self-management"],
      dailyTasks: ["Direct client programmes", "Manage senior stakeholders", "Build client relationships", "Win new engagements", "Manage practice finances"],
      growthOutlook: "high",
    },
    {
      id: "independent-transformation-lead",
      title: "Independent Transformation Lead",
      emoji: "🔄",
      description: "Lead transformation engagements as an independent advisor, bringing senior transformation expertise to client organisations.",
      avgSalary: "900,000 - 2,000,000+ kr/year",
      educationPath: "Master's + 10+ years transformation experience + advisory skills",
      keySkills: ["transformation expertise", "change management", "executive advisory", "business development", "independence"],
      dailyTasks: ["Lead transformation engagements", "Advise client executives", "Design change programmes", "Win new engagements", "Manage practice"],
      growthOutlook: "high",
    },
    {
      id: "programme-manager",
      title: "Programme Manager",
      emoji: "📊",
      description: "Oversee multiple related projects to achieve strategic business objectives, managing dependencies, risks, and stakeholder expectations across programmes.",
      avgSalary: "800,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's in IT or Business + MSP/PgMP certification + 10+ years experience",
      keySkills: ["programme governance", "stakeholder management", "strategic planning", "risk management", "financial oversight", "leadership"],
      dailyTasks: ["Align projects to strategy", "Manage programme risks", "Report to steering committees", "Coordinate project managers", "Drive benefits realisation"],
      growthOutlook: "high",
    },
    {
      id: "real-estate-agent",
      title: "Real Estate Agent",
      emoji: "🏡",
      description: "Help clients buy, sell, and rent residential properties, guiding them through viewings, negotiations, and contracts.",
      avgSalary: "500,000 - 900,000 kr/year",
      educationPath: "Real estate licence (vocational course) + on-the-job training",
      keySkills: ["sales", "negotiation", "communication", "local market knowledge", "customer service"],
      dailyTasks: ["Show properties", "Negotiate offers", "List homes", "Advise clients", "Coordinate viewings"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "real-estate-broker",
      title: "Real Estate Broker",
      emoji: "🏘️",
      description: "Run a real estate brokerage, oversee agents, and handle complex transactions with full licensing.",
      avgSalary: "700,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's in Real Estate or Business + Broker licence + experience as agent",
      keySkills: ["brokerage management", "negotiation", "compliance", "leadership", "deal structuring"],
      dailyTasks: ["Oversee agents", "Close deals", "Ensure compliance", "Develop business", "Mentor team"],
      growthOutlook: "medium",
    },
    {
      id: "property-manager",
      title: "Property Manager",
      emoji: "🔑",
      description: "Manage day-to-day operations of residential or commercial properties, including tenants, maintenance, and finances.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Real Estate or Business + property management certification",
      keySkills: ["tenant relations", "budgeting", "maintenance coordination", "communication", "problem-solving"],
      dailyTasks: ["Collect rent", "Coordinate repairs", "Handle tenant issues", "Inspect properties", "Manage budgets"],
      growthOutlook: "medium",
    },
    {
      id: "leasing-agent",
      title: "Leasing Agent",
      emoji: "📝",
      description: "Show rental units to prospective tenants, process applications, and sign leases.",
      avgSalary: "400,000 - 600,000 kr/year",
      educationPath: "High school + on-the-job training",
      keySkills: ["customer service", "sales", "communication", "organisation", "attention to detail"],
      dailyTasks: ["Tour prospects", "Process applications", "Sign leases", "Follow up with leads", "Update listings"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "real-estate-developer",
      title: "Real Estate Developer",
      emoji: "🏗️",
      description: "Acquire land and oversee the design, financing, and construction of new property developments.",
      avgSalary: "900,000 - 2,000,000 kr/year",
      educationPath: "Bachelor's/Master's in Real Estate, Construction Management, or Business",
      keySkills: ["project management", "finance", "negotiation", "vision", "risk assessment"],
      dailyTasks: ["Source sites", "Secure financing", "Coordinate architects and builders", "Manage timelines", "Sell or lease finished units"],
      growthOutlook: "medium",
    },
    {
      id: "real-estate-investor",
      title: "Real Estate Investor",
      emoji: "💰",
      description: "Buy, hold, and sell properties to generate rental income and capital gains.",
      avgSalary: "Variable (project-based)",
      educationPath: "Self-directed learning + finance/business background",
      keySkills: ["financial analysis", "market research", "negotiation", "risk management", "networking"],
      dailyTasks: ["Analyse deals", "Secure financing", "Manage portfolio", "Network with brokers", "Monitor markets"],
      growthOutlook: "medium",
    },
    {
      id: "real-estate-analyst",
      title: "Real Estate Analyst",
      emoji: "📈",
      description: "Evaluate property investments using financial models, market data, and feasibility studies.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Finance, Real Estate, or Economics",
      keySkills: ["financial modelling", "Excel", "market analysis", "valuation", "research"],
      dailyTasks: ["Build models", "Analyse markets", "Underwrite deals", "Prepare reports", "Support investment decisions"],
      growthOutlook: "high",
    },
    {
      id: "real-estate-appraiser",
      title: "Real Estate Appraiser",
      emoji: "🏷️",
      description: "Assess property values for sales, mortgages, taxes, and insurance based on inspections and market data.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's + appraiser licensing/certification",
      keySkills: ["valuation", "attention to detail", "market knowledge", "report writing", "ethics"],
      dailyTasks: ["Inspect properties", "Research comparables", "Calculate values", "Write reports", "Defend valuations"],
      growthOutlook: "medium",
    },
    {
      id: "real-estate-valuer",
      title: "Real Estate Valuer",
      emoji: "⚖️",
      description: "Provide independent valuations of properties for sale, finance, taxation, or legal purposes.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Real Estate or Surveying + RICS or equivalent qualification",
      keySkills: ["valuation methodology", "market analysis", "report writing", "ethics", "negotiation"],
      dailyTasks: ["Inspect properties", "Apply valuation methods", "Research markets", "Write valuation reports", "Advise clients"],
      growthOutlook: "medium",
    },
    {
      id: "property-consultant",
      title: "Property Consultant",
      emoji: "💼",
      description: "Advise clients on buying, selling, leasing, and investing in property based on market expertise.",
      avgSalary: "600,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in Real Estate or Business + industry experience",
      keySkills: ["advisory", "market knowledge", "negotiation", "communication", "client management"],
      dailyTasks: ["Advise clients", "Research markets", "Recommend strategies", "Negotiate deals", "Build relationships"],
      growthOutlook: "medium",
    },
    {
      id: "commercial-real-estate-agent",
      title: "Commercial Real Estate Agent",
      emoji: "🏢",
      description: "Specialise in selling and leasing offices, retail, industrial, and other commercial properties.",
      avgSalary: "650,000 - 1,200,000 kr/year",
      educationPath: "Real estate licence + commercial specialisation",
      keySkills: ["commercial leasing", "financial analysis", "negotiation", "networking", "market knowledge"],
      dailyTasks: ["Tour commercial spaces", "Negotiate leases", "Build broker network", "Analyse deals", "Advise corporate clients"],
      growthOutlook: "medium",
    },
    {
      id: "residential-real-estate-agent",
      title: "Residential Real Estate Agent",
      emoji: "🏠",
      description: "Help individuals and families buy and sell homes in the residential market.",
      avgSalary: "500,000 - 900,000 kr/year",
      educationPath: "Real estate licence + on-the-job training",
      keySkills: ["sales", "empathy", "negotiation", "local market knowledge", "marketing"],
      dailyTasks: ["List homes", "Show properties", "Negotiate offers", "Coordinate closings", "Market listings"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "lettings-agent",
      title: "Lettings Agent",
      emoji: "🗝️",
      description: "Match tenants with rental properties, handle viewings, references, and tenancy agreements.",
      avgSalary: "400,000 - 600,000 kr/year",
      educationPath: "High school + agency training",
      keySkills: ["customer service", "negotiation", "organisation", "communication", "local knowledge"],
      dailyTasks: ["Conduct viewings", "Reference tenants", "Draft tenancy agreements", "Manage move-ins", "Resolve issues"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "estate-manager",
      title: "Estate Manager",
      emoji: "🏰",
      description: "Manage large private or commercial estates including staff, grounds, properties, and finances.",
      avgSalary: "650,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's in Estate Management or related + experience",
      keySkills: ["estate operations", "leadership", "budgeting", "discretion", "organisation"],
      dailyTasks: ["Oversee staff", "Manage budgets", "Coordinate maintenance", "Liaise with owners", "Plan events"],
      growthOutlook: "stable",
    },
    {
      id: "facilities-manager",
      title: "Facilities Manager",
      emoji: "🛠️",
      description: "Ensure buildings and their services meet the needs of the people working in them, covering maintenance, safety, and operations.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Facilities Management, Engineering, or Business",
      keySkills: ["operations", "vendor management", "health and safety", "budgeting", "problem-solving"],
      dailyTasks: ["Manage maintenance", "Oversee vendors", "Ensure safety compliance", "Plan upgrades", "Handle emergencies"],
      growthOutlook: "medium",
    },
    {
      id: "real-estate-asset-manager",
      title: "Asset Manager",
      emoji: "📊",
      description: "Maximise the value and performance of property assets through strategy, leasing, and capital improvements.",
      avgSalary: "850,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in Real Estate, Finance, or Business",
      keySkills: ["asset strategy", "financial analysis", "leasing", "capital planning", "stakeholder management"],
      dailyTasks: ["Develop asset plans", "Review performance", "Approve leases", "Plan capex", "Report to investors"],
      growthOutlook: "high",
    },
    {
      id: "real-estate-portfolio-manager",
      title: "Portfolio Manager",
      emoji: "📁",
      description: "Oversee a portfolio of property investments, balancing risk and return across multiple assets.",
      avgSalary: "1,000,000 - 1,800,000 kr/year",
      educationPath: "Bachelor's/Master's in Finance or Real Estate + 7+ years experience",
      keySkills: ["portfolio strategy", "financial analysis", "risk management", "leadership", "investor relations"],
      dailyTasks: ["Set portfolio strategy", "Review asset performance", "Allocate capital", "Report to investors", "Manage team"],
      growthOutlook: "high",
    },
    {
      id: "acquisitions-manager",
      title: "Acquisitions Manager",
      emoji: "🎯",
      description: "Source, evaluate, and close real estate acquisitions on behalf of investors or developers.",
      avgSalary: "850,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's/Master's in Real Estate, Finance, or Business",
      keySkills: ["deal sourcing", "underwriting", "negotiation", "due diligence", "networking"],
      dailyTasks: ["Source deals", "Underwrite acquisitions", "Negotiate terms", "Lead due diligence", "Close transactions"],
      growthOutlook: "high",
    },
    {
      id: "dispositions-manager",
      title: "Dispositions Manager",
      emoji: "💸",
      description: "Manage the sale of real estate assets, maximising returns for owners and investors.",
      avgSalary: "850,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in Real Estate, Finance, or Business",
      keySkills: ["sales strategy", "negotiation", "marketing", "valuation", "transaction management"],
      dailyTasks: ["Plan sales", "Coordinate brokers", "Negotiate sales", "Manage closings", "Report results"],
      growthOutlook: "medium",
    },
    {
      id: "property-administrator",
      title: "Property Administrator",
      emoji: "🗂️",
      description: "Provide administrative support to property managers, handling paperwork, tenant queries, and records.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "High school + admin experience",
      keySkills: ["organisation", "communication", "data entry", "customer service", "attention to detail"],
      dailyTasks: ["Update records", "Respond to tenants", "Process invoices", "Schedule maintenance", "Support managers"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "real-estate-marketing-specialist",
      title: "Real Estate Marketing Specialist",
      emoji: "📣",
      description: "Promote properties and brokerages through digital, print, and event marketing.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Marketing or Communications",
      keySkills: ["digital marketing", "content creation", "branding", "social media", "creativity"],
      dailyTasks: ["Create listings", "Run campaigns", "Manage social media", "Plan events", "Track results"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "real-estate-sales-manager",
      title: "Real Estate Sales Manager",
      emoji: "👔",
      description: "Lead a team of real estate agents, set sales targets, and drive revenue growth.",
      avgSalary: "750,000 - 1,300,000 kr/year",
      educationPath: "Real estate licence + sales management experience",
      keySkills: ["sales leadership", "coaching", "target setting", "negotiation", "recruitment"],
      dailyTasks: ["Coach agents", "Set targets", "Review performance", "Recruit talent", "Drive sales strategy"],
      growthOutlook: "medium",
    },
    {
      id: "mortgage-advisor",
      title: "Mortgage Advisor",
      emoji: "🏦",
      description: "Help clients understand and choose mortgage products that fit their needs and circumstances.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Finance or related + mortgage advisor certification",
      keySkills: ["financial advice", "regulation knowledge", "communication", "sales", "ethics"],
      dailyTasks: ["Assess clients", "Recommend products", "Submit applications", "Liaise with lenders", "Explain terms"],
      growthOutlook: "medium",
    },
    {
      id: "mortgage-broker",
      title: "Mortgage Broker",
      emoji: "🏧",
      description: "Act as an intermediary between borrowers and lenders to secure the best mortgage deals.",
      avgSalary: "600,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's + broker licensing",
      keySkills: ["product knowledge", "negotiation", "client management", "regulation", "sales"],
      dailyTasks: ["Source loans", "Compare lenders", "Submit applications", "Negotiate terms", "Advise clients"],
      growthOutlook: "medium",
    },
    {
      id: "loan-officer",
      title: "Loan Officer",
      emoji: "📑",
      description: "Evaluate, authorise, and recommend approval of loan applications for individuals and businesses.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Finance or Business",
      keySkills: ["credit analysis", "regulation", "customer service", "attention to detail", "communication"],
      dailyTasks: ["Review applications", "Assess creditworthiness", "Approve loans", "Explain terms", "Maintain records"],
      growthOutlook: "medium",
    },
    {
      id: "escrow-officer",
      title: "Escrow Officer",
      emoji: "🔐",
      description: "Manage neutral third-party accounts during real estate transactions to ensure all conditions are met before funds change hands.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's + escrow training and licensing",
      keySkills: ["attention to detail", "compliance", "documentation", "communication", "trustworthiness"],
      dailyTasks: ["Open escrow", "Verify documents", "Coordinate parties", "Disburse funds", "Close transactions"],
      growthOutlook: "stable",
    },
    {
      id: "title-officer",
      title: "Title Officer",
      emoji: "📜",
      description: "Examine property titles to ensure clear ownership and issue title insurance for transactions.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's + title industry training",
      keySkills: ["title examination", "legal research", "attention to detail", "documentation", "communication"],
      dailyTasks: ["Search titles", "Identify liens", "Issue policies", "Resolve issues", "Coordinate closings"],
      growthOutlook: "stable",
    },
    {
      id: "surveyor",
      title: "Surveyor",
      emoji: "📐",
      description: "Measure and map land, buildings, and infrastructure to inform construction, legal, and planning decisions.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Surveying or Geomatics",
      keySkills: ["measurement", "GIS", "maths", "attention to detail", "report writing"],
      dailyTasks: ["Conduct site surveys", "Operate equipment", "Create maps", "Write reports", "Advise on boundaries"],
      growthOutlook: "medium",
    },
    {
      id: "land-surveyor",
      title: "Land Surveyor",
      emoji: "🗺️",
      description: "Determine legal property boundaries and prepare official maps for land transactions and development.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Land Surveying + licensing",
      keySkills: ["surveying", "GIS", "legal knowledge", "fieldwork", "precision"],
      dailyTasks: ["Survey land", "Set boundaries", "File legal maps", "Advise developers", "Resolve disputes"],
      growthOutlook: "medium",
    },
    {
      id: "urban-planner",
      title: "Urban Planner",
      emoji: "🏙️",
      description: "Develop plans for land use in towns and cities, balancing growth, sustainability, and community needs.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Master's in Urban Planning",
      keySkills: ["planning", "policy", "GIS", "community engagement", "sustainability"],
      dailyTasks: ["Draft plans", "Review proposals", "Engage communities", "Analyse data", "Advise councils"],
      growthOutlook: "medium",
    },
    {
      id: "property-inspector",
      title: "Property Inspector",
      emoji: "🔎",
      description: "Inspect homes and buildings for structural, safety, and code compliance issues before sale or lease.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Vocational training + inspector certification",
      keySkills: ["building knowledge", "attention to detail", "report writing", "communication", "safety"],
      dailyTasks: ["Inspect properties", "Identify defects", "Photograph issues", "Write reports", "Advise buyers"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "building-surveyor",
      title: "Building Surveyor",
      emoji: "🏚️",
      description: "Advise on the design, construction, maintenance, and repair of buildings to ensure they are safe and compliant.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in Building Surveying + RICS or equivalent",
      keySkills: ["building pathology", "regulations", "report writing", "project management", "communication"],
      dailyTasks: ["Inspect buildings", "Diagnose defects", "Specify repairs", "Advise clients", "Oversee works"],
      growthOutlook: "medium",
    },
    {
      id: "construction-manager",
      title: "Construction Manager",
      emoji: "👷",
      description: "Plan, coordinate, and supervise construction projects from start to finish, on time and on budget.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Construction Management or Civil Engineering",
      keySkills: ["project management", "scheduling", "leadership", "safety", "budgeting"],
      dailyTasks: ["Coordinate trades", "Track progress", "Manage budgets", "Ensure safety", "Liaise with clients"],
      growthOutlook: "high",
    },
    {
      id: "property-lawyer",
      title: "Property Lawyer",
      emoji: "⚖️",
      description: "Advise clients on legal matters related to buying, selling, leasing, and developing real estate.",
      avgSalary: "750,000 - 1,400,000 kr/year",
      educationPath: "Law degree + bar admission + property law specialisation",
      keySkills: ["property law", "contract drafting", "negotiation", "research", "attention to detail"],
      dailyTasks: ["Draft contracts", "Review titles", "Advise clients", "Resolve disputes", "Close transactions"],
      growthOutlook: "medium",
    },
    {
      id: "real-estate-photographer",
      title: "Real Estate Photographer",
      emoji: "📸",
      description: "Capture professional photos and video of properties for listings, marketing, and tours.",
      avgSalary: "400,000 - 700,000 kr/year",
      educationPath: "Self-taught or photography course + portfolio",
      keySkills: ["photography", "lighting", "editing", "composition", "attention to detail"],
      dailyTasks: ["Photograph properties", "Edit images", "Shoot video tours", "Deliver to agents", "Manage bookings"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "real-estate-consultant",
      title: "Real Estate Consultant",
      emoji: "🧭",
      description: "Provide strategic advice to investors, developers, and corporates on real estate decisions.",
      avgSalary: "750,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in Real Estate, Finance, or Business + experience",
      keySkills: ["strategic advisory", "market analysis", "financial modelling", "client management", "negotiation"],
      dailyTasks: ["Advise clients", "Research markets", "Build models", "Present recommendations", "Win engagements"],
      growthOutlook: "high",
    },
  ],

  // ========================================
  // FINANCE, BANKING & INSURANCE
  // ========================================
  FINANCE_BANKING: [
    {
      id: "accountant",
      title: "Accountant",
      emoji: "🧮",
      description: "Manage financial records, prepare statements, and ensure tax compliance for businesses.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Accounting or Economics + Authorisation",
      keySkills: ["attention to detail", "numeracy", "organisation", "software skills", "ethics"],
      dailyTasks: ["Record transactions", "Prepare financial statements", "File taxes", "Advise clients"],
      growthOutlook: "stable",
    },
    {
      id: "financial-advisor",
      title: "Financial Advisor",
      emoji: "💰",
      description: "Help individuals and businesses plan their finances, investments, and retirement.",
      avgSalary: "500,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Finance + Certifications",
      keySkills: ["financial knowledge", "communication", "analytical thinking", "sales", "relationship building"],
      dailyTasks: ["Assess client needs", "Recommend investments", "Create financial plans", "Monitor portfolios"],
      growthOutlook: "medium",
    },
    {
      id: "bank-advisor",
      title: "Bank Advisor",
      emoji: "🏦",
      description: "Help bank customers with accounts, loans, mortgages, and financial products.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Finance, Economics, or Business",
      keySkills: ["customer service", "financial products", "communication", "sales", "problem-solving"],
      dailyTasks: ["Advise customers", "Process applications", "Sell banking products", "Handle inquiries"],
      growthOutlook: "stable",
    },
    {
      id: "insurance-advisor",
      title: "Insurance Advisor",
      emoji: "🛡️",
      description: "Help clients choose insurance products and process claims.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Business/Finance + Insurance certification",
      keySkills: ["product knowledge", "communication", "sales", "empathy", "attention to detail"],
      dailyTasks: ["Assess client needs", "Recommend policies", "Process claims", "Maintain relationships"],
      growthOutlook: "stable",
    },
    {
      id: "auditor",
      title: "Auditor",
      emoji: "🔍",
      description: "Examine financial records to ensure accuracy, compliance, and detect fraud.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Master's in Accounting + State authorisation",
      keySkills: ["attention to detail", "analytical thinking", "integrity", "communication", "accounting knowledge"],
      dailyTasks: ["Review financial statements", "Test controls", "Write reports", "Meet with clients"],
      growthOutlook: "stable",
    },
    {
      id: "investment-analyst",
      title: "Investment Analyst",
      emoji: "📊",
      description: "Research and analyse investment opportunities for funds and institutions.",
      avgSalary: "600,000 - 1,000,000 kr/year",
      educationPath: "Master's in Finance + CFA certification",
      keySkills: ["financial modeling", "research", "analytical thinking", "communication", "attention to detail"],
      dailyTasks: ["Analyse companies", "Build financial models", "Write reports", "Present recommendations"],
      growthOutlook: "medium",
    },
    {
      id: "investment-manager",
      title: "Investment Manager",
      emoji: "💰",
      description: "Manage investment portfolios making buy/sell decisions to maximise returns for clients or funds.",
      avgSalary: "800,000 - 1,500,000 kr/year",
      educationPath: "Master's in Finance + CFA + 5+ years investment experience",
      keySkills: ["portfolio management", "financial analysis", "risk management", "market research", "client communication"],
      dailyTasks: ["Manage investment portfolios", "Analyse market opportunities", "Make investment decisions", "Report to clients/stakeholders", "Monitor risk exposure"],
      growthOutlook: "medium",
    },
    {
      id: "private-equity-associate",
      title: "Private Equity Associate",
      emoji: "📊",
      description: "Analyse and execute private equity deals including due diligence, financial modelling, and portfolio company support.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Master's in Finance/MBA + Investment banking or consulting experience",
      keySkills: ["financial modelling", "due diligence", "deal execution", "valuation", "portfolio management"],
      dailyTasks: ["Build financial models", "Conduct due diligence", "Prepare investment memos", "Support portfolio companies", "Screen deal opportunities"],
      growthOutlook: "medium",
    },
    {
      id: "private-equity-vp",
      title: "Private Equity Vice President",
      emoji: "💼",
      description: "Lead private equity deal sourcing and execution, managing associates and driving value creation in portfolio companies.",
      avgSalary: "1,200,000 - 2,500,000 kr/year",
      educationPath: "Master's/MBA + 6+ years PE/IB experience",
      keySkills: ["deal leadership", "portfolio management", "value creation", "team management", "investor relations"],
      dailyTasks: ["Lead deal processes", "Manage portfolio companies", "Source new investments", "Present to investment committee", "Develop associates"],
      growthOutlook: "medium",
    },
    {
      id: "venture-capital-principal",
      title: "Venture Capital Principal",
      emoji: "🚀",
      description: "Lead venture capital investments from sourcing through due diligence to board representation, with significant deal autonomy.",
      avgSalary: "1,000,000 - 2,000,000 kr/year",
      educationPath: "Master's/MBA + VC/startup/operator experience",
      keySkills: ["investment thesis", "startup evaluation", "board governance", "portfolio support", "market analysis"],
      dailyTasks: ["Source startup deals", "Lead due diligence", "Present to partners", "Sit on portfolio boards", "Support portfolio companies"],
      growthOutlook: "high",
    },
    {
      id: "corporate-development-director",
      title: "Corporate Development Director",
      emoji: "🤝",
      description: "Lead corporate development activities including M&A, partnerships, and strategic investments for growth.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's/MBA + M&A/corporate finance experience",
      keySkills: ["M&A execution", "strategic analysis", "deal negotiation", "integration planning", "financial modelling"],
      dailyTasks: ["Source acquisition targets", "Lead M&A processes", "Negotiate deals", "Plan post-merger integration", "Present to CEO/board"],
      growthOutlook: "high",
    },
    {
      id: "ma-director",
      title: "M&A Director",
      emoji: "🤝",
      description: "Lead mergers and acquisitions from target identification through negotiation, execution, and post-deal integration.",
      avgSalary: "1,200,000 - 2,000,000 kr/year",
      educationPath: "Master's/MBA + 10+ years M&A experience",
      keySkills: ["M&A strategy", "deal execution", "valuation", "negotiation", "integration management"],
      dailyTasks: ["Lead M&A deals", "Conduct valuations", "Negotiate terms", "Manage due diligence", "Oversee integration"],
      growthOutlook: "medium",
    },
    {
      id: "finance-director",
      title: "Finance Director",
      emoji: "💰",
      description: "Lead the finance function managing financial planning, reporting, controls, and treasury for the organisation.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's in Finance/Accounting + CPA/CFA + 10+ years finance leadership",
      keySkills: ["financial management", "reporting", "budgeting", "risk management", "team leadership"],
      dailyTasks: ["Lead finance function", "Manage financial planning", "Oversee reporting", "Ensure compliance", "Advise CEO/board"],
      growthOutlook: "stable",
    },
    {
      id: "head-of-finance",
      title: "Head of Finance",
      emoji: "💰",
      description: "Own the finance function for a business unit or company, driving financial strategy and operational finance excellence.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Finance/Accounting + 8+ years finance + leadership",
      keySkills: ["financial strategy", "business partnering", "budgeting", "forecasting", "team management"],
      dailyTasks: ["Own financial strategy", "Partner with business leaders", "Manage budgets and forecasts", "Lead finance team", "Drive financial discipline"],
      growthOutlook: "stable",
    },
    {
      id: "chief-financial-officer",
      title: "Chief Financial Officer",
      emoji: "👔",
      description: "Executive responsible for all financial matters including strategy, reporting, investor relations, and capital allocation.",
      avgSalary: "1,500,000 - 3,000,000+ kr/year",
      educationPath: "Master's/MBA + CPA/CFA + 15+ years finance + executive leadership",
      keySkills: ["financial strategy", "investor relations", "capital allocation", "board governance", "executive leadership"],
      dailyTasks: ["Set financial strategy", "Lead investor relations", "Manage capital allocation", "Report to board", "Drive financial performance"],
      growthOutlook: "stable",
    },
    {
      id: "treasury-director",
      title: "Treasury Director",
      emoji: "🏦",
      description: "Lead treasury operations managing cash flow, liquidity, foreign exchange, and banking relationships.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Finance + Treasury certifications + 10+ years treasury experience",
      keySkills: ["cash management", "liquidity planning", "FX management", "banking relationships", "risk management"],
      dailyTasks: ["Manage cash positions", "Optimise liquidity", "Manage FX exposure", "Maintain banking relationships", "Report to CFO"],
      growthOutlook: "stable",
    },
    {
      id: "risk-director",
      title: "Risk Director",
      emoji: "🛡️",
      description: "Lead enterprise risk management defining the risk framework, appetite, and ensuring risk-aware decision-making.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Finance/Risk + Risk certifications (FRM, PRM) + 10+ years experience",
      keySkills: ["enterprise risk management", "risk modelling", "regulatory compliance", "governance", "board reporting"],
      dailyTasks: ["Manage risk framework", "Assess enterprise risks", "Report to board/audit committee", "Define risk appetite", "Drive risk culture"],
      growthOutlook: "high",
    },
    // ── Trading & investing ──
    { id: "stockbroker", title: "Stockbroker", emoji: "📈", description: "Buy and sell stocks on behalf of clients — building portfolios, providing advice, and managing relationships.", avgSalary: "650,000 - 1,800,000 kr/year (commission-driven)", educationPath: "Bachelor's in Finance / Economics + Finansforetaket licensing", keySkills: ["market knowledge", "client service", "trading", "communication", "risk management"], dailyTasks: ["Place trades", "Advise clients", "Track markets", "Build portfolios", "Manage compliance"], growthOutlook: "medium" },
    { id: "trader", title: "Trader", emoji: "💹", description: "Trade financial instruments — equities, FX, commodities, derivatives — on behalf of a bank, fund, or own account.", avgSalary: "700,000 - 3,000,000+ kr/year (highly variable, performance-based)", educationPath: "Bachelor's/Master's in Finance / Maths + trading internship", keySkills: ["market analysis", "fast decision-making", "risk control", "discipline", "stress management"], dailyTasks: ["Watch markets", "Place trades", "Manage risk", "Read research", "Brief desk"], growthOutlook: "medium" },
    { id: "day-trader", title: "Day Trader", emoji: "⏱️", description: "Buy and sell securities within the same day — making many small trades and rarely holding positions overnight.", avgSalary: "0 - 2,000,000+ kr/year (highly variable, often negative)", educationPath: "Self-taught — most professional day traders fail; risk capital required", keySkills: ["technical analysis", "discipline", "risk management", "patience", "emotional control"], dailyTasks: ["Watch markets", "Take entries", "Manage stops", "Journal trades", "Review setups"], growthOutlook: "stable", entryLevel: true },
    { id: "investment-banker", title: "Investment Banker", emoji: "🏦", description: "Advise companies on M&A, IPOs, and capital raising — building financial models and pitching deals to executives.", avgSalary: "900,000 - 3,000,000+ kr/year (with bonus)", educationPath: "Bachelor's/Master's in Finance / Economics + analyst programme", keySkills: ["financial modelling", "valuation", "stamina", "client management", "presentation"], dailyTasks: ["Build models", "Draft pitches", "Run analyses", "Brief clients", "Execute deals"], growthOutlook: "medium" },
    { id: "equity-analyst", title: "Equity Analyst", emoji: "📊", description: "Research and value listed companies — publishing recommendations to fund managers and institutional clients.", avgSalary: "650,000 - 1,500,000 kr/year", educationPath: "Bachelor's in Finance / Economics + CFA route", keySkills: ["financial analysis", "valuation", "report writing", "industry knowledge", "modelling"], dailyTasks: ["Build models", "Read reports", "Meet management", "Write notes", "Brief sales"], growthOutlook: "medium" },
    { id: "financial-analyst", title: "Financial Analyst", emoji: "💼", description: "Analyse business performance, build forecasts, and support decision-making — in corporate finance, banking, or asset management.", avgSalary: "550,000 - 950,000 kr/year", educationPath: "Bachelor's in Finance / Economics + Excel / financial modelling skills", keySkills: ["financial modelling", "Excel", "analysis", "communication", "attention to detail"], dailyTasks: ["Build forecasts", "Track performance", "Analyse variance", "Brief management", "Support decisions"], growthOutlook: "high" },
    { id: "hedge-fund-manager", title: "Hedge Fund Manager", emoji: "🎯", description: "Run a hedge fund — make investment decisions, manage risk, and grow client capital across complex strategies.", avgSalary: "1,200,000 - 10,000,000+ kr/year (performance fees)", educationPath: "Bachelor's/Master's in Finance + decade of trading or PM experience", keySkills: ["investment strategy", "risk management", "decision-making", "leadership", "investor relations"], dailyTasks: ["Make decisions", "Manage risk", "Meet investors", "Run team", "Track P&L"], growthOutlook: "medium" },
    { id: "options-trader", title: "Options Trader", emoji: "📉", description: "Trade options contracts — using volatility, time decay, and complex strategies to profit and hedge risk.", avgSalary: "700,000 - 3,000,000+ kr/year (variable)", educationPath: "Bachelor's in Finance / Maths / Physics + trading desk experience", keySkills: ["volatility", "Greeks", "risk modelling", "strategy", "discipline"], dailyTasks: ["Quote options", "Hedge risk", "Build positions", "Watch vol", "Manage P&L"], growthOutlook: "medium" },
    { id: "forex-trader", title: "Forex Trader", emoji: "💱", description: "Trade currency pairs in the FX market — analysing macro, central banks, and price action 24/5.", avgSalary: "0 - 2,000,000+ kr/year (highly variable)", educationPath: "Self-taught or finance background + risk capital", keySkills: ["macro analysis", "technical analysis", "risk management", "discipline", "stamina"], dailyTasks: ["Watch news", "Place trades", "Manage stops", "Read flows", "Journal trades"], growthOutlook: "stable", entryLevel: true },
    { id: "crypto-trader", title: "Crypto Trader", emoji: "🪙", description: "Trade cryptocurrencies on exchanges — using technical analysis, on-chain data, and market sentiment.", avgSalary: "0 - 3,000,000+ kr/year (highly variable, very risky)", educationPath: "Self-taught — risk capital and risk management required", keySkills: ["technical analysis", "on-chain data", "risk management", "discipline", "stamina"], dailyTasks: ["Watch charts", "Place trades", "Manage positions", "Track on-chain", "Review setups"], growthOutlook: "medium", entryLevel: true },
    { id: "wealth-manager", title: "Wealth Manager", emoji: "💎", description: "Help wealthy individuals and families manage and grow their wealth — investments, tax, estate, and lifestyle.", avgSalary: "800,000 - 2,000,000+ kr/year", educationPath: "Bachelor's in Finance + CFP / wealth management certifications", keySkills: ["client management", "investment strategy", "tax planning", "discretion", "communication"], dailyTasks: ["Meet clients", "Build portfolios", "Plan tax", "Review markets", "Network"], growthOutlook: "high" },
    { id: "risk-analyst", title: "Risk Analyst", emoji: "⚖️", description: "Identify and quantify risks across credit, market, or operational areas — supporting decisions that protect the business.", avgSalary: "550,000 - 1,000,000 kr/year", educationPath: "Bachelor's in Finance / Maths / Statistics + FRM / PRM certifications", keySkills: ["statistical modelling", "risk frameworks", "Excel", "report writing", "regulation"], dailyTasks: ["Build risk models", "Run stress tests", "Monitor exposures", "Write reports", "Brief management"], growthOutlook: "high" },
    { id: "derivatives-trader", title: "Derivatives Trader", emoji: "🔀", description: "Trade derivatives — futures, swaps, options — for a bank or fund, often hedging or providing liquidity.", avgSalary: "800,000 - 3,000,000+ kr/year (variable)", educationPath: "Bachelor's/Master's in Finance / Maths / Physics + trading desk experience", keySkills: ["derivatives pricing", "risk management", "modelling", "fast decision-making", "discipline"], dailyTasks: ["Price derivatives", "Hedge books", "Manage P&L", "Watch markets", "Brief desk"], growthOutlook: "medium" },
    { id: "commodities-trader", title: "Commodities Trader", emoji: "🛢️", description: "Trade physical or financial commodities — oil, gas, metals, grain — across global markets and supply chains.", avgSalary: "700,000 - 3,000,000+ kr/year (highly variable)", educationPath: "Bachelor's in Finance / Economics / Engineering + trading internship", keySkills: ["supply/demand analysis", "logistics knowledge", "negotiation", "risk management", "stamina"], dailyTasks: ["Track markets", "Place trades", "Hedge exposures", "Negotiate cargoes", "Brief management"], growthOutlook: "medium" },
    { id: "market-analyst", title: "Market Analyst", emoji: "🔍", description: "Track and explain financial markets — equities, FX, commodities — to traders, investors, or media.", avgSalary: "550,000 - 1,100,000 kr/year", educationPath: "Bachelor's in Finance / Economics + writing skills", keySkills: ["market knowledge", "data analysis", "writing", "presentation", "speed"], dailyTasks: ["Track markets", "Write notes", "Brief desks", "Build models", "Talk to media"], growthOutlook: "medium" },
  ],

  // ========================================
  // SALES, MARKETING & CUSTOMER SERVICE
  // ========================================
  SALES_MARKETING: [
    {
      id: "marketing-manager",
      title: "Marketing Manager",
      emoji: "📣",
      description: "Plan and execute marketing campaigns to promote products and build brand awareness.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Marketing or Business",
      keySkills: ["creativity", "strategic thinking", "communication", "data analysis", "leadership"],
      dailyTasks: ["Plan campaigns", "Manage budgets", "Analyse results", "Lead team", "Coordinate with agencies"],
      growthOutlook: "high",
    },
    {
      id: "digital-marketer",
      title: "Digital Marketing Specialist",
      emoji: "📱",
      description: "Run online marketing campaigns including social media, SEO, and paid advertising.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Marketing or self-taught + digital certifications (Google, Meta)",
      keySkills: ["social media", "SEO/SEM", "analytics", "content creation", "paid advertising"],
      dailyTasks: ["Manage social media", "Run ad campaigns", "Analyse metrics", "Create content", "Optimise SEO"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "sales-representative",
      title: "Sales Representative",
      emoji: "🤝",
      description: "Sell products or services to businesses or consumers, building client relationships.",
      avgSalary: "400,000 - 800,000 kr/year (base + commission)",
      educationPath: "Various - sales training and experience valued",
      keySkills: ["communication", "persuasion", "relationship building", "resilience", "product knowledge"],
      dailyTasks: ["Contact prospects", "Present products", "Negotiate deals", "Follow up with clients"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "customer-service-rep",
      title: "Customer Service Representative",
      emoji: "📞",
      description: "Help customers with inquiries, complaints, and support via phone, chat, or email.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "No formal education required - training provided",
      keySkills: ["communication", "patience", "problem-solving", "empathy", "computer skills"],
      dailyTasks: ["Answer inquiries", "Resolve complaints", "Process orders", "Document interactions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "content-creator",
      title: "Social Media Manager",
      emoji: "✨",
      description: "Create engaging content for social media, blogs, and digital platforms.",
      avgSalary: "400,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Marketing/Communications or strong portfolio",
      keySkills: ["creativity", "writing", "video editing", "social media", "trend awareness"],
      dailyTasks: ["Create content", "Manage social accounts", "Engage audience", "Track analytics"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "brand-manager",
      title: "Brand Manager",
      emoji: "🏷️",
      description: "Develop and maintain brand identity, ensuring consistent messaging across channels.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bachelor's/Master's in Marketing",
      keySkills: ["strategic thinking", "creativity", "communication", "market research", "leadership"],
      dailyTasks: ["Develop brand strategy", "Oversee campaigns", "Manage brand guidelines", "Analyse market"],
      growthOutlook: "medium",
    },
    {
      id: "retail-manager",
      title: "Retail Store Manager",
      emoji: "🏪",
      description: "Manage daily store operations, staff, and sales performance in retail.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Experience in retail + leadership training",
      keySkills: ["leadership", "customer service", "organisation", "sales", "problem-solving"],
      dailyTasks: ["Manage staff", "Ensure sales targets", "Handle inventory", "Resolve issues", "Train employees"],
      growthOutlook: "stable",
    },
    {
      id: "enterprise-account-executive",
      title: "Enterprise Account Executive",
      emoji: "🤝",
      description: "Sell complex solutions to large enterprise accounts, managing long sales cycles and multi-stakeholder relationships.",
      avgSalary: "700,000 - 1,500,000 kr/year (base + commission)",
      educationPath: "Bachelor's in Business + 5+ years enterprise sales",
      keySkills: ["enterprise sales", "relationship building", "solution selling", "negotiation", "strategic planning"],
      dailyTasks: ["Manage enterprise accounts", "Lead sales pursuits", "Navigate buying committees", "Build proposals", "Negotiate contracts"],
      growthOutlook: "high",
    },
    {
      id: "strategic-account-executive",
      title: "Strategic Account Executive",
      emoji: "🎯",
      description: "Manage the largest and most strategic client accounts, developing deep partnerships and driving significant revenue growth.",
      avgSalary: "900,000 - 2,000,000 kr/year (base + commission)",
      educationPath: "Bachelor's/Master's + 8+ years strategic/enterprise sales",
      keySkills: ["strategic account management", "C-suite selling", "deal strategy", "partnership development", "revenue growth"],
      dailyTasks: ["Manage strategic accounts", "Sell to C-suite", "Develop account strategies", "Drive revenue growth", "Build executive relationships"],
      growthOutlook: "high",
    },
    {
      id: "global-account-director",
      title: "Global Account Director",
      emoji: "🌍",
      description: "Lead global client accounts managing multi-country relationships, coordinating cross-border delivery, and driving account growth.",
      avgSalary: "1,100,000 - 2,200,000 kr/year",
      educationPath: "Master's/MBA + 10+ years global account management",
      keySkills: ["global account strategy", "cross-cultural management", "P&L ownership", "executive relationships", "team coordination"],
      dailyTasks: ["Lead global account strategy", "Manage cross-border delivery", "Drive account P&L", "Build C-suite relationships", "Coordinate global teams"],
      growthOutlook: "high",
    },
    {
      id: "sales-director",
      title: "Sales Director",
      emoji: "📊",
      description: "Lead a sales team or region driving revenue targets, sales strategy, and pipeline management.",
      avgSalary: "1,000,000 - 1,800,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years sales + leadership experience",
      keySkills: ["sales leadership", "revenue management", "pipeline management", "team development", "strategic planning"],
      dailyTasks: ["Lead sales team", "Drive revenue targets", "Manage sales pipeline", "Develop sales strategy", "Coach account executives"],
      growthOutlook: "high",
    },
    {
      id: "regional-sales-director",
      title: "Regional Sales Director",
      emoji: "🌐",
      description: "Lead sales across a geographic region, managing sales teams and driving regional revenue and market expansion.",
      avgSalary: "1,100,000 - 2,000,000 kr/year",
      educationPath: "Bachelor's/Master's + 12+ years sales + regional leadership",
      keySkills: ["regional sales strategy", "team leadership", "market expansion", "revenue management", "partner development"],
      dailyTasks: ["Set regional sales strategy", "Lead regional sales teams", "Drive market expansion", "Manage regional P&L", "Report to VP Sales"],
      growthOutlook: "high",
    },
    {
      id: "head-of-sales",
      title: "Head of Sales",
      emoji: "🎯",
      description: "Own the sales function driving revenue, sales strategy, and team performance across all segments and regions.",
      avgSalary: "1,200,000 - 2,200,000 kr/year",
      educationPath: "Bachelor's/Master's + 12+ years sales + senior leadership",
      keySkills: ["sales strategy", "revenue leadership", "org building", "executive selling", "market positioning"],
      dailyTasks: ["Own revenue targets", "Set sales strategy", "Build sales organisation", "Lead executive deals", "Report to CEO"],
      growthOutlook: "high",
    },
    {
      id: "head-of-revenue",
      title: "Head of Revenue",
      emoji: "💰",
      description: "Own all revenue generation including sales, customer success, and partnerships, driving predictable revenue growth.",
      avgSalary: "1,200,000 - 2,200,000 kr/year",
      educationPath: "Bachelor's/Master's + 12+ years revenue leadership",
      keySkills: ["revenue operations", "sales leadership", "customer success", "partnerships", "predictable growth"],
      dailyTasks: ["Own revenue targets", "Align sales and CS", "Drive revenue operations", "Build predictable pipeline", "Report to CEO"],
      growthOutlook: "high",
    },
    {
      id: "commercial-director",
      title: "Commercial Director",
      emoji: "💼",
      description: "Lead commercial strategy managing pricing, deals, partnerships, and revenue across the business.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's in Business + 10+ years commercial leadership",
      keySkills: ["commercial strategy", "pricing", "deal management", "partnerships", "P&L management"],
      dailyTasks: ["Set commercial strategy", "Manage pricing", "Lead major deals", "Develop partnerships", "Drive commercial performance"],
      growthOutlook: "high",
    },
    {
      id: "business-development-director",
      title: "Business Development Director",
      emoji: "🚀",
      description: "Lead business development identifying new markets, partnerships, and growth opportunities for the organisation.",
      avgSalary: "1,000,000 - 1,700,000 kr/year",
      educationPath: "Master's in Business + 10+ years BD/sales leadership",
      keySkills: ["market development", "partnership building", "strategic planning", "negotiation", "opportunity identification"],
      dailyTasks: ["Identify growth opportunities", "Build strategic partnerships", "Enter new markets", "Lead BD team", "Present to executives"],
      growthOutlook: "high",
    },
    {
      id: "strategic-partnerships-lead",
      title: "Strategic Partnerships Lead",
      emoji: "🤝",
      description: "Build and manage strategic partnerships and alliances that drive mutual value, market access, and competitive advantage.",
      avgSalary: "800,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's + 8+ years partnership/BD experience",
      keySkills: ["partnership strategy", "negotiation", "relationship management", "business development", "joint go-to-market"],
      dailyTasks: ["Develop partnership strategy", "Negotiate partner agreements", "Manage partner relationships", "Drive joint initiatives", "Track partnership metrics"],
      growthOutlook: "high",
    },
    {
      id: "alliances-director",
      title: "Alliances Director",
      emoji: "🔗",
      description: "Lead the alliances programme managing technology and consulting partner ecosystems for mutual growth.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years alliance/partnership management",
      keySkills: ["alliance management", "ecosystem development", "partner enablement", "joint business planning", "revenue attribution"],
      dailyTasks: ["Manage partner ecosystem", "Drive joint business plans", "Enable partner teams", "Track alliance revenue", "Lead partner events"],
      growthOutlook: "high",
    },
    {
      id: "key-account-director",
      title: "Key Account Director",
      emoji: "🔑",
      description: "Lead key client accounts as a strategic partner, driving account growth, retention, and long-term value creation.",
      avgSalary: "1,000,000 - 1,800,000 kr/year",
      educationPath: "Bachelor's/Master's + 10+ years key account management",
      keySkills: ["account strategy", "executive relationships", "value creation", "contract negotiation", "team leadership"],
      dailyTasks: ["Own key account strategy", "Build executive relationships", "Drive account growth", "Manage account P&L", "Coordinate delivery teams"],
      growthOutlook: "high",
    },
    {
      id: "chief-marketing-officer",
      title: "Chief Marketing Officer",
      emoji: "📣",
      description: "Executive responsible for marketing strategy, brand, demand generation, and market positioning across the organisation.",
      avgSalary: "1,400,000 - 2,500,000 kr/year",
      educationPath: "Master's/MBA + 15+ years marketing leadership",
      keySkills: ["marketing strategy", "brand leadership", "demand generation", "executive leadership", "market positioning"],
      dailyTasks: ["Set marketing strategy", "Lead marketing organisation", "Drive brand positioning", "Report to CEO/board", "Manage marketing budget"],
      growthOutlook: "high",
    },
    {
      id: "vp-marketing",
      title: "VP Marketing",
      emoji: "📣",
      description: "Lead the marketing function driving brand, demand generation, content, and marketing operations.",
      avgSalary: "1,200,000 - 2,000,000 kr/year",
      educationPath: "Master's/MBA + 12+ years marketing + leadership",
      keySkills: ["marketing leadership", "demand generation", "brand strategy", "team building", "marketing operations"],
      dailyTasks: ["Lead marketing teams", "Drive demand generation", "Set brand strategy", "Manage marketing budget", "Report to CMO/CEO"],
      growthOutlook: "high",
    },
    {
      id: "growth-marketing-director",
      title: "Growth Marketing Director",
      emoji: "📈",
      description: "Lead growth marketing driving user acquisition, activation, and retention through data-driven experimentation at scale.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's + 8+ years growth/performance marketing",
      keySkills: ["growth strategy", "experimentation", "analytics", "paid acquisition", "conversion optimisation"],
      dailyTasks: ["Drive growth strategy", "Lead experimentation", "Optimise acquisition channels", "Analyse funnel metrics", "Lead growth team"],
      growthOutlook: "high",
    },
    {
      id: "performance-marketing-director",
      title: "Performance Marketing Director",
      emoji: "📊",
      description: "Lead performance marketing across paid channels, optimising spend efficiency and ROI at scale.",
      avgSalary: "800,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's + 8+ years performance marketing",
      keySkills: ["paid media", "marketing analytics", "budget optimisation", "attribution modelling", "team leadership"],
      dailyTasks: ["Manage paid media budget", "Optimise channel ROI", "Lead performance team", "Build attribution models", "Report on marketing efficiency"],
      growthOutlook: "high",
    },
    {
      id: "global-brand-director",
      title: "Global Brand Director",
      emoji: "🏷️",
      description: "Lead global brand strategy ensuring consistent positioning, messaging, and visual identity across all markets.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Marketing/Communications + 10+ years brand leadership",
      keySkills: ["brand strategy", "global marketing", "creative direction", "market research", "team leadership"],
      dailyTasks: ["Set global brand strategy", "Ensure brand consistency", "Lead creative direction", "Manage brand guidelines", "Oversee brand campaigns"],
      growthOutlook: "medium",
    },
    {
      id: "retail-assistant",
      title: "Retail Assistant",
      emoji: "🛍️",
      description: "Serve customers in shops — stock shelves, run the till, advise on products, handle returns. A common first job at 15+; the path forward leads to Shop Supervisor and Store Manager.",
      avgSalary: "320,000 - 420,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["customer service", "communication", "reliability", "basic numeracy", "teamwork"],
      dailyTasks: ["Greet customers", "Run the till", "Restock shelves", "Handle returns", "Keep the store tidy"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "brewer",
      title: "Brewer",
      emoji: "🍺",
      description: "Make beer at scale — managing fermentation, recipes, and production runs in a craft brewery or large brewing operation.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Brewing-specific course or food science degree + apprenticeship in a brewery",
      keySkills: ["fermentation science", "recipe development", "process control", "lab testing", "physical stamina"],
      dailyTasks: ["Mash and boil", "Manage fermentation", "Test batches", "Clean tanks", "Develop new beers"],
      growthOutlook: "stable",
    },
  ],

  // ========================================
  // MANUFACTURING, ENGINEERING & ENERGY
  // ========================================
  MANUFACTURING_ENGINEERING: [
    {
      id: "mechanical-engineer",
      title: "Mechanical Engineer",
      emoji: "⚙️",
      description: "Design, develop, and test mechanical systems and machinery.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Mechanical Engineering",
      keySkills: ["CAD software", "problem-solving", "mathematics", "physics", "project management"],
      dailyTasks: ["Design components", "Run simulations", "Oversee production", "Test prototypes"],
      growthOutlook: "stable",
    },
    {
      id: "electrical-engineer",
      title: "Electrical Engineer",
      emoji: "⚡",
      description: "Design and develop electrical systems, from power grids to electronics.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Electrical Engineering",
      keySkills: ["circuit design", "problem-solving", "mathematics", "programming", "safety awareness"],
      dailyTasks: ["Design electrical systems", "Test equipment", "Troubleshoot issues", "Write specifications"],
      growthOutlook: "high",
    },
    {
      id: "electrician",
      title: "Electrician",
      emoji: "🔌",
      description: "Install, maintain, and repair electrical systems in buildings and facilities.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2.5 years) = Fagbrev",
      keySkills: ["technical knowledge", "problem-solving", "safety awareness", "manual dexterity", "reading blueprints"],
      dailyTasks: ["Install wiring", "Repair electrical faults", "Test systems", "Follow safety codes"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "plumber",
      title: "Plumber",
      emoji: "🔧",
      description: "Install and repair water, heating, and drainage systems in buildings.",
      avgSalary: "420,000 - 620,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2.5 years) = Fagbrev",
      keySkills: ["technical skills", "problem-solving", "physical fitness", "customer service", "reading blueprints"],
      dailyTasks: ["Install pipes", "Repair leaks", "Maintain heating systems", "Read blueprints"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "petroleum-engineer",
      title: "Petroleum Engineer",
      emoji: "🛢️",
      description: "Design methods for extracting oil and gas from deposits below the Earth's surface.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in Petroleum Engineering",
      keySkills: ["geology knowledge", "problem-solving", "data analysis", "project management", "safety"],
      dailyTasks: ["Plan extraction", "Analyse data", "Optimise production", "Ensure safety"],
      growthOutlook: "medium",
    },
    {
      id: "renewable-energy-tech",
      title: "Renewable Energy Technician",
      emoji: "🌱",
      description: "Install and maintain solar panels, wind turbines, and other renewable energy systems.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training + Specialized certifications",
      keySkills: ["technical skills", "safety awareness", "problem-solving", "physical fitness", "electrical knowledge"],
      dailyTasks: ["Install equipment", "Perform maintenance", "Troubleshoot issues", "Monitor performance"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "process-operator",
      title: "Process Operator",
      emoji: "🏭",
      description: "Monitor and control industrial processes in manufacturing and energy plants.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training + Apprenticeship = Fagbrev",
      keySkills: ["attention to detail", "technical knowledge", "safety awareness", "problem-solving", "teamwork"],
      dailyTasks: ["Monitor equipment", "Adjust processes", "Perform quality checks", "Follow safety procedures"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "carpenter",
      title: "Carpenter",
      emoji: "🪚",
      description: "Build and repair wooden structures and frameworks for buildings.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["woodworking", "blueprint reading", "physical fitness", "precision", "safety"],
      dailyTasks: ["Build structures", "Install frameworks", "Read blueprints", "Use power tools"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "hvac-technician",
      title: "HVAC Technician",
      emoji: "❄️",
      description: "Install, maintain, and repair heating, ventilation, and air conditioning systems.",
      avgSalary: "450,000 - 620,000 kr/year",
      educationPath: "Vocational training + Apprenticeship = Fagbrev",
      keySkills: ["HVAC systems", "electrical knowledge", "troubleshooting", "physical fitness", "customer service"],
      dailyTasks: ["Install HVAC systems", "Diagnose problems", "Perform maintenance", "Replace components", "Test systems"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "painter",
      title: "Painter",
      emoji: "🎨",
      description: "Apply paint, wallpaper, and other finishes to interior and exterior surfaces.",
      avgSalary: "380,000 - 520,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["surface preparation", "color matching", "attention to detail", "physical stamina", "safety"],
      dailyTasks: ["Prepare surfaces", "Mix and apply paint", "Hang wallpaper", "Apply protective coatings", "Clean equipment"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "welder",
      title: "Welder",
      emoji: "🔥",
      description: "Join metal parts using various welding techniques in construction and manufacturing.",
      avgSalary: "420,000 - 600,000 kr/year",
      educationPath: "Vocational training + Welding certifications",
      keySkills: ["welding techniques", "blueprint reading", "precision", "safety awareness", "physical stamina"],
      dailyTasks: ["Weld metal components", "Read blueprints", "Inspect welds", "Maintain equipment", "Follow safety protocols"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "auto-mechanic",
      title: "Auto Mechanic",
      emoji: "🚗",
      description: "Diagnose, repair, and maintain vehicles including cars, trucks, and motorcycles.",
      avgSalary: "400,000 - 580,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2.5 years) = Fagbrev",
      keySkills: ["vehicle systems", "diagnostics", "problem-solving", "technical knowledge", "customer service"],
      dailyTasks: ["Diagnose vehicle issues", "Perform repairs", "Replace parts", "Conduct inspections", "Use diagnostic tools"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "energy-trading-manager",
      title: "Energy Trading Manager",
      emoji: "⚡",
      description: "Manage energy trading operations buying and selling electricity, gas, and renewables on wholesale markets.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Master's in Energy/Finance + Energy trading experience",
      keySkills: ["energy markets", "trading strategy", "risk management", "market analysis", "regulatory knowledge"],
      dailyTasks: ["Execute energy trades", "Analyse market conditions", "Manage trading positions", "Assess risk exposure", "Report to leadership"],
      growthOutlook: "high",
    },
    {
      id: "power-systems-architect",
      title: "Power Systems Architect",
      emoji: "🔌",
      description: "Design power system architectures for generation, transmission, and distribution including renewable integration.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Master's in Electrical/Power Engineering + Power systems experience",
      keySkills: ["power systems design", "grid architecture", "renewable integration", "protection systems", "simulation tools"],
      dailyTasks: ["Design power system architectures", "Model grid scenarios", "Plan renewable integration", "Review system studies", "Coordinate with grid operators"],
      growthOutlook: "high",
    },
    {
      id: "grid-transformation-lead",
      title: "Grid Transformation Lead",
      emoji: "⚡",
      description: "Lead grid modernisation programmes transitioning electricity networks to smart, distributed, and renewable-ready infrastructure.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Master's in Engineering/Energy + Grid modernisation experience",
      keySkills: ["grid modernisation", "smart grid", "programme management", "renewable integration", "stakeholder management"],
      dailyTasks: ["Lead grid transformation programmes", "Coordinate smart grid deployment", "Manage stakeholders", "Drive renewable integration", "Report to energy leadership"],
      growthOutlook: "high",
    },
    {
      id: "infrastructure-program-director",
      title: "Infrastructure Program Director",
      emoji: "🏗️",
      description: "Direct large-scale infrastructure programmes managing complex construction, engineering, and technology projects.",
      avgSalary: "1,100,000 - 1,800,000 kr/year",
      educationPath: "Master's in Engineering/PM + 12+ years infrastructure programme experience",
      keySkills: ["infrastructure programmes", "stakeholder management", "budget management", "risk management", "regulatory compliance"],
      dailyTasks: ["Direct infrastructure programmes", "Manage budgets and timelines", "Coordinate with regulators", "Lead programme teams", "Report to executives"],
      growthOutlook: "high",
    },
    {
      id: "construction-program-director",
      title: "Construction Program Director",
      emoji: "🏗️",
      description: "Direct construction programmes managing portfolios of building projects from planning through to handover.",
      avgSalary: "1,000,000 - 1,700,000 kr/year",
      educationPath: "Master's in Construction/Engineering + 12+ years construction programme experience",
      keySkills: ["construction management", "programme delivery", "health and safety", "contract management", "budget control"],
      dailyTasks: ["Direct construction programmes", "Manage contractor relationships", "Ensure H&S compliance", "Control programme budgets", "Report to executive sponsors"],
      growthOutlook: "stable",
    },
    {
      id: "engineering-director",
      title: "Industrial Engineering Director",
      emoji: "⚙️",
      description: "Lead engineering departments in manufacturing, energy, or infrastructure organisations driving technical excellence.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Engineering + 10+ years engineering leadership",
      keySkills: ["engineering leadership", "technical strategy", "team management", "safety management", "project portfolio"],
      dailyTasks: ["Lead engineering department", "Set technical strategy", "Manage engineering budget", "Ensure safety standards", "Develop engineering talent"],
      growthOutlook: "stable",
    },
    {
      id: "asset-management-director",
      title: "Asset Management Director",
      emoji: "🏭",
      description: "Lead asset management strategy for physical infrastructure optimising lifecycle costs, reliability, and performance.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Engineering/Business + Asset management experience (ISO 55000)",
      keySkills: ["asset management", "lifecycle planning", "reliability engineering", "risk management", "capital planning"],
      dailyTasks: ["Set asset management strategy", "Optimise asset lifecycle costs", "Plan capital investments", "Monitor asset performance", "Drive reliability improvements"],
      growthOutlook: "high",
    },
    {
      id: "esg-director",
      title: "ESG Director",
      emoji: "🌱",
      description: "Lead environmental, social, and governance strategy defining sustainability targets, reporting, and stakeholder engagement.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Master's in Sustainability/Business + ESG experience",
      keySkills: ["ESG strategy", "sustainability reporting", "stakeholder engagement", "regulatory compliance", "climate risk"],
      dailyTasks: ["Set ESG strategy", "Manage sustainability reporting", "Engage investors on ESG", "Drive emissions reduction", "Ensure ESG compliance"],
      growthOutlook: "high",
    },
    {
      id: "industrial-electrician",
      title: "Industrial Electrician",
      emoji: "⚡",
      description: "Installs, maintains, and repairs electrical systems and equipment in industrial facilities such as factories, plants, and processing sites.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "Fagbrev in electrical work (electrician's trade certificate) with industrial specialisation",
      keySkills: ["electrical troubleshooting", "motor control systems", "industrial wiring", "safety regulations", "blueprint reading"],
      dailyTasks: ["Maintaining and repairing industrial electrical equipment", "Troubleshooting faults in motor control circuits", "Installing new electrical systems in production areas", "Performing preventive maintenance on switchgear and panels"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "high-voltage-electrician",
      title: "High Voltage Electrician",
      emoji: "🔌",
      description: "Specializes in the installation, maintenance, and repair of high-voltage electrical systems and distribution networks.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Fagbrev in electrical work plus specialized high-voltage safety certification and supervised experience",
      keySkills: ["high-voltage safety protocols", "transformer maintenance", "cable jointing", "switching operations", "electrical testing"],
      dailyTasks: ["Performing switching operations on high-voltage networks", "Maintaining and testing transformers and switchgear", "Installing and terminating high-voltage cables", "Conducting insulation resistance and fault location tests"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "power-line-technician",
      title: "Power Line Technician",
      emoji: "🗼",
      description: "Constructs, maintains, and repairs overhead and underground power transmission and distribution lines.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev in electrical power line work or energy technician certification with field training",
      keySkills: ["overhead line construction", "climbing and rigging", "underground cable installation", "live-line techniques", "weather assessment"],
      dailyTasks: ["Erecting poles and stringing overhead conductors", "Repairing storm-damaged power lines", "Installing and splicing underground distribution cables", "Performing routine inspections of transmission corridors"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "substation-technician",
      title: "Substation Technician",
      emoji: "🏗️",
      description: "Maintains and operates electrical substations that transform voltage levels for power transmission and distribution.",
      avgSalary: "530,000 - 720,000 kr/year",
      educationPath: "Fagbrev in electrical work or energy operations with substation-specific training and safety clearance",
      keySkills: ["relay testing", "transformer diagnostics", "circuit breaker maintenance", "protection systems", "SCADA interface operation"],
      dailyTasks: ["Testing and calibrating protection relays", "Performing oil sampling and analysis on transformers", "Maintaining circuit breakers and disconnect switches", "Monitoring substation performance through SCADA systems"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "electrical-commissioning-technician",
      title: "Electrical Commissioning Technician",
      emoji: "✅",
      description: "Tests, verifies, and commissions new or upgraded electrical systems to ensure they meet design specifications before handover.",
      avgSalary: "560,000 - 780,000 kr/year",
      educationPath: "Fagbrev in electrical work plus commissioning experience and knowledge of IEC standards and test procedures",
      keySkills: ["commissioning procedures", "electrical testing instruments", "IEC standards", "technical documentation", "punch-list management"],
      dailyTasks: ["Performing pre-commissioning checks on electrical installations", "Running functional tests on switchgear and protection systems", "Documenting test results and compiling commissioning dossiers", "Coordinating with engineering and construction teams for system handover"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "protection-and-control-technician",
      title: "Protection and Control Technician",
      emoji: "🛡️",
      description: "Configures, tests, and maintains protection relay systems and control schemes that safeguard electrical power networks.",
      avgSalary: "580,000 - 800,000 kr/year",
      educationPath: "Fagbrev in electrical work or automation with advanced training in protection engineering and relay systems",
      keySkills: ["protection relay configuration", "fault analysis", "IEC 61850 communication", "secondary injection testing", "control scheme design"],
      dailyTasks: ["Programming and testing numerical protection relays", "Analyzing fault records and disturbance data", "Commissioning new protection schemes in substations", "Maintaining and upgrading legacy protection systems"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "instrumentation-technician",
      title: "Instrumentation Technician",
      emoji: "📊",
      description: "Installs, calibrates, and maintains measurement and control instruments used in industrial processes.",
      avgSalary: "480,000 - 670,000 kr/year",
      educationPath: "Fagbrev in automation or instrumentation technology with practical apprenticeship",
      keySkills: ["instrument calibration", "process measurement", "4-20mA loop troubleshooting", "P&ID interpretation", "safety instrumented systems"],
      dailyTasks: ["Calibrating pressure, temperature, and flow transmitters", "Troubleshooting instrument loops and signal paths", "Installing new process instrumentation per engineering drawings", "Maintaining safety-critical instruments and valves"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "industrial-instrumentation-technician",
      title: "Industrial Instrumentation Technician",
      emoji: "🏭",
      description: "Specializes in maintaining and optimizing complex instrumentation systems within large-scale industrial and manufacturing environments.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev in automation or instrumentation with industrial plant experience and vendor-specific training",
      keySkills: ["advanced process control", "analysers and gas detection", "fieldbus communication", "SIS maintenance", "technical reporting"],
      dailyTasks: ["Maintaining analytical instruments and gas detection systems", "Performing loop checks and functional testing on safety systems", "Troubleshooting fieldbus and HART communication issues", "Supporting turnaround and shutdown maintenance activities"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "plc-technician",
      title: "PLC Technician",
      emoji: "🖥️",
      description: "Programs, troubleshoots, and maintains programmable logic controllers that automate industrial machinery and processes.",
      avgSalary: "520,000 - 730,000 kr/year",
      educationPath: "Fagbrev in automation or electrical work with PLC programming courses and vendor certifications (Siemens, Allen-Bradley)",
      keySkills: ["PLC programming (ladder, structured text)", "HMI configuration", "industrial networking", "system integration", "process troubleshooting"],
      dailyTasks: ["Diagnosing and resolving PLC logic faults", "Modifying control programs to meet production changes", "Configuring and testing HMI displays", "Integrating new I/O modules and field devices into existing systems"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "scada-technician",
      title: "SCADA Technician",
      emoji: "📡",
      description: "Installs, configures, and maintains supervisory control and data acquisition systems used for remote monitoring and control of infrastructure.",
      avgSalary: "550,000 - 770,000 kr/year",
      educationPath: "Fagbrev in automation or IT with SCADA platform training and industrial communication protocol knowledge",
      keySkills: ["SCADA platform administration", "communication protocols (Modbus, DNP3, OPC)", "network configuration", "cybersecurity awareness", "database management"],
      dailyTasks: ["Monitoring and maintaining SCADA servers and communication links", "Configuring alarm management and trending displays", "Troubleshooting data communication between field devices and control center", "Implementing system updates and security patches"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "automation-technician",
      title: "Automation Technician",
      emoji: "🤖",
      description: "Designs, installs, and maintains automated control systems that optimise industrial production and process efficiency.",
      avgSalary: "510,000 - 720,000 kr/year",
      educationPath: "Fagbrev in automation technology with apprenticeship in industrial automation",
      keySkills: ["DCS and PLC systems", "control loop tuning", "VFD configuration", "industrial networking", "process optimisation"],
      dailyTasks: ["Tuning PID control loops for optimal process performance", "Programming and configuring variable frequency drives", "Maintaining distributed control systems and field instruments", "Collaborating with engineers on automation upgrades"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "offshore-electrician",
      title: "Offshore Electrician",
      emoji: "🛢️",
      description: "Maintains and repairs electrical systems on offshore oil and gas platforms, ensuring safe and reliable power distribution in a demanding environment.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Fagbrev in electrical work plus offshore safety training (BOSIET/HUET), Ex-equipment certification, and offshore experience",
      keySkills: ["Ex-rated equipment maintenance", "offshore power distribution", "emergency generator systems", "permit-to-work procedures", "hazardous area classification"],
      dailyTasks: ["Maintaining electrical systems in hazardous classified areas", "Troubleshooting power distribution and lighting systems", "Performing preventive maintenance on generators and UPS units", "Completing work permits and safety documentation"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "offshore-instrumentation-technician",
      title: "Offshore Instrumentation Technician",
      emoji: "🔬",
      description: "Calibrates, maintains, and repairs instrumentation and control systems on offshore oil and gas installations.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Fagbrev in automation or instrumentation plus offshore safety courses (BOSIET/HUET) and Ex-equipment training",
      keySkills: ["offshore instrument calibration", "fire and gas detection systems", "ESD system maintenance", "hazardous area instruments", "SAP/CMMS documentation"],
      dailyTasks: ["Calibrating process transmitters and control valves", "Testing and maintaining fire and gas detection systems", "Performing functional testing of emergency shutdown systems", "Documenting all maintenance activities in the CMMS"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "offshore-mechanical-technician",
      title: "Offshore Mechanical Technician",
      emoji: "🔧",
      description: "Performs mechanical maintenance and repair on rotating equipment, piping, and structural components on offshore platforms.",
      avgSalary: "580,000 - 820,000 kr/year",
      educationPath: "Fagbrev in mechanical trades (industrial mechanic or similar) plus offshore safety training and platform experience",
      keySkills: ["rotating equipment maintenance", "pump and compressor overhaul", "hydraulic systems", "alignment and vibration analysis", "crane and lifting operations"],
      dailyTasks: ["Overhauling pumps, compressors, and turbines", "Performing precision alignment on rotating equipment", "Maintaining hydraulic and pneumatic systems", "Conducting vibration monitoring and analysis"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "offshore-maintenance-technician",
      title: "Offshore Maintenance Technician",
      emoji: "🛠️",
      description: "Carries out planned and corrective maintenance across multiple disciplines on offshore installations to ensure operational uptime.",
      avgSalary: "560,000 - 800,000 kr/year",
      educationPath: "Fagbrev in a relevant technical trade plus offshore safety certification (BOSIET/HUET) and multidiscipline maintenance experience",
      keySkills: ["multidiscipline maintenance", "work order management", "preventive maintenance planning", "isolation and lock-out/tag-out", "spare parts logistics"],
      dailyTasks: ["Executing planned preventive maintenance work orders", "Responding to corrective maintenance call-outs", "Coordinating with operations on equipment isolation and permits", "Updating maintenance records and backlog in CMMS"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "rig-electrician",
      title: "Rig Electrician",
      emoji: "⚡",
      description: "Maintains and troubleshoots electrical power generation, distribution, and control systems on mobile drilling rigs.",
      avgSalary: "620,000 - 870,000 kr/year",
      educationPath: "Fagbrev in electrical work plus rig-specific electrical training, offshore safety courses, and drilling environment experience",
      keySkills: ["SCR/VFD drive systems", "rig power management", "top drive electrical systems", "explosion-proof equipment", "rig emergency power systems"],
      dailyTasks: ["Maintaining SCR and VFD drive systems for drilling equipment", "Troubleshooting top drive and drawworks electrical faults", "Performing preventive maintenance on diesel-electric generators", "Ensuring compliance with hazardous area electrical standards"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rig-instrumentation-technician",
      title: "Rig Instrumentation Technician",
      emoji: "📈",
      description: "Maintains and calibrates instrumentation and control systems specific to drilling rig operations, including well monitoring equipment.",
      avgSalary: "610,000 - 860,000 kr/year",
      educationPath: "Fagbrev in automation or instrumentation plus drilling rig instrumentation training and offshore safety certification",
      keySkills: ["drilling instrumentation", "well monitoring systems", "BOP control systems", "rig alarm management", "mud logging instruments"],
      dailyTasks: ["Calibrating drilling instrumentation and well monitoring sensors", "Maintaining BOP control system instruments and valves", "Troubleshooting rig alarm and safety systems", "Supporting drilling operations with real-time data acquisition"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "drilling-technician",
      title: "Drilling Technician",
      emoji: "🕳️",
      description: "Operates and maintains drilling equipment and systems, supporting the safe and efficient execution of well drilling programs.",
      avgSalary: "580,000 - 830,000 kr/year",
      educationPath: "Fagbrev in drilling or mechanical trades with well control certification (IWCF/WellCAP) and rig floor experience",
      keySkills: ["drilling equipment operation", "well control procedures", "mud system management", "BOP operation", "drill string handling"],
      dailyTasks: ["Operating and monitoring drilling equipment during well operations", "Maintaining mud circulation and solids control systems", "Assisting with BOP testing and well control drills", "Inspecting and maintaining drill string components"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "well-intervention-technician",
      title: "Well Intervention Technician",
      emoji: "🔩",
      description: "Performs specialized well maintenance and intervention operations to restore or enhance production from existing oil and gas wells.",
      avgSalary: "600,000 - 860,000 kr/year",
      educationPath: "Fagbrev in a relevant technical trade with well intervention training, well control certification, and wireline/coiled tubing experience",
      keySkills: ["wireline operations", "coiled tubing operations", "well integrity management", "pressure control equipment", "downhole tool knowledge"],
      dailyTasks: ["Rigging up and operating wireline or coiled tubing equipment", "Running downhole tools for well diagnostics and remediation", "Monitoring well pressure and maintaining barrier integrity", "Preparing job procedures and post-job reports"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "subsea-technician",
      title: "Subsea Technician",
      emoji: "🌊",
      description: "Installs, maintains, and repairs subsea production equipment and infrastructure on the seabed.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Fagbrev in a relevant technical trade with subsea systems training, hydraulic certification, and offshore experience",
      keySkills: ["subsea production systems", "hydraulic power units", "subsea valve operation", "umbilical and flowline systems", "subsea tooling"],
      dailyTasks: ["Preparing and testing subsea equipment for deployment", "Operating hydraulic power units and control systems for subsea interventions", "Performing topside maintenance on subsea control modules", "Documenting equipment status and maintenance history"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "subsea-controls-technician",
      title: "Subsea Controls Technician",
      emoji: "🎛️",
      description: "Specializes in the electronic and hydraulic control systems that operate subsea production equipment from topside facilities.",
      avgSalary: "620,000 - 870,000 kr/year",
      educationPath: "Fagbrev in automation or electronics with subsea controls vendor training and hydraulic/electrical systems experience",
      keySkills: ["subsea control modules", "MCS/EPU operation", "subsea communication protocols", "hydraulic troubleshooting", "vendor-specific control systems"],
      dailyTasks: ["Monitoring and troubleshooting subsea control system performance", "Performing maintenance on master control stations and electrical power units", "Testing subsea communication links and sensor readings", "Coordinating with subsea engineers on intervention planning"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rov-pilot-technician",
      title: "ROV Pilot Technician",
      emoji: "🤿",
      description: "Operates remotely operated vehicles to perform underwater inspections, maintenance, and construction tasks in deep-sea environments.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "ROV pilot training program or fagbrev in electronics/automation with ROV manufacturer certification and supervised offshore piloting hours",
      keySkills: ["ROV piloting", "subsea navigation", "manipulator arm operation", "sonar and camera systems", "hydraulic system maintenance"],
      dailyTasks: ["Piloting the ROV during subsea inspection and intervention operations", "Operating manipulator arms to perform tooling tasks on the seabed", "Maintaining ROV hydraulic, electrical, and communication systems", "Recording and reporting subsea survey data and observations"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rov-supervisor",
      title: "ROV Supervisor",
      emoji: "🎯",
      description: "Leads ROV operations offshore, managing pilot teams and coordinating underwater vehicle missions to meet project objectives safely.",
      avgSalary: "700,000 - 950,000 kr/year",
      educationPath: "Extensive ROV pilot experience (typically 5+ years) with supervisory training and project management skills",
      keySkills: ["ROV operations management", "team leadership", "project coordination", "risk assessment", "client communication"],
      dailyTasks: ["Planning and coordinating daily ROV dive operations", "Supervising ROV pilot teams during subsea missions", "Liaising with clients and vessel crew on operational priorities", "Ensuring compliance with safety procedures and documenting operations"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "fpso-technician",
      title: "FPSO Technician",
      emoji: "🚢",
      description: "Maintains and operates process, mechanical, and utility systems aboard floating production, storage, and offloading vessels.",
      avgSalary: "580,000 - 830,000 kr/year",
      educationPath: "Fagbrev in a relevant technical trade (process, mechanical, or electrical) with FPSO-specific training and offshore safety certification",
      keySkills: ["oil and gas processing systems", "turret and swivel maintenance", "offloading operations", "marine utility systems", "permit-to-work systems"],
      dailyTasks: ["Maintaining process separation and treatment equipment", "Monitoring and operating utility systems including HVAC and water treatment", "Supporting crude oil offloading to shuttle tankers", "Performing preventive maintenance per the vessel maintenance program"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "offshore-production-technician",
      title: "Offshore Production Technician",
      emoji: "🛢️",
      description: "Operates and monitors oil and gas production systems on offshore platforms to ensure safe, continuous, and optimised hydrocarbon output.",
      avgSalary: "560,000 - 790,000 kr/year",
      educationPath: "Fagbrev in process technology (prosessfag) or chemical process operation with offshore safety training",
      keySkills: ["process operation", "production optimisation", "separator and compressor operation", "chemical injection systems", "alarm response and management"],
      dailyTasks: ["Monitoring and adjusting process parameters for optimal production", "Operating separators, compressors, and export systems", "Performing operator rounds and recording process readings", "Responding to process alarms and initiating corrective actions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "offshore-operations-technician",
      title: "Offshore Operations Technician",
      emoji: "🔄",
      description: "Supports the overall daily operations of an offshore installation, coordinating across departments to maintain platform safety and efficiency.",
      avgSalary: "550,000 - 780,000 kr/year",
      educationPath: "Fagbrev in a relevant technical trade with broad operational experience and offshore safety certification",
      keySkills: ["platform operations support", "logistics coordination", "deck operations", "safety system awareness", "cross-discipline collaboration"],
      dailyTasks: ["Coordinating lifting operations and cargo handling on deck", "Supporting hot work, confined space, and other permit-controlled activities", "Assisting with helicopter and vessel logistics", "Participating in emergency response drills and safety meetings"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "control-room-operator",
      title: "Control Room Operator",
      emoji: "🖥️",
      description: "Monitors and controls industrial or offshore process operations from a centralized control room using DCS and SCADA systems.",
      avgSalary: "550,000 - 780,000 kr/year",
      educationPath: "Fagbrev in process technology or automation with control room operator certification and extensive process knowledge",
      keySkills: ["DCS/SCADA operation", "alarm management", "emergency shutdown response", "process monitoring", "shift handover communication"],
      dailyTasks: ["Monitoring process parameters and system status on DCS screens", "Responding to alarms and initiating corrective control actions", "Executing startup, shutdown, and emergency procedures", "Communicating with field operators and coordinating shift handovers"],
      growthOutlook: "stable",
      entryLevel: false,
    },

    {
      id: "offshore-wind-technician",
      title: "Offshore Wind Technician",
      emoji: "🌊",
      description: "Performs maintenance, troubleshooting, and repair of wind turbines located in offshore wind farms.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev in electrician or mechanical trades, plus GWO safety training and offshore certification",
      keySkills: ["turbine maintenance", "hydraulic systems", "safety compliance", "rope access", "electrical fault-finding"],
      dailyTasks: ["Inspect and maintain turbine components", "Replace worn gearbox and bearing parts", "Perform scheduled preventive maintenance", "Document all service activities in maintenance systems"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "senior-wind-turbine-technician",
      title: "Senior Wind Turbine Technician",
      emoji: "⚙️",
      description: "Leads complex turbine repairs and mentors junior technicians across onshore and offshore wind installations.",
      avgSalary: "620,000 - 800,000 kr/year",
      educationPath: "Fagbrev in relevant trade with 5+ years of wind turbine experience and advanced OEM training",
      keySkills: ["advanced diagnostics", "team leadership", "SCADA analysis", "blade repair", "root cause analysis"],
      dailyTasks: ["Diagnose complex turbine faults", "Supervise major component exchanges", "Train and mentor junior technicians", "Coordinate with engineering on recurring issues"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "high-voltage-wind-technician",
      title: "High Voltage Wind Technician",
      emoji: "⚡",
      description: "Specializes in the installation, testing, and maintenance of high-voltage electrical systems within wind farms.",
      avgSalary: "580,000 - 780,000 kr/year",
      educationPath: "Fagbrev as electrician with FSE high-voltage authorisation and wind energy specialisation",
      keySkills: ["high-voltage switching", "transformer maintenance", "cable termination", "relay protection", "electrical safety protocols"],
      dailyTasks: ["Perform high-voltage switching operations", "Test and maintain transformers and switchgear", "Inspect subsea and land-based cable systems", "Conduct insulation resistance and protection relay testing"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "wind-commissioning-technician",
      title: "Wind Commissioning Technician",
      emoji: "🔌",
      description: "Oversees the startup, testing, and handover of newly installed wind turbines and associated electrical systems.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Fagbrev in electrical or automation trades with OEM commissioning certification and project experience",
      keySkills: ["commissioning procedures", "PLC programming", "functional testing", "punch-list management", "technical documentation"],
      dailyTasks: ["Execute turbine commissioning checklists", "Perform functional and load testing of systems", "Resolve punch-list items before handover", "Produce commissioning reports and documentation"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "wind-service-supervisor",
      title: "Wind Service Supervisor",
      emoji: "📋",
      description: "Manages wind farm service teams, coordinates maintenance campaigns, and ensures HSE compliance across sites.",
      avgSalary: "650,000 - 900,000 kr/year",
      educationPath: "Fagbrev with extensive turbine experience, supplemented by leadership training and HSE certifications",
      keySkills: ["team management", "maintenance planning", "HSE leadership", "stakeholder communication", "budget oversight"],
      dailyTasks: ["Plan and assign daily maintenance tasks to technicians", "Conduct safety briefings and toolbox talks", "Report project progress to site management", "Manage spare parts logistics and inventory"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "grid-connection-technician",
      title: "Grid Connection Technician",
      emoji: "🔗",
      description: "Installs, tests, and maintains the electrical infrastructure that connects power generation assets to the grid.",
      avgSalary: "530,000 - 730,000 kr/year",
      educationPath: "Fagbrev as electrician or energy operator with grid-specific training and FSE authorisation",
      keySkills: ["substation maintenance", "protection systems", "power quality analysis", "cable jointing", "grid code compliance"],
      dailyTasks: ["Install and terminate high-voltage cables", "Test protection relays and metering equipment", "Perform routine substation inspections", "Coordinate outage planning with grid operators"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "power-plant-technician",
      title: "Power Plant Technician",
      emoji: "🏭",
      description: "Operates and maintains equipment in thermal, hydro, or combined-cycle power plants to ensure reliable energy production.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev as process operator or energy operator with power plant-specific training",
      keySkills: ["plant operations", "process monitoring", "mechanical maintenance", "control systems", "safety procedures"],
      dailyTasks: ["Monitor plant control systems and parameters", "Perform routine inspections of turbines and boilers", "Execute planned maintenance on rotating equipment", "Respond to alarms and abnormal operating conditions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "gas-turbine-technician",
      title: "Gas Turbine Technician",
      emoji: "🔥",
      description: "Maintains, overhauls, and troubleshoots industrial gas turbines used in power generation and offshore platforms.",
      avgSalary: "560,000 - 780,000 kr/year",
      educationPath: "Fagbrev in mechanical trades with OEM-specific gas turbine training and thermodynamics knowledge",
      keySkills: ["turbine overhaul", "combustion system maintenance", "vibration analysis", "precision alignment", "borescope inspection"],
      dailyTasks: ["Perform scheduled inspections on gas turbine components", "Conduct hot gas path and combustion inspections", "Align and balance rotating assemblies", "Analyse performance data to identify degradation trends"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "steam-turbine-technician",
      title: "Steam Turbine Technician",
      emoji: "♨️",
      description: "Services and repairs steam turbines and auxiliary systems in power stations and industrial facilities.",
      avgSalary: "540,000 - 750,000 kr/year",
      educationPath: "Fagbrev in mechanical trades with specialized steam turbine training and thermodynamic fundamentals",
      keySkills: ["steam path maintenance", "valve overhaul", "precision measurement", "thermal expansion management", "condition monitoring"],
      dailyTasks: ["Inspect and measure turbine blade clearances", "Overhaul steam valves and governor systems", "Perform bearing inspections and oil analysis", "Coordinate with operations during turbine startups and shutdowns"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "energy-commissioning-technician",
      title: "Energy Commissioning Technician",
      emoji: "✅",
      description: "Tests and verifies power generation and distribution systems during construction and handover of energy facilities.",
      avgSalary: "560,000 - 760,000 kr/year",
      educationPath: "Fagbrev in electrical or automation trades with commissioning experience and project methodology training",
      keySkills: ["system verification", "loop testing", "commissioning planning", "SCADA integration", "technical reporting"],
      dailyTasks: ["Execute pre-commissioning and commissioning test procedures", "Verify instrument loops and control system functionality", "Coordinate testing schedules with construction teams", "Document test results and manage punch-list items"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "marine-engineer",
      title: "Marine Engineer",
      emoji: "🚢",
      description: "Operates and maintains the mechanical and electrical systems aboard ships, ensuring safe and efficient vessel operation.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Maritime engineering degree or fagbrev as motormann with STCW certification and sea service",
      keySkills: ["diesel engine maintenance", "auxiliary systems", "watchkeeping", "fuel management", "machinery troubleshooting"],
      dailyTasks: ["Stand engine room watches and monitor machinery", "Maintain main engines, generators, and pumps", "Manage fuel and lubricant systems", "Log operational data and report deficiencies"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "chief-marine-engineer",
      title: "Chief Marine Engineer",
      emoji: "⚓",
      description: "Leads the entire engine department aboard a vessel, responsible for all technical operations and regulatory compliance.",
      avgSalary: "750,000 - 1,000,000 kr/year",
      educationPath: "Chief Engineer Certificate of Competency with extensive sea service and management-level STCW qualifications",
      keySkills: ["engine department leadership", "planned maintenance systems", "regulatory compliance", "budget management", "drydock supervision"],
      dailyTasks: ["Oversee all engine room operations and personnel", "Plan and prioritize maintenance activities", "Ensure compliance with class and flag state requirements", "Manage technical budgets and spare parts procurement"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "ships-electrical-engineer",
      title: "Ship's Electrical Engineer",
      emoji: "💡",
      description: "Manages and maintains all electrical power generation, distribution, and control systems aboard a vessel.",
      avgSalary: "600,000 - 800,000 kr/year",
      educationPath: "Electrical engineering degree or fagbrev as electrician with maritime electrical certification and STCW training",
      keySkills: ["power generation systems", "switchboard maintenance", "motor control", "automation systems", "electrical safety at sea"],
      dailyTasks: ["Maintain generators, switchboards, and distribution systems", "Troubleshoot electrical faults and automation failures", "Perform insulation testing and thermal imaging surveys", "Manage planned electrical maintenance schedules"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "marine-electrician",
      title: "Marine Electrician",
      emoji: "🔧",
      description: "Installs, repairs, and maintains electrical wiring, lighting, and equipment aboard ships and offshore vessels.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Fagbrev as electrician with maritime specialisation and basic STCW safety training",
      keySkills: ["marine wiring", "motor maintenance", "lighting systems", "cable installation", "electrical testing"],
      dailyTasks: ["Repair and replace electrical components and cabling", "Maintain navigation and communication equipment wiring", "Perform routine testing of electrical safety devices", "Assist with installation of new electrical systems during refits"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "electro-technical-officer",
      title: "Electro-Technical Officer",
      emoji: "🖥️",
      description: "Serves as the certified electrical and electronics officer aboard STCW-regulated vessels, bridging engineering and IT systems.",
      avgSalary: "600,000 - 820,000 kr/year",
      educationPath: "ETO Certificate of Competency per STCW, typically requiring an electrical/electronics degree plus approved sea service",
      keySkills: ["power management systems", "automation and PLC", "electronics repair", "network systems", "STCW compliance"],
      dailyTasks: ["Maintain and troubleshoot vessel automation and control systems", "Manage power management and UPS systems", "Service communication, navigation, and GMDSS equipment", "Coordinate with class societies for electrical surveys"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "dynamic-positioning-operator",
      title: "Dynamic Positioning Operator",
      emoji: "🎯",
      description: "Operates the dynamic positioning system on offshore vessels, maintaining precise station-keeping during critical operations.",
      avgSalary: "650,000 - 900,000 kr/year",
      educationPath: "Nautical officer certification with Nautical Institute DP operator certificate (phases 1-3) and extensive sea time",
      keySkills: ["DP system operation", "situational awareness", "risk assessment", "vessel maneuvering", "emergency procedures"],
      dailyTasks: ["Operate DP system during offshore operations", "Monitor position references and environmental conditions", "Conduct DP trials and capability plots", "Maintain DP logbooks and incident reports"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "shipyard-commissioning-technician",
      title: "Shipyard Commissioning Technician",
      emoji: "🛳️",
      description: "Tests and commissions mechanical, electrical, and automation systems during newbuild and refit projects in shipyards.",
      avgSalary: "520,000 - 720,000 kr/year",
      educationPath: "Fagbrev in electrical, mechanical, or automation trades with shipyard project experience",
      keySkills: ["system commissioning", "harbour and sea trials", "test procedures", "multi-discipline coordination", "deficiency tracking"],
      dailyTasks: ["Execute commissioning test procedures for onboard systems", "Verify system performance during harbour and sea trials", "Record and track deficiency items for rectification", "Coordinate with multiple trades and subcontractors"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "port-crane-technician",
      title: "Port Crane Technician",
      emoji: "🏗️",
      description: "Maintains and repairs large container cranes, ship-to-shore gantries, and mobile harbour cranes at port terminals.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev in electrical or mechanical trades with crane-specific training and working-at-height certification",
      keySkills: ["crane mechanical systems", "drive systems", "PLC diagnostics", "structural inspection", "preventive maintenance"],
      dailyTasks: ["Perform scheduled maintenance on crane mechanical and electrical systems", "Diagnose and repair drive system and PLC faults", "Inspect wire ropes, sheaves, and structural components", "Coordinate maintenance windows with port operations"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "vessel-maintenance-supervisor",
      title: "Vessel Maintenance Supervisor",
      emoji: "📊",
      description: "Plans and oversees all maintenance activities aboard a vessel or across a fleet, ensuring regulatory compliance and uptime.",
      avgSalary: "650,000 - 880,000 kr/year",
      educationPath: "Marine engineering background with extensive maintenance experience and planned maintenance system expertise",
      keySkills: ["maintenance planning", "PMS administration", "class survey coordination", "team supervision", "budget control"],
      dailyTasks: ["Schedule and prioritize maintenance work orders", "Supervise technicians and track task completion", "Prepare vessels for class and flag state surveys", "Manage maintenance budgets and spare parts inventory"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "aircraft-maintenance-engineer",
      title: "Aircraft Maintenance Engineer",
      emoji: "✈️",
      description: "Performs scheduled and unscheduled maintenance on aircraft airframes, engines, and systems to ensure airworthiness.",
      avgSalary: "520,000 - 720,000 kr/year",
      educationPath: "EASA Part-66 Category A licence or fagbrev as flymotormekaniker with type-rating training",
      keySkills: ["airframe inspection", "engine maintenance", "aviation tooling", "technical documentation", "airworthiness standards"],
      dailyTasks: ["Carry out line and base maintenance tasks per work packages", "Inspect aircraft structures and systems for defects", "Replace and service aircraft components", "Complete maintenance documentation in compliance with EASA requirements"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "licensed-aircraft-engineer",
      title: "Licensed Aircraft Engineer",
      emoji: "🛫",
      description: "Holds a certifying authority to approve aircraft for return to service after maintenance, carrying full legal responsibility.",
      avgSalary: "650,000 - 850,000 kr/year",
      educationPath: "EASA Part-66 Category B1 or B2 licence with type ratings and extensive approved maintenance experience",
      keySkills: ["certifying authority", "regulatory compliance", "complex troubleshooting", "type-rated maintenance", "quality assurance"],
      dailyTasks: ["Certify aircraft as serviceable after maintenance actions", "Approve and sign off complex defect rectifications", "Review work packages for completeness and compliance", "Mentor mechanics and ensure procedural adherence"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "avionics-technician",
      title: "Avionics Technician",
      emoji: "📡",
      description: "Installs, tests, and repairs electronic systems in aircraft including navigation, communication, and flight instruments.",
      avgSalary: "530,000 - 740,000 kr/year",
      educationPath: "EASA Part-66 Category B2 pathway or fagbrev in avionics with approved training organisation courses",
      keySkills: ["avionics troubleshooting", "wiring and connectors", "software loading", "instrument calibration", "flight management systems"],
      dailyTasks: ["Troubleshoot and repair avionics system faults", "Install and configure navigation and communication equipment", "Perform built-in test and functional checks on avionics", "Update aircraft software and databases"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "aircraft-structures-technician",
      title: "Aircraft Structures Technician",
      emoji: "🔩",
      description: "Repairs and fabricates aircraft structural components including fuselage panels, composite parts, and flight control surfaces.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Fagbrev or Part-66 training in aircraft structures with composite repair and sheet metal specialisation",
      keySkills: ["sheet metal repair", "composite repair", "NDT awareness", "structural assessment", "corrosion treatment"],
      dailyTasks: ["Repair damaged fuselage and wing structural components", "Fabricate replacement sheet metal and composite parts", "Assess structural damage against approved repair data", "Apply corrosion prevention and surface treatment procedures"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "maintenance-release-engineer",
      title: "Maintenance Release Engineer",
      emoji: "📝",
      description: "Manages the technical release process for aircraft returning to service after heavy maintenance checks or modifications.",
      avgSalary: "680,000 - 880,000 kr/year",
      educationPath: "EASA Part-66 Category B or C licence with base maintenance experience and quality management training",
      keySkills: ["airworthiness management", "work package review", "regulatory interpretation", "quality auditing", "technical records"],
      dailyTasks: ["Review completed maintenance work packages for compliance", "Authorise aircraft release to service certificates", "Liaise with airworthiness authorities on complex repairs", "Audit maintenance documentation and technical records"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "helicopter-maintenance-engineer",
      title: "Helicopter Maintenance Engineer",
      emoji: "🚁",
      description: "Maintains and repairs helicopters used in offshore transport, search and rescue, and emergency medical services.",
      avgSalary: "570,000 - 780,000 kr/year",
      educationPath: "EASA Part-66 licence with helicopter type ratings and offshore operations familiarity",
      keySkills: ["rotor system maintenance", "helicopter powerplant", "vibration analysis", "flight control rigging", "offshore logistics"],
      dailyTasks: ["Perform daily inspections and scheduled maintenance on helicopters", "Service main and tail rotor systems", "Troubleshoot engine and transmission faults", "Maintain helicopters at remote offshore bases"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "industrial-mechanic",
      title: "Industrial Mechanic",
      emoji: "🔧",
      description: "Installs, maintains, and repairs mechanical equipment and machinery in factories, plants, and industrial facilities.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Fagbrev as industrimekaniker through apprenticeship in industrial mechanical trades",
      keySkills: ["mechanical fitting", "welding and fabrication", "hydraulics and pneumatics", "precision alignment", "preventive maintenance"],
      dailyTasks: ["Perform planned maintenance on production machinery", "Diagnose and repair mechanical breakdowns", "Fabricate and fit replacement parts", "Align shafts, couplings, and belt drives"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "heavy-equipment-mechanic",
      title: "Heavy Equipment Mechanic",
      emoji: "🚜",
      description: "Services and repairs heavy machinery such as excavators, wheel loaders, and dump trucks used in construction and mining.",
      avgSalary: "470,000 - 680,000 kr/year",
      educationPath: "Fagbrev as anleggsmaskinmekaniker through apprenticeship in heavy equipment trades",
      keySkills: ["diesel engine repair", "hydraulic systems", "electronic diagnostics", "undercarriage maintenance", "field service"],
      dailyTasks: ["Diagnose and repair hydraulic and engine faults on heavy machinery", "Perform scheduled servicing and fluid changes", "Use diagnostic software to read fault codes", "Carry out field repairs at construction and mining sites"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    {
      id: "crane-technician",
      title: "Crane Technician",
      emoji: "🏗️",
      description: "Maintains, inspects, and repairs cranes and lifting equipment to ensure safe and reliable operation on construction and industrial sites.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Fagbrev in mechanics or lifting equipment, plus manufacturer-specific crane maintenance certifications",
      keySkills: ["hydraulic systems", "electrical diagnostics", "load testing", "preventive maintenance", "safety regulations"],
      dailyTasks: ["Performing scheduled inspections on crane components", "Diagnosing and repairing mechanical and electrical faults", "Conducting load tests and certifying equipment", "Maintaining service logs and compliance documentation"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "crane-operator",
      title: "Crane Operator",
      emoji: "🎮",
      description: "Operates tower cranes, mobile cranes, and other heavy lifting equipment to move materials and components on construction and industrial sites.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Kranfører certificate (crane operator licence) with relevant class endorsements and mandatory safety training",
      keySkills: ["load calculation", "spatial awareness", "rigging knowledge", "radio communication", "safety compliance"],
      dailyTasks: ["Operating cranes to lift and position heavy loads", "Coordinating lifts with riggers and signal personnel", "Performing daily pre-operation safety checks", "Planning lift sequences based on load charts and site conditions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "hydraulic-systems-technician",
      title: "Hydraulic Systems Technician",
      emoji: "💧",
      description: "Installs, maintains, and troubleshoots hydraulic power systems used in industrial machinery, offshore equipment, and mobile plant.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or hydraulics, with additional hydraulic systems certification",
      keySkills: ["hydraulic circuit analysis", "fluid dynamics", "seal and hose replacement", "pressure testing", "schematic reading"],
      dailyTasks: ["Diagnosing hydraulic system failures using pressure and flow testing", "Replacing pumps, valves, cylinders, and hoses", "Commissioning and tuning new hydraulic installations", "Performing fluid analysis and contamination control"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "pneumatic-systems-technician",
      title: "Pneumatic Systems Technician",
      emoji: "🌬️",
      description: "Services and repairs pneumatic control systems and compressed air networks in manufacturing plants and process facilities.",
      avgSalary: "480,000 - 720,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or automation, with supplementary pneumatics training",
      keySkills: ["compressed air systems", "valve and actuator servicing", "leak detection", "control system tuning", "technical drawing interpretation"],
      dailyTasks: ["Troubleshooting pneumatic control circuits and actuators", "Performing leak surveys and repairing compressed air lines", "Calibrating pressure regulators and flow controls", "Installing new pneumatic equipment per engineering specifications"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "rotating-equipment-specialist",
      title: "Rotating Equipment Specialist",
      emoji: "⚙️",
      description: "Specialises in the maintenance, alignment, and vibration analysis of turbines, compressors, pumps, and other rotating machinery in process industries.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics plus extensive experience and certifications in vibration analysis (ISO 18436) and laser alignment",
      keySkills: ["vibration analysis", "laser alignment", "dynamic balancing", "bearing diagnostics", "reliability engineering"],
      dailyTasks: ["Conducting vibration measurements and trend analysis on critical equipment", "Performing precision shaft alignment using laser tools", "Diagnosing bearing and seal failures through condition monitoring data", "Developing maintenance strategies to improve equipment reliability"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "compressor-technician",
      title: "Compressor Technician",
      emoji: "🔩",
      description: "Maintains and overhauls reciprocating, screw, and centrifugal compressors used in oil and gas, refrigeration, and industrial air systems.",
      avgSalary: "520,000 - 780,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or process mechanics, with manufacturer-specific compressor training",
      keySkills: ["compressor overhaul", "thermodynamic principles", "oil analysis", "control panel diagnostics", "precision measurement"],
      dailyTasks: ["Performing scheduled overhauls and valve replacements on compressors", "Monitoring operating parameters and diagnosing performance deviations", "Replacing seals, bearings, and wear components", "Documenting maintenance history and updating service records"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "pump-technician",
      title: "Pump Technician",
      emoji: "🔧",
      description: "Installs, repairs, and maintains centrifugal, positive displacement, and submersible pumps across water treatment, process, and offshore industries.",
      avgSalary: "490,000 - 730,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics with hands-on pump maintenance experience and relevant manufacturer courses",
      keySkills: ["pump disassembly and rebuild", "mechanical seal installation", "impeller balancing", "performance curve analysis", "pipework integration"],
      dailyTasks: ["Dismantling and rebuilding pumps during scheduled maintenance", "Diagnosing cavitation, vibration, and seal leakage issues", "Aligning pump and motor assemblies to specification", "Testing pump performance against design curves after overhaul"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "industrial-maintenance-supervisor",
      title: "Industrial Maintenance Supervisor",
      emoji: "📋",
      description: "Leads and coordinates maintenance teams to ensure industrial equipment operates safely, efficiently, and with minimal unplanned downtime.",
      avgSalary: "650,000 - 900,000 kr/year",
      educationPath: "Fagbrev in a mechanical or electrical trade, plus several years of experience and supervisory or leadership training",
      keySkills: ["team leadership", "maintenance planning", "CMMS systems", "budget management", "HSE compliance"],
      dailyTasks: ["Planning and prioritising daily maintenance work orders", "Supervising technicians and ensuring quality of completed work", "Coordinating shutdowns and turnaround maintenance activities", "Reporting on KPIs such as equipment uptime and backlog status"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "mechanical-commissioning-technician",
      title: "Mechanical Commissioning Technician",
      emoji: "✅",
      description: "Tests, verifies, and brings mechanical systems into operation during the final stages of construction and installation projects.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or process mechanics, with commissioning experience on large-scale projects",
      keySkills: ["system testing procedures", "punch-list management", "P&ID interpretation", "pressure and leak testing", "handover documentation"],
      dailyTasks: ["Executing mechanical completion checklists on piping and equipment", "Performing pressure tests, flushing, and cleaning of systems", "Identifying and recording deficiencies on punch lists", "Coordinating with engineering and operations teams for system handover"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "construction-site-supervisor",
      title: "Construction Site Supervisor",
      emoji: "🦺",
      description: "Oversees day-to-day construction activities, managing workers, subcontractors, and resources to deliver projects on time and within safety standards.",
      avgSalary: "600,000 - 880,000 kr/year",
      educationPath: "Fagbrev in a building trade or technical college diploma, plus supervisory experience and HMS (HSE) training",
      keySkills: ["project coordination", "workforce management", "quality control", "safety leadership", "scheduling and logistics"],
      dailyTasks: ["Conducting morning toolbox talks and assigning daily tasks", "Monitoring work progress against project schedule and milestones", "Ensuring compliance with building codes and safety regulations", "Liaising with project managers, engineers, and subcontractors"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "civil-works-foreman",
      title: "Civil Works Foreman",
      emoji: "🏛️",
      description: "Directs civil construction crews on earthworks, foundations, drainage, and concrete operations for infrastructure and building projects.",
      avgSalary: "580,000 - 850,000 kr/year",
      educationPath: "Fagbrev in concrete or civil works, with significant field experience leading construction crews",
      keySkills: ["concrete works", "earthworks supervision", "surveying basics", "drawing interpretation", "crew leadership"],
      dailyTasks: ["Directing concrete pours, formwork erection, and reinforcement placement", "Reviewing drawings and setting out work areas with surveyors", "Managing material deliveries and equipment allocation on site", "Ensuring excavation and backfill activities meet geotechnical specifications"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "tunnelling-technician",
      title: "Tunnelling Technician",
      emoji: "⛏️",
      description: "Supports tunnel construction operations including drill-and-blast, ground support installation, and monitoring of rock conditions underground.",
      avgSalary: "520,000 - 780,000 kr/year",
      educationPath: "Fagbrev in fjell- og bergverksfag (rock and mining) or equivalent, with underground safety certifications",
      keySkills: ["drill-and-blast operations", "rock bolt installation", "ground condition assessment", "shotcrete application", "underground safety"],
      dailyTasks: ["Preparing and executing drill patterns for blasting rounds", "Installing rock bolts, mesh, and shotcrete for ground support", "Monitoring geological conditions and reporting changes to engineers", "Operating mucking and haulage equipment to clear excavated rock"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "tunnel-boring-machine-technician",
      title: "Tunnel Boring Machine Technician",
      emoji: "🕳️",
      description: "Operates and maintains tunnel boring machines (TBMs), ensuring continuous excavation progress and mechanical reliability on major tunnel projects.",
      avgSalary: "580,000 - 830,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or heavy equipment, with TBM-specific manufacturer training and underground experience",
      keySkills: ["TBM operation", "cutter head maintenance", "hydraulic and electrical systems", "segment erection", "real-time monitoring"],
      dailyTasks: ["Monitoring TBM operating parameters and adjusting thrust and torque settings", "Replacing worn disc cutters and inspecting the cutter head", "Troubleshooting hydraulic, mechanical, and conveyor system issues", "Coordinating with survey teams to maintain alignment and grade"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rail-signalling-technician",
      title: "Rail Signalling Technician",
      emoji: "🚦",
      description: "Installs, tests, and maintains railway signalling systems including interlockings, track circuits, and automatic train protection equipment.",
      avgSalary: "530,000 - 780,000 kr/year",
      educationPath: "Fagbrev in electronics or telecommunications, with Bane NOR signalling competence certification",
      keySkills: ["relay-based interlocking", "electronic signalling systems", "track circuit testing", "safety-critical wiring", "railway regulations"],
      dailyTasks: ["Testing and commissioning signalling interlocking systems", "Performing preventive maintenance on signals, point machines, and track circuits", "Diagnosing and rectifying signalling faults to restore safe train operation", "Maintaining detailed records of all testing and maintenance activities"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rail-systems-technician",
      title: "Rail Systems Technician",
      emoji: "🚆",
      description: "Maintains and repairs railway infrastructure systems including track, power supply, communications, and SCADA control systems.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Fagbrev in electrical or electromechanical trades, with railway-specific systems training from Bane NOR or equivalent",
      keySkills: ["railway power systems", "SCADA and telecommunications", "track maintenance", "fault finding", "safety-critical procedures"],
      dailyTasks: ["Inspecting and maintaining railway electrical and communication systems", "Responding to system faults and restoring service within time targets", "Performing planned maintenance on track-side equipment and substations", "Participating in possession-based upgrade and renewal works"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "overhead-line-equipment-technician",
      title: "Overhead Line Equipment Technician",
      emoji: "🔌",
      description: "Installs and maintains overhead catenary and contact wire systems that supply electric power to trains on electrified railway lines.",
      avgSalary: "520,000 - 770,000 kr/year",
      educationPath: "Fagbrev in electrical trades with specialist overhead line (kontaktledning) training and high-voltage safety certification",
      keySkills: ["high-voltage safety", "catenary wire tensioning", "mast and foundation work", "insulator maintenance", "working at height"],
      dailyTasks: ["Inspecting overhead line components for wear, damage, and correct geometry", "Replacing contact wire, droppers, and tensioning equipment", "Performing high-voltage isolation and earthing procedures", "Installing new overhead line sections during railway possessions"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "lift-technician",
      title: "Lift Technician",
      emoji: "🛗",
      description: "Installs, services, and repairs passenger and goods lifts (elevators) in commercial buildings, residential blocks, and industrial facilities.",
      avgSalary: "480,000 - 720,000 kr/year",
      educationPath: "Fagbrev in heisfag (lift trade) or electrical/mechanical trade with lift-specific training and certification",
      keySkills: ["lift control systems", "electrical fault finding", "mechanical adjustment", "safety device testing", "customer communication"],
      dailyTasks: ["Performing scheduled servicing and safety inspections on lift installations", "Diagnosing control system faults and replacing faulty components", "Adjusting door operators, brakes, and levelling systems", "Responding to emergency callouts for trapped passengers"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "escalator-technician",
      title: "Escalator Technician",
      emoji: "↗️",
      description: "Maintains and repairs escalators and moving walkways in shopping centres, metro stations, airports, and public buildings.",
      avgSalary: "470,000 - 710,000 kr/year",
      educationPath: "Fagbrev in heisfag or mechanical/electrical trade with manufacturer-specific escalator training",
      keySkills: ["chain and step maintenance", "drive system servicing", "safety device calibration", "electrical controls", "bearing replacement"],
      dailyTasks: ["Inspecting step chains, rollers, and handrail drive systems for wear", "Lubricating and adjusting mechanical components to manufacturer specifications", "Testing safety devices including comb plates, skirt switches, and brakes", "Diagnosing and repairing electrical control and inverter faults"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "cnc-machinist",
      title: "CNC Machinist",
      emoji: "🖥️",
      description: "Programs, sets up, and operates computer numerically controlled machines to produce precision metal and plastic components.",
      avgSalary: "470,000 - 700,000 kr/year",
      educationPath: "Fagbrev in CNC-maskinering or industrial mechanics, with CAM software proficiency",
      keySkills: ["G-code programming", "CAM software", "precision measurement", "tool selection and setup", "quality control"],
      dailyTasks: ["Programming CNC lathes and milling machines from engineering drawings", "Setting up tooling, work-holding fixtures, and material blanks", "Running first-off parts and verifying dimensions with precision instruments", "Optimising feed rates and cutting speeds for quality and efficiency"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "precision-machinist",
      title: "Precision Machinist",
      emoji: "🔬",
      description: "Produces ultra-tight tolerance components for aerospace, medical, and scientific applications using advanced machining techniques and measurement methods.",
      avgSalary: "520,000 - 780,000 kr/year",
      educationPath: "Fagbrev in finmekanikk (precision mechanics) or CNC machining, plus experience with tight-tolerance work and CMM operation",
      keySkills: ["tight-tolerance machining", "coordinate measuring machines", "surface finish control", "jig and fixture design", "metallurgy knowledge"],
      dailyTasks: ["Machining components to micron-level tolerances on manual and CNC equipment", "Verifying dimensions using CMMs, optical comparators, and gauge blocks", "Selecting appropriate cutting strategies to achieve required surface finishes", "Collaborating with engineers to resolve manufacturing challenges on complex parts"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "toolmaker",
      title: "Toolmaker",
      emoji: "🛠️",
      description: "Designs, builds, and maintains precision tools, dies, moulds, and jigs used in mass production and manufacturing processes.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Fagbrev in verktøymaker (toolmaking) with extensive bench fitting, machining, and EDM experience",
      keySkills: ["die and mould construction", "wire and sinker EDM", "heat treatment", "CAD/CAM design", "precision grinding"],
      dailyTasks: ["Manufacturing press tools, injection moulds, and production fixtures to drawing", "Fitting and assembling tool components to achieve correct clearances and alignments", "Performing tool tryouts and adjusting for optimal part quality", "Repairing and refurbishing worn tooling to restore production capability"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "industrial-fitter",
      title: "Industrial Fitter",
      emoji: "🔧",
      description: "Assembles, installs, and maintains mechanical equipment and systems in factories, plants, and industrial facilities.",
      avgSalary: "460,000 - 700,000 kr/year",
      educationPath: "Fagbrev in industrimekaniker (industrial mechanics) through apprenticeship programme",
      keySkills: ["mechanical assembly", "blueprint reading", "bearing and seal installation", "shaft alignment", "hand and power tools"],
      dailyTasks: ["Assembling and installing mechanical equipment per engineering drawings", "Replacing worn bearings, seals, couplings, and drive components", "Aligning shafts and checking tolerances during equipment installation", "Performing routine inspections and preventive maintenance tasks"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "millwright",
      title: "Millwright",
      emoji: "⚙️",
      description: "Installs, dismantles, repairs, and relocates heavy industrial machinery and mechanical systems in manufacturing and process plants.",
      avgSalary: "500,000 - 760,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or equivalent trade qualification, with heavy rigging and machinery installation experience",
      keySkills: ["heavy machinery installation", "precision alignment", "rigging and lifting", "welding and fabrication", "hydraulic systems"],
      dailyTasks: ["Installing and levelling large machines on foundations using precision instruments", "Dismantling and reassembling equipment during plant relocations or overhauls", "Fabricating brackets, supports, and modifications as needed on site", "Coordinating crane lifts and rigging for heavy component handling"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "welding-inspector",
      title: "Welding Inspector",
      emoji: "🔍",
      description: "Inspects welds and welding processes to ensure compliance with codes, standards, and project specifications in fabrication and construction.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "CSWIP or IWI (International Welding Inspector) certification, with background as a qualified welder and knowledge of NDT methods",
      keySkills: ["weld inspection techniques", "welding code interpretation", "NDT awareness", "WPS/PQR review", "quality documentation"],
      dailyTasks: ["Performing visual and dimensional inspection of welds against code requirements", "Reviewing welder qualifications, WPS documents, and material certificates", "Witnessing NDT activities and evaluating radiographic and ultrasonic test results", "Writing inspection reports and issuing non-conformance notices for defective work"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "coded-welder",
      title: "Coded Welder",
      emoji: "🔥",
      description: "Performs high-integrity welding on pressure vessels, pipelines, and structural components, holding certified qualifications to recognised codes and standards.",
      avgSalary: "500,000 - 780,000 kr/year",
      educationPath: "Fagbrev in sveisefag (welding trade) plus coded welder certifications to EN/ISO or ASME standards for specific processes and materials",
      keySkills: ["TIG welding", "MIG/MAG welding", "pipe welding", "reading WPS documents", "weld quality self-inspection"],
      dailyTasks: ["Welding pipe joints and structural connections to certified WPS requirements", "Preparing weld joints by grinding, bevelling, and tack welding", "Performing self-inspection of completed welds before submission for NDT", "Maintaining welding equipment and monitoring gas flow and consumable quality"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "pipefitter",
      title: "Pipefitter",
      emoji: "🔧",
      description: "Fabricates, assembles, and installs piping systems for process plants, refineries, and offshore installations according to isometric drawings and specifications.",
      avgSalary: "490,000 - 750,000 kr/year",
      educationPath: "Fagbrev in platearbeider (plate worker) or industrial piping, with experience reading isometric drawings and pipe fabrication",
      keySkills: ["isometric drawing interpretation", "pipe fabrication", "flange management", "bolted joint assembly", "dimensional control"],
      dailyTasks: ["Fabricating pipe spools from isometric drawings using cutting and bevelling equipment", "Fitting and aligning pipe sections, flanges, and supports to design specifications", "Performing bolt tensioning and torquing on flanged connections", "Conducting dimensional checks and preparing as-built documentation"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "boilermaker",
      title: "Boilermaker",
      emoji: "🏭",
      description: "Fabricates, assembles, and repairs boilers, pressure vessels, tanks, and heavy plate structures for industrial and energy sector applications.",
      avgSalary: "500,000 - 770,000 kr/year",
      educationPath: "Fagbrev in platearbeider (plate worker) or industrial mechanics, with pressure vessel fabrication experience and relevant welding certifications",
      keySkills: ["plate rolling and forming", "pressure vessel fabrication", "structural welding", "blueprint reading", "hot and cold work techniques"],
      dailyTasks: ["Cutting, shaping, and rolling steel plate for vessel and tank construction", "Assembling and welding boiler components according to engineering drawings", "Performing repairs and modifications on existing pressure equipment during shutdowns", "Carrying out hydrostatic pressure tests on completed vessels"],
      growthOutlook: "stable",
      entryLevel: false,
    },

    {
      id: "commercial-diver",
      title: "Commercial Diver",
      emoji: "🤿",
      description: "Performs underwater construction, inspection, and repair work for harbours, bridges, pipelines, and offshore installations.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Certified commercial diving programme (e.g., NYD Class I–III) plus mandatory offshore safety training (BOSIET/HUET)",
      keySkills: ["underwater welding", "salvage operations", "dive equipment maintenance", "risk assessment", "hyperbaric awareness"],
      dailyTasks: ["Conducting underwater inspections of structures", "Performing submerged cutting and welding", "Operating and maintaining dive support equipment", "Writing detailed dive reports and logs"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "saturation-diver",
      title: "Saturation Diver",
      emoji: "⚓",
      description: "Lives and works at extreme depths for extended periods in pressurised chambers, performing complex subsea tasks on offshore oil and gas infrastructure.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Commercial diving certification plus advanced saturation diving qualification and several years of offshore diving experience",
      keySkills: ["deep-sea welding", "saturation systems operation", "hyperbaric physiology knowledge", "emergency procedures", "subsea tooling"],
      dailyTasks: ["Living in saturation chambers between dive shifts", "Performing pipeline tie-ins and repairs at depth", "Operating remotely deployed subsea tools", "Coordinating with topside dive supervisors"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "subsea-diver",
      title: "Subsea Diver",
      emoji: "🌊",
      description: "Specialises in inspection, maintenance, and repair of subsea equipment such as wellheads, manifolds, and subsea production systems.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Commercial diving certification with subsea intervention specialisation and offshore safety courses",
      keySkills: ["subsea equipment knowledge", "ROV collaboration", "hydraulic tooling", "non-destructive testing", "emergency response"],
      dailyTasks: ["Inspecting subsea production infrastructure", "Replacing valves, connectors, and seals underwater", "Collaborating with ROV pilots on complex tasks", "Documenting findings and producing technical reports"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "rope-access-technician",
      title: "Rope Access Technician",
      emoji: "🧗",
      description: "Uses industrial rope systems to access hard-to-reach structures for inspection, maintenance, and installation work at height.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "IRATA or SPRAT rope access certification (Level 1–3) combined with a relevant trade qualification (e.g., welding, NDT, painting)",
      keySkills: ["rope rigging", "work-at-height safety", "inspection techniques", "rescue procedures", "multi-trade versatility"],
      dailyTasks: ["Setting up rope access systems on structures", "Performing inspections or maintenance at height", "Conducting partner rescue drills", "Maintaining and inspecting personal protective equipment"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "industrial-abseiler",
      title: "Industrial Abseiler",
      emoji: "🏗️",
      description: "Carries out painting, coating, cleaning, and light maintenance on tall structures such as wind turbines, bridges, and building facades using abseil techniques.",
      avgSalary: "430,000 - 650,000 kr/year",
      educationPath: "IRATA Level 1 rope access certification plus relevant trade skills such as surface treatment or basic inspection",
      keySkills: ["abseil techniques", "surface preparation", "protective coating application", "safety compliance", "equipment inspection"],
      dailyTasks: ["Abseiling down structures to apply coatings or repairs", "Preparing surfaces through blasting or sanding", "Inspecting ropes, harnesses, and anchor points", "Coordinating with ground crew on material handling"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "confined-space-rescue-technician",
      title: "Confined Space Rescue Technician",
      emoji: "🚨",
      description: "Provides standby rescue capability and atmospheric monitoring for personnel working inside tanks, vessels, tunnels, and other confined spaces.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Confined space entry and rescue certification, first responder/paramedic training, and industrial safety courses",
      keySkills: ["confined space rescue", "atmospheric monitoring", "first aid and trauma care", "breathing apparatus operation", "incident command"],
      dailyTasks: ["Setting up rescue tripods and retrieval systems", "Monitoring gas levels inside confined spaces", "Maintaining rescue equipment in ready state", "Conducting emergency drills and briefings"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "hazardous-materials-technician",
      title: "Hazardous Materials Technician",
      emoji: "☣️",
      description: "Handles the identification, containment, removal, and safe disposal of hazardous substances including asbestos, chemicals, and radioactive materials.",
      avgSalary: "480,000 - 720,000 kr/year",
      educationPath: "Fagbrev in relevant field plus hazmat handling certifications, ADR transport licence, and safety training",
      keySkills: ["chemical identification", "decontamination procedures", "PPE selection and use", "waste classification", "regulatory compliance"],
      dailyTasks: ["Surveying sites for hazardous materials", "Safely removing and packaging hazardous waste", "Decontaminating affected areas", "Completing disposal documentation and chain-of-custody records"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "explosives-technician",
      title: "Explosives Technician",
      emoji: "💥",
      description: "Plans, prepares, and executes controlled blasting operations for mining, quarrying, tunnelling, and construction projects.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Bergsprenger (shot-firer) certification from approved programme plus experience under a licensed blaster",
      keySkills: ["blast design", "detonator systems", "explosives storage and handling", "vibration monitoring", "safety zone management"],
      dailyTasks: ["Designing blast patterns and charge calculations", "Loading boreholes with explosives", "Ensuring exclusion zones are clear before detonation", "Analysing blast results and adjusting future plans"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "controlled-demolition-specialist",
      title: "Controlled Demolition Specialist",
      emoji: "🏚️",
      description: "Engineers and carries out the safe, precise dismantlement or implosion of structures using mechanical, explosive, or cutting methods.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Civil engineering or construction background plus demolition-specific certifications, blasting licence, and extensive field experience",
      keySkills: ["structural analysis", "demolition planning", "explosive placement", "heavy machinery operation", "environmental impact assessment"],
      dailyTasks: ["Surveying buildings and planning demolition sequences", "Coordinating crane and excavator operators", "Overseeing explosive charge placement and wiring", "Managing dust, noise, and debris control measures"],
      growthOutlook: "medium",
      entryLevel: false,
    },
    {
      id: "non-destructive-testing-technician",
      title: "Non-Destructive Testing Technician",
      emoji: "🔬",
      description: "Uses ultrasonic, radiographic, magnetic particle, and other testing methods to detect flaws in welds, structures, and components without causing damage.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "NDT Level I and II certification (ISO 9712 / EN ISO 9712) in relevant methods plus technical college or fagbrev background",
      keySkills: ["ultrasonic testing", "radiographic testing", "magnetic particle inspection", "penetrant testing", "report writing"],
      dailyTasks: ["Calibrating and operating NDT equipment", "Scanning welds and base materials for defects", "Interpreting test results against acceptance criteria", "Producing detailed inspection reports"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "level-iii-ndt-inspector",
      title: "Level III NDT Inspector",
      emoji: "🔎",
      description: "Serves as the highest-qualified NDT authority, responsible for procedure development, technique validation, and certification of Level I and II personnel.",
      avgSalary: "700,000 - 1,000,000 kr/year",
      educationPath: "NDT Level III certification (ISO 9712) in multiple methods plus engineering degree or equivalent and extensive inspection experience",
      keySkills: ["procedure authoring", "personnel certification", "advanced flaw characterisation", "code and standard interpretation", "audit management"],
      dailyTasks: ["Developing and approving NDT procedures", "Reviewing and validating complex inspection results", "Training and examining Level I and II technicians", "Liaising with clients and classification societies on acceptance criteria"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "gas-network-technician",
      title: "Gas Network Technician",
      emoji: "🔥",
      description: "Installs, maintains, and repairs natural gas distribution networks including pipelines, regulators, meters, and pressure stations.",
      avgSalary: "470,000 - 680,000 kr/year",
      educationPath: "Fagbrev in gas technology or pipeline fitting plus gas safety certifications and competency cards",
      keySkills: ["gas pipeline installation", "leak detection", "pressure regulation systems", "PE pipe fusion", "safety procedures"],
      dailyTasks: ["Installing and connecting gas service lines", "Performing leak surveys with detection equipment", "Maintaining pressure regulating stations", "Responding to gas leak emergency callouts"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "water-treatment-plant-technician",
      title: "Water Treatment Plant Technician",
      emoji: "💧",
      description: "Operates and maintains water purification systems to ensure safe drinking water meets quality standards for public distribution.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Fagbrev in water and wastewater technology or chemical process operations plus plant-specific training",
      keySkills: ["water chemistry", "process control systems", "pump and valve maintenance", "laboratory sampling", "SCADA operation"],
      dailyTasks: ["Monitoring treatment processes and adjusting chemical dosing", "Collecting water samples for laboratory analysis", "Maintaining pumps, filters, and UV disinfection units", "Logging operational data in SCADA systems"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "wastewater-systems-technician",
      title: "Wastewater Systems Technician",
      emoji: "♻️",
      description: "Maintains and operates sewage collection networks and treatment facilities to protect public health and the environment.",
      avgSalary: "450,000 - 660,000 kr/year",
      educationPath: "Fagbrev in water and wastewater technology or environmental operations plus relevant safety certifications",
      keySkills: ["wastewater process knowledge", "sewer network maintenance", "pump station operation", "sludge handling", "environmental monitoring"],
      dailyTasks: ["Inspecting and cleaning sewer mains and pump stations", "Monitoring biological and chemical treatment processes", "Handling and disposing of sludge safely", "Reporting environmental compliance data to authorities"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "district-heating-technician",
      title: "District Heating Technician",
      emoji: "🌡️",
      description: "Installs, operates, and maintains district heating distribution networks that deliver hot water or steam to residential and commercial buildings.",
      avgSalary: "470,000 - 680,000 kr/year",
      educationPath: "Fagbrev in plumbing, heating, or energy operations plus district heating system training",
      keySkills: ["heat exchanger maintenance", "pipe welding and joining", "thermal insulation", "pressure and flow balancing", "customer substation servicing"],
      dailyTasks: ["Installing and commissioning customer substations", "Detecting and repairing leaks in distribution pipelines", "Balancing network pressure and temperature", "Reading meters and optimising energy delivery"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "utility-network-commissioning-technician",
      title: "Utility Network Commissioning Technician",
      emoji: "✅",
      description: "Tests, verifies, and brings newly built or upgraded utility networks (water, gas, power, heating) into operational service.",
      avgSalary: "520,000 - 750,000 kr/year",
      educationPath: "Technical college or fagbrev in relevant utility discipline plus commissioning methodology training and safety certifications",
      keySkills: ["commissioning procedures", "system testing", "instrumentation calibration", "punch-list management", "documentation and handover"],
      dailyTasks: ["Developing and executing commissioning test plans", "Verifying instrument loops and control logic", "Documenting deficiencies and tracking punch-list items", "Coordinating with construction and operations teams for handover"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "critical-infrastructure-maintenance-technician",
      title: "Critical Infrastructure Maintenance Technician",
      emoji: "🛡️",
      description: "Maintains and repairs essential systems in critical facilities such as data centres, hospitals, power plants, and emergency services buildings.",
      avgSalary: "500,000 - 730,000 kr/year",
      educationPath: "Fagbrev in electrical, mechanical, or automation disciplines plus facility management training and security clearance",
      keySkills: ["preventive maintenance planning", "UPS and backup power systems", "HVAC systems", "fire suppression systems", "access control and security systems"],
      dailyTasks: ["Performing scheduled maintenance on building-critical systems", "Responding to emergency breakdowns in essential infrastructure", "Testing backup generators and UPS systems", "Maintaining detailed maintenance logs and compliance records"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "electrical-contractor",
      title: "Electrical Contractor",
      emoji: "⚡",
      description: "Runs an independent contracting business providing electrical installation, maintenance, and project services to industrial and commercial clients.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Fagbrev as electrician plus master electrician qualification (installatør) and business registration with DSB",
      keySkills: ["electrical project management", "tendering and estimation", "NEK 400 compliance", "client relationship management", "subcontractor coordination"],
      dailyTasks: ["Quoting and planning electrical installation projects", "Supervising electricians on site", "Ensuring installations comply with NEK 400 standards", "Managing invoicing, procurement, and project timelines"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "instrumentation-contractor",
      title: "Instrumentation Contractor",
      emoji: "📡",
      description: "Provides specialist instrumentation and control system services including installation, calibration, and loop testing for process industry clients.",
      avgSalary: "600,000 - 850,000 kr/year",
      educationPath: "Fagbrev in automation or instrumentation plus years of field experience and relevant offshore/industrial safety certifications",
      keySkills: ["instrument calibration", "control loop tuning", "P&ID interpretation", "SIS and SIL knowledge", "commissioning and start-up"],
      dailyTasks: ["Installing and calibrating pressure, temperature, and flow instruments", "Performing loop checks and function testing", "Troubleshooting control system faults", "Producing calibration certificates and as-built documentation"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "mechanical-maintenance-contractor",
      title: "Mechanical Maintenance Contractor",
      emoji: "🔧",
      description: "Delivers contracted mechanical maintenance services including rotating equipment overhaul, valve repair, and piping modifications for industrial plants.",
      avgSalary: "550,000 - 800,000 kr/year",
      educationPath: "Fagbrev in industrial mechanics or CNC machining plus extensive plant maintenance experience and contractor HSE certifications",
      keySkills: ["rotating equipment repair", "precision alignment", "hydraulic and pneumatic systems", "piping fabrication", "maintenance planning"],
      dailyTasks: ["Overhauling pumps, compressors, and turbines", "Aligning shafts and coupling assemblies", "Fabricating and installing pipe spools", "Coordinating work permits and safety isolations"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "offshore-service-contractor",
      title: "Offshore Service Contractor",
      emoji: "🛢️",
      description: "Provides multidiscipline technical services on offshore oil, gas, and wind installations including maintenance, modifications, and hook-up campaigns.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Fagbrev in relevant trade plus offshore safety training (BOSIET, HUET), extensive offshore experience, and contractor management qualifications",
      keySkills: ["offshore operations", "multi-trade coordination", "permit-to-work systems", "HSE management", "project execution"],
      dailyTasks: ["Planning and executing maintenance campaigns offshore", "Managing work permits and safety barriers", "Coordinating multidiscipline teams on platform", "Reporting progress and HSE statistics to operator"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "specialist-inspection-contractor",
      title: "Specialist Inspection Contractor",
      emoji: "🔍",
      description: "Offers advanced inspection services including drone surveys, corrosion mapping, fitness-for-service assessments, and integrity management for asset owners.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "NDT Level II or III certifications plus engineering background, API or ASME inspector qualifications, and business management skills",
      keySkills: ["advanced NDT methods", "corrosion engineering", "fitness-for-service analysis", "drone inspection technology", "integrity management systems"],
      dailyTasks: ["Performing advanced inspection campaigns on assets", "Analysing corrosion data and recommending repairs", "Producing integrity assessment reports", "Advising clients on inspection intervals and risk mitigation"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "commissioning-contractor",
      title: "Commissioning Contractor",
      emoji: "🎛️",
      description: "Leads the systematic testing, verification, and start-up of new or modified industrial systems to ensure they perform to design specifications.",
      avgSalary: "650,000 - 950,000 kr/year",
      educationPath: "Engineering degree or fagbrev in electrical/automation plus commissioning methodology certification and extensive project experience",
      keySkills: ["commissioning system management", "functional testing", "punch-list resolution", "ICSS and DCS knowledge", "stakeholder coordination"],
      dailyTasks: ["Developing commissioning execution plans and schedules", "Leading pre-commissioning and function testing of systems", "Tracking and resolving outstanding punch-list items", "Coordinating handover from construction to operations"],
      growthOutlook: "high",
      entryLevel: false,
    },
    {
      id: "maintenance-shutdown-contractor",
      title: "Maintenance Shutdown Contractor",
      emoji: "🏭",
      description: "Plans and executes large-scale planned maintenance shutdowns (turnarounds) at refineries, process plants, and offshore installations within tight schedules.",
      avgSalary: "650,000 - 950,000 kr/year",
      educationPath: "Fagbrev in relevant trade plus turnaround planning experience, project management certification, and advanced safety training",
      keySkills: ["turnaround planning", "critical path scheduling", "resource mobilisation", "simultaneous operations management", "cost control"],
      dailyTasks: ["Developing detailed shutdown work packages and schedules", "Mobilising and coordinating large contractor workforces", "Monitoring critical path activities and resolving delays", "Ensuring safe restart and handback to operations"],
      growthOutlook: "stable",
      entryLevel: false,
    },
    {
      id: "gardener",
      title: "Gardener",
      emoji: "🌱",
      description: "Maintain gardens, parks and grounds — planting, pruning, mowing, seasonal care. Outdoor work in all weather. Path forward leads to Landscaper, Garden Designer or Park Manager.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Vocational training or apprenticeship (2 years) — entry possible without formal training",
      keySkills: ["plant knowledge", "physical fitness", "tool handling", "seasonal planning", "reliability"],
      dailyTasks: ["Mow and trim", "Plant and prune", "Weed beds", "Maintain tools", "Plan seasonal work"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    // ── Civil & general engineering ──
    { id: "civil-engineer", title: "Civil Engineer", emoji: "🏗️", description: "Design and oversee construction of roads, bridges, tunnels, and water systems — the infrastructure that keeps societies running.", avgSalary: "650,000 - 1,000,000 kr/year", educationPath: "Master's in Civil Engineering (5 years)", keySkills: ["structural analysis", "CAD", "project planning", "site management", "regulations"], dailyTasks: ["Design structures", "Run calculations", "Visit sites", "Review drawings", "Coordinate contractors"], growthOutlook: "high" },
    { id: "construction-worker", title: "Construction Worker", emoji: "👷", description: "Build buildings, roads, and infrastructure — operating tools, mixing materials, and supporting skilled trades on site.", avgSalary: "400,000 - 600,000 kr/year", educationPath: "On-the-job training; HMS / safety course required", keySkills: ["physical stamina", "tool use", "teamwork", "safety awareness", "reliability"], dailyTasks: ["Carry materials", "Operate basic tools", "Assist trades", "Clean site", "Follow safety rules"], growthOutlook: "stable", entryLevel: true },
    { id: "aviation-engineer", title: "Aviation Engineer", emoji: "✈️", description: "Design, develop, and certify aircraft systems — from airframes to avionics — for commercial and military aviation.", avgSalary: "750,000 - 1,200,000 kr/year", educationPath: "Master's in Aerospace or Mechanical Engineering (5 years)", keySkills: ["aerodynamics", "CAD/CAE", "systems engineering", "safety standards", "problem-solving"], dailyTasks: ["Run simulations", "Design components", "Validate test data", "Coordinate certification", "Document changes"], growthOutlook: "medium", pathType: "space" },
    // ── Space & aerospace ──
    { id: "astronaut", title: "Astronaut", emoji: "🧑‍🚀", description: "Train and operate as part of crewed space missions — conducting experiments, spacewalks, and operating spacecraft.", avgSalary: "800,000 - 1,500,000 kr/year", educationPath: "Master's/PhD in STEM + flight or military experience + ESA/NASA selection", keySkills: ["physical fitness", "stress management", "technical mastery", "teamwork", "languages"], dailyTasks: ["Train for missions", "Run simulations", "Operate spacecraft", "Conduct experiments", "Maintain physical condition"], growthOutlook: "stable", pathType: "space" },
    { id: "mission-specialist", title: "Mission Specialist", emoji: "🛰️", description: "Astronaut role focused on running scientific experiments and operating mission payloads in orbit.", avgSalary: "800,000 - 1,400,000 kr/year", educationPath: "PhD in a STEM field + space agency selection + 2 years training", keySkills: ["research", "operations", "spacecraft systems", "experimentation", "reporting"], dailyTasks: ["Run experiments", "Operate payloads", "Conduct EVAs", "Document results", "Train continuously"], growthOutlook: "stable", pathType: "space" },
    { id: "flight-engineer-space", title: "Flight Engineer (Space)", emoji: "🛠️", description: "Operate and maintain spacecraft systems during missions — from life support to propulsion.", avgSalary: "750,000 - 1,300,000 kr/year", educationPath: "Master's in Aerospace Engineering + agency astronaut training", keySkills: ["systems engineering", "diagnostics", "EVA operations", "calm under pressure", "teamwork"], dailyTasks: ["Monitor systems", "Run diagnostics", "Repair equipment", "Support EVAs", "Coordinate with ground"], growthOutlook: "stable", pathType: "space" },
    { id: "payload-specialist", title: "Payload Specialist", emoji: "📦", description: "Subject-matter expert flown on a mission to operate a specific scientific or commercial payload.", avgSalary: "700,000 - 1,200,000 kr/year", educationPath: "PhD in payload-relevant science + mission-specific training", keySkills: ["domain expertise", "experiment design", "documentation", "patience", "adaptability"], dailyTasks: ["Operate payload", "Collect data", "Adjust experiments", "Brief mission control", "Document findings"], growthOutlook: "stable", pathType: "space" },
    { id: "spacecraft-pilot", title: "Spacecraft Pilot", emoji: "🚀", description: "Pilot crewed spacecraft during launch, orbital operations, docking, and re-entry.", avgSalary: "900,000 - 1,500,000 kr/year", educationPath: "Test-pilot or military-pilot background + Master's STEM + agency selection", keySkills: ["flight skills", "rapid decision-making", "spacecraft systems", "stress management", "calm focus"], dailyTasks: ["Pilot spacecraft", "Train in simulators", "Plan trajectories", "Coordinate with crew", "Run pre-flight checks"], growthOutlook: "stable", pathType: "space" },
    { id: "space-systems-engineer", title: "Space Systems Engineer", emoji: "🧩", description: "Architect and integrate spacecraft systems — making sure propulsion, power, comms, and payloads all work together.", avgSalary: "800,000 - 1,300,000 kr/year", educationPath: "Master's in Aerospace/Systems Engineering (5 years)", keySkills: ["systems engineering", "architecture", "integration", "requirements", "verification"], dailyTasks: ["Define system requirements", "Run trade studies", "Coordinate subsystem teams", "Track interfaces", "Verify performance"], growthOutlook: "high", pathType: "space" },
    { id: "aerospace-engineer", title: "Aerospace Engineer", emoji: "🛩️", description: "Design aircraft, spacecraft, and propulsion systems — solving aerodynamics, materials, and structures problems.", avgSalary: "750,000 - 1,200,000 kr/year", educationPath: "Master's in Aerospace Engineering (5 years)", keySkills: ["aerodynamics", "structures", "propulsion", "CAD", "simulation"], dailyTasks: ["Run simulations", "Design components", "Validate prototypes", "Write reports", "Collaborate cross-team"], growthOutlook: "high", pathType: "space" },
    { id: "rocket-scientist", title: "Rocket Scientist", emoji: "🧪", description: "Design and develop rocket propulsion systems and launch vehicles — from chemistry to combustion to control.", avgSalary: "850,000 - 1,400,000 kr/year", educationPath: "PhD in Aerospace, Mechanical, or Chemical Engineering", keySkills: ["combustion physics", "thermodynamics", "fluid dynamics", "modelling", "experimentation"], dailyTasks: ["Model rocket performance", "Design test rigs", "Analyse data", "Publish research", "Support launches"], growthOutlook: "medium", pathType: "space" },
    { id: "satellite-engineer", title: "Satellite Engineer", emoji: "📡", description: "Design, build, and operate satellites — including communication, observation, and navigation systems.", avgSalary: "750,000 - 1,200,000 kr/year", educationPath: "Master's in Aerospace, Electronics, or Telecom Engineering", keySkills: ["RF engineering", "orbital mechanics", "embedded systems", "thermal control", "testing"], dailyTasks: ["Design payloads", "Run thermal/vibration tests", "Plan orbits", "Manage telemetry", "Coordinate launch"], growthOutlook: "high", pathType: "space" },
    { id: "space-mission-planner", title: "Space Mission Planner", emoji: "🗺️", description: "Plan missions end-to-end — orbits, timelines, contingencies, and crew/instrument schedules.", avgSalary: "800,000 - 1,250,000 kr/year", educationPath: "Master's in Aerospace or Astrodynamics + mission ops experience", keySkills: ["mission design", "orbital mechanics", "scheduling", "risk analysis", "coordination"], dailyTasks: ["Design mission profiles", "Schedule operations", "Run trajectory studies", "Brief stakeholders", "Plan contingencies"], growthOutlook: "medium", pathType: "space" },
    { id: "ground-control-operator", title: "Ground Control Operator", emoji: "🖥️", description: "Monitor and command spacecraft from a ground control centre — tracking telemetry and uplinking commands 24/7.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Bachelor's in Aerospace, Engineering, or Physics + on-site training", keySkills: ["calm focus", "telemetry analysis", "radio comms", "shift work", "procedures"], dailyTasks: ["Monitor telemetry", "Send commands", "Log anomalies", "Coordinate handovers", "Support recovery"], growthOutlook: "medium", pathType: "space" },
    { id: "flight-dynamics-engineer", title: "Flight Dynamics Engineer", emoji: "📐", description: "Compute and refine spacecraft trajectories, manoeuvres, and orbital insertions throughout a mission.", avgSalary: "800,000 - 1,300,000 kr/year", educationPath: "Master's/PhD in Aerospace or Astrodynamics", keySkills: ["orbital mechanics", "numerical methods", "modelling", "MATLAB/Python", "precision"], dailyTasks: ["Model trajectories", "Plan burns", "Compute manoeuvres", "Validate ephemeris", "Support flight ops"], growthOutlook: "medium", pathType: "space" },
    { id: "astrophysicist", title: "Astrophysicist", emoji: "🌌", description: "Study the universe — stars, galaxies, dark matter — using telescopes, satellites, and theoretical models.", avgSalary: "650,000 - 1,100,000 kr/year", educationPath: "PhD in Astrophysics or Physics", keySkills: ["physics", "data analysis", "modelling", "research writing", "python"], dailyTasks: ["Run simulations", "Analyse observations", "Write papers", "Collaborate internationally", "Teach students"], growthOutlook: "medium", pathType: "space" },
    { id: "space-robotics-engineer", title: "Space Robotics Engineer", emoji: "🤖", description: "Design and operate robots used in space — from rover navigation to robotic arms for satellite servicing.", avgSalary: "800,000 - 1,300,000 kr/year", educationPath: "Master's in Robotics, Mechatronics, or Aerospace", keySkills: ["robotics", "control systems", "computer vision", "ROS", "teleoperation"], dailyTasks: ["Develop control software", "Test arms/rovers", "Plan operations", "Run simulations", "Teleoperate hardware"], growthOutlook: "high", pathType: "space" },
    { id: "spacewalk-specialist", title: "Spacewalk Specialist", emoji: "🪐", description: "Astronaut trained for extravehicular activity (EVA) — repairs, installations, and spacewalks outside the spacecraft.", avgSalary: "850,000 - 1,400,000 kr/year", educationPath: "Astronaut training + EVA specialist certification", keySkills: ["EVA procedures", "physical fitness", "tool handling", "calm focus", "spatial awareness"], dailyTasks: ["Train underwater", "Practice procedures", "Inspect suits", "Plan EVAs", "Conduct spacewalks"], growthOutlook: "stable", pathType: "space" },
    { id: "launch-operations-engineer", title: "Launch Operations Engineer", emoji: "🚦", description: "Lead the launch countdown and operations team — from vehicle integration through liftoff to mission handover.", avgSalary: "750,000 - 1,200,000 kr/year", educationPath: "Bachelor's/Master's in Aerospace + launch site experience", keySkills: ["launch operations", "checklists", "stress management", "coordination", "safety"], dailyTasks: ["Lead countdowns", "Inspect vehicles", "Run rehearsals", "Manage anomalies", "Coordinate range safety"], growthOutlook: "high", pathType: "space" },
  ],

  // ========================================
  // LOGISTICS, TRANSPORT & SUPPLY CHAIN
  // ========================================
  LOGISTICS_TRANSPORT: [
    {
      id: "logistics-coordinator",
      title: "Logistics Coordinator",
      emoji: "📦",
      description: "Coordinate the movement of goods, managing shipments and inventory.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Logistics, Supply Chain, or Business",
      keySkills: ["organisation", "communication", "problem-solving", "attention to detail", "software skills"],
      dailyTasks: ["Coordinate shipments", "Track inventory", "Communicate with suppliers", "Solve logistics issues"],
      growthOutlook: "high",
    },
    {
      id: "supply-chain-manager",
      title: "Supply Chain Manager",
      emoji: "🔗",
      description: "Oversee the entire supply chain from procurement to delivery, optimizing efficiency.",
      avgSalary: "600,000 - 900,000 kr/year",
      educationPath: "Bachelor's/Master's in Supply Chain Management",
      keySkills: ["strategic thinking", "leadership", "negotiation", "data analysis", "process improvement"],
      dailyTasks: ["Manage suppliers", "Optimise processes", "Reduce costs", "Lead team", "Report to executives"],
      growthOutlook: "high",
    },
    {
      id: "truck-driver",
      title: "Truck Driver",
      emoji: "🚛",
      description: "Transport goods across the country or internationally in heavy vehicles.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational training + Heavy vehicle license (Class C/CE)",
      keySkills: ["driving skills", "route planning", "time management", "safety awareness", "independence"],
      dailyTasks: ["Drive routes", "Load/unload cargo", "Maintain vehicle", "Complete paperwork"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "warehouse-manager",
      title: "Warehouse Manager",
      emoji: "🏢",
      description: "Manage warehouse operations, staff, and inventory management systems.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Logistics or extensive warehouse experience",
      keySkills: ["leadership", "organisation", "inventory management", "problem-solving", "safety management"],
      dailyTasks: ["Manage staff", "Oversee inventory", "Optimise space", "Ensure safety", "Report on metrics"],
      growthOutlook: "stable",
    },
    {
      id: "freight-forwarder",
      title: "Freight Forwarder",
      emoji: "🌍",
      description: "Arrange international shipping and handle customs documentation.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Logistics + Customs knowledge",
      keySkills: ["international trade", "documentation", "communication", "problem-solving", "negotiation"],
      dailyTasks: ["Book shipments", "Handle customs", "Negotiate rates", "Track deliveries", "Solve issues"],
      growthOutlook: "stable",
    },
    {
      id: "delivery-driver",
      title: "Delivery Driver",
      emoji: "🚐",
      description: "Deliver packages and goods to customers and businesses locally.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "Driver's license + On-the-job training",
      keySkills: ["driving skills", "time management", "customer service", "navigation", "physical fitness"],
      dailyTasks: ["Deliver packages", "Plan routes", "Handle customer interactions", "Maintain vehicle"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "warehouse-worker",
      title: "Warehouse Worker",
      emoji: "📦",
      description: "Pick, pack, and organise goods in warehouses for shipping and storage.",
      avgSalary: "350,000 - 450,000 kr/year",
      educationPath: "No formal education - on-the-job training",
      keySkills: ["physical fitness", "organisation", "attention to detail", "teamwork", "forklift operation"],
      dailyTasks: ["Pick orders", "Pack shipments", "Organise inventory", "Operate equipment"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "supply-chain-director",
      title: "Supply Chain Director",
      emoji: "🔗",
      description: "Lead the entire supply chain function from procurement through logistics, optimising costs, resilience, and delivery performance.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Supply Chain/Business + 10+ years supply chain leadership",
      keySkills: ["supply chain strategy", "procurement", "logistics optimisation", "vendor management", "risk management"],
      dailyTasks: ["Set supply chain strategy", "Optimise end-to-end supply chain", "Manage supplier relationships", "Drive cost efficiency", "Report to COO/CEO"],
      growthOutlook: "high",
    },
    {
      id: "airline-pilot",
      title: "Airline Pilot",
      emoji: "✈️",
      description: "Fly commercial aircraft, transporting passengers and cargo safely between destinations while managing complex flight systems and crew coordination.",
      avgSalary: "800,000 - 1,800,000 kr/year",
      educationPath: "Flight school (ATPL licence) + type rating + 1,500+ flight hours",
      keySkills: ["aviation knowledge", "decision-making under pressure", "communication", "situational awareness", "teamwork", "technical proficiency"],
      dailyTasks: ["Pre-flight planning", "Fly aircraft", "Monitor systems", "Communicate with ATC", "Manage crew coordination"],
      growthOutlook: "stable",
    },
    {
      id: "helicopter-pilot",
      title: "Helicopter Pilot",
      emoji: "🚁",
      description: "Fly helicopters for offshore transport, emergency medical services, search and rescue, or commercial operations in Norway's challenging terrain.",
      avgSalary: "700,000 - 1,500,000 kr/year",
      educationPath: "Helicopter flight school (CPL-H licence) + type rating + offshore certification",
      keySkills: ["rotary wing aviation", "instrument flying", "emergency procedures", "offshore operations", "crew resource management"],
      dailyTasks: ["Pre-flight inspections", "Fly helicopter missions", "Navigate challenging weather", "Coordinate with ground teams", "Maintain flight logs"],
      growthOutlook: "stable",
    },
    {
      id: "warehouse-picker",
      title: "Warehouse Picker",
      emoji: "📦",
      description: "Pick and pack orders in a warehouse, often using a handheld scanner. Common entry into logistics; the path forward leads to Forklift Operator, Team Leader, then Warehouse Supervisor.",
      avgSalary: "350,000 - 480,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["physical fitness", "attention to detail", "reliability", "basic numeracy", "teamwork"],
      dailyTasks: ["Pick orders", "Pack and label", "Operate scanners", "Move stock", "Hit daily targets"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "delivery-driver",
      title: "Delivery Driver",
      emoji: "🚚",
      description: "Deliver parcels, food or goods on a route — independent days, lots of driving, customer contact at each drop. Path forward leads to Route Planner, Fleet Coordinator and Logistics Manager.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Driving licence (B for vans, C for larger vehicles) — entry possible at 18+",
      keySkills: ["safe driving", "navigation", "time management", "customer service", "reliability"],
      dailyTasks: ["Load van", "Plan route", "Make deliveries", "Get signatures", "Handle returns"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    // ── Drivers & couriers ──
    { id: "taxi-driver", title: "Taxi Driver", emoji: "🚕", description: "Drive a licensed taxi — picking up passengers from ranks, street hails, or app bookings (Uber, Bolt). Flexible shifts, independent work.", avgSalary: "350,000 - 600,000 kr/year", educationPath: "Class B licence + kjøreseddel (taxi licence)", keySkills: ["local knowledge", "safe driving", "customer service", "patience", "navigation", "app management"], dailyTasks: ["Pick up passengers", "Manage app bookings", "Calculate fares", "Process payments", "Maintain car", "Stay on shift"], growthOutlook: "stable", entryLevel: true },
    { id: "courier", title: "Courier", emoji: "📮", description: "Deliver parcels and documents quickly — by van, bike, or on foot — for businesses or end customers.", avgSalary: "350,000 - 500,000 kr/year", educationPath: "Driving licence (or none for bike couriers); on-the-job training", keySkills: ["fast navigation", "physical stamina", "time management", "reliability", "customer service"], dailyTasks: ["Pick up parcels", "Plan routes", "Deliver fast", "Get signatures", "Track packages"], growthOutlook: "stable", entryLevel: true },
    { id: "bus-driver", title: "Bus Driver", emoji: "🚌", description: "Drive scheduled bus routes — city, regional, or long-distance — getting passengers safely from stop to stop.", avgSalary: "450,000 - 600,000 kr/year", educationPath: "Class D licence + yrkessjåførkompetanse (CPC) — funded paths exist", keySkills: ["safe driving", "punctuality", "customer service", "patience", "stamina"], dailyTasks: ["Drive route", "Stop at all stops", "Sell tickets", "Help passengers", "Inspect bus"], growthOutlook: "stable", entryLevel: true },
    { id: "food-delivery-rider", title: "Food Delivery Rider", emoji: "🛵", description: "Deliver hot food from restaurants to customers — by bike, e-bike, or scooter — for Foodora, Wolt, etc.", avgSalary: "200,000 - 400,000 kr/year (variable, often part-time)", educationPath: "No formal requirement; bike or moped + smartphone", keySkills: ["fast cycling", "navigation", "weather tolerance", "stamina", "customer service"], dailyTasks: ["Accept orders", "Cycle to restaurants", "Deliver food", "Track app", "Stay safe in traffic"], growthOutlook: "stable", entryLevel: true },
    { id: "logistics-driver", title: "Logistics Driver", emoji: "🚚", description: "Move goods between warehouses, distribution centres, and retailers — usually in a fixed local route.", avgSalary: "450,000 - 600,000 kr/year", educationPath: "Class C licence + yrkessjåførkompetanse", keySkills: ["safe driving", "load handling", "navigation", "punctuality", "documentation"], dailyTasks: ["Load truck", "Drive route", "Deliver pallets", "Get signatures", "Maintain logbook"], growthOutlook: "stable", entryLevel: true },
    { id: "freight-driver", title: "Freight Driver", emoji: "🚛", description: "Drive heavy goods vehicles long distance — across Norway and into Europe — moving freight for haulage companies.", avgSalary: "500,000 - 750,000 kr/year", educationPath: "Class C/CE licence + yrkessjåførkompetanse + ADR (for hazardous goods)", keySkills: ["heavy vehicle handling", "endurance", "navigation", "documentation", "self-reliance"], dailyTasks: ["Load freight", "Drive long routes", "Manage rest hours", "Deliver loads", "Maintain logbook"], growthOutlook: "stable" },
    // ── Aviation ──
    { id: "air-traffic-controller", title: "Air Traffic Controller", emoji: "🗼", description: "Direct aircraft on the ground and in the air — keeping flights safe and on schedule from a tower or radar centre.", avgSalary: "850,000 - 1,400,000 kr/year", educationPath: "Avinor Air Navigation College (3 years) + on-job training", keySkills: ["spatial awareness", "fast decision-making", "calm under pressure", "communication", "discipline"], dailyTasks: ["Direct aircraft", "Watch radar", "Coordinate handovers", "Issue clearances", "Brief teams"], growthOutlook: "stable" },
  ],

  // ========================================
  // HOSPITALITY, TOURISM & PERSONAL SERVICES
  // ========================================
  HOSPITALITY_TOURISM: [
    {
      id: "hotel-manager",
      title: "Hotel Manager",
      emoji: "🏨",
      description: "Manage hotel operations, staff, and guest experience to ensure satisfaction.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Hospitality Management + Experience",
      keySkills: ["leadership", "customer service", "business management", "problem-solving", "communication"],
      dailyTasks: ["Oversee operations", "Manage staff", "Handle guest issues", "Monitor finances", "Ensure quality"],
      growthOutlook: "medium",
    },
    {
      id: "chef",
      title: "Chef",
      emoji: "👨‍🍳",
      description: "Prepare and cook meals in restaurants, hotels, or catering services.",
      avgSalary: "380,000 - 600,000 kr/year",
      educationPath: "Culinary school or Vocational training + Apprenticeship = Fagbrev",
      keySkills: ["cooking skills", "creativity", "time management", "leadership", "food safety"],
      dailyTasks: ["Prepare dishes", "Create menus", "Manage kitchen staff", "Maintain hygiene standards"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "tour-guide",
      title: "Tour Guide",
      emoji: "🗺️",
      description: "Lead tourists on excursions, sharing knowledge about destinations and culture.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Tourism education or deep local knowledge + Language skills",
      keySkills: ["communication", "local knowledge", "languages", "storytelling", "customer service"],
      dailyTasks: ["Lead tours", "Share information", "Handle logistics", "Ensure guest safety"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "flight-attendant",
      title: "Flight Attendant",
      emoji: "✈️",
      description: "Ensure passenger safety and comfort on commercial flights.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Airline training program + Languages",
      keySkills: ["customer service", "safety procedures", "languages", "calm under pressure", "teamwork"],
      dailyTasks: ["Conduct safety briefings", "Serve passengers", "Handle emergencies", "Ensure comfort"],
      growthOutlook: "stable",
    },
    {
      id: "hairdresser",
      title: "Hairdresser",
      emoji: "💇",
      description: "Cut, style, and color hair, providing beauty services to clients.",
      avgSalary: "320,000 - 480,000 kr/year",
      educationPath: "Vocational training (2 years) + Apprenticeship (2 years) = Fagbrev",
      keySkills: ["creativity", "manual dexterity", "communication", "trend awareness", "customer service"],
      dailyTasks: ["Cut and style hair", "Consult with clients", "Apply treatments", "Stay updated on trends"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "fitness-instructor",
      title: "Personal Trainer",
      emoji: "🏋️",
      description: "Lead fitness classes and provide personal training to help clients reach health goals.",
      avgSalary: "350,000 - 550,000 kr/year",
      educationPath: "Fitness certifications + Sports education",
      keySkills: ["fitness knowledge", "motivation", "communication", "anatomy knowledge", "safety awareness"],
      dailyTasks: ["Lead classes", "Create workout plans", "Motivate clients", "Track progress"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "restaurant-server",
      title: "Restaurant Server",
      emoji: "🍽️",
      description: "Serve food and drinks to guests, ensuring a positive dining experience.",
      avgSalary: "320,000 - 450,000 kr/year",
      educationPath: "No formal education - on-the-job training",
      keySkills: ["customer service", "communication", "multitasking", "product knowledge", "teamwork"],
      dailyTasks: ["Take orders", "Serve food", "Handle payments", "Ensure guest satisfaction"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "event-planner",
      title: "Event Planner",
      emoji: "🎉",
      description: "Plan and coordinate events such as weddings, conferences, and corporate functions.",
      avgSalary: "420,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Event Management or Marketing",
      keySkills: ["organisation", "creativity", "communication", "negotiation", "problem-solving"],
      dailyTasks: ["Plan events", "Coordinate vendors", "Manage budgets", "Handle logistics", "Oversee execution"],
      growthOutlook: "medium",
    },
    {
      id: "receptionist",
      title: "Hotel Receptionist",
      emoji: "🛎️",
      description: "Welcome guests, handle check-ins/check-outs, and assist with inquiries at hotels.",
      avgSalary: "340,000 - 450,000 kr/year",
      educationPath: "Hospitality training or on-the-job training",
      keySkills: ["customer service", "communication", "organisation", "languages", "computer skills"],
      dailyTasks: ["Check in guests", "Handle reservations", "Answer inquiries", "Process payments"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "massage-therapist",
      title: "Massage Therapist",
      emoji: "💆",
      description: "Provide therapeutic massage treatments to relieve pain, reduce stress, and improve wellbeing.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "Massage therapy certification (1-2 years)",
      keySkills: ["massage techniques", "anatomy knowledge", "communication", "physical stamina", "empathy"],
      dailyTasks: ["Perform massages", "Assess client needs", "Maintain treatment records", "Sanitize equipment", "Advise on wellness"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "beautician",
      title: "Makeup Artist",
      emoji: "💄",
      description: "Provide skincare treatments, apply makeup, and advise clients on beauty routines.",
      avgSalary: "320,000 - 480,000 kr/year",
      educationPath: "Vocational beauty training or certifications",
      keySkills: ["makeup application", "skincare knowledge", "creativity", "customer service", "trend awareness"],
      dailyTasks: ["Apply makeup", "Perform skincare treatments", "Advise on products", "Maintain hygiene standards", "Stay updated on trends"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "nail-technician",
      title: "Nail Technician",
      emoji: "💅",
      description: "Provide manicures, pedicures, nail art, and nail enhancements to clients.",
      avgSalary: "300,000 - 420,000 kr/year",
      educationPath: "Nail technician certification courses",
      keySkills: ["nail techniques", "creativity", "attention to detail", "customer service", "hygiene practices"],
      dailyTasks: ["Perform manicures/pedicures", "Apply nail art", "Maintain tools", "Advise on nail care", "Manage appointments"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "photographer",
      title: "Photographer",
      emoji: "📷",
      description: "Capture professional images for events, portraits, commercial use, or artistic expression.",
      avgSalary: "350,000 - 600,000 kr/year",
      educationPath: "Photography education or self-taught with portfolio",
      keySkills: ["camera operation", "lighting", "composition", "photo editing", "client communication"],
      dailyTasks: ["Plan and shoot photos", "Edit images", "Meet with clients", "Manage equipment", "Market services"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "video-editor",
      title: "Video Editor",
      emoji: "🎬",
      description: "Shoot and edit video content for films, commercials, social media, and corporate clients.",
      avgSalary: "400,000 - 650,000 kr/year",
      educationPath: "Film/media education or strong portfolio",
      keySkills: ["video editing software", "storytelling", "color grading", "audio editing", "creativity"],
      dailyTasks: ["Edit video footage", "Add effects and graphics", "Color correct", "Collaborate with clients", "Manage media files"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "interior-designer",
      title: "Interior Designer",
      emoji: "🏠",
      description: "Design functional and aesthetic interior spaces for homes, offices, and commercial buildings.",
      avgSalary: "450,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Interior Design or Architecture",
      keySkills: ["space planning", "color theory", "CAD software", "creativity", "client communication"],
      dailyTasks: ["Create design concepts", "Select materials and furnishings", "Present to clients", "Coordinate with contractors", "Manage projects"],
      growthOutlook: "medium",
    },
    {
      id: "architect",
      title: "Architect",
      emoji: "🏛️",
      description: "Design buildings and structures, balancing aesthetics, functionality, and safety requirements.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Master's in Architecture (5 years)",
      keySkills: ["architectural design", "CAD/BIM software", "building codes", "project management", "creativity"],
      dailyTasks: ["Design buildings", "Create drawings and models", "Meet with clients", "Coordinate with engineers", "Oversee construction"],
      growthOutlook: "medium",
    },
    {
      id: "graphic-designer",
      title: "Graphic Designer",
      emoji: "🖌️",
      description: "Create visual content for print and digital media including logos, marketing materials, and websites.",
      avgSalary: "420,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Graphic Design or strong portfolio",
      keySkills: ["Adobe Creative Suite", "typography", "layout design", "creativity", "client communication"],
      dailyTasks: ["Design visual content", "Create brand materials", "Present concepts", "Revise based on feedback", "Prepare files for production"],
      growthOutlook: "medium",
    },
    {
      id: "house-cleaner",
      title: "House Cleaner",
      emoji: "🧹",
      description: "Clean private homes for clients on a regular schedule. Often self-employed or via a cleaning company. Path forward leads to Cleaning Supervisor and Facilities Manager.",
      avgSalary: "330,000 - 450,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["thoroughness", "time management", "trustworthiness", "physical fitness", "client communication"],
      dailyTasks: ["Travel between clients", "Clean rooms and surfaces", "Manage supplies", "Handle laundry", "Build client trust"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "hotel-housekeeper",
      title: "Hotel Housekeeper",
      emoji: "🛏️",
      description: "Service hotel rooms between guests — change linen, clean bathrooms, restock supplies. Path forward leads to Floor Supervisor, Head Housekeeper and Hotel Operations roles.",
      avgSalary: "350,000 - 470,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["thoroughness", "speed", "physical fitness", "discretion", "teamwork"],
      dailyTasks: ["Service guest rooms", "Change linens", "Restock amenities", "Report maintenance issues", "Hit room targets"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "kitchen-porter",
      title: "Kitchen Porter",
      emoji: "🍽️",
      description: "Wash dishes, prep ingredients and keep the kitchen running for chefs. The classic entry into hospitality — many head chefs started here.",
      avgSalary: "320,000 - 430,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["speed", "stamina", "teamwork", "hygiene awareness", "calm under pressure"],
      dailyTasks: ["Wash dishes and pans", "Prep ingredients", "Take out waste", "Clean kitchen surfaces", "Support chefs"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "fast-food-crew",
      title: "Fast Food Crew Member",
      emoji: "🍔",
      description: "Take orders, prepare food and serve customers in a fast-paced restaurant. Often the first job at 15+; the path forward leads to Shift Leader and Restaurant Manager.",
      avgSalary: "300,000 - 400,000 kr/year",
      educationPath: "No formal requirement — on-the-job training",
      keySkills: ["speed", "customer service", "teamwork", "hygiene awareness", "reliability"],
      dailyTasks: ["Take orders", "Prepare food", "Serve customers", "Clean stations", "Handle payments"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "dog-groomer",
      title: "Dog Groomer",
      emoji: "🐕",
      description: "Wash, clip, trim and style dogs at a salon, mobile van or independently. Combines animal handling with creative skill. Often self-employed with a regular client base.",
      avgSalary: "320,000 - 500,000 kr/year",
      educationPath: "Vocational grooming course (3-12 months) — entry possible without formal training",
      keySkills: ["animal handling", "patience", "scissor work", "stamina", "client communication"],
      dailyTasks: ["Bathe dogs", "Clip and trim coats", "Handle nervous animals", "Manage bookings", "Build client base"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    { id: "restaurant-owner", title: "Restaurant Owner", emoji: "🍽️", description: "Own and run a restaurant — set the menu, hire chefs, manage finances, and build a place people love to eat at.", avgSalary: "400,000 - 1,500,000+ kr/year (highly variable, often loss-making early)", educationPath: "Hospitality experience + business knowledge; no degree required", keySkills: ["business management", "hospitality", "leadership", "finance", "creativity"], dailyTasks: ["Plan menus", "Manage staff", "Track costs", "Greet guests", "Handle suppliers"], growthOutlook: "stable", entryLevel: true },
    { id: "barista", title: "Barista", emoji: "☕", description: "Make and serve coffee in a café — pulling espresso, steaming milk, and building a regular customer base.", avgSalary: "320,000 - 450,000 kr/year", educationPath: "On-the-job training; specialty coffee courses (SCA) help", keySkills: ["espresso technique", "milk steaming", "customer service", "speed", "consistency"], dailyTasks: ["Brew coffee", "Serve customers", "Clean equipment", "Restock supplies", "Run the till"], growthOutlook: "stable", entryLevel: true },
    {
      id: "baker",
      title: "Baker",
      emoji: "🍞",
      description: "Bake bread, pastries, and cakes — early starts, hot ovens, and the craft of turning flour, water, and time into something people line up for.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Vocational training (Baker fagbrev) — 2 years school + 2 years apprenticeship",
      keySkills: ["dough handling", "timing", "precision", "stamina", "craftsmanship"],
      dailyTasks: ["Mix doughs", "Shape and proof", "Bake batches", "Decorate", "Clean equipment"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "pastry-chef",
      title: "Pastry Chef",
      emoji: "🥐",
      description: "Specialise in desserts, pastries, chocolate work, and cakes — the artistic, precise side of the kitchen where presentation and technique matter most.",
      avgSalary: "420,000 - 680,000 kr/year",
      educationPath: "Culinary or pastry-specific vocational training (Konditor fagbrev)",
      keySkills: ["pastry technique", "creativity", "precision", "patience", "presentation"],
      dailyTasks: ["Make doughs and creams", "Decorate cakes", "Develop dessert menus", "Manage stock", "Run pastry section"],
      growthOutlook: "stable",
    },
    {
      id: "butcher",
      title: "Butcher",
      emoji: "🔪",
      description: "Cut, prepare, and sell meat — breaking down whole carcasses or working from primal cuts in a shop, supermarket, or restaurant supply.",
      avgSalary: "400,000 - 600,000 kr/year",
      educationPath: "Vocational training (Slakter / Kjøttskjærer fagbrev) — 2 + 2 years",
      keySkills: ["knife skills", "anatomy knowledge", "food safety", "physical stamina", "customer service"],
      dailyTasks: ["Break down carcasses", "Trim cuts", "Mince and sausage-make", "Serve customers", "Clean tools"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "sommelier",
      title: "Sommelier",
      emoji: "🍷",
      description: "The wine expert in a fine restaurant — selecting wines, training staff, advising guests, and pairing bottles to dishes on the menu.",
      avgSalary: "450,000 - 800,000 kr/year",
      educationPath: "WSET or Court of Master Sommeliers certification + restaurant experience",
      keySkills: ["wine knowledge", "tasting", "customer service", "memory", "storytelling"],
      dailyTasks: ["Taste and select wines", "Build wine lists", "Advise guests", "Train staff", "Manage cellar"],
      growthOutlook: "stable",
    },
    {
      id: "catering-manager",
      title: "Catering Manager",
      emoji: "🍽️",
      description: "Run catering operations for events, schools, hospitals, or workplaces — planning menus, leading kitchen teams, and managing budgets at scale.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Hospitality management qualification or chef background + management experience",
      keySkills: ["menu planning", "budgeting", "leadership", "logistics", "food safety"],
      dailyTasks: ["Plan menus", "Manage staff rotas", "Handle suppliers", "Track costs", "Run events"],
      growthOutlook: "stable",
    },
    {
      id: "restaurant-manager",
      title: "Restaurant Manager",
      emoji: "📋",
      description: "Run a restaurant day-to-day — staff, service, finances, customer experience — making sure every shift goes smoothly and the business stays profitable.",
      avgSalary: "480,000 - 750,000 kr/year",
      educationPath: "Hospitality management or chef background; many work up from waiter or kitchen roles",
      keySkills: ["leadership", "customer service", "budgeting", "rota planning", "calm under pressure"],
      dailyTasks: ["Open and close site", "Lead service", "Hire and train staff", "Track sales", "Handle issues"],
      growthOutlook: "stable",
    },
  ],

  // ========================================
  // TELECOMMUNICATIONS
  // ========================================
  TELECOMMUNICATIONS: [
    // Architecture & Strategy
    {
      id: "telco-oss-bss-architect",
      title: "Telecom Solutions Architect",
      emoji: "📡",
      description: "Design end-to-end OSS/BSS solutions aligning business processes with TM Forum standards for telecommunications operators.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Telecom + TM Forum certifications",
      keySkills: ["TM Forum Open APIs", "solution design", "OSS/BSS platforms", "integration patterns", "stakeholder management"],
      dailyTasks: ["Define target architecture for OSS/BSS programmes", "Map requirements to TM Forum frameworks", "Lead technical evaluation of vendor platforms", "Design integration patterns", "Present to stakeholders"],
      growthOutlook: "high",
    },
    {
      id: "telco-network-architect",
      title: "Telecom Network Architect",
      emoji: "🌐",
      description: "Design network infrastructure spanning core, transport, and access layers for telecom carriers, including 5G rollout planning.",
      avgSalary: "750,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in Telecom/EE + Network certifications",
      keySkills: ["network design", "5G architecture", "IP/MPLS", "optical transport", "capacity planning"],
      dailyTasks: ["Design multi-layer network architecture", "Produce network topology documents", "Evaluate emerging technologies", "Plan 5G rollout", "Coordinate with vendors"],
      growthOutlook: "high",
    },
    {
      id: "telco-enterprise-architect",
      title: "Enterprise Architect",
      emoji: "🏛️",
      description: "Govern the enterprise architecture landscape for telecom operators, ensuring alignment with TM Forum eTOM/SID and business strategy.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Master's in CS/Business + TOGAF + 10+ years telecom experience",
      keySkills: ["enterprise architecture", "TM Forum eTOM/SID", "TOGAF", "business strategy", "governance"],
      dailyTasks: ["Maintain enterprise architecture roadmap", "Ensure TM Forum alignment", "Chair architecture review boards", "Approve solution designs", "Guide technology decisions"],
      growthOutlook: "high",
    },
    {
      id: "telco-cloud-platform-architect",
      title: "Cloud & Telco Platform Architect",
      emoji: "☁️",
      description: "Bridge hyperscaler cloud platforms with telco-specific workloads, designing hybrid cloud architecture for network functions.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + Cloud certifications + Telecom experience",
      keySkills: ["AWS/Azure/GCP", "Kubernetes", "telco cloud", "NFV/CNF", "platform design"],
      dailyTasks: ["Design hybrid cloud architecture", "Define platform standards for CNF", "Evaluate hyperscaler telco services", "Collaborate with network teams", "Present architecture proposals"],
      growthOutlook: "high",
    },
    {
      id: "telco-orchestration-architect",
      title: "Network Service Orchestration Architect",
      emoji: "🎼",
      description: "Architect service orchestration layers translating customer-facing services to network resources using TM Forum standards.",
      avgSalary: "750,000 - 1,150,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Telecom + Service orchestration experience",
      keySkills: ["CFS/RFS modelling", "TMF 641/633", "service orchestration", "BPMN/workflows", "API design"],
      dailyTasks: ["Design CFS-to-RFS decomposition models", "Define orchestration workflows", "Align service catalogue with TMF standards", "Coordinate with fulfilment teams", "Review service designs"],
      growthOutlook: "high",
    },
    // Transformation & Delivery
    {
      id: "telco-transformation-lead",
      title: "Telco Transformation Lead",
      emoji: "🚀",
      description: "Lead large-scale digital transformation initiatives across telecom operations and IT, driving multi-year modernisation programmes.",
      avgSalary: "900,000 - 1,500,000 kr/year",
      educationPath: "Master's in Business/Technology + 10+ years telecom experience",
      keySkills: ["programme leadership", "change management", "stakeholder engagement", "business case development", "agile at scale"],
      dailyTasks: ["Drive OSS/BSS modernisation programmes", "Align initiatives with business outcomes", "Manage senior stakeholders", "Track transformation KPIs", "Remove programme impediments"],
      growthOutlook: "high",
    },
    {
      id: "telco-oss-bss-director",
      title: "Telecom Program Director",
      emoji: "📋",
      description: "Direct large OSS/BSS delivery programmes with cross-functional teams, vendor management, and executive reporting.",
      avgSalary: "1,000,000 - 1,600,000 kr/year",
      educationPath: "Master's in Business/Technology + Programme management certifications",
      keySkills: ["programme management", "vendor management", "budget ownership", "risk management", "executive reporting"],
      dailyTasks: ["Oversee OSS/BSS programme delivery", "Manage budgets and timelines", "Report to C-level stakeholders", "Coordinate vendor teams", "Mitigate programme risks"],
      growthOutlook: "high",
    },
    {
      id: "telco-digital-transformation-mgr",
      title: "Telecom Transformation Manager",
      emoji: "💡",
      description: "Manage digital transformation workstreams focused on process automation and customer experience improvement in telecom.",
      avgSalary: "700,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's/Master's in Business/Technology + Digital transformation experience",
      keySkills: ["digital strategy", "process optimisation", "CX design", "agile delivery", "data-driven decision making"],
      dailyTasks: ["Identify transformation opportunities", "Lead cross-functional teams", "Implement process automation", "Measure transformation impact", "Define metrics and KPIs"],
      growthOutlook: "high",
    },
    {
      id: "telco-fulfilment-head",
      title: "Head of Service Fulfilment",
      emoji: "📦",
      description: "Own the end-to-end order-to-activation process ensuring timely service delivery and low fallout rates in telecom operations.",
      avgSalary: "800,000 - 1,300,000 kr/year",
      educationPath: "Bachelor's/Master's in Business/Technology + Telecom operations experience",
      keySkills: ["order management", "process engineering", "SLA management", "cross-team coordination", "telco domain knowledge"],
      dailyTasks: ["Optimise order-to-activation cycle times", "Coordinate sales and provisioning teams", "Define fulfilment SLAs", "Reduce fallout rates", "Report on process metrics"],
      growthOutlook: "high",
    },
    {
      id: "telco-safe-rte",
      title: "Telecom Release Train Engineer",
      emoji: "🚂",
      description: "Facilitate agile release trains within telecom programmes, removing impediments and driving flow across multiple teams.",
      avgSalary: "750,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's + SAFe RTE certification + Agile experience",
      keySkills: ["SAFe framework", "agile coaching", "PI planning", "risk management", "metrics & flow"],
      dailyTasks: ["Facilitate PI planning ceremonies", "Track and remove cross-team impediments", "Coach teams on agile practices", "Monitor flow metrics", "Coordinate release activities"],
      growthOutlook: "high",
    },
    // OSS / Network Engineering
    {
      id: "telco-network-automation-eng",
      title: "Network Automation Engineer",
      emoji: "🤖",
      description: "Automate network configuration, provisioning, and lifecycle management using Python, Ansible, and NETCONF/YANG models.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in CS/Telecom + Network automation experience",
      keySkills: ["Python", "Ansible", "NETCONF/YANG", "REST APIs", "network protocols"],
      dailyTasks: ["Build network automation scripts", "Implement NETCONF/YANG models", "Integrate with OSS platforms", "Test automation workflows", "Document procedures"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "telco-oss-engineer",
      title: "Telecom Operations Engineer",
      emoji: "🔧",
      description: "Build and maintain OSS systems handling network inventory, service assurance, and fulfilment for telecom operators.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in CS/IT + OSS platform experience",
      keySkills: ["OSS platforms", "service inventory", "fault management", "SQL/data modelling", "integration"],
      dailyTasks: ["Configure OSS platform modules", "Build integrations with network elements", "Support incident resolution", "Maintain data models", "Test system changes"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "telco-noc-lead",
      title: "Network Operations Lead",
      emoji: "📊",
      description: "Lead network operations centre teams ensuring service quality, rapid incident response, and SLA compliance.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in IT/Telecom + ITIL certification + NOC experience",
      keySkills: ["service assurance", "incident management", "team leadership", "monitoring tools", "ITIL"],
      dailyTasks: ["Manage NOC shift operations", "Monitor SLA compliance", "Drive root cause analysis", "Escalate major incidents", "Improve operational procedures"],
      growthOutlook: "stable",
    },
    {
      id: "telco-network-perf-eng",
      title: "Network Performance Engineer",
      emoji: "📈",
      description: "Analyse and optimise network performance using KPIs, counters, and capacity data for telecom operators.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Telecom/EE + Network performance experience",
      keySkills: ["performance analysis", "KPI frameworks", "capacity planning", "SQL/BI tools", "network protocols"],
      dailyTasks: ["Monitor network KPIs", "Identify degradation trends", "Produce capacity forecasts", "Recommend optimisations", "Collaborate on expansion decisions"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "telco-test-env-lead",
      title: "Network Test Lead",
      emoji: "🧪",
      description: "Manage test environments and validation processes for network and OSS/BSS releases in telecom organisations.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in CS/Telecom + Test management experience",
      keySkills: ["test environment management", "release validation", "lab infrastructure", "test strategy", "coordination"],
      dailyTasks: ["Maintain test environments", "Coordinate validation cycles", "Define test governance", "Manage environment booking", "Support release testing"],
      growthOutlook: "stable",
    },
    // BSS / Commercial Systems
    {
      id: "telco-catalog-manager",
      title: "Product Catalog Manager",
      emoji: "📚",
      description: "Manage the product and service catalogue for telecom operators, ensuring alignment with TM Forum standards (TMF 620/633).",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in Business/IT + TM Forum knowledge",
      keySkills: ["TMF 620/633", "product modelling", "catalogue tools", "business analysis", "cross-team collaboration"],
      dailyTasks: ["Model products using TMF standards", "Coordinate catalogue changes", "Govern data quality", "Support commercial teams", "Manage product lifecycle"],
      growthOutlook: "high",
    },
    {
      id: "telco-cpq-architect",
      title: "CPQ Architect",
      emoji: "💰",
      description: "Architect the Configure-Price-Quote system for complex telecom product bundling, pricing rules, and approval workflows.",
      avgSalary: "750,000 - 1,150,000 kr/year",
      educationPath: "Bachelor's/Master's in CS/Business + CPQ platform experience",
      keySkills: ["CPQ platforms", "pricing logic", "product configuration", "Salesforce/Vlocity", "solution design"],
      dailyTasks: ["Design CPQ solution architecture", "Define pricing rules and discount matrices", "Integrate with catalogue and billing", "Support B2B/B2C offerings", "Review technical designs"],
      growthOutlook: "high",
    },
    {
      id: "telco-billing-specialist",
      title: "Billing & Charging Specialist",
      emoji: "🧾",
      description: "Manage billing and charging systems that rate usage, generate invoices, and handle payments for telecom services.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in IT/Business + Billing platform experience",
      keySkills: ["billing platforms", "rating & charging", "mediation", "revenue processes", "troubleshooting"],
      dailyTasks: ["Configure rating and charging rules", "Investigate billing discrepancies", "Support billing system upgrades", "Resolve customer disputes", "Maintain billing configurations"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "telco-slm-lead",
      title: "Subscription Lifecycle Management Lead",
      emoji: "🔄",
      description: "Lead subscription lifecycle strategy from acquisition through retention and win-back for telecom operators.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's/Master's in Marketing/Business + CRM experience",
      keySkills: ["lifecycle management", "churn analytics", "CRM platforms", "campaign strategy", "customer insights"],
      dailyTasks: ["Design subscription lifecycle journeys", "Analyse churn patterns", "Implement retention campaigns", "Collaborate on lifecycle-driven offers", "Track lifecycle metrics"],
      growthOutlook: "high",
    },
    {
      id: "telco-revenue-assurance-mgr",
      title: "Revenue Assurance Manager",
      emoji: "🔍",
      description: "Ensure billing accuracy and prevent revenue leakage across the telecom value chain through controls and reconciliation.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's in Finance/IT + Revenue assurance experience",
      keySkills: ["revenue assurance", "data analysis", "audit processes", "billing systems", "financial reporting"],
      dailyTasks: ["Identify revenue leakage", "Implement reconciliation controls", "Report findings to leadership", "Audit billing accuracy", "Track remediation progress"],
      growthOutlook: "stable",
    },
    // Cloud, Virtualisation & Infrastructure
    {
      id: "telco-cloud-engineer",
      title: "Telco Cloud Engineer",
      emoji: "☁️",
      description: "Deploy and operate cloud-native and virtualised network functions on telco infrastructure using Kubernetes and NFV/CNF technologies.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Kubernetes + Telecom experience",
      keySkills: ["Kubernetes", "NFV/CNF", "Helm/Operators", "Linux", "telco cloud platforms"],
      dailyTasks: ["Deploy CNFs on Kubernetes", "Troubleshoot pod and networking issues", "Onboard vendor VNF/CNFs", "Manage telco cloud lifecycle", "Collaborate with vendors"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "telco-open-ran-engineer",
      title: "Open RAN Engineer",
      emoji: "📶",
      description: "Work on disaggregated radio access network solutions using Open RAN standards, integrating multi-vendor components.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in EE/Telecom + O-RAN experience",
      keySkills: ["O-RAN architecture", "RAN software", "integration testing", "RF basics", "Linux"],
      dailyTasks: ["Integrate Open RAN components", "Validate O-RAN compliance", "Support lab and field trials", "Test interoperability", "Document test results"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "telco-sre",
      title: "Telecom Platform Reliability Engineer",
      emoji: "🔧",
      description: "Ensure platform reliability and availability for telco-grade workloads through SRE practices, observability, and automation.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/IT + SRE experience + Telecom knowledge",
      keySkills: ["SRE practices", "observability", "incident response", "automation", "Kubernetes"],
      dailyTasks: ["Define and monitor SLOs/SLIs", "Automate incident response", "Drive reliability improvements", "Conduct chaos engineering", "Run post-mortems"],
      growthOutlook: "high",
    },
    {
      id: "telco-edge-specialist",
      title: "Edge Computing Specialist",
      emoji: "📡",
      description: "Design and deploy edge computing solutions for low-latency telecom and IoT use cases using MEC platforms.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/EE + Edge computing experience",
      keySkills: ["MEC platforms", "edge architecture", "IoT integration", "low-latency networking", "container orchestration"],
      dailyTasks: ["Design edge deployment topologies", "Evaluate edge platform solutions", "Define edge use cases", "Build proof-of-concepts", "Integrate with telco infrastructure"],
      growthOutlook: "high",
    },
    // Cross-Over Roles (Telco x Software)
    {
      id: "cross-oss-bss-product-mgr",
      title: "Telecom Product Manager",
      emoji: "📱",
      description: "Own the product vision and roadmap for OSS/BSS platforms, bridging telecom domain knowledge with modern software practices.",
      avgSalary: "700,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's/Master's in Business/CS + Telecom + Product management experience",
      keySkills: ["product management", "telco domain", "agile/scrum", "roadmap planning", "stakeholder management"],
      dailyTasks: ["Define OSS/BSS product backlog", "Translate telco requirements to features", "Coordinate releases", "Engage business stakeholders", "Prioritise product features"],
      growthOutlook: "high",
    },
    {
      id: "cross-platform-product-owner",
      title: "Telco Platform Product Owner",
      emoji: "📝",
      description: "Own the platform product backlog ensuring telecom requirements are delivered in agile sprints, bridging telco operations and software engineering.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's + CSPO/PSPO certification + Telecom experience",
      keySkills: ["product ownership", "backlog management", "telco platforms", "scrum", "user stories"],
      dailyTasks: ["Write and refine user stories", "Prioritise platform backlog", "Bridge telco and software teams", "Accept completed work", "Clarify requirements"],
      growthOutlook: "high",
    },
    {
      id: "cross-network-automation-sw-eng",
      title: "Network Automation Software Engineer",
      emoji: "⚙️",
      description: "Write production-grade software that automates network operations and lifecycle management, combining software engineering with telecom knowledge.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in CS + Network automation experience",
      keySkills: ["Python", "REST/gRPC APIs", "network protocols", "CI/CD", "Kubernetes"],
      dailyTasks: ["Build network automation services", "Develop self-service portal APIs", "Implement CI/CD for automation code", "Test against network simulators", "Document APIs"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "cross-api-integration-architect",
      title: "Integration Architect",
      emoji: "🔗",
      description: "Architect integration layers using TMF Open APIs, REST, and event-driven patterns to connect telco BSS/OSS with modern microservices.",
      avgSalary: "800,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's/Master's in CS + API architecture + Telecom experience",
      keySkills: ["API design", "TMF Open APIs", "event-driven architecture", "Kafka/NATS", "integration patterns"],
      dailyTasks: ["Design API strategies", "Define event-driven integration patterns", "Govern API standards", "Review integration designs", "Coordinate across teams"],
      growthOutlook: "high",
    },
    {
      id: "cross-test-env-governance",
      title: "Test Environment Governance Lead",
      emoji: "🏗️",
      description: "Govern test environment strategy across telecom and software platforms, using data analytics to optimise environment usage and provisioning.",
      avgSalary: "700,000 - 1,050,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Test management + Telecom experience",
      keySkills: ["test environment management", "data analytics", "governance", "telco & IT landscape", "tool development"],
      dailyTasks: ["Define test environment strategy", "Build utilisation dashboards", "Coordinate environment provisioning", "Enforce governance procedures", "Optimise environment costs"],
      growthOutlook: "stable",
    },
    {
      id: "cross-observability-eng",
      title: "Observability Engineer",
      emoji: "👁️",
      description: "Build unified observability across telecom network and cloud application stacks using Prometheus, Grafana, and OpenTelemetry.",
      avgSalary: "600,000 - 950,000 kr/year",
      educationPath: "Bachelor's in CS/IT + Observability experience + Telecom knowledge",
      keySkills: ["Prometheus/Grafana", "OpenTelemetry", "log aggregation", "telco KPIs", "alerting"],
      dailyTasks: ["Design unified observability stack", "Implement distributed tracing", "Build cross-domain dashboards", "Configure alerting rules", "Monitor telco and cloud systems"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "head-of-oss",
      title: "Head of OSS",
      emoji: "🖥️",
      description: "Lead the Operations Support Systems function, managing the platforms that monitor, configure, and maintain telecommunications networks.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in IT or Telecommunications + 10+ years in OSS/BSS",
      keySkills: ["OSS platforms", "network management", "ITIL", "vendor management", "team leadership", "telecom architecture"],
      dailyTasks: ["Oversee OSS platform strategy", "Manage vendor relationships", "Drive automation initiatives", "Lead engineering teams", "Ensure network visibility"],
      growthOutlook: "medium",
    },
    {
      id: "head-of-bss",
      title: "Head of BSS",
      emoji: "💼",
      description: "Lead the Business Support Systems function, managing billing, CRM, order management, and revenue assurance platforms for telecommunications operators.",
      avgSalary: "900,000 - 1,400,000 kr/year",
      educationPath: "Bachelor's/Master's in IT or Business + 10+ years in BSS/telecom",
      keySkills: ["BSS platforms", "billing systems", "CRM", "revenue assurance", "digital transformation", "stakeholder management"],
      dailyTasks: ["Define BSS strategy", "Manage billing platform", "Drive digital transformation", "Oversee CRM systems", "Lead cross-functional teams"],
      growthOutlook: "medium",
    },
    {
      id: "head-of-networks",
      title: "Head of Networks",
      emoji: "🌐",
      description: "Lead the network engineering and operations function, responsible for the design, deployment, and maintenance of mobile and fixed telecommunications networks.",
      avgSalary: "950,000 - 1,500,000 kr/year",
      educationPath: "Bachelor's/Master's in Telecommunications or Electrical Engineering + 15+ years network experience",
      keySkills: ["network architecture", "5G/LTE", "IP/MPLS", "team leadership", "vendor management", "capacity planning"],
      dailyTasks: ["Define network strategy", "Oversee network operations", "Plan capacity and coverage", "Manage network vendors", "Lead engineering teams"],
      growthOutlook: "medium",
    },
    { id: "telco-network-engineer", title: "Network Engineer", emoji: "🛜", description: "Design, configure, and maintain telecom networks across access, transport, and core layers.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Bachelor's in Telecom/EE + CCNA/JNCIA", keySkills: ["routing & switching", "IP/MPLS", "network design", "troubleshooting", "documentation"], dailyTasks: ["Configure routers and switches", "Investigate network faults", "Plan capacity changes", "Document topologies", "Support rollouts"], growthOutlook: "high" },
    { id: "telco-rf-engineer", title: "Radio Frequency (RF) Engineer", emoji: "📶", description: "Plan and optimise radio coverage for mobile networks, tuning antennas and frequencies for 4G/5G.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in Telecom/EE + RF planning tools", keySkills: ["RF planning", "drive testing", "Atoll/Asset", "5G NR", "optimisation"], dailyTasks: ["Run coverage simulations", "Analyse drive test data", "Tune cell parameters", "Resolve interference", "Support new site launches"], growthOutlook: "high", workSetting: "mixed" },
    { id: "telco-core-network-engineer", title: "Core Network Engineer", emoji: "🧠", description: "Operate and evolve mobile core network elements (EPC, 5GC) handling signalling, mobility, and sessions.", avgSalary: "700,000 - 1,000,000 kr/year", educationPath: "Bachelor's/Master's in Telecom + vendor core certifications", keySkills: ["5GC/EPC", "Diameter/SIP", "signalling", "Linux", "virtualisation"], dailyTasks: ["Maintain core nodes", "Investigate signalling issues", "Plan upgrades", "Tune performance", "Support new services"], growthOutlook: "high" },
    { id: "telco-transmission-engineer", title: "Transmission Engineer", emoji: "📡", description: "Engineer microwave and fibre transmission links that backhaul mobile and fixed traffic.", avgSalary: "600,000 - 850,000 kr/year", educationPath: "Bachelor's in Telecom/EE + microwave/optical training", keySkills: ["microwave links", "DWDM", "link budgets", "alignment", "fault analysis"], dailyTasks: ["Design transmission paths", "Calculate link budgets", "Commission new links", "Investigate outages", "Maintain documentation"], growthOutlook: "medium" },
    { id: "telco-ip-network-engineer", title: "IP Network Engineer", emoji: "🌐", description: "Build and maintain IP/MPLS backbones and aggregation networks carrying customer and signalling traffic.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in CS/Telecom + CCNP/JNCIP", keySkills: ["BGP/OSPF/ISIS", "MPLS", "QoS", "Juniper/Cisco", "network automation"], dailyTasks: ["Configure routers", "Tune routing policies", "Troubleshoot incidents", "Roll out new services", "Automate changes"], growthOutlook: "high" },
    { id: "telco-optical-network-engineer", title: "Optical Network Engineer", emoji: "💡", description: "Design and operate DWDM optical transport networks underpinning long-haul telecom traffic.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in Telecom/EE + optical vendor training", keySkills: ["DWDM", "OTN", "optical amplifiers", "fibre characterisation", "GMPLS"], dailyTasks: ["Plan optical capacity", "Commission new wavelengths", "Investigate fibre faults", "Optimise power levels", "Support upgrades"], growthOutlook: "high" },
    { id: "telco-field-engineer", title: "Field Engineer", emoji: "🪛", description: "Install, commission, and repair telecom equipment on customer sites, base stations, and exchanges.", avgSalary: "500,000 - 750,000 kr/year", educationPath: "Vocational diploma in electronics/telecom + certifications", keySkills: ["installation", "fault finding", "safety", "tools & test gear", "customer comms"], dailyTasks: ["Install hardware on site", "Run cable and fibre", "Test and commission links", "Fix faults", "Complete site reports"], growthOutlook: "medium", entryLevel: true, workSetting: "outdoors" },
    { id: "telco-noc-engineer", title: "NOC Engineer", emoji: "🖥️", description: "Monitor telecom networks 24/7 from a Network Operations Centre, triaging alarms and coordinating fixes.", avgSalary: "500,000 - 750,000 kr/year", educationPath: "Bachelor's in Telecom/IT or vocational + ITIL", keySkills: ["alarm monitoring", "ticketing", "incident triage", "ITIL", "communication"], dailyTasks: ["Watch dashboards", "Triage alarms", "Open and update tickets", "Coordinate field teams", "Escalate major incidents"], growthOutlook: "medium", entryLevel: true },
    { id: "telco-ran-engineer", title: "RAN Engineer", emoji: "📡", description: "Manage the Radio Access Network — base stations, controllers, and the radio side of mobile networks.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in Telecom/EE + vendor RAN training", keySkills: ["LTE/NR", "base station configuration", "KPI analysis", "vendor tools", "rollout support"], dailyTasks: ["Configure cell sites", "Analyse RAN KPIs", "Support new deployments", "Resolve coverage issues", "Coordinate with RF planning"], growthOutlook: "high" },
    { id: "telco-voip-engineer", title: "VoIP Engineer", emoji: "☎️", description: "Design and run voice-over-IP platforms, SBCs, and IMS components delivering modern voice services.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Bachelor's in CS/Telecom + SIP/IMS training", keySkills: ["SIP", "IMS", "SBC", "codecs", "voice quality"], dailyTasks: ["Configure SBCs", "Investigate call drops", "Plan IMS upgrades", "Tune voice quality", "Support interconnects"], growthOutlook: "medium" },
    { id: "telco-oss-engineer", title: "OSS Engineer", emoji: "🛠️", description: "Build and operate Operational Support Systems — inventory, fault, performance, and orchestration tooling.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in CS/Telecom + OSS vendor experience", keySkills: ["OSS platforms", "TM Forum", "integration", "scripting", "data modelling"], dailyTasks: ["Configure OSS modules", "Build integrations", "Resolve data issues", "Support orchestration", "Automate workflows"], growthOutlook: "high" },
    { id: "telco-bss-engineer", title: "BSS Engineer", emoji: "💳", description: "Build and operate Business Support Systems — CRM, billing, charging, and product catalogue platforms.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in CS/Telecom + BSS vendor experience", keySkills: ["billing systems", "CRM", "product catalogue", "TM Forum APIs", "integration"], dailyTasks: ["Configure BSS modules", "Build product offers", "Investigate billing issues", "Support launches", "Coordinate with finance"], growthOutlook: "high" },
    { id: "telco-integration-engineer", title: "Integration Engineer", emoji: "🔗", description: "Connect telecom systems together using APIs, message queues, and middleware platforms.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in CS + integration platform certifications", keySkills: ["REST/SOAP", "Kafka", "iPaaS", "TM Forum APIs", "API design"], dailyTasks: ["Build integrations", "Define API contracts", "Support testing", "Troubleshoot data flows", "Document interfaces"], growthOutlook: "high" },
    { id: "telco-devops-engineer", title: "DevOps Engineer", emoji: "♾️", description: "Automate build, deploy, and operations pipelines for telco software and platforms.", avgSalary: "700,000 - 1,000,000 kr/year", educationPath: "Bachelor's in CS + DevOps tooling experience", keySkills: ["CI/CD", "Kubernetes", "Terraform", "observability", "scripting"], dailyTasks: ["Maintain pipelines", "Automate deployments", "Manage infrastructure as code", "Support release events", "Improve reliability"], growthOutlook: "high" },
    { id: "telco-software-engineer", title: "Software Engineer", emoji: "💻", description: "Build software products and internal tools for telecom operators, from portals to network apps.", avgSalary: "650,000 - 1,000,000 kr/year", educationPath: "Bachelor's in CS or equivalent experience", keySkills: ["coding", "APIs", "testing", "version control", "system design"], dailyTasks: ["Write features", "Review code", "Fix bugs", "Design services", "Support deployments"], growthOutlook: "high" },
    { id: "telco-data-engineer", title: "Data Engineer", emoji: "🧮", description: "Build data pipelines and warehouses powering telco analytics, billing, and ML.", avgSalary: "700,000 - 1,000,000 kr/year", educationPath: "Bachelor's in CS/Data + cloud data platform skills", keySkills: ["SQL", "Spark", "data modelling", "ETL", "cloud warehouses"], dailyTasks: ["Build pipelines", "Model data", "Tune queries", "Support analysts", "Maintain quality"], growthOutlook: "high" },
    { id: "telco-ai-ml-engineer", title: "AI and ML Engineer", emoji: "🤖", description: "Apply machine learning to telecom problems like churn, fault prediction, and network optimisation.", avgSalary: "750,000 - 1,100,000 kr/year", educationPath: "Master's in CS/ML or strong bachelor's + ML projects", keySkills: ["Python", "ML frameworks", "feature engineering", "MLOps", "statistics"], dailyTasks: ["Train models", "Deploy ML services", "Evaluate performance", "Work with data engineers", "Iterate on use cases"], growthOutlook: "high" },
    { id: "telco-it-systems-engineer", title: "IT Systems Engineer", emoji: "🗄️", description: "Operate the internal IT systems telecom employees rely on — servers, identity, and corporate apps.", avgSalary: "550,000 - 800,000 kr/year", educationPath: "Bachelor's in IT or vocational + Microsoft/Linux certifications", keySkills: ["Windows/Linux", "Active Directory", "virtualisation", "scripting", "support"], dailyTasks: ["Maintain servers", "Manage identities", "Patch systems", "Resolve incidents", "Support employees"], growthOutlook: "medium" },
    { id: "telco-service-delivery-manager", title: "Service Delivery Manager", emoji: "📦", description: "Own delivery of telecom services to customers, hitting SLAs and coordinating across operations teams.", avgSalary: "750,000 - 1,050,000 kr/year", educationPath: "Bachelor's + ITIL + service management experience", keySkills: ["ITIL", "SLA management", "stakeholder comms", "reporting", "escalation"], dailyTasks: ["Track SLAs", "Run service reviews", "Manage escalations", "Coordinate teams", "Report to customers"], growthOutlook: "medium" },
    { id: "telco-incident-manager", title: "Incident Manager", emoji: "🚨", description: "Lead the response to major telecom incidents, restoring service and coordinating communication.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's + ITIL + incident management experience", keySkills: ["ITIL incident", "crisis comms", "coordination", "RCA", "decision-making"], dailyTasks: ["Run major incident calls", "Coordinate fixes", "Communicate updates", "Drive RCAs", "Improve playbooks"], growthOutlook: "medium" },
    { id: "telco-problem-manager", title: "Problem Manager", emoji: "🧩", description: "Investigate recurring telecom issues, find root causes, and prevent future incidents.", avgSalary: "650,000 - 900,000 kr/year", educationPath: "Bachelor's + ITIL + analytical experience", keySkills: ["ITIL problem", "RCA", "data analysis", "facilitation", "documentation"], dailyTasks: ["Lead RCAs", "Track problem records", "Drive permanent fixes", "Report trends", "Coach teams"], growthOutlook: "medium" },
    { id: "telco-change-manager", title: "Change Manager", emoji: "📝", description: "Govern changes to telecom networks and systems, ensuring risks are assessed and approvals in place.", avgSalary: "650,000 - 900,000 kr/year", educationPath: "Bachelor's + ITIL + governance experience", keySkills: ["ITIL change", "risk assessment", "CAB facilitation", "documentation", "stakeholder mgmt"], dailyTasks: ["Review change requests", "Run CAB meetings", "Assess risk", "Track schedules", "Audit changes"], growthOutlook: "stable" },
    { id: "telco-service-assurance-engineer", title: "Service Assurance Engineer", emoji: "✅", description: "Monitor end-to-end service health and proactively detect degradation before customers feel it.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Bachelor's in Telecom/CS + monitoring tool experience", keySkills: ["assurance tooling", "SLA management", "correlation", "analytics", "ticketing"], dailyTasks: ["Tune monitoring", "Detect degradation", "Open proactive tickets", "Coordinate fixes", "Report on KPIs"], growthOutlook: "medium" },
    { id: "telco-capacity-planner", title: "Capacity Planner", emoji: "📈", description: "Forecast capacity needs across networks and platforms, balancing cost, growth, and resilience.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in Telecom/Engineering + analytics skills", keySkills: ["forecasting", "data analysis", "modelling", "network knowledge", "reporting"], dailyTasks: ["Build capacity models", "Forecast growth", "Plan upgrades", "Coordinate with operations", "Report risks"], growthOutlook: "medium" },
    { id: "telco-pricing-analyst", title: "Pricing Analyst", emoji: "💰", description: "Model telecom product pricing, promos, and bundles to balance revenue, margin, and competitiveness.", avgSalary: "550,000 - 800,000 kr/year", educationPath: "Bachelor's in Finance/Economics/Business", keySkills: ["pricing strategy", "Excel/SQL", "modelling", "market analysis", "commercial sense"], dailyTasks: ["Build pricing models", "Analyse promos", "Track competitor pricing", "Brief product teams", "Report on margins"], growthOutlook: "medium" },
    { id: "telco-business-analyst", title: "Business Analyst", emoji: "📊", description: "Translate business needs into requirements for telecom IT and network change programmes.", avgSalary: "600,000 - 850,000 kr/year", educationPath: "Bachelor's in Business/CS + BA certifications", keySkills: ["requirements gathering", "process modelling", "stakeholder mgmt", "documentation", "user stories"], dailyTasks: ["Workshop with stakeholders", "Write requirements", "Map processes", "Support testing", "Maintain backlog"], growthOutlook: "medium" },
    { id: "telco-presales-engineer", title: "Pre-Sales Engineer", emoji: "🤝", description: "Partner with sales teams to design technical solutions and respond to telecom RFPs.", avgSalary: "750,000 - 1,100,000 kr/year", educationPath: "Bachelor's in Telecom/CS + customer-facing experience", keySkills: ["solution design", "RFP response", "customer comms", "demos", "commercial awareness"], dailyTasks: ["Run discovery sessions", "Design solutions", "Build proposals", "Demo products", "Support deals"], growthOutlook: "high" },
    { id: "telco-sales-engineer", title: "Sales Engineer", emoji: "📞", description: "Combine technical depth with sales skills to win and grow telecom enterprise accounts.", avgSalary: "750,000 - 1,100,000 kr/year", educationPath: "Bachelor's in Telecom/CS + sales experience", keySkills: ["technical sales", "negotiation", "presentation", "customer rapport", "product knowledge"], dailyTasks: ["Visit customers", "Scope opportunities", "Run technical demos", "Negotiate terms", "Hit targets"], growthOutlook: "high", workSetting: "mixed" },
    { id: "telco-account-manager", title: "Account Manager", emoji: "🧑‍💼", description: "Own the relationship with telecom customers, growing accounts and keeping them happy.", avgSalary: "650,000 - 1,000,000 kr/year", educationPath: "Bachelor's in Business/Telecom + account management experience", keySkills: ["relationship building", "negotiation", "forecasting", "commercial acumen", "communication"], dailyTasks: ["Meet customers", "Forecast revenue", "Resolve issues", "Plan account growth", "Coordinate internal teams"], growthOutlook: "medium" },
    { id: "telco-project-manager", title: "Project Manager", emoji: "📅", description: "Run telecom projects to scope, time, and budget — from network rollouts to OSS/BSS upgrades.", avgSalary: "700,000 - 1,000,000 kr/year", educationPath: "Bachelor's + PRINCE2/PMP", keySkills: ["project planning", "risk management", "stakeholder mgmt", "reporting", "delivery"], dailyTasks: ["Plan and track work", "Run governance", "Manage risks", "Report status", "Coordinate teams"], growthOutlook: "medium" },
    { id: "telco-programme-manager", title: "Programme Manager", emoji: "🗂️", description: "Coordinate multiple related telecom projects into one programme delivering business outcomes.", avgSalary: "850,000 - 1,250,000 kr/year", educationPath: "Bachelor's + MSP/PgMP + 8+ years delivery", keySkills: ["programme governance", "benefits realisation", "leadership", "finance", "executive comms"], dailyTasks: ["Govern programmes", "Manage budgets", "Brief executives", "Resolve cross-project issues", "Track benefits"], growthOutlook: "medium" },
    { id: "telco-pmo-analyst", title: "PMO Analyst", emoji: "🗃️", description: "Support telecom programmes with planning, reporting, governance, and finance tracking.", avgSalary: "550,000 - 800,000 kr/year", educationPath: "Bachelor's + PMO/PRINCE2 awareness", keySkills: ["planning tools", "reporting", "governance", "finance tracking", "attention to detail"], dailyTasks: ["Maintain plans", "Build status reports", "Track budgets", "Run governance forums", "Maintain RAID logs"], growthOutlook: "medium", entryLevel: true },
    { id: "telco-agile-coach", title: "Agile Coach", emoji: "🧭", description: "Coach telecom teams and leaders to adopt agile ways of working at scale.", avgSalary: "850,000 - 1,200,000 kr/year", educationPath: "Bachelor's + SAFe/agile certifications + coaching experience", keySkills: ["SAFe/Scrum", "coaching", "facilitation", "change management", "metrics"], dailyTasks: ["Coach teams", "Run workshops", "Support leaders", "Improve flow", "Measure outcomes"], growthOutlook: "high" },
    { id: "telco-scrum-master", title: "Scrum Master", emoji: "🌀", description: "Facilitate scrum teams delivering telecom software and network automation work.", avgSalary: "650,000 - 900,000 kr/year", educationPath: "Bachelor's + CSM/PSM", keySkills: ["scrum", "facilitation", "servant leadership", "JIRA", "team coaching"], dailyTasks: ["Run ceremonies", "Remove blockers", "Coach team", "Track flow", "Support PO"], growthOutlook: "medium" },
    { id: "telco-customer-support-engineer", title: "Customer Support Engineer", emoji: "🛎️", description: "Provide technical support to telecom customers, diagnosing issues across networks and services.", avgSalary: "500,000 - 750,000 kr/year", educationPath: "Bachelor's/vocational in Telecom/IT", keySkills: ["troubleshooting", "customer comms", "ticketing", "product knowledge", "patience"], dailyTasks: ["Take support tickets", "Diagnose issues", "Coordinate with engineering", "Update customers", "Document fixes"], growthOutlook: "medium", entryLevel: true },
    { id: "telco-tech-support-specialist", title: "Technical Support Specialist", emoji: "🧑‍🔧", description: "Resolve complex technical issues escalated from frontline support, often with deep product knowledge.", avgSalary: "550,000 - 800,000 kr/year", educationPath: "Bachelor's in Telecom/CS + product certifications", keySkills: ["deep product knowledge", "troubleshooting", "scripting", "lab work", "documentation"], dailyTasks: ["Investigate escalations", "Reproduce issues in lab", "Coordinate with R&D", "Build knowledge base", "Support frontline"], growthOutlook: "medium" },
    { id: "telco-customer-success-manager", title: "Customer Success Manager", emoji: "🌟", description: "Help telecom customers get value from their services, drive adoption, and prevent churn.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Bachelor's in Business/Telecom + customer success experience", keySkills: ["customer engagement", "data analysis", "communication", "value selling", "renewals"], dailyTasks: ["Run reviews", "Track usage", "Drive adoption", "Identify expansion", "Prevent churn"], growthOutlook: "high" },
    { id: "telco-call-center-agent", title: "Call Center Agent", emoji: "🎧", description: "Handle inbound calls and chats from telecom customers, resolving billing and service questions.", avgSalary: "350,000 - 480,000 kr/year", educationPath: "High school + on-the-job training", keySkills: ["customer service", "active listening", "patience", "computer literacy", "communication"], dailyTasks: ["Take calls and chats", "Resolve billing queries", "Place orders", "Escalate issues", "Document interactions"], growthOutlook: "stable", entryLevel: true },
    { id: "telco-security-engineer", title: "Security Engineer", emoji: "🛡️", description: "Protect telecom networks and platforms from cyber threats and misuse.", avgSalary: "750,000 - 1,100,000 kr/year", educationPath: "Bachelor's in CS/CyberSec + certifications", keySkills: ["network security", "SIEM", "firewalls", "incident response", "scripting"], dailyTasks: ["Harden systems", "Investigate alerts", "Run threat hunts", "Review designs", "Coordinate response"], growthOutlook: "high" },
    { id: "telco-cybersecurity-analyst", title: "Cybersecurity Analyst", emoji: "🕵️", description: "Monitor security alerts, investigate suspicious activity, and respond to incidents in telecom environments.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Bachelor's in CyberSec/CS + SOC experience", keySkills: ["SOC", "SIEM", "log analysis", "threat intel", "incident response"], dailyTasks: ["Triage alerts", "Investigate incidents", "Tune detections", "Write reports", "Run tabletop exercises"], growthOutlook: "high", entryLevel: true },
    { id: "telco-fraud-analyst", title: "Fraud Analyst", emoji: "🔍", description: "Detect and prevent fraud across telecom services — IRSF, SIM swap, subscription fraud, and more.", avgSalary: "550,000 - 800,000 kr/year", educationPath: "Bachelor's in Finance/CS + fraud tooling experience", keySkills: ["fraud detection", "data analysis", "rules engines", "investigation", "communication"], dailyTasks: ["Monitor fraud rules", "Investigate cases", "Coordinate with security", "Tune detection", "Report losses"], growthOutlook: "medium" },
    { id: "telco-compliance-manager", title: "Compliance Manager", emoji: "⚖️", description: "Ensure telecom operations meet regulatory, legal, and policy obligations.", avgSalary: "750,000 - 1,100,000 kr/year", educationPath: "Bachelor's in Law/Business + compliance experience", keySkills: ["regulation", "policy", "audit", "risk", "stakeholder mgmt"], dailyTasks: ["Track regulation", "Run audits", "Advise teams", "Report to regulators", "Maintain policies"], growthOutlook: "medium" },
    { id: "telco-cto", title: "CTO (Chief Technology Officer)", emoji: "🎯", description: "Set the technology strategy and lead the engineering organisation for a telecom operator or vendor.", avgSalary: "1,500,000 - 3,000,000 kr/year", educationPath: "Master's + 15+ years tech leadership", keySkills: ["tech strategy", "executive leadership", "architecture", "innovation", "stakeholder mgmt"], dailyTasks: ["Set strategy", "Lead engineering org", "Brief board", "Approve investments", "Drive innovation"], growthOutlook: "stable" },
    { id: "telco-network-director", title: "Network Director", emoji: "🏗️", description: "Lead the network organisation responsible for design, build, and run of telecom infrastructure.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Master's in Telecom/EE + 15+ years network leadership", keySkills: ["network strategy", "leadership", "vendor mgmt", "budget", "operations"], dailyTasks: ["Lead network teams", "Set roadmap", "Manage vendors", "Govern budgets", "Brief executives"], growthOutlook: "medium" },
    { id: "telco-operations-director", title: "Operations Director", emoji: "🛠️", description: "Lead the operations organisation keeping telecom services running 24/7.", avgSalary: "1,200,000 - 2,000,000 kr/year", educationPath: "Master's + 15+ years operations leadership", keySkills: ["operations leadership", "ITIL", "SLA mgmt", "people leadership", "transformation"], dailyTasks: ["Lead operations teams", "Govern incidents", "Track SLAs", "Drive improvements", "Brief executives"], growthOutlook: "medium" },
    { id: "telco-strategy-manager", title: "Strategy Manager", emoji: "🧠", description: "Define and drive strategic initiatives for a telecom business — markets, technology, and partnerships.", avgSalary: "900,000 - 1,400,000 kr/year", educationPath: "Master's in Business/Strategy + consulting or strategy experience", keySkills: ["strategy", "market analysis", "financial modelling", "executive comms", "facilitation"], dailyTasks: ["Run strategic projects", "Analyse markets", "Build business cases", "Brief leadership", "Track execution"], growthOutlook: "high" },
  ],

  // ========================================
  // CREATIVE & MEDIA
  // ========================================
  CREATIVE_MEDIA: [
    {
      id: "illustrator",
      title: "Illustrator",
      emoji: "🎨",
      description: "Create original artwork for books, magazines, advertising, packaging, and digital media. Many work freelance for clients across publishing and marketing.",
      avgSalary: "350,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Illustration or self-taught with strong portfolio (3 years)",
      keySkills: ["drawing", "digital tools", "visual storytelling", "concept development", "client communication"],
      dailyTasks: ["Sketch concepts", "Refine artwork", "Meet with clients", "Manage briefs", "Build portfolio"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "content-creator",
      title: "Content Creator",
      emoji: "📱",
      description: "Produce videos, photos and posts for social platforms, building an audience around a niche. Income mixes brand deals, ads and direct support.",
      avgSalary: "200,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "No formal requirement — portfolio and audience are everything",
      keySkills: ["video production", "editing", "audience building", "platform algorithms", "self-promotion"],
      dailyTasks: ["Plan content", "Film and edit", "Engage with audience", "Negotiate brand deals", "Track analytics"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "video-editor",
      title: "Video Editor",
      emoji: "🎬",
      description: "Cut and assemble raw footage into finished videos for film, TV, advertising, YouTube and corporate clients.",
      avgSalary: "450,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Film/Media or vocational training (2-3 years)",
      keySkills: ["Premiere/DaVinci", "storytelling", "pacing", "colour grading", "audio mixing"],
      dailyTasks: ["Review footage", "Cut sequences", "Sync audio", "Apply effects", "Deliver to client"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "animator",
      title: "Animator",
      emoji: "🎞️",
      description: "Bring characters and scenes to life for film, TV, games and advertising — 2D, 3D, or motion graphics.",
      avgSalary: "500,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Animation (3 years) or strong self-taught portfolio",
      keySkills: ["After Effects/Blender", "rigging", "timing", "character design", "visual storytelling"],
      dailyTasks: ["Storyboard scenes", "Animate frames", "Refine motion", "Collaborate with directors", "Render output"],
      growthOutlook: "high",
    },
    {
      id: "journalist",
      title: "Journalist",
      emoji: "📰",
      description: "Research, write and report stories for newspapers, magazines, broadcast and online publications. Norwegian outlets value language skills and ethics.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Journalism (3 years) — e.g. OsloMet, Volda",
      keySkills: ["writing", "interviewing", "research", "ethics", "deadline management"],
      dailyTasks: ["Pitch stories", "Interview sources", "Verify facts", "Write copy", "Meet deadlines"],
      growthOutlook: "stable",
    },
    {
      id: "copywriter",
      title: "Copywriter",
      emoji: "✍️",
      description: "Write the words for adverts, websites, packaging and brand campaigns. Works closely with designers and strategists.",
      avgSalary: "450,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Marketing/Communication or self-taught with portfolio",
      keySkills: ["writing", "brand voice", "concept development", "research", "feedback handling"],
      dailyTasks: ["Read briefs", "Generate concepts", "Write copy variations", "Present ideas", "Refine with team"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "art-director",
      title: "Art Director",
      emoji: "🖼️",
      description: "Lead the visual style of campaigns, magazines, films or games. Direct designers, photographers and illustrators to deliver a unified look.",
      avgSalary: "700,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Design + 5+ years as designer (3 + 5 years)",
      keySkills: ["visual judgement", "team leadership", "concept direction", "client management", "design tools"],
      dailyTasks: ["Set visual direction", "Review work", "Brief designers", "Present to clients", "Approve final assets"],
      growthOutlook: "medium",
    },
    {
      id: "fashion-designer",
      title: "Fashion Designer",
      emoji: "👗",
      description: "Design clothing and accessories — from concept sketches through pattern-making to finished collections.",
      avgSalary: "400,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Fashion Design (3 years)",
      keySkills: ["sketching", "pattern-making", "textile knowledge", "trend research", "garment construction"],
      dailyTasks: ["Sketch designs", "Source fabrics", "Make patterns", "Fit prototypes", "Plan collections"],
      growthOutlook: "stable",
    },
    {
      id: "interior-designer",
      title: "Interior Designer",
      emoji: "🛋️",
      description: "Plan how interior spaces look and function — homes, offices, restaurants, shops. Combines aesthetics with practical considerations.",
      avgSalary: "450,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Interior Architecture (3 years)",
      keySkills: ["spatial design", "material knowledge", "client briefing", "CAD tools", "project coordination"],
      dailyTasks: ["Meet clients", "Develop concepts", "Create drawings", "Source materials", "Coordinate trades"],
      growthOutlook: "medium",
    },
    {
      id: "sound-engineer",
      title: "Sound Engineer",
      emoji: "🎚️",
      description: "Record, mix and produce audio for music, film, podcasts, live events and broadcast. Equal parts technical and creative.",
      avgSalary: "400,000 - 750,000 kr/year",
      educationPath: "Vocational sound engineering programme (2-3 years)",
      keySkills: ["audio software", "microphone technique", "mixing", "acoustics", "ear training"],
      dailyTasks: ["Set up recording", "Capture takes", "Mix tracks", "Master output", "Solve technical issues"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Music — Playing & Performance
    // ──────────────────────────────────────────────
    {
      id: "musician",
      title: "Musician",
      emoji: "🎸",
      description: "Perform live and recorded music as an instrumentalist — solo, in bands, or with ensembles. Income mixes gigs, royalties, and teaching.",
      avgSalary: "200,000 - 700,000 kr/year (highly variable)",
      educationPath: "No formal requirement — talent, practice, and a portfolio of recordings/gigs",
      keySkills: ["instrument mastery", "stage presence", "music theory", "self-promotion", "collaboration"],
      dailyTasks: ["Practise daily", "Rehearse with bands", "Perform live", "Record tracks", "Manage bookings"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "vocalist",
      title: "Vocalist",
      emoji: "🎤",
      description: "Sing professionally — solo, in choirs, or as part of bands and recording projects across genres.",
      avgSalary: "200,000 - 700,000 kr/year (highly variable)",
      educationPath: "Vocal training or conservatory, or self-taught with strong portfolio",
      keySkills: ["vocal technique", "ear training", "stage presence", "languages", "self-promotion"],
      dailyTasks: ["Vocal warm-ups", "Rehearse repertoire", "Perform live", "Record sessions", "Network with collaborators"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "dj",
      title: "DJ",
      emoji: "🎧",
      description: "Mix and play music for clubs, events, weddings, festivals, and radio. Build a personal brand around taste and energy.",
      avgSalary: "250,000 - 900,000 kr/year (highly variable)",
      educationPath: "Self-taught with equipment, mixing software, and a strong demo set",
      keySkills: ["beatmatching", "track selection", "crowd reading", "DJ software", "self-promotion"],
      dailyTasks: ["Build setlists", "Mix tracks", "Perform sets", "Promote bookings", "Manage equipment"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "session-musician",
      title: "Session Musician",
      emoji: "🎹",
      description: "Play instruments on other artists' recordings, jingles, and live tours. Versatility across genres is the key skill.",
      avgSalary: "300,000 - 800,000 kr/year",
      educationPath: "Conservatory training or self-taught with extensive recording credits",
      keySkills: ["sight-reading", "versatility", "studio etiquette", "instrument mastery", "punctuality"],
      dailyTasks: ["Prepare for sessions", "Play takes", "Adapt to producer notes", "Travel to studios", "Maintain instruments"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "orchestra-member",
      title: "Orchestra Member",
      emoji: "🎻",
      description: "Play in a symphony, opera, or chamber ensemble. Salaried work for those who win competitive auditions.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Conservatory degree (Bachelor's/Master's) + audition success",
      keySkills: ["instrument mastery", "ensemble playing", "sight-reading", "discipline", "stamina"],
      dailyTasks: ["Practise solo", "Attend rehearsals", "Perform concerts", "Tour with ensemble", "Maintain instrument"],
      growthOutlook: "stable",
    },
    {
      id: "busker",
      title: "Busker",
      emoji: "🪕",
      description: "Perform music in public spaces — train stations, town squares, festivals — earning from passers-by and online tips.",
      avgSalary: "100,000 - 400,000 kr/year (variable)",
      educationPath: "No formal requirement — instrument skills and resilience",
      keySkills: ["instrument or voice", "stage presence", "resilience", "self-promotion", "weather tolerance"],
      dailyTasks: ["Choose pitches", "Set up gear", "Perform sets", "Engage passers-by", "Build online following"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Music — Learning & Teaching
    // ──────────────────────────────────────────────
    {
      id: "music-teacher",
      title: "Music Teacher",
      emoji: "🎼",
      description: "Teach music in primary or secondary schools — instrument basics, singing, theory, and ensemble work.",
      avgSalary: "470,000 - 620,000 kr/year",
      educationPath: "Bachelor's in Music Education or Conservatory + teaching qualification (4-5 years)",
      keySkills: ["instrument mastery", "classroom management", "music theory", "patience", "lesson planning"],
      dailyTasks: ["Plan lessons", "Lead choirs/ensembles", "Mark assignments", "Run school concerts", "Mentor students"],
      growthOutlook: "stable",
    },
    {
      id: "private-music-tutor",
      title: "Private Music Tutor",
      emoji: "🎶",
      description: "Teach instruments or voice one-to-one in students' homes, your own studio, or online. Set your own schedule and rates.",
      avgSalary: "250,000 - 600,000 kr/year",
      educationPath: "Strong instrument skills + ABRSM or equivalent grades, or conservatory training",
      keySkills: ["instrument mastery", "patience", "communication", "lesson planning", "student management"],
      dailyTasks: ["Run lessons", "Plan progression", "Mark exam pieces", "Manage bookings", "Communicate with parents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "music-lecturer",
      title: "Music Lecturer",
      emoji: "🎓",
      description: "Teach music at conservatories or universities — performance, theory, history, or production. Combines teaching with research.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Master's or PhD in Music + significant performance or research portfolio",
      keySkills: ["deep musical knowledge", "lecturing", "research", "mentoring", "academic writing"],
      dailyTasks: ["Lecture classes", "Mentor students", "Publish research", "Run masterclasses", "Adjudicate exams"],
      growthOutlook: "stable",
    },
    {
      id: "vocal-coach",
      title: "Vocal Coach",
      emoji: "🗣️",
      description: "Train singers in technique, repertoire, and performance — for amateurs, professionals, recording artists, and theatre productions.",
      avgSalary: "300,000 - 700,000 kr/year",
      educationPath: "Conservatory vocal training or extensive performance experience + coaching certification",
      keySkills: ["vocal technique", "ear training", "anatomy of the voice", "communication", "repertoire knowledge"],
      dailyTasks: ["Run vocal sessions", "Diagnose technical issues", "Plan repertoire", "Prepare students for auditions", "Coach for recordings"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "music-therapist",
      title: "Music Therapist",
      emoji: "🎵",
      description: "Use music as therapy for people with developmental, emotional, or medical needs. Works in hospitals, schools, and care settings.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Master's in Music Therapy (5 years) + clinical placements",
      keySkills: ["musical skills", "psychology", "empathy", "clinical observation", "session planning"],
      dailyTasks: ["Run therapy sessions", "Assess client needs", "Document progress", "Collaborate with healthcare team", "Adapt sessions"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Music — Making & Production
    // ──────────────────────────────────────────────
    {
      id: "music-producer",
      title: "Music Producer",
      emoji: "🎚️",
      description: "Shape recorded music — arranging, recording, mixing, and guiding artists from idea to finished track. Many work freelance from home studios.",
      avgSalary: "350,000 - 1,000,000 kr/year (highly variable)",
      educationPath: "Self-taught with strong portfolio, or vocational/bachelor's in music production",
      keySkills: ["DAW software", "arrangement", "mixing", "artist communication", "ear training"],
      dailyTasks: ["Record artists", "Arrange tracks", "Mix and master", "Direct sessions", "Manage projects"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "songwriter",
      title: "Songwriter",
      emoji: "✍️",
      description: "Write songs for yourself or other artists — melodies, lyrics, and structure. Income comes from royalties, advances, and co-writing fees.",
      avgSalary: "150,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "No formal requirement — strong portfolio of songs and industry connections",
      keySkills: ["melody writing", "lyric writing", "music theory", "co-writing", "self-promotion"],
      dailyTasks: ["Write song ideas", "Co-write sessions", "Demo tracks", "Pitch to artists", "Manage publishing rights"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "composer",
      title: "Composer",
      emoji: "📝",
      description: "Write original music for ensembles, choirs, soloists, or commission projects. Spans contemporary classical, choral, and concert work.",
      avgSalary: "300,000 - 800,000 kr/year (variable)",
      educationPath: "Bachelor's/Master's in Composition or extensive self-taught portfolio",
      keySkills: ["music theory", "orchestration", "notation software", "creativity", "deadline management"],
      dailyTasks: ["Sketch ideas", "Notate scores", "Meet with performers", "Attend rehearsals", "Manage commissions"],
      growthOutlook: "stable",
    },
    {
      id: "audio-engineer",
      title: "Audio Engineer",
      emoji: "🎛️",
      description: "Record, mix, and master audio in studios or live settings. Specialise in music, podcasts, film, or game audio.",
      avgSalary: "400,000 - 800,000 kr/year",
      educationPath: "Vocational audio engineering (2-3 years) or self-taught with portfolio",
      keySkills: ["DAW software", "signal flow", "mixing", "mastering", "acoustics"],
      dailyTasks: ["Set up sessions", "Record artists", "Mix tracks", "Master output", "Maintain gear"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "beatmaker",
      title: "Beatmaker",
      emoji: "🥁",
      description: "Produce instrumental beats for hip-hop, R&B, pop, and electronic artists. Sell beats online or work directly with vocalists.",
      avgSalary: "150,000 - 800,000 kr/year (highly variable)",
      educationPath: "Self-taught with DAW skills and a strong sample portfolio",
      keySkills: ["DAW software", "drum programming", "sampling", "music theory", "self-promotion"],
      dailyTasks: ["Create beats", "Upload to marketplaces", "Collaborate with rappers", "Mix tracks", "Build online following"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "film-composer",
      title: "Film Composer",
      emoji: "🎬",
      description: "Write original scores for films, TV shows, and documentaries. Combines composition with deep understanding of visual storytelling.",
      avgSalary: "350,000 - 1,200,000 kr/year (highly variable)",
      educationPath: "Bachelor's/Master's in Film Scoring or extensive portfolio + connections",
      keySkills: ["composition", "orchestration", "DAW software", "sample libraries", "spotting to picture"],
      dailyTasks: ["Watch cuts", "Sketch themes", "Mock up cues", "Conduct sessions", "Deliver final stems"],
      growthOutlook: "stable",
    },
    {
      id: "game-composer",
      title: "Game Composer",
      emoji: "🎮",
      description: "Compose adaptive music for video games — themes, ambient layers, and dynamic systems that respond to player action.",
      avgSalary: "350,000 - 1,000,000 kr/year",
      educationPath: "Composition training + interactive audio middleware skills (Wwise, FMOD)",
      keySkills: ["composition", "interactive audio", "Wwise/FMOD", "DAW software", "collaboration with developers"],
      dailyTasks: ["Compose tracks", "Implement audio", "Iterate with designers", "Master stems", "Test in-engine"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Music — Industry & Supporting Roles
    // ──────────────────────────────────────────────
    {
      id: "music-manager",
      title: "Music Manager",
      emoji: "📋",
      description: "Manage an artist's career — bookings, contracts, branding, finances, and long-term direction. Usually paid a percentage of artist income.",
      avgSalary: "300,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "No formal requirement — industry experience and a strong network",
      keySkills: ["negotiation", "industry knowledge", "communication", "finance basics", "long-term thinking"],
      dailyTasks: ["Negotiate deals", "Plan releases", "Manage finances", "Book tours", "Advise on creative direction"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "talent-agent",
      title: "Talent Agent",
      emoji: "🤝",
      description: "Book live performances and tours for musicians, securing venues, festivals, and promoters. Earn commission on every booking.",
      avgSalary: "350,000 - 1,200,000 kr/year",
      educationPath: "Industry experience starting as an assistant at an agency",
      keySkills: ["negotiation", "venue relationships", "logistics", "communication", "pricing"],
      dailyTasks: ["Negotiate fees", "Book tours", "Coordinate with promoters", "Send contracts", "Track payments"],
      growthOutlook: "stable",
    },
    {
      id: "ar-rep",
      title: "A&R Representative",
      emoji: "👂",
      description: "Scout new musical talent for record labels, develop signed artists, and shepherd projects from demo to release.",
      avgSalary: "400,000 - 1,000,000 kr/year",
      educationPath: "Industry experience + deep knowledge of current music",
      keySkills: ["taste", "networking", "industry knowledge", "artist development", "negotiation"],
      dailyTasks: ["Scout new artists", "Attend gigs", "Sign talent", "Develop projects", "Coordinate releases"],
      growthOutlook: "stable",
    },
    {
      id: "music-promoter",
      title: "Music Promoter",
      emoji: "📣",
      description: "Organise concerts, festivals, and tours — book venues, market shows, and take on the financial risk of putting on the event.",
      avgSalary: "300,000 - 1,000,000 kr/year (highly variable)",
      educationPath: "No formal requirement — entrepreneurial experience and industry contacts",
      keySkills: ["event planning", "marketing", "negotiation", "risk management", "networking"],
      dailyTasks: ["Book artists", "Market shows", "Manage venues", "Run logistics", "Handle ticket sales"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "tour-manager",
      title: "Tour Manager",
      emoji: "🚐",
      description: "Run the day-to-day logistics of a touring music act — travel, hotels, schedules, payments, and keeping everyone moving on time.",
      avgSalary: "400,000 - 900,000 kr/year",
      educationPath: "No formal requirement — experience with live events and strong logistics skills",
      keySkills: ["logistics", "calm under pressure", "budgeting", "people management", "problem-solving"],
      dailyTasks: ["Plan travel", "Manage budgets", "Coordinate venues", "Handle settlements", "Keep schedule on track"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "sound-technician",
      title: "Sound Technician",
      emoji: "🔊",
      description: "Set up and operate live sound at concerts, festivals, and events — mics, monitors, mixing desks, and front-of-house sound.",
      avgSalary: "380,000 - 700,000 kr/year",
      educationPath: "Vocational sound engineering or hands-on experience starting as a stagehand",
      keySkills: ["live mixing", "signal flow", "mic technique", "troubleshooting", "physical stamina"],
      dailyTasks: ["Rig PA systems", "Soundcheck artists", "Mix live shows", "Troubleshoot issues", "Pack down gear"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "music-journalist",
      title: "Music Journalist",
      emoji: "📰",
      description: "Write reviews, interviews, and features about music for magazines, websites, and newspapers. Many freelance across multiple outlets.",
      avgSalary: "250,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Journalism/Communications or self-taught with strong writing portfolio",
      keySkills: ["writing", "interviewing", "music knowledge", "research", "deadline management"],
      dailyTasks: ["Pitch stories", "Conduct interviews", "Attend gigs", "Write reviews", "Edit copy"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "music-content-creator",
      title: "Music Content Creator",
      emoji: "📹",
      description: "Build an audience around music — reactions, tutorials, reviews, gear breakdowns — across YouTube, TikTok, and Instagram.",
      avgSalary: "100,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "No formal requirement — strong music knowledge and content production skills",
      keySkills: ["video production", "editing", "music knowledge", "audience building", "self-promotion"],
      dailyTasks: ["Plan content", "Film and edit", "Engage audience", "Negotiate sponsorships", "Track analytics"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "music-licensing-specialist",
      title: "Music Licensing Specialist",
      emoji: "📄",
      description: "Negotiate the use of music in films, ads, games, and TV. Manage rights, royalties, and clearances on behalf of artists or rights holders.",
      avgSalary: "450,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Music Business, Law, or extensive industry experience",
      keySkills: ["copyright law", "negotiation", "industry knowledge", "contract drafting", "attention to detail"],
      dailyTasks: ["Negotiate licences", "Track rights", "Process royalties", "Liaise with publishers", "Manage contracts"],
      growthOutlook: "stable",
    },
    // ── Online creators & influencers ──
    { id: "youtuber", title: "YouTuber", emoji: "📺", description: "Build and run a YouTube channel — creating, editing, and publishing videos that grow an audience and earn ad / sponsorship income.", avgSalary: "0 - 2,000,000+ kr/year (highly variable)", educationPath: "Self-taught — consistency, video skills, and audience-building matter more than formal credentials", keySkills: ["video production", "storytelling", "editing", "SEO", "consistency"], dailyTasks: ["Plan videos", "Film content", "Edit footage", "Engage viewers", "Analyse stats"], growthOutlook: "high", entryLevel: true },
    { id: "social-media-influencer", title: "Social Media Influencer", emoji: "🤳", description: "Build a personal brand across Instagram, TikTok, YouTube — earning through sponsorships, affiliate links, and brand deals.", avgSalary: "0 - 3,000,000+ kr/year (highly variable)", educationPath: "Self-taught — content quality and authentic audience matter most", keySkills: ["personal branding", "content creation", "negotiation", "consistency", "trend awareness"], dailyTasks: ["Post content", "Engage followers", "Negotiate deals", "Track analytics", "Plan campaigns"], growthOutlook: "high", entryLevel: true },
    { id: "vlogger", title: "Vlogger", emoji: "🎬", description: "Document daily life, travels, or experiences in regular video diaries — building a community of subscribers who tune in.", avgSalary: "0 - 1,500,000+ kr/year (highly variable)", educationPath: "Self-taught — video skills and a consistent point of view matter most", keySkills: ["camera presence", "editing", "storytelling", "scheduling", "self-discipline"], dailyTasks: ["Film daily", "Edit clips", "Write scripts", "Engage community", "Plan series"], growthOutlook: "high", entryLevel: true },
    { id: "gaming-streamer", title: "Gaming Streamer", emoji: "🎮", description: "Stream gameplay live on Twitch, YouTube, or Kick — entertaining viewers through commentary, skill, and personality.", avgSalary: "0 - 2,000,000+ kr/year (highly variable)", educationPath: "Self-taught — game skill, charisma, and audience-building matter most", keySkills: ["game skill", "personality", "tech setup", "engagement", "stamina"], dailyTasks: ["Stream live", "Engage chat", "Edit highlights", "Manage subs", "Network with creators"], growthOutlook: "high", entryLevel: true },
    { id: "educational-content-creator", title: "Educational Content Creator", emoji: "📚", description: "Teach a subject through video, articles, or short clips — explaining concepts in ways that help people learn.", avgSalary: "200,000 - 1,200,000 kr/year (highly variable)", educationPath: "Subject expertise + self-taught video and writing skills", keySkills: ["explanation", "subject expertise", "video production", "writing", "research"], dailyTasks: ["Plan lessons", "Record content", "Edit videos", "Answer questions", "Update curriculum"], growthOutlook: "high", entryLevel: true },
    { id: "tech-reviewer", title: "Tech Reviewer", emoji: "📱", description: "Test and review consumer tech — phones, laptops, gadgets — sharing honest opinions through video or written reviews.", avgSalary: "300,000 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — tech knowledge, video production, and credibility matter most", keySkills: ["product testing", "video production", "writing", "fairness", "tech knowledge"], dailyTasks: ["Test products", "Film reviews", "Edit footage", "Research specs", "Engage audience"], growthOutlook: "medium", entryLevel: true },
    { id: "lifestyle-influencer", title: "Lifestyle Influencer", emoji: "✨", description: "Share daily life, fashion, beauty, and routines through curated posts — earning through brand collaborations.", avgSalary: "0 - 2,000,000+ kr/year (highly variable)", educationPath: "Self-taught — taste, photography, and audience-building matter most", keySkills: ["aesthetic eye", "photography", "personal branding", "negotiation", "consistency"], dailyTasks: ["Plan posts", "Shoot content", "Engage followers", "Negotiate deals", "Attend events"], growthOutlook: "medium", entryLevel: true },
    { id: "travel-vlogger", title: "Travel Vlogger", emoji: "✈️", description: "Document your travels through video and photography — funded by ads, brand deals, and tourism boards.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — content quality, storytelling, and resilience on the road matter most", keySkills: ["filmmaking", "storytelling", "logistics", "languages", "stamina"], dailyTasks: ["Travel and film", "Edit on the move", "Plan trips", "Engage community", "Pitch sponsors"], growthOutlook: "medium", entryLevel: true },
    { id: "fitness-influencer", title: "Fitness Influencer", emoji: "💪", description: "Share workouts, nutrition tips, and transformations — earning through coaching, supplements, and brand partnerships.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Personal training certification + self-taught content skills", keySkills: ["training expertise", "content creation", "personal branding", "consistency", "coaching"], dailyTasks: ["Train and film", "Coach clients", "Plan content", "Engage audience", "Promote products"], growthOutlook: "high", entryLevel: true },
    { id: "food-blogger", title: "Food Blogger", emoji: "🍳", description: "Create recipes, restaurant reviews, and food content — earning through ads, cookbooks, and brand collaborations.", avgSalary: "0 - 1,000,000 kr/year (highly variable)", educationPath: "Self-taught cooking + photography + writing", keySkills: ["cooking", "food photography", "writing", "recipe development", "personal brand"], dailyTasks: ["Cook recipes", "Style and shoot", "Write posts", "Engage readers", "Pitch brands"], growthOutlook: "medium", entryLevel: true },
    { id: "podcast-host", title: "Podcast Host", emoji: "🎙️", description: "Host a podcast — interview guests, lead conversations, and build a loyal audience through audio content.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — voice skills, curiosity, and consistency matter most", keySkills: ["interviewing", "audio production", "research", "personality", "consistency"], dailyTasks: ["Plan episodes", "Interview guests", "Edit audio", "Promote shows", "Pitch sponsors"], growthOutlook: "high", entryLevel: true },
    { id: "tiktok-creator", title: "TikTok Creator", emoji: "🎵", description: "Make short-form vertical videos for TikTok — chasing trends and building an audience that grows fast.", avgSalary: "0 - 2,000,000+ kr/year (highly variable)", educationPath: "Self-taught — quick editing and trend awareness matter most", keySkills: ["short-form video", "trend awareness", "editing", "personality", "speed"], dailyTasks: ["Spot trends", "Film clips", "Edit fast", "Engage comments", "Negotiate deals"], growthOutlook: "high", entryLevel: true },
    { id: "instagram-influencer", title: "Instagram Influencer", emoji: "📸", description: "Build a following on Instagram through photos, reels, and stories — earning through brand partnerships and affiliate sales.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — aesthetics, photography, and engagement matter most", keySkills: ["photography", "personal brand", "engagement", "negotiation", "consistency"], dailyTasks: ["Shoot content", "Post daily", "Engage DMs", "Run campaigns", "Track analytics"], growthOutlook: "medium", entryLevel: true },
    { id: "live-streamer", title: "Live Streamer", emoji: "📡", description: "Stream live content — gaming, talk shows, music, makeup — building a real-time community of viewers and subscribers.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — charisma, tech setup, and stamina matter most", keySkills: ["personality", "tech setup", "engagement", "improvisation", "stamina"], dailyTasks: ["Stream live", "Engage chat", "Manage tech", "Edit highlights", "Grow community"], growthOutlook: "high", entryLevel: true },
    { id: "short-form-video-creator", title: "Short-form Video Creator", emoji: "📲", description: "Specialise in 15–60 second videos for TikTok, Reels, and Shorts — earning through views, brand deals, and creator funds.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — fast editing and trend literacy matter most", keySkills: ["mobile editing", "hooks", "pacing", "trend awareness", "experimentation"], dailyTasks: ["Film clips", "Edit fast", "Test ideas", "Track analytics", "Engage audience"], growthOutlook: "high", entryLevel: true },
    { id: "brand-ambassador", title: "Brand Ambassador", emoji: "🎁", description: "Represent a brand to consumers — at events, online, or through long-term partnerships — promoting products authentically.", avgSalary: "200,000 - 800,000 kr/year (often part-time)", educationPath: "No formal requirement — personal brand and people skills matter most", keySkills: ["communication", "personal brand", "presentation", "reliability", "social skills"], dailyTasks: ["Promote products", "Attend events", "Post content", "Train staff", "Report metrics"], growthOutlook: "medium", entryLevel: true },
    { id: "affiliate-marketer", title: "Affiliate Marketer", emoji: "🔗", description: "Drive sales for other brands through tracked links — building niche websites, channels, or audiences that convert.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — SEO, copywriting, and analytics matter most", keySkills: ["SEO", "copywriting", "analytics", "niche selection", "patience"], dailyTasks: ["Build content", "Run SEO", "Test offers", "Track conversions", "Optimise funnels"], growthOutlook: "medium", entryLevel: true },
    { id: "online-personality", title: "Online Personality", emoji: "🌟", description: "Build a multi-platform brand around your personality — combining streaming, video, podcasts, and brand deals.", avgSalary: "0 - 3,000,000+ kr/year (highly variable)", educationPath: "Self-taught — charisma, work ethic, and audience-building matter most", keySkills: ["personality", "multi-platform content", "consistency", "negotiation", "personal brand"], dailyTasks: ["Create content", "Engage audience", "Negotiate deals", "Manage team", "Plan launches"], growthOutlook: "high", entryLevel: true },
    { id: "digital-creator", title: "Digital Creator", emoji: "💡", description: "Make creative digital content of any kind — videos, posts, art, music — for an online audience and modern platforms.", avgSalary: "0 - 1,500,000 kr/year (highly variable)", educationPath: "Self-taught — creativity, tools, and consistency matter most", keySkills: ["creativity", "digital tools", "personal brand", "consistency", "experimentation"], dailyTasks: ["Make content", "Publish online", "Engage community", "Test ideas", "Track results"], growthOutlook: "high", entryLevel: true },
    // ── Video & film production ──
    { id: "videographer", title: "Videographer", emoji: "📹", description: "Shoot video for clients — events, weddings, corporate, music — handling camera, lighting, and basic editing.", avgSalary: "400,000 - 800,000 kr/year", educationPath: "Self-taught or vocational film/photo school + portfolio", keySkills: ["camera operation", "lighting", "framing", "editing basics", "client management"], dailyTasks: ["Set up shoots", "Operate cameras", "Direct subjects", "Edit footage", "Deliver files"], growthOutlook: "medium", entryLevel: true },
    { id: "cinematographer", title: "Cinematographer", emoji: "🎥", description: "Lead the visual look of a film or show — deciding cameras, lenses, lighting, and movement to bring a script to life.", avgSalary: "550,000 - 1,200,000 kr/year (highly variable)", educationPath: "Film school (3 years) + portfolio + crew progression", keySkills: ["lighting design", "camera mastery", "composition", "leadership", "collaboration"], dailyTasks: ["Plan shots", "Direct camera crew", "Light scenes", "Operate camera", "Review dailies"], growthOutlook: "medium" },
    { id: "film-director", title: "Film Director", emoji: "🎬", description: "Lead the creative vision of a film or TV show — guiding actors, crew, and storytelling from script to final cut.", avgSalary: "400,000 - 2,000,000+ kr/year (highly variable)", educationPath: "Film school + portfolio + years of crew experience", keySkills: ["storytelling", "leadership", "visual thinking", "decision-making", "actor direction"], dailyTasks: ["Direct actors", "Approve shots", "Plan scenes", "Lead crew", "Review edits"], growthOutlook: "medium" },
    { id: "camera-operator", title: "Camera Operator", emoji: "📷", description: "Operate the camera on set — following the director and DP's plan, holding precise framing and movement.", avgSalary: "450,000 - 800,000 kr/year", educationPath: "Film school or assistant camera progression + on-set training", keySkills: ["camera tech", "framing", "stamina", "responsiveness", "teamwork"], dailyTasks: ["Set up cameras", "Frame shots", "Hold focus", "Follow action", "Maintain gear"], growthOutlook: "medium" },
    { id: "drone-videographer", title: "Drone Videographer", emoji: "🚁", description: "Shoot aerial video and photography with drones — for real estate, events, weddings, and commercials.", avgSalary: "400,000 - 800,000 kr/year", educationPath: "Drone pilot certification (RO1/RO2 in Norway) + camera skills", keySkills: ["drone piloting", "aerial composition", "regulations", "camera tech", "editing"], dailyTasks: ["Plan flights", "Pilot drones", "Capture footage", "Edit clips", "Manage permits"], growthOutlook: "high", entryLevel: true },
    { id: "wedding-videographer", title: "Wedding Videographer", emoji: "💍", description: "Capture wedding days on video — telling each couple's story through cinematic highlight films and full edits.", avgSalary: "350,000 - 800,000 kr/year", educationPath: "Self-taught or vocational + strong portfolio", keySkills: ["storytelling", "candid camera work", "audio capture", "editing", "client care"], dailyTasks: ["Meet couples", "Plan shot lists", "Film weddings", "Edit highlight reels", "Deliver films"], growthOutlook: "medium", entryLevel: true },
    { id: "documentary-filmmaker", title: "Documentary Filmmaker", emoji: "🎞️", description: "Tell true stories through film — researching, shooting, and editing documentaries for streaming, TV, or festivals.", avgSalary: "350,000 - 900,000 kr/year (highly variable)", educationPath: "Film school + documentary specialism + grant-writing experience", keySkills: ["research", "interviewing", "story structure", "editing", "fundraising"], dailyTasks: ["Research subjects", "Conduct interviews", "Film scenes", "Edit cuts", "Pitch funders"], growthOutlook: "medium" },
    { id: "commercial-video-producer", title: "Commercial Video Producer", emoji: "📺", description: "Produce ads and branded video content for businesses — managing crew, budget, and schedule from brief to delivery.", avgSalary: "550,000 - 1,000,000 kr/year", educationPath: "Bachelor's in Film/Media or production experience", keySkills: ["production management", "budgeting", "client comms", "creative briefing", "scheduling"], dailyTasks: ["Take briefs", "Hire crew", "Manage budgets", "Run shoots", "Oversee post"], growthOutlook: "medium" },
    { id: "youtube-video-editor", title: "YouTube Video Editor", emoji: "✂️", description: "Edit videos for YouTube creators — pacing, b-roll, captions, and graphics that keep viewers watching.", avgSalary: "350,000 - 800,000 kr/year", educationPath: "Self-taught or vocational editing course + portfolio", keySkills: ["video editing", "pacing", "motion graphics", "sound design", "creator collaboration"], dailyTasks: ["Cut footage", "Add b-roll", "Sound design", "Caption", "Iterate with creator"], growthOutlook: "high", entryLevel: true },
    { id: "post-production-specialist", title: "Post-Production Specialist", emoji: "🎛️", description: "Handle every step of finishing a film or video project — editing, sound, colour, VFX — to broadcast standard.", avgSalary: "500,000 - 1,000,000 kr/year", educationPath: "Film school or vocational post-production training", keySkills: ["editing", "colour grading", "sound", "VFX basics", "delivery specs"], dailyTasks: ["Cut sequences", "Grade colour", "Mix audio", "Add VFX", "Master deliverables"], growthOutlook: "medium" },
    { id: "color-grading-specialist", title: "Color Grading Specialist", emoji: "🎨", description: "Shape the look and feel of finished film through colour — matching shots, setting mood, and creating signature styles.", avgSalary: "550,000 - 1,100,000 kr/year", educationPath: "Specialist colour course (DaVinci Resolve, Baselight) + portfolio", keySkills: ["colour theory", "DaVinci Resolve", "monitoring", "client comms", "precision"], dailyTasks: ["Grade shots", "Match cameras", "Build looks", "Deliver masters", "Brief clients"], growthOutlook: "medium" },
    { id: "lighting-technician", title: "Lighting Technician", emoji: "💡", description: "Set up and operate lighting for film, TV, and events — under the gaffer's direction or as a head of department.", avgSalary: "400,000 - 750,000 kr/year", educationPath: "Vocational film school or apprenticeship on-set", keySkills: ["electrics", "lighting kit", "rigging", "safety", "stamina"], dailyTasks: ["Rig lights", "Run cables", "Adjust intensity", "Strike sets", "Maintain gear"], growthOutlook: "medium", entryLevel: true },
    { id: "sound-editor", title: "Sound Editor", emoji: "🔊", description: "Edit dialogue, sound effects, and ambience for film and TV — building the soundscape that supports the picture.", avgSalary: "450,000 - 900,000 kr/year", educationPath: "Bachelor's in Sound/Audio Engineering or vocational training", keySkills: ["DAW skills", "sound design", "dialogue editing", "Foley", "attention to detail"], dailyTasks: ["Cut dialogue", "Build sound design", "Record Foley", "Sync tracks", "Prep mixes"], growthOutlook: "medium" },
    { id: "motion-graphics-designer", title: "Motion Graphics Designer", emoji: "🌀", description: "Create animated graphics and visual effects for video — titles, lower thirds, explainers, and brand idents.", avgSalary: "500,000 - 950,000 kr/year", educationPath: "Bachelor's in Design / Animation or self-taught + strong portfolio", keySkills: ["After Effects", "Cinema 4D", "design fundamentals", "animation", "typography"], dailyTasks: ["Animate graphics", "Build templates", "Render shots", "Iterate with directors", "Deliver assets"], growthOutlook: "high" },
    { id: "video-content-producer", title: "Video Content Producer", emoji: "🎙️", description: "Produce video content end-to-end for social, web, or campaigns — concept, shoot, edit, and publish.", avgSalary: "450,000 - 850,000 kr/year", educationPath: "Bachelor's in Media or self-taught + portfolio", keySkills: ["concepting", "shooting", "editing", "distribution", "analytics"], dailyTasks: ["Pitch ideas", "Shoot footage", "Edit videos", "Publish content", "Track performance"], growthOutlook: "high", entryLevel: true },
    { id: "corporate-videographer", title: "Corporate Videographer", emoji: "🏢", description: "Make video content for businesses — internal comms, training, recruitment, product, and event coverage.", avgSalary: "450,000 - 800,000 kr/year", educationPath: "Self-taught or vocational + corporate portfolio", keySkills: ["client comms", "interviewing", "lighting", "editing", "delivery"], dailyTasks: ["Brief clients", "Film shoots", "Conduct interviews", "Edit videos", "Deliver projects"], growthOutlook: "medium", entryLevel: true },
    // ── Photography ──
    { id: "freelance-photographer", title: "Freelance Photographer", emoji: "📷", description: "Run your own photography business — shooting clients across portraits, events, products, and editorial.", avgSalary: "300,000 - 800,000 kr/year (highly variable)", educationPath: "Self-taught or photo school + strong portfolio", keySkills: ["camera mastery", "lighting", "client management", "editing", "self-promotion"], dailyTasks: ["Book shoots", "Shoot clients", "Edit photos", "Invoice clients", "Market services"], growthOutlook: "stable", entryLevel: true },
    { id: "event-photographer", title: "Event Photographer", emoji: "🎉", description: "Cover live events — conferences, parties, sports, festivals — capturing the atmosphere and key moments.", avgSalary: "350,000 - 700,000 kr/year", educationPath: "Self-taught or photo school + portfolio + fast turnaround", keySkills: ["fast shooting", "low-light technique", "editing speed", "people skills", "reliability"], dailyTasks: ["Cover events", "Capture key shots", "Edit on the day", "Deliver galleries", "Promote work"], growthOutlook: "stable", entryLevel: true },
    { id: "wildlife-photographer", title: "Wildlife Photographer", emoji: "🦌", description: "Photograph animals in nature — for editorial, conservation, or fine art — often spending days waiting for the right shot.", avgSalary: "200,000 - 700,000 kr/year (highly variable)", educationPath: "Self-taught + biology knowledge + serious patience", keySkills: ["fieldcraft", "patience", "long-lens technique", "biology knowledge", "stamina"], dailyTasks: ["Plan trips", "Track wildlife", "Set up hides", "Shoot patiently", "Edit and pitch"], growthOutlook: "stable" },
    { id: "photojournalist", title: "Photojournalist", emoji: "📰", description: "Tell news stories through photographs — covering politics, conflict, sport, and daily life for newspapers and agencies.", avgSalary: "350,000 - 800,000 kr/year (highly variable)", educationPath: "Bachelor's in Journalism / Photojournalism + portfolio", keySkills: ["news instincts", "fast shooting", "ethics", "storytelling", "languages"], dailyTasks: ["Chase stories", "Shoot fast", "Caption and file", "Edit selects", "Build sources"], growthOutlook: "stable" },
    { id: "studio-photographer", title: "Studio Photographer", emoji: "💡", description: "Shoot in a controlled studio environment — portraits, products, fashion, or commercial work — with full lighting control.", avgSalary: "400,000 - 800,000 kr/year", educationPath: "Photo school or vocational + strong studio portfolio", keySkills: ["studio lighting", "direction", "set-building", "retouching", "client comms"], dailyTasks: ["Set up lights", "Direct subjects", "Shoot precisely", "Retouch images", "Manage clients"], growthOutlook: "stable" },
  ],

  // ========================================
  // PUBLIC SERVICE & SAFETY
  // ========================================
  PUBLIC_SERVICE_SAFETY: [
    {
      id: "social-worker",
      title: "Social Worker",
      emoji: "🤝",
      description: "Support individuals and families through difficult times — child protection, mental health, addiction, housing. Norway's NAV employs many.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Social Work (3 years)",
      keySkills: ["empathy", "active listening", "case management", "boundaries", "crisis response"],
      dailyTasks: ["Meet clients", "Assess needs", "Coordinate services", "Write reports", "Liaise with agencies"],
      growthOutlook: "high",
    },
    {
      id: "emergency-dispatcher",
      title: "Emergency Dispatcher",
      emoji: "🚨",
      description: "Answer 110/112/113 calls, assess emergencies, dispatch responders and guide callers through critical first minutes.",
      avgSalary: "480,000 - 650,000 kr/year",
      educationPath: "On-the-job training + ongoing certification",
      keySkills: ["calm under pressure", "active listening", "decision-making", "multi-tasking", "geography"],
      dailyTasks: ["Take emergency calls", "Triage situations", "Dispatch units", "Stay on line with callers", "Log incidents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "customs-officer",
      title: "Customs Officer",
      emoji: "🛂",
      description: "Inspect goods and travellers at borders, ports and airports for the Norwegian Customs (Tolletaten). Enforce import/export regulations.",
      avgSalary: "470,000 - 650,000 kr/year",
      educationPath: "Tolletaten basic training programme (1 year) + on-the-job",
      keySkills: ["observation", "regulation knowledge", "communication", "documentation", "physical fitness"],
      dailyTasks: ["Inspect cargo", "Question travellers", "Check documents", "Process declarations", "Liaise with police"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "probation-officer",
      title: "Probation Officer",
      emoji: "⚖️",
      description: "Supervise people serving non-custodial sentences in the community. Help with rehabilitation, reporting and risk assessment.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Criminology, Social Work or Law (3 years)",
      keySkills: ["report writing", "boundary setting", "interviewing", "risk assessment", "patience"],
      dailyTasks: ["Meet with probationers", "Write progress reports", "Coordinate with courts", "Plan rehabilitation", "Attend hearings"],
      growthOutlook: "stable",
    },
    {
      id: "youth-worker",
      title: "Youth Worker",
      emoji: "🧑‍🤝‍🧑",
      description: "Support teenagers in clubs, schools, outreach and crisis settings. Help young people navigate education, friendships, mental health and risk.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Youth Work, Social Pedagogy or Childcare (3 years)",
      keySkills: ["empathy", "boundaries", "group work", "active listening", "safeguarding"],
      dailyTasks: ["Run sessions", "Mentor 1:1", "Coordinate activities", "Liaise with families", "Document interactions"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "civil-servant",
      title: "Civil Servant",
      emoji: "🏛️",
      description: "Work inside government ministries and agencies — policy, administration, programme delivery. Wide variety of paths after graduate entry.",
      avgSalary: "550,000 - 950,000 kr/year",
      educationPath: "Bachelor's/Master's in Public Administration, Political Science or related (3-5 years)",
      keySkills: ["analytical thinking", "writing", "policy knowledge", "stakeholder management", "discretion"],
      dailyTasks: ["Research policy", "Draft documents", "Brief ministers", "Coordinate with agencies", "Implement programmes"],
      growthOutlook: "stable",
    },
    {
      id: "immigration-officer",
      title: "Immigration Officer",
      emoji: "🛬",
      description: "Process residency, asylum and citizenship applications for the Norwegian Directorate of Immigration (UDI). Conduct interviews and assess cases.",
      avgSalary: "490,000 - 670,000 kr/year",
      educationPath: "Bachelor's in Law, Political Science or Social Sciences (3 years)",
      keySkills: ["interviewing", "case analysis", "regulation knowledge", "objectivity", "languages helpful"],
      dailyTasks: ["Review applications", "Conduct interviews", "Verify documents", "Write decisions", "Liaise with police"],
      growthOutlook: "medium",
    },
    {
      id: "coast-guard-officer",
      title: "Coast Guard Officer",
      emoji: "🚢",
      description: "Patrol Norway's coastline and waters with the Kystvakten — fisheries inspection, search and rescue, environmental protection and border control.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Sjøkrigsskolen (Naval Academy) — 3 years",
      keySkills: ["seamanship", "leadership", "navigation", "physical fitness", "decision-making"],
      dailyTasks: ["Patrol waters", "Inspect fishing vessels", "Conduct rescues", "Monitor pollution", "Report incidents"],
      growthOutlook: "stable",
      pathType: "military",
    },
    {
      id: "corrections-officer",
      title: "Corrections Officer",
      emoji: "🔐",
      description: "Work in Norwegian prisons supervising inmates, supporting rehabilitation and maintaining security. Norway's model emphasises humane treatment.",
      avgSalary: "470,000 - 640,000 kr/year",
      educationPath: "KRUS (Correctional Service Academy) — 2 years",
      keySkills: ["de-escalation", "boundaries", "observation", "communication", "physical fitness"],
      dailyTasks: ["Supervise inmates", "Conduct checks", "Support programmes", "Document incidents", "Coordinate with services"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Social Services — child & family
    // ──────────────────────────────────────────────
    {
      id: "child-protection-officer",
      title: "Child Protection Officer",
      emoji: "🛡️",
      description: "Investigate concerns about children's welfare, work with families to keep children safe, and coordinate with police, schools, and care services.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Social Work or Child Welfare (3 years) — barnevernspedagog",
      keySkills: ["assessment", "interviewing children", "report writing", "emotional resilience", "multi-agency working"],
      dailyTasks: ["Investigate referrals", "Visit families", "Write case reports", "Attend court hearings", "Coordinate care plans"],
      growthOutlook: "high",
    },
    {
      id: "family-support-worker",
      title: "Family Support Worker",
      emoji: "👨‍👩‍👧",
      description: "Work alongside struggling families in their homes — practical help, parenting guidance, and connecting them to other services.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Vocational social care training or Bachelor's in Social Work",
      keySkills: ["empathy", "boundary setting", "communication", "practical problem-solving", "patience"],
      dailyTasks: ["Visit family homes", "Support parenting", "Coordinate with schools", "Write progress notes", "Attend case meetings"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "early-childhood-educator",
      title: "Early Childhood Educator",
      emoji: "🧸",
      description: "Plan and lead learning activities for children under six in nurseries and kindergartens. Combines care, education, and developmental support.",
      avgSalary: "470,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Early Childhood Education (3 years) — barnehagelærer",
      keySkills: ["child development", "play-based learning", "patience", "communication with parents", "creativity"],
      dailyTasks: ["Plan activities", "Lead small groups", "Observe development", "Communicate with parents", "Collaborate with team"],
      growthOutlook: "high",
    },
    {
      id: "case-worker",
      title: "Case Worker",
      emoji: "📋",
      description: "Manage individual client cases across NAV, social services, or charities — assess needs, coordinate support, and track outcomes.",
      avgSalary: "450,000 - 620,000 kr/year",
      educationPath: "Bachelor's in Social Work, Sociology, or related field",
      keySkills: ["case management", "interviewing", "report writing", "boundary setting", "empathy"],
      dailyTasks: ["Meet clients", "Assess needs", "Coordinate services", "Write case notes", "Track progress"],
      growthOutlook: "stable",
    },
    {
      id: "foster-care-coordinator",
      title: "Foster Care Coordinator",
      emoji: "🏠",
      description: "Recruit, train, and support foster families. Match children to placements and stay involved throughout the placement.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Social Work or Child Welfare + experience in child protection",
      keySkills: ["assessment", "matching", "support work", "report writing", "emotional resilience"],
      dailyTasks: ["Assess foster carers", "Match placements", "Support families", "Run training", "Monitor wellbeing"],
      growthOutlook: "stable",
    },
    {
      id: "adoption-specialist",
      title: "Adoption Specialist",
      emoji: "💞",
      description: "Guide adoptive parents and birth families through the legal and emotional process of adoption. Work with public agencies or specialist services.",
      avgSalary: "520,000 - 700,000 kr/year",
      educationPath: "Bachelor's/Master's in Social Work + adoption-specific training",
      keySkills: ["assessment", "counselling", "legal knowledge", "empathy", "report writing"],
      dailyTasks: ["Assess applicants", "Counsel families", "Manage paperwork", "Write home studies", "Support post-placement"],
      growthOutlook: "stable",
    },

    // ──────────────────────────────────────────────
    // Social Services — care & support
    // ──────────────────────────────────────────────
    {
      id: "caregiver",
      title: "Caregiver",
      emoji: "🤲",
      description: "Provide daily care and companionship for elderly, ill, or disabled people in their homes. One-to-one work that makes a direct difference.",
      avgSalary: "380,000 - 500,000 kr/year",
      educationPath: "Vocational training or on-the-job training, sometimes fagbrev as Helsefagarbeider",
      keySkills: ["empathy", "patience", "physical stamina", "personal care skills", "reliability"],
      dailyTasks: ["Help with daily tasks", "Administer medication", "Provide companionship", "Document care", "Coordinate with family"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "support-worker",
      title: "Support Worker",
      emoji: "💪",
      description: "Help people with disabilities, mental health needs, or learning difficulties live independently — at home, in the community, or in supported housing.",
      avgSalary: "400,000 - 540,000 kr/year",
      educationPath: "Vocational care training or fagbrev as Helsefagarbeider",
      keySkills: ["empathy", "patience", "communication", "boundary setting", "physical stamina"],
      dailyTasks: ["Support daily activities", "Encourage independence", "Document progress", "Coordinate with families", "Manage incidents"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "residential-care-worker",
      title: "Residential Care Worker",
      emoji: "🏡",
      description: "Live and work alongside young people or adults in residential homes — providing care, structure, and a stable environment.",
      avgSalary: "450,000 - 600,000 kr/year",
      educationPath: "Vocational care training or Bachelor's in Social Work / Child Welfare",
      keySkills: ["boundary setting", "patience", "de-escalation", "teamwork", "emotional resilience"],
      dailyTasks: ["Support residents", "Manage routines", "Handle incidents", "Document shift notes", "Cook and clean alongside residents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "disability-support-worker",
      title: "Disability Support Worker",
      emoji: "♿",
      description: "Work with people with physical, intellectual, or developmental disabilities — at home, in day centres, or in supported employment.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational care training (Helsefagarbeider) or relevant short courses",
      keySkills: ["empathy", "patience", "physical stamina", "communication", "advocacy"],
      dailyTasks: ["Support daily living", "Help access community", "Document care", "Encourage independence", "Liaise with families"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "special-needs-assistant",
      title: "Special Needs Assistant",
      emoji: "🎒",
      description: "Support children with additional needs in mainstream schools — work alongside teachers to help one or several students access learning.",
      avgSalary: "380,000 - 520,000 kr/year",
      educationPath: "Vocational care or education training, often on-the-job",
      keySkills: ["patience", "adaptability", "communication with children", "teamwork", "behaviour management"],
      dailyTasks: ["Support students in class", "Adapt materials", "Manage behaviour", "Document progress", "Liaise with teachers"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "rehabilitation-worker",
      title: "Rehabilitation Worker",
      emoji: "🦾",
      description: "Help people recover from illness, injury, or addiction — support physical, social, and vocational rehabilitation back into daily life.",
      avgSalary: "450,000 - 620,000 kr/year",
      educationPath: "Vocational care training or Bachelor's in Social Work / Occupational Therapy",
      keySkills: ["motivation", "goal setting", "empathy", "documentation", "multi-disciplinary working"],
      dailyTasks: ["Support recovery plans", "Run group sessions", "Liaise with therapists", "Document progress", "Coach independence"],
      growthOutlook: "high",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Social Services — counselling & mental health
    // ──────────────────────────────────────────────
    {
      id: "counsellor",
      title: "Counsellor",
      emoji: "🗨️",
      description: "Provide talking therapy to clients dealing with difficulties — relationships, grief, anxiety, life transitions. Many work privately or for charities.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's/Master's + accredited counselling training",
      keySkills: ["active listening", "empathy", "boundary setting", "self-awareness", "ethics"],
      dailyTasks: ["Run counselling sessions", "Document notes", "Plan interventions", "Manage referrals", "Reflect on practice"],
      growthOutlook: "high",
    },
    {
      id: "mental-health-support-worker",
      title: "Mental Health Support Worker",
      emoji: "🧠",
      description: "Support people living with mental illness in the community, in supported housing, or in inpatient settings — helping them manage daily life.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Vocational care training or relevant short courses",
      keySkills: ["empathy", "de-escalation", "boundary setting", "observation", "patience"],
      dailyTasks: ["Support daily activities", "Build trust", "Document mental state", "Coordinate with clinicians", "Manage crises"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "substance-abuse-counsellor",
      title: "Substance Abuse Counsellor",
      emoji: "🌱",
      description: "Help people overcome addiction to alcohol, drugs, or other substances. Work in clinics, residential rehab, or community outreach.",
      avgSalary: "470,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Social Work or Psychology + addiction-specific training",
      keySkills: ["motivational interviewing", "non-judgemental listening", "boundary setting", "harm reduction", "relapse prevention"],
      dailyTasks: ["Counsel individuals", "Run group sessions", "Plan recovery goals", "Document progress", "Coordinate referrals"],
      growthOutlook: "high",
    },
    {
      id: "school-counsellor",
      title: "School Counsellor",
      emoji: "📚",
      description: "Support students in primary or secondary schools — academic guidance, emotional wellbeing, and helping with bullying, family issues, and transitions.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's/Master's in Education, Psychology, or Counselling — rådgiver",
      keySkills: ["active listening", "communication with young people", "advocacy", "knowledge of education system", "boundary setting"],
      dailyTasks: ["Counsel students", "Run group workshops", "Liaise with parents", "Coordinate with teachers", "Refer to specialists"],
      growthOutlook: "stable",
    },

    // ──────────────────────────────────────────────
    // Social Services — safeguarding & advocacy
    // ──────────────────────────────────────────────
    {
      id: "safeguarding-officer",
      title: "Safeguarding Officer",
      emoji: "🛟",
      description: "Protect children and vulnerable adults across organisations — schools, care homes, sports clubs. Investigate concerns and train staff.",
      avgSalary: "500,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Social Work or related + safeguarding qualification",
      keySkills: ["risk assessment", "investigation", "policy knowledge", "training delivery", "documentation"],
      dailyTasks: ["Investigate concerns", "Run staff training", "Audit safeguarding", "Liaise with authorities", "Maintain records"],
      growthOutlook: "high",
    },
    {
      id: "domestic-violence-advocate",
      title: "Domestic Violence Advocate",
      emoji: "🤝",
      description: "Support survivors of domestic abuse — safety planning, legal navigation, court accompaniment, and connecting them to housing and counselling.",
      avgSalary: "430,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Social Work or related + specialist training",
      keySkills: ["trauma-informed practice", "empathy", "legal knowledge", "advocacy", "boundary setting"],
      dailyTasks: ["Support survivors", "Plan safety", "Accompany to court", "Coordinate housing", "Document cases"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "crisis-intervention-specialist",
      title: "Crisis Intervention Specialist",
      emoji: "🆘",
      description: "Respond to acute mental health, suicide, or domestic violence crises. Work on phone lines, emergency teams, or in psychiatric services.",
      avgSalary: "470,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Social Work or Psychology + crisis intervention training",
      keySkills: ["calm under pressure", "active listening", "risk assessment", "de-escalation", "multi-agency working"],
      dailyTasks: ["Respond to calls", "Assess risk", "Coordinate emergency response", "Refer to services", "Document interventions"],
      growthOutlook: "high",
    },
    {
      id: "probation-officer",
      title: "Probation Officer",
      emoji: "⚖️",
      description: "Supervise people serving community sentences or on parole. Support rehabilitation, monitor compliance, and write reports for the courts.",
      avgSalary: "490,000 - 660,000 kr/year",
      educationPath: "Bachelor's in Social Work, Criminology, or related field",
      keySkills: ["risk assessment", "boundary setting", "report writing", "motivational interviewing", "knowledge of legal system"],
      dailyTasks: ["Meet clients", "Monitor compliance", "Write court reports", "Coordinate with police", "Support rehabilitation plans"],
      growthOutlook: "stable",
    },

    // ──────────────────────────────────────────────
    // Social Services — housing, community & public health
    // ──────────────────────────────────────────────
    {
      id: "housing-support-officer",
      title: "Housing Support Officer",
      emoji: "🏘️",
      description: "Help people find and keep housing — work with local authorities, charities, or housing associations. Often supports those at risk of homelessness.",
      avgSalary: "440,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Social Work, Housing, or related — or extensive frontline experience",
      keySkills: ["advocacy", "negotiation", "knowledge of benefits system", "case management", "tenant relations"],
      dailyTasks: ["Assess housing needs", "Liaise with landlords", "Help with applications", "Mediate disputes", "Document cases"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "homelessness-support-worker",
      title: "Homelessness Support Worker",
      emoji: "🌃",
      description: "Work directly with people experiencing homelessness — outreach on the streets, day centres, or hostels. Help connect them to services and stable housing.",
      avgSalary: "400,000 - 560,000 kr/year",
      educationPath: "Vocational care training or relevant frontline experience",
      keySkills: ["empathy", "non-judgemental listening", "resilience", "harm reduction", "knowledge of services"],
      dailyTasks: ["Outreach work", "Build trust", "Connect to services", "Support recovery", "Document interactions"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "refuge-worker",
      title: "Refuge Worker",
      emoji: "⛑️",
      description: "Work in shelters supporting women, children, or refugees fleeing violence or crisis. Provide a safe environment and practical support.",
      avgSalary: "410,000 - 570,000 kr/year",
      educationPath: "Vocational care training or Bachelor's in Social Work",
      keySkills: ["trauma-informed practice", "empathy", "boundary setting", "languages helpful", "crisis support"],
      dailyTasks: ["Support residents", "Run shelter routines", "Connect to services", "Document care", "Build trust"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "community-outreach-worker",
      title: "Community Outreach Worker",
      emoji: "📣",
      description: "Build relationships with marginalised communities and bring services to where people are — youth groups, religious centres, public spaces.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Social Work / Community Development or extensive frontline experience",
      keySkills: ["relationship building", "cultural awareness", "languages helpful", "communication", "patience"],
      dailyTasks: ["Build community relationships", "Organise events", "Connect people to services", "Document outreach", "Run information sessions"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "community-development-worker",
      title: "Community Development Worker",
      emoji: "🌍",
      description: "Help communities identify and tackle their own challenges — organising residents, supporting local groups, and bridging with public services.",
      avgSalary: "450,000 - 620,000 kr/year",
      educationPath: "Bachelor's in Community Development, Social Work, or related",
      keySkills: ["facilitation", "organising", "advocacy", "research", "communication"],
      dailyTasks: ["Run community meetings", "Support local groups", "Apply for funding", "Liaise with authorities", "Document outcomes"],
      growthOutlook: "stable",
    },
    {
      id: "public-health-social-worker",
      title: "Public Health Social Worker",
      emoji: "🏥",
      description: "Work at the intersection of social work and public health — preventing disease, promoting wellbeing, and reducing health inequalities in communities.",
      avgSalary: "510,000 - 720,000 kr/year",
      educationPath: "Bachelor's/Master's in Social Work + Public Health training",
      keySkills: ["health literacy", "advocacy", "research", "community engagement", "policy understanding"],
      dailyTasks: ["Run health programmes", "Coordinate with clinicians", "Educate communities", "Track outcomes", "Write reports"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Social Services — leadership
    // ──────────────────────────────────────────────
    {
      id: "social-services-manager",
      title: "Social Services Manager",
      emoji: "🗂️",
      description: "Lead a team of social workers and support staff. Set service direction, manage budgets, and ensure quality and compliance across cases.",
      avgSalary: "650,000 - 950,000 kr/year",
      educationPath: "Bachelor's/Master's in Social Work + 5+ years frontline experience + management training",
      keySkills: ["team leadership", "budgeting", "policy knowledge", "case oversight", "stakeholder management"],
      dailyTasks: ["Supervise staff", "Review cases", "Manage budget", "Liaise with stakeholders", "Drive service improvements"],
      growthOutlook: "stable",
    },
    // ── Security & investigation ──
    { id: "security-guard", title: "Security Guard", emoji: "🛡️", description: "Protect people, property, and assets — patrolling, monitoring CCTV, and responding to incidents.", avgSalary: "380,000 - 500,000 kr/year", educationPath: "Vekterskolen (security guard certification, ~150 hours)", keySkills: ["observation", "calm under pressure", "communication", "physical fitness", "reliability"], dailyTasks: ["Patrol premises", "Monitor CCTV", "Check IDs", "Respond to alarms", "Write reports"], growthOutlook: "stable", entryLevel: true },
    { id: "detective", title: "Detective", emoji: "🕵️", description: "Investigate serious crimes — interviewing witnesses, gathering evidence, and building cases for prosecution.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Police College (3 years) + investigative experience + specialist training", keySkills: ["analytical thinking", "interviewing", "patience", "report writing", "law knowledge"], dailyTasks: ["Interview witnesses", "Gather evidence", "Build cases", "Brief prosecutors", "Lead operations"], growthOutlook: "medium" },
  ],

  // ========================================
  // MILITARY & DEFENCE
  // ========================================
  // Norway's armed forces (Forsvaret) are a major employer of young
  // people. Conscription means almost every Norwegian youth interacts
  // with the military at some point, and the entry pipeline
  // (Førstegangstjeneste → Krigsskolen / Sjøkrigsskolen / Luftkrigsskolen)
  // is structurally distinct from civilian public service. Treating it
  // as its own category lets the radar surface it cleanly for users
  // who want this path.
  MILITARY_DEFENCE: [
    {
      id: "military-officer",
      title: "Military Officer",
      emoji: "🪖",
      description: "Lead Norwegian Armed Forces personnel across army, navy, air force, cyber and home guard. Begins with officer school after national service.",
      avgSalary: "550,000 - 950,000 kr/year",
      educationPath: "Krigsskolen (Norwegian Military Academy) — 3 years",
      keySkills: ["leadership", "physical fitness", "decision-making", "discipline", "teamwork"],
      dailyTasks: ["Lead unit", "Plan operations", "Train personnel", "Maintain readiness", "Report up the chain"],
      growthOutlook: "stable",
      pathType: "military",
    },
    { id: "soldier", title: "Soldier", emoji: "🪖", description: "Serve in the army — train in combat, weapons, and field operations as part of a unit defending the country.", avgSalary: "380,000 - 550,000 kr/year", educationPath: "Førstegangstjeneste (initial service, 12 months) + further training for career soldiers", keySkills: ["physical fitness", "discipline", "teamwork", "weapon handling", "resilience"], dailyTasks: ["Drill and train", "Maintain equipment", "Run patrols", "Practice tactics", "Stand watch"], growthOutlook: "stable", entryLevel: true, pathType: "military" },
    { id: "infantry-officer", title: "Infantry Officer", emoji: "🎖️", description: "Lead infantry units in the field — planning operations, training soldiers, and executing missions.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Krigsskolen (Norwegian Military Academy, 3 years) + commission", keySkills: ["leadership", "tactics", "decision-making", "fitness", "communication"], dailyTasks: ["Lead training", "Plan exercises", "Mentor soldiers", "Run operations", "Report to command"], growthOutlook: "stable", pathType: "military" },
    { id: "special-forces-operator", title: "Special Forces Operator", emoji: "🦅", description: "Elite soldier trained for high-risk missions — direct action, reconnaissance, hostage rescue, counter-terrorism.", avgSalary: "650,000 - 950,000 kr/year", educationPath: "Forsvarets Spesialkommando (FSK) selection + multi-year specialist training", keySkills: ["elite fitness", "marksmanship", "calm under fire", "languages", "small-team tactics"], dailyTasks: ["Train relentlessly", "Plan missions", "Maintain kit", "Conduct ops", "Debrief after"], growthOutlook: "stable", pathType: "military" },
    { id: "sniper", title: "Sniper", emoji: "🎯", description: "Highly trained marksman delivering precision long-range fire and reconnaissance — usually as part of a small team.", avgSalary: "500,000 - 800,000 kr/year", educationPath: "Military service + sniper school selection + advanced marksmanship", keySkills: ["marksmanship", "patience", "fieldcraft", "navigation", "stealth"], dailyTasks: ["Practice shooting", "Maintain weapons", "Train fieldcraft", "Conduct reconnaissance", "Provide overwatch"], growthOutlook: "stable", pathType: "military" },
    { id: "tank-commander", title: "Tank Commander", emoji: "🛡️", description: "Command an armoured fighting vehicle and crew — directing manoeuvres, gunnery, and tactics in armoured formations.", avgSalary: "550,000 - 850,000 kr/year", educationPath: "Military service + armour school + NCO/officer training", keySkills: ["leadership", "armoured tactics", "gunnery", "navigation", "teamwork"], dailyTasks: ["Direct crew", "Plan routes", "Run gunnery", "Maintain vehicle", "Coordinate with infantry"], growthOutlook: "stable", pathType: "military" },
    { id: "artillery-officer", title: "Artillery Officer", emoji: "💥", description: "Command artillery units providing long-range indirect fire — calculating trajectories and coordinating fire missions.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Krigsskolen + artillery branch training", keySkills: ["mathematics", "fire control", "leadership", "communication", "decision-making"], dailyTasks: ["Plan fire missions", "Direct gun crews", "Coordinate with manoeuvre", "Train soldiers", "Track ammunition"], growthOutlook: "stable", pathType: "military" },
    { id: "combat-engineer", title: "Combat Engineer", emoji: "🛠️", description: "Build and breach obstacles in combat — bridges, fortifications, demolitions, mine clearance, and route-clearance.", avgSalary: "500,000 - 800,000 kr/year", educationPath: "Military service + engineering branch training", keySkills: ["demolitions", "construction", "explosives safety", "improvisation", "fieldcraft"], dailyTasks: ["Build bridges", "Clear obstacles", "Lay/clear mines", "Construct defences", "Support manoeuvre"], growthOutlook: "stable", pathType: "military" },
    { id: "military-pilot", title: "Military Pilot", emoji: "🛩️", description: "Fly military aircraft — fighters, transports, helicopters — in defence, training, and operational missions.", avgSalary: "850,000 - 1,400,000 kr/year", educationPath: "Luftkrigsskolen (Air Force Academy) + flight training (~3 years)", keySkills: ["flight skills", "rapid decision-making", "spatial awareness", "discipline", "teamwork"], dailyTasks: ["Fly missions", "Run pre-flight checks", "Train constantly", "Brief and debrief", "Maintain currency"], growthOutlook: "stable", pathType: "military" },
    { id: "drone-operator-uav", title: "Drone Operator (UAV Pilot)", emoji: "🛸", description: "Pilot unmanned aerial vehicles for surveillance, reconnaissance, or strike missions from a ground control station.", avgSalary: "550,000 - 900,000 kr/year", educationPath: "Military service + UAV pilot certification", keySkills: ["flight controls", "situational awareness", "calm focus", "sensor operation", "comms"], dailyTasks: ["Pilot UAV", "Operate sensors", "Track targets", "Coordinate with team", "Maintain logs"], growthOutlook: "high", pathType: "military" },
    { id: "naval-officer", title: "Naval Officer", emoji: "⚓", description: "Command operations and personnel aboard navy ships — from frigates to coastal patrol vessels.", avgSalary: "650,000 - 1,000,000 kr/year", educationPath: "Sjøkrigsskolen (Naval Academy, 3 years) + sea time", keySkills: ["leadership", "navigation", "seamanship", "tactical command", "decision-making"], dailyTasks: ["Stand watch", "Command crew", "Navigate", "Plan exercises", "Maintain readiness"], growthOutlook: "stable", pathType: "military" },
    { id: "submarine-officer", title: "Submarine Officer", emoji: "🚤", description: "Serve aboard a submarine — operating systems, navigating underwater, and conducting silent missions.", avgSalary: "700,000 - 1,100,000 kr/year", educationPath: "Naval Academy + submarine school + qualification at sea", keySkills: ["calm focus", "systems knowledge", "teamwork in confined spaces", "navigation", "discretion"], dailyTasks: ["Stand watch", "Operate systems", "Run drills", "Navigate submerged", "Maintain stealth"], growthOutlook: "stable", pathType: "military" },
    { id: "marine", title: "Marine", emoji: "🌊", description: "Specialist soldier trained for amphibious and coastal operations — landing from sea and operating in littoral zones.", avgSalary: "450,000 - 700,000 kr/year", educationPath: "Military service + amphibious / coastal operations training", keySkills: ["amphibious tactics", "fitness", "swimming", "weapons handling", "teamwork"], dailyTasks: ["Train amphibious assaults", "Maintain kit", "Practice landings", "Drill weapons", "Patrol coast"], growthOutlook: "stable", entryLevel: true, pathType: "military" },
    { id: "air-force-technician", title: "Air Force Technician", emoji: "🔧", description: "Maintain and repair military aircraft — engines, avionics, weapons systems — keeping the fleet flight-ready.", avgSalary: "500,000 - 750,000 kr/year", educationPath: "Military technical school + aircraft systems certification", keySkills: ["mechanical aptitude", "diagnostics", "attention to detail", "safety", "documentation"], dailyTasks: ["Inspect aircraft", "Replace parts", "Run diagnostics", "Document work", "Prepare for sorties"], growthOutlook: "stable", pathType: "military" },
    { id: "military-intelligence-analyst", title: "Military Intelligence Analyst", emoji: "🧠", description: "Collect, analyse, and disseminate intelligence to support military decision-making — from imagery to signals to HUMINT.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Military service + intelligence training (often Bachelor's/Master's)", keySkills: ["analysis", "research", "languages", "report writing", "security awareness"], dailyTasks: ["Analyse intel", "Brief commanders", "Track threats", "Write assessments", "Coordinate sources"], growthOutlook: "high", pathType: "military" },
    { id: "cyber-warfare-specialist", title: "Cyber Warfare Specialist", emoji: "💻", description: "Conduct offensive and defensive cyber operations on behalf of the military — protecting networks and degrading adversaries.", avgSalary: "750,000 - 1,200,000 kr/year", educationPath: "Bachelor's in CS/Cybersecurity + military cyber training (e.g. Cyberforsvaret)", keySkills: ["network security", "exploitation", "scripting", "OPSEC", "calm focus"], dailyTasks: ["Defend networks", "Hunt threats", "Develop tools", "Run exercises", "Report findings"], growthOutlook: "high", pathType: "military" },
    { id: "eod-technician", title: "EOD Technician", emoji: "💣", description: "Dispose of bombs, IEDs, and unexploded ordnance — protecting civilians and personnel from explosive threats.", avgSalary: "600,000 - 950,000 kr/year", educationPath: "Military service + EOD school (rigorous selection)", keySkills: ["explosives knowledge", "calm under pressure", "precision", "diagnostics", "safety"], dailyTasks: ["Identify threats", "Disarm devices", "Clear sites", "Train constantly", "Document incidents"], growthOutlook: "medium", pathType: "military" },
    { id: "logistics-officer", title: "Military Logistics Officer", emoji: "📦", description: "Plan and run military logistics — supply, transport, fuel, ammunition — keeping units fed, fuelled, and resupplied.", avgSalary: "600,000 - 900,000 kr/year", educationPath: "Krigsskolen + logistics branch training", keySkills: ["planning", "supply chain", "leadership", "problem-solving", "coordination"], dailyTasks: ["Plan resupply", "Track inventory", "Coordinate transport", "Lead teams", "Brief command"], growthOutlook: "stable", pathType: "military" },
    { id: "military-police", title: "Military Police", emoji: "🚔", description: "Enforce military law, investigate misconduct, secure installations, and provide convoy and personnel protection.", avgSalary: "500,000 - 800,000 kr/year", educationPath: "Military service + MP training", keySkills: ["law enforcement", "discipline", "investigation", "fitness", "report writing"], dailyTasks: ["Patrol bases", "Investigate cases", "Secure convoys", "Process reports", "Train soldiers"], growthOutlook: "stable", pathType: "military" },
    { id: "search-and-rescue-operator", title: "Search and Rescue Operator", emoji: "🚁", description: "Deploy by helicopter, boat, or on foot to rescue people in distress — at sea, in mountains, or in disaster zones.", avgSalary: "600,000 - 950,000 kr/year", educationPath: "Military rescue school or Redningsselskapet training + medical/first responder certification", keySkills: ["fitness", "first aid", "swimming", "rope rescue", "calm under pressure"], dailyTasks: ["Run drills", "Respond to calls", "Treat casualties", "Hoist from sea", "Maintain kit"], growthOutlook: "high", pathType: "military" },
    { id: "weapons-specialist", title: "Weapons Specialist", emoji: "🔫", description: "Maintain, repair, and instruct on military weapons systems — from small arms to crew-served and vehicle-mounted weapons.", avgSalary: "500,000 - 800,000 kr/year", educationPath: "Military service + armourer / weapons specialist course", keySkills: ["weapons knowledge", "precision", "safety", "diagnostics", "instruction"], dailyTasks: ["Service weapons", "Train soldiers", "Inspect arsenals", "Document maintenance", "Test fire systems"], growthOutlook: "stable", pathType: "military" },
  ],

  // ========================================
  // SPORT & FITNESS
  // ========================================
  SPORT_FITNESS: [
    {
      id: "personal-trainer",
      title: "Personal Trainer",
      emoji: "💪",
      description: "Design and deliver one-on-one fitness programmes for clients in gyms, studios, or independently. Combines coaching, motivation and exercise science.",
      avgSalary: "350,000 - 700,000 kr/year",
      educationPath: "Personal Trainer certification (3-12 months) — e.g. AFPT, NIH",
      keySkills: ["exercise programming", "motivation", "anatomy", "client communication", "self-marketing"],
      dailyTasks: ["Run sessions", "Plan programmes", "Track client progress", "Build client base", "Stay current on training science"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "sports-coach",
      title: "Sports Coach",
      emoji: "🏆",
      description: "Train athletes or teams in a specific sport — from grassroots youth clubs to professional level. Focuses on technique, tactics and development.",
      avgSalary: "300,000 - 1,200,000 kr/year (sport-dependent)",
      educationPath: "Coaching certifications + sport-specific qualifications + experience",
      keySkills: ["sport expertise", "leadership", "communication", "tactical thinking", "patience"],
      dailyTasks: ["Run training sessions", "Plan tactics", "Analyse performance", "Mentor athletes", "Coordinate fixtures"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "fitness-instructor",
      title: "Fitness Instructor",
      emoji: "🏋️",
      description: "Lead group exercise classes — spinning, HIIT, strength, dance fitness. Works in gyms, community centres and corporate wellness.",
      avgSalary: "320,000 - 550,000 kr/year",
      educationPath: "Group instructor certification (3-6 months)",
      keySkills: ["choreography", "energy", "form correction", "music timing", "group management"],
      dailyTasks: ["Lead classes", "Plan routines", "Demonstrate exercises", "Adapt for ability levels", "Encourage participants"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "sports-physiotherapist",
      title: "Sports Physiotherapist",
      emoji: "🩹",
      description: "Treat and prevent injuries in athletes — from amateur to elite. Combines clinical skill with sport-specific rehabilitation.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Physiotherapy (3 years) + sports physio specialisation",
      keySkills: ["anatomy", "manual therapy", "rehabilitation", "movement analysis", "client communication"],
      dailyTasks: ["Assess injuries", "Plan rehab", "Apply treatments", "Track recovery", "Educate athletes"],
      growthOutlook: "high",
    },
    {
      id: "nutritionist",
      title: "Nutritionist",
      emoji: "🥗",
      description: "Advise individuals and athletes on diet and nutrition for health, performance or specific goals. May work clinically or in sport.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Nutrition (3 years) — UiO, NMBU",
      keySkills: ["nutrition science", "client communication", "meal planning", "behaviour change", "evidence evaluation"],
      dailyTasks: ["Assess clients", "Build meal plans", "Track outcomes", "Educate on choices", "Stay current on research"],
      growthOutlook: "high",
    },
    {
      id: "sports-scientist",
      title: "Sports Scientist",
      emoji: "📊",
      description: "Apply physiology, biomechanics and data analysis to improve athletic performance. Often works with national teams or pro clubs.",
      avgSalary: "500,000 - 850,000 kr/year",
      educationPath: "Bachelor's/Master's in Sport Science (3-5 years) — NIH, NTNU",
      keySkills: ["physiology", "data analysis", "testing protocols", "research", "communication"],
      dailyTasks: ["Run performance tests", "Analyse data", "Brief coaches", "Design protocols", "Track athletes"],
      growthOutlook: "medium",
    },
    {
      id: "athletic-trainer",
      title: "Athletic Trainer",
      emoji: "🏃",
      description: "Provide on-field first response, taping, and acute injury management for sports teams. The first medic on the pitch.",
      avgSalary: "420,000 - 650,000 kr/year",
      educationPath: "Sport science + first aid + sport-specific training (2-3 years)",
      keySkills: ["first aid", "taping", "injury triage", "calm under pressure", "anatomy"],
      dailyTasks: ["Pitch-side cover", "Tape athletes", "Assess injuries", "Coordinate with physios", "Stock supplies"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "yoga-instructor",
      title: "Yoga Instructor",
      emoji: "🧘",
      description: "Teach yoga classes in studios, gyms or independently — covering physical practice, breathwork and mindfulness.",
      avgSalary: "250,000 - 600,000 kr/year",
      educationPath: "200/500-hour Yoga Teacher Training (3-12 months)",
      keySkills: ["yoga practice", "anatomy", "verbal cueing", "calm presence", "self-employment"],
      dailyTasks: ["Lead classes", "Adjust postures", "Plan sequences", "Build client base", "Maintain personal practice"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "swim-instructor",
      title: "Swim Instructor",
      emoji: "🏊",
      description: "Teach swimming to children and adults at pools and clubs — water safety, technique and progression through levels.",
      avgSalary: "300,000 - 480,000 kr/year",
      educationPath: "Norwegian Swimming Federation instructor certification (3-6 months)",
      keySkills: ["swimming", "child engagement", "safety awareness", "progression planning", "patience"],
      dailyTasks: ["Run lessons", "Demonstrate strokes", "Track progress", "Ensure safety", "Liaise with parents"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "outdoor-instructor",
      title: "Outdoor Instructor",
      emoji: "🧗",
      description: "Lead climbing, hiking, kayaking, skiing and other outdoor activities — for schools, summer camps and adventure tourism.",
      avgSalary: "320,000 - 580,000 kr/year",
      educationPath: "Friluftsliv programme + activity-specific certifications (1-3 years)",
      keySkills: ["outdoor skills", "safety management", "group leadership", "first aid", "weather judgement"],
      dailyTasks: ["Lead trips", "Brief participants", "Manage safety", "Maintain gear", "Adapt to conditions"],
      growthOutlook: "medium",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Sport — Performance & Coaching
    // ──────────────────────────────────────────────
    {
      id: "professional-athlete",
      title: "Professional Athlete",
      emoji: "🏅",
      description: "Compete at the highest level in a chosen sport — training daily and performing in matches, races, or events.",
      avgSalary: "400,000 - 5,000,000+ kr/year (highly variable)",
      educationPath: "Talent development + youth academy + senior contract (varies by sport)",
      keySkills: ["physical excellence", "mental toughness", "discipline", "tactical awareness", "competitive drive"],
      dailyTasks: ["Train daily", "Compete in events", "Recover and rest", "Study tactics", "Work with coaches"],
      growthOutlook: "stable",
      pathType: "elite-sport",
    },
    {
      id: "assistant-coach",
      title: "Assistant Coach",
      emoji: "📋",
      description: "Support the head coach by running training drills, analysing players, and helping with tactics and team logistics.",
      avgSalary: "350,000 - 750,000 kr/year",
      educationPath: "Coaching qualifications + Bachelor's in Sports Science (helpful)",
      keySkills: ["coaching", "communication", "tactical knowledge", "organisation", "teamwork"],
      dailyTasks: ["Run drills", "Support sessions", "Analyse players", "Assist tactics", "Mentor athletes"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "strength-conditioning-coach",
      title: "Strength & Conditioning Coach",
      emoji: "🏋️",
      description: "Design and run physical training programmes that build athletes' strength, speed, power, and resilience.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Sports Science + S&C certification (CSCS)",
      keySkills: ["programme design", "biomechanics", "motivation", "injury prevention", "data tracking"],
      dailyTasks: ["Plan training", "Run gym sessions", "Track progress", "Adapt to needs", "Collaborate with coaches"],
      growthOutlook: "high",
    },
    {
      id: "sports-therapist",
      title: "Sports Therapist",
      emoji: "💪",
      description: "Treat sports injuries, provide rehab, and use massage and manual therapy to keep athletes performing at their best.",
      avgSalary: "420,000 - 650,000 kr/year",
      educationPath: "Bachelor's in Sports Therapy (3 years)",
      keySkills: ["manual therapy", "injury assessment", "rehab planning", "anatomy", "athlete care"],
      dailyTasks: ["Assess injuries", "Provide treatment", "Plan rehab", "Pitchside support", "Advise on prevention"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Sport — Analysis & Science
    // ──────────────────────────────────────────────
    {
      id: "sports-analyst",
      title: "Sports Analyst",
      emoji: "📊",
      description: "Use video and data to analyse team and opposition performance, helping coaches make better tactical decisions.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Sports Science / Performance Analysis",
      keySkills: ["video analysis", "data tools", "tactical knowledge", "communication", "attention to detail"],
      dailyTasks: ["Code matches", "Build reports", "Brief coaches", "Track KPIs", "Scout opposition"],
      growthOutlook: "high",
    },
    {
      id: "performance-analyst",
      title: "Performance Analyst",
      emoji: "📈",
      description: "Track athlete and team performance data — wearables, GPS, video — to spot patterns and inform training decisions.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Sports Science / Data + analyst experience",
      keySkills: ["data analysis", "sports tech", "statistics", "visualisation", "communication"],
      dailyTasks: ["Capture session data", "Build dashboards", "Identify trends", "Brief coaches", "Refine metrics"],
      growthOutlook: "high",
    },
    {
      id: "sports-psychologist",
      title: "Sports Psychologist",
      emoji: "🧠",
      description: "Help athletes manage pressure, build confidence, recover from setbacks, and unlock peak mental performance.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Master's in Sports / Performance Psychology + accreditation",
      keySkills: ["counselling", "active listening", "performance science", "empathy", "confidentiality"],
      dailyTasks: ["Counsel athletes", "Run mental skills sessions", "Support recovery", "Coach mindset", "Liaise with coaches"],
      growthOutlook: "high",
    },

    // ──────────────────────────────────────────────
    // Sport — Officiating
    // ──────────────────────────────────────────────
    {
      id: "referee",
      title: "Referee",
      emoji: "🟨",
      description: "Officiate matches by enforcing the rules of the sport, managing players, and making split-second decisions on the field.",
      avgSalary: "200,000 - 1,200,000 kr/year (highly variable by level)",
      educationPath: "Refereeing courses + grading through national federation (entry from teens)",
      keySkills: ["rule knowledge", "decision-making", "fitness", "calm under pressure", "authority"],
      dailyTasks: ["Officiate matches", "Manage players", "Apply rules", "Stay match-fit", "Review performance"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "umpire",
      title: "Umpire",
      emoji: "⚖️",
      description: "Officiate sports like tennis, cricket, baseball, and hockey — making rulings on plays, scoring, and conduct.",
      avgSalary: "200,000 - 800,000 kr/year (variable by level)",
      educationPath: "Sport-specific umpiring courses + accreditation",
      keySkills: ["rule knowledge", "concentration", "judgement", "communication", "fairness"],
      dailyTasks: ["Officiate matches", "Make rulings", "Manage scoring", "Apply discipline", "Maintain match flow"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Sport — Scouting & Management
    // ──────────────────────────────────────────────
    {
      id: "talent-scout",
      title: "Talent Scout",
      emoji: "🔭",
      description: "Travel to games and tournaments to spot promising young athletes and recommend signings to clubs and academies.",
      avgSalary: "400,000 - 800,000 kr/year",
      educationPath: "Coaching/scouting qualifications + sport-specific knowledge",
      keySkills: ["eye for talent", "tactical knowledge", "networking", "judgement", "report writing"],
      dailyTasks: ["Watch matches", "Assess players", "Write scouting reports", "Brief recruitment", "Build contacts"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "scouting-analyst",
      title: "Scouting Analyst",
      emoji: "🗂️",
      description: "Combine video, data, and traditional scouting to build detailed player profiles for clubs and recruitment teams.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Sports Science / Data + scouting experience",
      keySkills: ["data analysis", "video coding", "report writing", "player evaluation", "tools like Wyscout"],
      dailyTasks: ["Build player profiles", "Analyse footage", "Maintain databases", "Brief scouts", "Track targets"],
      growthOutlook: "high",
    },
    {
      id: "sports-agent",
      title: "Sports Agent",
      emoji: "🤝",
      description: "Represent athletes in contract talks, sponsorship deals, and career decisions — acting as their advocate and adviser.",
      avgSalary: "500,000 - 3,000,000 kr/year (commission-based, highly variable)",
      educationPath: "Bachelor's in Law / Business + agent licensing where required",
      keySkills: ["negotiation", "networking", "legal knowledge", "trust-building", "commercial sense"],
      dailyTasks: ["Negotiate contracts", "Manage clients", "Build sponsor deals", "Advise athletes", "Network with clubs"],
      growthOutlook: "medium",
    },
    {
      id: "sports-manager",
      title: "Sports Manager",
      emoji: "🧑‍💼",
      description: "Run the business side of a sports team or club — overseeing budgets, staff, partnerships, and operations.",
      avgSalary: "650,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Sports Management / Business",
      keySkills: ["leadership", "business acumen", "operations", "communication", "decision-making"],
      dailyTasks: ["Lead operations", "Manage budgets", "Oversee staff", "Build partnerships", "Plan strategy"],
      growthOutlook: "medium",
    },
    {
      id: "team-manager",
      title: "Team Manager",
      emoji: "👥",
      description: "Coordinate the day-to-day logistics for a sports team — travel, kit, schedules, and player welfare.",
      avgSalary: "450,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Sports Management or similar (entry routes vary)",
      keySkills: ["organisation", "communication", "problem-solving", "calm under pressure", "people skills"],
      dailyTasks: ["Plan travel", "Coordinate kit", "Manage logistics", "Liaise with staff", "Support players"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Sport — Media & Broadcasting
    // ──────────────────────────────────────────────
    {
      id: "sports-journalist",
      title: "Sports Journalist",
      emoji: "📰",
      description: "Report on sports news, write match reports, interview athletes, and produce features for newspapers, sites, or broadcasters.",
      avgSalary: "400,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Journalism + sports specialism",
      keySkills: ["writing", "interviewing", "research", "deadline focus", "sport knowledge"],
      dailyTasks: ["Cover matches", "Interview athletes", "Write reports", "Pitch stories", "Build sources"],
      growthOutlook: "stable",
    },
    {
      id: "sports-commentator",
      title: "Sports Commentator",
      emoji: "🎙️",
      description: "Provide live commentary for sports broadcasts — describing the action, analysing tactics, and bringing matches to life.",
      avgSalary: "450,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "Bachelor's in Journalism / Media + broadcast experience",
      keySkills: ["broadcasting voice", "quick thinking", "deep sport knowledge", "storytelling", "preparation"],
      dailyTasks: ["Prepare match notes", "Commentate live", "Analyse plays", "Interview guests", "Review broadcasts"],
      growthOutlook: "stable",
    },
    {
      id: "sports-broadcaster",
      title: "Sports Broadcaster",
      emoji: "📺",
      description: "Present sports content on TV or radio — anchoring shows, interviewing experts, and hosting live coverage.",
      avgSalary: "500,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "Bachelor's in Broadcast Journalism / Media",
      keySkills: ["presenting", "interviewing", "research", "on-camera presence", "improvisation"],
      dailyTasks: ["Host shows", "Conduct interviews", "Read scripts", "Prepare segments", "Engage audiences"],
      growthOutlook: "stable",
    },
    {
      id: "sports-photographer",
      title: "Sports Photographer",
      emoji: "📸",
      description: "Capture the decisive moments of sport — for newspapers, agencies, clubs, and sponsors.",
      avgSalary: "350,000 - 800,000 kr/year (often freelance, variable)",
      educationPath: "Self-taught or photography diploma + portfolio building",
      keySkills: ["fast camera work", "anticipation", "editing", "lighting", "endurance"],
      dailyTasks: ["Cover matches", "Shoot training", "Edit images", "File to clients", "Maintain gear"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Sport — Events, Marketing & Operations
    // ──────────────────────────────────────────────
    {
      id: "sports-event-manager",
      title: "Sports Event Manager",
      emoji: "🎪",
      description: "Plan and run sporting events from local tournaments to major competitions — handling logistics, staff, and stakeholders.",
      avgSalary: "500,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Event Management / Sports Management",
      keySkills: ["planning", "logistics", "stakeholder mgmt", "calm under pressure", "leadership"],
      dailyTasks: ["Plan events", "Coordinate suppliers", "Manage staff", "Handle live operations", "Debrief after events"],
      growthOutlook: "medium",
    },
    {
      id: "sports-event-coordinator",
      title: "Sports Event Coordinator",
      emoji: "🗓️",
      description: "Support event managers with the practical coordination of sports events — bookings, schedules, volunteers, and on-day operations.",
      avgSalary: "380,000 - 580,000 kr/year",
      educationPath: "Bachelor's in Event Management or related (entry routes vary)",
      keySkills: ["organisation", "communication", "multitasking", "problem-solving", "teamwork"],
      dailyTasks: ["Book venues", "Coordinate volunteers", "Manage schedules", "Handle vendors", "Support live ops"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "sponsorship-manager",
      title: "Sponsorship Manager",
      emoji: "💼",
      description: "Build commercial partnerships for sports clubs, events, and athletes — securing sponsors and managing relationships.",
      avgSalary: "650,000 - 1,200,000 kr/year",
      educationPath: "Bachelor's in Marketing / Business + sponsorship experience",
      keySkills: ["sales", "negotiation", "relationship building", "creativity", "commercial sense"],
      dailyTasks: ["Pitch sponsors", "Negotiate deals", "Manage activations", "Report on value", "Build relationships"],
      growthOutlook: "high",
    },
    {
      id: "sports-marketing-manager",
      title: "Sports Marketing Manager",
      emoji: "📣",
      description: "Lead the marketing of sports clubs, leagues, athletes, or brands — building fan engagement and growing audiences.",
      avgSalary: "650,000 - 1,100,000 kr/year",
      educationPath: "Bachelor's in Marketing / Business + sport sector experience",
      keySkills: ["brand strategy", "digital marketing", "storytelling", "campaigns", "data analysis"],
      dailyTasks: ["Plan campaigns", "Manage social", "Lead launches", "Track metrics", "Brief creatives"],
      growthOutlook: "high",
    },
    {
      id: "ticketing-manager",
      title: "Ticketing Manager",
      emoji: "🎟️",
      description: "Run the ticketing operation for a club, venue, or event — pricing, inventory, sales platforms, and customer service.",
      avgSalary: "500,000 - 800,000 kr/year",
      educationPath: "Bachelor's in Business / Sports Management",
      keySkills: ["pricing strategy", "ticketing platforms", "data analysis", "customer service", "operations"],
      dailyTasks: ["Set pricing", "Manage inventory", "Handle sales", "Resolve customer issues", "Report on revenue"],
      growthOutlook: "stable",
    },
    {
      id: "facility-manager",
      title: "Sports Facility Manager",
      emoji: "🏟️",
      description: "Run sports venues — gyms, stadiums, training centres — keeping facilities safe, well-maintained, and running smoothly.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Facility / Sports Management + operations experience",
      keySkills: ["operations", "leadership", "health & safety", "budgeting", "maintenance planning"],
      dailyTasks: ["Oversee maintenance", "Manage staff", "Ensure safety", "Schedule bookings", "Manage budgets"],
      growthOutlook: "stable",
    },
    {
      id: "groundskeeper",
      title: "Groundskeeper",
      emoji: "🌱",
      description: "Look after sports pitches, courts, and grounds — mowing, marking, watering, and preparing surfaces for matches.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Vocational training in groundskeeping / horticulture (entry possible at 16+)",
      keySkills: ["horticulture", "machinery use", "attention to detail", "physical stamina", "weather awareness"],
      dailyTasks: ["Mow and mark pitches", "Water surfaces", "Repair turf", "Maintain equipment", "Prepare for matches"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "equipment-manager",
      title: "Equipment Manager",
      emoji: "🎽",
      description: "Look after a team's kit and equipment — washing, repairing, packing, and making sure everything is ready for training and matches.",
      avgSalary: "350,000 - 500,000 kr/year",
      educationPath: "On-the-job training (entry possible at 18+)",
      keySkills: ["organisation", "reliability", "attention to detail", "problem-solving", "teamwork"],
      dailyTasks: ["Manage kit", "Pack for travel", "Repair gear", "Track inventory", "Support staff"],
      growthOutlook: "stable",
      entryLevel: true,
    },

    // ──────────────────────────────────────────────
    // Sport — Esports
    // ──────────────────────────────────────────────
    {
      id: "esports-player",
      title: "Esports Player",
      emoji: "🎮",
      description: "Compete professionally in video games — training daily, playing in tournaments, and representing teams or organisations.",
      avgSalary: "300,000 - 3,000,000+ kr/year (highly variable)",
      educationPath: "Self-driven training + amateur ladder + team contract",
      keySkills: ["game mastery", "reflexes", "teamwork", "mental resilience", "communication"],
      dailyTasks: ["Train daily", "Compete in matches", "Review gameplay", "Stream content", "Work with coach"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "esports-coach",
      title: "Esports Coach",
      emoji: "🕹️",
      description: "Coach professional esports teams — building strategy, reviewing gameplay, and developing players for competition.",
      avgSalary: "450,000 - 1,000,000 kr/year (variable)",
      educationPath: "High-level competitive experience + coaching skills",
      keySkills: ["game knowledge", "strategy", "communication", "leadership", "video review"],
      dailyTasks: ["Plan strategies", "Review matches", "Coach players", "Scout opponents", "Manage team dynamics"],
      growthOutlook: "high",
    },
    {
      id: "esports-analyst",
      title: "Esports Analyst",
      emoji: "🖥️",
      description: "Analyse esports matches, opponents, and meta — providing data-driven insights to coaches and players.",
      avgSalary: "400,000 - 800,000 kr/year",
      educationPath: "High-level game knowledge + data/analysis skills",
      keySkills: ["data analysis", "game knowledge", "video review", "communication", "tooling"],
      dailyTasks: ["Analyse matches", "Build reports", "Scout opponents", "Track meta trends", "Brief coaches"],
      growthOutlook: "high",
      entryLevel: true,
    },
    { id: "footballer", title: "Footballer", emoji: "⚽", description: "Play professional football — train daily, compete in matches, and represent a club at the highest level you can reach.", avgSalary: "300,000 - 5,000,000+ kr/year (highly variable, top 1% earn millions)", educationPath: "Youth academy → senior contract; only a small fraction make it pro", keySkills: ["football technique", "fitness", "tactical awareness", "mental resilience", "teamwork"], dailyTasks: ["Train daily", "Play matches", "Watch tape", "Recover", "Travel"], growthOutlook: "stable", pathType: "elite-sport" },
    { id: "tennis-player", title: "Tennis Player", emoji: "🎾", description: "Compete on the professional tennis tour — chasing ranking points, prize money, and major titles.", avgSalary: "0 - 10,000,000+ kr/year (highly variable, top 100 earn well)", educationPath: "Junior competition → ITF/ATP/WTA tour; long expensive path", keySkills: ["tennis technique", "fitness", "mental resilience", "tactics", "self-management"], dailyTasks: ["Train daily", "Play matches", "Travel", "Strength work", "Plan schedule"], growthOutlook: "stable", pathType: "elite-sport" },
  ],

  // ========================================
  // REAL ESTATE & PROPERTY
  // ========================================
  REAL_ESTATE_PROPERTY: [
    {
      id: "real-estate-agent",
      title: "Real Estate Agent",
      emoji: "🏡",
      description: "Help people buy and sell homes — running viewings, negotiating offers, and managing the sale process from listing to completion.",
      avgSalary: "450,000 - 900,000 kr/year (commission-based, highly variable)",
      educationPath: "Bachelor's in Real Estate (Eiendomsmegling, 3 years) + state authorisation",
      keySkills: ["negotiation", "sales", "communication", "local market knowledge", "trust-building"],
      dailyTasks: ["Run viewings", "List properties", "Negotiate offers", "Advise clients", "Coordinate paperwork"],
      growthOutlook: "stable",
    },
    {
      id: "lettings-agent",
      title: "Lettings Agent",
      emoji: "🔑",
      description: "Match tenants with rental properties, handle viewings, run reference checks, and manage tenancy agreements.",
      avgSalary: "380,000 - 600,000 kr/year",
      educationPath: "Vocational training or on-the-job (entry possible from 18+)",
      keySkills: ["customer service", "organisation", "communication", "attention to detail", "sales"],
      dailyTasks: ["Show rentals", "Vet tenants", "Draft tenancy contracts", "Manage move-ins", "Handle enquiries"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "property-manager",
      title: "Property Manager",
      emoji: "🏢",
      description: "Look after rental properties on behalf of owners — handling tenants, repairs, rent collection, and compliance.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Property Management or related field (3 years)",
      keySkills: ["organisation", "problem-solving", "tenant relations", "budgeting", "regulatory knowledge"],
      dailyTasks: ["Manage tenancies", "Coordinate repairs", "Collect rent", "Handle disputes", "Report to owners"],
      growthOutlook: "stable",
    },
    {
      id: "property-valuer",
      title: "Property Valuer",
      emoji: "📐",
      description: "Inspect and assess the market value of houses, flats, and commercial buildings for sales, mortgages, or insurance.",
      avgSalary: "550,000 - 850,000 kr/year",
      educationPath: "Bachelor's in Real Estate / Surveying + valuation certification",
      keySkills: ["analytical thinking", "market knowledge", "attention to detail", "report writing", "objectivity"],
      dailyTasks: ["Inspect properties", "Research comparables", "Calculate valuations", "Write reports", "Advise clients"],
      growthOutlook: "stable",
    },
    {
      id: "mortgage-advisor",
      title: "Mortgage Advisor",
      emoji: "🧮",
      description: "Help buyers find the right mortgage by comparing lenders, explaining terms, and guiding them through the application process.",
      avgSalary: "550,000 - 900,000 kr/year",
      educationPath: "Bachelor's in Finance / Economics + mortgage advisor certification",
      keySkills: ["financial literacy", "communication", "regulatory knowledge", "trust-building", "attention to detail"],
      dailyTasks: ["Assess client finances", "Compare mortgage products", "Explain terms", "Submit applications", "Liaise with lenders"],
      growthOutlook: "stable",
    },
    {
      id: "chartered-surveyor",
      title: "Chartered Surveyor",
      emoji: "📏",
      description: "Inspect buildings and land in detail to assess condition, structural issues, and value — for buyers, owners, and developers.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's/Master's in Surveying + professional accreditation",
      keySkills: ["technical inspection", "construction knowledge", "report writing", "judgement", "client communication"],
      dailyTasks: ["Inspect buildings", "Identify defects", "Write detailed reports", "Advise clients", "Liaise with builders"],
      growthOutlook: "stable",
    },
    {
      id: "property-developer",
      title: "Property Developer",
      emoji: "🏗️",
      description: "Buy land or buildings, plan and finance construction or renovation projects, and sell or rent them out for profit.",
      avgSalary: "700,000 - 1,500,000 kr/year (highly variable)",
      educationPath: "Bachelor's in Real Estate / Business + industry experience",
      keySkills: ["business acumen", "risk management", "project management", "negotiation", "vision"],
      dailyTasks: ["Source sites", "Plan projects", "Secure financing", "Manage builders", "Market completed properties"],
      growthOutlook: "medium",
    },
  ],

  // ========================================
  // SOCIAL CARE & COMMUNITY
  // ========================================
  SOCIAL_CARE_COMMUNITY: [
    {
      id: "social-worker",
      title: "Social Worker",
      emoji: "🤝",
      description: "Support vulnerable children, families, and adults — assessing needs, coordinating services, and advocating for safety and wellbeing.",
      avgSalary: "500,000 - 700,000 kr/year",
      educationPath: "Bachelor's in Social Work / Sosionom (3 years)",
      keySkills: ["empathy", "active listening", "advocacy", "resilience", "case management"],
      dailyTasks: ["Assess client needs", "Build support plans", "Coordinate services", "Visit homes", "Document casework"],
      growthOutlook: "high",
    },
    {
      id: "youth-worker",
      title: "Youth Worker",
      emoji: "🧑‍🤝‍🧑",
      description: "Support young people aged 11-25 through informal education, activities, and one-to-one mentoring at clubs and community centres.",
      avgSalary: "400,000 - 550,000 kr/year",
      educationPath: "Vocational training or Bachelor's in Youth Work (entry possible at 18+)",
      keySkills: ["relationship-building", "communication", "empathy", "facilitation", "patience"],
      dailyTasks: ["Run group activities", "Mentor young people", "Plan workshops", "Build trust", "Refer to support"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "family-support-worker",
      title: "Family Support Worker",
      emoji: "👨‍👩‍👧",
      description: "Work directly with families facing difficulties — offering practical help, parenting support, and links to other services.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Vocational training in Health & Social Care (entry possible at 18+)",
      keySkills: ["empathy", "non-judgement", "practical problem-solving", "communication", "boundaries"],
      dailyTasks: ["Visit families", "Coach parenting skills", "Help with daily routines", "Connect to services", "Document progress"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "addiction-counsellor",
      title: "Addiction Counsellor",
      emoji: "💬",
      description: "Help people recover from drug, alcohol, or behavioural addictions through one-to-one and group counselling.",
      avgSalary: "480,000 - 680,000 kr/year",
      educationPath: "Bachelor's in Social Work / Psychology + addiction-specific training",
      keySkills: ["empathy", "active listening", "non-judgement", "motivational interviewing", "resilience"],
      dailyTasks: ["Run counselling sessions", "Lead group therapy", "Support recovery plans", "Coordinate with services", "Monitor progress"],
      growthOutlook: "high",
    },
    {
      id: "child-protection-officer",
      title: "Child Protection Officer",
      emoji: "🛡️",
      description: "Specialist social worker focused on safeguarding children from harm, neglect, and abuse — investigating concerns and coordinating protection.",
      avgSalary: "550,000 - 750,000 kr/year",
      educationPath: "Bachelor's in Social Work + safeguarding specialisation",
      keySkills: ["safeguarding", "investigation", "courage", "judgement", "documentation"],
      dailyTasks: ["Investigate concerns", "Assess risk", "Coordinate protection plans", "Liaise with police/schools", "Attend hearings"],
      growthOutlook: "high",
    },
    {
      id: "community-organiser",
      title: "Community Organiser",
      emoji: "🌱",
      description: "Bring local people together to identify shared issues and take collective action — from neighbourhood projects to campaigns.",
      avgSalary: "400,000 - 600,000 kr/year",
      educationPath: "Bachelor's in Social Sciences or related (entry routes vary)",
      keySkills: ["facilitation", "listening", "coalition-building", "communication", "tenacity"],
      dailyTasks: ["Listen to residents", "Run community meetings", "Build local groups", "Plan campaigns", "Connect to decision-makers"],
      growthOutlook: "medium",
      entryLevel: true,
    },
    {
      id: "outreach-worker",
      title: "Outreach Worker",
      emoji: "🚶",
      description: "Engage with people who don't access mainstream services — homeless people, rough sleepers, street-involved youth — and connect them to support.",
      avgSalary: "420,000 - 580,000 kr/year",
      educationPath: "Vocational training in Social Care (entry possible at 18+)",
      keySkills: ["empathy", "street awareness", "trust-building", "resilience", "harm reduction"],
      dailyTasks: ["Walk outreach routes", "Build relationships", "Refer to services", "Distribute supplies", "Document contacts"],
      growthOutlook: "high",
      entryLevel: true,
    },
  ],

  // ========================================
  // CONSTRUCTION & TRADES
  // ========================================
  CONSTRUCTION_TRADES: [
    {
      id: "carpenter",
      title: "Carpenter",
      emoji: "🪚",
      description: "Build, install, and repair structures made of wood — from house frames and roofs to staircases, doors, and fitted furniture.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational programme (Tømrer, 4 years incl. apprenticeship)",
      keySkills: ["measuring & cutting", "tool use", "physical stamina", "problem-solving", "attention to detail"],
      dailyTasks: ["Read blueprints", "Cut and shape wood", "Install structures", "Use power tools", "Work as part of a team"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "electrician",
      title: "Electrician",
      emoji: "💡",
      description: "Install, maintain, and repair electrical systems in homes, offices, and industrial sites — wiring, lighting, and power.",
      avgSalary: "500,000 - 750,000 kr/year",
      educationPath: "Vocational programme (Elektriker, 4.5 years incl. apprenticeship) + certification",
      keySkills: ["technical knowledge", "safety awareness", "problem-solving", "manual dexterity", "regulatory compliance"],
      dailyTasks: ["Install wiring", "Fit fixtures", "Test systems", "Diagnose faults", "Follow safety codes"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "plumber",
      title: "Plumber",
      emoji: "🔧",
      description: "Install and repair pipes, water systems, heating, and drainage in homes, offices, and construction sites.",
      avgSalary: "480,000 - 700,000 kr/year",
      educationPath: "Vocational programme (Rørlegger, 4 years incl. apprenticeship)",
      keySkills: ["technical knowledge", "manual dexterity", "problem-solving", "physical stamina", "customer service"],
      dailyTasks: ["Fit pipework", "Install bathrooms", "Service heating systems", "Diagnose leaks", "Advise customers"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "bricklayer",
      title: "Bricklayer",
      emoji: "🧱",
      description: "Build walls, chimneys, and other structures from bricks, blocks, and stone using mortar and traditional craft skills.",
      avgSalary: "440,000 - 620,000 kr/year",
      educationPath: "Vocational programme (Murer, 4 years incl. apprenticeship)",
      keySkills: ["physical stamina", "precision", "spatial awareness", "tool use", "teamwork"],
      dailyTasks: ["Mix mortar", "Lay bricks", "Read plans", "Build to spec", "Maintain quality"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "painter-decorator",
      title: "Painter & Decorator",
      emoji: "🎨",
      description: "Prepare and paint walls, ceilings, and woodwork — and apply wallpaper and finishes — in homes and commercial buildings.",
      avgSalary: "380,000 - 550,000 kr/year",
      educationPath: "Vocational programme (Maler, 4 years incl. apprenticeship)",
      keySkills: ["attention to detail", "steady hand", "colour sense", "preparation", "customer service"],
      dailyTasks: ["Prep surfaces", "Apply paint", "Hang wallpaper", "Match colours", "Tidy work areas"],
      growthOutlook: "stable",
      entryLevel: true,
    },
    {
      id: "scaffolder",
      title: "Scaffolder",
      emoji: "🏗️",
      description: "Erect and dismantle the temporary structures that allow other tradespeople to work safely at height on construction sites.",
      avgSalary: "450,000 - 650,000 kr/year",
      educationPath: "Vocational training + scaffolding certification (entry from 18+)",
      keySkills: ["physical fitness", "head for heights", "safety awareness", "teamwork", "spatial thinking"],
      dailyTasks: ["Erect scaffolds", "Inspect for safety", "Dismantle structures", "Move materials", "Follow site rules"],
      growthOutlook: "high",
      entryLevel: true,
    },
    {
      id: "site-manager",
      title: "Construction Site Manager",
      emoji: "👷",
      description: "Run building sites day-to-day — coordinating trades, managing safety, keeping projects on schedule and within budget.",
      avgSalary: "650,000 - 1,000,000 kr/year",
      educationPath: "Bachelor's in Construction Management + site experience",
      keySkills: ["leadership", "scheduling", "safety management", "problem-solving", "communication"],
      dailyTasks: ["Coordinate trades", "Run site meetings", "Manage safety", "Track progress", "Liaise with clients"],
      growthOutlook: "high",
    },
    {
      id: "quantity-surveyor",
      title: "Quantity Surveyor",
      emoji: "📋",
      description: "Manage the costs of construction projects from initial estimates through to final accounts — ensuring value for money.",
      avgSalary: "650,000 - 950,000 kr/year",
      educationPath: "Bachelor's in Quantity Surveying / Construction Economics (3 years)",
      keySkills: ["numeracy", "cost analysis", "negotiation", "construction knowledge", "attention to detail"],
      dailyTasks: ["Prepare cost estimates", "Manage budgets", "Negotiate contracts", "Track variations", "Settle final accounts"],
      growthOutlook: "high",
    },
  ],
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get all career categories
 */
export function getAllCategories(): CareerCategory[] {
  return Object.keys(CAREER_PATHWAYS) as CareerCategory[];
}

/**
 * Get careers for a specific category
 */
export function getCareersForCategory(category: CareerCategory): Career[] {
  return CAREER_PATHWAYS[category] || [];
}

/**
 * Get a single career by ID
 */
export function getCareerById(id: string): Career | undefined {
  for (const careers of Object.values(CAREER_PATHWAYS)) {
    const career = careers.find((c) => c.id === id);
    if (career) return career;
  }
  return undefined;
}

/**
 * Get all careers as a flat array
 */
export function getAllCareers(): Career[] {
  return Object.values(CAREER_PATHWAYS).flat();
}

/**
 * Get the category for a given career
 */
export function getCategoryForCareer(careerId: string): CareerCategory | undefined {
  for (const [category, careers] of Object.entries(CAREER_PATHWAYS)) {
    if (careers.some((c) => c.id === careerId)) {
      return category as CareerCategory;
    }
  }
  return undefined;
}

/** Look up specialist path type by career title (case-insensitive). */
export function getPathTypeForCareer(careerTitle: string): SpecialistPathType | undefined {
  const lower = careerTitle.toLowerCase();
  return getAllCareers().find((c) => c.title.toLowerCase() === lower)?.pathType;
}

// ── Sector + pension helpers ──────────────────────────────────────────

/** Default sector for each category. Overridden by career.sector if set. */
const CATEGORY_SECTOR_DEFAULTS: Partial<Record<CareerCategory, "public" | "private" | "mixed">> = {
  HEALTHCARE_LIFE_SCIENCES: "public",
  EDUCATION_TRAINING: "public",
  PUBLIC_SERVICE_SAFETY: "public",
  MILITARY_DEFENCE: "public",
  SOCIAL_CARE_COMMUNITY: "public",
  TECHNOLOGY_IT: "private",
  FINANCE_BANKING: "private",
  CREATIVE_MEDIA: "private",
  SALES_MARKETING: "private",
  HOSPITALITY_TOURISM: "private",
  REAL_ESTATE_PROPERTY: "private",
  BUSINESS_MANAGEMENT: "private",
  LOGISTICS_TRANSPORT: "mixed",
  MANUFACTURING_ENGINEERING: "mixed",
  CONSTRUCTION_TRADES: "mixed",
  SPORT_FITNESS: "mixed",
  TELECOMMUNICATIONS: "mixed",
};

/** Resolve the sector for a career (explicit field → category default → "mixed"). */
export function getSectorForCareer(careerId: string): "public" | "private" | "mixed" {
  const career = getCareerById(careerId);
  if (career?.sector) return career.sector;
  const cat = getCategoryForCareer(careerId);
  return (cat && CATEGORY_SECTOR_DEFAULTS[cat]) ?? "mixed";
}

/** Short pension note based on sector. */
export function getPensionNote(sector: "public" | "private" | "mixed"): string {
  switch (sector) {
    case "public":
      return "Public-sector pension (typically 66% of salary from age 67, strong job security)";
    case "private":
      return "Private-sector pension (mandatory 2%+ employer contribution, varies by company)";
    case "mixed":
      return "Pension varies — public employers offer stronger schemes, private varies by company";
  }
}

/**
 * Search careers by text query
 */
export function searchCareers(query: string): Career[] {
  const lowerQuery = query.toLowerCase();
  return getAllCareers().filter(
    (career) =>
      career.title.toLowerCase().includes(lowerQuery) ||
      career.description.toLowerCase().includes(lowerQuery) ||
      career.keySkills.some((skill) => skill.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get entry-level careers (accessible without higher education)
 */
export function getEntryLevelCareers(): Career[] {
  return getAllCareers().filter((career) => career.entryLevel);
}

/**
 * Get careers by growth outlook
 */
export function getCareersByGrowth(outlook: "high" | "medium" | "stable"): Career[] {
  return getAllCareers().filter((career) => career.growthOutlook === outlook);
}

/**
 * Maps JobCategory (micro-jobs) to CareerCategory (career pathways)
 * Used to link job types to related career exploration
 */
export const JOB_TO_CAREER_MAPPING: Record<string, CareerCategory[]> = {
  BABYSITTING: ["EDUCATION_TRAINING", "HEALTHCARE_LIFE_SCIENCES"],
  DOG_WALKING: ["HEALTHCARE_LIFE_SCIENCES", "HOSPITALITY_TOURISM"],
  SNOW_CLEARING: ["MANUFACTURING_ENGINEERING", "LOGISTICS_TRANSPORT"],
  CLEANING: ["HOSPITALITY_TOURISM", "BUSINESS_MANAGEMENT"],
  DIY_HELP: ["MANUFACTURING_ENGINEERING", "LOGISTICS_TRANSPORT"],
  TECH_HELP: ["TECHNOLOGY_IT", "BUSINESS_MANAGEMENT"],
  ERRANDS: ["LOGISTICS_TRANSPORT", "SALES_MARKETING"],
  OTHER: ["BUSINESS_MANAGEMENT", "HOSPITALITY_TOURISM"],
};

/**
 * Get the primary career category for a job category
 */
export function getPrimaryCareerCategory(jobCategory: string): CareerCategory | null {
  const mapping = JOB_TO_CAREER_MAPPING[jobCategory];
  return mapping?.[0] || null;
}

/**
 * Get careers related to a job category (micro-job)
 * Returns careers from all mapped career categories
 */
export function getCareersForJobCategory(jobCategory: string): Career[] {
  const careerCategories = JOB_TO_CAREER_MAPPING[jobCategory] || [];
  const careers: Career[] = [];

  for (const careerCategory of careerCategories) {
    careers.push(...(CAREER_PATHWAYS[careerCategory] || []));
  }

  return careers;
}

/**
 * Get recommended careers based on user's job history categories
 * Maps JobCategory (micro-jobs) to CareerCategory (career pathways)
 */
export function getRecommendedCareers(
  jobCategories: Record<string, number>
): { career: Career; matchScore: number }[] {
  const recommendations: { career: Career; matchScore: number }[] = [];

  for (const [jobCategory, count] of Object.entries(jobCategories)) {
    const relevantCareerCategories = JOB_TO_CAREER_MAPPING[jobCategory] || [];

    for (const careerCategory of relevantCareerCategories) {
      const careers = CAREER_PATHWAYS[careerCategory] || [];
      for (const career of careers) {
        const existingIndex = recommendations.findIndex(
          (r) => r.career.id === career.id
        );
        const score = count * (career.entryLevel ? 1.5 : 1);

        if (existingIndex >= 0) {
          recommendations[existingIndex].matchScore += score;
        } else {
          recommendations.push({ career, matchScore: score });
        }
      }
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get recommended careers based on user's career aspiration text
 * Searches careers by matching the aspiration text against career titles, descriptions, and skills
 */
export function getRecommendationsFromAspiration(
  aspiration: string
): { career: Career; matchScore: number }[] {
  if (!aspiration || !aspiration.trim()) {
    return [];
  }

  const aspirationLower = aspiration.toLowerCase().trim();

  // ── Step 1: find an anchor career ────────────────────────────
  // The aspiration *usually* maps to an existing career in our pathways
  // (e.g. "SAFe Agile Coach"). When it does, that anchor career is the
  // ground truth for category + skill profile, and recommendations
  // become "careers similar to this one" rather than "careers whose
  // title contains a word from the aspiration", which is what produced
  // the "Assistant Coach" / "Football Coach" false positives.
  let anchorCareer: Career | null = null;
  let anchorCategory: CareerCategory | null = null;
  for (const [category, list] of Object.entries(CAREER_PATHWAYS) as [CareerCategory, Career[]][]) {
    const exact = list.find((c) => c.title.toLowerCase() === aspirationLower);
    if (exact) {
      anchorCareer = exact;
      anchorCategory = category;
      break;
    }
  }
  // Fall back to the closest title match if no exact hit (longest
  // shared substring of words).
  if (!anchorCareer) {
    const aspirationTokens = new Set(
      aspirationLower.split(/\s+/).filter((w) => w.length > 2)
    );
    let bestOverlap = 0;
    for (const [category, list] of Object.entries(CAREER_PATHWAYS) as [CareerCategory, Career[]][]) {
      for (const c of list) {
        const titleTokens = c.title.toLowerCase().split(/\s+/);
        const overlap = titleTokens.filter((t) => aspirationTokens.has(t)).length;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          anchorCareer = c;
          anchorCategory = category;
        }
      }
    }
    if (bestOverlap === 0) {
      anchorCareer = null;
      anchorCategory = null;
    }
  }

  // ── Step 2: build a profile to match against ─────────────────
  // When we have an anchor we use *its* skill set as the truth.
  // Otherwise we fall back to keywords pulled from the raw aspiration.
  const commonWords = new Set([
    "i", "want", "to", "be", "a", "an", "the", "become", "work", "as",
    "in", "with", "for", "and", "or", "my", "is", "am", "like", "would",
    "love", "interested", "career", "job", "profession", "future", "dream",
  ]);
  const aspirationWords = aspirationLower
    .split(/\s+/)
    .filter((w) => w.length > 2 && !commonWords.has(w));

  const profileSkills = new Set(
    (anchorCareer?.keySkills ?? []).map((s) => s.toLowerCase())
  );

  // ── Step 3: score every other career ─────────────────────────
  const recommendations: { career: Career; matchScore: number }[] = [];

  for (const [category, list] of Object.entries(CAREER_PATHWAYS) as [CareerCategory, Career[]][]) {
    for (const career of list) {
      // Don't recommend the user's own goal back to them.
      if (anchorCareer && career.id === anchorCareer.id) continue;

      let score = 0;
      const titleLower = career.title.toLowerCase();
      const skillsLower = career.keySkills.map((s) => s.toLowerCase());

      if (anchorCareer && anchorCategory) {
        // Same category is the dominant signal — different category
        // careers need a *very* strong skill overlap to qualify.
        const sameCategory = category === anchorCategory;
        if (sameCategory) score += 40;

        // Skill overlap with the anchor (Jaccard-ish — each shared
        // skill is worth a lot, partial substring matches less).
        let exactSkillHits = 0;
        let partialSkillHits = 0;
        for (const s of skillsLower) {
          if (profileSkills.has(s)) {
            exactSkillHits++;
          } else if ([...profileSkills].some((p) => p.includes(s) || s.includes(p))) {
            partialSkillHits++;
          }
        }
        score += exactSkillHits * 18 + partialSkillHits * 6;

        // Cross-category careers must have at least one real skill
        // overlap, otherwise they're just noise.
        if (!sameCategory && exactSkillHits + partialSkillHits === 0) {
          continue;
        }

        // A small bonus when the title shares a meaningful word with
        // the anchor — but only if we're already in the same category,
        // so "coach" doesn't drag in unrelated coaching titles.
        if (sameCategory) {
          const anchorTitleTokens = anchorCareer.title
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2 && !commonWords.has(w));
          const titleOverlap = anchorTitleTokens.filter((t) => titleLower.includes(t)).length;
          score += titleOverlap * 8;
        }
      } else {
        // No anchor — best-effort keyword match (legacy behaviour,
        // tightened so isolated word hits don't dominate).
        for (const word of aspirationWords) {
          if (titleLower.split(/\s+/).includes(word)) score += 25;
          if (skillsLower.some((s) => s === word)) score += 15;
        }
        if (score === 0) continue;
      }

      if (career.entryLevel) score *= 1.05;

      if (score > 0) {
        recommendations.push({ career, matchScore: score });
      }
    }
  }

  // Normalise to 0–100 so the gauge in the UI is meaningful regardless
  // of which anchor produced the list.
  if (recommendations.length > 0) {
    const max = Math.max(...recommendations.map((r) => r.matchScore));
    if (max > 0) {
      for (const r of recommendations) {
        r.matchScore = Math.round((r.matchScore / max) * 100);
      }
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Parse a salary string like "350,000 - 450,000 kr/year" into a midpoint number.
 * Returns 0 if it can't be parsed.
 */
function parseSalaryMidpoint(salary: string): number {
  const numbers = salary.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return 0;
  const parsed = numbers.slice(0, 2).map((n) => parseInt(n.replace(/,/g, ""), 10));
  if (parsed.length === 0) return 0;
  if (parsed.length === 1) return parsed[0];
  return (parsed[0] + parsed[1]) / 2;
}

/**
 * Find the CareerCategory a given career belongs to.
 */
export function findCareerCategory(careerId: string): CareerCategory | null {
  for (const [category, careers] of Object.entries(CAREER_PATHWAYS) as [
    CareerCategory,
    Career[]
  ][]) {
    if (careers.some((c) => c.id === careerId)) return category;
  }
  return null;
}

/**
 * Get niche-but-accessible careers related to a given career.
 *
 * Surfaces overlooked roles in the same field by:
 * - sharing at least one keySkill with the source career
 * - boosting entry-level careers (vocational paths)
 * - boosting careers with lower salary midpoints (less prestige bias)
 *
 * Used to fight prestige bias on every career page: a kid looking at "Doctor"
 * sees Paramedic, Helsefagarbeider, etc. as legitimate adjacent paths.
 */
export function getRelatedNicheCareers(career: Career, limit = 3): Career[] {
  const category = findCareerCategory(career.id);
  if (!category) return [];

  const sourceMid = parseSalaryMidpoint(career.avgSalary);
  const sourceSkills = new Set(career.keySkills.map((s) => s.toLowerCase()));

  const candidates = (CAREER_PATHWAYS[category] || [])
    .filter((c) => c.id !== career.id)
    .map((c) => {
      const overlap = c.keySkills.filter((s) =>
        sourceSkills.has(s.toLowerCase())
      ).length;
      const candidateMid = parseSalaryMidpoint(c.avgSalary);
      // Lower-paid candidates score higher (anti-prestige weighting)
      const salaryBonus = sourceMid > 0 && candidateMid > 0 && candidateMid < sourceMid ? 1.5 : 1;
      const entryBonus = c.entryLevel ? 2 : 1;
      const score = (overlap + 0.5) * entryBonus * salaryBonus;
      return { career: c, score, overlap };
    })
    // Require either skill overlap OR entry-level status — keeps it relevant
    .filter((x) => x.overlap > 0 || x.career.entryLevel)
    .sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map((x) => x.career);
}

/**
 * Discovery preferences captured during onboarding/profile.
 * All fields optional — the user can fill in as much or as little as they want.
 */
export interface DiscoveryPreferences {
  subjects?: string[];   // School subjects they enjoy
  starredSubjects?: string[]; // Subjects the user has emphasised (double-clicked)
  workStyles?: string[]; // hands-on, desk, outdoors, mixed, creative
  peoplePref?: string;   // with-people, mixed, mostly-alone
  interests?: string[];  // Free-form interest tags
}

// Category-level defaults for the work setting most careers in that
// category gravitate towards. Per-career overrides below catch the obvious
// exceptions. This is intentionally pragmatic, not exhaustive.
const WORK_SETTING_DEFAULTS: Record<CareerCategory, WorkSetting> = {
  HEALTHCARE_LIFE_SCIENCES: "hands-on",
  EDUCATION_TRAINING: "hands-on",
  TECHNOLOGY_IT: "desk",
  BUSINESS_MANAGEMENT: "desk",
  FINANCE_BANKING: "desk",
  SALES_MARKETING: "desk",
  MANUFACTURING_ENGINEERING: "hands-on",
  LOGISTICS_TRANSPORT: "hands-on",
  HOSPITALITY_TOURISM: "hands-on",
  TELECOMMUNICATIONS: "mixed",
  CREATIVE_MEDIA: "creative",
  PUBLIC_SERVICE_SAFETY: "mixed",
  MILITARY_DEFENCE: "hands-on",
  SPORT_FITNESS: "hands-on",
  REAL_ESTATE_PROPERTY: "mixed",
  SOCIAL_CARE_COMMUNITY: "hands-on",
  CONSTRUCTION_TRADES: "hands-on",
};

const PEOPLE_INTENSITY_DEFAULTS: Record<CareerCategory, PeopleIntensity> = {
  HEALTHCARE_LIFE_SCIENCES: "high",
  EDUCATION_TRAINING: "high",
  TECHNOLOGY_IT: "medium",
  BUSINESS_MANAGEMENT: "high",
  FINANCE_BANKING: "medium",
  SALES_MARKETING: "high",
  MANUFACTURING_ENGINEERING: "medium",
  LOGISTICS_TRANSPORT: "medium",
  HOSPITALITY_TOURISM: "high",
  TELECOMMUNICATIONS: "medium",
  CREATIVE_MEDIA: "medium",
  PUBLIC_SERVICE_SAFETY: "high",
  MILITARY_DEFENCE: "high",
  SPORT_FITNESS: "high",
  REAL_ESTATE_PROPERTY: "high",
  SOCIAL_CARE_COMMUNITY: "high",
  CONSTRUCTION_TRADES: "medium",
};

// Per-career overrides where the category default is wrong.
// Keep this list small and only add entries that the radar visibly mis-handles.
const WORK_SETTING_OVERRIDES: Record<string, WorkSetting> = {
  // Tech that is genuinely creative
  "ux-designer": "creative",
  "frontend-developer": "creative",
  "game-developer": "creative",
  // Marketing that is creative not desk
  "graphic-designer": "creative",
  // Engineering / labs that are mostly desk-bound
  "data-scientist": "desk",
  "quantitative-analyst": "desk",
  "quant-developer": "desk",
  // Outdoors-heavy
  "park-ranger": "outdoors",
  "marine-biologist": "outdoors",
  "construction-worker": "outdoors",
  "farmer": "outdoors",
  "geologist": "outdoors",
  // Healthcare research that's lab/desk-leaning
  "biomedical-scientist": "mixed",
  "epidemiologist": "desk",
  "researcher": "desk",
};

const PEOPLE_INTENSITY_OVERRIDES: Record<string, PeopleIntensity> = {
  // Solo/low-people tech roles
  "machine-learning-engineer": "low",
  "data-scientist": "low",
  "backend-developer": "low",
  "quantitative-analyst": "low",
  "quant-developer": "low",
  "researcher": "low",
  // High-people tech roles
  "scrum-master": "high",
  "product-manager-tech": "high",
  "agile-coach": "high",
  "ai-product-manager": "high",
  "it-support": "high",
  // Solo creative
  "writer": "low",
  "translator": "low",
};

export function getCareerWorkSetting(career: Career): WorkSetting {
  if (career.workSetting) return career.workSetting;
  if (WORK_SETTING_OVERRIDES[career.id]) return WORK_SETTING_OVERRIDES[career.id];
  const cat = findCareerCategory(career.id);
  return cat ? WORK_SETTING_DEFAULTS[cat] : "mixed";
}

export function getCareerPeopleIntensity(career: Career): PeopleIntensity {
  if (career.peopleIntensity) return career.peopleIntensity;
  if (PEOPLE_INTENSITY_OVERRIDES[career.id]) return PEOPLE_INTENSITY_OVERRIDES[career.id];
  const cat = findCareerCategory(career.id);
  return cat ? PEOPLE_INTENSITY_DEFAULTS[cat] : "medium";
}

// Subject → career category weights.
//
// Tuning rules (audit notes — see RADAR_TUNING below for the live constants):
//
//   • Strongest single weight is capped at 4 to prevent any one subject
//     from steamrolling the radar. Previously `computing → TECHNOLOGY_IT`
//     was 6, which alone gave Tech a per-category cap ~2× the next bucket
//     and produced the "tech bias" the user reported.
//
//   • Each subject must spread weight across ≥2 categories so no subject
//     becomes a single-category fast-pass. Computing now meaningfully
//     distributes between Tech, Telecom, and Manufacturing (robotics, CAM).
//
//   • Sum-of-weights per subject is roughly normalised (target ~6–8) so
//     different subjects contribute comparable raw scoring power. The
//     audit found that prior to normalisation, computing handed out
//     9 total points while music handed out 4 — that's a 2.25× advantage
//     to anyone picking computing, before any boost lists kicked in.
const SUBJECT_CATEGORY_WEIGHTS: Record<string, Partial<Record<CareerCategory, number>>> = {
  biology:      { HEALTHCARE_LIFE_SCIENCES: 4, SOCIAL_CARE_COMMUNITY: 1, MANUFACTURING_ENGINEERING: 1, SPORT_FITNESS: 1 },
  chemistry:    { HEALTHCARE_LIFE_SCIENCES: 3, MANUFACTURING_ENGINEERING: 2 },
  physics:      { MANUFACTURING_ENGINEERING: 4, TECHNOLOGY_IT: 2, TELECOMMUNICATIONS: 2, MILITARY_DEFENCE: 1 },
  math:         { FINANCE_BANKING: 4, TECHNOLOGY_IT: 2, MANUFACTURING_ENGINEERING: 2, MILITARY_DEFENCE: 1 },
  // Computing weight reduced from 6 → 4. The cap-bypass boost list still
  // surfaces curated tech careers, but the raw category lift is now in
  // line with every other subject. Telecom kept at 2 (not 3) because
  // most telecom careers also benefit from the boost list.
  computing:    { TECHNOLOGY_IT: 4, TELECOMMUNICATIONS: 2, MANUFACTURING_ENGINEERING: 1, MILITARY_DEFENCE: 1 },
  english:      { EDUCATION_TRAINING: 2, CREATIVE_MEDIA: 3, SALES_MARKETING: 2, BUSINESS_MANAGEMENT: 1 },
  history:      { EDUCATION_TRAINING: 3, PUBLIC_SERVICE_SAFETY: 2, BUSINESS_MANAGEMENT: 1, MILITARY_DEFENCE: 2 },
  geography:    { LOGISTICS_TRANSPORT: 3, HOSPITALITY_TOURISM: 2, PUBLIC_SERVICE_SAFETY: 2, MILITARY_DEFENCE: 1 },
  art:          { CREATIVE_MEDIA: 4, HOSPITALITY_TOURISM: 1, SALES_MARKETING: 2 },
  music:        { CREATIVE_MEDIA: 4, EDUCATION_TRAINING: 2 },
  pe:           { SPORT_FITNESS: 4, HEALTHCARE_LIFE_SCIENCES: 2, EDUCATION_TRAINING: 1, PUBLIC_SERVICE_SAFETY: 1, MILITARY_DEFENCE: 3 },
  business:     { BUSINESS_MANAGEMENT: 3, FINANCE_BANKING: 3, SALES_MARKETING: 2 },
  languages:    { HOSPITALITY_TOURISM: 3, EDUCATION_TRAINING: 2, BUSINESS_MANAGEMENT: 1, PUBLIC_SERVICE_SAFETY: 1, MILITARY_DEFENCE: 1 },
  psychology:   { HEALTHCARE_LIFE_SCIENCES: 3, SOCIAL_CARE_COMMUNITY: 3, EDUCATION_TRAINING: 1, PUBLIC_SERVICE_SAFETY: 1 },
  // The school subject "Design & Technology" is really two distinct things
  // glued together: a design/digital stream (CAD, product design, graphics)
  // and a workshop/making stream (woodwork, metalwork, electronics). The
  // discovery quiz now offers them separately so users get the right careers.
  "design-tech":      { CREATIVE_MEDIA: 4, TECHNOLOGY_IT: 1, HOSPITALITY_TOURISM: 1 },
  "workshop-making":  { MANUFACTURING_ENGINEERING: 4, CONSTRUCTION_TRADES: 3, HOSPITALITY_TOURISM: 1 },
  "health-social": { HEALTHCARE_LIFE_SCIENCES: 3, SOCIAL_CARE_COMMUNITY: 4, EDUCATION_TRAINING: 1, PUBLIC_SERVICE_SAFETY: 2 },
  drama:           { CREATIVE_MEDIA: 4, HOSPITALITY_TOURISM: 1, EDUCATION_TRAINING: 1, SALES_MARKETING: 1 },
  // Food Tech is a four-band subject — cooking craft (Hospitality),
  // food science / nutrition (Healthcare), industrial brewing & food
  // production (Manufacturing), and food media / styling (Creative).
  "food-tech":     { HOSPITALITY_TOURISM: 4, HEALTHCARE_LIFE_SCIENCES: 2, MANUFACTURING_ENGINEERING: 2, CREATIVE_MEDIA: 1 },
  "media-studies": { CREATIVE_MEDIA: 4, SALES_MARKETING: 2, TECHNOLOGY_IT: 1 },
};

// ──────────────────────────────────────────────────────────────────────
// Per-career subject boosts
// ──────────────────────────────────────────────────────────────────────
// Some subjects map to specific careers across multiple categories. Music,
// for example, includes Musicians (CREATIVE_MEDIA), Music Teachers
// (EDUCATION_TRAINING), Music Therapists (HEALTHCARE), etc. — and the user
// expects ALL of those when they pick "music", not whatever five careers
// the per-category cap happens to surface.
//
// Careers listed here get a large explicit score boost when their subject
// is selected, AND they bypass the per-category cap entirely. The result:
// pick "music" and you see every music career, regardless of which broad
// category they sit in.
//
// Add subjects to this map only when you have a curated list of careers
// that genuinely belong. Generic subjects (math, english) should still
// rely on category weighting because there's no clean career list for them.
const SUBJECT_CAREER_BOOSTS: Record<string, string[]> = {
  computing: [
    // Core software & web
    "software-developer", "frontend-developer", "backend-developer",
    "full-stack-engineer", "mobile-developer", "game-developer",
    // Data & AI
    "data-analyst", "data-scientist", "data-engineer",
    "machine-learning-engineer", "ai-engineer", "ai-researcher",
    "computer-vision-engineer", "nlp-engineer",
    // Infra & ops
    "devops-engineer", "cloud-engineer", "site-reliability-engineer",
    "systems-engineer", "network-engineer", "platform-engineer",
    // Security
    "cybersecurity-analyst", "security-engineer", "security-architect",
    // Design / product / QA
    "ux-designer", "ui-designer", "qa-engineer", "test-automation-engineer",
    // Support / entry level
    "it-support-specialist", "database-administrator",
    // Emerging
    "blockchain-developer", "ar-vr-developer", "robotics-engineer",
  ],
  music: [
    // Playing & performance
    "musician", "vocalist", "dj", "session-musician", "orchestra-member", "busker",
    // Learning & teaching
    "music-teacher", "private-music-tutor", "music-lecturer", "vocal-coach", "music-therapist",
    // Making & production
    "music-producer", "songwriter", "composer", "audio-engineer", "beatmaker",
    "film-composer", "game-composer", "sound-engineer",
    // Industry & supporting
    "music-manager", "talent-agent", "ar-rep", "music-promoter", "tour-manager",
    "sound-technician", "music-journalist", "music-content-creator",
    "music-licensing-specialist",
  ],
  "food-tech": [
    // Cooking & hospitality
    "chef", "pastry-chef", "baker", "butcher", "barista", "sommelier",
    "catering-manager", "restaurant-manager", "restaurant-owner",
    "kitchen-porter", "fast-food-crew",
    // Food science & technology
    "food-scientist", "food-technologist", "food-product-developer",
    "food-safety-inspector", "quality-assurance-food",
    // Nutrition & health
    "dietitian", "nutritionist", "sports-nutritionist",
    // Production & craft
    "brewer",
    // Food media
    "food-blogger",
  ],
};

// ──────────────────────────────────────────────────────────────────────
// Radar tuning constants
// ──────────────────────────────────────────────────────────────────────
//
// All scoring multipliers, penalties, and thresholds live here so the
// ranking model can be tuned without diving into the scoring function.
// Every multi-line block in `scoreCareerForPreferences` references one
// of these — change a value here, see the radar shift everywhere.
export const RADAR_TUNING = {
  // ── Positive matching ─────────────────────────────────────────
  /** Bonus when this career sits in a category targeted by a picked subject. */
  subjectCategoryWeightMultiplier: 1.0,
  /** Multiplier applied to a starred (double-clicked) subject. */
  starredSubjectMultiplier: 2.5,
  /** Bonus for a career being on a curated subject boost list. */
  explicitBoostBonus: 6,
  /** Bonus per matching work-style. */
  workStyleMatchBonus: 3,
  /** Bonus when people-preference matches the career's people-intensity. */
  peoplePrefMatchBonus: 2,
  /** Bonus per matching free-form interest term. */
  interestMatchBonus: 1,
  /** Precision reward — bonus when a career matches multiple distinct attribute groups (subject + workstyle + people). */
  precisionRewardPerExtraGroup: 1.5,

  // ── Contradiction penalties (NEW — none existed before) ──────
  /** Penalty when a chosen work-style strongly contradicts the career setting
   *  (e.g. user picks Desk, career is Hands-on). Set high enough to push
   *  contradicted careers below the score floor so they don't appear at all. */
  workStyleContradictionPenalty: 50,
  /** Penalty when people-preference contradicts the career's intensity (e.g. user picks Mostly alone, career is High people). */
  peoplePrefContradictionPenalty: 3,

  // ── Broad-role / specificity controls ────────────────────────
  /** Penalty applied to careers that score on too many different signals weakly without any strong (≥3) match. Discourages "matches a bit of everything" results. */
  broadRolePenalty: 2,
  /** Threshold above which a single subject→category weight counts as a "strong" match for the broad-role check. */
  strongMatchThreshold: 3,

  // ── Score floor & cap controls ───────────────────────────────
  /** Minimum total score for a career to even appear on the radar. Raised from 1 → 3 so a single weak signal isn't enough. */
  scoreFloor: 3,
  /** Per-category cap base. The cap formula = clamp(base + round(catScore × scale), min, max). */
  perCategoryCapBase: 2,
  perCategoryCapScale: 0.6,
  perCategoryCapMin: 2,
  perCategoryCapMax: 10,

  // ── Post-score concentration guardrail ───────────────────────
  /** Maximum share of the top-30 results that any one category may occupy. If a category exceeds this share, low-precision results from it are demoted into the long tail. */
  maxCategoryShareInTopBands: 0.35,
  /** Number of slots considered the "top bands" for the concentration check (matches Strong + Good band sizes). */
  topBandSize: 30,
} as const;

/** Legacy constant kept for back-compat readers; the live floor is in RADAR_TUNING. */
const RADAR_SCORE_FLOOR = RADAR_TUNING.scoreFloor;

// Human-readable labels — kept here so getMatchReasons can name things
// without forcing every caller to maintain its own label map.
const SUBJECT_DISPLAY_LABEL: Record<string, string> = {
  biology: "Biology", chemistry: "Chemistry", physics: "Physics",
  math: "Math", computing: "Computing", english: "English",
  history: "History", geography: "Geography", art: "Art",
  music: "Music", pe: "PE", business: "Business",
  languages: "Languages", psychology: "Psychology",
  "design-tech": "Design & Tech", "workshop-making": "Workshop & Making",
  "health-social": "Health & Social",
  drama: "Drama", "food-tech": "Food Tech", "media-studies": "Media Studies",
};

const WORK_STYLE_DISPLAY_LABEL: Record<string, string> = {
  "hands-on": "Hands-on", desk: "At a desk", outdoors: "Outdoors",
  creative: "Creative", mixed: "A mix",
};

const PEOPLE_DISPLAY_LABEL: Record<string, string> = {
  "with-people": "With people", mixed: "A bit of both", "mostly-alone": "Mostly alone",
};

/**
 * Explain why a career landed on the radar for these preferences.
 *
 * Returns a small list of human-readable reasons — subjects that pointed
 * at this career's category, the work style match, and the people-pref
 * match. Used by the radar tooltip ("Why this match?") to close the loop
 * between the user's discovery answers and what they see.
 */
export function getMatchReasons(
  career: Career,
  prefs: DiscoveryPreferences | null | undefined,
): string[] {
  if (!prefs) return [];
  const reasons: string[] = [];
  const cat = findCareerCategory(career.id);

  // Subjects: pick subjects whose weights mention this career's category
  if (cat && prefs.subjects?.length) {
    for (const subj of prefs.subjects) {
      const weights = SUBJECT_CATEGORY_WEIGHTS[subj.toLowerCase()];
      if (weights && (weights[cat] ?? 0) > 0) {
        reasons.push(SUBJECT_DISPLAY_LABEL[subj] || subj);
      }
    }
  }

  // Work style: include the chosen styles that match this career's setting
  if (prefs.workStyles?.length) {
    const setting = getCareerWorkSetting(career);
    for (const style of prefs.workStyles) {
      if (style === "mixed" || setting === "mixed" || style === setting) {
        reasons.push(WORK_STYLE_DISPLAY_LABEL[style] || style);
      }
    }
  }

  // People preference
  if (prefs.peoplePref) {
    const intensity = getCareerPeopleIntensity(career);
    const matches =
      prefs.peoplePref === "mixed" ||
      (prefs.peoplePref === "with-people" && (intensity === "high" || intensity === "medium")) ||
      (prefs.peoplePref === "mostly-alone" && (intensity === "low" || intensity === "medium"));
    if (matches) {
      reasons.push(PEOPLE_DISPLAY_LABEL[prefs.peoplePref] || prefs.peoplePref);
    }
  }

  return reasons;
}

/**
 * Does a career's work setting satisfy the user's chosen work styles?
 * Hard filter — if the user picked styles, the career must match at least one.
 * "mixed" on either side acts as a wildcard.
 */
function passesWorkStyleFilter(_career: Career, _chosenStyles: string[]): boolean {
  // Work style is now a SOFT scoring signal, not a hard filter — see
  // getCareersFromDiscovery. Picking "Outdoors" alone used to wipe out
  // ~95% of the catalogue and produced radars with only 4–6 dots; now
  // it just boosts matching careers in the score stage.
  return true;
}

/**
 * Does a career's people-intensity satisfy the user's people preference?
 * Hard filter:
 *   "with-people" → require high or medium
 *   "mostly-alone" → require low or medium
 *   "mixed" or unset → no filter
 */
function passesPeopleFilter(_career: Career, _peoplePref?: string): boolean {
  // Soft signal — see scoring stage in getCareersFromDiscovery.
  return true;
}

// ──────────────────────────────────────────────────────────────────────
// Career scoring engine
// ──────────────────────────────────────────────────────────────────────
//
// This is the heart of CareerRadar's matching. It takes a single career
// and a user's preferences and returns a structured breakdown of the
// score so we can rank, debug, and explain results.
//
// Design principles (audit-driven):
//
//   1. Positive matches add points proportionally to weight × multiplier.
//   2. Contradictions SUBTRACT points (the previous engine had no
//      negative signals — desk-bound careers scored the same whether
//      the user said "outdoors" or "desk").
//   3. Multi-group matches earn a precision bonus so a career matching
//      subject AND work-style AND people-pref outranks one matching
//      three subjects weakly.
//   4. A broad-role penalty discourages "scores a bit of everything"
//      careers from drifting up the rankings.
//   5. Returns the breakdown by reference so debugScoreCareer() and
//      getCareersFromDiscovery() can both use the same logic.

export interface ScoreBreakdown {
  /** Final score after positives, penalties, and adjustments. */
  total: number;
  /** Raw signal contributions (before precision/broad-role adjustments). */
  positives: { source: string; value: number }[];
  /** Penalty contributions (negative numbers). */
  penalties: { source: string; value: number }[];
  /** Number of distinct attribute groups (subjects, workstyle, people, interests, boost) the career matched. */
  groupsMatched: number;
  /** True if this career sits on a curated subject boost list. */
  isExplicitlyBoosted: boolean;
  /** Strongest single positive contribution — used by the broad-role check. */
  strongestSignal: number;
}

function scoreCareerForPreferences(
  career: Career,
  prefs: DiscoveryPreferences,
  precomputed: {
    subjectCategoryScores: Partial<Record<CareerCategory, number>>;
    subjectsByCareer: Map<string, string[]>;
    boostedIds: Set<string>;
  },
): ScoreBreakdown {
  const T = RADAR_TUNING;
  const breakdown: ScoreBreakdown = {
    total: 0,
    positives: [],
    penalties: [],
    groupsMatched: 0,
    isExplicitlyBoosted: false,
    strongestSignal: 0,
  };

  const cat = findCareerCategory(career.id);

  // ── 1. Subject → category match ─────────────────────────────────
  if (cat && precomputed.subjectCategoryScores[cat]) {
    const v = precomputed.subjectCategoryScores[cat]! * T.subjectCategoryWeightMultiplier;
    breakdown.positives.push({ source: 'subject-category', value: v });
    breakdown.total += v;
    breakdown.groupsMatched++;
    if (v > breakdown.strongestSignal) breakdown.strongestSignal = v;
  }

  // ── 2. Explicit boost list ──────────────────────────────────────
  if (precomputed.boostedIds.has(career.id)) {
    breakdown.isExplicitlyBoosted = true;
    breakdown.positives.push({ source: 'explicit-boost', value: T.explicitBoostBonus });
    breakdown.total += T.explicitBoostBonus;
    breakdown.groupsMatched++;
    if (T.explicitBoostBonus > breakdown.strongestSignal) {
      breakdown.strongestSignal = T.explicitBoostBonus;
    }
  }

  // ── 3. Work-style match / contradiction ─────────────────────────
  const chosenStyles = prefs.workStyles || [];
  if (chosenStyles.length > 0 && !chosenStyles.includes('mixed')) {
    const setting = getCareerWorkSetting(career);
    if (setting === 'mixed' || chosenStyles.includes(setting)) {
      breakdown.positives.push({ source: 'work-style', value: T.workStyleMatchBonus });
      breakdown.total += T.workStyleMatchBonus;
      breakdown.groupsMatched++;
      if (T.workStyleMatchBonus > breakdown.strongestSignal) {
        breakdown.strongestSignal = T.workStyleMatchBonus;
      }
    } else if (isWorkStyleContradiction(chosenStyles, setting)) {
      // ❗ Contradiction penalty — previously zero. This is the single
      //    biggest fix for the tech bias: a desk-bound tech career now
      //    actively LOSES points when the user picks Outdoors.
      breakdown.penalties.push({
        source: `work-style-contradiction (${setting})`,
        value: -T.workStyleContradictionPenalty,
      });
      breakdown.total -= T.workStyleContradictionPenalty;
    }
  }

  // ── 4. People-preference match / contradiction ──────────────────
  if (prefs.peoplePref && prefs.peoplePref !== 'mixed') {
    const intensity = getCareerPeopleIntensity(career);
    const wantsPeople = prefs.peoplePref === 'with-people';
    const wantsAlone = prefs.peoplePref === 'mostly-alone';
    const matches =
      (wantsPeople && (intensity === 'high' || intensity === 'medium')) ||
      (wantsAlone && (intensity === 'low' || intensity === 'medium'));
    if (matches) {
      breakdown.positives.push({ source: 'people-pref', value: T.peoplePrefMatchBonus });
      breakdown.total += T.peoplePrefMatchBonus;
      breakdown.groupsMatched++;
    } else {
      // ❗ Contradiction penalty
      const isContradiction =
        (wantsPeople && intensity === 'low') ||
        (wantsAlone && intensity === 'high');
      if (isContradiction) {
        breakdown.penalties.push({
          source: `people-pref-contradiction (${intensity})`,
          value: -T.peoplePrefContradictionPenalty,
        });
        breakdown.total -= T.peoplePrefContradictionPenalty;
      }
    }
  }

  // ── 5. Free-form interest matches ───────────────────────────────
  let interestHits = 0;
  for (const interest of prefs.interests || []) {
    const i = interest.toLowerCase();
    if (
      career.title.toLowerCase().includes(i) ||
      career.keySkills.some((s) => s.toLowerCase().includes(i))
    ) {
      interestHits++;
    }
  }
  if (interestHits > 0) {
    const v = interestHits * T.interestMatchBonus;
    breakdown.positives.push({ source: `interests (${interestHits})`, value: v });
    breakdown.total += v;
    breakdown.groupsMatched++;
  }

  // ── 6. Precision reward ─────────────────────────────────────────
  // A career matching multiple distinct attribute groups (subject + style +
  // people, say) feels more "right" than a career that matches only by
  // having a high subject weight. Reward the integration.
  if (breakdown.groupsMatched >= 2) {
    const reward = (breakdown.groupsMatched - 1) * T.precisionRewardPerExtraGroup;
    breakdown.positives.push({ source: 'precision', value: reward });
    breakdown.total += reward;
  }

  // ── 7. Broad-role penalty ───────────────────────────────────────
  // If the only thing this career has going for it is a weak (<3) subject
  // tag — no work-style match, no people-pref match, no strong signal —
  // it's a broad/generic match and shouldn't outrank a precise one.
  // Boosted careers are exempt because they're explicitly curated.
  if (
    !breakdown.isExplicitlyBoosted &&
    breakdown.strongestSignal < T.strongMatchThreshold &&
    breakdown.groupsMatched <= 1
  ) {
    breakdown.penalties.push({ source: 'broad-role', value: -T.broadRolePenalty });
    breakdown.total -= T.broadRolePenalty;
  }

  return breakdown;
}

/**
 * Decide whether a chosen work-style is in genuine conflict with a
 * career's setting. "mixed" never contradicts; everything else maps
 * via this table.
 */
function isWorkStyleContradiction(
  chosenStyles: string[],
  careerSetting: WorkSetting,
): boolean {
  // Pairs that ARE genuine opposites (chosen → career setting that conflicts).
  // Anything not in this map is treated as merely "no match" (no penalty).
  const CONTRADICTIONS: Record<string, WorkSetting[]> = {
    'outdoors': ['desk'],
    'desk': ['outdoors', 'hands-on'],
    'hands-on': ['desk'],
    'creative': [], // creative doesn't strongly contradict anything
  };

  // Penalty applies only if EVERY style the user chose contradicts.
  // If they picked "outdoors AND a mix" we don't penalise desk roles.
  return chosenStyles.every((style) => {
    const conflicts = CONTRADICTIONS[style];
    return conflicts ? conflicts.includes(careerSetting) : false;
  });
}

/**
 * Public debug helper. Pass a career and preferences, get a structured
 * breakdown of why it scored the way it did. Used by tests and (one day)
 * a "Why this match?" inspector in dev builds.
 */
export function debugScoreCareer(
  career: Career,
  prefs: DiscoveryPreferences,
): ScoreBreakdown {
  const precomputed = precomputeScoring(prefs);
  return scoreCareerForPreferences(career, prefs, precomputed);
}

function precomputeScoring(prefs: DiscoveryPreferences) {
  const T = RADAR_TUNING;
  const starredSet = new Set((prefs.starredSubjects || []).map((s) => s.toLowerCase()));
  const subjectMult = (subj: string) => (starredSet.has(subj.toLowerCase()) ? T.starredSubjectMultiplier : 1);

  const subjectCategoryScores: Partial<Record<CareerCategory, number>> = {};
  for (const subj of prefs.subjects || []) {
    const weights = SUBJECT_CATEGORY_WEIGHTS[subj.toLowerCase()];
    if (!weights) continue;
    const mult = subjectMult(subj);
    for (const [cat, w] of Object.entries(weights) as [CareerCategory, number][]) {
      subjectCategoryScores[cat] = (subjectCategoryScores[cat] || 0) + w * mult;
    }
  }

  const boostedIds = new Set<string>();
  for (const subj of prefs.subjects || []) {
    const ids = SUBJECT_CAREER_BOOSTS[subj.toLowerCase()];
    if (!ids) continue;
    for (const id of ids) boostedIds.add(id);
  }

  return { subjectCategoryScores, subjectsByCareer: new Map<string, string[]>(), boostedIds };
}

/**
 * Get careers that match a user's discovery preferences.
 *
 * Refactored pipeline (2026-04-11):
 *   1. Score every career via `scoreCareerForPreferences` — positive
 *      matches AND contradiction penalties, with a precision reward
 *      and a broad-role penalty.
 *   2. Filter to careers above the score floor.
 *   3. Apply a per-category cap that scales softly with the category's
 *      raw subject score (no longer hard-tied to one subject's weight).
 *   4. Run a category-concentration guardrail: any single category that
 *      claims more than `maxCategoryShareInTopBands` of the top slots
 *      has its weakest non-boosted entries demoted.
 *   5. Interleave vocational and university paths so entry-level
 *      careers stay visible.
 *
 * Returns careers in final ranked order. The radar takes the first N
 * for its visible band.
 */
/**
 * Measure how many distinct preference dimensions the user has provided.
 * 0 = nothing, 1 = weak (one dimension), 2 = moderate, 3 = strong.
 */
export function measureSignalStrength(prefs: DiscoveryPreferences | null | undefined): number {
  if (!prefs) return 0;
  let dims = 0;
  if (prefs.subjects && prefs.subjects.length >= 2) dims++;
  else if (prefs.subjects && prefs.subjects.length === 1) dims += 0.5;
  if (prefs.workStyles && prefs.workStyles.length > 0) dims++;
  if (prefs.peoplePref) dims++;
  return dims;
}

/** Parse the first number from a salary string (in thousands). */
function salaryMidpoint(salary: string): number {
  const nums = salary.match(/[\d,]+/g);
  if (!nums || nums.length === 0) return 500; // default mid-range
  const parsed = nums.map(n => parseInt(n.replace(/,/g, ''), 10) / 1000);
  // Use the average of min and max
  return parsed.length >= 2 ? (parsed[0] + parsed[1]) / 2 : parsed[0];
}

export function getCareersFromDiscovery(
  prefs: DiscoveryPreferences,
  limit = 80,
): Career[] {
  const T = RADAR_TUNING;
  const all = getAllCareers();
  if (!all.length) return [];

  const hasScoreableInputs =
    (prefs.subjects && prefs.subjects.length > 0) ||
    (prefs.interests && prefs.interests.length > 0) ||
    (prefs.workStyles && prefs.workStyles.length > 0) ||
    !!prefs.peoplePref;

  if (!hasScoreableInputs) {
    return []; // No signal at all — radar stays empty
  }

  const signalStrength = measureSignalStrength(prefs);

  // ── Stage 1: score every career ─────────────────────────────────
  const precomputed = precomputeScoring(prefs);
  const scored = all.map((career) => ({
    career,
    breakdown: scoreCareerForPreferences(career, prefs, precomputed),
  }));

  // ── Stage 2: filter by floor + sort by score ────────────────────
  const matched = scored
    .filter((s) => s.breakdown.total >= T.scoreFloor || s.breakdown.isExplicitlyBoosted)
    .sort((a, b) => b.breakdown.total - a.breakdown.total);

  if (matched.length === 0) return [];

  // ── Stage 3: per-category cap ───────────────────────────────────
  // Soft cap: scales with how well the category is supported by the
  // user's subjects, but never explodes for a single high-weight subject.
  const capForCategory = (cat: CareerCategory): number => {
    const catScore = precomputed.subjectCategoryScores[cat] || 0;
    if (catScore <= 0) return T.perCategoryCapMin;
    const raw = T.perCategoryCapBase + Math.round(catScore * T.perCategoryCapScale);
    return Math.max(T.perCategoryCapMin, Math.min(T.perCategoryCapMax, raw));
  };

  const perCategoryCount = new Map<CareerCategory, number>();
  const capped: typeof matched = [];
  for (const item of matched) {
    const cat = findCareerCategory(item.career.id);
    if (!cat) continue;
    if (item.breakdown.isExplicitlyBoosted) {
      // Boosted careers still bypass the cap, but they ALSO contribute
      // to the concentration check downstream so they can't dominate
      // unilaterally.
      capped.push(item);
      continue;
    }
    const cap = capForCategory(cat);
    const count = perCategoryCount.get(cat) || 0;
    if (count >= cap) continue;
    perCategoryCount.set(cat, count + 1);
    capped.push(item);
  }

  // ── Stage 4: category concentration guardrail ───────────────────
  // Check the top band — if any category claims > maxCategoryShareInTopBands
  // of those slots, push its WEAKEST non-boosted entries to the long tail
  // so the visible radar surface stays varied.
  const top = capped.slice(0, T.topBandSize);
  const tail = capped.slice(T.topBandSize);
  const counts = new Map<CareerCategory, number>();
  for (const item of top) {
    const cat = findCareerCategory(item.career.id);
    if (cat) counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  const maxAllowed = Math.floor(T.topBandSize * T.maxCategoryShareInTopBands);
  const demoted: typeof matched = [];
  const survivors: typeof matched = [];
  // Track per-category survivors so we can demote the weakest excess.
  const survivedByCategory = new Map<CareerCategory, number>();
  for (const item of top) {
    const cat = findCareerCategory(item.career.id);
    const total = (cat && counts.get(cat)) || 0;
    if (cat && total > maxAllowed && !item.breakdown.isExplicitlyBoosted) {
      const survivedCount = survivedByCategory.get(cat) || 0;
      if (survivedCount >= maxAllowed) {
        demoted.push(item);
        continue;
      }
      survivedByCategory.set(cat, survivedCount + 1);
    } else if (cat) {
      survivedByCategory.set(cat, (survivedByCategory.get(cat) || 0) + 1);
    }
    survivors.push(item);
  }
  // Re-fill the top band from the original tail to replace demoted entries.
  const refilled = [...survivors];
  let tailIdx = 0;
  while (refilled.length < T.topBandSize && tailIdx < tail.length) {
    refilled.push(tail[tailIdx++]);
  }
  const finalRanked = [...refilled, ...demoted, ...tail.slice(tailIdx)];

  // ── Stage 5: vocational/university interleave ───────────────────
  // Keep the boost-list and the top of the rank in their score order,
  // then interleave entry-level vs university-track for the remainder
  // so vocational paths aren't buried.
  const boostedAll = finalRanked.filter((m) => m.breakdown.isExplicitlyBoosted).map((m) => m.career);
  const nonBoosted = finalRanked.filter((m) => !m.breakdown.isExplicitlyBoosted);

  const entry: Career[] = [];
  const rest: Career[] = [];
  for (const m of nonBoosted) {
    if (m.career.entryLevel) entry.push(m.career);
    else rest.push(m.career);
  }

  const effectiveLimit = Math.max(limit, boostedAll.length + 20);
  const interleaved: Career[] = [...boostedAll];
  while (interleaved.length < effectiveLimit && (entry.length || rest.length)) {
    if (entry.length) interleaved.push(entry.shift()!);
    if (interleaved.length >= effectiveLimit) break;
    if (rest.length) interleaved.push(rest.shift()!);
  }

  // ── Stage 6: weak-signal salary bias ───────────────────────────
  // When the user has provided limited preference data (1 or fewer
  // signal dimensions), bias toward lower-to-medium salary careers.
  // This prevents aspirational high-barrier careers from dominating
  // when there's no evidence the student aligns with them. The bias
  // is invisible to the user — they just see more accessible, varied
  // careers that become richer as they add preferences.
  if (signalStrength <= 1) {
    // Sort by salary midpoint ascending so accessible careers surface first
    interleaved.sort((a, b) => salaryMidpoint(a.avgSalary) - salaryMidpoint(b.avgSalary));
  } else if (signalStrength < 2) {
    // Moderate bias — lightly penalise very high salary (>1000k midpoint)
    // by moving them toward the end, but don't fully re-sort
    const accessible = interleaved.filter(c => salaryMidpoint(c.avgSalary) <= 1000);
    const high = interleaved.filter(c => salaryMidpoint(c.avgSalary) > 1000);
    interleaved.length = 0;
    interleaved.push(...accessible, ...high);
  }

  return interleaved;
}

/**
 * Calculate how well a user's skills match a career
 */
export function calculateCareerMatch(
  userSkills: string[],
  career: Career
): number {
  if (!userSkills.length || !career.keySkills.length) return 0;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matchingSkills = career.keySkills.filter((skill) =>
    userSkillsLower.some(
      (userSkill) =>
        userSkill.includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill)
    )
  );

  return Math.round((matchingSkills.length / career.keySkills.length) * 100);
}

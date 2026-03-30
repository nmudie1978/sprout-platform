'use client';

/**
 * JOURNEY V2 PROTOTYPE — Built on Real Implementation
 *
 * Uses real career data, real journey state, real components.
 * Tests the redesigned flow:
 *   Discover = Explore the career (browse, watch, see data, entry criteria)
 *   Understand = Full career summary report (pre-populated, one notes area)
 *   Grow = Roadmap with recommended actions pinned on it
 *
 * Navigate to /test/journey-v2 to preview.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Rocket, CheckCircle2, Circle, Play, Users, TrendingUp,
  ArrowRight, BookOpen, Briefcase, GraduationCap, Pencil,
  Clock, Zap, Eye, ExternalLink, ChevronDown, ChevronUp,
  Target, Lock, FileText, Sparkles, Save, Maximize2, X, Plus, Trash2,
  Heart, Compass, Calendar, Wrench, Scale, MessageCircle, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/use-goals';
import { getAllCareers, type Career } from '@/lib/career-pathways';
import { STAGE_CONFIG } from '@/lib/journey/career-journey-types';
import type { JourneyUIState } from '@/lib/journey/types';

const PersonalCareerTimeline = dynamic(
  () => import('@/components/journey').then((m) => m.PersonalCareerTimeline),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-xl bg-muted/50" /> }
);
const GoalSelectionSheet = dynamic(
  () => import('@/components/goals/GoalSelectionSheet').then((m) => m.GoalSelectionSheet),
  { ssr: false }
);

// ============================================
// YOUTUBE VIDEO HOOK — searches via API
// ============================================

function useYouTubeVideo(careerTitle: string | null) {
  return useQuery<{ videoId: string | null }>({
    queryKey: ['youtube-video', careerTitle],
    queryFn: async () => {
      if (!careerTitle) return { videoId: null };
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(careerTitle)}`);
      if (!res.ok) return { videoId: null };
      return res.json();
    },
    enabled: !!careerTitle,
    staleTime: 24 * 60 * 60 * 1000, // 24h cache
  });
}

// ============================================
// FULLSCREEN ROADMAP OVERLAY
// ============================================

function FullscreenRoadmap({
  goalTitle,
  onClose,
}: {
  goalTitle: string;
  onClose: () => void;
}) {
  // Lock scroll and close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="text-base font-semibold">Career Roadmap</h2>
            <p className="text-xs text-muted-foreground/50">Your path to {goalTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/30 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      </div>

      {/* Roadmap content */}
      <div className="flex-1 overflow-auto p-6">
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
      </div>
    </motion.div>
  );
}

// ============================================
// LOCALE DETECTION — flag + currency
// ============================================

const COUNTRY_MAP: Record<string, { flag: string; currency: string; label: string }> = {
  NO: { flag: '🇳🇴', currency: 'NOK', label: 'Norway' },
  GB: { flag: '🇬🇧', currency: 'GBP', label: 'United Kingdom' },
  US: { flag: '🇺🇸', currency: 'USD', label: 'United States' },
  SE: { flag: '🇸🇪', currency: 'SEK', label: 'Sweden' },
  DK: { flag: '🇩🇰', currency: 'DKK', label: 'Denmark' },
  DE: { flag: '🇩🇪', currency: 'EUR', label: 'Germany' },
  FR: { flag: '🇫🇷', currency: 'EUR', label: 'France' },
  NL: { flag: '🇳🇱', currency: 'EUR', label: 'Netherlands' },
  IE: { flag: '🇮🇪', currency: 'EUR', label: 'Ireland' },
  AU: { flag: '🇦🇺', currency: 'AUD', label: 'Australia' },
  CA: { flag: '🇨🇦', currency: 'CAD', label: 'Canada' },
};

function useUserCountry() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return COUNTRY_MAP.NO;
    // Try to detect country from browser language (e.g. "en-GB", "nb-NO")
    const locale = navigator.language || 'nb-NO';
    const parts = locale.split('-');
    const countryCode = parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
    return COUNTRY_MAP[countryCode] || COUNTRY_MAP.NO;
  }, []);
}

// ============================================
// CERTIFICATION EXTRACTION
// ============================================

/** Known certifications by career keyword — supplements educationPath */
const KNOWN_CERTS: Record<string, string[]> = {
  'doctor': ['Medical License (HPR)', 'Specialist Certification'],
  'physician': ['Medical License (HPR)', 'Specialist Certification'],
  'nurse': ['Nursing License (HPR)', 'Specialist Nursing Certification'],
  'dentist': ['Dental License (HPR)', 'Specialist Dental Certification'],
  'pharmacist': ['Pharmacist License (HPR)'],
  'paramedic': ['Paramedic Certification', 'ACLS', 'PHTLS'],
  'psychologist': ['Psychology License (HPR)', 'Clinical Specialist Certification'],
  'physiotherapist': ['Physiotherapy License (HPR)'],
  'veterinarian': ['Veterinary License', 'Specialist Certification'],
  'veterinary assistant': ['Animal Care Certificate', 'CPR & First Aid Certification', 'Veterinary Assistant Diploma'],
  'veterinary': ['Veterinary License', 'CPR & First Aid Certification'],
  'healthcare worker': ['Health Care Certificate (Fagbrev)', 'CPR & First Aid Certification'],
  'teacher': ['Teaching Certificate (PPU)', 'Qualified Teacher Status'],
  'architect': ['Architect License', 'RIBA Certification'],
  'engineer': ['Professional Engineer (PE)', 'Chartered Engineer (CEng)'],
  'software': ['AWS Certified', 'Azure Certified', 'Google Cloud Certified'],
  'cloud': ['AWS Solutions Architect', 'Azure Administrator', 'GCP Professional'],
  'cyber': ['CISSP', 'OSCP', 'CompTIA Security+'],
  'security': ['CISSP', 'CEH', 'CompTIA Security+'],
  'data scientist': ['TensorFlow Certified', 'AWS ML Specialty'],
  'project manager': ['PMP', 'PRINCE2', 'Agile/Scrum Master'],
  'accountant': ['CPA', 'ACCA', 'Chartered Accountant'],
  'lawyer': ['Bar Admission', 'Legal Practice Certificate'],
};

function getCertifications(career: Career): string[] {
  const titleLower = career.title.toLowerCase();
  for (const [keyword, certs] of Object.entries(KNOWN_CERTS)) {
    if (titleLower.includes(keyword)) return certs;
  }
  // Extract from educationPath if it mentions certifications
  const path = career.educationPath.toLowerCase();
  if (path.includes('certification') || path.includes('certified')) {
    const match = career.educationPath.match(/(?:certification|certified)[^(]*/gi);
    if (match) return match.map((m) => m.trim());
  }
  return [];
}

// ============================================
// INDUSTRY INSIGHTS — tailored per career
// ============================================

interface IndustryInsight {
  trends: string[];
  challenges: string[];
  rewards: string[];
}

const INDUSTRY_INSIGHTS: Record<string, IndustryInsight> = {
  'doctor': {
    trends: ['Telemedicine and remote consultations growing rapidly', 'AI-assisted diagnostics becoming standard in hospitals', 'Personalised medicine driven by genomics and data', 'Increasing demand due to ageing populations'],
    challenges: ['Long training pathway (10+ years)', 'High-pressure environment with life-or-death decisions', 'Irregular hours and on-call shifts', 'Emotional toll of patient care and loss'],
    rewards: ['Directly saving and improving lives', 'High job security and earning potential', 'Constant intellectual challenge', 'Deep respect and trust from communities'],
  },
  'nurse': {
    trends: ['Nurse practitioners taking on expanded clinical roles', 'Digital health records transforming ward management', 'Growing demand for specialist nursing (mental health, oncology)', 'Remote patient monitoring via wearable tech'],
    challenges: ['Physically and emotionally demanding shifts', 'Staff shortages across most healthcare systems', 'Navigating complex patient and family dynamics', 'Continuous professional development requirements'],
    rewards: ['Making a tangible difference in recovery and comfort', 'Strong career progression and specialisation options', 'High demand globally — work almost anywhere', 'Deep bonds with patients and care teams'],
  },
  'psychologist': {
    trends: ['Surge in demand for mental health services post-pandemic', 'Digital therapy platforms expanding access to care', 'Neuroscience research reshaping treatment approaches', 'Corporate wellbeing programmes creating new career paths'],
    challenges: ['Lengthy academic pathway to full qualification', 'Emotional weight of working with vulnerable individuals', 'Navigating complex ethical boundaries', 'Building a private practice takes time and resilience'],
    rewards: ['Helping people transform their mental health', 'Diverse settings — clinical, corporate, research, schools', 'Intellectually stimulating and constantly evolving', 'Flexible working arrangements once established'],
  },
  'software developer': {
    trends: ['AI and machine learning reshaping how software is built', 'Cloud-native architectures becoming the default', 'Low-code/no-code platforms democratising development', 'Cybersecurity becoming every developer\'s responsibility'],
    challenges: ['Rapid technology changes require constant learning', 'Burnout from intense sprint cycles and deadlines', 'Remote work can feel isolating', 'Imposter syndrome common in fast-moving teams'],
    rewards: ['Build products used by millions of people', 'Excellent salaries and remote work flexibility', 'Creative problem-solving every day', 'Strong global demand across all industries'],
  },
  'engineer': {
    trends: ['Green energy and sustainability driving innovation', '3D printing revolutionising manufacturing and prototyping', 'IoT and smart infrastructure creating new specialisations', 'Cross-disciplinary engineering (bio, nano, data) growing fast'],
    challenges: ['Complex projects with long timelines', 'Regulatory compliance and safety responsibilities', 'Balancing innovation with proven methods', 'Keeping up with evolving software and simulation tools'],
    rewards: ['Designing and building real-world solutions', 'High job stability and competitive compensation', 'Working on projects with lasting societal impact', 'Collaborative, team-oriented work culture'],
  },
  'teacher': {
    trends: ['EdTech tools transforming classroom experiences', 'Emphasis on social-emotional learning growing', 'Personalised learning paths replacing one-size-fits-all', 'Growing need for STEM and vocational education teachers'],
    challenges: ['Administrative workload beyond teaching hours', 'Large class sizes and diverse learning needs', 'Emotional investment in student outcomes', 'Navigating curriculum changes and policy shifts'],
    rewards: ['Shaping the next generation\'s thinking and values', 'Every day is different and intellectually engaging', 'Long holidays and structured work calendar', 'Deep community connections and purpose'],
  },
  'lawyer': {
    trends: ['Legal tech and AI automating document review', 'ESG and sustainability law rapidly expanding', 'Cross-border digital regulation creating new specialisms', 'Alternative dispute resolution growing vs traditional litigation'],
    challenges: ['Demanding workload, especially in early career', 'High pressure to bill hours in private practice', 'Navigating complex ethical obligations', 'Competitive entry and qualification process'],
    rewards: ['Intellectually challenging and analytically rewarding', 'Strong earning potential with experience', 'Defending rights and shaping policy', 'Diverse career paths — corporate, criminal, public interest'],
  },
  'accountant': {
    trends: ['Automation transforming bookkeeping and compliance work', 'Advisory and strategic roles growing for accountants', 'Sustainability reporting becoming a core requirement', 'Cloud accounting platforms replacing desktop software'],
    challenges: ['Perception as repetitive (changing with advisory shift)', 'Busy periods around tax and audit deadlines', 'Keeping up with regulatory changes', 'Long qualification pathway (ACA, ACCA, CPA)'],
    rewards: ['Essential role in every organisation and industry', 'Clear career progression to CFO / partner level', 'Strong job security and global mobility', 'Analytical work with real business impact'],
  },
  'data scientist': {
    trends: ['Generative AI creating new modelling paradigms', 'Real-time analytics becoming standard in decision-making', 'Data ethics and responsible AI gaining prominence', 'Demand outstripping supply across almost every sector'],
    challenges: ['Communicating findings to non-technical stakeholders', 'Data quality and access are persistent blockers', 'Rapid tooling changes (new frameworks constantly)', 'Balancing exploration with delivery deadlines'],
    rewards: ['Uncovering patterns that drive major business decisions', 'One of the most in-demand roles globally', 'Mix of creativity, maths, and coding', 'Work across any industry — health, finance, sport, climate'],
  },
};

function getIndustryInsights(career: Career): IndustryInsight {
  const titleLower = career.title.toLowerCase();
  for (const [keyword, insights] of Object.entries(INDUSTRY_INSIGHTS)) {
    if (titleLower.includes(keyword)) return insights;
  }
  // Generate sensible defaults from career data
  return {
    trends: [
      `Growing demand for ${career.title} professionals across the industry`,
      'Digital transformation creating new tools and workflows',
      'Increasing emphasis on continuous professional development',
    ],
    challenges: [
      `Competitive entry — ${career.educationPath} typically required`,
      'Staying current with evolving industry standards',
      'Balancing workload with professional growth',
    ],
    rewards: [
      'Meaningful work with real-world impact',
      `${career.growthOutlook === 'high' ? 'Strong' : career.growthOutlook === 'medium' ? 'Good' : 'Steady'} job security and career progression`,
      'Opportunities to specialise and develop expertise',
    ],
  };
}

// ============================================
// ENTRY CRITERIA
// ============================================

const ENTRY_CRITERIA: Record<string, { minimumAge?: string; requirements: string[]; preferred: string[] }> = {
  'doctor': { minimumAge: '18 (university entry)', requirements: ['Strong grades in Biology, Chemistry, Maths', 'Medical school admission (UKAS/MCAT equivalent)', 'Background check & health declaration'], preferred: ['Volunteering in healthcare settings', 'Work experience or shadowing', 'First aid certification'] },
  'nurse': { minimumAge: '18', requirements: ['Nursing degree or diploma programme', 'Background check & health declaration', 'Biology/health science foundation'], preferred: ['Healthcare volunteering', 'Care assistant experience', 'First aid certification'] },
  'psychologist': { minimumAge: '18 (university entry)', requirements: ['Psychology degree (accredited programme)', 'Strong grades in relevant subjects', 'Background check for clinical roles'], preferred: ['Volunteering in mental health settings', 'Research experience', 'Counselling skills training'] },
  'software': { requirements: ['Problem-solving aptitude', 'Basic maths/logic skills'], preferred: ['Portfolio of personal projects', 'Open source contributions', 'Computer science degree or bootcamp', 'Hackathon participation'] },
  'engineer': { minimumAge: '18 (university entry)', requirements: ['Strong grades in Maths and Physics', 'Engineering degree (accredited)', 'Analytical thinking skills'], preferred: ['Technical projects or competitions', 'Industry placement or internship', 'CAD/software skills'] },
  'teacher': { minimumAge: '18', requirements: ['Relevant degree', 'Teaching qualification (PPU/PGCE)', 'Background check & safeguarding clearance', 'Good communication skills'], preferred: ['Classroom volunteering', 'Youth mentoring experience', 'Subject expertise'] },
  'lawyer': { minimumAge: '18 (university entry)', requirements: ['Law degree or conversion course', 'Legal practice training', 'Strong analytical and writing skills'], preferred: ['Mooting or debating experience', 'Legal clinic volunteering', 'Paralegal work experience'] },
  'accountant': { requirements: ['Numeracy and analytical skills', 'Professional qualification pathway (ACA/ACCA/CPA)', 'Degree in any subject (for graduate entry)'], preferred: ['Business/finance degree', 'Bookkeeping experience', 'Excel proficiency'] },
  'data scientist': { requirements: ['Strong maths/statistics foundation', 'Programming skills (Python/R)', 'Degree in STEM or quantitative field'], preferred: ['Portfolio of data projects', 'Kaggle competitions', 'Machine learning coursework'] },
  'veterinary assistant': { requirements: ['Animal care training or vocational certificate', 'Physical fitness for hands-on work', 'Comfort around animals in distress'], preferred: ['Volunteering at animal shelters', 'Pet care experience', 'First aid certification'] },
};

function getEntryCriteria(career: Career): { minimumAge?: string; requirements: string[]; preferred: string[] } {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(ENTRY_CRITERIA)) { if (t.includes(k)) return v; }
  return career.entryLevel
    ? { requirements: ['No formal qualifications required', 'Willingness to learn on the job'], preferred: ['Relevant volunteering', 'Basic skills in the area'] }
    : { requirements: [`${career.educationPath}`, 'Relevant subject knowledge'], preferred: ['Work experience in the field', 'Personal projects or volunteering'] };
}

// ============================================
// PERSONALITY FIT
// ============================================

const PERSONALITY_FIT: Record<string, { traits: string[]; suits: string; avoidIf: string }> = {
  'doctor': { traits: ['Empathetic', 'Resilient', 'Detail-oriented', 'Decisive', 'Calm under pressure'], suits: 'People who want to solve complex problems and care deeply about helping others', avoidIf: 'You struggle with high-pressure situations or long study commitments' },
  'nurse': { traits: ['Compassionate', 'Adaptable', 'Patient', 'Team-oriented', 'Physically resilient'], suits: 'People who thrive on human connection and hands-on care', avoidIf: 'You prefer predictable routines or working independently' },
  'psychologist': { traits: ['Empathetic', 'Analytical', 'Patient', 'Curious', 'Emotionally aware'], suits: 'People fascinated by how the mind works who want to help others grow', avoidIf: 'You find it difficult to separate work emotions from personal life' },
  'software': { traits: ['Logical', 'Creative', 'Persistent', 'Curious', 'Self-directed'], suits: 'People who love building things and solving puzzles with code', avoidIf: 'You prefer physical/hands-on work or dislike sitting at a screen' },
  'engineer': { traits: ['Analytical', 'Methodical', 'Creative', 'Collaborative', 'Practical'], suits: 'People who love understanding how things work and designing solutions', avoidIf: 'You prefer fast-moving creative work over structured problem-solving' },
  'teacher': { traits: ['Patient', 'Enthusiastic', 'Adaptable', 'Communicative', 'Organised'], suits: 'People who get energy from helping others learn and grow', avoidIf: 'You need quiet, solitary work environments to focus' },
  'lawyer': { traits: ['Analytical', 'Articulate', 'Persistent', 'Detail-oriented', 'Competitive'], suits: 'People who enjoy debating ideas and fighting for what they believe in', avoidIf: 'You avoid conflict or find detailed reading and writing draining' },
  'accountant': { traits: ['Detail-oriented', 'Organised', 'Trustworthy', 'Analytical', 'Methodical'], suits: 'People who find satisfaction in precision, patterns, and making numbers tell a story', avoidIf: 'You need high variety and creative freedom in every task' },
  'data scientist': { traits: ['Curious', 'Analytical', 'Creative', 'Communicative', 'Persistent'], suits: 'People who love finding patterns in chaos and translating data into decisions', avoidIf: 'You dislike maths or find ambiguous problems frustrating' },
  'veterinary': { traits: ['Compassionate', 'Practical', 'Calm', 'Physically resilient', 'Detail-oriented'], suits: 'People who love animals and want to make a hands-on difference in their care', avoidIf: 'You struggle with seeing animals in pain or prefer office-based work' },
};

function getPersonalityFit(career: Career): { traits: string[]; suits: string; avoidIf: string } {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(PERSONALITY_FIT)) { if (t.includes(k)) return v; }
  return { traits: ['Motivated', 'Curious', 'Reliable', 'Adaptable'], suits: `People who are genuinely interested in ${career.title.toLowerCase()} and want to grow`, avoidIf: 'The daily tasks described don\'t excite you' };
}

// ============================================
// RELATED CAREERS
// ============================================

const RELATED_CAREERS: Record<string, { title: string; emoji: string; reason: string }[]> = {
  'doctor': [{ title: 'Surgeon', emoji: '🔪', reason: 'Hands-on medical specialisation' }, { title: 'Biomedical Researcher', emoji: '🔬', reason: 'Medical science without patient care' }, { title: 'Paramedic', emoji: '🚑', reason: 'Frontline emergency medicine' }],
  'nurse': [{ title: 'Midwife', emoji: '👶', reason: 'Specialised maternal care' }, { title: 'Paramedic', emoji: '🚑', reason: 'Emergency healthcare' }, { title: 'Physiotherapist', emoji: '🦿', reason: 'Rehabilitation-focused care' }],
  'psychologist': [{ title: 'Counsellor', emoji: '💬', reason: 'Therapeutic support with shorter training' }, { title: 'Social Worker', emoji: '🤝', reason: 'Community-focused mental health' }, { title: 'Neuroscientist', emoji: '🧠', reason: 'Research-focused brain science' }],
  'software': [{ title: 'UX Designer', emoji: '🎨', reason: 'Building products with a design focus' }, { title: 'Data Engineer', emoji: '🗄️', reason: 'Backend systems and data pipelines' }, { title: 'Cybersecurity Analyst', emoji: '🔒', reason: 'Protecting systems you build' }],
  'engineer': [{ title: 'Architect', emoji: '🏛️', reason: 'Design-focused structural work' }, { title: 'Project Manager', emoji: '📋', reason: 'Leading engineering teams' }, { title: 'Environmental Scientist', emoji: '🌍', reason: 'Engineering for sustainability' }],
  'teacher': [{ title: 'Education Administrator', emoji: '🏫', reason: 'Shaping education policy' }, { title: 'Corporate Trainer', emoji: '📊', reason: 'Teaching in business settings' }, { title: 'Youth Worker', emoji: '🧑‍🤝‍🧑', reason: 'Supporting young people outside school' }],
  'lawyer': [{ title: 'Paralegal', emoji: '📑', reason: 'Legal work with shorter training' }, { title: 'Mediator', emoji: '⚖️', reason: 'Resolving disputes without court' }, { title: 'Policy Adviser', emoji: '🏛️', reason: 'Shaping law through government' }],
  'accountant': [{ title: 'Financial Analyst', emoji: '📈', reason: 'Investment-focused finance' }, { title: 'Auditor', emoji: '🔍', reason: 'Compliance and verification' }, { title: 'Tax Adviser', emoji: '🧾', reason: 'Specialist tax planning' }],
  'data scientist': [{ title: 'Machine Learning Engineer', emoji: '🤖', reason: 'Deploying AI models at scale' }, { title: 'Business Analyst', emoji: '📊', reason: 'Data-driven decision-making' }, { title: 'Statistician', emoji: '📐', reason: 'Pure statistical research' }],
};

function getRelatedCareers(career: Career): { title: string; emoji: string; reason: string }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(RELATED_CAREERS)) { if (t.includes(k)) return v; }
  return [{ title: 'Explore similar roles', emoji: '🔍', reason: 'Search for related careers in this field' }];
}

// ============================================
// SUBJECTS THAT MATTER NOW
// ============================================

const RELEVANT_SUBJECTS: Record<string, { subject: string; why: string }[]> = {
  'doctor': [{ subject: 'Biology', why: 'Foundation of medical science' }, { subject: 'Chemistry', why: 'Understanding drugs and body chemistry' }, { subject: 'Maths', why: 'Dosage calculations and research stats' }, { subject: 'English', why: 'Clear communication with patients' }],
  'nurse': [{ subject: 'Biology', why: 'Understanding the human body' }, { subject: 'Chemistry', why: 'Medication and treatment knowledge' }, { subject: 'Psychology', why: 'Understanding patient behaviour' }, { subject: 'English', why: 'Documentation and communication' }],
  'psychologist': [{ subject: 'Psychology', why: 'Core discipline' }, { subject: 'Biology', why: 'Brain and nervous system' }, { subject: 'Maths/Statistics', why: 'Research methods and data analysis' }, { subject: 'English', why: 'Report writing and communication' }],
  'software': [{ subject: 'Maths', why: 'Logic, algorithms, and problem-solving' }, { subject: 'Physics', why: 'Computational thinking' }, { subject: 'English', why: 'Writing clear documentation' }, { subject: 'Art/Design', why: 'UI/UX and visual thinking' }],
  'engineer': [{ subject: 'Maths', why: 'Calculations and modelling' }, { subject: 'Physics', why: 'Core engineering principles' }, { subject: 'Design & Technology', why: 'Practical problem-solving' }, { subject: 'ICT', why: 'CAD and simulation tools' }],
  'teacher': [{ subject: 'Your specialist subject', why: 'Deep knowledge in what you\'ll teach' }, { subject: 'English', why: 'Communication and lesson planning' }, { subject: 'Psychology', why: 'Understanding how students learn' }, { subject: 'Drama/Public Speaking', why: 'Confidence in front of groups' }],
  'lawyer': [{ subject: 'English', why: 'Argumentation and legal writing' }, { subject: 'History', why: 'Understanding precedent and context' }, { subject: 'Politics/Economics', why: 'Legal systems and governance' }, { subject: 'Foreign Languages', why: 'International and EU law' }],
  'accountant': [{ subject: 'Maths', why: 'Core numeracy and calculations' }, { subject: 'Business Studies', why: 'Understanding commercial context' }, { subject: 'Economics', why: 'Market and financial systems' }, { subject: 'ICT', why: 'Spreadsheets and accounting software' }],
  'data scientist': [{ subject: 'Maths/Statistics', why: 'The foundation of data science' }, { subject: 'ICT/Computer Science', why: 'Programming and data tools' }, { subject: 'Physics', why: 'Analytical and modelling skills' }, { subject: 'English', why: 'Communicating findings clearly' }],
};

function getRelevantSubjects(career: Career): { subject: string; why: string }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(RELEVANT_SUBJECTS)) { if (t.includes(k)) return v; }
  return [{ subject: 'English', why: 'Communication in any career' }, { subject: 'Maths', why: 'Problem-solving and logic' }, { subject: 'ICT', why: 'Digital skills are essential everywhere' }];
}

// ============================================
// TYPICAL WEEK
// ============================================

const TYPICAL_WEEK: Record<string, { day: string; activities: string }[]> = {
  'doctor': [{ day: 'Mon', activities: 'Morning ward rounds, patient consultations, reviewing test results' }, { day: 'Tue', activities: 'Outpatient clinic, follow-up appointments, multidisciplinary meetings' }, { day: 'Wed', activities: 'Surgery or procedures, case conferences, medical records' }, { day: 'Thu', activities: 'Teaching medical students, research work, patient referrals' }, { day: 'Fri', activities: 'Ward rounds, discharge planning, admin and professional development' }],
  'nurse': [{ day: 'Mon', activities: 'Shift handover, patient assessments, medication rounds' }, { day: 'Tue', activities: 'Wound care, patient observations, family meetings' }, { day: 'Wed', activities: 'Emergency admissions, documentation, care plan updates' }, { day: 'Thu', activities: 'Training sessions, specialist clinic support, mentoring students' }, { day: 'Fri', activities: 'Discharge planning, stock checks, team debrief' }],
  'psychologist': [{ day: 'Mon', activities: 'Client therapy sessions, treatment planning, case notes' }, { day: 'Tue', activities: 'Assessments and evaluations, supervision meetings' }, { day: 'Wed', activities: 'Group therapy, research or writing, peer consultation' }, { day: 'Thu', activities: 'Client sessions, report writing, professional development' }, { day: 'Fri', activities: 'Follow-up calls, admin, reflective practice and reading' }],
  'software': [{ day: 'Mon', activities: 'Sprint planning, code reviews, picking up new tickets' }, { day: 'Tue', activities: 'Feature development, pair programming, testing' }, { day: 'Wed', activities: 'Architecture discussions, debugging, documentation' }, { day: 'Thu', activities: 'Coding, PR reviews, cross-team collaboration' }, { day: 'Fri', activities: 'Demo/showcase, retrospective, learning time, deploying changes' }],
  'engineer': [{ day: 'Mon', activities: 'Project meetings, design reviews, CAD modelling' }, { day: 'Tue', activities: 'Calculations, simulations, site inspections' }, { day: 'Wed', activities: 'Prototyping, testing, supplier coordination' }, { day: 'Thu', activities: 'Technical documentation, client presentations, problem-solving' }, { day: 'Fri', activities: 'Quality checks, team meetings, professional reading' }],
  'teacher': [{ day: 'Mon', activities: 'Lessons, lesson prep, staff briefing, marking' }, { day: 'Tue', activities: 'Teaching, one-to-one student support, parent emails' }, { day: 'Wed', activities: 'Lessons, department meeting, resource creation' }, { day: 'Thu', activities: 'Teaching, extracurricular club, assessment prep' }, { day: 'Fri', activities: 'Lessons, marking, weekly reflection, planning next week' }],
  'lawyer': [{ day: 'Mon', activities: 'Case review, client meetings, legal research' }, { day: 'Tue', activities: 'Drafting documents, court preparation, team meetings' }, { day: 'Wed', activities: 'Court appearance or mediation, client calls, billing' }, { day: 'Thu', activities: 'Contract review, due diligence, mentoring juniors' }, { day: 'Fri', activities: 'Case strategy, professional development, admin' }],
  'accountant': [{ day: 'Mon', activities: 'Client meetings, reviewing financial statements, tax planning' }, { day: 'Tue', activities: 'Audit fieldwork, data analysis, team catch-ups' }, { day: 'Wed', activities: 'Report writing, compliance checks, software updates' }, { day: 'Thu', activities: 'Advisory meetings, budget reviews, training sessions' }, { day: 'Fri', activities: 'Filing, reconciliations, weekly review, planning' }],
  'data scientist': [{ day: 'Mon', activities: 'Stakeholder meeting, defining questions, data exploration' }, { day: 'Tue', activities: 'Data cleaning, feature engineering, model building' }, { day: 'Wed', activities: 'Model training, A/B test analysis, documentation' }, { day: 'Thu', activities: 'Presenting findings, dashboard building, code review' }, { day: 'Fri', activities: 'Learning new techniques, reading papers, team retro' }],
};

function getTypicalWeek(career: Career): { day: string; activities: string }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(TYPICAL_WEEK)) { if (t.includes(k)) return v; }
  return [{ day: 'Mon', activities: 'Planning and meetings' }, { day: 'Tue', activities: 'Core tasks and collaboration' }, { day: 'Wed', activities: 'Focused work and problem-solving' }, { day: 'Thu', activities: 'Client or team interactions' }, { day: 'Fri', activities: 'Review, admin, and development' }];
}

// ============================================
// TOOLS OF THE TRADE
// ============================================

const CAREER_TOOLS: Record<string, { name: string; category: string }[]> = {
  'doctor': [{ name: 'Stethoscope', category: 'Equipment' }, { name: 'Electronic Health Records (EHR)', category: 'Software' }, { name: 'Medical imaging (X-ray/MRI)', category: 'Equipment' }, { name: 'Clinical decision support tools', category: 'Software' }, { name: 'Prescription systems', category: 'Software' }],
  'nurse': [{ name: 'Patient monitoring systems', category: 'Equipment' }, { name: 'EHR/charting software', category: 'Software' }, { name: 'Medication dispensing systems', category: 'Equipment' }, { name: 'Wound care supplies', category: 'Equipment' }, { name: 'Communication handsets', category: 'Equipment' }],
  'psychologist': [{ name: 'Psychometric assessment tools', category: 'Software' }, { name: 'Case management systems', category: 'Software' }, { name: 'Video conferencing (telehealth)', category: 'Software' }, { name: 'Research databases (PubMed)', category: 'Software' }, { name: 'SPSS / R for research', category: 'Software' }],
  'software': [{ name: 'VS Code / IDE', category: 'Software' }, { name: 'Git & GitHub', category: 'Software' }, { name: 'Docker / containers', category: 'DevOps' }, { name: 'Figma (design specs)', category: 'Design' }, { name: 'Jira / Linear', category: 'Project Management' }, { name: 'CI/CD pipelines', category: 'DevOps' }],
  'engineer': [{ name: 'AutoCAD / SolidWorks', category: 'CAD' }, { name: 'MATLAB / Simulink', category: 'Simulation' }, { name: 'Project management tools', category: 'Software' }, { name: 'Lab/test equipment', category: 'Equipment' }, { name: '3D printers', category: 'Equipment' }],
  'teacher': [{ name: 'Google Classroom / Teams', category: 'Platform' }, { name: 'Interactive whiteboard', category: 'Equipment' }, { name: 'PowerPoint / Canva', category: 'Design' }, { name: 'Learning management system', category: 'Platform' }, { name: 'Assessment/grading tools', category: 'Software' }],
  'lawyer': [{ name: 'Legal research databases', category: 'Software' }, { name: 'Document management system', category: 'Software' }, { name: 'Contract drafting tools', category: 'Software' }, { name: 'Case management software', category: 'Software' }, { name: 'Billing/time tracking', category: 'Software' }],
  'accountant': [{ name: 'Excel / Google Sheets', category: 'Software' }, { name: 'Xero / QuickBooks', category: 'Accounting' }, { name: 'Audit management tools', category: 'Software' }, { name: 'Tax compliance software', category: 'Software' }, { name: 'Power BI / Tableau', category: 'Analytics' }],
  'data scientist': [{ name: 'Python / Jupyter', category: 'Programming' }, { name: 'SQL / databases', category: 'Data' }, { name: 'TensorFlow / PyTorch', category: 'ML' }, { name: 'Tableau / Power BI', category: 'Visualisation' }, { name: 'Cloud (AWS/GCP)', category: 'Infrastructure' }, { name: 'Git & notebooks', category: 'Collaboration' }],
};

function getCareerTools(career: Career): { name: string; category: string }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(CAREER_TOOLS)) { if (t.includes(k)) return v; }
  return [{ name: 'Industry-specific software', category: 'Software' }, { name: 'Communication tools', category: 'Software' }, { name: 'Project management tools', category: 'Software' }];
}

// ============================================
// WORK-LIFE BALANCE
// ============================================

const WORK_LIFE_BALANCE: Record<string, { hours: string; flexibility: string; stress: string; remote: string }> = {
  'doctor': { hours: '45-60 hrs/week', flexibility: 'Low — shift-based', stress: 'High', remote: 'Rarely' },
  'nurse': { hours: '36-48 hrs/week', flexibility: 'Low — rota-based', stress: 'High', remote: 'Never' },
  'psychologist': { hours: '35-45 hrs/week', flexibility: 'Moderate — once established', stress: 'Moderate', remote: 'Sometimes (telehealth)' },
  'software': { hours: '35-45 hrs/week', flexibility: 'High — flexible hours', stress: 'Moderate', remote: 'Often / fully remote' },
  'engineer': { hours: '38-45 hrs/week', flexibility: 'Moderate', stress: 'Moderate', remote: 'Sometimes (hybrid)' },
  'teacher': { hours: '40-50 hrs/week (incl. prep)', flexibility: 'Low — term-time', stress: 'Moderate-High', remote: 'Rarely' },
  'lawyer': { hours: '45-60 hrs/week', flexibility: 'Low-Moderate', stress: 'High', remote: 'Sometimes (hybrid)' },
  'accountant': { hours: '35-50 hrs/week (peaks)', flexibility: 'Moderate', stress: 'Moderate (seasonal peaks)', remote: 'Often (hybrid)' },
  'data scientist': { hours: '35-45 hrs/week', flexibility: 'High', stress: 'Low-Moderate', remote: 'Often / fully remote' },
};

function getWorkLifeBalance(career: Career): { hours: string; flexibility: string; stress: string; remote: string } {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(WORK_LIFE_BALANCE)) { if (t.includes(k)) return v; }
  return { hours: '35-45 hrs/week', flexibility: 'Varies', stress: 'Moderate', remote: 'Depends on employer' };
}

// ============================================
// COMMUNITIES
// ============================================

const CAREER_COMMUNITIES: Record<string, { name: string; type: 'local' | 'global'; description: string }[]> = {
  'doctor': [{ name: 'Den norske legeforening', type: 'local', description: 'Norwegian Medical Association' }, { name: 'r/medicine', type: 'global', description: 'Reddit community for medical professionals' }, { name: 'Medscape', type: 'global', description: 'Global clinical knowledge network' }, { name: 'Student BMJ', type: 'global', description: 'Community for medical students' }],
  'nurse': [{ name: 'Norsk Sykepleierforbund', type: 'local', description: 'Norwegian Nurses Organisation' }, { name: 'r/nursing', type: 'global', description: 'Reddit nursing community' }, { name: 'RCN (Royal College of Nursing)', type: 'global', description: 'UK-based but internationally recognised' }],
  'psychologist': [{ name: 'Norsk Psykologforening', type: 'local', description: 'Norwegian Psychological Association' }, { name: 'APA (American Psychological Association)', type: 'global', description: 'Largest psychology organisation worldwide' }, { name: 'r/psychotherapy', type: 'global', description: 'Global community for therapy professionals' }],
  'software': [{ name: 'Kode24 / Booster', type: 'local', description: 'Norwegian developer community and conference' }, { name: 'Stack Overflow', type: 'global', description: 'The go-to Q&A for developers' }, { name: 'Dev.to', type: 'global', description: 'Community blogging and learning platform' }, { name: 'GitHub Discussions', type: 'global', description: 'Open source project communities' }],
  'engineer': [{ name: 'NITO', type: 'local', description: 'Norwegian engineering union' }, { name: 'IEEE', type: 'global', description: 'International engineering professional body' }, { name: 'Engineers Without Borders', type: 'global', description: 'Engineering for humanitarian impact' }],
  'teacher': [{ name: 'Utdanningsforbundet', type: 'local', description: 'Norwegian teacher union' }, { name: 'TES Community', type: 'global', description: 'Global teaching resource sharing' }, { name: 'Edutopia', type: 'global', description: 'Innovative teaching practices community' }],
  'lawyer': [{ name: 'Advokatforeningen', type: 'local', description: 'Norwegian Bar Association' }, { name: 'r/LawSchool', type: 'global', description: 'Community for law students' }, { name: 'Legal Cheek', type: 'global', description: 'Legal careers and insight community' }],
  'accountant': [{ name: 'Regnskap Norge', type: 'local', description: 'Norwegian accounting association' }, { name: 'ACCA Global', type: 'global', description: 'International accounting body' }, { name: 'r/Accounting', type: 'global', description: 'Reddit community for accountants' }],
  'data scientist': [{ name: 'Oslo Data Science', type: 'local', description: 'Meetup group for data professionals' }, { name: 'Kaggle', type: 'global', description: 'Competitions and community for data scientists' }, { name: 'r/datascience', type: 'global', description: 'Reddit data science community' }, { name: 'dbt Community', type: 'global', description: 'Analytics engineering community' }],
};

function getCareerCommunities(career: Career): { name: string; type: 'local' | 'global'; description: string }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(CAREER_COMMUNITIES)) { if (t.includes(k)) return v; }
  return [{ name: 'LinkedIn Groups', type: 'global', description: `Search for ${career.title} professional groups` }, { name: 'Reddit', type: 'global', description: `Search for subreddits related to ${career.title.toLowerCase()}` }];
}

// ============================================
// PORTFOLIO IDEAS
// ============================================

const PORTFOLIO_IDEAS: Record<string, { idea: string; description: string; difficulty: 'Easy' | 'Medium' | 'Advanced' }[]> = {
  'doctor': [{ idea: 'First aid volunteering log', description: 'Document your hours and skills gained as a first aider', difficulty: 'Easy' }, { idea: 'Health awareness campaign', description: 'Create a poster or social media series on a health topic', difficulty: 'Medium' }, { idea: 'Research summary blog', description: 'Write accessible summaries of medical research papers', difficulty: 'Advanced' }],
  'nurse': [{ idea: 'Care experience diary', description: 'Log volunteering hours in care homes or hospitals', difficulty: 'Easy' }, { idea: 'Patient education leaflet', description: 'Design a clear health information leaflet', difficulty: 'Medium' }, { idea: 'Reflection portfolio', description: 'Structured reflections on clinical observations', difficulty: 'Medium' }],
  'psychologist': [{ idea: 'Psychology blog', description: 'Write about psychological concepts for a general audience', difficulty: 'Easy' }, { idea: 'Mini research project', description: 'Conduct a small survey and analyse the results', difficulty: 'Medium' }, { idea: 'Peer support programme', description: 'Design and run a wellbeing initiative at school/uni', difficulty: 'Advanced' }],
  'software': [{ idea: 'Personal website', description: 'Build and deploy your own portfolio site', difficulty: 'Easy' }, { idea: 'Open source contribution', description: 'Submit a PR to a project you use', difficulty: 'Medium' }, { idea: 'Full-stack side project', description: 'Build an app that solves a real problem', difficulty: 'Advanced' }, { idea: 'Technical blog', description: 'Write tutorials explaining what you\'ve learned', difficulty: 'Easy' }],
  'engineer': [{ idea: 'CAD design project', description: 'Model a product or structure in CAD software', difficulty: 'Medium' }, { idea: 'Arduino/Raspberry Pi project', description: 'Build a working prototype of an idea', difficulty: 'Medium' }, { idea: 'Engineering competition entry', description: 'Enter a national or online engineering challenge', difficulty: 'Advanced' }],
  'teacher': [{ idea: 'Tutoring log', description: 'Document your experience helping peers or younger students', difficulty: 'Easy' }, { idea: 'Lesson plan portfolio', description: 'Create sample lesson plans for your subject', difficulty: 'Medium' }, { idea: 'Educational YouTube channel', description: 'Record short explainer videos on topics you love', difficulty: 'Medium' }],
  'lawyer': [{ idea: 'Case analysis essays', description: 'Write analyses of interesting court cases', difficulty: 'Medium' }, { idea: 'Mock trial participation', description: 'Join mooting competitions and document your arguments', difficulty: 'Medium' }, { idea: 'Legal blog', description: 'Write about legal issues in accessible language', difficulty: 'Easy' }],
  'accountant': [{ idea: 'Personal budget tracker', description: 'Build a spreadsheet system for managing finances', difficulty: 'Easy' }, { idea: 'Small business case study', description: 'Analyse the finances of a local business', difficulty: 'Medium' }, { idea: 'Tax guide for young people', description: 'Create a simple guide to taxes for first-time earners', difficulty: 'Medium' }],
  'data scientist': [{ idea: 'Kaggle competition entry', description: 'Compete in a beginner-friendly data challenge', difficulty: 'Medium' }, { idea: 'Data visualisation project', description: 'Create compelling visuals from a public dataset', difficulty: 'Easy' }, { idea: 'End-to-end ML project', description: 'Build, train, and deploy a machine learning model', difficulty: 'Advanced' }, { idea: 'Data blog', description: 'Write about your analysis process and findings', difficulty: 'Easy' }],
};

function getPortfolioIdeas(career: Career): { idea: string; description: string; difficulty: 'Easy' | 'Medium' | 'Advanced' }[] {
  const t = career.title.toLowerCase();
  for (const [k, v] of Object.entries(PORTFOLIO_IDEAS)) { if (t.includes(k)) return v; }
  return [{ idea: 'Experience journal', description: 'Document activities and skills you\'re building', difficulty: 'Easy' }, { idea: 'Project showcase', description: 'Create something relevant to the field and document it', difficulty: 'Medium' }, { idea: 'Blog or vlog', description: 'Share your learning journey publicly', difficulty: 'Easy' }];
}

// ============================================
// TYPES
// ============================================

type V2Tab = 'discover' | 'understand' | 'grow';

// ============================================
// DISCOVER TAB — Explore the Career
// ============================================

function V2DiscoverTab({
  career,
  goalTitle,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  onContinue: () => void;
}) {
  const [roadmapFullscreen, setRoadmapFullscreen] = useState(false);
  const userCountry = useUserCountry();
  const { data: ytData } = useYouTubeVideo(goalTitle);
  const videoId = ytData?.videoId ?? null;

  if (!career || !goalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Target className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">Set a career goal to start exploring</p>
        <p className="text-xs text-muted-foreground/40 mt-1">Head to the real My Journey page to set your primary goal</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'day-in-life',
      icon: Play,
      title: 'A Day in the Life',
      subtitle: `See what ${career.title}s actually do`,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      content: (
        <div>
          {videoId ? (
            <div className="rounded-lg overflow-hidden border border-border/30">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Day in the life — ${career.title}`}
              />
            </div>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=day+in+the+life+${encodeURIComponent(career.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg bg-red-500/[0.06] border border-red-500/15 px-2.5 py-3 hover:bg-red-500/10 transition-all"
            >
              <div className="h-7 w-7 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                <Play className="h-3 w-3 text-red-400" />
              </div>
              <p className="text-[10px] font-medium text-foreground/70 flex-1">Loading video...</p>
            </a>
          )}
        </div>
      ),
    },
    {
      id: 'salary-growth',
      icon: TrendingUp,
      title: 'Career Related Info',
      subtitle: 'Salary, education, skills and more',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      content: (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-medium text-emerald-500/60">Salary</p>
                <span className="text-xs" title={`Based on ${userCountry.label} (${userCountry.currency})`}>{userCountry.flag}</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">{career.avgSalary}</p>
            </div>
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2">
              <p className="text-[9px] font-medium text-emerald-500/60">Growth</p>
              <p className="text-sm font-bold text-emerald-400 capitalize">{career.growthOutlook}</p>
            </div>
          </div>
          {(() => {
            const certs = getCertifications(career);
            const hasCerts = certs.length > 0;
            return (
              <div className={hasCerts || career.entryLevel ? 'grid grid-cols-2 gap-2' : ''}>
                <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-2">
                  <p className="text-[9px] font-medium text-blue-400/60">Education</p>
                  <p className="text-[11px] text-foreground/80 mt-0.5">{career.educationPath}</p>
                </div>
                {hasCerts ? (
                  <div className="rounded-lg bg-violet-500/5 border border-violet-500/15 p-2">
                    <p className="text-[9px] font-medium text-violet-400/60">Certifications</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {certs.map((cert, i) => (
                        <li key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-violet-400/50 mt-1.5 shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : career.entryLevel ? (
                  <div className="rounded-lg bg-teal-500/5 border border-teal-500/15 p-2 flex items-center">
                    <p className="text-[10px] text-teal-400 font-medium">No degree required — entry-level accessible via vocational training</p>
                  </div>
                ) : null}
              </div>
            );
          })()}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2">
              <p className="text-[9px] font-medium text-emerald-500/60">What You&apos;ll Do</p>
              <p className="text-[11px] text-foreground/70 leading-relaxed">{career.description}</p>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-2">
              <p className="text-[9px] font-medium text-amber-500/60 mb-1.5">Key Skills</p>
              <div className="flex flex-wrap gap-1">
                {career.keySkills.map((skill) => (
                  <span key={skill} className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <p className="text-xs text-muted-foreground/50">Explore what being a {goalTitle} involves</p>

      {/* Bento grid — video left, info right */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Left: Day in the Life — spans 2 cols */}
        <div className="sm:col-span-2 self-start rounded-2xl border border-red-500/20 bg-gradient-to-b from-card/80 to-card/60 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-red-500/10">
              <Play className="h-3.5 w-3.5 text-red-400" />
            </div>
            <p className="text-xs font-semibold">A Day in the Life</p>
          </div>
          <div className="px-3 pb-3">
            {sections[0].content}
          </div>
        </div>

        {/* Right column — spans 3 cols */}
        <div className="sm:col-span-3">
          {/* Salary, Growth, Path & Skills */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-card/80 to-card/60 overflow-hidden">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold">Career Related Info</p>
            </div>
            <div className="px-3 pb-3 border-t border-border/15 pt-2.5 text-[11px]">
              {sections[1].content}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-teal-500/60">Your roadmap</p>
          <button
            onClick={() => setRoadmapFullscreen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Maximize2 className="h-3 w-3" />
            Full screen
          </button>
        </div>
        <PersonalCareerTimeline primaryGoalTitle={goalTitle} />
      </div>

      <AnimatePresence>
        {roadmapFullscreen && goalTitle && (
          <FullscreenRoadmap goalTitle={goalTitle} onClose={() => setRoadmapFullscreen(false)} />
        )}
      </AnimatePresence>

      {/* Next stage nudge */}
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-foreground/70">Ready to dig deeper?</p>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            Understand gives you a full career brief — role reality, qualifications, industry outlook, and space for your own notes.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shrink-0"
        >
          Understand <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// UNDERSTAND TAB — Career Summary Report
// ============================================

function TypicalWeekTimeline({ week, dailyTasks }: { week: { day: string; activities: string }[]; dailyTasks: string[] }) {
  const [showTasks, setShowTasks] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-medium text-orange-400/60">A Typical Week</p>
        <button
          onClick={() => setShowTasks(!showTasks)}
          className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-400/60 hover:text-emerald-400 transition-colors"
        >
          <Eye className="h-3 w-3" />
          {showTasks ? 'Hide' : 'Show'} daily tasks
          <ChevronDown className={cn('h-3 w-3 transition-transform', showTasks && 'rotate-180')} />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-3 left-[10%] right-[10%] h-px bg-gradient-to-r from-orange-500/0 via-orange-500/30 to-orange-500/0" />
        {/* Day nodes */}
        <div className="relative flex justify-between">
          {week.map((d) => (
            <div key={d.day} className="flex flex-col items-center flex-1 group relative">
              {/* Node dot */}
              <div className="relative z-10 h-6 w-6 rounded-full border-2 border-orange-500/30 bg-background flex items-center justify-center group-hover:border-orange-400 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.25)] transition-all">
                <div className="h-2 w-2 rounded-full bg-orange-400/70 group-hover:bg-orange-400 transition-colors" />
              </div>
              {/* Day label */}
              <p className="text-[10px] font-bold text-orange-400 mt-2.5 mb-1">{d.day}</p>
              {/* Activity card */}
              <div className="rounded-lg border border-orange-500/10 bg-orange-500/[0.03] px-2.5 py-2 w-full mx-1 group-hover:border-orange-500/25 group-hover:bg-orange-500/[0.06] transition-colors">
                <p className="text-[10px] text-foreground/60 leading-relaxed text-center">{d.activities}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggleable daily tasks */}
      <AnimatePresence initial={false}>
        {showTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-3">
              <p className="text-[9px] font-medium text-emerald-400/50 mb-2 uppercase tracking-wider">Day-to-Day Tasks</p>
              <div className="flex flex-wrap gap-1.5">
                {dailyTasks.map((task, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] text-foreground/60">
                    <span className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-emerald-400">{i + 1}</span>
                    </span>
                    {task}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccordionSection({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  borderColor,
  defaultOpen = false,
  count,
  children,
}: {
  title: string;
  icon: typeof Eye;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('rounded-2xl border overflow-hidden transition-colors', borderColor, open ? 'bg-gradient-to-b from-card/80 to-card/60' : 'bg-card/30')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-muted/10 transition-colors"
      >
        <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        </div>
        <p className="text-xs font-semibold flex-1">{title}</p>
        {count !== undefined && (
          <span className="text-[9px] text-muted-foreground/40">{count} items</span>
        )}
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground/40 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/15 pt-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function V2UnderstandTab({
  career,
  goalTitle,
  journey,
  notes,
  onNotesChange,
  notesSaved,
  onSaveNotes,
  onContinue,
}: {
  career: Career | null;
  goalTitle: string | null;
  journey: JourneyUIState | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  notesSaved: boolean;
  onSaveNotes: () => void;
  onContinue: () => void;
}) {

  if (!career || !goalTitle) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Globe className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">Complete Discover first</p>
      </div>
    );
  }

  const insights = getIndustryInsights(career);
  const week = getTypicalWeek(career);
  const tools = getCareerTools(career);
  const wlb = getWorkLifeBalance(career);
  const criteria = getEntryCriteria(career);
  const fit = getPersonalityFit(career);
  const subjects = getRelevantSubjects(career);

  const handleSaveNotes = () => {
    onSaveNotes();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <p className="text-xs text-muted-foreground/50">Understand what being a {goalTitle} really means</p>

      {/* ── Section 1: What the Job Looks Like (default open) ── */}
      <AccordionSection
        title="What the Job Looks Like"
        icon={Eye}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/10"
        borderColor="border-emerald-500/20"
        defaultOpen
        count={career.dailyTasks.length + week.length}
      >
        {/* A Typical Week — Timeline with toggleable daily tasks */}
        <TypicalWeekTimeline week={week} dailyTasks={career.dailyTasks} />
      </AccordionSection>

      {/* ── Section 2: Is This Right for Me? (full width) ── */}
      <AccordionSection
        title="Is This Right for Me?"
        icon={Heart}
        iconColor="text-sky-400"
        iconBg="bg-sky-500/10"
        borderColor="border-sky-500/20"
      >
        {/* Personality Fit — compact inline */}
        <div>
          <p className="text-[11px] text-foreground/70 leading-relaxed">{fit.suits}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {fit.traits.map((trait) => (
              <span key={trait} className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted/40 text-foreground/60">
                {trait}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/30 italic mt-1.5">{fit.avoidIf}</p>
        </div>

        {/* Challenges + Rewards — side by side, compact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Challenges</p>
            <ul className="space-y-1">
              {insights.challenges.map((challenge, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                  <span className="text-[11px] text-foreground/60 leading-snug">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Rewards</p>
            <ul className="space-y-1">
              {insights.rewards.map((reward, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                  <span className="text-[11px] text-foreground/60 leading-snug">{reward}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Work-Life Balance — single row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: 'Hours', value: wlb.hours },
            { label: 'Flexibility', value: wlb.flexibility },
            { label: 'Stress', value: wlb.stress },
            { label: 'Remote', value: wlb.remote },
          ].map((item) => (
            <div key={item.label} className="flex items-baseline gap-1.5">
              <span className="text-[9px] font-medium text-muted-foreground/40">{item.label}</span>
              <span className="text-[11px] text-foreground/60">{item.value}</span>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* ── Sections 3 & 4 side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AccordionSection
        title="What You'll Need"
        icon={GraduationCap}
        iconColor="text-rose-400"
        iconBg="bg-rose-500/10"
        borderColor="border-rose-500/20"
      >
        {/* Entry Criteria */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-medium text-rose-400/60">Entry Criteria</p>
            {criteria.minimumAge && (
              <span className="text-[9px] font-medium rounded-full px-2 py-0.5 bg-rose-500/10 text-rose-400">
                Min age: {criteria.minimumAge}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-medium text-rose-400/60 mb-1.5">Required</p>
              <ul className="space-y-1">
                {criteria.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400/50 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            {criteria.preferred.length > 0 && (
              <div>
                <p className="text-[9px] font-medium text-rose-400/40 mb-1.5">Helpful</p>
                <ul className="space-y-1">
                  {criteria.preferred.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground/50">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400/20 mt-1.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Subjects That Matter Now */}
        <div>
          <p className="text-[10px] font-medium text-teal-400/60 mb-2">Subjects That Matter Now</p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s, i) => (
              <div key={i} className="rounded-lg border border-teal-500/15 bg-teal-500/[0.03] px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[11px] font-medium text-teal-400">{s.subject}</p>
                <p className="text-[10px] text-muted-foreground/40 mt-0.5">{s.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Outlook */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-medium text-blue-400/60">Industry Outlook</p>
            <span className={cn(
              'text-[9px] font-medium rounded-full px-2 py-0.5',
              career.growthOutlook === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
              career.growthOutlook === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-muted/30 text-muted-foreground/60'
            )}>
              {career.growthOutlook === 'high' ? 'High demand' : career.growthOutlook === 'medium' ? 'Growing' : 'Stable'}
            </span>
          </div>
          <ul className="space-y-2">
            {insights.trends.map((trend, i) => (
              <li key={i} className="flex items-start gap-2">
                <Sparkles className="h-3 w-3 text-blue-400/60 mt-0.5 shrink-0" />
                <span className="text-[11px] text-foreground/70 leading-relaxed">{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      </AccordionSection>

      {/* ── Section 4: Tools of the Trade ── */}
      <AccordionSection
        title="Tools of the Trade"
        icon={Wrench}
        iconColor="text-slate-400"
        iconBg="bg-slate-500/10"
        borderColor="border-slate-500/20"
        count={tools.length}
      >
        <div className="space-y-1.5">
          {tools.map((tool, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] text-foreground/70">{tool.name}</span>
              <span className="text-[9px] text-muted-foreground/40 rounded-full px-2 py-0.5 bg-muted/20">{tool.category}</span>
            </div>
          ))}
        </div>
      </AccordionSection>
      </div>

      {/* Your Reflections — compact */}
      <div className="rounded-xl border border-border/20 bg-card/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Pencil className="h-3 w-3 text-muted-foreground/40" />
          <p className="text-[10px] font-medium text-muted-foreground/50">Your Reflections</p>
          {notesSaved && (
            <span className="text-[9px] text-emerald-400 flex items-center gap-1 ml-auto">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </span>
          )}
        </div>
        {notesSaved && notes ? (
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] px-3 py-2">
            <p className="text-[11px] text-foreground/70 leading-relaxed whitespace-pre-wrap">{notes}</p>
            <button
              onClick={() => onNotesChange(notes)}
              className="text-[9px] text-muted-foreground/40 hover:text-foreground mt-1.5 transition-colors"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="What surprised you? Does this match what you expected?"
              className="flex-1 rounded-lg border border-border/30 bg-background/50 px-2.5 py-2 text-[11px] text-foreground/80 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none"
              rows={2}
              maxLength={2000}
            />
            <button
              onClick={handleSaveNotes}
              disabled={!notes.trim()}
              className="self-end px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-30 shrink-0"
            >
              <Save className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Next stage nudge */}
      <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-foreground/70">Ready to take action?</p>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            Grow gives you a personalised roadmap, recommended next steps, and real-world actions you can take right now.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shrink-0"
        >
          Grow <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// GROW TAB — Your Next Moves
// ============================================

// ── Generate contextual "Right Now" actions ──
function getRightNowActions(career: Career): { id: string; title: string; subtitle: string; icon: typeof Play; href?: string }[] {
  const subjects = getRelevantSubjects(career);
  const topSubject = subjects[0]?.subject ?? 'a key subject';
  const insights = getIndustryInsights(career);
  const topTrend = insights.trends[0] ?? '';

  return [
    {
      id: 'watch-ditl',
      title: `Watch: A Day in the Life of a ${career.title}`,
      subtitle: 'See what the role actually looks like — 5 min',
      icon: Play,
      href: `https://www.youtube.com/results?search_query=${encodeURIComponent(`"a day in the life" ${career.title}`)}`,
    },
    {
      id: 'explore-education',
      title: `Explore ${career.educationPath.split('(')[0].trim()} routes`,
      subtitle: 'Compare programmes, entry requirements, and locations',
      icon: GraduationCap,
      href: `https://www.google.com/search?q=${encodeURIComponent(`${career.title} education pathway ${career.educationPath.split('(')[0].trim()}`)}`,
    },
    {
      id: 'subject-connection',
      title: `Connect ${topSubject} to your goal`,
      subtitle: `Your schoolwork in ${topSubject} directly supports this path${topTrend ? ` — especially as ${topTrend.toLowerCase().slice(0, 60)}` : ''}`,
      icon: BookOpen,
    },
  ];
}

// ── Generate contextual "Make It Real" actions ──
function getMakeItRealActions(career: Career): { id: string; title: string; subtitle: string; icon: typeof Users }[] {
  const communities = getCareerCommunities(career);
  const topCommunity = communities[0]?.name ?? 'a professional group';
  const portfolioIdea = getPortfolioIdeas(career)[0];

  return [
    {
      id: 'talk-to-someone',
      title: `Have a 15-minute conversation with a ${career.title}`,
      subtitle: 'Ask them what they wish they knew at your age. One conversation can change everything.',
      icon: Users,
    },
    {
      id: 'build-something',
      title: portfolioIdea ? portfolioIdea.idea : `Start a small project related to ${career.title}`,
      subtitle: portfolioIdea ? portfolioIdea.description : `Join ${topCommunity} or build something hands-on to test the waters.`,
      icon: Briefcase,
    },
  ];
}

// ── Generate contextual AI insight ──
function getWhatThisMeansInsight(career: Career): string {
  const outlook = career.growthOutlook;
  const skills = career.keySkills.slice(0, 2).join(' and ');
  const education = career.educationPath.split('(')[0].trim();

  if (outlook === 'high') {
    return `${career.title} is a high-demand field with strong long-term prospects. The fact that you're exploring this now — before committing to ${education} — gives you a real advantage. Focus on building ${skills} through your current schoolwork and small real-world experiences. You're in a strong position.`;
  }
  if (outlook === 'medium') {
    return `This is a growing field with solid career paths. The ${education} route will take commitment, but the skills you build along the way — ${skills} — are transferable even if you change direction later. You're exploring at exactly the right time.`;
  }
  return `${career.title} is a stable career with clear pathways. While the field isn't rapidly expanding, it offers security and depth. Building strength in ${skills} now gives you a foundation whether you stay on this path or pivot later.`;
}

// ── School connection data ──
function getSchoolConnection(career: Career): { connected: { subject: string; relevance: string }[]; gap: string | null } {
  const subjects = getRelevantSubjects(career);
  const connected = subjects.slice(0, 3).map(s => ({ subject: s.subject, relevance: s.why }));
  const entry = getEntryCriteria(career);
  const gap = entry.requirements.length > 2 ? `Consider: ${entry.requirements[entry.requirements.length - 1]}` : null;
  return { connected, gap };
}

function V2GrowTab({
  goalTitle,
  career,
}: {
  goalTitle: string | null;
  career: Career | null;
}) {
  if (!goalTitle || !career) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
        <Rocket className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/60">Complete Discover and Understand first</p>
      </div>
    );
  }

  const rightNow = getRightNowActions(career);
  const makeItReal = getMakeItRealActions(career);
  const insight = getWhatThisMeansInsight(career);
  const school = getSchoolConnection(career);

  return (
    <div className="space-y-8">

      {/* ━━ School → Career anchor ━━ */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-4 w-4 text-foreground/40" />
          <p className="text-xs font-semibold text-foreground/60 tracking-wide uppercase">Your school → {career.title}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {school.connected.map((s) => (
            <div key={s.subject} className="rounded-xl border border-border/20 bg-background/30 p-3">
              <p className="text-[12px] font-semibold text-foreground/80">{s.subject}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1 leading-relaxed">{s.relevance}</p>
            </div>
          ))}
        </div>
        {school.gap && (
          <p className="text-[10px] text-muted-foreground/40 mt-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400/50 shrink-0" />
            {school.gap}
          </p>
        )}
      </div>

      {/* ━━ YOUR NEXT MOVES header ━━ */}
      <div>
        <h2 className="text-sm font-bold tracking-tight text-foreground/80">Your Next Moves</h2>
        <p className="text-[11px] text-muted-foreground/40 mt-0.5">Smart actions based on where you are right now</p>
      </div>

      {/* ━━ 1. RIGHT NOW ━━ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
          <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">Right Now</p>
          <p className="text-[10px] text-muted-foreground/30 ml-1">— things you can do this week</p>
        </div>
        <div className="space-y-2">
          {rightNow.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="group rounded-xl border border-border/25 bg-card/50 hover:bg-card/70 hover:border-border/40 transition-all">
                <div className="flex items-center gap-3 p-3.5">
                  <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-muted/50 transition-colors">
                    <Icon className="h-4 w-4 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground/80 leading-tight">{action.title}</p>
                    <p className="text-[10px] text-muted-foreground/45 mt-0.5 leading-relaxed">{action.subtitle}</p>
                  </div>
                  {action.href ? (
                    <a
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-border/30 bg-background/50 px-3 py-1.5 text-[10px] font-medium text-foreground/50 hover:text-foreground/70 hover:border-border/50 transition-all flex items-center gap-1.5"
                    >
                      Explore <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <div className="shrink-0 rounded-lg border border-border/20 bg-background/30 px-3 py-1.5 text-[10px] font-medium text-muted-foreground/30">
                      Ongoing
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━ 2. MAKE IT REAL ━━ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
          <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">Make It Real</p>
          <p className="text-[10px] text-muted-foreground/30 ml-1">— meaningful steps that build momentum</p>
        </div>
        <div className="space-y-2">
          {makeItReal.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="group rounded-xl border border-amber-500/10 bg-gradient-to-r from-card/70 via-card/60 to-amber-500/[0.02] hover:border-amber-500/20 transition-all">
                <div className="flex items-start gap-3.5 p-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/10 transition-colors">
                    <Icon className="h-4.5 w-4.5 text-amber-400/60 group-hover:text-amber-400/80 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/85 leading-tight">{action.title}</p>
                    <p className="text-[11px] text-muted-foreground/45 mt-1 leading-relaxed">{action.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ━━ 3. WHAT THIS MEANS ━━ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">What This Means</p>
        </div>
        <div className="rounded-2xl border border-border/15 bg-gradient-to-br from-muted/10 via-card/30 to-muted/5 p-5">
          <div className="flex gap-3.5">
            <div className="shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-foreground/20" />
            </div>
            <p className="text-[12px] text-foreground/55 leading-[1.7] font-light">
              {insight}
            </p>
          </div>
        </div>
      </section>

      {/* ━━ Quiet footer ━━ */}
      <div className="pt-2 text-center">
        <p className="text-[10px] text-muted-foreground/25">
          These suggestions adapt as you explore. Move at your own pace.
        </p>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function JourneyV2Prototype() {
  const { data: session } = useSession();
  const isYouth = session?.user?.role === 'YOUTH';
  const { data: goalsData } = useGoals(isYouth);
  const goalTitle = goalsData?.primaryGoal?.title ?? null;

  // Fetch real journey state
  const { data: journeyData } = useQuery<{ success: boolean; journey: JourneyUIState }>({
    queryKey: ['journey-state'],
    queryFn: async () => {
      const res = await fetch('/api/journey');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: isYouth,
    staleTime: 30_000,
  });

  const journey = journeyData?.journey ?? null;

  // Look up real career data
  const career = useMemo(() => {
    if (!goalTitle) return null;
    return getAllCareers().find((c) => c.title === goalTitle) || null;
  }, [goalTitle]);

  const [activeTab, setActiveTab] = useState<V2Tab>('discover');
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  const [understandNotes, setUnderstandNotes] = useState('');
  const [understandNotesSaved, setUnderstandNotesSaved] = useState(false);

  const tabs: { id: V2Tab; label: string; subtitle: string; icon: typeof Search; color: string; colorHex: string }[] = [
    { id: 'discover', label: 'Discover', subtitle: 'Explore the Career', icon: Search, color: 'teal', colorHex: '#14b8a6' },
    { id: 'understand', label: 'Understand', subtitle: 'Know the Role', icon: Globe, color: 'emerald', colorHex: '#10b981' },
    { id: 'grow', label: 'Grow', subtitle: 'Take Action', icon: Rocket, color: 'amber', colorHex: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">V2 Prototype</span>
              <Link href="/my-journey" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                Back to current journey
              </Link>
            </div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {goalTitle ? (
                <>
                  <span className="text-muted-foreground/50">My Journey to </span>
                  <span className="text-foreground">{goalTitle}</span>
                  <button
                    onClick={() => setGoalSheetOpen(true)}
                    className="p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                    title="Change goal"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setGoalSheetOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
                >
                  <Target className="h-4 w-4" /> Set a career goal
                </button>
              )}
            </h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative rounded-xl border p-3 sm:p-4 text-left transition-all',
                  isActive && 'ring-1',
                  !isActive && 'border-border/50 hover:border-border/80 hover:bg-muted/30',
                )}
                style={isActive ? {
                  borderColor: `${tab.colorHex}60`,
                  backgroundColor: `${tab.colorHex}08`,
                  boxShadow: `0 0 15px ${tab.colorHex}20`,
                  // ring color
                } : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TabIcon className="h-4 w-4" style={isActive ? { color: tab.colorHex } : { color: 'var(--muted-foreground)' }} />
                  <span className={cn('text-sm font-semibold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {tab.label}
                  </span>
                </div>
                <p className={cn('text-[11px]', isActive ? 'text-foreground/60' : 'text-muted-foreground/40')}>
                  {tab.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'discover' && (
              <V2DiscoverTab
                career={career}
                goalTitle={goalTitle}
                onContinue={() => setActiveTab('understand')}
              />
            )}
            {activeTab === 'understand' && (
              <V2UnderstandTab
                career={career}
                goalTitle={goalTitle}
                journey={journey}
                notes={understandNotes}
                onNotesChange={(v) => { setUnderstandNotes(v); setUnderstandNotesSaved(false); }}
                notesSaved={understandNotesSaved}
                onSaveNotes={() => setUnderstandNotesSaved(true)}
                onContinue={() => setActiveTab('grow')}
              />
            )}
            {activeTab === 'grow' && (
              <V2GrowTab
                goalTitle={goalTitle}
                career={career}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="border-t border-border/20 mt-12 pt-4 text-center">
          <p className="text-[10px] text-muted-foreground/30">
            V2 Prototype — uses your real career goal and journey data. Notes are not saved to the database.
          </p>
        </div>
      </div>

      {/* Goal Selection Sheet — real component */}
      <GoalSelectionSheet
        open={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        primaryGoal={goalsData?.primaryGoal || null}
        secondaryGoal={goalsData?.secondaryGoal || null}
        onSuccess={() => setGoalSheetOpen(false)}
      />
    </div>
  );
}

import type { InterviewQuestion, GenerateOptions, Category, Difficulty } from "./types";

// Comprehensive question bank organized by category
const questionBank: Record<Category, InterviewQuestion[]> = {
  General: [
    { id: "g1", category: "General", difficulty: "Easy", questionText: "Tell me about yourself", tip: "Keep it brief (2 min). Focus on relevant experience and why you want this role.", tags: ["intro", "personal"], answerHint: "Use: Present → Past → Future structure", isGenerated: false },
    { id: "g2", category: "General", difficulty: "Easy", questionText: "Why do you want to work here?", tip: "Research the company. Mention specific things that attract you.", tags: ["motivation", "company"], isGenerated: false },
    { id: "g3", category: "General", difficulty: "Easy", questionText: "What do you know about our company?", tip: "Do your research! Check their website, news, and social media.", tags: ["research", "company"], isGenerated: false },
    { id: "g4", category: "General", difficulty: "Medium", questionText: "What are your strengths and weaknesses?", tip: "For strengths, give examples. For weaknesses, show what you're doing to improve.", tags: ["self-awareness"], answerHint: "Pick a real weakness you're actively improving", isGenerated: false },
    { id: "g5", category: "General", difficulty: "Medium", questionText: "Where do you see yourself in 5 years?", tip: "Show ambition but be realistic. Connect goals to growth opportunities.", tags: ["goals", "planning"], isGenerated: false },
    { id: "g6", category: "General", difficulty: "Medium", questionText: "Tell me about a challenge you've overcome", tip: "Use STAR: Situation, Task, Action, Result. Focus on what you learned.", tags: ["behavioral", "problem-solving"], answerHint: "STAR method: Situation → Task → Action → Result", isGenerated: false },
    { id: "g7", category: "General", difficulty: "Medium", questionText: "Why should we hire you?", tip: "Connect your skills to what they need. Be confident but not arrogant.", tags: ["pitch", "value"], isGenerated: false },
    { id: "g8", category: "General", difficulty: "Hard", questionText: "Tell me about a time you failed", tip: "Be honest. Focus on what you learned and how you improved.", tags: ["behavioral", "failure"], answerHint: "Show growth mindset and accountability", isGenerated: false },
    { id: "g9", category: "General", difficulty: "Hard", questionText: "How do you handle conflict with coworkers?", tip: "Show communication skills and professionalism. Give a real example.", tags: ["conflict", "teamwork"], isGenerated: false },
    { id: "g10", category: "General", difficulty: "Easy", questionText: "What motivates you?", tip: "Be genuine. Connect your motivation to the role.", tags: ["motivation", "personal"], isGenerated: false },
    { id: "g11", category: "General", difficulty: "Medium", questionText: "Describe your ideal work environment", tip: "Be honest but flexible. Show you can adapt.", tags: ["culture", "preferences"], isGenerated: false },
    { id: "g12", category: "General", difficulty: "Hard", questionText: "What would you do in your first 30 days?", tip: "Show initiative. Focus on learning, building relationships, and quick wins.", tags: ["planning", "onboarding"], isGenerated: false },
  ],
  Tech: [
    { id: "t1", category: "Tech", difficulty: "Easy", questionText: "What programming languages do you know?", tip: "Be honest about skill levels. It's OK to be learning!", tags: ["technical", "skills"], isGenerated: false },
    { id: "t2", category: "Tech", difficulty: "Easy", questionText: "Tell me about a project you've built", tip: "Describe the problem, your approach, and what you learned.", tags: ["portfolio", "experience"], answerHint: "Structure: Problem → Solution → Tech used → Learning", isGenerated: false },
    { id: "t3", category: "Tech", difficulty: "Easy", questionText: "How do you stay updated with technology?", tip: "Mention specific resources: newsletters, YouTube, courses, communities.", tags: ["learning", "growth"], isGenerated: false },
    { id: "t4", category: "Tech", difficulty: "Medium", questionText: "How do you approach debugging?", tip: "Show systematic thinking: reproduce, check logs, isolate, test hypotheses.", tags: ["debugging", "problem-solving"], answerHint: "Step-by-step: Reproduce → Isolate → Hypothesize → Test", isGenerated: false },
    { id: "t5", category: "Tech", difficulty: "Medium", questionText: "Explain a technical concept to a non-technical person", tip: "Use analogies and simple language. This tests communication skills.", tags: ["communication", "explanation"], isGenerated: false },
    { id: "t6", category: "Tech", difficulty: "Medium", questionText: "How do you handle tight deadlines?", tip: "Show prioritization skills. Give examples of delivering under pressure.", tags: ["time-management", "pressure"], isGenerated: false },
    { id: "t7", category: "Tech", difficulty: "Hard", questionText: "Describe a time you disagreed with a technical decision", tip: "Show professionalism. Focus on data-driven discussion and compromise.", tags: ["conflict", "technical"], isGenerated: false },
    { id: "t8", category: "Tech", difficulty: "Hard", questionText: "How do you approach learning a new technology?", tip: "Show your learning process: docs, tutorials, projects, asking questions.", tags: ["learning", "adaptability"], isGenerated: false },
    { id: "t9", category: "Tech", difficulty: "Easy", questionText: "What's your favorite tech tool and why?", tip: "Be genuine. Explain how it improves your workflow.", tags: ["tools", "preferences"], isGenerated: false },
    { id: "t10", category: "Tech", difficulty: "Medium", questionText: "How do you ensure code quality?", tip: "Mention testing, code reviews, documentation, and standards.", tags: ["quality", "best-practices"], isGenerated: false },
  ],
  Healthcare: [
    { id: "h1", category: "Healthcare", difficulty: "Easy", questionText: "Why do you want to work in healthcare?", tip: "Be genuine about your motivation to help others.", tags: ["motivation", "personal"], isGenerated: false },
    { id: "h2", category: "Healthcare", difficulty: "Medium", questionText: "How do you handle stressful situations?", tip: "Give examples. Show you can stay calm and prioritize care.", tags: ["stress", "pressure"], answerHint: "Example + How you stayed calm + Outcome", isGenerated: false },
    { id: "h3", category: "Healthcare", difficulty: "Medium", questionText: "Tell me about a time you showed empathy", tip: "Share a genuine story about understanding others.", tags: ["empathy", "soft-skills"], isGenerated: false },
    { id: "h4", category: "Healthcare", difficulty: "Hard", questionText: "How do you handle difficult patients?", tip: "Show patience and understanding that people are often scared.", tags: ["conflict", "patient-care"], isGenerated: false },
    { id: "h5", category: "Healthcare", difficulty: "Hard", questionText: "What would you do if you made a mistake?", tip: "Honesty is crucial. Report it, learn from it, prevent it.", tags: ["accountability", "ethics"], answerHint: "Acknowledge → Report → Learn → Prevent", isGenerated: false },
    { id: "h6", category: "Healthcare", difficulty: "Easy", questionText: "What healthcare experience do you have?", tip: "Include volunteer work, internships, and relevant courses.", tags: ["experience", "background"], isGenerated: false },
    { id: "h7", category: "Healthcare", difficulty: "Medium", questionText: "How do you prioritize tasks in a busy environment?", tip: "Show triage thinking: urgent vs important.", tags: ["prioritization", "time-management"], isGenerated: false },
    { id: "h8", category: "Healthcare", difficulty: "Medium", questionText: "How do you communicate with patients' families?", tip: "Show empathy and clear communication skills.", tags: ["communication", "family-care"], isGenerated: false },
  ],
  Green: [
    { id: "gr1", category: "Green", difficulty: "Easy", questionText: "Why are you interested in green energy?", tip: "Show genuine passion for sustainability.", tags: ["motivation", "sustainability"], isGenerated: false },
    { id: "gr2", category: "Green", difficulty: "Medium", questionText: "How do you handle working in challenging conditions?", tip: "Give examples of outdoor work or physical challenges.", tags: ["physical", "resilience"], isGenerated: false },
    { id: "gr3", category: "Green", difficulty: "Medium", questionText: "Describe your approach to workplace safety", tip: "Safety is critical. Show you take it seriously.", tags: ["safety", "protocols"], answerHint: "Specific examples of following safety procedures", isGenerated: false },
    { id: "gr4", category: "Green", difficulty: "Easy", questionText: "What technical certifications do you have?", tip: "List relevant certs. If none yet, show your plan to get them.", tags: ["certifications", "qualifications"], isGenerated: false },
    { id: "gr5", category: "Green", difficulty: "Medium", questionText: "How do you work in a team on physical projects?", tip: "Emphasize communication and following procedures.", tags: ["teamwork", "collaboration"], isGenerated: false },
    { id: "gr6", category: "Green", difficulty: "Hard", questionText: "Describe a time you identified a safety issue", tip: "Show proactive safety awareness and proper reporting.", tags: ["safety", "initiative"], isGenerated: false },
    { id: "gr7", category: "Green", difficulty: "Easy", questionText: "What do you know about renewable energy trends?", tip: "Show you follow the industry and understand current developments.", tags: ["industry-knowledge", "trends"], isGenerated: false },
  ],
  Creative: [
    { id: "c1", category: "Creative", difficulty: "Easy", questionText: "Walk me through your portfolio", tip: "Explain your process, not just the final result.", tags: ["portfolio", "presentation"], answerHint: "For each piece: Brief → Process → Outcome", isGenerated: false },
    { id: "c2", category: "Creative", difficulty: "Medium", questionText: "How do you handle creative feedback?", tip: "Show you're open to feedback and see it as improvement.", tags: ["feedback", "growth"], isGenerated: false },
    { id: "c3", category: "Creative", difficulty: "Medium", questionText: "What's your creative process?", tip: "Describe your workflow: research, ideation, drafts, refinement.", tags: ["process", "methodology"], isGenerated: false },
    { id: "c4", category: "Creative", difficulty: "Easy", questionText: "How do you stay inspired?", tip: "Mention specific sources and how you avoid creative blocks.", tags: ["inspiration", "creativity"], isGenerated: false },
    { id: "c5", category: "Creative", difficulty: "Hard", questionText: "Tell me about a project that didn't go as planned", tip: "Show resilience and problem-solving.", tags: ["failure", "adaptability"], isGenerated: false },
    { id: "c6", category: "Creative", difficulty: "Medium", questionText: "How do you handle tight creative deadlines?", tip: "Show you can deliver quality work under pressure.", tags: ["deadlines", "time-management"], isGenerated: false },
    { id: "c7", category: "Creative", difficulty: "Hard", questionText: "How do you balance creativity with client requirements?", tip: "Show you can meet needs while adding creative value.", tags: ["client-work", "balance"], isGenerated: false },
    { id: "c8", category: "Creative", difficulty: "Easy", questionText: "What tools do you use for your work?", tip: "Be specific about software and explain why you chose them.", tags: ["tools", "technical"], isGenerated: false },
  ],
};

// Generate a deterministic set based on options
export function generateQuestionSet(options: GenerateOptions): InterviewQuestion[] {
  const { category, difficultyMix, count } = options;

  // Get questions from the appropriate category
  const sourceQuestions = category === "All" as unknown as Category
    ? Object.values(questionBank).flat()
    : questionBank[category] || questionBank.General;

  const result: InterviewQuestion[] = [];

  // Helper to get questions by difficulty
  const getByDifficulty = (diff: Difficulty, limit: number): InterviewQuestion[] => {
    const filtered = sourceQuestions.filter(q =>
      q.difficulty === diff && !result.some(r => r.id === q.id)
    );
    return shuffleDeterministic(filtered, options.roleTarget || "default").slice(0, limit);
  };

  // Add questions based on difficulty mix
  result.push(...getByDifficulty("Easy", difficultyMix.easy));
  result.push(...getByDifficulty("Medium", difficultyMix.medium));
  result.push(...getByDifficulty("Hard", difficultyMix.hard));

  // If we need more questions to reach count, fill from any difficulty
  while (result.length < count) {
    const remaining = sourceQuestions.filter(q => !result.some(r => r.id === q.id));
    if (remaining.length === 0) break;
    result.push(remaining[0]);
  }

  // Mark as generated and return
  return result.slice(0, count).map(q => ({
    ...q,
    id: `gen_${q.id}_${Date.now()}`,
    isGenerated: true,
  }));
}

// Deterministic shuffle based on seed string
function shuffleDeterministic<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let seedNum = hashString(seed);

  for (let i = result.length - 1; i > 0; i--) {
    seedNum = (seedNum * 1103515245 + 12345) & 0x7fffffff;
    const j = seedNum % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get all seeded questions for a category
export function getSeededQuestions(category: Category | "All"): InterviewQuestion[] {
  if (category === "All") {
    return Object.values(questionBank).flat();
  }
  return questionBank[category] || [];
}

// Get question by ID
export function getQuestionById(id: string): InterviewQuestion | undefined {
  for (const questions of Object.values(questionBank)) {
    const found = questions.find(q => q.id === id || id.includes(q.id));
    if (found) return found;
  }
  return undefined;
}

// Interview Prep Types

export type Category = "General" | "Tech" | "Healthcare" | "Green" | "Creative";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface InterviewQuestion {
  id: string;
  category: Category;
  difficulty: Difficulty;
  questionText: string;
  tip?: string;
  answerHint?: string;
  tags: string[];
  isGenerated: boolean;
}

export interface UserQuestionState {
  id: string;
  questionId: string;
  saved: boolean;
  practicedCount: number;
  lastPracticedAt?: Date;
  confidence?: number; // 1-5
  notes?: string;
}

export interface GenerateOptions {
  category: Category;
  roleTarget?: string;
  difficultyMix: {
    easy: number;
    medium: number;
    hard: number;
  };
  focusAreas?: string[];
  count: number;
}

export interface GeneratedSet {
  id: string;
  questions: InterviewQuestion[];
  generatedAt: Date;
  generatorType: "MOCK" | "AI";
}

export interface QuestionWithState extends InterviewQuestion {
  state?: UserQuestionState;
}

// Filter state for the toolbar
export interface FilterState {
  category: Category | "All";
  difficulty: Difficulty | "All";
  searchQuery: string;
  showSavedOnly: boolean;
}

// Stats for the user
export interface UserStats {
  totalPracticed: number;
  totalSaved: number;
  avgConfidence: number;
}

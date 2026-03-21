export interface SavedCuriosity {
  careerId: string;
  careerTitle: string;
  careerEmoji: string;
  savedAt: string;
  note?: string;
}

export interface GrowthSnapshot {
  id: string;
  createdAt: string;
  traits?: string[];
  highlights?: string[];
}

export interface FearEntry {
  id: string;
  createdAt: string;
  text: string;
}

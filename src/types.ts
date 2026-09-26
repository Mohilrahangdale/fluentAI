export type EnglishLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type LearningGoal =
  | 'Speaking Confidence'
  | 'Grammar'
  | 'Vocabulary'
  | 'Interview English'
  | 'Fluency';

export interface User {
  id: string;
  name: string;
  email: string;
  englishLevel: EnglishLevel;
  learningGoals: LearningGoal[];
  streak: number;
  lastActiveDate: string;
  totalSpeakingSeconds: number;
  wordsLearnedCount: number;
  sessionsCount: number;
  mistakesCount: number;
  createdAt: string;
  darkMode?: boolean;
}

export type TopicCategory =
  | 'free_talk'
  | 'daily_topic'
  | 'grammar'
  | 'interview'
  | 'situational';

export interface PracticeTopic {
  id: string;
  title: string;
  category: TopicCategory;
  description: string;
  starterQuestion: string;
  suggestedKeywords: string[];
  iconName: string;
  situationalContext?: string;
  targetDurationMinutes?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  prompt: string;
  starterQuestion: string;
  durationMinutes: number;
  targetGoal: string;
  date: string;
  completed: boolean;
}

export type MistakeCategory =
  | 'Grammar'
  | 'Vocabulary'
  | 'Sentence Formation'
  | 'Common Mistakes';

export interface MistakeItem {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  category: MistakeCategory;
  timestamp: string;
  mastered: boolean;
  practiceCount: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  example: string;
  dateAdded: string;
  learned: boolean;
}

export interface SessionReportData {
  id: string;
  topicTitle: string;
  topicCategory: string;
  durationSeconds: number;
  timestamp: string;
  userTurnCount: number;
  mistakesCaught: MistakeItem[];
  newVocabulary: VocabularyItem[];
  topicsDiscussed: string[];
  areasToImprove: string[];
  suggestedNextPractice: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  correction?: {
    original: string;
    better: string;
    why: string;
  };
}

export type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking';

import {
  User,
  SessionReportData,
  MistakeItem,
  VocabularyItem,
  DailyChallenge,
  EnglishLevel,
  LearningGoal,
} from '../types';
import { INITIAL_MISTAKES, INITIAL_VOCABULARY, DAILY_CHALLENGES } from '../data/topics';

const STORAGE_KEYS = {
  CURRENT_USER: 'fluentai_current_user',
  USERS_DB: 'fluentai_users_db',
  SESSIONS: 'fluentai_sessions',
  MISTAKES: 'fluentai_mistakes',
  VOCABULARY: 'fluentai_vocabulary',
  CHALLENGES: 'fluentai_challenges',
  DARK_MODE: 'fluentai_dark_mode',
};

const DEFAULT_DEMO_USER: User = {
  id: 'demo-user-1',
  name: 'Alex Patel',
  email: 'learner@fluentai.local',
  englishLevel: 'Intermediate',
  learningGoals: ['Speaking Confidence', 'Grammar', 'Fluency'],
  streak: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalSpeakingSeconds: 2740, // ~45 mins
  wordsLearnedCount: 14,
  sessionsCount: 6,
  mistakesCount: 8,
  createdAt: '2026-03-01T10:00:00.000Z',
  darkMode: false,
};

export class StorageService {
  // --- USER AUTH & PROFILE ---
  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  static getRegisteredUsers(): Array<{ user: User; passwordHash: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (!data) {
        // Seed default demo user
        const initial = [{ user: DEFAULT_DEMO_USER, passwordHash: 'password123' }];
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveUserToDB(user: User, passwordHash: string): void {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.user.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { user, passwordHash };
    } else {
      users.push({ user, passwordHash });
    }
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
  }

  static updateUser(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    this.setCurrentUser(updated);

    // Also update in users DB
    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.user.id === updated.id);
    if (idx >= 0) {
      users[idx].user = updated;
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    }
    return updated;
  }

  static recordSpeakingTime(additionalSeconds: number): void {
    const user = this.getCurrentUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    let newStreak = user.streak;

    if (user.lastActiveDate !== today) {
      // If practiced yesterday, increment streak; otherwise restart or keep 1
      const lastDate = new Date(user.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    this.updateUser({
      totalSpeakingSeconds: (user.totalSpeakingSeconds || 0) + additionalSeconds,
      sessionsCount: (user.sessionsCount || 0) + 1,
      streak: newStreak,
      lastActiveDate: today,
    });
  }

  // --- SESSIONS ---
  static getSessions(): SessionReportData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSession(session: SessionReportData): void {
    const sessions = this.getSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Also record new mistakes to mistake bank
    if (session.mistakesCaught && session.mistakesCaught.length > 0) {
      session.mistakesCaught.forEach((m) => this.addMistake(m));
    }

    // Also record vocabulary if any
    if (session.newVocabulary && session.newVocabulary.length > 0) {
      session.newVocabulary.forEach((v) => this.addVocabulary(v));
    }

    // Update speaking time on user
    this.recordSpeakingTime(session.durationSeconds);
  }

  // --- MISTAKES ---
  static getMistakes(): MistakeItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(INITIAL_MISTAKES));
        return INITIAL_MISTAKES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MISTAKES;
    }
  }

  static addMistake(mistake: MistakeItem): void {
    const list = this.getMistakes();
    // Avoid exact duplicates
    const exists = list.some(
      (m) => m.originalText.toLowerCase().trim() === mistake.originalText.toLowerCase().trim()
    );
    if (!exists) {
      list.unshift(mistake);
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list));
      const user = this.getCurrentUser();
      if (user) {
        this.updateUser({ mistakesCount: (user.mistakesCount || 0) + 1 });
      }
    }
  }

  static toggleMistakeMastered(id: string): void {
    const list = this.getMistakes();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.mastered = !item.mastered;
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list));
    }
  }

  static incrementMistakePracticeCount(id: string): void {
    const list = this.getMistakes();
    const item = list.find((m) => m.id === id);
    if (item) {
      item.practiceCount = (item.practiceCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list));
    }
  }

  // --- VOCABULARY ---
  static getVocabulary(): VocabularyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(INITIAL_VOCABULARY));
        return INITIAL_VOCABULARY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_VOCABULARY;
    }
  }

  static addVocabulary(item: VocabularyItem): void {
    const list = this.getVocabulary();
    const exists = list.some((v) => v.word.toLowerCase() === item.word.toLowerCase());
    if (!exists) {
      list.unshift(item);
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(list));
      const user = this.getCurrentUser();
      if (user) {
        this.updateUser({ wordsLearnedCount: (user.wordsLearnedCount || 0) + 1 });
      }
    }
  }

  static removeVocabulary(id: string): void {
    const list = this.getVocabulary().filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(list));
  }

  static toggleVocabularyLearned(id: string): void {
    const list = this.getVocabulary();
    const item = list.find((v) => v.id === id);
    if (item) {
      item.learned = !item.learned;
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(list));
    }
  }

  // --- DAILY CHALLENGES ---
  static getChallenges(): DailyChallenge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(DAILY_CHALLENGES));
        return DAILY_CHALLENGES;
      }
      return JSON.parse(data);
    } catch {
      return DAILY_CHALLENGES;
    }
  }

  static completeChallenge(id: string): void {
    const list = this.getChallenges();
    const item = list.find((c) => c.id === id);
    if (item) {
      item.completed = true;
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(list));
    }
  }
}

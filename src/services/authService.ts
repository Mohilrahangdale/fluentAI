import { User, EnglishLevel, LearningGoal } from '../types';
import { StorageService } from './storageService';

export class AuthService {
  // Simple deterministic hash simulation for local zero-cost client/server store
  private static hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(16) + '_' + password.length;
  }

  static signup(data: {
    name: string;
    email: string;
    password: string;
    englishLevel?: EnglishLevel;
    learningGoals?: LearningGoal[];
  }): { success: boolean; user?: User; error?: string } {
    const emailClean = data.email.trim().toLowerCase();
    if (!data.name.trim()) return { success: false, error: 'Please provide your name.' };
    if (!emailClean || !emailClean.includes('@')) return { success: false, error: 'Please provide a valid email.' };
    if (!data.password || data.password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const users = StorageService.getRegisteredUsers();
    const existing = users.find((u) => u.user.email.toLowerCase() === emailClean);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name: data.name.trim(),
      email: emailClean,
      englishLevel: data.englishLevel || 'Beginner',
      learningGoals: data.learningGoals || ['Speaking Confidence', 'Fluency'],
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalSpeakingSeconds: 0,
      wordsLearnedCount: 0,
      sessionsCount: 0,
      mistakesCount: 0,
      createdAt: new Date().toISOString(),
      darkMode: false,
    };

    const passwordHash = this.hashPassword(data.password);
    StorageService.saveUserToDB(newUser, passwordHash);
    StorageService.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  static login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const emailClean = email.trim().toLowerCase();
    if (!emailClean) return { success: false, error: 'Email is required.' };
    if (!password) return { success: false, error: 'Password is required.' };

    const users = StorageService.getRegisteredUsers();
    const found = users.find((u) => u.user.email.toLowerCase() === emailClean);

    if (!found) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    const expectedHash = this.hashPassword(password);
    if (found.passwordHash !== expectedHash && found.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    StorageService.setCurrentUser(found.user);
    return { success: true, user: found.user };
  }

  static loginDemo(): User {
    const users = StorageService.getRegisteredUsers();
    let demo = users.find((u) => u.user.email === 'learner@fluentai.local')?.user;
    if (!demo) {
      demo = {
        id: 'demo-user-1',
        name: 'Alex Patel',
        email: 'learner@fluentai.local',
        englishLevel: 'Intermediate',
        learningGoals: ['Speaking Confidence', 'Grammar', 'Fluency'],
        streak: 5,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalSpeakingSeconds: 2740,
        wordsLearnedCount: 14,
        sessionsCount: 6,
        mistakesCount: 8,
        createdAt: '2026-03-01T10:00:00.000Z',
        darkMode: false,
      };
      StorageService.saveUserToDB(demo, 'password123');
    }
    StorageService.setCurrentUser(demo);
    return demo;
  }

  static logout(): void {
    StorageService.setCurrentUser(null);
  }
}

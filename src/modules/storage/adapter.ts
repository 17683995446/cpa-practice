import { UserProgress, TopicId, QuestionId } from '../core';

export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
  getAllKeys(): string[];
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'cpa_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keys = this.getAllKeys();
    keys.forEach(key => this.removeItem(key));
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }
}

export interface ProgressStorageSchema {
  userProgress: Record<TopicId, UserProgress>;
  wrongQuestions: QuestionId[];
  favouriteQuestions: QuestionId[];
  currentQuestionIndex: Record<TopicId, number>;
  userAnswers: Record<QuestionId, number | null>;
  showExplanations: Record<QuestionId, boolean>;
}

export const STORAGE_KEYS = {
  USER_PROGRESS: 'userProgress',
  WRONG_QUESTIONS: 'wrongQuestions',
  FAVOURITE_QUESTIONS: 'favouriteQuestions',
  CURRENT_QUESTION_INDEX: 'currentQuestionIndex',
  USER_ANSWERS: 'userAnswers',
  SHOW_EXPLANATIONS: 'showExplanations'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

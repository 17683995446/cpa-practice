import { UserProgress, TopicId, QuestionId } from '../core';
import { StorageAdapter, STORAGE_KEYS } from './adapter';

export interface PersistenceService {
  saveUserProgress(progress: Record<TopicId, UserProgress>): void;
  loadUserProgress(): Record<TopicId, UserProgress>;
  saveWrongQuestions(questions: QuestionId[]): void;
  loadWrongQuestions(): QuestionId[];
  saveFavouriteQuestions(questions: QuestionId[]): void;
  loadFavouriteQuestions(): QuestionId[];
  saveCurrentQuestionIndex(index: Record<TopicId, number>): void;
  loadCurrentQuestionIndex(): Record<TopicId, number>;
  saveUserAnswers(answers: Record<QuestionId, number | null>): void;
  loadUserAnswers(): Record<QuestionId, number | null>;
  saveShowExplanations(explanations: Record<QuestionId, boolean>): void;
  loadShowExplanations(): Record<QuestionId, boolean>;
  clearAll(): void;
}

export class PersistenceServiceImpl implements PersistenceService {
  constructor(private adapter: StorageAdapter) {}

  private isValidObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private isValidArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  }

  saveUserProgress(progress: Record<TopicId, UserProgress>): void {
    this.adapter.setItem(STORAGE_KEYS.USER_PROGRESS, progress);
  }

  loadUserProgress(): Record<TopicId, UserProgress> {
    const value = this.adapter.getItem<Record<TopicId, UserProgress>>(STORAGE_KEYS.USER_PROGRESS);
    return this.isValidObject(value) ? value : {};
  }

  saveWrongQuestions(questions: QuestionId[]): void {
    this.adapter.setItem(STORAGE_KEYS.WRONG_QUESTIONS, questions);
  }

  loadWrongQuestions(): QuestionId[] {
    const value = this.adapter.getItem<QuestionId[]>(STORAGE_KEYS.WRONG_QUESTIONS);
    return this.isValidArray(value) ? value : [];
  }

  saveFavouriteQuestions(questions: QuestionId[]): void {
    this.adapter.setItem(STORAGE_KEYS.FAVOURITE_QUESTIONS, questions);
  }

  loadFavouriteQuestions(): QuestionId[] {
    const value = this.adapter.getItem<QuestionId[]>(STORAGE_KEYS.FAVOURITE_QUESTIONS);
    return this.isValidArray(value) ? value : [];
  }

  saveCurrentQuestionIndex(index: Record<TopicId, number>): void {
    this.adapter.setItem(STORAGE_KEYS.CURRENT_QUESTION_INDEX, index);
  }

  loadCurrentQuestionIndex(): Record<TopicId, number> {
    const value = this.adapter.getItem<Record<TopicId, number>>(STORAGE_KEYS.CURRENT_QUESTION_INDEX);
    return this.isValidObject(value) ? value : {};
  }

  saveUserAnswers(answers: Record<QuestionId, number | null>): void {
    this.adapter.setItem(STORAGE_KEYS.USER_ANSWERS, answers);
  }

  loadUserAnswers(): Record<QuestionId, number | null> {
    const value = this.adapter.getItem<Record<QuestionId, number | null>>(STORAGE_KEYS.USER_ANSWERS);
    return this.isValidObject(value) ? value : {};
  }

  saveShowExplanations(explanations: Record<QuestionId, boolean>): void {
    this.adapter.setItem(STORAGE_KEYS.SHOW_EXPLANATIONS, explanations);
  }

  loadShowExplanations(): Record<QuestionId, boolean> {
    const value = this.adapter.getItem<Record<QuestionId, boolean>>(STORAGE_KEYS.SHOW_EXPLANATIONS);
    return this.isValidObject(value) ? value : {};
  }

  clearAll(): void {
    this.adapter.clear();
  }
}

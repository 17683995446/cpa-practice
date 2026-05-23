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

  saveUserProgress(progress: Record<TopicId, UserProgress>): void {
    this.adapter.setItem(STORAGE_KEYS.USER_PROGRESS, progress);
  }

  loadUserProgress(): Record<TopicId, UserProgress> {
    return this.adapter.getItem<Record<TopicId, UserProgress>>(STORAGE_KEYS.USER_PROGRESS) || {};
  }

  saveWrongQuestions(questions: QuestionId[]): void {
    this.adapter.setItem(STORAGE_KEYS.WRONG_QUESTIONS, questions);
  }

  loadWrongQuestions(): QuestionId[] {
    return this.adapter.getItem<QuestionId[]>(STORAGE_KEYS.WRONG_QUESTIONS) || [];
  }

  saveFavouriteQuestions(questions: QuestionId[]): void {
    this.adapter.setItem(STORAGE_KEYS.FAVOURITE_QUESTIONS, questions);
  }

  loadFavouriteQuestions(): QuestionId[] {
    return this.adapter.getItem<QuestionId[]>(STORAGE_KEYS.FAVOURITE_QUESTIONS) || [];
  }

  saveCurrentQuestionIndex(index: Record<TopicId, number>): void {
    this.adapter.setItem(STORAGE_KEYS.CURRENT_QUESTION_INDEX, index);
  }

  loadCurrentQuestionIndex(): Record<TopicId, number> {
    return this.adapter.getItem<Record<TopicId, number>>(STORAGE_KEYS.CURRENT_QUESTION_INDEX) || {};
  }

  saveUserAnswers(answers: Record<QuestionId, number | null>): void {
    this.adapter.setItem(STORAGE_KEYS.USER_ANSWERS, answers);
  }

  loadUserAnswers(): Record<QuestionId, number | null> {
    return this.adapter.getItem<Record<QuestionId, number | null>>(STORAGE_KEYS.USER_ANSWERS) || {};
  }

  saveShowExplanations(explanations: Record<QuestionId, boolean>): void {
    this.adapter.setItem(STORAGE_KEYS.SHOW_EXPLANATIONS, explanations);
  }

  loadShowExplanations(): Record<QuestionId, boolean> {
    return this.adapter.getItem<Record<QuestionId, boolean>>(STORAGE_KEYS.SHOW_EXPLANATIONS) || {};
  }

  clearAll(): void {
    this.adapter.clear();
  }
}

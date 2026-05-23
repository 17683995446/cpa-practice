import { UserProgress, TopicId, QuestionId, ProgressStats } from '../core';
import { ProgressCalculator } from './calculator';

export interface ProgressService {
  updateProgress(topicId: TopicId, questionId: QuestionId, isCorrect: boolean): UserProgress;
  getProgress(topicId: TopicId): UserProgress;
  resetTopicProgress(topicId: TopicId): void;
  getOverallProgress(): ProgressStats;
  getTopicProgress(topicId: TopicId): ProgressStats;
  getWrongQuestions(): QuestionId[];
  addWrongQuestion(questionId: QuestionId): void;
  removeWrongQuestion(questionId: QuestionId): void;
  getFavouriteQuestions(): QuestionId[];
  addFavouriteQuestion(questionId: QuestionId): void;
  removeFavouriteQuestion(questionId: QuestionId): void;
}

export interface ProgressStorage {
  getUserProgress(): Record<TopicId, UserProgress>;
  setUserProgress(progress: Record<TopicId, UserProgress>): void;
  getWrongQuestions(): QuestionId[];
  setWrongQuestions(questions: QuestionId[]): void;
  getFavouriteQuestions(): QuestionId[];
  setFavouriteQuestions(questions: QuestionId[]): void;
  clearAll(): void;
}

export class ProgressServiceImpl implements ProgressService {
  private userProgress: Record<TopicId, UserProgress> = {};
  private wrongQuestions: QuestionId[] = [];
  private favouriteQuestions: QuestionId[] = [];

  constructor(
    private calculator: ProgressCalculator,
    private storage: ProgressStorage
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.userProgress = this.storage.getUserProgress() || {};
    this.wrongQuestions = this.storage.getWrongQuestions() || [];
    this.favouriteQuestions = this.storage.getFavouriteQuestions() || [];
  }

  private saveToStorage(): void {
    this.storage.setUserProgress(this.userProgress);
    this.storage.setWrongQuestions(this.wrongQuestions);
    this.storage.setFavouriteQuestions(this.favouriteQuestions);
  }

  updateProgress(topicId: TopicId, questionId: QuestionId, isCorrect: boolean): UserProgress {
    let currentProgress = this.userProgress[topicId];
    
    if (!currentProgress) {
      currentProgress = {
        topicId,
        completedQuestions: [],
        correctAnswers: 0,
        totalAttempts: 0
      };
    }

    const hasAnsweredBefore = currentProgress.completedQuestions.includes(questionId);
    const newCompletedQuestions = hasAnsweredBefore
      ? currentProgress.completedQuestions
      : [...currentProgress.completedQuestions, questionId];

    const wrongSet = new Set(this.wrongQuestions);
    let newWrongQuestions = [...this.wrongQuestions];

    if (!isCorrect) {
      if (!wrongSet.has(questionId)) {
        newWrongQuestions.push(questionId);
      }
    } else {
      if (wrongSet.has(questionId)) {
        newWrongQuestions = newWrongQuestions.filter(id => id !== questionId);
      }
    }

    let newCorrectAnswers = currentProgress.correctAnswers;
    if (isCorrect && !hasAnsweredBefore) {
      newCorrectAnswers++;
    }

    const updatedProgress: UserProgress = {
      ...currentProgress,
      completedQuestions: newCompletedQuestions,
      correctAnswers: newCorrectAnswers,
      totalAttempts: currentProgress.totalAttempts + 1
    };

    this.userProgress[topicId] = updatedProgress;
    this.wrongQuestions = newWrongQuestions;
    this.saveToStorage();

    return updatedProgress;
  }

  getProgress(topicId: TopicId): UserProgress {
    return this.userProgress[topicId] || {
      topicId,
      completedQuestions: [],
      correctAnswers: 0,
      totalAttempts: 0
    };
  }

  resetTopicProgress(topicId: TopicId): void {
    delete this.userProgress[topicId];
    this.saveToStorage();
  }

  getOverallProgress(): ProgressStats {
    return this.calculator.calculateOverallProgress(this.userProgress);
  }

  getTopicProgress(topicId: TopicId): ProgressStats {
    const progress = this.getProgress(topicId);
    return this.calculator.calculateTopicProgress(progress);
  }

  getWrongQuestions(): QuestionId[] {
    return [...this.wrongQuestions];
  }

  addWrongQuestion(questionId: QuestionId): void {
    if (!this.wrongQuestions.includes(questionId)) {
      this.wrongQuestions.push(questionId);
      this.saveToStorage();
    }
  }

  removeWrongQuestion(questionId: QuestionId): void {
    this.wrongQuestions = this.wrongQuestions.filter(id => id !== questionId);
    this.saveToStorage();
  }

  getFavouriteQuestions(): QuestionId[] {
    return [...this.favouriteQuestions];
  }

  addFavouriteQuestion(questionId: QuestionId): void {
    if (!this.favouriteQuestions.includes(questionId)) {
      this.favouriteQuestions.push(questionId);
      this.saveToStorage();
    }
  }

  removeFavouriteQuestion(questionId: QuestionId): void {
    this.favouriteQuestions = this.favouriteQuestions.filter(id => id !== questionId);
    this.saveToStorage();
  }
}

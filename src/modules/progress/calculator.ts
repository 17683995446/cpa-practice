import { UserProgress, ProgressStats, TopicId } from '../core';

export interface ProgressCalculator {
  calculateAccuracy(correctAnswers: number, totalAttempts: number): number;
  calculateTopicProgress(progress: UserProgress): ProgressStats;
  calculateOverallProgress(progressMap: Record<TopicId, UserProgress>): ProgressStats;
  calculateTopicCompletion(progress: UserProgress, totalQuestions: number): number;
  getRank(accuracy: number): string;
}

export class ProgressCalculatorImpl implements ProgressCalculator {
  calculateAccuracy(correctAnswers: number, totalAttempts: number): number {
    if (totalAttempts === 0) return 0;
    return Math.round((correctAnswers / totalAttempts) * 100);
  }

  calculateTopicProgress(progress: UserProgress): ProgressStats {
    return {
      totalQuestions: progress.totalAttempts,
      completedQuestions: progress.completedQuestions.length,
      correctAnswers: progress.correctAnswers,
      accuracy: this.calculateAccuracy(progress.correctAnswers, progress.totalAttempts),
      topicsCompleted: 0
    };
  }

  calculateOverallProgress(progressMap: Record<TopicId, UserProgress>): ProgressStats {
    const allProgress = Object.values(progressMap);
    
    const totalQuestions = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
    const completedQuestions = allProgress.reduce((sum, p) => sum + p.completedQuestions.length, 0);
    const correctAnswers = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const topicsCompleted = allProgress.filter(p => p.completedQuestions.length > 0).length;
    
    return {
      totalQuestions,
      completedQuestions,
      correctAnswers,
      accuracy: this.calculateAccuracy(correctAnswers, totalQuestions),
      topicsCompleted
    };
  }

  calculateTopicCompletion(progress: UserProgress, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((progress.completedQuestions.length / totalQuestions) * 100);
  }

  getRank(accuracy: number): string {
    if (accuracy >= 90) return '卓越';
    if (accuracy >= 80) return '优秀';
    if (accuracy >= 70) return '良好';
    if (accuracy >= 60) return '及格';
    return '需努力';
  }
}

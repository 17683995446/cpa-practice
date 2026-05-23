import { UserProgress, ProgressStats, Question } from '../types';

export function calculateAccuracy(correctAnswers: number, totalAttempts: number): number {
  if (totalAttempts === 0) return 0;
  return Math.round((correctAnswers / totalAttempts) * 100);
}

export function calculateTopicProgress(progress: UserProgress): ProgressStats {
  return {
    totalQuestions: progress.totalAttempts,
    completedQuestions: progress.completedQuestions.length,
    correctAnswers: progress.correctAnswers,
    accuracy: calculateAccuracy(progress.correctAnswers, progress.totalAttempts),
    topicsCompleted: 0
  };
}

export function generateQuestionId(topicId: string, index: number): string {
  return `${topicId}-q${index}`;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function filterQuestionsByDifficulty(
  questions: Question[],
  difficulty: Question['difficulty']
): Question[] {
  return questions.filter(q => q.difficulty === difficulty);
}

export function filterQuestionsByYear(questions: Question[], year: number): Question[] {
  return questions.filter(q => q.year === year);
}

export function validateQuestionId(questionId: string): boolean {
  return /^[a-z0-9-]+-q\d+$/.test(questionId);
}

export function validateTopicId(topicId: string): boolean {
  return /^[a-z0-9-]+$/.test(topicId);
}

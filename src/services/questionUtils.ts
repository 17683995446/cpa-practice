import { Question } from '@/types';
import { questions as allQuestions } from '@/data/questions';

export function getQuestionsByIds(questionIds: string[]): Question[] {
  return allQuestions.filter(q => questionIds.includes(q.id));
}

export function getWrongQuestions(wrongQuestionIds: string[]): Question[] {
  return getQuestionsByIds(wrongQuestionIds);
}

export function getFavouriteQuestions(favouriteQuestionIds: string[]): Question[] {
  return getQuestionsByIds(favouriteQuestionIds);
}

export function getQuestionsByTopicAndFilter(
  topicId: string,
  options: {
    difficulty?: 'easy' | 'medium' | 'hard';
    year?: number;
    search?: string;
  } = {}
): Question[] {
  let questions = allQuestions.filter(q => q.topicId === topicId);
  
  if (options.difficulty) {
    questions = questions.filter(q => q.difficulty === options.difficulty);
  }
  
  if (options.year) {
    questions = questions.filter(q => q.year === options.year);
  }
  
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    questions = questions.filter(q => 
      q.content.toLowerCase().includes(searchLower) ||
      q.options.some(opt => opt.toLowerCase().includes(searchLower))
    );
  }
  
  return questions;
}

export function getAvailableYears(topicId: string): number[] {
  const questions = allQuestions.filter(q => q.topicId === topicId);
  const years = [...new Set(questions.map(q => q.year).filter(Boolean))] as number[];
  return years.sort((a, b) => b - a);
}

export function getTopicProgress(topicId: string, userProgress: any): {
  total: number;
  completed: number;
  correct: number;
  wrong: number;
  accuracy: number;
} {
  const topicQuestions = allQuestions.filter(q => q.topicId === topicId);
  const progress = userProgress[topicId] || { completedQuestions: [], correctAnswers: 0, totalAttempts: 0 };
  
  return {
    total: topicQuestions.length,
    completed: progress.completedQuestions.length,
    correct: progress.correctAnswers,
    wrong: progress.totalAttempts - progress.correctAnswers,
    accuracy: progress.totalAttempts > 0 ? Math.round((progress.correctAnswers / progress.totalAttempts) * 100) : 0
  };
}

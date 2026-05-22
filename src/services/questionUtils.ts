import { Question } from '@/types';
import { questions as allQuestions } from '@/data/questions';

export function getQuestionsByIds(questionIds: string[]): Question[] {
  // 按照用户指定的顺序返回题目，而不是原始数据顺序
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  return questionIds
    .map(id => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);
}

export function getQuestionIndexInTopic(questionId: string): number {
  // 找到某道题在其科目中的索引位置
  const question = allQuestions.find(q => q.id === questionId);
  if (!question) return 0;
  
  const topicQuestions = allQuestions.filter(q => q.topicId === question.topicId);
  const index = topicQuestions.findIndex(q => q.id === questionId);
  return Math.max(0, index);
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

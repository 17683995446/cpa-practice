import { Question, TopicId, Difficulty } from '../core';
import { QuestionRepository } from './repository';

export interface QuestionService {
  getQuestions(topicId?: TopicId): Question[];
  getQuestion(id: string): Question | undefined;
  getRandomQuestions(count: number, topicId?: TopicId): Question[];
  getQuestionsByDifficulty(difficulty: Difficulty, topicId?: TopicId): Question[];
  getQuestionsByYear(year: number, topicId?: TopicId): Question[];
  searchQuestions(query: string): Question[];
  getTopicStats(topicId: TopicId): { total: number; easy: number; medium: number; hard: number };
  getQuestionIndex(topicId: TopicId, questionId: string): number;
}

export class QuestionServiceImpl implements QuestionService {
  constructor(private repository: QuestionRepository) {}

  getQuestions(topicId?: TopicId): Question[] {
    if (!topicId) {
      return this.repository.getAllQuestions();
    }
    return this.repository.getQuestionsByTopic(topicId);
  }

  getQuestion(id: string): Question | undefined {
    return this.repository.getQuestionById(id);
  }

  getRandomQuestions(count: number, topicId?: TopicId): Question[] {
    let questions = topicId
      ? this.repository.getQuestionsByTopic(topicId)
      : this.repository.getAllQuestions();
    
    const shuffled = questions
      .map(q => ({ q, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ q }) => q);
    
    return shuffled.slice(0, count);
  }

  getQuestionsByDifficulty(difficulty: Difficulty, topicId?: TopicId): Question[] {
    let questions = topicId
      ? this.repository.getQuestionsByTopic(topicId)
      : this.repository.getAllQuestions();
    
    return questions.filter(q => q.difficulty === difficulty);
  }

  getQuestionsByYear(year: number, topicId?: TopicId): Question[] {
    let questions = topicId
      ? this.repository.getQuestionsByTopic(topicId)
      : this.repository.getAllQuestions();
    
    return questions.filter(q => q.year === year);
  }

  searchQuestions(query: string): Question[] {
    const lowerQuery = query.toLowerCase();
    return this.repository.getAllQuestions().filter(q => 
      q.question.toLowerCase().includes(lowerQuery) ||
      q.options.some(o => o.toLowerCase().includes(lowerQuery)) ||
      q.explanation.toLowerCase().includes(lowerQuery)
    );
  }

  getTopicStats(topicId: TopicId): { total: number; easy: number; medium: number; hard: number } {
    const questions = this.repository.getQuestionsByTopic(topicId);
    
    const stats = questions.reduce((acc, q) => {
      acc.total++;
      acc[q.difficulty]++;
      return acc;
    }, { total: 0, easy: 0, medium: 0, hard: 0 });
    
    return stats;
  }

  getQuestionIndex(topicId: TopicId, questionId: string): number {
    const questions = this.repository.getQuestionsByTopic(topicId);
    return questions.findIndex(q => q.id === questionId);
  }
}

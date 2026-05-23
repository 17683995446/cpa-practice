import { Question, TopicId, Difficulty } from '../core';

export interface QuestionRepository {
  getAllQuestions(): Question[];
  getQuestionsByTopic(topicId: TopicId): Question[];
  getQuestionById(questionId: string): Question | undefined;
  getQuestionsByIds(questionIds: string[]): Question[];
  getQuestionsByDifficulty(difficulty: Difficulty): Question[];
  getQuestionsByYear(year: number): Question[];
  getTopics(): { id: string; name: string; count: number }[];
  getQuestionCountByTopic(): Record<TopicId, number>;
}

export class InMemoryQuestionRepository implements QuestionRepository {
  private questions: Question[];

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  getAllQuestions(): Question[] {
    return [...this.questions];
  }

  getQuestionsByTopic(topicId: TopicId): Question[] {
    return this.questions.filter(q => q.topicId === topicId);
  }

  getQuestionById(questionId: string): Question | undefined {
    return this.questions.find(q => q.id === questionId);
  }

  getQuestionsByIds(questionIds: string[]): Question[] {
    const questionMap = new Map(this.questions.map(q => [q.id, q]));
    return questionIds
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined);
  }

  getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
    return this.questions.filter(q => q.difficulty === difficulty);
  }

  getQuestionsByYear(year: number): Question[] {
    return this.questions.filter(q => q.year === year);
  }

  getTopics(): { id: string; name: string; count: number }[] {
    const topicMap = new Map<string, { name: string; count: number }>();
    
    this.questions.forEach(q => {
      const existing = topicMap.get(q.topicId);
      if (existing) {
        existing.count++;
      } else {
        topicMap.set(q.topicId, { name: this.getTopicName(q.topicId), count: 1 });
      }
    });

    return Array.from(topicMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count
    }));
  }

  getQuestionCountByTopic(): Record<TopicId, number> {
    const countMap: Record<TopicId, number> = {};
    
    this.questions.forEach(q => {
      countMap[q.topicId] = (countMap[q.topicId] || 0) + 1;
    });

    return countMap;
  }

  private getTopicName(topicId: string): string {
    const topicNames: Record<string, string> = {
      accounting: '会计',
      audit: '审计',
      finance: '财务成本管理',
      strategy: '公司战略与风险管理',
      economic: '经济法',
      tax: '税法'
    };
    return topicNames[topicId] || topicId;
  }
}

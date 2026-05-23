import { describe, it, expect, beforeEach } from 'vitest';
import { 
  UserProgress, 
  TopicId, 
  QuestionId, 
  calculateAccuracy, 
  shuffleArray,
  validateQuestionId,
  validateTopicId
} from '../core';
import { InMemoryQuestionRepository, QuestionServiceImpl } from '../questions';
import { ProgressCalculatorImpl, ProgressServiceImpl, ProgressStorage } from '../progress';
import { LocalStorageAdapter, PersistenceServiceImpl } from '../storage';

class PersistenceToProgressStorageAdapter implements ProgressStorage {
  constructor(private persistence: PersistenceServiceImpl) {}
  
  getUserProgress(): Record<TopicId, UserProgress> {
    return this.persistence.loadUserProgress();
  }
  
  setUserProgress(progress: Record<TopicId, UserProgress>): void {
    this.persistence.saveUserProgress(progress);
  }
  
  getWrongQuestions(): QuestionId[] {
    return this.persistence.loadWrongQuestions();
  }
  
  setWrongQuestions(questions: QuestionId[]): void {
    this.persistence.saveWrongQuestions(questions);
  }
  
  getFavouriteQuestions(): QuestionId[] {
    return this.persistence.loadFavouriteQuestions();
  }
  
  setFavouriteQuestions(questions: QuestionId[]): void {
    this.persistence.saveFavouriteQuestions(questions);
  }
  
  clearAll(): void {
    this.persistence.clearAll();
  }
}

const mockQuestions = [
  {
    id: 'acc-q1',
    topicId: 'accounting',
    question: '测试问题1',
    options: ['A', 'B', 'C', 'D'],
    answer: 0,
    explanation: '解释',
    difficulty: 'easy' as const,
    year: 2023,
    chapter: '章节1'
  },
  {
    id: 'acc-q2',
    topicId: 'accounting',
    question: '测试问题2',
    options: ['A', 'B', 'C', 'D'],
    answer: 1,
    explanation: '解释',
    difficulty: 'medium' as const,
    year: 2023,
    chapter: '章节1'
  }
];

describe('第5轮迭代：模块化集成测试', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Core 模块', () => {
    it('calculateAccuracy 正确计算正确率', () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
      expect(calculateAccuracy(0, 0)).toBe(0);
      expect(calculateAccuracy(8, 8)).toBe(100);
      expect(calculateAccuracy(7, 10)).toBe(70);
    });

    it('shuffleArray 正确打乱数组', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.length).toBe(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('validateQuestionId 正确验证问题ID', () => {
      expect(validateQuestionId('topic-q1')).toBe(true);
      expect(validateQuestionId('topic-1-q10')).toBe(true);
      expect(validateQuestionId('invalid')).toBe(false);
      expect(validateQuestionId('topic-q')).toBe(false);
    });

    it('validateTopicId 正确验证科目ID', () => {
      expect(validateTopicId('accounting')).toBe(true);
      expect(validateTopicId('audit-2023')).toBe(true);
      expect(validateTopicId('invalid!')).toBe(false);
      expect(validateTopicId('123')).toBe(true);
    });
  });

  describe('Questions 模块', () => {
    it('QuestionRepository 正确获取问题', () => {
      const repository = new InMemoryQuestionRepository(mockQuestions);
      
      expect(repository.getAllQuestions().length).toBe(2);
      expect(repository.getQuestionsByTopic('accounting').length).toBe(2);
      expect(repository.getQuestionById('acc-q1')).toBeDefined();
      expect(repository.getQuestionById('invalid')).toBeUndefined();
    });

    it('QuestionService 正确工作', () => {
      const repository = new InMemoryQuestionRepository(mockQuestions);
      const service = new QuestionServiceImpl(repository);
      
      expect(service.getQuestions('accounting').length).toBe(2);
      expect(service.getQuestion('acc-q1')?.question).toBe('测试问题1');
      expect(service.getTopicStats('accounting')).toEqual({
        total: 2,
        easy: 1,
        medium: 1,
        hard: 0
      });
    });
  });

  describe('Progress 模块', () => {
    it('ProgressCalculator 正确计算进度', () => {
      const calculator = new ProgressCalculatorImpl();
      
      const progress: UserProgress = {
        topicId: 'test',
        completedQuestions: ['q1', 'q2'],
        correctAnswers: 1,
        totalAttempts: 2
      };
      
      expect(calculator.calculateAccuracy(1, 2)).toBe(50);
      expect(calculator.getRank(85)).toBe('优秀');
      expect(calculator.getRank(55)).toBe('需努力');
    });

    it('ProgressService 正确更新进度', () => {
      const adapter = new LocalStorageAdapter('test_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);
      
      const topicId: TopicId = 'test';
      const questionId: QuestionId = 'q1';
      
      const result = service.updateProgress(topicId, questionId, true);
      
      expect(result.completedQuestions).toContain(questionId);
      expect(result.correctAnswers).toBe(1);
      expect(result.totalAttempts).toBe(1);
      
      const result2 = service.updateProgress(topicId, questionId, true);
      expect(result2.correctAnswers).toBe(1);
      expect(result2.totalAttempts).toBe(2);
    });

    it('ProgressService 正确管理错题和收藏', () => {
      const adapter = new LocalStorageAdapter('test2_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);
      
      service.addWrongQuestion('q1');
      service.addWrongQuestion('q2');
      service.addFavouriteQuestion('q1');
      
      expect(service.getWrongQuestions()).toEqual(['q1', 'q2']);
      expect(service.getFavouriteQuestions()).toEqual(['q1']);
      
      service.removeWrongQuestion('q1');
      expect(service.getWrongQuestions()).toEqual(['q2']);
      
      service.removeFavouriteQuestion('q1');
      expect(service.getFavouriteQuestions()).toEqual([]);
    });
  });

  describe('Storage 模块', () => {
    it('LocalStorageAdapter 正确读写', () => {
      const adapter = new LocalStorageAdapter('test3_');
      
      adapter.setItem('test', { value: 123 });
      expect(adapter.getItem<{ value: number }>('test')).toEqual({ value: 123 });
      
      adapter.removeItem('test');
      expect(adapter.getItem('test')).toBeNull();
    });

    it('PersistenceService 正确保存和加载', () => {
      const adapter = new LocalStorageAdapter('test4_');
      const service = new PersistenceServiceImpl(adapter);
      
      const progress: Record<TopicId, UserProgress> = {
        test: {
          topicId: 'test',
          completedQuestions: ['q1'],
          correctAnswers: 1,
          totalAttempts: 1
        }
      };
      
      service.saveUserProgress(progress);
      const loaded = service.loadUserProgress();
      
      expect(loaded.test).toEqual(progress.test);
      
      service.clearAll();
      expect(service.loadUserProgress()).toEqual({});
    });
  });

  describe('模块集成', () => {
    it('完整流程：从问题获取到进度更新', () => {
      const repository = new InMemoryQuestionRepository(mockQuestions);
      const questionService = new QuestionServiceImpl(repository);
      
      const adapter = new LocalStorageAdapter('integration_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const progressService = new ProgressServiceImpl(calculator, progressStorage);
      
      const question = questionService.getQuestion('acc-q1');
      expect(question).toBeDefined();
      
      const result = progressService.updateProgress(
        question!.topicId,
        question!.id,
        true
      );
      
      expect(result.correctAnswers).toBe(1);
      expect(result.completedQuestions).toContain(question!.id);
      
      const stats = progressService.getTopicProgress('accounting');
      expect(stats.accuracy).toBe(100);
    });
  });
});

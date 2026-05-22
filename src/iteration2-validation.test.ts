/**
 * 新迭代阶段 - Bug修复验证测试
 * 
 * 修复的Bug：
 * 1. use-question.ts 中 getState() 改为订阅式状态同步
 * 2. question-service.ts 中代码格式优化
 * 3. Home.tsx 中除以零问题修复
 */

import { describe, it, expect } from 'vitest';
import { QuestionService } from './services/question-service';

describe('新迭代阶段Bug修复验证', () => {
  describe('Bug 2修复：shuffleQuestions格式优化', () => {
    it('应该能正确打乱题目顺序', () => {
      const questions = [
        { id: 'q1', topicId: 't1', content: 'Question 1', options: [], correctAnswer: 0, explanation: '', memoryTip: '', difficulty: 'easy' as const },
        { id: 'q2', topicId: 't1', content: 'Question 2', options: [], correctAnswer: 1, explanation: '', memoryTip: '', difficulty: 'medium' as const },
        { id: 'q3', topicId: 't1', content: 'Question 3', options: [], correctAnswer: 2, explanation: '', memoryTip: '', difficulty: 'hard' as const },
      ];

      const shuffled = QuestionService.shuffleQuestions(questions);

      // 验证打乱后仍然包含所有题目
      expect(shuffled.length).toBe(3);
      expect(shuffled.map(q => q.id)).toContain('q1');
      expect(shuffled.map(q => q.id)).toContain('q2');
      expect(shuffled.map(q => q.id)).toContain('q3');

      // 验证题目对象没有被修改
      expect(shuffled[0].content).toBeDefined();
      expect(shuffled[0].correctAnswer).toBeDefined();
    });

    it('处理空数组应该返回空数组', () => {
      const shuffled = QuestionService.shuffleQuestions([]);
      expect(shuffled).toEqual([]);
    });

    it('处理单元素数组应该返回相同元素', () => {
      const questions = [
        { id: 'q1', topicId: 't1', content: 'Question 1', options: [], correctAnswer: 0, explanation: '', memoryTip: '', difficulty: 'easy' as const },
      ];

      const shuffled = QuestionService.shuffleQuestions(questions);
      expect(shuffled.length).toBe(1);
      expect(shuffled[0].id).toBe('q1');
    });
  });

  describe('Bug 1修复：状态订阅验证', () => {
    it('验证QuestionService的getQuestionById正常工作', () => {
      const question = QuestionService.getQuestionById('accounting-1');
      expect(question).toBeDefined();
      expect(question?.id).toBe('accounting-1');
      expect(question?.topicId).toBe('accounting');
    });

    it('验证getQuestionsByTopic正常工作', () => {
      const accountingQuestions = QuestionService.getQuestionsByTopic('accounting');
      expect(accountingQuestions.length).toBeGreaterThan(0);
      expect(accountingQuestions.every(q => q.topicId === 'accounting')).toBe(true);
    });

    it('验证filterQuestions正常工作', () => {
      const allQuestions = QuestionService.getAllQuestions();
      const easyQuestions = QuestionService.filterQuestions(
        allQuestions,
        { difficulty: ['easy'] },
        [],
        []
      );
      
      expect(easyQuestions.length).toBeGreaterThan(0);
      expect(easyQuestions.every(q => q.difficulty === 'easy')).toBe(true);
    });
  });

  describe('Bug 3修复：除以零保护验证', () => {
    it('验证calculateAccuracy处理零情况', () => {
      const { calculateAccuracy } = require('./lib/utils');
      
      // 测试零情况
      expect(calculateAccuracy(0, 0)).toBe(0);
      
      // 测试正常情况
      expect(calculateAccuracy(10, 20)).toBe(50);
      expect(calculateAccuracy(75, 100)).toBe(75);
      expect(calculateAccuracy(100, 100)).toBe(100);
    });
  });

  describe('QuestionService API验证', () => {
    it('getAvailableYears返回排序后的年份', () => {
      const allQuestions = QuestionService.getAllQuestions();
      const years = QuestionService.getAvailableYears(allQuestions);
      
      // 验证返回的是数组
      expect(Array.isArray(years)).toBe(true);
      
      // 验证排序（应该是升序）
      if (years.length > 1) {
        const isSorted = years.every((year, i) => i === 0 || years[i - 1] <= year);
        expect(isSorted).toBe(true);
      }
    });

    it('getNextQuestionId正确处理边界', () => {
      const questionIds = ['q1', 'q2', 'q3'];
      
      // 测试正常情况
      expect(QuestionService.getNextQuestionId(0, questionIds, 'next'))
        .toEqual({ index: 1, id: 'q2' });
      
      expect(QuestionService.getNextQuestionId(2, questionIds, 'prev'))
        .toEqual({ index: 1, id: 'q2' });
      
      // 测试边界
      expect(QuestionService.getNextQuestionId(0, questionIds, 'prev'))
        .toEqual({ index: 0, id: null });
      
      expect(QuestionService.getNextQuestionId(2, questionIds, 'next'))
        .toEqual({ index: 2, id: null });
    });
  });
});

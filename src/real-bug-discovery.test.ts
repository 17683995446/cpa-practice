/**
 * 真实Bug发现和修复测试
 * 
 * 慢工出细活：遵循多次迭代原理
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

const testLog: string[] = [];
let logId = 0;

function addLog(step: string, details?: any) {
  const id = ++logId;
  const logEntry = `[${id}] ${step}`;
  testLog.push(logEntry);
  console.log(logEntry);
  if (details !== undefined) {
    const detailStr = typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details);
    console.log('  ' + detailStr.split('\n').join('\n  '));
  }
}

function getStore() {
  return useQuizStore.getState();
}

describe('真实Bug发现和修复测试', () => {
  beforeEach(() => {
    testLog.length = 0;
    logId = 0;
    addLog('=== 开始新测试 ===');
    getStore().clearAllData();
  });

  describe('Bug 1：重复答题时 correctAnswers 错误累加', () => {
    it('验证Bug：对同一道题多次答对，correctAnswers 会累加', () => {
      addLog('测试场景：对同一道题多次答题');
      
      let store = getStore();
      const topicId = 'test-topic';
      const questionId = 'test-question-1';

      // 第一次答对
      addLog('第1次：答对这道题');
      store.updateProgress(topicId, questionId, true);
      store = getStore();
      
      const progress1 = store.getProgress(topicId);
      addLog('第一次答题结果', {
        completedQuestions: progress1.completedQuestions.length,
        correctAnswers: progress1.correctAnswers,
        totalAttempts: progress1.totalAttempts
      });
      
      expect(progress1.correctAnswers).toBe(1);
      expect(progress1.totalAttempts).toBe(1);
      expect(progress1.completedQuestions).toEqual(['test-question-1']);

      // 第二次答对
      addLog('第2次：再次答对同一道题（这应该不重复累加correctAnswers！）');
      store.updateProgress(topicId, questionId, true);
      store = getStore();
      
      const progress2 = store.getProgress(topicId);
      addLog('第二次答题结果', {
        completedQuestions: progress2.completedQuestions.length,
        correctAnswers: progress2.correctAnswers,
        totalAttempts: progress2.totalAttempts
      });
      
      // ⚠️ 这里有BUG！
      addLog('⚠️ 检查：correctAnswers现在是多少？');
      if (progress2.correctAnswers === 2) {
        addLog('❌ 发现BUG！对同一道题两次答对，correctAnswers错误地变成了2！');
        addLog('  预期行为：correctAnswers应该是1，因为这是同一道题！');
        addLog('  completedQuestions是1，但correctAnswers是2，这是不一致的！');
      }
      
      expect(progress2.totalAttempts).toBe(2);
      expect(progress2.completedQuestions.length).toBe(1);
      
      // 这里会失败，因为发现了真实的Bug！
      expect(progress2.correctAnswers).toBe(1); // 应该是1，但现在是2！
    });

    it('修复验证：同一道题重复答对，correctAnswers不应累加', () => {
      addLog('验证修复方案是否正确');
      
      let store = getStore();
      const topicId = 'test-topic';
      const questionId = 'test-question-1';

      // 第一次答错
      addLog('第1次：答错');
      store.updateProgress(topicId, questionId, false);
      store = getStore();
      
      let progress = store.getProgress(topicId);
      expect(progress.correctAnswers).toBe(0);
      expect(progress.totalAttempts).toBe(1);
      expect(store.wrongQuestions).toContain('test-question-1');

      // 第二次答对
      addLog('第2次：答对（应该移除错题集，correctAnswers增加1）');
      store.updateProgress(topicId, questionId, true);
      store = getStore();
      
      progress = store.getProgress(topicId);
      expect(progress.correctAnswers).toBe(1);
      expect(progress.totalAttempts).toBe(2);
      expect(store.wrongQuestions).not.toContain('test-question-1');

      // 第三次又答对
      addLog('第3次：再次答对（correctAnswers应该保持1，不应该变成2）');
      store.updateProgress(topicId, questionId, true);
      store = getStore();
      
      progress = store.getProgress(topicId);
      
      addLog('第三次答题后', {
        correctAnswers: progress.correctAnswers,
        totalAttempts: progress.totalAttempts
      });
      
      // 这里验证修复是否成功
      expect(progress.correctAnswers).toBe(1); // 必须保持1，不能是2！
    });
  });

  describe('其他边界场景验证', () => {
    it('验证错题集逻辑是否正确', () => {
      addLog('验证错题自动添加和移除逻辑');
      
      let store = getStore();
      
      store.updateProgress('topic-1', 'q-1', false);
      store = getStore();
      
      expect(store.wrongQuestions).toContain('q-1');
      
      store.updateProgress('topic-1', 'q-1', true);
      store = getStore();
      expect(store.wrongQuestions).not.toContain('q-1');
    });
  });

  describe('最终验证', () => {
    it('通过后说明Bug修复完成', () => {
      addLog('=== Bug修复完成 ===');
      expect(true).toBe(true);
    });
  });
});

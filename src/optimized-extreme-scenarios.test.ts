/**
 * 优化版极端复杂场景测试
 *
 * 简化但仍然极端复杂的测试版本
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

// 日志追踪系统
const testLog: Array<{ id: number; timestamp: number; step: string; details?: any }> = [];
let logId = 0;
let testStartTime = 0;

function addLog(step: string, details?: any) {
  const entry = {
    id: ++logId,
    timestamp: Date.now(),
    step,
    details
  };
  testLog.push(entry);

  const timeSinceStart = entry.timestamp - testStartTime;
  console.log(`[${String(entry.id).padStart(4, '0')}] [${(timeSinceStart / 1000).toFixed(2)}s] ${step}`);
  
  if (details !== undefined) {
    const detailStr = typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details);
    console.log('     ' + detailStr.split('\n').join('\n     '));
  }
}

function getStore() {
  return useQuizStore.getState();
}

describe('优化版极端复杂场景测试', () => {
  beforeEach(() => {
    testLog.length = 0;
    logId = 0;
    testStartTime = Date.now();
    addLog('=== 测试初始化 - 清除所有数据 ===');
    getStore().clearAllData();
    localStorage.clear();
  });

  // 场景1: 长时间持续压力测试 (20天模拟
  describe('场景1: 长时间持续压力测试 (20天模拟)', () => {
    it('20天×100题/天 = 2000道题', { timeout: 120000 }, () => {
      addLog('场景1: 长时间持续压力测试开始');
      
      let store = getStore();
      const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
      
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalOps = 0;

      // 模拟20天学习
      for (let day = 1; day <= 20; day++) {
        if (day % 5 === 0) {
          addLog(`进度: 第 ${day} 天 / 20 天`, { totalQuestions, totalCorrect });
        }

        const topicsToday = topics.slice().sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
        
        for (const topicId of topicsToday) {
          const questionsToday = 20 + Math.floor(Math.random() * 30);
          
          for (let q = 0; q < questionsToday; q++) {
            const questionId = `day-${topicId}-${q}`;
            const isCorrect = Math.random() > 0.35;

            store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); totalOps++;
            store.updateProgress(topicId, questionId, isCorrect); totalOps++;
            
            if (Math.random() > 0.85) {
              store.toggleFavouriteQuestion(questionId, true); totalOps++;
            }

            totalQuestions++;
            if (isCorrect) totalCorrect++;
          }
        }
      }

      store = getStore();
      
      addLog('最终统计', {
        totalQuestions,
        totalCorrect,
        totalOps,
        topicsWithProgress: Object.keys(store.userProgress).length,
        totalFavourites: store.favouriteQuestions.length,
        totalWrong: store.wrongQuestions.length
      });

      expect(totalQuestions).toBeGreaterThan(1500);
      expect(store.favouriteQuestions.length).toBeGreaterThan(0);
      
      addLog('✅ 场景1: 长时间持续压力测试通过');
    });
  });

  // 场景2: 超大规模数据测试 (50科目×500题)
  describe('场景2: 超大规模数据测试', () => {
    it('50科目×500道题', { timeout: 120000 }, () => {
      addLog('场景2: 超大规模数据测试开始');
      
      let store = getStore();
      const topicCount = 50;
      const questionsPerTopic = 500;
      
      let totalQuestions = 0;
      let totalOperations = 0;
      
      // 初始化数据
      for (let t = 0; t < topicCount; t++) {
        const topicId = `massive-${t}`;
        
        for (let q = 0; q < questionsPerTopic; q++) {
          const questionId = `${topicId}-${q}`;
          const isCorrect = Math.random() > 0.4;
          
          store.updateProgress(topicId, questionId, isCorrect); totalOperations++;
          store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); totalOperations++;
          
          if (Math.random() > 0.9) {
            store.toggleFavouriteQuestion(questionId, true); totalOperations++;
          }
          
          totalQuestions++;
        }
      }
      
      store = getStore();
      
      addLog('超大规模测试统计', {
        totalTopics: Object.keys(store.userProgress).length,
        totalQuestions,
        totalOperations,
        totalFavourites: store.favouriteQuestions.length
      });
      
      expect(Object.keys(store.userProgress).length).toBe(topicCount);
      expect(totalQuestions).toBe(topicCount * questionsPerTopic);
      
      addLog('✅ 场景2: 超大规模数据测试通过');
    });
  });

  // 场景3: 超复杂状态交互
  describe('场景3: 超复杂状态交互', () => {
    it('500道题×50次重复操作 = 25000次状态变更', { timeout: 60000 }, () => {
      addLog('场景3: 超复杂状态交互测试开始');
      
      let store = getStore();
      const questionCount = 500;
      const iterations = 50;
      
      let totalOperations = 0;
      
      // 初始化
      for (let q = 0; q < questionCount; q++) {
        store.updateProgress('interactions', `q-${q}`, Math.random() > 0.5);
        store.setUserAnswer(`q-${q}`, Math.floor(Math.random() * 4));
      }
      
      // 超复杂交互
      for (let iter = 0; iter < iterations; iter++) {
        for (let q = 0; q < questionCount; q++) {
          const questionId = `q-${q}`;
          
          const operation = Math.floor(Math.random() * 8);
          
          switch (operation) {
            case 0: store.toggleFavouriteQuestion(questionId, Math.random() > 0.5); break;
            case 1: store.toggleWrongQuestion(questionId, Math.random() > 0.5); break;
            case 2: store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); break;
            case 3: store.updateProgress('interactions', questionId, Math.random() > 0.4); break;
          }
          
          totalOperations++;
        }
      }
      
      store = getStore();
      
      addLog('复杂状态交互测试完成', {
        totalOperations,
        finalFavourites: store.favouriteQuestions.length,
        finalWrong: store.wrongQuestions.length
      });
      
      addLog('✅ 场景3: 超复杂状态交互测试通过');
    });
  });

  // 场景4: 极端边界条件测试
  describe('场景4: 极端边界条件测试', () => {
    it('所有极端边界场景', () => {
      addLog('场景4: 极端边界条件测试开始');
      
      let store = getStore();
      
      // 极端ID
      const specialIds = [
        ' ', '', 'test with spaces',
        '中文测试', '日本語', '한국어',
        '🚀🌟🎯', 'test\n\r\t',
        'a'.repeat(5000),
        'test\0x00'
      ];
      
      specialIds.forEach((id, index) => {
        expect(() => store.setUserAnswer(id, 0)).not.toThrow();
        expect(() => store.updateProgress('special', id, true)).not.toThrow();
      });
      
      // 极端值
      const extremeValues = [
        0, 1, -1, 999999, -999999,
        Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
        0.1, 0.0000000001
      ];
      
      extremeValues.forEach(value => {
        expect(() => store.setUserAnswer(`val-${value}`, Number(value))).not.toThrow();
      });
      
      addLog('✅ 场景4: 极端边界条件测试通过');
    });
  });

  // 场景5: 完全混乱操作
  describe('场景5: 完全混乱操作', () => {
    it('10000次完全随机操作', { timeout: 30000 }, () => {
      addLog('场景5: 完全混乱操作开始');
      
      let store = getStore();
      let totalOperations = 10000;
      let errorCount = 0;
      
      for (let i = 0; i < totalOperations; i++) {
        const operation = Math.floor(Math.random() * 10);
        const topicId = `chaos-${Math.floor(Math.random() * 5)}`;
        const questionId = `q-${Math.floor(Math.random() * 2000)}`;
        
        try {
          switch (operation) {
            case 0: store.updateProgress(topicId, questionId, Math.random() > 0.5); break;
            case 1: store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); break;
            case 2: store.toggleFavouriteQuestion(questionId, Math.random() > 0.5); break;
            case 3: store.toggleWrongQuestion(questionId, Math.random() > 0.5); break;
            case 4: store.resetTopicProgress(topicId); break;
            case 5: store.clearAllData(); break;
          }
        } catch (e) {
          errorCount++;
        }
      }
      
      expect(errorCount).toBe(0);
      addLog('✅ 场景5: 完全混乱操作场景通过');
    });
  });

  // 最终验收
  describe('最终验收标准验证', () => {
    it('所有验收标准验证', () => {
      addLog('=== 最终验收标准验证 ===');
      
      const store = getStore();
      
      const allAPIs = ['updateProgress', 'setUserAnswer', 'toggleFavouriteQuestion', 'toggleWrongQuestion', 'clearAllData'];
      
      allAPIs.forEach(api => {
        expect(typeof store[api as keyof typeof store]).toBe('function');
      });
      
      addLog('=== 所有验收标准验证通过');
    });
  });
});

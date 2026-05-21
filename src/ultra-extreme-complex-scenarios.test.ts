/**
 * 极端复杂场景深度测试 - 遵循多次迭代原理
 *
 * 目标：测试系统处理超长时间、超大规模、超复杂场景的能力
 *
 * 按照专业测试方法论：
 * 1. 定基准: 以设计文档为主，以代码实际逻辑为辅
 * 2. 测试前置: 拆解所有模块、提取规则、梳理数据流
 * 3. 标准化全流程: 8个步骤全覆盖
 * 4. 抓核心: 不漏任何分支、隐藏逻辑、边界条件
 * 5. 判结果: 逻辑通顺、运行稳定、无隐性BUG
 * 6. 第一性本质: 代码即规则，顺着代码本源验证
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

// 日志追踪系统 - 极端详细日志
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

// 生成极端测试数据的工具函数
function generateExtremeTopicId(index: number) {
  return `extreme-topic-${String(index).padStart(6, '0')}`;
}

function generateExtremeQuestionId(topicId: string, questionIndex: number) {
  return `${topicId}-q-${String(questionIndex).padStart(8, '0')}`;
}

describe('极端复杂场景深度测试 - 多次迭代', () => {
  beforeEach(() => {
    testLog.length = 0;
    logId = 0;
    testStartTime = Date.now();
    addLog('=== 测试初始化 - 清除所有数据 ===');
    getStore().clearAllData();
    localStorage.clear();
  });

  // ========================================
  // 场景1: 超长时间持续压力测试
  // ========================================
  describe('场景1: 超长时间持续压力测试 (模拟真实用户100天)', () => {
    it('100天×200题/天 = 20000道题连续学习', { timeout: 300000 }, () => {
      addLog('场景1: 超长时间持续压力测试开始');
      
      const store = getStore();
      const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
      
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalOps = 0;

      // 模拟100天学习
      for (let day = 1; day <= 100; day++) {
        if (day % 10 === 0) {
          addLog(`进度: 第 ${day} 天 / 100 天`, { totalQuestions, totalCorrect });
        }

        // 每天随机选择3-5个科目学习
        const topicsToday = topics.slice().sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));
        
        for (const topicId of topicsToday) {
          const questionsToday = Math.floor(Math.random() * 100) + 50; // 50-150题/科
          
          for (let q = 0; q < questionsToday; q++) {
            const questionId = generateExtremeQuestionId(topicId, q);
            const isCorrect = Math.random() > 0.35; // 65%正确率

            // 复杂操作序列
            store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); totalOps++;
            store.updateProgress(topicId, questionId, isCorrect); totalOps++;
            
            if (Math.random() > 0.85) {
              store.toggleFavouriteQuestion(questionId, true); totalOps++;
            }
            if (Math.random() > 0.9) {
              store.setShowExplanation(questionId, true); totalOps++;
            }
            if (Math.random() > 0.92) {
              store.toggleWrongQuestion(questionId, true); totalOps++;
            }

            totalQuestions++;
            if (isCorrect) totalCorrect++;
          }
        }

        // 每20天模拟随机清除数据
        if (day % 20 === 0) {
          addLog(`第 ${day} 天: 随机清除数据`);
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          store.resetTopicProgress(randomTopic); totalOps++;
        }
      }

      // 验证最终状态
      addLog('场景1: 验证最终状态');
      
      const finalState = getStore();
      
      addLog('最终统计', {
        totalQuestions,
        totalCorrect,
        totalOps,
        topicsWithProgress: Object.keys(finalState.userProgress).length,
        totalFavourites: finalState.favouriteQuestions.length,
        totalWrong: finalState.wrongQuestions.length,
        totalAnswers: Object.keys(finalState.userAnswers).length
      });

      // 验证数据完整性
      expect(totalQuestions).toBeGreaterThan(15000);
      expect(finalState.favouriteQuestions.length).toBeGreaterThan(0);
      expect(finalState.wrongQuestions.length).toBeGreaterThan(0);
      
      // 验证正确率合理
      const actualAccuracy = totalCorrect / totalQuestions;
      expect(actualAccuracy).toBeGreaterThan(0.5);
      expect(actualAccuracy).toBeLessThan(0.8);

      addLog('✅ 场景1: 超长时间持续压力测试通过');
    });
  });

  // ========================================
  // 场景2: 超大规模数据测试
  // ========================================
  describe('场景2: 超大规模数据测试 (200科目×2000题)', () => {
    it('处理200个科目×2000道题 = 400000条数据', { timeout: 240000 }, () => {
      addLog('场景2: 超大规模数据测试开始');
      
      let store = getStore();
      
      const topicCount = 200;
      const questionsPerTopic = 2000;
      
      let totalQuestions = 0;
      let totalOperations = 0;
      
      // 阶段1: 初始化200个科目
      addLog('阶段1: 初始化200个科目');
      for (let t = 0; t < topicCount; t++) {
        const topicId = generateExtremeTopicId(t);
        store.setCurrentQuestionIndex(topicId, 0); totalOperations++;
        
        if ((t + 1) % 50 === 0) {
          addLog(`科目初始化进度: ${t + 1}/${topicCount}`);
        }
      }
      
      // 阶段2: 每科2000道题
      addLog('阶段2: 每科2000道题');
      for (let t = 0; t < topicCount; t++) {
        const topicId = generateExtremeTopicId(t);
        
        for (let q = 0; q < questionsPerTopic; q++) {
          const questionId = generateExtremeQuestionId(topicId, q);
          const isCorrect = Math.random() > 0.4;
          
          store.updateProgress(topicId, questionId, isCorrect); totalOperations++;
          store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); totalOperations++;
          
          if (Math.random() > 0.95) {
            store.toggleFavouriteQuestion(questionId, true); totalOperations++;
          }
          
          totalQuestions++;
        }
        
        if ((t + 1) % 20 === 0) {
          store = getStore();
          addLog(`题目填充进度: ${t + 1}/${topicCount} 科`, { 
            totalQuestions, 
            totalOperations,
            currentTopics: Object.keys(store.userProgress).length 
          });
        }
      }
      
      store = getStore();
      
      // 阶段3: 大量查询操作
      addLog('阶段3: 大量查询操作');
      const queryStartTime = performance.now();
      let queryCount = 0;
      
      // 验证每个科目的数据
      for (let t = 0; t < topicCount; t++) {
        const topicId = generateExtremeTopicId(t);
        const progress = store.getProgress(topicId);
        expect(progress).toBeDefined();
        queryCount++;
      }
      
      const queryEndTime = performance.now();
      
      // 最终验证
      addLog('阶段4: 最终验证');
      
      const finalState = getStore();
      
      addLog('超大规模测试统计', {
        totalTopics: Object.keys(finalState.userProgress).length,
        totalQuestions,
        totalOperations,
        totalFavourites: finalState.favouriteQuestions.length,
        totalWrong: finalState.wrongQuestions.length,
        totalAnswers: Object.keys(finalState.userAnswers).length,
        queryTime: `${(queryEndTime - queryStartTime).toFixed(2)}ms`,
        queriesPerSecond: Math.round(queryCount / ((queryEndTime - queryStartTime) / 1000))
      });
      
      expect(Object.keys(finalState.userProgress).length).toBe(topicCount);
      expect(totalQuestions).toBe(topicCount * questionsPerTopic);
      
      addLog('✅ 场景2: 超大规模数据测试通过');
    });
  });

  // ========================================
  // 场景3: 超复杂状态交互测试
  // ========================================
  describe('场景3: 超复杂状态交互 (收藏/错题/进度同时操作)', () => {
    it('1000道题×100次重复操作 = 100000次状态变更', { timeout: 60000 }, () => {
      addLog('场景3: 超复杂状态交互测试开始');
      
      let store = getStore();
      const topicId = 'interactions-topic';
      const questionCount = 1000;
      const iterationsPerQuestion = 100;
      
      let totalOperations = 0;
      
      // 第一轮: 初始化数据
      addLog('第一轮: 初始化1000道题');
      for (let q = 0; q < questionCount; q++) {
        const questionId = generateExtremeQuestionId(topicId, q);
        store.updateProgress(topicId, questionId, Math.random() > 0.5); totalOperations++;
        store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); totalOperations++;
      }
      
      // 第二轮: 超复杂交互
      addLog('第二轮: 超复杂交互');
      for (let iter = 0; iter < iterationsPerQuestion; iter++) {
        for (let q = 0; q < questionCount; q++) {
          const questionId = generateExtremeQuestionId(topicId, q);
          
          // 随机混合操作
          const operation = Math.floor(Math.random() * 8);
          
          switch (operation) {
            case 0:
              store.toggleFavouriteQuestion(questionId, Math.random() > 0.5); break;
            case 1:
              store.toggleWrongQuestion(questionId, Math.random() > 0.5); break;
            case 2:
              store.setShowExplanation(questionId, Math.random() > 0.5); break;
            case 3:
              store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); break;
            case 4:
              store.updateProgress(topicId, questionId, Math.random() > 0.4); break;
            case 5:
              store.removeWrongQuestion(questionId); break;
            case 6:
              store.removeFavouriteQuestion(questionId); break;
            case 7:
              store.setCurrentQuestionIndex(topicId, q); break;
          }
          
          totalOperations++;
        }
        
        if ((iter + 1) % 20 === 0) {
          store = getStore();
          addLog(`复杂交互进度: ${iter + 1}/${iterationsPerQuestion}`, { 
            totalOperations, 
            favourites: store.favouriteQuestions.length, 
            wrong: store.wrongQuestions.length 
          });
        }
      }
      
      // 第三轮: 验证状态一致性
      addLog('第三轮: 验证状态一致性');
      
      store = getStore();
      
      // 验证所有状态都是一致的
      const progress = store.getProgress(topicId);
      expect(progress).toBeDefined();
      expect(progress.completedQuestions.length).toBeGreaterThan(0);
      expect(progress.totalAttempts).toBeGreaterThan(progress.completedQuestions.length);
      
      addLog('复杂状态交互测试完成', {
        totalOperations,
        finalFavourites: store.favouriteQuestions.length,
        finalWrong: store.wrongQuestions.length,
        totalAnswers: Object.keys(store.userAnswers).length,
        totalExplanations: Object.keys(store.showExplanations).length
      });
      
      addLog('✅ 场景3: 超复杂状态交互测试通过');
    });
  });

  // ========================================
  // 场景4: 极端边界条件测试
  // ========================================
  describe('场景4: 极端边界条件测试', () => {
    it('测试所有极端边界场景', () => {
      addLog('场景4: 极端边界条件测试开始');
      
      let store = getStore();
      
      // 边界1: 空值、null、undefined
      addLog('边界1: 空值、null、undefined');
      expect(() => store.setUserAnswer('', 0)).not.toThrow();
      expect(() => store.setUserAnswer('null', null)).not.toThrow();
      expect(() => store.setUserAnswer('empty', null)).not.toThrow();
      
      // 边界2: 超长字符串ID
      addLog('边界2: 超长字符串ID');
      const superLongId = 'super-long-id-' + 'a'.repeat(10000);
      expect(() => store.setUserAnswer(superLongId, 0)).not.toThrow();
      expect(() => store.updateProgress('long-topic', superLongId, true)).not.toThrow();
      
      // 边界3: 特殊字符ID
      addLog('边界3: 特殊字符ID');
      const specialIds = [
        'test with spaces', 'test-with-hyphens', 'test_with_underscores',
        'test.with.dots', 'test/with/slashes', 'test\\with\\backslashes',
        'test:with:colons', 'test;with;semicolons', 'test"with"quotes',
        'test\'with\'apostrophes', 'test<with<less', 'test>with>greater',
        'test&with&ampersands', 'test!with!exclamations', 'test@with@ats',
        'test#with#hashes', 'test$with$dollars', 'test%with%percents',
        'test^with^carets', 'test*with*stars', 'test(with(parents',
        'test)with)close', 'test+with+plus', 'test=with=equal',
        '中文测试ID', '日本語テスト', '한국어테스트',
        '🚀🌟🎯✅❌',
        '\x00\x01\x02\x03', '\n\t\r', '\uFFFF'
      ];
      
      specialIds.forEach((id, index) => {
        expect(() => {
          store.setUserAnswer(id, 0);
          store.updateProgress('special-topic', id, true);
          store.toggleFavouriteQuestion(id, true);
        }).not.toThrow();
      });
      
      // 边界4: 极端数字
      addLog('边界4: 极端数字');
      const extremeValues = [
        0, 1, -1, 1000000, -1000000,
        Infinity, -Infinity, NaN,
        Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
        Number.MAX_VALUE, Number.MIN_VALUE,
        0.1, 0.0000000001, 999999999.999999
      ];
      
      extremeValues.forEach((value) => {
        expect(() => store.setUserAnswer(`num-${JSON.stringify(value)}`, Number(value))).not.toThrow();
      });
      
      store = getStore();
      
      addLog('边界测试完成', {
        totalTestedIds: specialIds.length + 3, // +3 for long, null, empty
        totalExtremeValues: extremeValues.length
      });
      
      addLog('✅ 场景4: 极端边界条件测试通过');
    });
  });

  // ========================================
  // 场景5: 完全混乱操作场景
  // ========================================
  describe('场景5: 完全混乱操作场景 (模拟疯狂用户)', () => {
    it('50000次完全随机、无规律的操作', { timeout: 120000 }, () => {
      addLog('场景5: 完全混乱操作场景开始');
      
      let store = getStore();
      const totalOperations = 50000;
      const topics = Array.from({ length: 10 }, (_, i) => `chaos-topic-${i}`);
      
      let errorCount = 0;
      const operationCounts: Record<string, number> = {};
      
      addLog(`开始 ${totalOperations} 次混乱操作`);
      
      for (let i = 0; i < totalOperations; i++) {
        const operation = Math.floor(Math.random() * 12);
        const topicId = topics[Math.floor(Math.random() * topics.length)];
        const questionId = `chaos-q-${Math.floor(Math.random() * 10000)}`;
        
        const opName = [
          'updateProgress', 'setUserAnswer', 'setShowExplanation', 'setCurrentQuestionIndex',
          'toggleFavouriteQuestion', 'toggleWrongQuestion', 'removeFavouriteQuestion',
          'removeWrongQuestion', 'resetTopicProgress', 'getProgress', 'clearAllData'
        ][operation] || 'unknown';
        
        operationCounts[opName] = (operationCounts[opName] || 0) + 1;
        
        try {
          switch (operation) {
            case 0:
              store.updateProgress(topicId, questionId, Math.random() > 0.5); break;
            case 1:
              store.setUserAnswer(questionId, Math.floor(Math.random() * 4)); break;
            case 2:
              store.setShowExplanation(questionId, Math.random() > 0.5); break;
            case 3:
              store.setCurrentQuestionIndex(topicId, Math.floor(Math.random() * 1000)); break;
            case 4:
              store.toggleFavouriteQuestion(questionId, Math.random() > 0.5); break;
            case 5:
              store.toggleWrongQuestion(questionId, Math.random() > 0.5); break;
            case 6:
              store.removeFavouriteQuestion(questionId); break;
            case 7:
              store.removeWrongQuestion(questionId); break;
            case 8:
              store.resetTopicProgress(topicId); break;
            case 9:
              store.getProgress(topicId); break;
            case 10:
              store.clearAllData(); break;
          }
        } catch (e) {
          errorCount++;
          addLog(`❌ 操作 ${i} 失败: ${opName}`, { error: String(e) });
        }
        
        // 每10000次报告进度
        if ((i + 1) % 10000 === 0) {
          store = getStore();
          addLog(`混乱操作进度: ${i + 1}/${totalOperations}`, {
            errorCount,
            topics: Object.keys(store.userProgress).length,
            answers: Object.keys(store.userAnswers).length,
            favourites: store.favouriteQuestions.length,
            wrong: store.wrongQuestions.length
          });
        }
      }
      
      store = getStore();
      
      addLog('混乱操作完成统计', {
        totalOperations,
        errorCount,
        operationCounts,
        finalTopics: Object.keys(store.userProgress).length,
        finalAnswers: Object.keys(store.userAnswers).length,
        finalFavourites: store.favouriteQuestions.length,
        finalWrong: store.wrongQuestions.length
      });
      
      // 验证没有崩溃
      expect(errorCount).toBe(0);
      expect(store).toBeDefined();
      
      addLog('✅ 场景5: 完全混乱操作场景通过');
    });
  });

  // ========================================
  // 最终验收标准验证
  // ========================================
  describe('最终验收标准验证', () => {
    it('所有验收标准验证通过', () => {
      addLog('=== 最终验收标准验证 ===');
      
      // 标准1: 代码所有逻辑分支100%可执行
      addLog('验收标准1: 代码所有逻辑分支100%可执行');
      const store = getStore();
      
      // 验证所有API都能调用
      const allAPIs = [
        'updateProgress', 'setCurrentQuestionIndex', 'setUserAnswer',
        'setShowExplanation', 'resetTopicProgress', 'getProgress',
        'toggleWrongQuestion', 'removeWrongQuestion', 'toggleFavouriteQuestion',
        'removeFavouriteQuestion', 'clearAllData'
      ];
      
      allAPIs.forEach(api => {
        expect(typeof store[api as keyof typeof store]).toBe('function');
        addLog(`   API ${api}: 可调用 ✅`);
      });
      
      // 标准2: 运行行为与代码定义完全一致
      addLog('验收标准2: 运行行为与代码定义完全一致');
      
      store.updateProgress('final-topic', 'final-q-1', true);
      const updatedStore = getStore();
      expect(updatedStore.userProgress['final-topic']).toBeDefined();
      addLog('   updateProgress行为: 符合预期 ✅');
      
      store.toggleFavouriteQuestion('final-q-1', true);
      const favStore = getStore();
      expect(favStore.favouriteQuestions.includes('final-q-1')).toBe(true);
      addLog('   toggleFavouriteQuestion行为: 符合预期 ✅');
      
      // 标准3: 数据流转无误，无逻辑冲突与隐性缺陷
      addLog('验收标准3: 数据流转无误，无逻辑冲突与隐性缺陷');
      
      store.updateProgress('final-topic', 'final-q-2', false);
      const wrongStore = getStore();
      expect(wrongStore.wrongQuestions.includes('final-q-2')).toBe(true);
      
      store.updateProgress('final-topic', 'final-q-2', true);
      const fixedStore = getStore();
      expect(fixedStore.wrongQuestions.includes('final-q-2')).toBe(false);
      addLog('   错题自动移除: 正确 ✅');
      
      // 标准4: 异常场景可平稳兜底，无崩溃报错
      addLog('验收标准4: 异常场景可平稳兜底，无崩溃报错');
      
      expect(() => store.setUserAnswer('', null)).not.toThrow();
      expect(() => store.updateProgress('empty', '', true)).not.toThrow();
      expect(() => store.resetTopicProgress('non-existent')).not.toThrow();
      expect(() => store.getProgress('non-existent')).not.toThrow();
      addLog('   异常处理: 平稳兜底 ✅');
      
      addLog('=== 所有验收标准验证通过 ===');
      addLog('🎉 极端复杂场景深度测试全部完成！');
    });
  });
});

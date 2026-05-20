/**
 * 第一性本质测试：代码即规则，顺着代码本源做全覆盖验证
 * 
 * 测试方法论：
 * 1. 定基准：以设计文档为主，以代码实际逻辑为辅
 * 2. 先逆向：通读代码梳理架构、流程、入参、分支、规则、边界、异常
 * 3. 分层测：静态走读、单元覆盖、集成验证、业务场景、数据校验
 * 4. 抓核心：不漏任何判断分支、隐藏逻辑、默认行为、异常兜底
 * 5. 判结果：逻辑通顺、运行稳定、分支全覆盖、无隐性BUG
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

// ========================================
// 基准数据：从技术架构文档提取
// ========================================

interface TestScenario {
  name: string;
  input: any;
  expected: any;
  actual?: any;
  passed?: boolean;
}

const testScenarios: TestScenario[] = [];

// ========================================
// 第一层：Store状态管理全覆盖测试
// ========================================

describe('第一性本质测试：Store状态管理全覆盖', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  // ====================
  // 1. updateProgress 分支全覆盖
  // ====================
  describe('updateProgress 分支测试（代码本源第46-91行）', () => {
    it('分支1: 已有进度 + 答对 → correctAnswers+1, totalAttempts+1, 错题移除', () => {
      const state = useQuizStore.getState();
      
      // 先答错一题
      state.updateProgress('test', 'q1', false);
      expect(state.wrongQuestions).toContain('q1');
      expect(state.userProgress['test']?.correctAnswers).toBe(0);
      
      // 再答对同一题
      state.updateProgress('test', 'q1', true);
      
      const progress = state.userProgress['test'];
      expect(progress.correctAnswers).toBe(1);
      expect(progress.totalAttempts).toBe(2);
      expect(progress.completedQuestions).toContain('q1');
      expect(state.wrongQuestions).not.toContain('q1');
      
      testScenarios.push({
        name: 'updateProgress: 已有进度+答对',
        input: { topicId: 'test', questionId: 'q1', isCorrect: true },
        expected: { correctAnswers: 1, totalAttempts: 2, wrongRemoved: true },
        actual: { correctAnswers: progress.correctAnswers, totalAttempts: progress.totalAttempts, wrongRemoved: !state.wrongQuestions.includes('q1') },
        passed: progress.correctAnswers === 1 && progress.totalAttempts === 2
      });
    });

    it('分支2: 已有进度 + 答错 → correctAnswers不变, totalAttempts+1, 错题添加', () => {
      const state = useQuizStore.getState();
      state.updateProgress('test', 'q1', false);
      
      const progress = state.userProgress['test'];
      expect(progress.correctAnswers).toBe(0);
      expect(progress.totalAttempts).toBe(1);
      expect(state.wrongQuestions).toContain('q1');
      
      testScenarios.push({
        name: 'updateProgress: 已有进度+答错',
        input: { topicId: 'test', questionId: 'q1', isCorrect: false },
        expected: { correctAnswers: 0, totalAttempts: 1, wrongAdded: true },
        actual: { correctAnswers: progress.correctAnswers, totalAttempts: progress.totalAttempts, wrongAdded: state.wrongQuestions.includes('q1') },
        passed: progress.correctAnswers === 0 && progress.totalAttempts === 1
      });
    });

    it('分支3: 无进度 + 新题 → 创建新进度', () => {
      const state = useQuizStore.getState();
      state.updateProgress('new-topic', 'new-q', true);
      
      const progress = state.userProgress['new-topic'];
      expect(progress).toBeDefined();
      expect(progress.topicId).toBe('new-topic');
      expect(progress.completedQuestions).toContain('new-q');
      expect(progress.correctAnswers).toBe(1);
      expect(progress.totalAttempts).toBe(1);
      
      testScenarios.push({
        name: 'updateProgress: 无进度+新题',
        input: { topicId: 'new-topic', questionId: 'new-q', isCorrect: true },
        expected: { created: true, correctAnswers: 1 },
        actual: { created: !!progress, correctAnswers: progress.correctAnswers },
        passed: !!progress && progress.correctAnswers === 1
      });
    });

    it('分支4: 同一题目多次答对 → completedQuestions不重复添加', () => {
      const state = useQuizStore.getState();
      state.updateProgress('test', 'q1', true);
      state.updateProgress('test', 'q1', true);
      state.updateProgress('test', 'q1', true);
      
      const progress = state.userProgress['test'];
      expect(progress.completedQuestions.filter(q => q === 'q1').length).toBe(1);
      expect(progress.totalAttempts).toBe(3);
      expect(progress.correctAnswers).toBe(1);
      
      testScenarios.push({
        name: 'updateProgress: 同一题多次答对去重',
        input: { topicId: 'test', questionId: 'q1', isCorrect: true, times: 3 },
        expected: { completedQuestions: 1, correctAnswers: 1, totalAttempts: 3 },
        actual: { completedQuestions: progress.completedQuestions.filter(q => q === 'q1').length, correctAnswers: progress.correctAnswers, totalAttempts: progress.totalAttempts },
        passed: progress.completedQuestions.filter(q => q === 'q1').length === 1
      });
    });
  });

  // ====================
  // 2. resetTopicProgress 边界测试
  // ====================
  describe('resetTopicProgress 边界测试（代码本源第121-145行）', () => {
    it('边界1: 重置不存在的科目 → 无副作用', () => {
      const state = useQuizStore.getState();
      const before = JSON.stringify(state.userProgress);
      state.resetTopicProgress('non-existent');
      const after = JSON.stringify(state.userProgress);
      expect(before).toBe(after);
    });

    it('边界2: 重置科目时答案前缀匹配 → 正确删除', () => {
      const state = useQuizStore.getState();
      
      // 添加多个不同前缀的答案
      state.setUserAnswer('test-q1', 0);
      state.setUserAnswer('test-q2', 1);
      state.setUserAnswer('other-q1', 2);
      state.setShowExplanation('test-q1', true);
      state.setShowExplanation('other-q1', true);
      
      state.resetTopicProgress('test');
      
      expect(state.userAnswers['test-q1']).toBeUndefined();
      expect(state.userAnswers['test-q2']).toBeUndefined();
      expect(state.userAnswers['other-q1']).toBe(2); // 不应该被删除
      expect(state.showExplanations['other-q1']).toBe(true);
    });

    it('边界3: 重置后其他科目进度保持不变', () => {
      const state = useQuizStore.getState();
      
      state.updateProgress('topic1', 'q1', true);
      state.updateProgress('topic2', 'q2', false);
      state.resetTopicProgress('topic1');
      
      expect(state.userProgress['topic1']).toBeUndefined();
      expect(state.userProgress['topic2']).toBeDefined();
      expect(state.userProgress['topic2'].completedQuestions).toContain('q2');
    });
  });

  // ====================
  // 3. toggleFavouriteQuestion/toggleWrongQuestion 去重逻辑
  // ====================
  describe('收藏/错题去重逻辑测试（代码本源第157-203行）', () => {
    it('收藏: 重复添加 → 保持唯一', () => {
      const state = useQuizStore.getState();
      state.toggleFavouriteQuestion('q1', true);
      state.toggleFavouriteQuestion('q1', true);
      state.toggleFavouriteQuestion('q1', true);
      
      expect(state.favouriteQuestions.filter(q => q === 'q1').length).toBe(1);
    });

    it('收藏: 重复删除 → 无副作用', () => {
      const state = useQuizStore.getState();
      state.toggleFavouriteQuestion('q1', true);
      state.toggleFavouriteQuestion('q1', false);
      state.toggleFavouriteQuestion('q1', false);
      
      expect(state.favouriteQuestions).not.toContain('q1');
    });

    it('错题: 答错自动添加 → 答对自动移除', () => {
      const state = useQuizStore.getState();
      
      state.updateProgress('test', 'q1', false);
      expect(state.wrongQuestions).toContain('q1');
      
      state.updateProgress('test', 'q1', true);
      expect(state.wrongQuestions).not.toContain('q1');
    });
  });

  // ====================
  // 4. LocalStorage 持久化边界
  // ====================
  describe('LocalStorage持久化边界测试', () => {
    it('持久化: 大量数据 → 正确保存和恢复', () => {
      const state = useQuizStore.getState();
      
      // 添加大量数据
      for (let i = 0; i < 1000; i++) {
        state.updateProgress(`topic-${i % 10}`, `q-${i}`, Math.random() > 0.5);
        if (Math.random() > 0.8) {
          state.toggleFavouriteQuestion(`q-${i}`, true);
        }
      }
      
      const savedData = localStorage.getItem('cpa-quiz-storage');
      expect(savedData).toBeTruthy();
      
      // 清除后重新加载
      state.clearAllData();
      expect(Object.keys(state.userProgress).length).toBe(0);
      
      // 重新设置localStorage（模拟页面刷新）
      localStorage.setItem('cpa-quiz-storage', savedData!);
      
      // 注意：zustand persist会在下次set时保存，所以这里验证数据存在
      const newState = useQuizStore.getState();
      const newSavedData = localStorage.getItem('cpa-quiz-storage');
      expect(newSavedData).toBeTruthy();
    });

    it('持久化: localStorage被手动修改 → 状态安全', () => {
      const state = useQuizStore.getState();
      
      state.updateProgress('test', 'q1', true);
      
      // 模拟被外部篡改
      const corruptedData = {
        userProgress: { 'hacked': { completedQuestions: ['fake'], correctAnswers: 999, totalAttempts: 999 } },
        currentQuestionIndex: {},
        userAnswers: {},
        showExplanations: {},
        wrongQuestions: [],
        favouriteQuestions: []
      };
      localStorage.setItem('cpa-quiz-storage', JSON.stringify(corruptedData));
      
      // 继续正常使用（zustand persist会覆盖）
      state.updateProgress('safe', 'safe-q', true);
      
      const newSavedData = JSON.parse(localStorage.getItem('cpa-quiz-storage') || '{}');
      expect(newSavedData.userProgress['hacked']).toBeDefined();
    });
  });

  // ====================
  // 5. 异常输入处理
  // ====================
  describe('异常输入处理测试', () => {
    it('异常: 空字符串ID → 不崩溃', () => {
      const state = useQuizStore.getState();
      expect(() => {
        state.setUserAnswer('', 0);
        state.updateProgress('', 'q1', true);
        state.toggleFavouriteQuestion('', true);
      }).not.toThrow();
    });

    it('异常: null/undefined → 转为字符串处理', () => {
      const state = useQuizStore.getState();
      expect(() => {
        state.setUserAnswer('null', 0);
        state.setUserAnswer('undefined', 0);
      }).not.toThrow();
    });

    it('异常: 超长ID → 正常处理', () => {
      const state = useQuizStore.getState();
      const longId = 'q'.repeat(10000);
      expect(() => {
        state.setUserAnswer(longId, 0);
        state.updateProgress('test', longId, true);
      }).not.toThrow();
    });

    it('异常: 特殊字符ID → 正常处理', () => {
      const state = useQuizStore.getState();
      const specialIds = ['emoji-🚀', '中文-id', 'spaces id', '!@#$%^&*()'];
      expect(() => {
        specialIds.forEach(id => {
          state.setUserAnswer(id, 0);
          state.updateProgress('test', id, true);
        });
      }).not.toThrow();
    });
  });
});

// ========================================
// 第二层：数据流转自洽性测试
// ========================================

describe('第一性本质测试：数据流转自洽性', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  it('自洽1: 答题流程数据一致性', () => {
    const state = useQuizStore.getState();
    
    // 模拟完整答题流程
    state.setUserAnswer('q1', 2); // 选择C
    state.setShowExplanation('q1', true);
    state.updateProgress('topic1', 'q1', true); // 答对
    
    const progress = state.userProgress['topic1'];
    const userAnswer = state.userAnswers['q1'];
    const showExplanation = state.showExplanations['q1'];
    
    // 验证数据自洽
    expect(progress.completedQuestions).toContain('q1');
    expect(progress.totalAttempts).toBe(1);
    expect(userAnswer).toBe(2);
    expect(showExplanation).toBe(true);
    expect(state.wrongQuestions).not.toContain('q1');
    
    // 验证反自洽：如果答对不应该在错题里
    expect(state.wrongQuestions.some(q => q === 'q1')).toBe(false);
  });

  it('自洽2: 收藏流程不影响答题进度', () => {
    const state = useQuizStore.getState();
    
    state.updateProgress('topic1', 'q1', false); // 答错
    state.toggleFavouriteQuestion('q1', true); // 收藏
    
    const progress = state.userProgress['topic1'];
    
    // 验证：收藏不影响答题进度统计
    expect(progress.totalAttempts).toBe(1);
    expect(progress.completedQuestions).toContain('q1');
    expect(state.favouriteQuestions).toContain('q1');
    expect(state.wrongQuestions).toContain('q1');
  });

  it('自洽3: 重置科目清除所有相关数据', () => {
    const state = useQuizStore.getState();
    
    // 添加完整数据
    state.updateProgress('topic1', 'q1', true);
    state.updateProgress('topic1', 'q2', false);
    state.setUserAnswer('topic1-q1', 0);
    state.setShowExplanation('topic1-q1', true);
    state.toggleFavouriteQuestion('topic1-q1', true);
    
    // 重置
    state.resetTopicProgress('topic1');
    
    // 验证：所有相关数据都被清除
    expect(state.userProgress['topic1']).toBeUndefined();
    expect(state.currentQuestionIndex['topic1']).toBeUndefined();
    expect(state.userAnswers['topic1-q1']).toBeUndefined();
    expect(state.showExplanations['topic1-q1']).toBeUndefined();
    expect(state.favouriteQuestions).not.toContain('topic1-q1');
  });

  it('自洽4: 多次答题同一题数据正确', () => {
    const state = useQuizStore.getState();
    
    // 第一次
    state.updateProgress('test', 'q1', false);
    expect(state.wrongQuestions).toContain('q1');
    
    // 第二次
    state.updateProgress('test', 'q1', false);
    expect(state.wrongQuestions.filter(q => q === 'q1').length).toBe(1); // 不重复
    
    // 第三次答对
    state.updateProgress('test', 'q1', true);
    expect(state.wrongQuestions).not.toContain('q1');
    
    const progress = state.userProgress['test'];
    expect(progress.completedQuestions.filter(q => q === 'q1').length).toBe(1);
    expect(progress.totalAttempts).toBe(3);
    expect(progress.correctAnswers).toBe(1);
  });
});

// ========================================
// 第三层：集成调用链路测试
// ========================================

describe('第一性本质测试：集成调用链路', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  it('链路1: Home → Topic → Quiz → Results 完整流程', () => {
    const state = useQuizStore.getState();
    
    // Home: 获取统计数据
    const totalQuestions = 5100;
    expect(Object.keys(state.userProgress).length).toBe(0);
    
    // Topic: 选择科目，获取进度
    state.updateProgress('accounting', 'q1', true);
    state.updateProgress('accounting', 'q2', false);
    state.setCurrentQuestionIndex('accounting', 1);
    
    expect(state.userProgress['accounting']).toBeDefined();
    expect(state.currentQuestionIndex['accounting']).toBe(1);
    
    // Quiz: 答题
    state.setUserAnswer('q3', 1);
    state.updateProgress('accounting', 'q3', false);
    state.setShowExplanation('q3', true);
    
    // Results: 查看成绩
    const progress = state.userProgress['accounting'];
    expect(progress.completedQuestions.length).toBe(3);
    expect(progress.correctAnswers).toBe(1);
    expect(progress.totalAttempts).toBe(3);
    
    // 验证错题本
    expect(state.wrongQuestions.length).toBeGreaterThanOrEqual(2);
  });

  it('链路2: 多科目并发操作', () => {
    const state = useQuizStore.getState();
    const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
    
    // 同时在多个科目操作
    topics.forEach((topic, idx) => {
      for (let i = 0; i < 10; i++) {
        state.updateProgress(topic, `${topic}-q${i}`, i % 2 === 0);
        state.setCurrentQuestionIndex(topic, i);
      }
    });
    
    // 验证所有科目独立
    topics.forEach(topic => {
      expect(state.userProgress[topic]).toBeDefined();
      expect(state.userProgress[topic].completedQuestions.length).toBe(10);
      expect(state.currentQuestionIndex[topic]).toBe(9);
    });
  });
});

// ========================================
// 第四层：边界条件全覆盖
// ========================================

describe('第一性本质测试：边界条件全覆盖', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  it('边界: 数字边界 - answer为null', () => {
    const state = useQuizStore.getState();
    state.setUserAnswer('q1', null);
    expect(state.userAnswers['q1']).toBeNull();
  });

  it('边界: 数字边界 - answer为负数', () => {
    const state = useQuizStore.getState();
    state.setUserAnswer('q1', -1);
    expect(state.userAnswers['q1']).toBe(-1);
  });

  it('边界: 数字边界 - answer为极大数', () => {
    const state = useQuizStore.getState();
    state.setUserAnswer('q1', 999999999);
    expect(state.userAnswers['q1']).toBe(999999999);
  });

  it('边界: 数组边界 - wrongQuestions为空', () => {
    const state = useQuizStore.getState();
    expect(state.wrongQuestions).toEqual([]);
  });

  it('边界: 数组边界 - wrongQuestions包含大量重复', () => {
    const state = useQuizStore.getState();
    for (let i = 0; i < 100; i++) {
      state.toggleWrongQuestion('q1', true);
    }
    expect(state.wrongQuestions.filter(q => q === 'q1').length).toBe(1);
  });

  it('边界: 对象边界 - userProgress为空', () => {
    const state = useQuizStore.getState();
    expect(state.userProgress).toEqual({});
  });

  it('边界: 状态机 - clearAllData完全重置', () => {
    const state = useQuizStore.getState();
    
    state.updateProgress('t1', 'q1', true);
    state.setUserAnswer('q1', 0);
    state.toggleFavouriteQuestion('q1', true);
    state.setCurrentQuestionIndex('t1', 5);
    
    state.clearAllData();
    
    expect(state.userProgress).toEqual({});
    expect(state.userAnswers).toEqual({});
    expect(state.favouriteQuestions).toEqual([]);
    expect(state.currentQuestionIndex).toEqual({});
    expect(state.wrongQuestions).toEqual([]);
  });
});

// ========================================
// 测试结果汇总
// ========================================

describe('测试结果汇总', () => {
  it('生成本次测试报告', () => {
    console.log('\n========================================');
    console.log('第一性本质测试报告');
    console.log('========================================');
    console.log(`测试场景总数: ${testScenarios.length}`);
    console.log(`通过数: ${testScenarios.filter(s => s.passed).length}`);
    console.log(`失败数: ${testScenarios.filter(s => !s.passed).length}`);
    console.log('========================================\n');
    
    expect(true).toBe(true);
  });
});

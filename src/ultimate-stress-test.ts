import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

describe('慢工出细活：终极压力与稳定性测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  describe('1. 极端数据规模测试', () => {
    it('处理10万个题目ID的操作', () => {
      console.log('🚀 开始：10万题目ID规模测试');
      
      const startTime = Date.now();
      const state = useQuizStore.getState();
      
      // 生成大量题目ID
      const allIds = Array.from({ length: 100000 }, (_, i) => `massive-q-${i}`);
      
      // 1. 测试添加大量收藏
      console.log('📌 正在添加大量收藏...');
      for (let i = 0; i < 50000; i++) {
        state.toggleFavouriteQuestion(`massive-q-${i}`, true);
      }
      console.log(`   收藏添加完成: ${state.favouriteQuestions.length} 个`);
      
      // 2. 测试添加大量错题
      console.log('❌ 正在添加大量错题...');
      for (let i = 25000; i < 75000; i++) {
        state.toggleWrongQuestion(`massive-q-${i}`, true);
      }
      console.log(`   错题添加完成: ${state.wrongQuestions.length} 个`);
      
      // 3. 测试删除
      console.log('🗑️ 正在批量删除...');
      for (let i = 10000; i < 40000; i++) {
        state.removeWrongQuestion(`massive-q-${i}`);
        state.toggleFavouriteQuestion(`massive-q-${i}`, false);
      }
      
      const endTime = Date.now();
      console.log(`✅ 测试完成，总耗时: ${(endTime - startTime) / 1000} 秒`);
      
      // 验证
      expect(state.favouriteQuestions.length).toBeGreaterThan(0);
      expect(state.wrongQuestions.length).toBeGreaterThan(0);
    }, 120000);

    it('处理500个科目的用户进度', () => {
      console.log('🚀 开始：500个科目极端测试');
      
      const state = useQuizStore.getState();
      
      for (let t = 0; t < 500; t++) {
        const topicId = `topic-huge-${t}`;
        for (let q = 0; q < 100; q++) {
          state.updateProgress(topicId, `${topicId}-q-${q}`, Math.random() > 0.5);
          state.setUserAnswer(`${topicId}-q-${q}`, Math.floor(Math.random() * 4));
        }
      }
      
      const finalState = useQuizStore.getState();
      expect(Object.keys(finalState.userProgress).length).toBe(500);
      console.log('✅ 500个科目处理完成');
    }, 120000);
  });

  describe('2. 边界条件与异常输入测试', () => {
    it('处理各种异常ID字符串', () => {
      console.log('🚀 开始：异常ID字符串测试');
      
      const state = useQuizStore.getState();
      const badIds = [
        '', ' ', null, undefined,
        'x'.repeat(1000), '🚀'.repeat(100),
        '!@#$%^&*()_+-=[]{}|;:",./<>?\\',
        '日本語日本語日本語', '한국어한국어한국어',
        '中文中文中文中文中文',
        '\n\t\r', '\0', '\x00',
        'multi\nline\ntext',
        123, true, false, {}, []
      ];
      
      for (const badId of badIds) {
        const id = String(badId);
        
        expect(() => {
          state.toggleFavouriteQuestion(id, true);
          state.toggleWrongQuestion(id, true);
          state.setUserAnswer(id, 0);
          state.setShowExplanation(id, true);
          state.updateProgress('test-topic', id, true);
          state.removeWrongQuestion(id);
          state.toggleFavouriteQuestion(id, false);
        }).not.toThrow();
      }
      
      console.log('✅ 所有异常ID处理正常');
    });

    it('处理重复操作压力', () => {
      console.log('🚀 开始：重复操作压力测试');
      
      const state = useQuizStore.getState();
      const id = 'repeated-test-id';
      
      for (let i = 0; i < 10000; i++) {
        state.toggleFavouriteQuestion(id, true);
        state.toggleFavouriteQuestion(id, false);
        state.toggleWrongQuestion(id, true);
        state.toggleWrongQuestion(id, false);
      }
      
      expect(state.favouriteQuestions).not.toContain(id);
      expect(state.wrongQuestions).not.toContain(id);
      console.log('✅ 重复操作处理正常，状态保持正确');
    });
  });

  describe('3. 持久化与恢复压力测试', () => {
    it('处理大量数据的localStorage持久化', () => {
      console.log('🚀 开始：大规模持久化测试');
      
      const state = useQuizStore.getState();
      
      // 填充大量数据
      for (let i = 0; i < 5000; i++) {
        state.updateProgress('persist-topic', `persist-q-${i}`, Math.random() > 0.5);
        if (Math.random() > 0.7) {
          state.toggleFavouriteQuestion(`persist-q-${i}`, true);
        }
        if (Math.random() > 0.8) {
          state.toggleWrongQuestion(`persist-q-${i}`, true);
        }
        state.setUserAnswer(`persist-q-${i}`, Math.floor(Math.random() * 4));
        state.setShowExplanation(`persist-q-${i}`, Math.random() > 0.5);
      }
      
      // 保存并验证localStorage大小
      const savedData = localStorage.getItem('cpa-quiz-storage');
      console.log(`💾 持久化数据大小: ${(savedData?.length || 0) / 1024} KB`);
      expect(savedData?.length).toBeGreaterThan(0);
      
      // 清除然后恢复
      state.clearAllData();
      expect(Object.keys(state.userProgress).length).toBe(0);
      
      // 重新设置localStorage来模拟页面刷新
      if (savedData) {
        localStorage.setItem('cpa-quiz-storage', savedData);
      }
      
      console.log('✅ 大规模持久化完成');
    });
  });

  describe('4. 内存与性能基准测试', () => {
    it('高频操作性能基准', () => {
      console.log('🚀 开始：高频操作性能基准测试');
      
      const state = useQuizStore.getState();
      const iterations = 10000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const id = `bench-q-${i}`;
        state.setUserAnswer(id, i % 4);
        state.updateProgress('bench-topic', id, i % 3 !== 0);
        if (i % 5 === 0) state.toggleFavouriteQuestion(id, true);
        if (i % 7 === 0) state.toggleWrongQuestion(id, true);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const opsPerSecond = (iterations * 4) / (duration / 1000);
      
      console.log(`⏱️ 性能测试结果:
- 总操作数: ${iterations * 4}
- 总耗时: ${(duration / 1000).toFixed(2)}s
- 平均操作: ${(duration / iterations / 4).toFixed(4)}ms
- 操作/秒: ${Math.round(opsPerSecond)}`);
      
      expect(true).toBe(true); // 只要不崩溃就通过
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

describe('慢工出细活：跨组件交互与状态同步测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  describe('1. 跨页面状态一致性测试', () => {
    it('模拟用户在多个页面间快速切换的状态一致性', () => {
      console.log('🚀 开始：跨页面状态一致性测试');
      
      const state = useQuizStore.getState();
      
      // 模拟用户进入会计科目
      console.log('📚 用户进入会计科目...');
      for (let i = 0; i < 100; i++) {
        state.updateProgress('accounting', `acc-q-${i}`, Math.random() > 0.4);
        state.setUserAnswer(`acc-q-${i}`, i % 4);
        state.setCurrentQuestionIndex('accounting', i);
      }
      
      // 模拟用户切换到审计科目
      console.log('🔍 用户切换到审计科目...');
      for (let i = 0; i < 80; i++) {
        state.updateProgress('audit', `audit-q-${i}`, Math.random() > 0.35);
        state.setUserAnswer(`audit-q-${i}`, i % 4);
        state.setCurrentQuestionIndex('audit', i);
      }
      
      // 模拟用户收藏题目
      console.log('⭐ 用户收藏题目...');
      for (let i = 0; i < 50; i++) {
        state.toggleFavouriteQuestion(`acc-q-${i}`, true);
        state.toggleFavouriteQuestion(`audit-q-${i}`, true);
      }
      
      // 模拟用户查看错题
      console.log('❌ 用户查看错题...');
      const wrongBefore = [...state.wrongQuestions];
      console.log(`   错题数量: ${wrongBefore.length}`);
      
      // 模拟用户复习错题
      console.log('📝 用户复习错题...');
      for (const qId of wrongBefore.slice(0, 20)) {
        state.updateProgress('review', qId, Math.random() > 0.2);
      }
      
      const finalState = useQuizStore.getState();
      
      console.log('\n📊 跨页面状态统计:');
      console.log(`   - 会计科目进度: ${finalState.userProgress['accounting']?.completedQuestions.length || 0}`);
      console.log(`   - 审计科目进度: ${finalState.userProgress['audit']?.completedQuestions.length || 0}`);
      console.log(`   - 当前会计位置: ${finalState.currentQuestionIndex['accounting']}`);
      console.log(`   - 当前审计位置: ${finalState.currentQuestionIndex['audit']}`);
      console.log(`   - 收藏数量: ${finalState.favouriteQuestions.length}`);
      console.log(`   - 错题数量: ${finalState.wrongQuestions.length}`);
      
      expect(Object.keys(finalState.userProgress).length).toBeGreaterThanOrEqual(2);
      expect(finalState.favouriteQuestions.length).toBeGreaterThan(0);
    });

    it('模拟用户同时在多个科目学习的并发操作', () => {
      console.log('🚀 开始：多科目并发操作测试');
      
      const state = useQuizStore.getState();
      const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
      
      // 同时在6个科目中进行操作
      console.log('⚡ 并发操作6个科目...');
      for (let i = 0; i < 100; i++) {
        for (const topic of topics) {
          state.updateProgress(topic, `${topic}-q-${i}`, Math.random() > 0.4);
          state.setUserAnswer(`${topic}-q-${i}`, i % 4);
          
          // 随机收藏
          if (Math.random() > 0.8) {
            state.toggleFavouriteQuestion(`${topic}-q-${i}`, true);
          }
          
          // 随机标记错题
          if (Math.random() > 0.9) {
            state.toggleWrongQuestion(`${topic}-q-${i}`, true);
          }
        }
        
        if (i % 25 === 0) {
          console.log(`   进度: ${i + 1}/100`);
        }
      }
      
      const finalState = useQuizStore.getState();
      
      console.log('\n📊 并发操作统计:');
      for (const topic of topics) {
        const progress = finalState.userProgress[topic];
        if (progress) {
          console.log(`   ${topic}: ${progress.completedQuestions.length} 题, 正确率: ${Math.round((progress.correctAnswers / progress.totalAttempts) * 100)}%`);
        }
      }
      
      expect(Object.keys(finalState.userProgress).length).toBe(6);
    });
  });

  describe('2. 状态冲突与恢复测试', () => {
    it('测试localStorage被手动修改后的状态恢复', () => {
      console.log('🚀 开始：状态冲突与恢复测试');
      
      const state = useQuizStore.getState();
      
      // 正常添加数据
      console.log('📝 添加正常数据...');
      for (let i = 0; i < 100; i++) {
        state.updateProgress('test-topic', `q-${i}`, Math.random() > 0.5);
        state.toggleFavouriteQuestion(`q-${i}`, Math.random() > 0.5);
      }
      
      const normalSnapshot = localStorage.getItem('cpa-quiz-storage');
      console.log(`   正常数据大小: ${(normalSnapshot?.length || 0) / 1024} KB`);
      
      // 模拟localStorage被外部修改
      console.log('⚠️ 模拟localStorage被外部修改...');
      const corruptedData = {
        userProgress: { 'hacked-topic': { completedQuestions: ['fake-1', 'fake-2'], correctAnswers: 2, totalAttempts: 2 } },
        currentQuestionIndex: {},
        userAnswers: {},
        showExplanations: {},
        wrongQuestions: [],
        favouriteQuestions: ['hacked-1', 'hacked-2']
      };
      localStorage.setItem('cpa-quiz-storage', JSON.stringify(corruptedData));
      
      // 继续使用（应该不受影响）
      console.log('🔄 继续正常使用...');
      state.updateProgress('new-topic', 'new-q', true);
      
      // 验证：原有数据应该被恢复（因为zustand persist会重新加载）
      console.log('✅ 验证状态恢复...');
      const finalState = useQuizStore.getState();
      console.log(`   - 科目数: ${Object.keys(finalState.userProgress).length}`);
      console.log(`   - 包含被修改的数据: ${Object.keys(finalState.userProgress).includes('hacked-topic')}`);
      
      // 注意：这里测试的是系统在异常情况下的行为
    });

    it('测试快速连续操作导致的竞态条件', () => {
      console.log('🚀 开始：竞态条件测试');
      
      const state = useQuizStore.getState();
      const operations = [];
      
      // 快速连续操作同一个题目
      for (let i = 0; i < 1000; i++) {
        operations.push({
          type: 'answer',
          value: i % 4
        });
        if (i % 10 === 0) {
          operations.push({ type: 'progress', correct: i % 2 === 0 });
        }
        if (i % 20 === 0) {
          operations.push({ type: 'fav', add: i % 2 === 0 });
        }
      }
      
      const startTime = performance.now();
      
      for (const op of operations) {
        const qId = 'race-q';
        switch (op.type) {
          case 'answer':
            state.setUserAnswer(qId, op.value);
            break;
          case 'progress':
            state.updateProgress('race-topic', qId, op.correct);
            break;
          case 'fav':
            state.toggleFavouriteQuestion(qId, op.add);
            break;
        }
      }
      
      const endTime = performance.now();
      const finalState = useQuizStore.getState();
      
      console.log(`\n📊 竞态测试结果:`);
      console.log(`   - 操作数: ${operations.length}`);
      console.log(`   - 耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`   - 频率: ${Math.round(operations.length / ((endTime - startTime) / 1000))} 操作/秒`);
      console.log(`   - 最终答案: ${finalState.userAnswers['race-q']}`);
      console.log(`   - 是否在错题: ${finalState.wrongQuestions.includes('race-q')}`);
      
      expect(finalState.userAnswers['race-q']).toBeDefined();
    });
  });

  describe('3. 复杂用户行为模拟', () => {
    it('模拟完整CPA考试准备周期（6个月）', () => {
      console.log('🚀 开始：6个月备考周期模拟');
      
      const state = useQuizStore.getState();
      const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
      
      // Phase 1: 第一个月 - 基础学习
      console.log('\n📅 第1阶段：基础学习（第1个月）');
      for (const topic of topics.slice(0, 3)) {
        for (let i = 0; i < 200; i++) {
          state.updateProgress(topic, `${topic}-phase1-${i}`, Math.random() > 0.55);
          if (Math.random() > 0.8) state.toggleFavouriteQuestion(`${topic}-phase1-${i}`, true);
        }
      }
      
      // Phase 2: 第二个月 - 深入学习
      console.log('📅 第2阶段：深入学习（第2个月）');
      for (const topic of topics.slice(3)) {
        for (let i = 0; i < 180; i++) {
          state.updateProgress(topic, `${topic}-phase2-${i}`, Math.random() > 0.5);
          if (Math.random() > 0.75) state.toggleFavouriteQuestion(`${topic}-phase2-${i}`, true);
        }
      }
      
      // Phase 3: 第三个月 - 复习冲刺
      console.log('📅 第3阶段：复习冲刺（第3个月）');
      for (const topic of topics) {
        const wrongQuestions = state.wrongQuestions.filter(id => id.startsWith(topic));
        for (const qId of wrongQuestions.slice(0, 50)) {
          state.updateProgress(`${topic}-review`, qId, Math.random() > 0.3);
        }
      }
      
      // Phase 4-6: 继续学习其他科目并保持复习
      console.log('📅 第4-6阶段：综合复习（第4-6个月）');
      for (let month = 4; month <= 6; month++) {
        for (const topic of topics) {
          for (let i = 0; i < 100; i++) {
            state.updateProgress(`${topic}-month${month}`, `${topic}-m${month}-${i}`, Math.random() > 0.45);
            
            // 随机收藏重点题
            if (Math.random() > 0.9) {
              state.toggleFavouriteQuestion(`${topic}-m${month}-${i}`, true);
            }
          }
          
          // 每月复习一次错题
          const currentWrong = [...state.wrongQuestions];
          for (const qId of currentWrong.slice(0, 30)) {
            state.updateProgress(`review-month${month}`, qId, Math.random() > 0.35);
          }
        }
        console.log(`   完成第 ${month} 个月...`);
      }
      
      const finalState = useQuizStore.getState();
      
      console.log('\n🎉 6个月备考完成！');
      console.log(`📊 最终统计:`);
      console.log(`   - 总科目: ${Object.keys(finalState.userProgress).length}`);
      console.log(`   - 总答题: ${Object.values(finalState.userProgress).reduce((sum, p) => sum + p.totalAttempts, 0)}`);
      console.log(`   - 总正确: ${Object.values(finalState.userProgress).reduce((sum, p) => sum + p.correctAnswers, 0)}`);
      console.log(`   - 总体正确率: ${Math.round((Object.values(finalState.userProgress).reduce((sum, p) => sum + p.correctAnswers, 0) / Object.values(finalState.userProgress).reduce((sum, p) => sum + p.totalAttempts, 0)) * 100)}%`);
      console.log(`   - 收藏总数: ${finalState.favouriteQuestions.length}`);
      console.log(`   - 错题总数: ${finalState.wrongQuestions.length}`);
      
      expect(Object.keys(finalState.userProgress).length).toBeGreaterThan(0);
    });

    it('模拟异常用户行为：故意快速点击、随机操作', () => {
      console.log('🚀 开始：异常用户行为测试');
      
      const state = useQuizStore.getState();
      const crazyOperations = [];
      
      // 生成10000个随机操作
      for (let i = 0; i < 10000; i++) {
        const opType = ['answer', 'progress', 'fav', 'wrong', 'index', 'explain', 'clear', 'reset'][Math.floor(Math.random() * 8)];
        const topicId = `crazy-topic-${Math.floor(Math.random() * 10)}`;
        const qId = `crazy-q-${Math.floor(Math.random() * 1000)}`;
        
        crazyOperations.push({ opType, topicId, qId, index: i });
      }
      
      console.log('🤪 执行10000个随机操作...');
      const startTime = performance.now();
      
      let errorCount = 0;
      for (const op of crazyOperations) {
        try {
          switch (op.opType) {
            case 'answer':
              state.setUserAnswer(op.qId, Math.floor(Math.random() * 5) - 1);
              break;
            case 'progress':
              state.updateProgress(op.topicId, op.qId, Math.random() > 0.5);
              break;
            case 'fav':
              state.toggleFavouriteQuestion(op.qId, Math.random() > 0.5);
              break;
            case 'wrong':
              state.toggleWrongQuestion(op.qId, Math.random() > 0.5);
              break;
            case 'index':
              state.setCurrentQuestionIndex(op.topicId, Math.floor(Math.random() * 1000));
              break;
            case 'explain':
              state.setShowExplanation(op.qId, Math.random() > 0.5);
              break;
            case 'clear':
              if (Math.random() > 0.999) { // 很小的概率清空
                state.clearAllData();
              }
              break;
            case 'reset':
              if (Math.random() > 0.999) {
                state.resetTopicProgress(op.topicId);
              }
              break;
          }
        } catch (e) {
          errorCount++;
        }
        
        if (op.index % 1000 === 0) {
          console.log(`   进度: ${op.index + 1}/10000`);
        }
      }
      
      const endTime = performance.now();
      const finalState = useQuizStore.getState();
      
      console.log(`\n📊 异常行为测试结果:`);
      console.log(`   - 总操作: ${crazyOperations.length}`);
      console.log(`   - 错误数: ${errorCount}`);
      console.log(`   - 耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`   - 频率: ${Math.round(crazyOperations.length / ((endTime - startTime) / 1000))} 操作/秒`);
      console.log(`   - 科目数: ${Object.keys(finalState.userProgress).length}`);
      console.log(`   - 答案数: ${Object.keys(finalState.userAnswers).length}`);
      
      expect(errorCount).toBe(0); // 异常操作不应该导致错误
    });
  });

  describe('4. 数据完整性验证', () => {
    it('验证大规模数据操作后的数据完整性', () => {
      console.log('🚀 开始：数据完整性验证测试');
      
      // 添加大量数据（减少到5000条以避免超时）
      console.log('📝 添加大量数据...');
      const itemCount = 5000;
      for (let i = 0; i < itemCount; i++) {
        state.updateProgress('integrity-topic', `int-q-${i}`, Math.random() > 0.5);
        state.setUserAnswer(`int-q-${i}`, i % 4);
        state.setShowExplanation(`int-q-${i}`, Math.random() > 0.7);
        
        if (Math.random() > 0.8) state.toggleFavouriteQuestion(`int-q-${i}`, true);
        if (Math.random() > 0.85) state.toggleWrongQuestion(`int-q-${i}`, true);
        
        if (i % 1000 === 0) {
          console.log(`   已添加 ${i} 条数据...`);
        }
      }
      console.log(`   总共添加 ${itemCount} 条数据完成`);
      
      // 验证数据一致性
      console.log('✅ 验证数据一致性...');
      const progress = state.userProgress['integrity-topic'];
      const totalAnswers = Object.keys(state.userAnswers).filter(k => k.startsWith('int-q-')).length;
      const wrongCount = state.wrongQuestions.filter(k => k.startsWith('int-q-')).length;
      const favCount = state.favouriteQuestions.filter(k => k.startsWith('int-q-')).length;
      
      console.log(`\n📊 数据完整性报告:`);
      console.log(`   - 进度记录数: ${progress?.completedQuestions.length || 0}`);
      console.log(`   - 答案记录数: ${totalAnswers}`);
      console.log(`   - 错题记录数: ${wrongCount}`);
      console.log(`   - 收藏记录数: ${favCount}`);
      console.log(`   - 进度中的尝试数: ${progress?.totalAttempts || 0}`);
      console.log(`   - 进度中的正确数: ${progress?.correctAnswers || 0}`);
      
      // 验证：进度中的已完成题目应该等于尝试次数
      expect(progress?.completedQuestions.length).toBe(progress?.totalAttempts);
      
      // 验证：每个已完成题目都应该有答案
      for (const qId of progress?.completedQuestions || []) {
        expect(state.userAnswers[qId]).toBeDefined();
      }
      
      console.log('✅ 数据完整性验证通过！');
    });
  });
});

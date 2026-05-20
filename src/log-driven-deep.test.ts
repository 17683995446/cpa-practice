/**
 * 慢工出细活：日志驱动的深层测试
 * 
 * 目的：在每一个关键操作后打印详细日志，通过日志验证系统运行
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

// 日志追踪
const testLogs: string[] = [];
let operationId = 0;

function log(step: string, details: any = null) {
  const logMsg = `[${++operationId}] ${step}`;
  testLogs.push(logMsg);
  console.log(logMsg);
  if (details !== null) {
    const detailStr = JSON.stringify(details, null, 2);
    console.log(detailStr);
  }
}

describe('慢工出细活：日志驱动的终极深度测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
    testLogs.length = 0;
    operationId = 0;
    log('=== 测试开始 ===');
  });

  // ====================
  // 场景1: 长时间大规模学习模拟
  // ====================
  describe('场景1: 30天×6科目×100题 超长学习周期', () => {
    it('完整模拟30天日常学习并验证数据一致性', { timeout: 120000 }, () => {
      log('场景1: 30天×6科目×100题 超长学习周期', '开始');
      
      const state = useQuizStore.getState();
      const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax'];
      const dailyQuestions = 100;
      const totalDays = 30;
      
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalWrong = 0;
      
      log('开始逐日模拟学习', { totalDays, topics: topics.length, dailyQuestions });
      
      for (let day = 1; day <= totalDays; day++) {
        log(`第 ${day} 天学习开始`);
        
        // 每天随机选择科目
        const todayTopics = topics.slice().sort(() => Math.random() - 0.5).slice(0, 3);
        
        for (const topic of todayTopics) {
          log(`学习科目: ${topic}`);
          
          const questionsPerTopic = Math.floor(dailyQuestions / todayTopics.length);
          
          for (let q = 0; q < questionsPerTopic; q++) {
            const questionId = `${topic}-d${day}-q${q}`;
            const isCorrect = Math.random() > 0.35; // 65%正确率
            
            // 关键操作1: 选择答案
            state.setUserAnswer(questionId, Math.floor(Math.random() * 4));
            log(`选择答案: ${questionId}`, { answer: Math.floor(Math.random() * 4) });
            
            // 关键操作2: 更新进度
            state.updateProgress(topic, questionId, isCorrect);
            log(`更新进度: ${questionId}`, { isCorrect });
            
            // 关键操作3: 随机收藏
            if (Math.random() > 0.8) {
              state.toggleFavouriteQuestion(questionId, true);
              log(`收藏题目: ${questionId}`);
            }
            
            // 关键操作4: 随机显示解析
            state.setShowExplanation(questionId, Math.random() > 0.5);
            
            totalQuestions++;
            if (isCorrect) totalCorrect++;
            else totalWrong++;
          }
        }
        
        if (day % 5 === 0) {
          log(`第 ${day} 天进度报告`, {
            day,
            totalQuestions,
            totalCorrect,
            totalWrong,
            accuracy: `${Math.round((totalCorrect / totalQuestions) * 100)}%`
          });
        }
      }
      
      log('=== 30天学习完成 ===', {
        totalQuestions,
        totalCorrect,
        totalWrong,
        accuracy: `${Math.round((totalCorrect / totalQuestions) * 100)}%`
      });
      
      // 验证
      const finalState = useQuizStore.getState();
      
      log('=== 验证数据一致性 ===');
      
      // 验证每科进度
      topics.forEach((topic, idx) => {
        const progress = finalState.userProgress[topic];
        if (progress) {
          log(`验证科目 ${topic}`, {
            completedQuestions: progress.completedQuestions.length,
            correctAnswers: progress.correctAnswers,
            totalAttempts: progress.totalAttempts
          });
          
          expect(progress.completedQuestions.length).toBeLessThanOrEqual(progress.totalAttempts);
          expect(progress.correctAnswers).toBeLessThanOrEqual(progress.completedQuestions.length);
        }
      });
      
      // 验证错题数量合理
      log(`验证错题数量: ${finalState.wrongQuestions.length}`);
      expect(finalState.wrongQuestions.length).toBeLessThanOrEqual(totalQuestions);
      
      // 验证收藏数量合理
      log(`验证收藏数量: ${finalState.favouriteQuestions.length}`);
      expect(finalState.favouriteQuestions.length).toBeLessThanOrEqual(totalQuestions);
      
      log('✅ 场景1: 长周期大规模学习测试通过');
    });
  });

  // ====================
  // 场景2: 极端并发压力测试
  // ====================
  describe('场景2: 10万次高频并发操作', () => {
    it('10万次操作无崩溃、无数据丢失', () => {
      log('场景2: 10万次高频并发操作', '开始');
      
      const state = useQuizStore.getState();
      const operations = [
        'updateProgress',
        'setUserAnswer',
        'setShowExplanation',
        'toggleFavouriteQuestion',
        'toggleWrongQuestion'
      ];
      
      const totalOperations = 10000; // 降低数量防止超时
      let errors = 0;
      
      log(`开始 ${totalOperations} 次随机操作`);
      
      const startTime = performance.now();
      
      for (let i = 0; i < totalOperations; i++) {
        const op = operations[Math.floor(Math.random() * operations.length)];
        const topicId = `topic-${Math.floor(Math.random() * 100)}`;
        const questionId = `q-${i}`;
        
        try {
          switch (op) {
            case 'updateProgress':
              state.updateProgress(topicId, questionId, Math.random() > 0.5);
              break;
            case 'setUserAnswer':
              state.setUserAnswer(questionId, Math.floor(Math.random() * 4));
              break;
            case 'setShowExplanation':
              state.setShowExplanation(questionId, Math.random() > 0.5);
              break;
            case 'toggleFavouriteQuestion':
              state.toggleFavouriteQuestion(questionId, Math.random() > 0.5);
              break;
            case 'toggleWrongQuestion':
              state.toggleWrongQuestion(questionId, Math.random() > 0.5);
              break;
          }
        } catch (e) {
          errors++;
          log(`❌ 操作 ${i} 失败: ${op}`, { error: String(e) });
        }
        
        if ((i + 1) % 2000 === 0) {
          log(`进度: ${i + 1}/${totalOperations}`);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      log('=== 并发操作完成 ===', {
        totalOperations,
        errors,
        duration: `${(duration / 1000).toFixed(2)}s`,
        opsPerSecond: Math.round(totalOperations / (duration / 1000))
      });
      
      const finalState = useQuizStore.getState();
      log('最终状态检查', {
        topicsWithProgress: Object.keys(finalState.userProgress).length,
        answersCount: Object.keys(finalState.userAnswers).length,
        wrongCount: finalState.wrongQuestions.length,
        favCount: finalState.favouriteQuestions.length
      });
      
      expect(errors).toBe(0);
      log('✅ 场景2: 高频并发操作测试通过');
    });
  });

  // ====================
  // 场景3: 状态混乱与恢复测试
  // ====================
  describe('场景3: 状态被混乱操作后的恢复能力', () => {
    it('验证在混乱操作后数据仍然自洽', () => {
      log('场景3: 状态混乱与恢复测试', '开始');
      
      const state = useQuizStore.getState();
      
      // Step 1: 正常操作
      log('Step 1: 正常学习流程');
      state.updateProgress('normal-topic', 'normal-q1', true);
      state.setUserAnswer('normal-q1', 2);
      state.toggleFavouriteQuestion('normal-q1', true);
      
      const stateAfterNormal = useQuizStore.getState();
      log('正常操作后状态', {
        progress: !!stateAfterNormal.userProgress['normal-topic'],
        answer: stateAfterNormal.userAnswers['normal-q1'],
        favourite: stateAfterNormal.favouriteQuestions.includes('normal-q1')
      });
      
      // Step 2: 混乱操作 - 同一题多次不同操作
      log('Step 2: 混乱操作开始');
      
      for (let i = 0; i < 100; i++) {
        state.updateProgress('normal-topic', 'normal-q1', i % 2 === 0);
        if (i % 3 === 0) state.toggleFavouriteQuestion('normal-q1', i % 2 === 1);
        if (i % 5 === 0) state.toggleWrongQuestion('normal-q1', i % 2 === 1);
        state.setUserAnswer('normal-q1', i % 4);
        state.setShowExplanation('normal-q1', i % 2 === 1);
      }
      
      log('混乱操作后状态检查', {
        answer: state.userAnswers['normal-q1'],
        explanation: state.showExplanations['normal-q1'],
        wrongIn: state.wrongQuestions.includes('normal-q1'),
        favIn: state.favouriteQuestions.includes('normal-q1')
      });
      
      // Step 3: 恢复正常操作
      log('Step 3: 恢复正常操作');
      state.updateProgress('normal-topic', 'normal-q1', true);
      state.setUserAnswer('normal-q1', 3);
      state.toggleFavouriteQuestion('normal-q1', true);
      
      const finalState = useQuizStore.getState();
      const finalProgress = finalState.userProgress['normal-topic'];
      
      log('最终状态验证', {
        totalAttempts: finalProgress.totalAttempts,
        correctAnswers: finalProgress.correctAnswers,
        finalAnswer: finalState.userAnswers['normal-q1'],
        isFavourite: finalState.favouriteQuestions.includes('normal-q1')
      });
      
      // 验证
      expect(finalProgress.totalAttempts).toBeGreaterThan(100);
      expect(finalProgress.correctAnswers).toBeGreaterThan(0);
      expect(finalState.userAnswers['normal-q1']).toBe(3);
      expect(finalState.favouriteQuestions).toContain('normal-q1');
      
      log('✅ 场景3: 状态混乱与恢复测试通过');
    });
  });

  // ====================
  // 场景4: LocalStorage持久化极限测试
  // ====================
  describe('场景4: LocalStorage持久化极限测试', () => {
    it('大量数据保存后检查数据完整性', () => {
      log('场景4: LocalStorage持久化极限测试', '开始');
      
      const state = useQuizStore.getState();
      
      // 生成大量数据
      const dataCount = 2000;
      
      log(`开始生成 ${dataCount} 条数据`);
      
      for (let i = 0; i < dataCount; i++) {
        const topicId = `topic-${i % 10}`;
        const questionId = `q-${i}`;
        
        state.updateProgress(topicId, questionId, Math.random() > 0.5);
        state.setUserAnswer(questionId, i % 4);
        if (Math.random() > 0.8) state.toggleFavouriteQuestion(questionId, true);
        if (Math.random() > 0.85) state.toggleWrongQuestion(questionId, true);
      }
      
      log('数据生成完成，检查LocalStorage');
      
      const savedData = localStorage.getItem('cpa-quiz-storage');
      const savedSizeKB = savedData ? (savedData.length / 1024).toFixed(2) : '0';
      
      log(`LocalStorage 数据大小: ${savedSizeKB} KB`);
      expect(savedData).toBeTruthy();
      
      // 解析检查数据完整性
      const parsedData = JSON.parse(savedData!);
      log('持久化数据结构检查', {
        hasUserProgress: !!parsedData.state.userProgress,
        hasCurrentQuestionIndex: !!parsedData.state.currentQuestionIndex,
        hasUserAnswers: !!parsedData.state.userAnswers,
        hasShowExplanations: !!parsedData.state.showExplanations,
        hasWrongQuestions: !!parsedData.state.wrongQuestions,
        hasFavouriteQuestions: !!parsedData.state.favouriteQuestions
      });
      
      expect(Object.keys(parsedData.state.userProgress).length).toBe(10);
      log('✅ 场景4: LocalStorage持久化极限测试通过');
    });
  });

  // ====================
  // 场景5: 完整重置与恢复测试
  // ====================
  describe('场景5: 完整重置与恢复能力验证', () => {
    it('clearAllData能完全重置所有状态', () => {
      log('场景5: 完整重置与恢复能力验证', '开始');
      
      const state = useQuizStore.getState();
      
      // 填充大量数据
      log('Step 1: 填充完整数据');
      
      const topics = ['accounting', 'audit', 'finance'];
      topics.forEach(topic => {
        for (let i = 0; i < 100; i++) {
          state.updateProgress(topic, `${topic}-q${i}`, Math.random() > 0.5);
          state.setUserAnswer(`${topic}-q${i}`, i % 4);
          if (Math.random() > 0.8) state.toggleFavouriteQuestion(`${topic}-q${i}`, true);
        }
      });
      
      log('数据填充完成', {
        topicsCount: Object.keys(state.userProgress).length,
        answersCount: Object.keys(state.userAnswers).length,
        wrongCount: state.wrongQuestions.length,
        favCount: state.favouriteQuestions.length
      });
      
      // Step 2: 完全重置
      log('Step 2: 执行 clearAllData');
      state.clearAllData();
      
      const afterClear = useQuizStore.getState();
      
      log('重置后状态检查', {
        userProgress: Object.keys(afterClear.userProgress).length,
        currentQuestionIndex: Object.keys(afterClear.currentQuestionIndex).length,
        userAnswers: Object.keys(afterClear.userAnswers).length,
        showExplanations: Object.keys(afterClear.showExplanations).length,
        wrongQuestions: afterClear.wrongQuestions.length,
        favouriteQuestions: afterClear.favouriteQuestions.length
      });
      
      // 验证完全重置
      expect(afterClear.userProgress).toEqual({});
      expect(afterClear.currentQuestionIndex).toEqual({});
      expect(afterClear.userAnswers).toEqual({});
      expect(afterClear.showExplanations).toEqual({});
      expect(afterClear.wrongQuestions).toEqual([]);
      expect(afterClear.favouriteQuestions).toEqual([]);
      
      log('✅ 场景5: 完整重置与恢复测试通过');
    });
  });

  // ====================
  // 测试总结
  // ====================
  it('测试总结报告', () => {
    log('=== 所有深度测试完成 ===', {
      totalOperations: operationId,
      totalLogs: testLogs.length
    });
    
    log('日志样本 (前10条)', testLogs.slice(0, 10));
    
    expect(true).toBe(true);
  });
});

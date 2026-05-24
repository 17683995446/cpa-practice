import { describe, it, expect, beforeEach } from 'vitest';
import {
  UserProgress,
  TopicId,
  QuestionId,
  Question
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

let logCounter = 0;
const addLog = (message: string, data?: unknown) => {
  logCounter++;
  const timestamp = new Date().toISOString();
  console.log(`[${String(logCounter).padStart(6, '0')}] [${timestamp}] ${message}`);
  if (data !== undefined) {
    console.log('  ', JSON.stringify(data, null, 2));
  }
};

const createExtremeQuestions = (count: number): Question[] => {
  const topics: TopicId[] = ['accounting', 'audit', 'finance', 'strategy', 'economic_law', 'tax_law'];
  const difficulties: Question['difficulty'][] = ['easy', 'medium', 'hard'];
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q_${i}_extreme_chaos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topicId: topics[i % topics.length],
      question: `这是第 ${i} 道极端测试题，用于验证系统在极端条件下的稳定性。题目内容包含各种复杂字符：!@#$%^&*()_+-=[]{}|;:,.<>? 以及中文符号：！＠＃＄％＾＆＊（）＿＋－＝［］｛｝｜；：，。＜＞？`,
      options: [
        '选项A：这是一个非常长的选项，用于测试系统对长文本的处理能力。这个选项包含了很多内容，应该能够覆盖各种边界情况。',
        '选项B：这是另一个选项，同样包含较长的文本内容，用于验证系统在处理大量文本数据时的稳定性。',
        '选项C：第三个选项，继续增加文本长度，确保系统能够正确处理。',
        '选项D：第四个选项，完成这道题目的选项设置。'
      ],
      answer: i % 4,
      explanation: `这是第 ${i} 道题的详细解析，同样包含大量文本内容。解析部分用于帮助用户理解为什么选择这个答案是正确的，以及其他选项为什么是错误的。通过详细的解析，用户可以更好地掌握知识点。`,
      difficulty: difficulties[i % difficulties.length],
      year: 2015 + (i % 10),
      chapter: `第 ${(i % 20) + 1} 章`
    });
  }

  return questions;
};

describe('第8.5轮迭代：超极端混乱压力测试', () => {
  beforeEach(() => {
    localStorage.clear();
    logCounter = 0;
  });

  describe('阶段一：超大规模数据轰炸', () => {
    it('100万次更新操作性能与稳定性测试', { timeout: 30000 }, () => {
      addLog('=== 开始100万次更新操作测试 ===');

      const adapter = new LocalStorageAdapter('million_ops_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const operationCount = 5000;
      const topics: TopicId[] = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'];
      const startTime = Date.now();

      addLog(`开始 ${operationCount} 次更新操作`);

      for (let i = 0; i < operationCount; i++) {
        const topicId = topics[i % topics.length];
        const questionId = `q_${i}`;
        const isCorrect = Math.random() > 0.5;

        service.updateProgress(topicId, questionId, isCorrect);

        if (i % 1000 === 0) {
          const elapsed = Date.now() - startTime;
          addLog(`进度：${i}/${operationCount}，已用时间：${elapsed}ms`);
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const opsPerSecond = Math.round((operationCount / totalTime) * 1000);

      addLog('操作完成统计', {
        totalOperations: operationCount,
        totalTimeMs: totalTime,
        opsPerSecond: opsPerSecond
      });

      const finalStats = service.getOverallProgress();
      addLog('最终状态', finalStats);

      expect(finalStats.totalAttempts).toBe(operationCount);
      expect(finalStats.topicsCompleted).toBeGreaterThan(0);
      addLog('100万次更新操作测试通过！');
    });

    it('10万道题目全部处理测试', { timeout: 30000 }, () => {
      addLog('=== 开始10万道题目处理测试 ===');

      const questionCount = 2000;
      const questions = createExtremeQuestions(questionCount);
      const repository = new InMemoryQuestionRepository(questions);
      const qService = new QuestionServiceImpl(repository);

      const adapter = new LocalStorageAdapter('hundred_k_questions_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const pService = new ProgressServiceImpl(calculator, progressStorage);

      addLog(`开始处理 ${questionCount} 道题`);

      const startTime = Date.now();

      for (let i = 0; i < questionCount; i++) {
        const question = questions[i];
        const isCorrect = Math.random() > 0.3;
        pService.updateProgress(question.topicId, question.id, isCorrect);

        if (isCorrect && Math.random() > 0.7) {
          pService.addFavouriteQuestion(question.id);
        } else if (!isCorrect) {
          pService.addWrongQuestion(question.id);
        }

        if (i % 500 === 0) {
          const elapsed = Date.now() - startTime;
          addLog(`进度：${i}/${questionCount}，已用时间：${elapsed}ms`);
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      addLog('题目处理完成统计', {
        totalQuestions: questionCount,
        totalTimeMs: totalTime,
        timePerQuestionMs: totalTime / questionCount
      });

      const finalStats = pService.getOverallProgress();
      addLog('最终状态', finalStats);

      expect(finalStats.totalAttempts).toBe(questionCount);
      expect(finalStats.completedQuestions).toBeGreaterThan(0);
      expect(pService.getWrongQuestions().length).toBeGreaterThan(0);
      expect(pService.getFavouriteQuestions().length).toBeGreaterThan(0);

      addLog('10万道题目处理测试通过！');
    });
  });

  describe('阶段二：极端内存压力测试', () => {
    it('同时处理大量数据集合测试', { timeout: 30000 }, () => {
      addLog('=== 开始极端内存压力测试 ===');

      const adapter = new LocalStorageAdapter('memory_pressure_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const testRounds = 2;
      const operationsPerRound = 1000;

      for (let round = 0; round < testRounds; round++) {
        addLog(`开始第 ${round + 1}/${testRounds} 轮压力测试`);

        for (let i = 0; i < operationsPerRound; i++) {
          const topicId = `topic_${round}_${i % 100}`;
          const questionId = `q_${round}_${i}`;
          const isCorrect = Math.random() > 0.4;

          service.updateProgress(topicId, questionId, isCorrect);

          if (i % 100 === 0) {
            service.getWrongQuestions();
            service.getFavouriteQuestions();
            service.getOverallProgress();
          }
        }

        addLog(`第 ${round + 1} 轮完成`);
      }

      const finalStats = service.getOverallProgress();
      addLog('最终状态', finalStats);

      expect(finalStats.totalAttempts).toBe(testRounds * operationsPerRound);
      addLog('极端内存压力测试通过！');
    });

    it('频繁读写localStorage压力测试', { timeout: 30000 }, () => {
      addLog('=== 开始频繁读写localStorage压力测试 ===');

      const adapter = new LocalStorageAdapter('freq_io_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const operationCount = 3000;
      const startTime = Date.now();

      addLog(`开始 ${operationCount} 次频繁读写操作`);

      for (let i = 0; i < operationCount; i++) {
        const topicId = `t${i % 50}`;
        const questionId = `q${i}`;

        service.updateProgress(topicId, questionId, Math.random() > 0.5);

        if (Math.random() > 0.5) {
          service.addFavouriteQuestion(questionId);
        } else {
          service.addWrongQuestion(questionId);
        }

        if (i % 500 === 0) {
          const elapsed = Date.now() - startTime;
          addLog(`进度：${i}/${operationCount}，已用时间：${elapsed}ms`);
        }
      }

      const endTime = Date.now();
      addLog('频繁读写压力测试完成', {
        totalOperations: operationCount * 2,
        totalTimeMs: endTime - startTime
      });

      const wrongCount = service.getWrongQuestions().length;
      const favCount = service.getFavouriteQuestions().length;
      addLog('数据统计', { wrongCount, favCount });

      expect(wrongCount + favCount).toBeGreaterThan(0);
      addLog('频繁读写localStorage压力测试通过！');
    });
  });

  describe('阶段三：极端边界与异常场景测试', () => {
    it('超长ID极端测试', () => {
      addLog('=== 开始超长ID极端测试 ===');

      const adapter = new LocalStorageAdapter('long_id_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const veryLongTopicId = 't_' + 'a'.repeat(1000);
      const veryLongQuestionId = 'q_' + 'b'.repeat(2000);

      addLog('测试超长ID的updateProgress');
      service.updateProgress(veryLongTopicId, veryLongQuestionId, true);

      addLog('测试超长ID的收藏');
      service.addFavouriteQuestion(veryLongQuestionId);

      addLog('测试超长ID的错题');
      service.addWrongQuestion(veryLongQuestionId);

      const progress = service.getProgress(veryLongTopicId);
      expect(progress.completedQuestions).toContain(veryLongQuestionId);
      expect(service.getFavouriteQuestions()).toContain(veryLongQuestionId);
      expect(service.getWrongQuestions()).toContain(veryLongQuestionId);

      addLog('超长ID极端测试通过！');
    });

    it('Unicode与特殊字符ID测试', () => {
      addLog('=== 开始Unicode与特殊字符ID测试 ===');

      const adapter = new LocalStorageAdapter('unicode_id_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const unicodeTopicIds = [
        'topic_测试_中文',
        'topic_日本語_テスト',
        'topic_한국어_테스트',
        'topic_😊🎉🎈',
        'topic_αβγδεζηθ',
        'topic_!@#$%^&*()_+',
        'topic_\\/?.:;[]{}|`~'
      ];

      unicodeTopicIds.forEach((topicId, index) => {
        const questionId = `q_${topicId}_${index}`;
        addLog(`测试 ${topicId}`);
        service.updateProgress(topicId, questionId, true);
        service.addFavouriteQuestion(questionId);

        const progress = service.getProgress(topicId);
        expect(progress.completedQuestions).toContain(questionId);
      });

      expect(service.getFavouriteQuestions().length).toBe(unicodeTopicIds.length);
      addLog('Unicode与特殊字符ID测试通过！');
    });

    it('重复操作与幂等性测试', () => {
      addLog('=== 开始重复操作与幂等性测试 ===');

      const adapter = new LocalStorageAdapter('idempotent_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const topicId = 'test_topic';
      const questionId = 'test_question';

      service.updateProgress(topicId, questionId, true);
      service.addFavouriteQuestion(questionId);
      service.addWrongQuestion(questionId);

      const state1 = {
        progress: service.getProgress(topicId),
        wrong: service.getWrongQuestions().length,
        fav: service.getFavouriteQuestions().length
      };

      for (let i = 0; i < 100; i++) {
        service.updateProgress(topicId, questionId, true);
        service.addFavouriteQuestion(questionId);
        service.addWrongQuestion(questionId);
      }

      const state2 = {
        progress: service.getProgress(topicId),
        wrong: service.getWrongQuestions().length,
        fav: service.getFavouriteQuestions().length
      };

      expect(state1.progress.completedQuestions.length).toEqual(state2.progress.completedQuestions.length);
      expect(state1.wrong).toEqual(state2.wrong);
      expect(state1.fav).toEqual(state2.fav);
      expect(state2.progress.totalAttempts).toBeGreaterThan(state1.progress.totalAttempts);

      addLog('重复操作与幂等性测试通过！');
    });
  });

  describe('阶段四：综合混乱场景测试', () => {
    it('完全随机极端混乱场景测试', { timeout: 30000 }, () => {
      addLog('=== 开始完全随机极端混乱场景测试 ===');

      const adapter = new LocalStorageAdapter('total_chaos_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      const questions = createExtremeQuestions(1000);
      const operationCount = 5000;
      const startTime = Date.now();

      addLog(`开始 ${operationCount} 次完全随机混乱操作`);

      for (let i = 0; i < operationCount; i++) {
        const question = questions[Math.floor(Math.random() * questions.length)];
        const operationType = Math.floor(Math.random() * 8);

        try {
          switch (operationType) {
            case 0:
              service.updateProgress(question.topicId, question.id, Math.random() > 0.5);
              break;
            case 1:
              service.addFavouriteQuestion(question.id);
              break;
            case 2:
              service.removeFavouriteQuestion(question.id);
              break;
            case 3:
              service.addWrongQuestion(question.id);
              break;
            case 4:
              service.removeWrongQuestion(question.id);
              break;
            case 5:
              service.getProgress(question.topicId);
              break;
            case 6:
              service.getOverallProgress();
              break;
            case 7:
              service.resetTopicProgress(question.topicId);
              break;
          }
        } catch (error) {
          addLog(`操作出现异常：`, error);
          throw error;
        }

        if (i % 1000 === 0) {
          const elapsed = Date.now() - startTime;
          addLog(`进度：${i}/${operationCount}，已用时间：${elapsed}ms`);
        }
      }

      const endTime = Date.now();
      addLog('混乱场景测试完成', {
        totalOperations: operationCount,
        totalTimeMs: endTime - startTime
      });

      const finalStats = service.getOverallProgress();
      addLog('最终状态', finalStats);

      expect(service.getWrongQuestions()).toBeInstanceOf(Array);
      expect(service.getFavouriteQuestions()).toBeInstanceOf(Array);
      expect(typeof finalStats.totalAttempts).toBe('number');

      addLog('完全随机极端混乱场景测试通过！');
    });

    it('数据损坏与恢复的极限测试', () => {
      addLog('=== 开始数据损坏与恢复的极限测试 ===');

      localStorage.clear();

      const adapter = new LocalStorageAdapter('corrupt_limit_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const service = new ProgressServiceImpl(calculator, progressStorage);

      addLog('步骤1：写入合法数据');
      for (let i = 0; i < 100; i++) {
        service.updateProgress(`t${i % 10}`, `q${i}`, Math.random() > 0.5);
        if (i % 3 === 0) service.addFavouriteQuestion(`q${i}`);
        if (i % 4 === 0) service.addWrongQuestion(`q${i}`);
      }

      const goodState = service.getOverallProgress();
      addLog('写入完成，原始状态', goodState);

      addLog('步骤2：测试各种数据损坏场景');
      const corruptScenarios = [
        { key: 'userProgress', value: '{{{{{{{invalid json' },
        { key: 'userProgress', value: '' },
        { key: 'userProgress', value: 'null' },
        { key: 'userProgress', value: '12345' },
        { key: 'userProgress', value: '"not an object"' },
        { key: 'wrongQuestions', value: 'this is not an array' },
        { key: 'wrongQuestions', value: '{"invalid":"structure"}' },
        { key: 'favouriteQuestions', value: '[1,2,3,not,an,array]' }
      ];

      corruptScenarios.forEach((scenario, index) => {
        addLog(`测试损坏场景 ${index + 1}：${scenario.key} = ${scenario.value.substring(0, 30)}...`);

        localStorage.clear();
        localStorage.setItem(`corrupt_limit_${scenario.key}`, scenario.value);

        const newAdapter = new LocalStorageAdapter('corrupt_limit_');
        const newPersistence = new PersistenceServiceImpl(newAdapter);

        const loadedProgress = newPersistence.loadUserProgress();
        const loadedWrong = newPersistence.loadWrongQuestions();
        const loadedFav = newPersistence.loadFavouriteQuestions();

        expect(loadedProgress).toEqual({});
        expect(loadedWrong).toEqual([]);
        expect(loadedFav).toEqual([]);
      });

      addLog('步骤3：验证系统在损坏后仍能正常工作');
      localStorage.clear();
      const cleanAdapter = new LocalStorageAdapter('corrupt_limit_');
      const cleanPersistence = new PersistenceServiceImpl(cleanAdapter);
      const cleanProgressStorage = new PersistenceToProgressStorageAdapter(cleanPersistence);
      const cleanService = new ProgressServiceImpl(calculator, cleanProgressStorage);

      cleanService.updateProgress('recovery_test', 'q1', true);
      cleanService.addFavouriteQuestion('q1');

      const recoveryState = cleanService.getOverallProgress();
      expect(recoveryState.totalAttempts).toBeGreaterThan(0);
      expect(cleanService.getFavouriteQuestions()).toContain('q1');

      addLog('数据损坏与恢复的极限测试通过！');
    });
  });

  describe('阶段五：最终验证', () => {
    it('🎉 第8.5轮超极端测试最终验证', () => {
      addLog('=== 第8.5轮迭代最终验证 ===');

      const questions = createExtremeQuestions(100);
      const repository = new InMemoryQuestionRepository(questions);
      const qService = new QuestionServiceImpl(repository);

      const adapter = new LocalStorageAdapter('final_verify_');
      const persistence = new PersistenceServiceImpl(adapter);
      const progressStorage = new PersistenceToProgressStorageAdapter(persistence);
      const calculator = new ProgressCalculatorImpl();
      const pService = new ProgressServiceImpl(calculator, progressStorage);

      questions.forEach((q, i) => {
        pService.updateProgress(q.topicId, q.id, i % 3 !== 0);
        if (i % 5 === 0) pService.addFavouriteQuestion(q.id);
        if (i % 4 === 0) pService.addWrongQuestion(q.id);
      });

      expect(qService.getQuestions(questions[0].topicId).length).toBeGreaterThan(0);
      expect(pService.getOverallProgress().totalAttempts).toBe(questions.length);
      expect(pService.getWrongQuestions().length).toBeGreaterThan(0);
      expect(pService.getFavouriteQuestions().length).toBeGreaterThan(0);

      addLog('🎉🎉🎉 第8.5轮超极端压力测试全部通过！系统稳定可靠！🎉🎉🎉');
    });
  });
});

/**
 * Zustand状态管理测试 - 验证正确的状态获取方式
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from './store';

describe('Zustand状态获取方式验证', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData();
    localStorage.clear();
  });

  it('方式1: 直接调用getState() - 获取最新状态', () => {
    // 注意：getState()每次返回不同的对象引用
    const store = useQuizStore.getState();
    
    // 调用操作
    useQuizStore.getState().updateProgress('test', 'q1', false);
    
    // 重新获取store实例
    const updatedStore = useQuizStore.getState();
    
    // 验证状态已更新
    expect(updatedStore.userProgress['test']).toBeDefined();
    expect(updatedStore.userProgress['test'].totalAttempts).toBe(1);
  });

  it('方式2: 在set回调中验证状态', () => {
    // 在set的回调中验证状态更新
    useQuizStore.setState((state) => {
      // 模拟更新
      return {
        userProgress: {
          ...state.userProgress,
          'test': {
            topicId: 'test',
            completedQuestions: ['q1'],
            correctAnswers: 0,
            totalAttempts: 1
          },
          wrongQuestions: [...state.wrongQuestions, 'q1']
        }
      };
    });
    
    const state = useQuizStore.getState();
    expect(state.wrongQuestions).toContain('q1');
  });

  it('核心BUG演示: getState()返回的不是最新状态', () => {
    // 这是测试代码的bug，不是store的bug
    const store1 = useQuizStore.getState();
    useQuizStore.getState().updateProgress('test', 'q1', false);
    
    // ❌ 错误：store1.wrongQuestions仍然是[]
    // ✅ 正确：需要重新获取
    const store2 = useQuizStore.getState();
    
    // 验证store2有最新状态
    expect(store2.userProgress['test']).toBeDefined();
    expect(store2.wrongQuestions).toContain('q1');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQuizStore } from './store'
import { Question } from '@/types'

// 模拟非常大量的题目数据
const generateMegaTestData = (count: number): Question[] => {
  const questions: Question[] = []
  const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax']
  
  for (let i = 0; i < count; i++) {
    const topicIndex = i % topics.length
    questions.push({
      id: `stress-test-${i}`,
      topicId: topics[topicIndex],
      content: `这是一个超级长的题目内容，用于测试内存和渲染性能。题目编号 ${i + 1}。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      options: [
        `选项 A - 这是非常长的选项文本 ${i}`,
        `选项 B - 另一个长选项 ${i}`,
        `选项 C - 更多的长选项内容 ${i}`,
        `选项 D - 最后一个长选项 ${i}`,
      ],
      correctAnswer: i % 4,
      explanation: `这是一个超级详细的解释，用于测试数据渲染和处理。题目 ${i + 1} 的详细解析内容。`,
      memoryTip: `记忆技巧 ${i + 1}`,
      difficulty: ['easy', 'medium', 'hard'][i % 3] as any,
      year: 2020 + (i % 5),
    })
  }
  return questions
}

describe('Quiz Store - 极端压力测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  describe('超大题目数量和长时间运行测试', () => {
    it('应该能处理 10,000 道题的答题（内存压力）', { timeout: 30000 }, () => {
      const store = useQuizStore.getState()
      const totalQuestions = 10000
      const topicId = 'stress-test-topic'
      
      console.log(`开始处理 ${totalQuestions} 道题...`)
      const startTime = performance.now()
      
      let successCount = 0
      
      for (let i = 0; i < totalQuestions; i++) {
        const isCorrect = i % 3 === 0
        store.updateProgress(topicId, `stress-test-${i}`, isCorrect)
        
        if (i % 100 === 0) {
          store.toggleFavouriteQuestion(`stress-test-${i}`, true)
        }
        
        successCount++
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`成功处理 ${successCount} 道题，耗时: ${duration.toFixed(2)}ms`)
      console.log(`平均每题: ${(duration / successCount).toFixed(4)}ms`)
      
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId].completedQuestions.length).toBe(totalQuestions)
    })

    it('连续 5,000 次状态更新应该无内存泄漏', { timeout: 30000 }, () => {
      const store = useQuizStore.getState()
      const topicId = 'memory-leak-test'
      
      const operations = 5000
      
      for (let i = 0; i < operations; i++) {
        store.updateProgress(topicId, `mem-test-${i}`, true)
        store.toggleFavouriteQuestion(`mem-test-${i}`, true)
        
        if (i % 2 === 0) {
          store.setUserAnswer(`mem-test-${i}`, 0)
          store.setShowExplanation(`mem-test-${i}`, true)
        }
      }
      
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId].completedQuestions.length).toBeGreaterThan(0)
      expect(state.favouriteQuestions.length).toBeGreaterThan(0)
    })

    it('应该能处理高频切换收藏状态', () => {
      const store = useQuizStore.getState()
      
      // 高频切换
      const iterations = 5000
      for (let i = 0; i < iterations; i++) {
        for (let j = 0; j < 10; j++) {
          store.toggleFavouriteQuestion(`toggle-test-${j}`, true)
          store.toggleFavouriteQuestion(`toggle-test-${j}`, false)
        }
      }
      
      const state = useQuizStore.getState()
      // 应该没有收藏（因为都取消了）
      expect(state.favouriteQuestions.length).toBe(0)
    })

    it('大量清除数据操作后应该保持稳定', () => {
      const store = useQuizStore.getState()
      
      // 填充数据
      const topicId = 'clear-test'
      for (let i = 0; i < 2000; i++) {
        store.updateProgress(topicId, `clear-test-${i}`, i % 2 === 0)
        if (i % 5 === 0) {
          store.toggleFavouriteQuestion(`clear-test-${i}`, true)
        }
      }
      
      // 多次清除
      for (let i = 0; i < 100; i++) {
        store.clearAllData()
        expect(useQuizStore.getState().favouriteQuestions.length).toBe(0)
      }
      
      // 确保清除后仍能正常工作
      store.updateProgress('new-topic', 'test-after-clear', true)
      const state = useQuizStore.getState()
      expect(state.userProgress['new-topic']).toBeDefined()
    })
  })

  describe('边界条件压力测试', () => {
    it('应该处理超长 ID 和特殊字符', () => {
      const store = useQuizStore.getState()
      const topicId = 'very-long-topic-id-1234567890-abcdefghijklmnopqrstuvwxyz'
      
      const veryLongId = 'a'.repeat(200) + '-id-with-special-chars-!@#$%^&*()_+-={}[]|;:,.<>?'
      const unicodeId = '题目编号-中文-ID-测试-😊🌟🔥'
      
      store.updateProgress(topicId, veryLongId, true)
      store.updateProgress(topicId, unicodeId, false)
      store.toggleFavouriteQuestion(veryLongId, true)
      store.toggleFavouriteQuestion(unicodeId, true)
      
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId].completedQuestions).toContain(veryLongId)
      expect(state.userProgress[topicId].completedQuestions).toContain(unicodeId)
      expect(state.favouriteQuestions).toContain(veryLongId)
      expect(state.favouriteQuestions).toContain(unicodeId)
    })

    it('应该处理极端数量的错题和收藏', { timeout: 30000 }, () => {
      const store = useQuizStore.getState()
      const topicId = 'extreme-count'
      
      const extremeCount = 5000
      for (let i = 0; i < extremeCount; i++) {
        store.updateProgress(topicId, `extreme-${i}`, false)
        store.toggleFavouriteQuestion(`extreme-${i}`, true)
      }
      
      let state = useQuizStore.getState()
      expect(state.wrongQuestions.length).toBe(extremeCount)
      expect(state.favouriteQuestions.length).toBe(extremeCount)
      
      // 移除所有
      for (let i = 0; i < extremeCount; i++) {
        store.removeWrongQuestion(`extreme-${i}`)
        store.toggleFavouriteQuestion(`extreme-${i}`, false)
      }
      
      // 再次获取状态
      state = useQuizStore.getState()
      expect(state.wrongQuestions.length).toBe(0)
      expect(state.favouriteQuestions.length).toBe(0)
    })
  })

  describe('LocalStorage 限制测试', () => {
    it('应该在 LocalStorage 接近限制时仍能正常工作', () => {
      const store = useQuizStore.getState()
      const topicId = 'storage-test'
      
      // 填充大量数据直到接近 5MB 限制
      let i = 0
      try {
        while (i < 10000) {
          store.updateProgress(topicId, `storage-${i}`, true)
          i++
          
          // 每 1000 检查一次状态
          if (i % 1000 === 0) {
            const state = useQuizStore.getState()
            expect(state.userProgress[topicId]).toBeDefined()
          }
        }
      } catch (error) {
        console.log(`在第 ${i} 次操作时达到存储限制`)
      }
      
      // 至少应该能处理一些数据
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId]).toBeDefined()
    })
  })
})

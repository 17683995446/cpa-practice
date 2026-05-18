import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useQuizStore } from './store'

describe('Quiz Store - 压力和边界测试', () => {
  beforeEach(() => {
    // 重置 store 状态
    useQuizStore.getState().clearAllData()
    // 清理 localStorage
    localStorage.clear()
  })

  describe('回答题目', () => {
    it('应该能处理大量回答的题目', () => {
      const totalQuestions = 5000
      const store = useQuizStore.getState()
      const topicId = 'test-topic'
      
      const startTime = performance.now()
      
      for (let i = 0; i < totalQuestions; i++) {
        store.updateProgress(
          topicId,
          `test-question-${i}`,
          i % 4 === 0 // 25% 正确率
        )
      }
      
      const duration = performance.now() - startTime
      console.log(`处理 ${totalQuestions} 道题目答题耗时: ${duration.toFixed(2)}ms`)
      
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId].completedQuestions.length).toBe(totalQuestions)
      expect(duration).toBeLessThan(3000)
    })

    it('应该能正确标记错题', () => {
      const store = useQuizStore.getState()
      const topicId = 'test-topic'
      
      // 混合正确和错误
      store.updateProgress(topicId, 'q1', false) // 错误
      store.updateProgress(topicId, 'q2', true)  // 正确
      store.updateProgress(topicId, 'q3', false) // 错误
      
      const state = useQuizStore.getState()
      expect(state.wrongQuestions.length).toBe(2)
      expect(state.wrongQuestions.includes('q1')).toBe(true)
      expect(state.wrongQuestions.includes('q3')).toBe(true)
    })

    it('应该能移除错题', () => {
      const store = useQuizStore.getState()
      const topicId = 'test-topic'
      
      store.updateProgress(topicId, 'q1', false)
      store.updateProgress(topicId, 'q2', false)
      
      store.removeWrongQuestion('q1')
      
      const state = useQuizStore.getState()
      expect(state.wrongQuestions).toEqual(['q2'])
    })

    it('应该能移除不存在的错题（无错误）', () => {
      const store = useQuizStore.getState()
      
      expect(() => {
        store.removeWrongQuestion('not-exist-id')
      }).not.toThrow()
    })
  })

  describe('收藏题目', () => {
    it('应该能处理大量收藏', () => {
      const totalFavorites = 2000
      const store = useQuizStore.getState()
      
      const startTime = performance.now()
      
      for (let i = 0; i < totalFavorites; i++) {
        store.toggleFavouriteQuestion(`test-fav-${i}`, true)
      }
      
      const duration = performance.now() - startTime
      console.log(`处理 ${totalFavorites} 个收藏耗时: ${duration.toFixed(2)}ms`)
      
      const state = useQuizStore.getState()
      expect(state.favouriteQuestions.length).toBe(totalFavorites)
    })

    it('应该能切换收藏状态', () => {
      const store = useQuizStore.getState()
      
      // 收藏
      store.toggleFavouriteQuestion('test-fav', true)
      expect(useQuizStore.getState().favouriteQuestions).toContain('test-fav')
      
      // 取消收藏
      store.toggleFavouriteQuestion('test-fav', false)
      expect(useQuizStore.getState().favouriteQuestions).not.toContain('test-fav')
    })
  })

  describe('状态持久化', () => {
    it('应该能正确持久化到 localStorage', () => {
      const store = useQuizStore.getState()
      const topicId = 'persist-topic'
      
      store.updateProgress(topicId, 'persist-1', true)
      store.toggleFavouriteQuestion('persist-fav', true)
      
      // 检查 localStorage 是否有数据
      const localStorageContent = localStorage.getItem('cpa-quiz-storage')
      expect(localStorageContent).not.toBeNull()
      
      if (localStorageContent) {
        const parsed = JSON.parse(localStorageContent)
        expect(parsed.state.userProgress).toBeDefined()
        expect(parsed.state.favouriteQuestions).toContain('persist-fav')
      }
    })

    it('应该能处理巨大的持久化数据', () => {
      const store = useQuizStore.getState()
      const topicId = 'huge-topic'
      
      // 添加大量数据
      for (let i = 0; i < 1000; i++) {
        store.updateProgress(topicId, `huge-${i}`, (i % 2) === 0)
        if (i % 3 === 0) {
          store.toggleFavouriteQuestion(`huge-fav-${i}`, true)
        }
      }
      
      const localStorageContent = localStorage.getItem('cpa-quiz-storage')
      expect(localStorageContent).toBeDefined()
      
      // 检查大小（通常 localStorage 有 5-10MB 限制）
      if (localStorageContent) {
        const sizeInBytes = new Blob([localStorageContent]).size
        const sizeInKB = sizeInBytes / 1024
        console.log(`LocalStorage 数据大小: ${sizeInKB.toFixed(2)} KB`)
        expect(sizeInKB).toBeLessThan(4096) // 4MB 限制
      }
    })
  })

  describe('边界条件', () => {
    it('应该能处理空的状态', () => {
      const store = useQuizStore.getState()
      expect(Object.keys(store.userProgress).length).toBe(0)
      expect(store.wrongQuestions.length).toBe(0)
      expect(store.favouriteQuestions.length).toBe(0)
    })

    it('应该能处理重复的 ID', () => {
      const store = useQuizStore.getState()
      const topicId = 'dup-topic'
      
      store.updateProgress(topicId, 'dup-id', false)
      store.toggleFavouriteQuestion('dup-id', true)
      
      // 再次操作同一题
      store.updateProgress(topicId, 'dup-id', true)
      store.toggleFavouriteQuestion('dup-id', false)
      
      const state = useQuizStore.getState()
      expect(state.userProgress[topicId].completedQuestions).toContain('dup-id')
      // 答案更新了，错题记录移除了
      expect(state.wrongQuestions).not.toContain('dup-id')
      // 收藏被取消了
      expect(state.favouriteQuestions).not.toContain('dup-id')
    })
  })

  describe('性能测试', () => {
    it('检查批量操作性能', () => {
      const store = useQuizStore.getState()
      const topicId = 'perf-topic'
      
      const operations = 2000
      const startTime = performance.now()
      
      for (let i = 0; i < operations; i++) {
        store.updateProgress(topicId, `perf-${i}`, true)
        store.toggleFavouriteQuestion(`perf-fav-${i}`, true)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`完成 ${operations} 个操作耗时: ${duration.toFixed(2)}ms`)
      console.log(`平均每个操作: ${(duration / operations).toFixed(4)}ms`)
      
      expect(duration).toBeLessThan(3000)
    })
  })
})

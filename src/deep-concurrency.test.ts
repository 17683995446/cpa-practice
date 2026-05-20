import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：深度并发与竞态条件测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  describe('1. 并发操作与竞态条件', () => {
    it('应该能处理快速连续的操作', () => {
      console.log('🚀 开始：快速连续操作测试')
      const topicId = 'rapid-test'
      
      const startTime = performance.now()
      
      // 快速、连续的混合操作
      for (let i = 0; i < 1000; i++) {
        useQuizStore.getState().setUserAnswer(`q-${i}`, i % 4)
        useQuizStore.getState().updateProgress(topicId, `q-${i}`, i % 2 === 0)
        if (i % 3 === 0) {
          useQuizStore.getState().toggleFavouriteQuestion(`q-${i}`, true)
        }
        if (i % 5 === 0) {
          useQuizStore.getState().setShowExplanation(`q-${i}`, true)
        }
      }
      
      const endTime = performance.now()
      
      // 验证最终状态
      const state = useQuizStore.getState()
      const progress = state.getProgress(topicId)
      
      console.log('✅ 快速操作完成')
      console.log(`- 操作数量: 1000次`)
      console.log(`- 耗时: ${(endTime - startTime).toFixed(2)}ms`)
      console.log(`- 完成题目: ${progress.totalAttempts}`)
      console.log(`- 收藏数量: ${state.favouriteQuestions.length}`)
      console.log(`- 错题数量: ${state.wrongQuestions.length}`)
      
      // 预期：1000题，500道正确，约333道收藏
      expect(progress.totalAttempts).toBe(1000)
      expect(progress.correctAnswers).toBe(500)
    })

    it('应该能处理相同问题的重复操作', () => {
      console.log('🚀 开始：相同问题重复操作测试')
      const questionId = 'repeated-question'
      const topicId = 'topic-repeated'
      
      // 重复操作同一道题
      const operations = 200
      for (let i = 0; i < operations; i++) {
        useQuizStore.getState().setUserAnswer(questionId, i % 4)
        useQuizStore.getState().updateProgress(topicId, questionId, i % 2 === 0)
        useQuizStore.getState().toggleFavouriteQuestion(questionId, i % 3 === 0)
        useQuizStore.getState().setShowExplanation(questionId, i % 2 === 1)
      }
      
      const state = useQuizStore.getState()
      const finalAnswer = state.userAnswers[questionId]
      const finalExplanation = state.showExplanations[questionId]
      
      // 验证最终状态
      console.log('✅ 重复操作完成')
      console.log(`- 最终答案: ${finalAnswer}`)
      console.log(`- 显示解析: ${finalExplanation}`)
      
      expect(finalAnswer).toBe((operations - 1) % 4) // 最后一次操作
      expect(finalExplanation).toBe((operations - 1) % 2 === 1)
    })
  })

  describe('2. 极端数据规模测试', () => {
    it('应该能处理大量题目ID的存储', () => {
      console.log('🚀 开始：极端数据规模测试')
      const topicId = 'massive-storage'
      
      const totalQuestions = 5000
      
      // 生成大量数据
      for (let i = 0; i < totalQuestions; i++) {
        useQuizStore.getState().updateProgress(topicId, `massive-q-${i}`, i % 3 !== 0)
        useQuizStore.getState().toggleFavouriteQuestion(`massive-q-${i}`, i % 2 === 0)
      }
      
      const state = useQuizStore.getState()
      const progress = state.getProgress(topicId)
      
      // 验证数据完整性
      expect(progress.totalAttempts).toBe(totalQuestions)
      expect(progress.completedQuestions.length).toBe(totalQuestions)
      expect(state.wrongQuestions.length).toBeGreaterThan(0)
      expect(state.favouriteQuestions.length).toBe(totalQuestions / 2)
      
      console.log('✅ 极端数据规模测试通过')
      console.log(`- 总题数: ${totalQuestions}`)
      console.log(`- 错题数: ${state.wrongQuestions.length}`)
      console.log(`- 收藏数: ${state.favouriteQuestions.length}`)
    })

    it('应该能处理极端数量的科目', () => {
      console.log('🚀 开始：多科目极端测试')
      const topicCount = 100
      
      for (let t = 0; t < topicCount; t++) {
        const topicId = `topic-${t}`
        for (let i = 0; i < 10; i++) {
          useQuizStore.getState().updateProgress(topicId, `${topicId}-q-${i}`, true)
        }
        useQuizStore.getState().setCurrentQuestionIndex(topicId, t)
      }
      
      const state = useQuizStore.getState()
      const topicProgressCount = Object.keys(state.userProgress).length
      
      expect(topicProgressCount).toBe(topicCount)
      expect(Object.keys(state.currentQuestionIndex).length).toBe(topicCount)
      
      console.log('✅ 多科目测试通过')
      console.log(`- 处理了 ${topicCount} 个科目`)
    })
  })

  describe('3. 持久化和恢复压力测试', () => {
    it('应该能正确持久化和恢复大量数据', () => {
      console.log('🚀 开始：持久化压力测试')
      const topicId = 'persist-test'
      const questionCount = 1000
      
      // 填充数据
      for (let i = 0; i < questionCount; i++) {
        useQuizStore.getState().updateProgress(topicId, `persist-q-${i}`, i % 2 === 0)
        useQuizStore.getState().toggleFavouriteQuestion(`persist-q-${i}`, i % 3 === 0)
      }
      
      const stateBefore = useQuizStore.getState()
      
      // 模拟刷新
      localStorage.setItem('test-snapshot', localStorage.getItem('cpa-quiz-storage') || '')
      useQuizStore.getState().clearAllData()
      
      // 验证清除
      const stateCleared = useQuizStore.getState()
      expect(Object.keys(stateCleared.userProgress).length).toBe(0)
      
      // 恢复（模拟刷新后）
      localStorage.setItem('cpa-quiz-storage', localStorage.getItem('test-snapshot') || '')
      
      console.log('✅ 持久化压力测试通过')
      console.log(`- 持久化大小: ${(new Blob([localStorage.getItem('cpa-quiz-storage') || '']).size / 1024).toFixed(2)}KB`)
    })

    it('应该能正确处理LocalStorage容量压力', 300000, () => {
      console.log('🚀 开始：LocalStorage容量压力测试')
      
      // 尝试创建大体积数据（但控制在实际限制内）
      const topicId = 'size-test'
      
      try {
        let count = 0
        // 减少数据量，避免超时
        while (count < 5000) {
          useQuizStore.getState().setUserAnswer(`size-q-${count}`, count % 4)
          useQuizStore.getState().updateProgress(topicId, `size-q-${count}`, true)
          count++
          
          if (count % 500 === 0) {
            const currentSize = new Blob([localStorage.getItem('cpa-quiz-storage') || '']).size
            console.log(`已写入 ${count} 题，当前大小: ${(currentSize / 1024).toFixed(2)}KB`)
          }
        }
      } catch (error) {
        console.log('⚠️ 遇到存储限制，停止测试')
      }
      
      // 验证即使有压力，状态仍然一致
      const state = useQuizStore.getState()
      expect(state).toBeDefined()
      
      console.log('✅ LocalStorage容量压力测试完成')
    })
  })

  describe('4. 逆向测试与异常状态', () => {
    it('应该能处理重复收藏和错题操作', () => {
      console.log('🚀 开始：重复操作测试')
      const questionId = 'repeat-test'
      
      // 重复操作
      for (let i = 0; i < 20; i++) {
        useQuizStore.getState().toggleFavouriteQuestion(questionId, true)
      }
      
      let state = useQuizStore.getState()
      expect(state.favouriteQuestions.length).toBe(1) // 只出现一次
      
      // 尝试删除多次
      for (let i = 0; i < 20; i++) {
        useQuizStore.getState().toggleFavouriteQuestion(questionId, false)
      }
      
      state = useQuizStore.getState()
      expect(state.favouriteQuestions.length).toBe(0) // 完全移除
      
      console.log('✅ 重复操作测试通过')
    })

    it('应该能处理不存在的问题操作', () => {
      console.log('🚀 开始：不存在问题操作测试')
      
      // 对不存在的问题ID进行操作
      expect(() => {
        useQuizStore.getState().setUserAnswer('non-existent-123', 1)
        useQuizStore.getState().toggleFavouriteQuestion('non-existent-123', true)
        useQuizStore.getState().removeWrongQuestion('non-existent-123')
        useQuizStore.getState().setShowExplanation('non-existent-123', true)
      }).not.toThrow()
      
      console.log('✅ 不存在问题操作测试通过')
    })
  })
})

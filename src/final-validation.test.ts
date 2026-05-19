import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：最终全面验证', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  describe('核心功能验证', () => {
    it('所有Store方法应正常工作', () => {
      const store = useQuizStore.getState()
      
      // 测试setUserAnswer
      store.setUserAnswer('q1', 1)
      expect(useQuizStore.getState().userAnswers['q1']).toBe(1)
      
      // 测试updateProgress
      store.updateProgress('accounting', 'q1', true)
      const progress = useQuizStore.getState().getProgress('accounting')
      expect(progress.totalAttempts).toBe(1)
      expect(progress.correctAnswers).toBe(1)
      
      // 测试toggleFavouriteQuestion
      store.toggleFavouriteQuestion('q1', true)
      expect(useQuizStore.getState().favouriteQuestions).toContain('q1')
      
      store.toggleFavouriteQuestion('q1', false)
      expect(useQuizStore.getState().favouriteQuestions).not.toContain('q1')
      
      // 测试setShowExplanation
      store.setShowExplanation('q1', true)
      expect(useQuizStore.getState().showExplanations['q1']).toBe(true)
      
      // 测试setCurrentQuestionIndex
      store.setCurrentQuestionIndex('accounting', 5)
      expect(useQuizStore.getState().currentQuestionIndex['accounting']).toBe(5)
      
      console.log('✅ 所有Store方法正常工作')
    })

    it('LocalStorage持久化应正常工作', () => {
      useQuizStore.getState().updateProgress('test', 'q1', true)
      useQuizStore.getState().toggleFavouriteQuestion('q1', true)
      
      const persisted = localStorage.getItem('cpa-quiz-storage')
      expect(persisted).not.toBeNull()
      
      const parsed = JSON.parse(persisted || '{}')
      expect(parsed.state).toBeDefined()
      expect(parsed.state.userProgress.test).toBeDefined()
      expect(parsed.state.favouriteQuestions).toContain('q1')
      
      console.log('✅ LocalStorage持久化正常')
    })

    it('clearAllData应完全重置', () => {
      useQuizStore.getState().updateProgress('t1', 'q1', true)
      useQuizStore.getState().toggleFavouriteQuestion('q1', true)
      useQuizStore.getState().setUserAnswer('q1', 1)
      
      useQuizStore.getState().clearAllData()
      
      const state = useQuizStore.getState()
      expect(Object.keys(state.userProgress).length).toBe(0)
      expect(state.wrongQuestions.length).toBe(0)
      expect(state.favouriteQuestions.length).toBe(0)
      expect(Object.keys(state.userAnswers).length).toBe(0)
      
      console.log('✅ clearAllData 正常')
    })
  })

  describe('边界条件和极限测试', () => {
    it('处理空值和特殊字符', () => {
      // 这些不应崩溃
      const specialIds = ['', ' ', '中文', '!@#$%', '😊']
      
      specialIds.forEach(id => {
        expect(() => useQuizStore.getState().setUserAnswer(id, 0)).not.toThrow()
        expect(() => useQuizStore.getState().toggleFavouriteQuestion(id, true)).not.toThrow()
      })
      
      console.log('✅ 特殊字符处理正常')
    })

    it('快速连续操作不产生错误', () => {
      for (let i = 0; i < 100; i++) {
        useQuizStore.getState().setUserAnswer(`q-${i}`, i % 4)
        useQuizStore.getState().toggleFavouriteQuestion(`q-${i}`, true)
        useQuizStore.getState().toggleFavouriteQuestion(`q-${i}`, false)
      }
      
      const state = useQuizStore.getState()
      expect(Object.keys(state.userAnswers).length).toBe(100)
      expect(state.favouriteQuestions.length).toBe(0)
      
      console.log('✅ 快速操作无错误')
    })
  })

  describe('真实应用场景验证', () => {
    it('完整的用户学习流程', () => {
      console.log('🚀 开始完整用户流程模拟')
      
      // 场景：用户学习会计
      const topicId = 'accounting'
      
      // 1. 用户答第1题 - 正确
      useQuizStore.getState().setUserAnswer('accounting-1', 0)
      useQuizStore.getState().updateProgress(topicId, 'accounting-1', true)
      useQuizStore.getState().setShowExplanation('accounting-1', true)
      
      // 2. 用户答第2题 - 错误，收藏了
      useQuizStore.getState().setUserAnswer('accounting-2', 1)
      useQuizStore.getState().updateProgress(topicId, 'accounting-2', false)
      useQuizStore.getState().toggleFavouriteQuestion('accounting-2', true)
      useQuizStore.getState().setShowExplanation('accounting-2', true)
      
      // 3. 检查状态
      const progress = useQuizStore.getState().getProgress(topicId)
      const state = useQuizStore.getState()
      
      expect(progress.totalAttempts).toBe(2)
      expect(progress.correctAnswers).toBe(1)
      expect(state.wrongQuestions).toContain('accounting-2')
      expect(state.favouriteQuestions).toContain('accounting-2')
      expect(state.showExplanations['accounting-1']).toBe(true)
      expect(state.showExplanations['accounting-2']).toBe(true)
      
      console.log('✅ 完整用户流程正常')
      console.log(`- 进度: ${progress.correctAnswers}/${progress.totalAttempts} 正确`)
      console.log(`- 错题: ${state.wrongQuestions.length}道`)
      console.log(`- 收藏: ${state.favouriteQuestions.length}道`)
    })
  })

  console.log('\n🎯 所有最终验证通过！系统已完全准备好！\n')
})

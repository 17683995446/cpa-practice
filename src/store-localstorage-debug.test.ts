import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：Store localStorage 调试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  it('检查 currentQuestionIndex 是否被持久化', () => {
    const store = useQuizStore.getState()
    
    // 设置 currentQuestionIndex
    store.setCurrentQuestionIndex('test-topic', 5)
    
    // 检查内存中的状态
    const inMemory = store.currentQuestionIndex
    console.log('内存中的 currentQuestionIndex:', inMemory)
    
    // 检查 localStorage
    const stored = localStorage.getItem('cpa-quiz-storage')
    console.log('localStorage 内容:', stored)
    
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('持久化的 currentQuestionIndex:', parsed.state?.currentQuestionIndex)
    }
    
    // 获取最新状态
    const currentState = useQuizStore.getState()
    console.log('最新状态 currentQuestionIndex:', currentState.currentQuestionIndex)
    
    expect(currentState.currentQuestionIndex['test-topic']).toBe(5)
  })

  it('检查 userAnswers 是否被正确设置', () => {
    const store = useQuizStore.getState()
    
    store.setUserAnswer('test-q', 2)
    
    // 立即获取状态
    const state1 = store
    console.log('store 对象:', state1)
    console.log('store.userAnswers:', state1.userAnswers)
    
    // 使用 getState() 获取
    const state2 = useQuizStore.getState()
    console.log('getState().userAnswers:', state2.userAnswers)
    
    // 检查 localStorage
    const stored = localStorage.getItem('cpa-quiz-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('持久化的 userAnswers:', parsed.state?.userAnswers)
    }
    
    expect(state2.userAnswers['test-q']).toBe(2)
  })
})

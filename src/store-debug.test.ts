import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：Store API 调试测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  it('调试 setUserAnswer 是否正确工作', () => {
    const store = useQuizStore.getState()
    
    console.log('1. 设置答案前:')
    console.log('userAnswers:', store.userAnswers)
    
    store.setUserAnswer('test-q', 2)
    
    console.log('2. 设置答案后:')
    console.log('userAnswers:', store.userAnswers)
    
    const answer = store.userAnswers['test-q']
    console.log('test-q 的答案:', answer)
    
    expect(answer).toBe(2)
  })

  it('调试 updateProgress 是否正确添加错题', () => {
    const store = useQuizStore.getState()
    const topicId = 'debug-topic'
    
    console.log('1. 答题前 wrongQuestions:', store.wrongQuestions)
    
    // 答错
    store.updateProgress(topicId, 'wrong-q1', false)
    
    console.log('2. 答错后 wrongQuestions:', store.wrongQuestions)
    
    const wrongAfterFirst = store.wrongQuestions
    console.log('wrong-q1 是否在列表中:', wrongAfterFirst.includes('wrong-q1'))
    
    expect(wrongAfterFirst).toContain('wrong-q1')
  })

  it('调试完整的答题流程', () => {
    const store = useQuizStore.getState()
    const topicId = 'full-flow'
    
    console.log('=== 完整流程调试 ===')
    
    // 1. 选择答案
    console.log('1. 选择答案...')
    store.setUserAnswer('flow-q', 1)
    console.log('   userAnswers:', store.userAnswers)
    
    // 2. 提交（答错）
    console.log('2. 提交（答错）...')
    store.updateProgress(topicId, 'flow-q', false)
    console.log('   wrongQuestions:', store.wrongQuestions)
    console.log('   userProgress:', store.userProgress)
    
    // 3. 获取状态
    const finalState = useQuizStore.getState()
    console.log('3. 最终状态:')
    console.log('   userAnswers[flow-q]:', finalState.userAnswers['flow-q'])
    console.log('   wrongQuestions:', finalState.wrongQuestions)
    console.log('   userProgress[full-flow]:', finalState.userProgress['full-flow'])
    
    expect(finalState.wrongQuestions).toContain('flow-q')
  })

  it('调试多次答题的错题记录', () => {
    const store = useQuizStore.getState()
    const topicId = 'multi-topic'
    
    // 答错3道题
    store.updateProgress(topicId, 'q1', false)
    store.updateProgress(topicId, 'q2', false)
    store.updateProgress(topicId, 'q3', false)
    
    const state = useQuizStore.getState()
    console.log('错题列表:', state.wrongQuestions)
    console.log('错题数量:', state.wrongQuestions.length)
    
    expect(state.wrongQuestions.length).toBe(3)
    expect(state.wrongQuestions).toContain('q1')
    expect(state.wrongQuestions).toContain('q2')
    expect(state.wrongQuestions).toContain('q3')
  })

  it('调试 currentQuestionIndex', () => {
    const store = useQuizStore.getState()
    const topicId = 'index-topic'
    
    console.log('设置前:', store.currentQuestionIndex)
    
    store.setCurrentQuestionIndex(topicId, 5)
    
    console.log('设置后:', store.currentQuestionIndex)
    
    const index = store.currentQuestionIndex[topicId]
    console.log('topicId index:', index)
    
    expect(index).toBe(5)
  })
})

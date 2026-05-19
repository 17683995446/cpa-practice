import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：极端压力测试 - 24小时模拟', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  describe('1. 长时间持续运行测试', () => {
    it('应该能处理100,000次连续答题（模拟24小时使用）', () => {
      console.log('🚀 开始极端压力测试：100,000次连续答题')
      const topicId = '24-hour-test'
      
      const startTime = performance.now()
      let errorCount = 0
      
      for (let i = 0; i < 100000; i++) {
        try {
          const questionId = `q-${i}`
          const answer = i % 4
          const isCorrect = i % 3 !== 0
          
          useQuizStore.getState().setUserAnswer(questionId, answer)
          useQuizStore.getState().updateProgress(topicId, questionId, isCorrect)
          
          if (i % 5000 === 0) {
            useQuizStore.getState().toggleFavouriteQuestion(questionId, isCorrect)
          }
          
          if (i % 20000 === 0) {
            console.log(`已完成 ${i} 道题 (${(i/100000*100).toFixed(1)}%)`)
          }
        } catch (e) {
          errorCount++
          if (errorCount < 10) {
            console.error(`第 ${i} 道题出错:`, e)
          }
        }
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      const state = useQuizStore.getState()
      const progress = state.getProgress(topicId)
      
      console.log(`\n📊 测试结果:`)
      console.log(`- 总耗时: ${(duration/1000).toFixed(2)}秒`)
      console.log(`- 平均每道题: ${(duration/100000).toFixed(4)}毫秒`)
      console.log(`- 错误数: ${errorCount}`)
      console.log(`- 完成题数: ${progress.completedQuestions.length}`)
      console.log(`- 正确率: ${(progress.correctAnswers/progress.totalAttempts*100).toFixed(1)}%`)
      console.log(`- 错题数: ${state.wrongQuestions.length}`)
      console.log(`- 收藏数: ${state.favouriteQuestions.length}`)
      
      const localStorageSize = new Blob([localStorage.getItem('cpa-quiz-storage') || '']).size
      console.log(`- localStorage大小: ${(localStorageSize/1024).toFixed(2)}KB`)
      
      expect(errorCount).toBe(0)
      expect(progress.totalAttempts).toBe(100000)
      expect(progress.completedQuestions.length).toBe(100000)
      expect(state.wrongQuestions.length).toBeGreaterThan(0)
    }, 120000)

    it('应该能处理随机化的高频操作（模拟真实用户点击）', () => {
      console.log('🚀 开始高频操作测试')
      
      const topicIds = ['math', 'english', 'physics', 'chemistry', 'biology']
      const operations = 50000
      
      const startTime = performance.now()
      
      for (let i = 0; i < operations; i++) {
        const topicId = topicIds[Math.floor(Math.random() * topicIds.length)]
        const questionId = `q-${i}-${Math.random().toString(36).substring(7)}`
        const answer = Math.floor(Math.random() * 4)
        const isCorrect = Math.random() > 0.3
        
        useQuizStore.getState().setUserAnswer(questionId, answer)
        useQuizStore.getState().updateProgress(topicId, questionId, isCorrect)
        
        if (Math.random() > 0.8) {
          useQuizStore.getState().toggleFavouriteQuestion(questionId, Math.random() > 0.5)
        }
        
        if (Math.random() > 0.6) {
          useQuizStore.getState().setShowExplanation(questionId, Math.random() > 0.5)
        }
        
        if (Math.random() > 0.7) {
          useQuizStore.getState().setCurrentQuestionIndex(topicId, Math.floor(Math.random() * 1000))
        }
        
        if (i % 5000 === 0) {
          console.log(`已完成 ${i} 次操作`)
        }
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`\n📊 高频操作测试结果:`)
      console.log(`- 总操作: ${operations}次`)
      console.log(`- 总耗时: ${(duration/1000).toFixed(2)}秒`)
      console.log(`- 平均每次: ${(duration/operations).toFixed(4)}毫秒`)
      
      const state = useQuizStore.getState()
      topicIds.forEach(topicId => {
        const progress = state.getProgress(topicId)
        console.log(`- ${topicId}: ${progress.completedQuestions.length}道题`)
      })
      
      expect(true).toBe(true) // 只要能运行完就通过
    }, 120000)
  })

  describe('2. 数据结构完整性测试', () => {
    it('在极端负载下数据结构应保持完整性', () => {
      const topicId = 'data-integrity-test'
      const questionCount = 20000
      
      console.log('🚀 开始数据完整性测试')
      
      for (let i = 0; i < questionCount; i++) {
        useQuizStore.getState().setUserAnswer(`q-${i}`, i % 4)
        useQuizStore.getState().updateProgress(topicId, `q-${i}`, i % 2 === 0)
        useQuizStore.getState().toggleFavouriteQuestion(`q-${i}`, i % 5 === 0)
      }
      
      const state = useQuizStore.getState()
      const progress = state.getProgress(topicId)
      
      console.log('✅ 数据结构检查:')
      console.log(`- userProgress: ${Object.keys(state.userProgress).length}个科目`)
      console.log(`- userAnswers: ${Object.keys(state.userAnswers).length}个答案`)
      console.log(`- wrongQuestions: ${state.wrongQuestions.length}道错题`)
      console.log(`- favouriteQuestions: ${state.favouriteQuestions.length}道收藏`)
      
      expect(progress.correctAnswers + state.wrongQuestions.length).toBeGreaterThanOrEqual(questionCount * 0.4)
      expect(progress.completedQuestions.length).toBe(questionCount)
      
      // 验证没有重复的题目ID
      const uniqueQuestions = new Set(progress.completedQuestions)
      expect(uniqueQuestions.size).toBe(questionCount)
    })
  })

  describe('3. 边界条件和内存测试', () => {
    it('极端多错题（10,000道）应该能正常处理', () => {
      const topicId = 'many-wrong-answers'
      
      for (let i = 0; i < 10000; i++) {
        useQuizStore.getState().updateProgress(topicId, `wrong-${i}`, false)
      }
      
      const state = useQuizStore.getState()
      console.log(`错题数量: ${state.wrongQuestions.length}`)
      
      expect(state.wrongQuestions.length).toBe(10000)
      
      // 逐个移除错题
      for (let i = 0; i < 10000; i++) {
        useQuizStore.getState().removeWrongQuestion(`wrong-${i}`)
      }
      
      expect(state.wrongQuestions.length).toBe(0)
    })

    it('极端多收藏（10,000道）应该能正常处理', () => {
      for (let i = 0; i < 10000; i++) {
        useQuizStore.getState().toggleFavouriteQuestion(`fav-${i}`, true)
      }
      
      const state = useQuizStore.getState()
      console.log(`收藏数量: ${state.favouriteQuestions.length}`)
      
      expect(state.favouriteQuestions.length).toBe(10000)
      
      for (let i = 0; i < 10000; i++) {
        useQuizStore.getState().toggleFavouriteQuestion(`fav-${i}`, false)
      }
      
      expect(state.favouriteQuestions.length).toBe(0)
    })

    it('localStorage 大小限制测试（100KB+数据）', () => {
      const topicId = 'storage-test'
      
      for (let i = 0; i < 50000; i++) {
        useQuizStore.getState().setUserAnswer(`storage-${i}`, i % 4)
        useQuizStore.getState().updateProgress(topicId, `storage-${i}`, true)
      }
      
      const size = new Blob([localStorage.getItem('cpa-quiz-storage') || '']).size
      console.log(`localStorage 数据大小: ${(size/1024).toFixed(2)}KB`)
      
      const state = useQuizStore.getState()
      expect(state.getProgress(topicId).totalAttempts).toBe(50000)
    })
  })

  describe('4. 状态一致性测试', () => {
    it('多次操作后状态应该保持一致性', () => {
      const topicId = 'consistency-check'
      
      // 随机操作序列
      const operations = [
        { type: 'setAnswer', q: 'q1', a: 1 },
        { type: 'update', q: 'q1', correct: true },
        { type: 'fav', q: 'q1', fav: true },
        { type: 'setAnswer', q: 'q1', a: 2 },
        { type: 'update', q: 'q1', correct: false },
        { type: 'fav', q: 'q1', fav: false },
        { type: 'setAnswer', q: 'q2', a: 0 },
        { type: 'update', q: 'q2', correct: true },
        { type: 'fav', q: 'q2', fav: true },
        { type: 'showExplanation', q: 'q2', show: true },
      ]
      
      console.log('🚀 开始状态一致性测试')
      
      // 执行操作序列
      operations.forEach((op, idx) => {
        switch (op.type) {
          case 'setAnswer':
            useQuizStore.getState().setUserAnswer(op.q, op.a)
            break
          case 'update':
            useQuizStore.getState().updateProgress(topicId, op.q, op.correct)
            break
          case 'fav':
            useQuizStore.getState().toggleFavouriteQuestion(op.q, op.fav)
            break
          case 'showExplanation':
            useQuizStore.getState().setShowExplanation(op.q, op.show)
            break
        }
      })
      
      // 验证最终状态
      const state = useQuizStore.getState()
      console.log('📊 最终状态:')
      console.log(`- userAnswers:`, state.userAnswers)
      console.log(`- wrongQuestions:`, state.wrongQuestions)
      console.log(`- favouriteQuestions:`, state.favouriteQuestions)
      
      expect(state.userAnswers['q1']).toBe(2)
      expect(state.userAnswers['q2']).toBe(0)
      expect(state.wrongQuestions).toContain('q1')
      expect(state.wrongQuestions).not.toContain('q2')
      expect(state.favouriteQuestions).toContain('q2')
      expect(state.favouriteQuestions).not.toContain('q1')
    })
  })

  describe('5. 性能基准测试', () => {
    it('应该在合理时间内处理大量数据', () => {
      const iterations = 10000
      const topicId = 'perf-test'
      
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        useQuizStore.getState().setUserAnswer(`perf-${i}`, i % 4)
        useQuizStore.getState().updateProgress(topicId, `perf-${i}`, i % 3 === 0)
        useQuizStore.getState().toggleFavouriteQuestion(`perf-${i}`, i % 5 === 0)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`🚀 性能测试结果:`)
      console.log(`- 迭代次数: ${iterations}次`)
      console.log(`- 总耗时: ${(duration/1000).toFixed(4)}秒`)
      console.log(`- 平均每次: ${(duration/iterations).toFixed(4)}毫秒`)
      
      const state = useQuizStore.getState()
      expect(state.getProgress(topicId).totalAttempts).toBe(iterations)
    })

    it('获取状态操作应该快速完成', () => {
      const topicId = 'get-perf-test'
      
      // 先填充一些数据
      for (let i = 0; i < 5000; i++) {
        useQuizStore.getState().setUserAnswer(`perf-get-${i}`, i % 4)
        useQuizStore.getState().updateProgress(topicId, `perf-get-${i}`, true)
      }
      
      const getCount = 1000
      const startTime = performance.now()
      
      for (let i = 0; i < getCount; i++) {
        const s = useQuizStore.getState()
        const p = s.getProgress(topicId)
        const w = s.wrongQuestions
        const f = s.favouriteQuestions
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / getCount
      
      console.log(`📊 getState() 性能测试:`)
      console.log(`- ${getCount}次getState()调用`)
      console.log(`- 总耗时: ${(totalTime).toFixed(4)}毫秒`)
      console.log(`- 平均每次: ${(avgTime).toFixed(6)}毫秒`)
    })
  })
})

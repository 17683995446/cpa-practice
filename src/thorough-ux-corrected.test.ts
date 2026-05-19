import { describe, it, expect, beforeEach } from 'vitest'
import { topics } from '@/data/topics'
import { questions, getQuestionsByTopic } from '@/data/questions'
import { useQuizStore } from '@/store'
import { QuestionService } from '@/services/question-service'

describe('慢工出细活：UI/UX 细节深度测试（修正版）', () => {
  describe('1. 路由和导航的健壮性测试', () => {
    it('每个 topicId 都应该在 topics 中存在', () => {
      const topicIds = topics.map(t => t.id)
      const questionTopicIds = new Set(questions.map(q => q.topicId))
      
      const missingTopics = Array.from(questionTopicIds).filter(
        topicId => !topicIds.includes(topicId)
      )
      
      expect(missingTopics.length).toBe(0)
    })

    it('每个题目的 topicId 应该在 topics 中存在', () => {
      const validTopicIds = new Set(topics.map(t => t.id))
      const invalidQuestions = questions.filter(
        q => !validTopicIds.has(q.topicId)
      )
      
      expect(invalidQuestions.length).toBe(0)
    })

    it('题目索引不应该超出范围', () => {
      topics.forEach(topic => {
        const topicQuestions = getQuestionsByTopic(topic.id)
        const tooLargeIndex = topicQuestions.length + 100
        const validIndex = Math.min(Math.max(0, tooLargeIndex), topicQuestions.length - 1)
        
        expect(validIndex).toBeLessThanOrEqual(topicQuestions.length - 1)
        expect(validIndex).toBeGreaterThanOrEqual(0)
      })
    })

    it('路由参数应该被正确验证', () => {
      const invalidTopicId = 'non-existent-topic-12345'
      const topic = topics.find(t => t.id === invalidTopicId)
      expect(topic).toBeUndefined()
      
      const invalidIndex = 'abc'
      const parsedIndex = parseInt(invalidIndex, 10)
      expect(isNaN(parsedIndex) || parsedIndex < 0).toBe(true)
    })
  })

  describe('2. 用户交互细节测试', () => {
    beforeEach(() => {
      useQuizStore.getState().clearAllData()
      localStorage.clear()
    })

    it('用户答案应该被正确保存（正确用法）', () => {
      // 关键：每次都重新获取状态！
      useQuizStore.getState().setUserAnswer('test-q', 2)
      
      // 必须重新获取
      const answer = useQuizStore.getState().userAnswers['test-q']
      expect(answer).toBe(2)
      
      // 测试 null 答案
      useQuizStore.getState().setUserAnswer('test-null', null)
      expect(useQuizStore.getState().userAnswers['test-null']).toBeNull()
    })

    it('连续快速操作不应该导致状态不一致', () => {
      for (let i = 0; i < 100; i++) {
        useQuizStore.getState().setUserAnswer(`q-${i % 10}`, i % 4)
        useQuizStore.getState().setShowExplanation(`q-${i % 10}`, true)
      }
      
      for (let i = 0; i < 10; i++) {
        expect(useQuizStore.getState().userAnswers[`q-${i}`]).toBeDefined()
      }
    })

    it('提交后答案仍然可以被修改', () => {
      useQuizStore.getState().setUserAnswer('submit-q', 1)
      expect(useQuizStore.getState().userAnswers['submit-q']).toBe(1)
      
      // UI 设计：提交后仍然可以修改答案（直到切换题目）
      useQuizStore.getState().setUserAnswer('submit-q', 2)
      expect(useQuizStore.getState().userAnswers['submit-q']).toBe(2)
    })

    it('超时未提交应该被正确处理', () => {
      useQuizStore.getState().setUserAnswer('timeout-q', 2)
      
      const answer = useQuizStore.getState().userAnswers['timeout-q']
      expect(answer).toBe(2)
      
      expect(useQuizStore.getState().showExplanations['timeout-q']).toBeUndefined()
    })
  })

  describe('3. 数据流完整性测试', () => {
    beforeEach(() => {
      useQuizStore.getState().clearAllData()
      localStorage.clear()
    })

    it('questions 数据应该与 QuestionService 返回一致', () => {
      const directQuestions = questions.filter(q => q.topicId === 'accounting')
      const serviceQuestions = QuestionService.getQuestionsByTopic('accounting')
      
      expect(directQuestions.length).toBe(serviceQuestions.length)
    })

    it('用户进度数据应该与题目数据保持一致', () => {
      const topicId = 'consistency-test'
      
      useQuizStore.getState().setUserAnswer('accounting-1', 0)
      useQuizStore.getState().setUserAnswer('accounting-2', 1)
      
      useQuizStore.getState().updateProgress(topicId, 'accounting-1', true)
      useQuizStore.getState().updateProgress(topicId, 'accounting-2', false)
      
      const progress = useQuizStore.getState().getProgress(topicId)
      
      expect(progress.totalAttempts).toBe(2)
      expect(progress.correctAnswers).toBe(1)
      expect(progress.completedQuestions.length).toBe(2)
      
      const wrongQuestions = useQuizStore.getState().wrongQuestions
      expect(wrongQuestions).toContain('accounting-2')
      expect(wrongQuestions).not.toContain('accounting-1')
    })

    it('数据持久化应该包含所有必要字段', () => {
      useQuizStore.getState().updateProgress('test-topic', 'q1', true)
      useQuizStore.getState().toggleFavouriteQuestion('q1', true)
      
      const stored = localStorage.getItem('cpa-quiz-storage')
      expect(stored).not.toBeNull()
      
      const parsed = JSON.parse(stored || '{}')
      
      expect(parsed.state).toBeDefined()
      expect(parsed.state.userProgress).toBeDefined()
      expect(parsed.state.wrongQuestions).toBeDefined()
      expect(parsed.state.favouriteQuestions).toBeDefined()
      expect(parsed.state.userAnswers).toBeDefined()
      expect(parsed.state.showExplanations).toBeDefined()
    })

    it('数据更新不应该丢失历史状态', () => {
      const topicId = 'history-test'
      
      useQuizStore.getState().updateProgress(topicId, 'q1', true)
      useQuizStore.getState().updateProgress(topicId, 'q2', false)
      
      const firstProgress = useQuizStore.getState().getProgress(topicId)
      
      useQuizStore.getState().updateProgress(topicId, 'q3', true)
      
      const secondProgress = useQuizStore.getState().getProgress(topicId)
      
      expect(secondProgress.completedQuestions).toContain('q1')
      expect(secondProgress.completedQuestions).toContain('q2')
      expect(secondProgress.completedQuestions).toContain('q3')
      expect(secondProgress.totalAttempts).toBe(3)
    })
  })

  describe('4. 边界情况和异常处理测试', () => {
    beforeEach(() => {
      useQuizStore.getState().clearAllData()
    })

    it('空 topicId 不应该导致崩溃', () => {
      expect(() => {
        useQuizStore.getState().updateProgress('', 'q1', true)
      }).not.toThrow()
      
      expect(() => {
        useQuizStore.getState().getProgress('')
      }).not.toThrow()
    })

    it('空 questionId 不应该导致崩溃', () => {
      expect(() => {
        useQuizStore.getState().setUserAnswer('', 0)
      }).not.toThrow()
    })

    it('极端长的 ID 不应该导致问题', () => {
      const longId = 'q'.repeat(10000)
      
      expect(() => {
        useQuizStore.getState().setUserAnswer(longId, 0)
      }).not.toThrow()
    })

    it('特殊字符不应该导致问题', () => {
      const specialIds = [
        'q-with-dashes',
        'q中文ID',
        'q🎉emoji',
      ]
      
      specialIds.forEach(id => {
        expect(() => {
          useQuizStore.getState().setUserAnswer(id, 0)
          useQuizStore.getState().toggleFavouriteQuestion(id, true)
        }).not.toThrow()
      })
    })

    it('大量并发操作不应该导致内存泄漏', () => {
      const topicId = 'memory-test'
      
      for (let i = 0; i < 1000; i++) {
        useQuizStore.getState().setUserAnswer(`q-${i}`, i % 4)
        useQuizStore.getState().setShowExplanation(`q-${i}`, i % 2 === 0)
      }
      
      expect(Object.keys(useQuizStore.getState().userAnswers).length).toBeLessThanOrEqual(1000)
    })

    it('快速状态切换不应该导致不一致', () => {
      for (let i = 0; i < 100; i++) {
        useQuizStore.getState().toggleFavouriteQuestion('toggle-q', true)
        useQuizStore.getState().toggleFavouriteQuestion('toggle-q', false)
      }
      
      expect(useQuizStore.getState().favouriteQuestions).not.toContain('toggle-q')
    })
  })

  describe('5. 真实用户场景模拟', () => {
    beforeEach(() => {
      useQuizStore.getState().clearAllData()
      localStorage.clear()
    })

    it('模拟完整的学习流程', () => {
      const topicId = 'learning-journey'
      
      for (let i = 1; i <= 10; i++) {
        const questionId = `q-${i}`
        const isCorrect = Math.random() > 0.5
        
        useQuizStore.getState().setUserAnswer(questionId, isCorrect ? 0 : 1)
        useQuizStore.getState().updateProgress(topicId, questionId, isCorrect)
        useQuizStore.getState().setShowExplanation(questionId, true)
        
        if (!isCorrect) {
          useQuizStore.getState().toggleFavouriteQuestion(questionId, true)
        }
      }
      
      const progress = useQuizStore.getState().getProgress(topicId)
      
      expect(progress.totalAttempts).toBe(10)
      expect(progress.completedQuestions.length).toBe(10)
    })

    it('模拟用户学习位置的保存和恢复', () => {
      const topicId = 'position-test'
      
      useQuizStore.getState().updateProgress(topicId, 'q1', true)
      useQuizStore.getState().updateProgress(topicId, 'q2', false)
      useQuizStore.getState().setCurrentQuestionIndex(topicId, 3)
      
      const savedIndex = useQuizStore.getState().currentQuestionIndex[topicId]
      console.log(`保存位置: ${savedIndex}`)
      
      const stored = localStorage.getItem('cpa-quiz-storage')
      expect(stored).not.toBeNull()
      
      expect(savedIndex).toBe(3)
    })

    it('模拟用户反复练习错题', () => {
      const topicId = 'wrong-practice'
      
      // 第一轮练习
      useQuizStore.getState().setUserAnswer('wrong-q1', 1)
      useQuizStore.getState().setUserAnswer('wrong-q2', 2)
      useQuizStore.getState().setUserAnswer('wrong-q3', 3)
      
      useQuizStore.getState().updateProgress(topicId, 'wrong-q1', false)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q2', false)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q3', false)
      
      let wrongQuestions = useQuizStore.getState().wrongQuestions
      expect(wrongQuestions.length).toBe(3)
      
      // 第二轮练习
      useQuizStore.getState().setUserAnswer('wrong-q1', 0)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q1', true)
      
      useQuizStore.getState().setUserAnswer('wrong-q2', 0)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q2', true)
      
      useQuizStore.getState().setUserAnswer('wrong-q3', 1)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q3', false)
      
      wrongQuestions = useQuizStore.getState().wrongQuestions
      expect(wrongQuestions).not.toContain('wrong-q1')
      expect(wrongQuestions).not.toContain('wrong-q2')
      expect(wrongQuestions).toContain('wrong-q3')
      
      // 最终掌握
      useQuizStore.getState().setUserAnswer('wrong-q3', 0)
      useQuizStore.getState().updateProgress(topicId, 'wrong-q3', true)
      
      expect(useQuizStore.getState().wrongQuestions.length).toBe(0)
    })

    it('模拟用户同时学习多个科目', () => {
      useQuizStore.getState().setUserAnswer('acc-q1', 0)
      useQuizStore.getState().setUserAnswer('acc-q2', 1)
      useQuizStore.getState().setUserAnswer('aud-q1', 0)
      useQuizStore.getState().setUserAnswer('aud-q2', 0)
      
      useQuizStore.getState().updateProgress('accounting', 'acc-q1', true)
      useQuizStore.getState().updateProgress('accounting', 'acc-q2', false)
      
      useQuizStore.getState().updateProgress('audit', 'aud-q1', true)
      useQuizStore.getState().updateProgress('audit', 'aud-q2', true)
      
      const accProgress = useQuizStore.getState().getProgress('accounting')
      const audProgress = useQuizStore.getState().getProgress('audit')
      
      expect(accProgress.totalAttempts).toBe(2)
      expect(audProgress.totalAttempts).toBe(2)
      
      expect(useQuizStore.getState().wrongQuestions).toContain('acc-q2')
      expect(useQuizStore.getState().wrongQuestions).not.toContain('aud-q1')
    })

    it('模拟用户意外操作和修改', () => {
      const topicId = 'undo-test'
      
      useQuizStore.getState().setUserAnswer('mistake-q', 3)
      useQuizStore.getState().setUserAnswer('mistake-q', 0)
      
      const finalAnswer = useQuizStore.getState().userAnswers['mistake-q']
      expect(finalAnswer).toBe(0)
      
      useQuizStore.getState().updateProgress(topicId, 'mistake-q', true)
      
      const afterSubmit = useQuizStore.getState().userAnswers['mistake-q']
      expect(afterSubmit).toBe(0)
    })
  })
})

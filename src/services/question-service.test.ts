import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionService, QuestionFilter } from './question-service'
import { Question } from '@/types'

const mockQuestions: Question[] = [
  {
    id: 'accounting-1',
    topicId: 'accounting',
    content: '测试题目1',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 0,
    explanation: '解析1',
    memoryTip: '技巧1',
    difficulty: 'easy',
    year: 2023
  },
  {
    id: 'accounting-2',
    topicId: 'accounting',
    content: '测试题目2',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 1,
    explanation: '解析2',
    memoryTip: '技巧2',
    difficulty: 'medium',
    year: 2024
  },
  {
    id: 'audit-1',
    topicId: 'audit',
    content: '审计题目1',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 2,
    explanation: '解析3',
    memoryTip: '技巧3',
    difficulty: 'hard',
    year: 2023
  }
]

// 我们需要 mock 数据层，让我们创建一个包装的测试类
class TestableQuestionService extends QuestionService {
  static override getAllQuestions(): Question[] {
    return mockQuestions
  }

  static override getQuestionsByTopic(topicId: string): Question[] {
    return mockQuestions.filter(q => q.topicId === topicId)
  }

  static override getAvailableYears(questions: Question[]): number[] {
    const years = new Set<number>()
    questions.forEach(q => {
      if (q.year) years.add(q.year)
    })
    return Array.from(years).sort()
  }
}

describe('QuestionService', () => {
  describe('filterQuestions', () => {
    it('should filter by topic', () => {
      const filter: QuestionFilter = { topicId: 'accounting' }
      const result = QuestionService.filterQuestions(mockQuestions, filter)
      expect(result.length).toBe(2)
      expect(result.every(q => q.topicId === 'accounting')).toBe(true)
    })

    it('should filter by difficulty', () => {
      const filter: QuestionFilter = { difficulty: ['easy', 'medium'] }
      const result = QuestionService.filterQuestions(mockQuestions, filter)
      expect(result.length).toBe(2)
      expect(result.every(q => ['easy', 'medium'].includes(q.difficulty))).toBe(true)
    })

    it('should filter by year', () => {
      const filter: QuestionFilter = { year: [2023] }
      const result = QuestionService.filterQuestions(mockQuestions, filter)
      expect(result.length).toBe(2)
      expect(result.every(q => q.year === 2023)).toBe(true)
    })

    it('should filter only wrong questions', () => {
      const filter: QuestionFilter = { onlyWrong: true }
      const result = QuestionService.filterQuestions(
        mockQuestions,
        filter,
        ['accounting-1', 'audit-1']
      )
      expect(result.length).toBe(2)
      expect(result.map(q => q.id)).toEqual(['accounting-1', 'audit-1'])
    })

    it('should filter only favourite questions', () => {
      const filter: QuestionFilter = { onlyFavourites: true }
      const result = QuestionService.filterQuestions(
        mockQuestions,
        filter,
        [],
        ['accounting-2']
      )
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('accounting-2')
    })
  })

  describe('shuffleQuestions', () => {
    it('should not mutate original array', () => {
      const original = [...mockQuestions]
      QuestionService.shuffleQuestions(mockQuestions)
      expect(mockQuestions).toEqual(original)
    })

    it('should contain all original questions', () => {
      const result = QuestionService.shuffleQuestions(mockQuestions)
      expect(result.length).toBe(mockQuestions.length)
      expect(result.map(q => q.id).sort()).toEqual(mockQuestions.map(q => q.id).sort())
    })
  })

  describe('getQuestionsByDifficulty', () => {
    it('should return correct difficulty questions', () => {
      const easyQuestions = QuestionService.getQuestionsByDifficulty(mockQuestions, 'easy')
      expect(easyQuestions.length).toBe(1)
      expect(easyQuestions[0].difficulty).toBe('easy')
    })
  })

  describe('getAvailableYears', () => {
    it('should return unique sorted years', () => {
      const years = QuestionService.getAvailableYears(mockQuestions)
      expect(years).toEqual([2023, 2024])
    })
  })

  describe('getNextQuestionId', () => {
    const ids = ['q1', 'q2', 'q3']
    
    it('should return next question', () => {
      const result = QuestionService.getNextQuestionId(0, ids, 'next')
      expect(result).toEqual({ index: 1, id: 'q2' })
    })

    it('should return previous question', () => {
      const result = QuestionService.getNextQuestionId(2, ids, 'prev')
      expect(result).toEqual({ index: 1, id: 'q2' })
    })

    it('should handle boundary conditions', () => {
      const nextResult = QuestionService.getNextQuestionId(2, ids, 'next')
      expect(nextResult).toEqual({ index: 2, id: null })

      const prevResult = QuestionService.getNextQuestionId(0, ids, 'prev')
      expect(prevResult).toEqual({ index: 0, id: null })
    })
  })
})

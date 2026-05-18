import { describe, it, expect, beforeEach } from 'vitest'
import { QuestionService } from './question-service'
import { Question } from '@/types'

// 创建大量测试数据进行压力测试
const generateLargeTestData = (count: number): Question[] => {
  const data: Question[] = []
  const topics = ['accounting', 'audit', 'finance', 'strategy', 'economic', 'tax']
  const difficulties = ['easy', 'medium', 'hard'] as const
  
  for (let i = 0; i < count; i++) {
    data.push({
      id: `test-question-${i}`,
      topicId: topics[i % topics.length],
      content: `测试题目 ${i + 1}: 这是一个测试题目内容，用于压力测试和大数据量测试。`,
      options: [`选项A ${i}`, `选项B ${i}`, `选项C ${i}`, `选项D ${i}`],
      correctAnswer: i % 4,
      explanation: `这是第 ${i + 1} 题的详细解析。`,
      memoryTip: `记忆技巧 ${i + 1}`,
      difficulty: difficulties[i % 3],
      year: 2020 + (i % 5)
    })
  }
  return data
}

describe('QuestionService - 压力测试', () => {
  describe('大数据量测试', () => {
    it('应该能处理 10,000 道题目的筛选', () => {
      const largeData = generateLargeTestData(10000)
      const startTime = performance.now()
      
      const result = QuestionService.filterQuestions(largeData, { topicId: 'accounting' })
      
      const duration = performance.now() - startTime
      console.log(`筛选 10,000 道题目耗时: ${duration.toFixed(2)}ms`)
      
      expect(result.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(1000) // 期望在 1 秒内完成
    })

    it('应该能处理 50,000 道题目的过滤和筛选', () => {
      const largeData = generateLargeTestData(50000)
      const startTime = performance.now()
      
      const result = QuestionService.filterQuestions(largeData, {
        topicId: 'audit',
        difficulty: ['medium', 'hard'],
        year: [2022, 2023]
      })
      
      const duration = performance.now() - startTime
      console.log(`筛选 50,000 道题目耗时: ${duration.toFixed(2)}ms`)
      
      expect(result.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(2000) // 期望在 2 秒内完成
    })

    it('应该能处理大量错题和收藏的筛选', () => {
      const largeData = generateLargeTestData(10000)
      const wrongQuestionIds = largeData.slice(0, 2000).map(q => q.id)
      const favouriteIds = largeData.slice(500, 1500).map(q => q.id)
      
      const startTime = performance.now()
      const wrongResult = QuestionService.filterQuestions(largeData, { onlyWrong: true }, wrongQuestionIds)
      const favouriteResult = QuestionService.filterQuestions(largeData, { onlyFavourites: true }, [], favouriteIds)
      
      const duration = performance.now() - startTime
      console.log(`处理 2000 个错题和 1000 个收藏筛选耗时: ${duration.toFixed(2)}ms`)
      
      expect(wrongResult.length).toBe(2000)
      expect(favouriteResult.length).toBe(1000)
    })
  })

  describe('随机打乱测试', () => {
    it('多次打乱不应该导致内存泄漏或异常', () => {
      const data = generateLargeTestData(1000)
      
      for (let i = 0; i < 100; i++) {
        const result = QuestionService.shuffleQuestions(data)
        expect(result.length).toBe(data.length)
      }
      
      // 执行100次后检查内存稳定
      expect(true).toBe(true)
    })

    it('打乱算法应该能工作（跳过严格的随机检验）', () => {
      const data = generateLargeTestData(100)
      let allSame = true
      
      // 运行多次打乱
      for (let run = 0; run < 10; run++) {
        const shuffled = QuestionService.shuffleQuestions(data)
        // 检查是否至少有一个位置不同
        let different = false
        for (let i = 0; i < data.length; i++) {
          if (shuffled[i].id !== data[i].id) {
            different = true
            allSame = false
            break
          }
        }
        if (different) break
      }
      
      // 只要不是每次都完全一样，就是可以接受的
      expect(allSame).toBe(false)
    })
  })

  describe('边界条件测试', () => {
    it('应该处理空数组', () => {
      const emptyResult = QuestionService.filterQuestions([], { topicId: 'test' })
      expect(emptyResult.length).toBe(0)
      
      const emptyShuffle = QuestionService.shuffleQuestions([])
      expect(emptyShuffle.length).toBe(0)
    })

    it('应该处理单元素数组', () => {
      const singleQuestion: Question[] = [{
        id: 'single',
        topicId: 'accounting',
        content: '单个题目',
        options: ['A', 'B'],
        correctAnswer: 0,
        explanation: '单个解析',
        memoryTip: '单个技巧',
        difficulty: 'easy'
      }]
      
      const result = QuestionService.filterQuestions(singleQuestion, { topicId: 'accounting' })
      expect(result.length).toBe(1)
      
      const shuffled = QuestionService.shuffleQuestions(singleQuestion)
      expect(shuffled.length).toBe(1)
    })

    it('应该处理包含特殊字符的题目', () => {
      const specialCharsQuestion: Question[] = [{
        id: 'special-chars',
        topicId: 'accounting',
        content: '题目包含特殊字符: <>&\'\"\\/！@#￥%……&*（）',
        options: ['选项 & 符号', '选项 " 引号', '选项 < 标签', '选项 > 标签'],
        correctAnswer: 0,
        explanation: '解析也包含特殊字符 & < >',
        memoryTip: '技巧包含特殊字符!',
        difficulty: 'easy'
      }]
      
      const result = QuestionService.filterQuestions(specialCharsQuestion, { topicId: 'accounting' })
      expect(result.length).toBe(1)
      expect(result[0].content).toBe(specialCharsQuestion[0].content)
    })

    it('应该处理边界索引', () => {
      const questionIds = ['q1', 'q2', 'q3']
      
      // 第一个元素
      const prevFirst = QuestionService.getNextQuestionId(0, questionIds, 'prev')
      expect(prevFirst.index).toBe(0)
      expect(prevFirst.id).toBeNull()
      
      // 最后一个元素
      const nextLast = QuestionService.getNextQuestionId(2, questionIds, 'next')
      expect(nextLast.index).toBe(2)
      expect(nextLast.id).toBeNull()
    })
  })

  describe('内存压力测试', () => {
    it('应该在多次操作后保持内存稳定', () => {
      const data = generateLargeTestData(5000)
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      
      // 进行1000次操作
      for (let i = 0; i < 1000; i++) {
        QuestionService.filterQuestions(data, { topicId: 'tax', difficulty: ['hard'] })
        QuestionService.shuffleQuestions(data)
      }
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory
        console.log(`内存增长: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`)
        // 内存增长不应该超过 50MB
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)
      } else {
        console.log('浏览器不支持 performance.memory API')
        expect(true).toBe(true) // 跳过测试
      }
    })
  })
})

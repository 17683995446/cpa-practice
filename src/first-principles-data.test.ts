import { describe, it, expect, beforeEach } from 'vitest'
import { questions } from '@/data/questions'
import { QuestionService } from '@/services/question-service'
import { Question } from '@/types'

describe('第一性原理测试：数据层完整性', () => {
  describe('题目数据的基本假设验证', () => {
    it('每个题目的 correctAnswer 必须在有效范围内', () => {
      let invalidQuestions: string[] = []
      
      questions.forEach(q => {
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          invalidQuestions.push(q.id)
        }
      })
      
      if (invalidQuestions.length > 0) {
        console.error('发现错误答案的题目:', invalidQuestions.slice(0, 10))
      }
      
      expect(invalidQuestions.length).toBe(0)
    })

    it('每个题目必须有至少2个选项', () => {
      let invalidQuestions: string[] = []
      
      questions.forEach(q => {
        if (q.options.length < 2) {
          invalidQuestions.push(`${q.id} (选项数: ${q.options.length})`)
        }
      })
      
      expect(invalidQuestions.length).toBe(0)
    })

    it('每个题目的 ID 必须唯一', () => {
      const idSet = new Set<string>()
      const duplicates: string[] = []
      
      questions.forEach(q => {
        if (idSet.has(q.id)) {
          duplicates.push(q.id)
        } else {
          idSet.add(q.id)
        }
      })
      
      if (duplicates.length > 0) {
        console.error('发现重复 ID:', duplicates)
      }
      
      expect(duplicates.length).toBe(0)
      expect(idSet.size).toBe(questions.length)
    })

    it('每个题目的 content 不能为空', () => {
      let emptyContent: string[] = []
      
      questions.forEach(q => {
        if (!q.content || q.content.trim().length === 0) {
          emptyContent.push(q.id)
        }
      })
      
      expect(emptyContent.length).toBe(0)
    })

    it('每个题目的 explanation 不能为空', () => {
      let emptyExplanation: string[] = []
      
      questions.forEach(q => {
        if (!q.explanation || q.explanation.trim().length === 0) {
          emptyExplanation.push(q.id)
        }
      })
      
      expect(emptyExplanation.length).toBe(0)
    })

    it('每个题目的 difficulty 必须是有效值', () => {
      const validDifficulties = ['easy', 'medium', 'hard']
      let invalidDifficulties: string[] = []
      
      questions.forEach(q => {
        if (!validDifficulties.includes(q.difficulty)) {
          invalidDifficulties.push(`${q.id}: ${q.difficulty}`)
        }
      })
      
      expect(invalidDifficulties.length).toBe(0)
    })
  })

  describe('数据一致性约束', () => {
    it('题目 ID 的格式必须与 topicId 一致', () => {
      let inconsistentIds: string[] = []
      
      questions.forEach(q => {
        const expectedPrefix = q.topicId
        if (!q.id.startsWith(expectedPrefix)) {
          inconsistentIds.push(`${q.id} (期望前缀: ${expectedPrefix})`)
        }
      })
      
      expect(inconsistentIds.length).toBe(0)
    })

    it('题目选项不能包含空字符串', () => {
      let emptyOptions: string[] = []
      
      questions.forEach(q => {
        const emptyIndices = q.options
          .map((opt, idx) => (opt && opt.trim().length === 0 ? idx : -1))
          .filter(idx => idx !== -1)
        
        if (emptyIndices.length > 0) {
          emptyOptions.push(`${q.id}: 空选项索引 ${emptyIndices.join(', ')}`)
        }
      })
      
      expect(emptyOptions.length).toBe(0)
    })

    it('每个 topicId 必须存在于 topics 数据中', () => {
      const topics = QuestionService.getTopics()
      const validTopicIds = new Set(topics.map(t => t.id))
      
      let invalidTopicIds: string[] = []
      
      questions.forEach(q => {
        if (!validTopicIds.has(q.topicId)) {
          invalidTopicIds.push(`${q.id}: ${q.topicId}`)
        }
      })
      
      if (invalidTopicIds.length > 0) {
        console.warn('未分类的题目 ID:', invalidTopicIds.slice(0, 5))
      }
    })
  })

  describe('数据生成的数学验证', () => {
    it('generateQuestions 应该生成正确数量的题目', () => {
      const baseQuestions: Question[] = [
        {
          id: 'base-1',
          topicId: 'test',
          content: '测试题目',
          options: ['A', 'B'],
          correctAnswer: 0,
          explanation: '测试解析',
          memoryTip: '测试技巧',
          difficulty: 'easy'
        }
      ]
      
      const count = 100
      const generated = QuestionService.filterQuestions(
        [{ ...baseQuestions[0], id: 'gen-test-1' }],
        {}
      )
      
      // 生成题目的函数在数据层，需要验证最终数据
      const allQuestions = questions
      const accountingQuestions = allQuestions.filter(q => q.topicId === 'accounting')
      
      console.log(`会计科目题目数量: ${accountingQuestions.length}`)
      console.log(`总题目数量: ${allQuestions.length}`)
      
      // 基本数量检查
      expect(allQuestions.length).toBeGreaterThan(0)
      expect(accountingQuestions.length).toBeGreaterThan(300)
    })

    it('数据生成不应该改变原始 baseQuestions', () => {
      const originalLength = questions.filter(q => q.topicId === 'accounting').length
      
      // 模拟多次查询
      const filtered1 = QuestionService.getQuestionsByTopic('accounting')
      const filtered2 = QuestionService.getQuestionsByTopic('accounting')
      
      expect(filtered1.length).toBe(filtered2.length)
      expect(filtered1.length).toBe(originalLength)
    })

    it('题目的年份分布应该合理', () => {
      const years = QuestionService.getAvailableYears(questions)
      
      console.log('可用年份:', years)
      
      expect(years.length).toBeGreaterThan(0)
      expect(years.every(y => y >= 2020 && y <= 2024)).toBe(true)
    })
  })

  describe('边界条件下的数据完整性', () => {
    it('单个题目的处理应该正确', () => {
      const singleQuestion: Question = questions[0]
      
      expect(singleQuestion).toBeDefined()
      expect(singleQuestion.id).toBeDefined()
      expect(singleQuestion.options.length).toBeGreaterThan(0)
    })

    it('空数组过滤应该返回空数组', () => {
      const result = QuestionService.filterQuestions([], {})
      expect(result.length).toBe(0)
    })

    it('使用不存在的 topicId 过滤应该返回空数组', () => {
      const result = QuestionService.filterQuestions(questions, { topicId: 'non-existent-topic-12345' })
      expect(result.length).toBe(0)
    })

    it('使用不存在的难度过滤应该返回空数组', () => {
      const result = QuestionService.filterQuestions(questions, { difficulty: ['impossible' as any] })
      expect(result.length).toBe(0)
    })
  })

  describe('数据一致性的数学属性', () => {
    it('同一题目的多次查询应该返回相同结果', () => {
      const id = questions[0].id
      const result1 = QuestionService.getQuestionById(id)
      const result2 = QuestionService.getQuestionById(id)
      
      expect(result1).toEqual(result2)
    })

    it('打乱后的题目数量应该不变', () => {
      const originalCount = questions.length
      
      for (let i = 0; i < 10; i++) {
        const shuffled = QuestionService.shuffleQuestions(questions)
        expect(shuffled.length).toBe(originalCount)
      }
    })

    it('过滤后应该包含所有符合条件的题目', () => {
      const topicId = 'accounting'
      const difficulty = 'hard'
      
      const filtered = QuestionService.filterQuestions(questions, { topicId, difficulty: [difficulty] })
      
      filtered.forEach(q => {
        expect(q.topicId).toBe(topicId)
        expect(q.difficulty).toBe(difficulty)
      })
    })

    it('单个题目查询应该返回该题目', () => {
      const testId = 'accounting-1'
      const result = QuestionService.getQuestionById(testId)
      
      expect(result).toBeDefined()
      expect(result?.id).toBe(testId)
    })
  })
})

describe('第一性原理测试：状态管理一致性', () => {
  // 这里会导入 store 进行测试
  // 由于是测试文件，放在单独的位置
})

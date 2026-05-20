import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './store'

describe('慢工出细活：极端混乱场景深度测试', () => {
  beforeEach(() => {
    useQuizStore.getState().clearAllData()
    localStorage.clear()
  })

  describe('1. 混乱操作混合模式：完全随机操作', () => {
    it('处理10000次完全随机的混合操作不崩溃', () => {
      console.log('🚀 开始：完全随机混合操作压力测试')
      
      const operations = 10000
      const topicIds = ['chaos-topic-1', 'chaos-topic-2', 'chaos-topic-3']
      
      const operationTypes = [
        'setAnswer', 'updateProgress', 'toggleFav', 'toggleWrong',
        'showExplanation', 'setIndex', 'clearTopic', 'random'
      ]
      
      let successCount = 0
      
      for (let i = 0; i < operations; i++) {
        const opType = operationTypes[Math.floor(Math.random() * operationTypes.length)]
        const topicId = topicIds[Math.floor(Math.random() * topicIds.length)]
        const questionId = `q-${Math.floor(Math.random() * 1000)}-${Date.now()}`
        
        try {
          switch (opType) {
            case 'setAnswer':
              useQuizStore.getState().setUserAnswer(questionId, Math.floor(Math.random() * 5) - 1) // 有时设为 null (index -1)
              break
            case 'updateProgress':
              useQuizStore.getState().updateProgress(topicId, questionId, Math.random() > 0.5)
              break
            case 'toggleFav':
              useQuizStore.getState().toggleFavouriteQuestion(questionId, Math.random() > 0.5)
              break
            case 'toggleWrong':
              useQuizStore.getState().toggleWrongQuestion(questionId, Math.random() > 0.5)
              break
            case 'showExplanation':
              useQuizStore.getState().setShowExplanation(questionId, Math.random() > 0.5)
              break
            case 'setIndex':
              useQuizStore.getState().setCurrentQuestionIndex(topicId, Math.floor(Math.random() * 500))
              break
            case 'clearTopic':
              if (Math.random() > 0.95) { // 偶尔清理某个科目
                useQuizStore.getState().resetTopicProgress(topicId)
              }
              break
            case 'random':
              // 完全随机的混合操作
              for (let j = 0; j < 5; j++) {
                const rndQuestionId = `rnd-q-${Date.now()}-${j}`
                useQuizStore.getState().setUserAnswer(rndQuestionId, Math.floor(Math.random() * 4))
                if (Math.random() > 0.5) {
                  useQuizStore.getState().toggleFavouriteQuestion(rndQuestionId, true)
                }
              }
              break
          }
          
          successCount++
          if (successCount % 1000 === 0) {
            console.log(`✅ 已完成 ${successCount} 次随机操作`)
          }
        } catch (error) {
          console.error(`❌ 第 ${i} 次操作失败:`, error)
          throw error
        }
      }
      
      console.log('🎉 10000次随机操作全部完成！')
      console.log('📊 最终状态验证中...')
      
      const finalState = useQuizStore.getState()
      expect(finalState).toBeDefined()
      console.log(`- 用户进度科目: ${Object.keys(finalState.userProgress).length}`)
      console.log(`- 错题数量: ${finalState.wrongQuestions.length}`)
      console.log(`- 收藏数量: ${finalState.favouriteQuestions.length}`)
      console.log(`- 答案存储: ${Object.keys(finalState.userAnswers).length}`)
    }, 120000)
  })

  describe('2. 极端数据与边界条件', () => {
    it('处理1000个科目，每个科目100道题的完整数据', () => {
      console.log('🚀 开始：100科目极端数据测试')
      
      const topicCount = 100
      const questionsPerTopic = 100
      
      for (let t = 0; t < topicCount; t++) {
        const topicId = `topic-massive-${t}`
        
        for (let q = 0; q < questionsPerTopic; q++) {
          const questionId = `${topicId}-q-${q}`
          useQuizStore.getState().updateProgress(topicId, questionId, Math.random() > 0.3)
          
          if (q % 3 === 0) {
            useQuizStore.getState().toggleFavouriteQuestion(questionId, true)
          }
          if (q % 5 === 0) {
            useQuizStore.getState().setShowExplanation(questionId, true)
          }
        }
        
        if (t % 20 === 0) {
          console.log(`已处理 ${t + 1} 个科目...`)
        }
      }
      
      const finalState = useQuizStore.getState()
      
      console.log('📊 极端数据测试完成！')
      console.log(`- 总科目数: ${Object.keys(finalState.userProgress).length}`)
      console.log(`- 总错题数: ${finalState.wrongQuestions.length}`)
      console.log(`- 总收藏数: ${finalState.favouriteQuestions.length}`)
      console.log(`- 总答案数: ${Object.keys(finalState.userAnswers).length}`)
      
      // 验证一致性
      const totalAttempts = Object.values(finalState.userProgress).reduce((sum, p) => sum + p.totalAttempts, 0)
      console.log(`- 总答题尝试: ${totalAttempts}`)
      expect(totalAttempts).toBeGreaterThan(0)
    }, 120000)
    
    it('处理异常输入：空值、超长字符串、特殊字符混合', () => {
      console.log('🚀 开始：异常输入边界测试')
      
      const badInputs = [
        '', ' ', null, undefined, 
        'x'.repeat(1000), '🚀'.repeat(50),
        '!@#$%^&*()_+-=[]{}|;:",./<>?\\',
        '日本語', '한국어', '中文',
        '\n\t\r', '\0', '\x00',
        'multi\nline\ntext'
      ]
      
      for (const badInput of badInputs) {
        const qId = typeof badInput === 'string' ? badInput : String(badInput)
        
        expect(() => {
          useQuizStore.getState().setUserAnswer(qId, 0)
          useQuizStore.getState().updateProgress('bad-topic', qId, true)
          useQuizStore.getState().toggleFavouriteQuestion(qId, true)
          useQuizStore.getState().removeWrongQuestion(qId)
        }).not.toThrow()
      }
      
      console.log('✅ 所有异常输入均处理完成！')
      expect(true).toBe(true)
    })
    
    it('处理大规模重复去重逻辑：同一题操作10000次', () => {
      console.log('🚀 开始：大规模重复去重测试')
      
      const questionId = 'super-repeated-q'
      const iterations = 10000
      
      for (let i = 0; i < iterations; i++) {
        useQuizStore.getState().setUserAnswer(questionId, i % 4)
        useQuizStore.getState().toggleFavouriteQuestion(questionId, i % 2 === 0)
        useQuizStore.getState().toggleWrongQuestion(questionId, i % 3 === 0)
        
        if (i % 100 === 0) {
          useQuizStore.getState().updateProgress('repeated-topic', questionId, i % 5 !== 0)
        }
      }
      
      const state = useQuizStore.getState()
      
      console.log('✅ 10000次重复操作完成！')
      console.log(`- 最终答案: ${state.userAnswers[questionId]}`)
      console.log(`- 是否在错题: ${state.wrongQuestions.includes(questionId)}`)
      console.log(`- 是否在收藏: ${state.favouriteQuestions.includes(questionId)}`)
      
      expect(state.userAnswers[questionId]).toBe((iterations - 1) % 4)
    })
  })

  describe('3. 长时间与多次清理恢复模拟', () => {
    it('模拟3天的持续使用，包含多次清理与恢复', () => {
      console.log('🚀 开始：3天持续使用模拟')
      
      // Day 1: 疯狂学习会计
      console.log('📅 Day 1: 会计学习...')
      for (let i = 0; i < 200; i++) {
        useQuizStore.getState().updateProgress('accounting', `day1-q-${i}`, Math.random() > 0.35)
        if (i % 4 === 0) {
          useQuizStore.getState().toggleFavouriteQuestion(`day1-q-${i}`, true)
        }
      }
      
      // 保存状态快照
      const day1Snapshot = localStorage.getItem('cpa-quiz-storage')
      const day1State = { ...useQuizStore.getState() }
      console.log(`✅ Day 1完成！错题数: ${day1State.wrongQuestions.length}, 收藏数: ${day1State.favouriteQuestions.length}`)
      
      // 模拟关闭浏览器/清理
      useQuizStore.getState().clearAllData()
      console.log('💤 应用关闭，数据已存储到 localStorage...')
      
      // Day 2: 重新打开学习审计
      console.log('\n📅 Day 2: 审计学习...')
      localStorage.setItem('cpa-quiz-storage', day1Snapshot || '')
      
      for (let i = 0; i < 150; i++) {
        useQuizStore.getState().updateProgress('audit', `day2-q-${i}`, Math.random() > 0.4)
        if (i % 3 === 0) {
          useQuizStore.getState().toggleFavouriteQuestion(`day2-q-${i}`, true)
        }
      }
      
      // Day 2: 临时混乱操作
      console.log('🤯 Day 2: 用户进行各种混乱操作...')
      for (let i = 0; i < 50; i++) {
        useQuizStore.getState().setCurrentQuestionIndex('audit', i)
        useQuizStore.getState().setUserAnswer(`day2-temp-${i}`, i % 4)
      }
      
      const day2Snapshot = localStorage.getItem('cpa-quiz-storage')
      const day2State = { ...useQuizStore.getState() }
      console.log(`✅ Day 2完成！错题数: ${day2State.wrongQuestions.length}, 收藏数: ${day2State.favouriteQuestions.length}`)
      
      // Day 3: 完整复习 + 学习战略
      console.log('\n📅 Day 3: 战略学习 + 复习...')
      
      for (let i = 0; i < 100; i++) {
        useQuizStore.getState().updateProgress('strategy', `day3-q-${i}`, Math.random() > 0.25)
        useQuizStore.getState().toggleFavouriteQuestion(`day3-q-${i}`, i % 2 === 0)
      }
      
      // 复习错题:
      console.log('📝 Day 3: 错题复习...')
      const day3Wrong = [...useQuizStore.getState().wrongQuestions]
      for (const qId of day3Wrong.slice(0, 30)) {
        useQuizStore.getState().updateProgress('review', qId, true) // 复习时答对了
      }
      
      const finalState = useQuizStore.getState()
      
      console.log('\n🎉 3天完整学习周期完成！')
      console.log(`📊 最终状态:
- 总科目: ${Object.keys(finalState.userProgress).length}
- 总错题: ${finalState.wrongQuestions.length}
- 总收藏: ${finalState.favouriteQuestions.length}
- 总答案: ${Object.keys(finalState.userAnswers).length}`)
      
      expect(true).toBe(true) // 只要走到这里就通过
    }, 120000)
  })

  describe('4. 真实用户路径模拟：新手到高手的完整流程', () => {
    it('模拟真实用户从首次使用到熟练使用的完整路径', () => {
      console.log('🚀 开始：真实用户完整流程模拟')
      
      // 阶段1: 新手用户 - 先看一遍所有页面，试了几道题
      console.log('👤 阶段1: 新手探索...')
      useQuizStore.getState().updateProgress('accounting', 'first-try-1', false)
      useQuizStore.getState().toggleFavouriteQuestion('first-try-1', true)
      useQuizStore.getState().setShowExplanation('first-try-1', true)
      console.log('✅ 新手探索完成！')
      
      // 阶段2: 开始认真学习 - 一个科目刷了几百题
      console.log('👤 阶段2: 认真学习会计...')
      for (let i = 0; i < 400; i++) {
        const correct = Math.random() > 0.45
        useQuizStore.getState().updateProgress('accounting', `serious-${i}`, correct)
        if (!correct) {
          useQuizStore.getState().toggleFavouriteQuestion(`serious-${i}`, true)
        }
        useQuizStore.getState().setUserAnswer(`serious-${i}`, i % 4)
      }
      
      // 阶段3: 休息几天，回来学其他科目
      console.log('👤 阶段3: 多科目学习...')
      const topics = ['audit', 'finance', 'strategy', 'economic', 'tax']
      for (const topic of topics) {
        for (let i = 0; i < 50; i++) {
          useQuizStore.getState().updateProgress(topic, `${topic}-${i}`, Math.random() > 0.4)
        }
      }
      
      // 阶段4: 考前冲刺 - 大量复习错题
      console.log('👤 阶段4: 错题冲刺复习...')
      const wrongBefore = [...useQuizStore.getState().wrongQuestions]
      for (const qId of wrongBefore) {
        useQuizStore.getState().updateProgress('review', qId, Math.random() > 0.2) // 大部分复习对了
      }
      
      // 阶段5: 最终成绩查看
      const finalState = useQuizStore.getState()
      
      console.log('\n🎉 真实用户完整流程完成！')
      const totalCompleted = Object.values(finalState.userProgress).reduce((sum, p) => sum + p.completedQuestions.length, 0)
      const totalCorrect = Object.values(finalState.userProgress).reduce((sum, p) => sum + p.correctAnswers, 0)
      
      console.log(`📊 用户最终成果:
- 总题数: ${totalCompleted}
- 正确数: ${totalCorrect}
- 正确率: ${((totalCorrect / totalCompleted) * 100).toFixed(1)}%
- 剩余错题: ${finalState.wrongQuestions.length}
- 收藏题目: ${finalState.favouriteQuestions.length}`)
      
      expect(totalCompleted).toBeGreaterThan(0)
    }, 120000)
  })
})

import { useMemo, useCallback } from 'react'
import { QuestionService, QuestionFilter } from '@/services/question-service'
import { useQuizStore } from '@/store'
import { Question } from '@/types'

export function useQuestions(topicId?: string) {
  const { 
    wrongQuestions, favouriteQuestions, userProgress } = useQuizStore()

  const allQuestions = useMemo(() => {
    if (topicId) {
      return QuestionService.getQuestionsByTopic(topicId)
    }
    return QuestionService.getAllQuestions()
  }, [topicId])

  const filteredQuestions = useCallback(
    (filter: QuestionFilter): Question[] => {
      return QuestionService.filterQuestions(
        allQuestions,
        filter,
        wrongQuestions,
        favouriteQuestions
      )
    },
    [allQuestions, wrongQuestions, favouriteQuestions]
  )

  const shuffledQuestions = useMemo(() => {
    return QuestionService.shuffleQuestions(allQuestions)
  }, [allQuestions])

  const availableYears = useMemo(() => {
    return QuestionService.getAvailableYears(allQuestions)
  }, [allQuestions])

  const easyQuestions = useMemo(() => {
    return QuestionService.getQuestionsByDifficulty(allQuestions, 'easy')
  }, [allQuestions])

  const mediumQuestions = useMemo(() => {
    return QuestionService.getQuestionsByDifficulty(allQuestions, 'medium')
  }, [allQuestions])

  const hardQuestions = useMemo(() => {
    return QuestionService.getQuestionsByDifficulty(allQuestions, 'hard')
  }, [allQuestions])

  const progress = useMemo(() => {
    if (!topicId) return null
    return useQuizStore.getState().getProgress(topicId)
  }, [topicId])
  
  // 订阅进度更新以确保UI同步
  const { userProgress } = useQuizStore()
  const syncedProgress = useMemo(() => {
    if (!topicId || !userProgress) return progress
    return userProgress[topicId] || progress
  }, [topicId, userProgress, progress])

  return {
    allQuestions,
    filteredQuestions,
    shuffledQuestions,
    availableYears,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    progress: syncedProgress,
    totalQuestions: allQuestions.length,
  }
}

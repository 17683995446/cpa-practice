import { Question, Topic } from '@/types'
import { questions } from '@/data/questions'
import { topics } from '@/data/topics'

export interface QuestionFilter {
  topicId?: string
  difficulty?: ('easy' | 'medium' | 'hard')[]
  year?: number[]
  onlyWrong?: boolean
  onlyFavourites?: boolean
}

export class QuestionService {
  static getAllQuestions(): Question[] {
    return questions
  }

  static getQuestionsByTopic(topicId: string): Question[] {
    return questions.filter(q => q.topicId === topicId)
  }

  static getTopics(): Topic[] {
    return topics
  }

  static getTopicById(topicId: string): Topic | undefined {
    return topics.find(t => t.id === topicId)
  }

  static getQuestionById(id: string): Question | undefined {
    return questions.find(q => q.id === id)
  }

  static filterQuestions(
    allQuestions: Question[],
    filter: QuestionFilter,
    wrongQuestionIds: string[] = [],
    favouriteQuestionIds: string[] = []
  ): Question[] {
    return allQuestions.filter(question => {
      if (filter.topicId && question.topicId !== filter.topicId) {
        return false
      }

      if (filter.difficulty && filter.difficulty.length > 0 && !filter.difficulty.includes(question.difficulty)) {
        return false
      }

      if (filter.year && filter.year.length > 0 && question.year && !filter.year.includes(question.year)) {
        return false
      }

      if (filter.onlyWrong && !wrongQuestionIds.includes(question.id)) {
        return false
      }

      if (filter.onlyFavourites && !favouriteQuestionIds.includes(question.id)) {
        return false
      }

      return true
    })
  }

  static shuffleQuestions(questions: Question[]): Question[] {
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  static getQuestionsByDifficulty(questions: Question[], difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    return questions.filter(q => q.difficulty === difficulty)
  }

  static getAvailableYears(questions: Question[]): number[] {
    const years = new Set<number>()
    questions.forEach(q => {
      if (q.year) {
        years.add(q.year)
      }
    })
    return Array.from(years).sort()
  }

  static getNextQuestionId(
    currentIndex: number,
    questionIds: string[],
    direction: 'next' | 'prev'
  ): { index: number; id: string | null } {
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1

    if (newIndex < 0 || newIndex >= questionIds.length) {
      return { index: currentIndex, id: null }
    }

    return { index: newIndex, id: questionIds[newIndex] }
  }
}

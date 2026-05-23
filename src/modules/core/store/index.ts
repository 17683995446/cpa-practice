import { UserProgress, TopicId, QuestionId, QuizState } from '../types';

export interface QuizStore {
  userProgress: Record<TopicId, UserProgress>;
  currentQuestionIndex: Record<TopicId, number>;
  userAnswers: Record<QuestionId, number | null>;
  showExplanations: Record<QuestionId, boolean>;
  wrongQuestions: QuestionId[];
  favouriteQuestions: QuestionId[];

  updateProgress: (topicId: TopicId, questionId: QuestionId, isCorrect: boolean) => void;
  setCurrentQuestionIndex: (topicId: TopicId, index: number) => void;
  setUserAnswer: (questionId: QuestionId, answer: number | null) => void;
  setShowExplanation: (questionId: QuestionId, show: boolean) => void;
  resetTopicProgress: (topicId: TopicId) => void;
  getProgress: (topicId: TopicId) => UserProgress;
  toggleWrongQuestion: (questionId: QuestionId, isWrong: boolean) => void;
  removeWrongQuestion: (questionId: QuestionId) => void;
  toggleFavouriteQuestion: (questionId: QuestionId, isFavourite: boolean) => void;
  removeFavouriteQuestion: (questionId: QuestionId) => void;
  clearAllData: () => void;
  getState: () => QuizState;
}

export const createInitialState = (): QuizState => ({
  userProgress: {},
  currentQuestionIndex: {},
  userAnswers: {},
  showExplanations: {},
  wrongQuestions: [],
  favouriteQuestions: []
});

export const createInitialProgress = (topicId: TopicId): UserProgress => ({
  topicId,
  completedQuestions: [],
  correctAnswers: 0,
  totalAttempts: 0
});

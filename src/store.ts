import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProgress } from '@/types';

interface QuizStore {
  userProgress: Record<string, UserProgress>;
  currentQuestionIndex: Record<string, number>;
  userAnswers: Record<string, number | null>;
  showExplanations: Record<string, boolean>;
  wrongQuestions: string[];
  favouriteQuestions: string[];
  
  updateProgress: (topicId: string, questionId: string, isCorrect: boolean) => void;
  setCurrentQuestionIndex: (topicId: string, index: number) => void;
  setUserAnswer: (questionId: string, answer: number | null) => void;
  setShowExplanation: (questionId: string, show: boolean) => void;
  resetTopicProgress: (topicId: string) => void;
  getProgress: (topicId: string) => UserProgress;
  toggleWrongQuestion: (questionId: string, isWrong: boolean) => void;
  removeWrongQuestion: (questionId: string) => void;
  toggleFavouriteQuestion: (questionId: string, isFavourite: boolean) => void;
  removeFavouriteQuestion: (questionId: string) => void;
  clearAllData: () => void;
}

// 内部使用 Set 来加速查找，但持久化时转换为数组
interface PersistedQuizStore {
  userProgress: Record<string, UserProgress>;
  currentQuestionIndex: Record<string, number>;
  userAnswers: Record<string, number | null>;
  showExplanations: Record<string, boolean>;
  wrongQuestions: string[];
  favouriteQuestions: string[];
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      userProgress: {},
      currentQuestionIndex: {},
      userAnswers: {},
      showExplanations: {},
      wrongQuestions: [],
      favouriteQuestions: [],
      
      updateProgress: (topicId: string, questionId: string, isCorrect: boolean) => {
        set((state) => {
          const currentProgress = state.userProgress[topicId] || {
            topicId,
            completedQuestions: [],
            correctAnswers: 0,
            totalAttempts: 0
          };
          
          const newCompletedQuestions = currentProgress.completedQuestions.includes(questionId)
            ? currentProgress.completedQuestions
            : [...currentProgress.completedQuestions, questionId];
          
          // 使用 Set 加速查找
          const wrongSet = new Set(state.wrongQuestions);
          let newWrongQuestions: string[];
          
          if (!isCorrect) {
            if (!wrongSet.has(questionId)) {
              newWrongQuestions = [...state.wrongQuestions, questionId];
            } else {
              newWrongQuestions = state.wrongQuestions;
            }
          } else {
            if (wrongSet.has(questionId)) {
              newWrongQuestions = state.wrongQuestions.filter(id => id !== questionId);
            } else {
              newWrongQuestions = state.wrongQuestions;
            }
          }
          
          return {
            userProgress: {
              ...state.userProgress,
              [topicId]: {
                ...currentProgress,
                completedQuestions: newCompletedQuestions,
                correctAnswers: isCorrect 
                  ? currentProgress.correctAnswers + 1 
                  : currentProgress.correctAnswers,
                totalAttempts: currentProgress.totalAttempts + 1
              }
            },
            wrongQuestions: newWrongQuestions
          };
        });
      },
      
      setCurrentQuestionIndex: (topicId: string, index: number) => {
        set((state) => ({
          currentQuestionIndex: {
            ...state.currentQuestionIndex,
            [topicId]: index
          }
        }));
      },
      
      setUserAnswer: (questionId: string, answer: number | null) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: answer
          }
        }));
      },
      
      setShowExplanation: (questionId: string, show: boolean) => {
        set((state) => ({
          showExplanations: {
            ...state.showExplanations,
            [questionId]: show
          }
        }));
      },
      
      resetTopicProgress: (topicId: string) => {
        set((state) => {
          const newProgress = { ...state.userProgress };
          delete newProgress[topicId];
          
          const newIndex = { ...state.currentQuestionIndex };
          delete newIndex[topicId];
          
          const newAnswers = { ...state.userAnswers };
          const newExplanations = { ...state.showExplanations };
          
          Object.keys(newAnswers).forEach((key) => {
            if (key.startsWith(topicId)) {
              delete newAnswers[key];
              delete newExplanations[key];
            }
          });
          
          return {
            userProgress: newProgress,
            currentQuestionIndex: newIndex,
            userAnswers: newAnswers,
            showExplanations: newExplanations
          };
        });
      },
      
      getProgress: (topicId: string) => {
        return get().userProgress[topicId] || {
          topicId,
          completedQuestions: [],
          correctAnswers: 0,
          totalAttempts: 0
        };
      },
      
      toggleWrongQuestion: (questionId: string, isWrong: boolean) => {
        set((state) => {
          const wrongSet = new Set(state.wrongQuestions);
          if (isWrong) {
            if (!wrongSet.has(questionId)) {
              return { wrongQuestions: [...state.wrongQuestions, questionId] };
            }
          } else {
            if (wrongSet.has(questionId)) {
              return { wrongQuestions: state.wrongQuestions.filter(id => id !== questionId) };
            }
          }
          return state;
        });
      },

      removeWrongQuestion: (questionId: string) => {
        set((state) => {
          const wrongSet = new Set(state.wrongQuestions);
          if (!wrongSet.has(questionId)) return state;
          return { wrongQuestions: state.wrongQuestions.filter(id => id !== questionId) };
        });
      },

      toggleFavouriteQuestion: (questionId: string, isFavourite: boolean) => {
        set((state) => {
          const favSet = new Set(state.favouriteQuestions);
          if (isFavourite) {
            if (!favSet.has(questionId)) {
              return { favouriteQuestions: [...state.favouriteQuestions, questionId] };
            }
          } else {
            if (favSet.has(questionId)) {
              return { favouriteQuestions: state.favouriteQuestions.filter(id => id !== questionId) };
            }
          }
          return state;
        });
      },

      removeFavouriteQuestion: (questionId: string) => {
        set((state) => {
          const favSet = new Set(state.favouriteQuestions);
          if (!favSet.has(questionId)) return state;
          return { favouriteQuestions: state.favouriteQuestions.filter(id => id !== questionId) };
        });
      },
      
      clearAllData: () => {
        set(() => ({
          userProgress: {},
          currentQuestionIndex: {},
          userAnswers: {},
          showExplanations: {},
          wrongQuestions: [],
          favouriteQuestions: []
        }));
      }
    }),
    {
      name: 'cpa-quiz-storage'
    }
  )
);

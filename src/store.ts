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
          
          let newWrongQuestions = [...state.wrongQuestions];
          if (!isCorrect && !newWrongQuestions.includes(questionId)) {
            newWrongQuestions.push(questionId);
          } else if (isCorrect) {
            newWrongQuestions = newWrongQuestions.filter(id => id !== questionId);
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
      if (isWrong && !state.wrongQuestions.includes(questionId)) {
        return {
          wrongQuestions: [...state.wrongQuestions, questionId]
        };
      } else if (!isWrong) {
        return {
          wrongQuestions: state.wrongQuestions.filter(id => id !== questionId)
        };
      }
      return state;
    });
  },

  removeWrongQuestion: (questionId: string) => {
    set((state) => ({
      wrongQuestions: state.wrongQuestions.filter(id => id !== questionId)
    }));
  },

  toggleFavouriteQuestion: (questionId: string, isFavourite: boolean) => {
    set((state) => {
      if (isFavourite && !state.favouriteQuestions.includes(questionId)) {
        return {
          favouriteQuestions: [...state.favouriteQuestions, questionId]
        };
      } else if (!isFavourite) {
        return {
          favouriteQuestions: state.favouriteQuestions.filter(id => id !== questionId)
        };
      }
      return state;
    });
  },

  removeFavouriteQuestion: (questionId: string) => {
    set((state) => ({
      favouriteQuestions: state.favouriteQuestions.filter(id => id !== questionId)
    }));
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

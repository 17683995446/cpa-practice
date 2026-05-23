export interface UserProgress {
  topicId: string;
  completedQuestions: string[];
  correctAnswers: number;
  totalAttempts: number;
}

export interface Question {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number;
  chapter: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  questionCount: number;
  description: string;
}

export interface QuizState {
  userProgress: Record<string, UserProgress>;
  currentQuestionIndex: Record<string, number>;
  userAnswers: Record<string, number | null>;
  showExplanations: Record<string, boolean>;
  wrongQuestions: string[];
  favouriteQuestions: string[];
}

export type Difficulty = Question['difficulty'];

export type TopicId = string;
export type QuestionId = string;

export interface ProgressStats {
  totalQuestions: number;
  completedQuestions: number;
  correctAnswers: number;
  accuracy: number;
  topicsCompleted: number;
  totalAttempts?: number;
}

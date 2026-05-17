
export interface Question {
  id: string;
  topicId: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  memoryTip: string;
  year?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  icon: string;
}

export interface UserProgress {
  topicId: string;
  completedQuestions: string[];
  correctAnswers: number;
  totalAttempts: number;
}

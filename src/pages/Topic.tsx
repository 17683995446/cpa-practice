import { useParams, Link } from 'react-router-dom';
import { topics } from '@/data/topics';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizStore } from '@/store';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

export default function Topic() {
  const { id } = useParams<{ id: string }>();
  const topic = topics.find(t => t.id === id);
  const questions = id ? getQuestionsByTopic(id) : [];
  const { userProgress, currentQuestionIndex, userAnswers, resetTopicProgress } = useQuizStore();
  
  if (!topic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">科目不存在</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">返回首页</Link>
        </div>
      </div>
    );
  }
  
  const progress = userProgress[id] || { completedQuestions: [], correctAnswers: 0, totalAttempts: 0 };
  const currentIndex = currentQuestionIndex[id] || 0;
  const startIndex = Math.min(currentIndex, questions.length - 1);
  
  const handleReset = () => {
    if (confirm('确定要重置此科目进度吗？')) {
      resetTopicProgress(id);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>
          
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-5xl mb-4">{topic.icon}</div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{topic.name}</h1>
                <p className="text-slate-600">{topic.description}</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置进度
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">学习进度</span>
                <span className="text-sm font-semibold text-blue-600">
                  {progress.completedQuestions.length} / {topic.questionCount}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(progress.completedQuestions.length / topic.questionCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <Link
            to={`/quiz/${id}/${startIndex}`}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            {progress.completedQuestions.length > 0 ? '继续刷题' : '开始刷题'}
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">题目列表</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {questions.map((question, index) => {
              const isCompleted = progress.completedQuestions.includes(question.id);
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              const iconClass = isCompleted 
                ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                : 'bg-slate-100 text-slate-600';
              
              const difficultyClass = question.difficulty === 'easy' 
                ? 'bg-green-100 text-green-700' 
                : question.difficulty === 'medium' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-red-100 text-red-700';
              
              const difficultyText = question.difficulty === 'easy' 
                ? '简单' 
                : question.difficulty === 'medium' 
                  ? '中等' 
                  : '困难';
              
              return (
                <Link
                  key={question.id}
                  to={`/quiz/${id}/${index}`}
                  className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${iconClass}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium line-clamp-1">{question.content}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyClass}`}>
                          {difficultyText}
                        </span>
                        {question.year && (
                          <span className="text-xs text-slate-500">{question.year}年</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {isCompleted ? (
                      isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

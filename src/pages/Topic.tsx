import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { topics } from '@/data/topics';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizStore } from '@/store';
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 50;

export default function Topic() {
  const { id } = useParams<{ id: string }>();
  const topic = topics.find(t => t.id === id);
  const questions = id ? getQuestionsByTopic(id) : [];
  const { userProgress, currentQuestionIndex, userAnswers, resetTopicProgress } = useQuizStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, questions.length);
  const currentQuestions = questions.slice(startIndex, endIndex);
  
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
  const currentQuestionIdx = currentQuestionIndex[id] || 0;
  const startQuizIndex = Math.min(currentQuestionIdx, questions.length - 1);
  
  const handleReset = () => {
    if (confirm('确定要重置此科目进度吗？')) {
      resetTopicProgress(id);
    }
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            to={`/quiz/${id}/${startQuizIndex}`}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            {progress.completedQuestions.length > 0 ? '继续刷题' : '开始刷题'}
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">题目列表</h2>
            <span className="text-sm text-slate-500">
              第 {startIndex + 1}-{endIndex} 题 / 共 {questions.length} 题
            </span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {currentQuestions.map((question, index) => {
              const globalIndex = startIndex + index;
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
                  to={`/quiz/${id}/${globalIndex}`}
                  className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${iconClass}`}>
                      {globalIndex + 1}
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
          
          {totalPages > 1 && (
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                上一页
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-slate-400">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

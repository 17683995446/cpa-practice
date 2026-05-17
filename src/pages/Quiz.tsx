import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { topics } from '@/data/topics';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizStore } from '@/store';
import { ArrowLeft, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Quiz() {
  const { topicId, index } = useParams<{ topicId: string; index: string }>();
  const navigate = useNavigate();
  const topic = topics.find(t => t.id === topicId);
  const questions = topicId ? getQuestionsByTopic(topicId) : [];
  const questionIndex = parseInt(index || '0', 10);
  const question = questions[questionIndex];
  
  const {
    userAnswers,
    showExplanations,
    setUserAnswer,
    setShowExplanation,
    updateProgress,
    setCurrentQuestionIndex
  } = useQuizStore();
  
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const userAnswer = userAnswers[question?.id || ''];
  const showExplanation = showExplanations[question?.id || ''] || false;
  
  useEffect(() => {
    if (topicId) {
      setCurrentQuestionIndex(topicId, questionIndex);
    }
  }, [topicId, questionIndex, setCurrentQuestionIndex]);
  
  if (!topic || !question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">题目不存在</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">返回首页</Link>
        </div>
      </div>
    );
  }
  
  const isCorrect = userAnswer === question.correctAnswer;
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!hasSubmitted) {
      setUserAnswer(question.id, optionIndex);
    }
  };
  
  const handleSubmit = () => {
    if (userAnswer !== null && !hasSubmitted) {
      setHasSubmitted(true);
      setShowExplanation(question.id, true);
      updateProgress(topicId, question.id, isCorrect);
    }
  };
  
  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      navigate(`/quiz/${topicId}/${questionIndex + 1}`);
      setHasSubmitted(false);
    } else {
      navigate(`/results/${topicId}`);
    }
  };
  
  const handlePrev = () => {
    if (questionIndex > 0) {
      navigate(`/quiz/${topicId}/${questionIndex - 1}`);
      setHasSubmitted(false);
    }
  };
  
  const handleViewResults = () => {
    navigate(`/results/${topicId}`);
  };
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            to={`/topic/${topicId}`} 
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回{topic.name}
          </Link>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-slate-800">{topic.name}</h1>
              <span className="text-slate-600 font-medium">
                第 {questionIndex + 1} 题 / 共 {questions.length} 题
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${difficultyClass}`}>
                {difficultyText}
              </span>
              {question.year && (
                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {question.year}年
                </span>
              )}
            </div>
            <p className="text-lg text-slate-800 leading-relaxed">{question.content}</p>
          </div>
          
          <div className="p-8 space-y-4">
            {question.options.map((option, optionIndex) => {
              const isSelected = userAnswer === optionIndex;
              const isCorrectOption = optionIndex === question.correctAnswer;
              const showResult = hasSubmitted || showExplanation;
              
              let optionStyle = '';
              if (showResult) {
                if (isCorrectOption) {
                  optionStyle = 'border-2 border-green-500 bg-green-50';
                } else if (isSelected) {
                  optionStyle = 'border-2 border-red-500 bg-red-50';
                } else {
                  optionStyle = 'border border-slate-200 bg-slate-50 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'border-2 border-blue-500 bg-blue-50';
              } else {
                optionStyle = 'border border-slate-200 hover:border-blue-300 hover:bg-blue-50';
              }
              
              const iconClass = showResult 
                ? (isCorrectOption 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : isSelected 
                    ? 'border-red-500 bg-red-500 text-white' 
                    : 'border-slate-300 bg-slate-100 text-slate-500')
                : (isSelected 
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : 'border-slate-300 bg-white text-slate-700');
              
              return (
                <button
                  key={optionIndex}
                  onClick={() => handleOptionSelect(optionIndex)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-6 rounded-xl text-left transition-all duration-200 flex items-start space-x-4",
                    optionStyle,
                    !showResult && "cursor-pointer hover:shadow-md",
                    showResult && "cursor-default"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 border-2",
                    iconClass
                  )}>
                    {showResult ? (
                      isCorrectOption ? <CheckCircle2 className="w-5 h-5" /> :
                      isSelected ? <XCircle className="w-5 h-5" /> :
                      String.fromCharCode(65 + optionIndex)
                    ) : (
                      String.fromCharCode(65 + optionIndex)
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className={cn(
                      "text-base leading-relaxed",
                      showResult && isCorrectOption ? "text-green-800 font-semibold" :
                      showResult && isSelected ? "text-red-800 font-semibold" :
                      "text-slate-700"
                    )}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-8 border-t border-slate-200 bg-slate-50">
            {!hasSubmitted && !showExplanation ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={questionIndex === 0}
                  className={cn(
                    "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200",
                    questionIndex === 0 
                      ? "text-slate-400 cursor-not-allowed" 
                      : "text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  上一题
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={userAnswer === null}
                  className={cn(
                    "flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200",
                    userAnswer === null 
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                  )}
                >
                  提交答案
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={questionIndex === 0}
                  className={cn(
                    "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200",
                    questionIndex === 0 
                      ? "text-slate-400 cursor-not-allowed" 
                      : "text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  上一题
                </button>
                {questionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    下一题
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleViewResults}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    查看成绩
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {showExplanation && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3" />
                    恭喜，回答正确！
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500 mr-3" />
                    很遗憾，回答错误
                  </>
                )}
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">答案解析</h3>
                <div className="bg-slate-50 rounded-xl p-6 text-slate-700 leading-relaxed">
                  {question.explanation}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">记忆技巧</h3>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-amber-800 leading-relaxed">
                  {question.memoryTip}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

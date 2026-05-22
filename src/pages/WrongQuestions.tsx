import { Link } from 'react-router-dom';
import { useQuizStore } from '@/store';
import { getWrongQuestions, getQuestionIndexInTopic } from '@/services/questionUtils';
import { ArrowLeft, XCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { topics } from '@/data/topics';

export default function WrongQuestions() {
  const { wrongQuestions, userAnswers, removeWrongQuestion } = useQuizStore();
  const wrongQuestionsList = getWrongQuestions(wrongQuestions);

  const handleRemove = (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要从错题本中移除此题吗？')) {
      removeWrongQuestion(questionId);
    }
  };

  const getTopicById = (topicId: string) => {
    return topics.find(t => t.id === topicId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">错题本</h1>
                    <p className="text-slate-600 mt-2">重点复习错题，提升学习效果</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-3xl font-bold text-red-600">{wrongQuestions.length}</div>
                    <div className="text-slate-600">错题数量</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {wrongQuestionsList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xl border border-slate-100">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">太棒了！</h2>
            <p className="text-slate-600 mb-8">目前没有错题，继续保持！</p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              开始练习
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wrongQuestionsList.map((question) => {
              const topic = getTopicById(question.topicId);
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const questionIndex = getQuestionIndexInTopic(question.id);
              
              return (
                <Link
                  key={question.id}
                  to={`/quiz/${question.topicId}/${questionIndex}`}
                  className="block bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          {topic?.name || '未知科目'}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty === 'easy' ? '简单' :
                           question.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                        {question.year && (
                          <span className="text-sm text-slate-500">
                            {question.year}年
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-800 font-medium mb-4">{question.content}</p>
                      
                      {userAnswer !== null && (
                        <div className="text-sm">
                          <span className="text-slate-600">你的答案：</span>
                          <span className="text-red-700 font-semibold">
                            {String.fromCharCode(65 + userAnswer)}
                          </span>
                          <span className="text-slate-600 ml-4">正确答案：</span>
                          <span className="text-green-700 font-semibold">
                            {String.fromCharCode(65 + question.correctAnswer)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleRemove(e, question.id)}
                      className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

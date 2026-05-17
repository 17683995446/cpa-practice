import { useParams, Link } from 'react-router-dom';
import { topics } from '@/data/topics';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizStore } from '@/store';
import { ArrowLeft, Trophy, CheckCircle2, XCircle, RotateCcw, Target } from 'lucide-react';

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const topic = topics.find(t => t.id === id);
  const questions = id ? getQuestionsByTopic(id) : [];
  const { userProgress, userAnswers, resetTopicProgress } = useQuizStore();
  
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
  const accuracy = progress.totalAttempts > 0 ? Math.round((progress.correctAnswers / progress.totalAttempts) * 100) : 0;
  
  const getGrade = () => {
    if (accuracy >= 80) return { text: '优秀！', color: 'text-green-600', bg: 'bg-green-50' };
    if (accuracy >= 60) return { text: '良好！', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (accuracy >= 40) return { text: '继续加油！', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { text: '需要加强！', color: 'text-red-600', bg: 'bg-red-50' };
  };
  
  const grade = getGrade();
  
  const handleReset = () => {
    if (confirm('确定要重置此科目进度吗？')) {
      resetTopicProgress(id);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link 
            to={`/topic/${id}`} 
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回{topic.name}
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-12 text-center text-white">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-amber-300" />
            <h1 className="text-4xl font-bold mb-2">{topic.name} 学习报告</h1>
            <p className="text-blue-100">完成情况统计</p>
          </div>
          
          <div className="p-8 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-slate-50">
                <div className="text-4xl font-bold text-slate-800 mb-2">{progress.completedQuestions.length}</div>
                <div className="text-slate-600">已完成题目</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-slate-50">
                <div className="text-4xl font-bold text-slate-800 mb-2">{accuracy}%</div>
                <div className="text-slate-600">正确率</div>
              </div>
              <div className="text-center p-6 rounded-xl bg-slate-50">
                <div className="text-4xl font-bold text-slate-800 mb-2">{topic.questionCount}</div>
                <div className="text-slate-600">总题数</div>
              </div>
            </div>
          </div>
          
          <div className="p-8 border-b border-slate-200">
            <div className={`${grade.bg} rounded-xl p-8 text-center`}>
              <Target className={`w-12 h-12 mx-auto mb-4 ${grade.color}`} />
              <h2 className={`text-3xl font-bold mb-2 ${grade.color}`}>{grade.text}</h2>
              <p className="text-slate-600">
                {accuracy >= 80 
                  ? '太棒了！继续保持这个优秀的状态！' 
                  : accuracy >= 60 
                    ? '很不错！再接再厉，争取更好的成绩！' 
                    : accuracy >= 40 
                      ? '还需要多加练习，相信你可以做得更好！' 
                      : '建议重新学习知识点，然后再尝试一次！'}
              </p>
            </div>
          </div>
          
          {progress.completedQuestions.length > 0 && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">答题详情</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.filter(q => progress.completedQuestions.includes(q.id)).map((question) => {
                  const userAnswer = userAnswers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const questionIndex = questions.findIndex(q => q.id === question.id);
                  
                  return (
                    <Link
                      key={question.id}
                      to={`/quiz/${id}/${questionIndex}`}
                      className="flex items-start space-x-4 p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium line-clamp-2">{question.content}</p>
                        <div className="mt-2 text-sm">
                          <span className="text-slate-600">你的答案：</span>
                          <span className={isCorrect ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                            {userAnswer !== null ? String.fromCharCode(65 + userAnswer) : '未作答'}
                          </span>
                          {!isCorrect && (
                            <>
                              <span className="text-slate-600 ml-4">正确答案：</span>
                              <span className="text-green-700 font-semibold">
                                {String.fromCharCode(65 + question.correctAnswer)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/quiz/${id}/0`}
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              重新开始
            </Link>
            <button
              onClick={handleReset}
              className="flex items-center justify-center px-8 py-4 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              清除进度
            </button>
            <Link
              to="/"
              className="flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

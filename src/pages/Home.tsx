import { Link } from 'react-router-dom';
import { topics } from '@/data/topics';
import { questions } from '@/data/questions';
import { useQuizStore } from '@/store';
import { BookOpen, CheckCircle2, TrendingUp, FileCode, ChevronRight, XCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { userProgress, wrongQuestions, favouriteQuestions } = useQuizStore();

  const totalQuestions = questions.length;
  const totalCompleted = Object.values(userProgress).reduce(
    (sum, p) => sum + p.completedQuestions.length,
    0
  );
  const totalCorrect = Object.values(userProgress).reduce(
    (sum, p) => sum + p.correctAnswers,
    0
  );
  const totalAttempts = Object.values(userProgress).reduce(
    (sum, p) => sum + p.totalAttempts,
    0
  );
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-800 mb-4">CPA 刷题神器</h1>
          <p className="text-xl text-slate-600">海量真题，AI解析，高效备考</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">总题量</p>
                <p className="text-3xl font-bold text-slate-800">{totalQuestions.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">已完成</p>
                <p className="text-3xl font-bold text-slate-800">{totalCompleted.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">正确率</p>
                <p className="text-3xl font-bold text-slate-800">{accuracy}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/wrong-questions"
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-red-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-200 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">错题本</h3>
                  <p className="text-slate-600 text-sm">重点复习错题</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600">{wrongQuestions.length}</div>
                <div className="text-slate-600 text-sm">题目</div>
              </div>
            </div>
          </Link>
          <Link
            to="/favourite-questions"
            className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-200 rounded-xl">
                  <Star className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">收藏夹</h3>
                  <p className="text-slate-600 text-sm">收藏重点题目</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-600">{favouriteQuestions.length}</div>
                <div className="text-slate-600 text-sm">题目</div>
              </div>
            </div>
          </Link>
          <Link
            to="/docs"
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-200 rounded-xl">
                  <FileCode className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">技术文档</h3>
                  <p className="text-slate-600 text-sm">查看系统架构</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-blue-700" />
            </div>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">选择科目</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const progress = userProgress[topic.id];
            const completedCount = progress?.completedQuestions.length || 0;
            const progressPercent = Math.round((completedCount / topic.questionCount) * 100);

            return (
              <Link
                key={topic.id}
                to={`/topic/${topic.id}`}
                className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{topic.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{topic.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{topic.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {completedCount.toLocaleString()} / {topic.questionCount.toLocaleString()}
                    </span>
                    <span className="font-semibold text-blue-600">{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center text-slate-500 text-sm mt-12">
          <p>祝您CPA考试顺利通过！</p>
        </div>
      </div>
    </div>
  );
}
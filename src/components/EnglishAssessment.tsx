import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Shield, Sword, Trophy, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_ordering' | 'translation' | 'error_correction';
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

interface QuestionFeedback {
  id: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface AssessmentFeedback {
  questionFeedbacks: QuestionFeedback[];
  totalScore: number;
  cefrLevel: string;
  cefrDescription: string;
  suggestions: string;
  encouragement: string;
}

type Phase = 'intro' | 'quiz' | 'analyzing' | 'result';

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-gray-400 text-white',
  A2: 'bg-blue-400 text-white',
  B1: 'bg-green-500 text-white',
  B2: 'bg-yellow-500 text-black',
  C1: 'bg-orange-500 text-white',
  C2: 'bg-red-600 text-white',
};

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: '选择题',
  fill_blank: '填空题',
  sentence_ordering: '句子排序',
  translation: '中译英',
  error_correction: '改错题',
};

export default function EnglishAssessment({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState(1);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<AssessmentFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  // For sentence ordering: track word tokens added to answer
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  const currentQuestion = questions[currentIndex];

  const startAssessment = async () => {
    setError(null);
    setPhase('analyzing');
    try {
      const res = await fetch('/api/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error('生成题目失败');
      const data: AssessmentQuestion[] = await res.json();
      setQuestions(data);
      setUserAnswers({});
      setCurrentIndex(0);
      setOrderedWords([]);
      setPhase('quiz');
    } catch (e) {
      setError('生成题目失败，请检查网络或 AI 服务状态后重试。');
      setPhase('intro');
    }
  };

  const submitAssessment = async () => {
    setPhase('analyzing');
    setError(null);
    try {
      const res = await fetch('/api/assessment/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, userAnswers }),
      });
      if (!res.ok) throw new Error('获取反馈失败');
      const data: AssessmentFeedback = await res.json();
      setFeedback(data);
      setPhase('result');
    } catch (e) {
      setError('获取 AI 反馈失败，请重试。');
      setPhase('quiz');
    }
  };

  const resetAssessment = () => {
    setPhase('intro');
    setQuestions([]);
    setUserAnswers({});
    setFeedback(null);
    setCurrentIndex(0);
    setOrderedWords([]);
    setError(null);
  };

  const handleAnswerChange = (value: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setOrderedWords([]);
      // Pre-populate orderedWords if returning to an ordering question with existing answer
    } else {
      submitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setOrderedWords([]);
    }
  };

  const currentAnswer = currentQuestion ? (userAnswers[currentQuestion.id] ?? '') : '';
  const hasAnswer = currentAnswer.trim().length > 0;

  // Sentence ordering helpers
  const getShuffledWords = (question: string) =>
    question.split(',').map(w => w.trim()).filter(Boolean);

  const addWordToken = (word: string) => {
    const newWords = [...orderedWords, word];
    setOrderedWords(newWords);
    handleAnswerChange(newWords.join(' '));
  };

  const removeLastWord = () => {
    const newWords = orderedWords.slice(0, -1);
    setOrderedWords(newWords);
    handleAnswerChange(newWords.join(' '));
  };

  // ---- INTRO PHASE ----
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
        <button onClick={onBack} className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl mb-6">
          <ArrowLeft className="w-5 h-5" /> 返回大厅
        </button>
        <div className="mc-panel p-6 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10">
            <Shield className="w-48 h-48" />
          </div>
          <h1 className="text-3xl font-pixel text-gray-900 mb-2 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">
            ⚔️ BOSS战 - 英语测评
          </h1>
          <p className="text-gray-700 font-bold text-lg mb-4">挑战终极 BOSS，检验你的英语实力！</p>
          <div className="bg-black/10 border-2 border-black/20 p-4 mb-4 space-y-2">
            <p className="font-pixel text-gray-800">📋 题型说明：</p>
            <ul className="text-gray-700 font-bold space-y-1 ml-4">
              <li>✦ 选择题（2 题）- 词汇与语法</li>
              <li>✦ 填空题（2 题）- Minecraft 主题填空</li>
              <li>✦ 句子排序（2 题）- 组成正确句子</li>
              <li>✦ 中译英（2 题）- 翻译中文短句</li>
              <li>✦ 改错题（2 题）- 找出语法错误</li>
            </ul>
          </div>
          <p className="text-gray-600 font-bold">⏱ 预计用时：约 10 分钟 &nbsp;|&nbsp; 共 10 题</p>
        </div>

        <div className="mc-panel p-6 mb-6">
          <p className="font-pixel text-xl text-gray-800 mb-4">选择难度：</p>
          <div className="flex gap-4">
            {[
              { value: 1, label: '初级', sub: 'A1-A2', color: 'mc-btn-green' },
              { value: 2, label: '中级', sub: 'B1',    color: 'mc-btn-blue' },
              { value: 3, label: '高级', sub: 'B2',    color: 'mc-btn-red'  },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`mc-btn ${opt.color} flex-1 py-4 font-pixel text-xl flex flex-col items-center gap-1 ${difficulty === opt.value ? 'ring-4 ring-yellow-400' : ''}`}
              >
                <span>{opt.label}</span>
                <span className="text-sm opacity-80">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mc-panel p-4 mb-4 border-red-500 bg-red-100 text-red-700 font-bold">
            ❌ {error}
          </div>
        )}

        <button
          onClick={startAssessment}
          className="mc-btn mc-btn-red w-full py-5 font-pixel text-2xl flex items-center justify-center gap-3"
        >
          <Sword className="w-6 h-6" /> 开始 BOSS 战！
        </button>
      </div>
    );
  }

  // ---- ANALYZING PHASE ----
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 font-sans">
        <Loader2 className="w-16 h-16 animate-spin text-gray-800" />
        <p className="font-pixel text-2xl text-gray-800 animate-pulse">Steve 正在分析你的战报...</p>
        <p className="font-pixel text-lg text-gray-600">AI 正在生成题目，请稍后</p>
      </div>
    );
  }

  // ---- QUIZ PHASE ----
  if (phase === 'quiz' && currentQuestion) {
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const shuffledWords = currentQuestion.type === 'sentence_ordering'
      ? getShuffledWords(currentQuestion.question)
      : [];

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="mc-btn mc-panel px-3 py-2 flex items-center gap-1 font-pixel text-lg">
            <ArrowLeft className="w-4 h-4" /> 退出
          </button>
          <span className="font-pixel text-xl text-gray-800">
            第 {currentIndex + 1} / {questions.length} 题
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 border-2 border-black h-5 p-0.5 mb-6">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="mc-panel p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-pixel text-lg bg-gray-700 text-white px-2 py-0.5">
              {TYPE_LABELS[currentQuestion.type]}
            </span>
          </div>

          <p className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">{currentQuestion.question}</p>

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerChange(opt)}
                  className={`mc-btn text-left px-4 py-3 font-bold text-lg border-4 border-black transition-all
                    ${currentAnswer === opt
                      ? 'bg-yellow-400 border-yellow-600'
                      : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          )}

          {/* Fill in the Blank */}
          {currentQuestion.type === 'fill_blank' && (
            <input
              type="text"
              value={currentAnswer}
              onChange={e => handleAnswerChange(e.target.value)}
              placeholder="在此输入答案..."
              className="w-full border-4 border-black bg-white p-3 font-bold text-xl focus:outline-none focus:border-yellow-500"
            />
          )}

          {/* Sentence Ordering */}
          {currentQuestion.type === 'sentence_ordering' && (
            <div>
              <p className="font-pixel text-gray-600 mb-2">点击单词按顺序组成句子：</p>
              <div className="min-h-14 bg-white border-4 border-black p-3 mb-4 flex flex-wrap gap-2">
                {orderedWords.map((w, i) => (
                  <span key={i} className="bg-yellow-300 border-2 border-yellow-600 px-2 py-1 font-bold">{w}</span>
                ))}
                {orderedWords.length === 0 && (
                  <span className="text-gray-400 font-bold">（点击下方单词添加）</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {shuffledWords.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => addWordToken(w)}
                    className="mc-btn bg-gray-200 border-4 border-black px-3 py-1 font-bold text-lg hover:bg-gray-300"
                  >
                    {w}
                  </button>
                ))}
              </div>
              <button
                onClick={removeLastWord}
                disabled={orderedWords.length === 0}
                className="mc-btn mc-btn-red px-4 py-2 font-pixel text-lg disabled:opacity-40"
              >
                ← 撤销最后一词
              </button>
            </div>
          )}

          {/* Translation */}
          {currentQuestion.type === 'translation' && (
            <textarea
              value={currentAnswer}
              onChange={e => handleAnswerChange(e.target.value)}
              placeholder="在此输入英文翻译..."
              rows={3}
              className="w-full border-4 border-black bg-white p-3 font-bold text-xl focus:outline-none focus:border-yellow-500 resize-none"
            />
          )}

          {/* Error Correction */}
          {currentQuestion.type === 'error_correction' && (
            <div>
              {currentQuestion.hint && (
                <p className="text-gray-600 font-bold mb-3 text-sm">💡 提示：{currentQuestion.hint}</p>
              )}
              <input
                type="text"
                value={currentAnswer}
                onChange={e => handleAnswerChange(e.target.value)}
                placeholder="输入改正后的句子..."
                className="w-full border-4 border-black bg-white p-3 font-bold text-xl focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mc-panel p-4 mb-4 bg-red-100 text-red-700 font-bold">
            ❌ {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentIndex > 0 && (
            <button onClick={handlePrev} className="mc-btn mc-panel px-5 py-3 font-pixel text-xl flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> 上一题
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className={`mc-btn flex-1 py-3 font-pixel text-xl flex items-center justify-center gap-2
              ${hasAnswer ? 'mc-btn-green' : 'bg-gray-400 border-4 border-gray-500 text-white opacity-60 cursor-not-allowed'}`}
          >
            {currentIndex === questions.length - 1 ? (
              <><Trophy className="w-5 h-5" /> 提交答卷</>
            ) : (
              <>下一题 <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULT PHASE ----
  if (phase === 'result' && feedback) {
    const cefrColor = CEFR_COLORS[feedback.cefrLevel] ?? 'bg-gray-500 text-white';
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
        {/* Score Header */}
        <div className="mc-panel p-6 mb-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10">
            <Trophy className="w-48 h-48" />
          </div>
          <h1 className="text-3xl font-pixel text-gray-900 mb-2">测评结果</h1>
          <div className="text-7xl font-pixel text-gray-900 drop-shadow-[4px_4px_0_rgba(0,0,0,0.3)] my-4">
            {feedback.totalScore} <span className="text-4xl">/ 100</span>
          </div>
          <span className={`font-pixel text-2xl px-4 py-2 border-4 border-black inline-block ${cefrColor}`}>
            {feedback.cefrLevel}
          </span>
          <p className="text-gray-700 font-bold mt-3">{feedback.cefrDescription}</p>
        </div>

        {/* Encouragement */}
        <div className="mc-panel p-4 mb-6 bg-yellow-100 border-yellow-500">
          <p className="font-pixel text-lg text-gray-800">⚔️ {feedback.encouragement}</p>
        </div>

        {/* Per-Question Feedback */}
        <div className="space-y-4 mb-6">
          <h2 className="font-pixel text-2xl text-gray-900">逐题解析</h2>
          {feedback.questionFeedbacks.map((qf, i) => {
            const q = questions.find(q => q.id === qf.id);
            return (
              <div key={qf.id} className="mc-panel p-4">
                <div className="flex items-start gap-3 mb-2">
                  {qf.isCorrect
                    ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      第 {i + 1} 题（{q ? TYPE_LABELS[q.type] : ''}）
                    </p>
                    <p className="text-gray-700 font-bold mb-1">{q?.question}</p>
                  </div>
                </div>
                <div className="ml-9 space-y-1">
                  <p className="text-sm font-bold">
                    你的答案：
                    <span className={qf.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {qf.userAnswer || '（未作答）'}
                    </span>
                  </p>
                  {!qf.isCorrect && (
                    <p className="text-sm font-bold text-gray-700">
                      正确答案：<span className="text-green-700">{qf.correctAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 font-bold mt-1">📖 {qf.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestions */}
        <div className="mc-panel p-4 mb-6">
          <h2 className="font-pixel text-xl text-gray-900 mb-2">📚 个性化学习建议</h2>
          <p className="text-gray-700 font-bold leading-relaxed">{feedback.suggestions}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={resetAssessment}
            className="mc-btn mc-btn-green flex-1 py-4 font-pixel text-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> 再战一次
          </button>
          <button
            onClick={onBack}
            className="mc-btn mc-panel flex-1 py-4 font-pixel text-xl flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> 返回大厅
          </button>
        </div>
      </div>
    );
  }

  return null;
}

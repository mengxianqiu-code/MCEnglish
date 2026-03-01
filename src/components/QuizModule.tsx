import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Volume2, HelpCircle, Sword, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  type: 'multiple_choice' | 'fill_blank' | 'listening';
}

export default function QuizModule({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quiz')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setIsLoading(false);
      });
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.correct_answer) {
      setScore(score + 1);
      triggerConfetti();
      playSound('xp');
    } else {
      playSound('damage');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score === questions.length) {
        triggerConfetti();
      }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const playSound = (type: 'xp' | 'damage') => {
    // In a real app, we would play audio files here
    // const audio = new Audio(`/sounds/${type}.mp3`);
    // audio.play();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-pixel text-2xl">
        加载试炼中...
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans p-4">
        <div className="mc-panel p-8 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>
          
          <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-6 drop-shadow-lg" />
          
          <h2 className="text-4xl font-pixel text-gray-900 mb-4">试炼完成!</h2>
          
          <div className="text-6xl font-bold text-gray-800 mb-2">{score} / {questions.length}</div>
          <p className="text-gray-600 mb-8 font-pixel text-xl">
            {score === questions.length ? "完美通关！获得大师级称号！" : 
             score > questions.length / 2 ? "表现不错！继续加油！" : "还需要多加练习哦！"}
          </p>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={onBack}
              className="mc-btn mc-panel px-6 py-3 font-pixel text-xl"
            >
              返回大厅
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="mc-btn mc-btn-green px-6 py-3 font-pixel text-xl"
            >
              再次挑战
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl"
          >
            <ArrowLeft className="w-5 h-5" /> 放弃挑战
          </button>
          <div className="font-pixel text-2xl text-gray-800">
            问题 {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <div className="mc-panel p-8 min-h-[400px] flex flex-col relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-300">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-pixel text-sm border-2 border-blue-300">
                {currentQuestion.type === 'multiple_choice' ? '选择题' : 
                 currentQuestion.type === 'fill_blank' ? '填空题' : '听力题'}
              </span>
              {currentQuestion.type === 'listening' && (
                <button onClick={() => speak(currentQuestion.correct_answer)} className="mc-btn p-2 bg-yellow-200 border-yellow-400">
                  <Volume2 className="w-5 h-5" /> 播放读音
                </button>
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                let btnClass = "mc-panel p-4 text-xl font-bold text-left hover:bg-gray-100 transition-colors flex justify-between items-center";
                if (isAnswered) {
                  if (option === currentQuestion.correct_answer) {
                    btnClass = "mc-panel p-4 text-xl font-bold text-left bg-green-100 border-green-500 text-green-800";
                  } else if (option === selectedOption) {
                    btnClass = "mc-panel p-4 text-xl font-bold text-left bg-red-100 border-red-500 text-red-800";
                  } else {
                    btnClass += " opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span>{option}</span>
                    {isAnswered && option === currentQuestion.correct_answer && <CheckCircle className="w-6 h-6 text-green-600" />}
                    {isAnswered && option === selectedOption && option !== currentQuestion.correct_answer && <XCircle className="w-6 h-6 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback Section */}
            {isAnswered && (
              <div className={`mt-8 p-4 border-l-4 ${selectedOption === currentQuestion.correct_answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} animate-in fade-in slide-in-from-bottom-4`}>
                <div className="flex items-start gap-3">
                  {selectedOption === currentQuestion.correct_answer ? (
                    <Shield className="w-6 h-6 text-green-600 mt-1" />
                  ) : (
                    <Sword className="w-6 h-6 text-red-600 mt-1" />
                  )}
                  <div>
                    <h3 className={`font-pixel text-lg mb-1 ${selectedOption === currentQuestion.correct_answer ? 'text-green-800' : 'text-red-800'}`}>
                      {selectedOption === currentQuestion.correct_answer ? '回答正确！+1 XP' : '回答错误！受到伤害！'}
                    </h3>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext}
                className="mc-btn mc-btn-blue px-8 py-3 font-pixel text-xl flex items-center gap-2"
              >
                {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

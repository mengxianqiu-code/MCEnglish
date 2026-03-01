import React, { useState, useEffect } from 'react';
import { generateMinecraftSentence } from '../lib/gemini';
import { Pickaxe, ArrowLeft, Sparkles, Sword, Loader2, Volume2, Box, Check } from 'lucide-react';

interface Word {
  id: number;
  word: string;
  meaning: string;
}

export default function VocabularyChallenge({ packId, onBack }: { packId: number, onBack: () => void }) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [aiData, setAiData] = useState<{ sentence: string; translation: string } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch words for this pack
  useEffect(() => {
    fetch(`/api/packs/${packId}/words`)
      .then(res => res.json())
      .then(data => {
        setWords(data);
        setIsLoadingWords(false);
      })
      .catch(err => {
        console.error("Failed to fetch words", err);
        setIsLoadingWords(false);
      });
  }, [packId]);

  const currentWord = words[currentIndex];

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveWord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/user/saved-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentWord.word, meaning: currentWord.meaning })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save word', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSentence = async () => {
      if (!currentWord) return;
      setIsLoadingAi(true);
      setAiData(null);
      const data = await generateMinecraftSentence(currentWord.word);
      if (isMounted && data) {
        setAiData(data);
      }
      if (isMounted) setIsLoadingAi(false);
    };
    
    if (isFlipped) {
      speak(currentWord.word);
      fetchSentence();
    }
    
    return () => { isMounted = false; };
  }, [currentIndex, isFlipped, currentWord]);

  const handleNext = (remembered: boolean) => {
    if (remembered) {
      const newXp = xp + 20;
      if (newXp >= 100) {
        setLevel(level + 1);
        setXp(newXp - 100);
      } else {
        setXp(newXp);
      }
    }
    
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 150);
  };

  if (isLoadingWords) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-pixel text-gray-800 flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" /> 正在加载区块数据...
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-2xl font-pixel text-gray-800">这个区块还没有矿石（单词）！</div>
        <button onClick={onBack} className="mc-btn mc-panel px-4 py-2 font-pixel">返回</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl"
        >
          <ArrowLeft className="w-5 h-5" /> 返回选关
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-pixel text-2xl text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              Level {level}
            </div>
            {/* XP Bar */}
            <div className="w-48 h-4 bg-gray-800 border-2 border-black p-0.5 mt-1">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${xp}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer group" onClick={() => !isFlipped && setIsFlipped(true)}>
        <div className={`w-full h-full relative transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front of Card (Dirt Block Style) */}
          <div className="absolute w-full h-full backface-hidden mc-border bg-[#8B5A2B] flex flex-col">
            <div className="mc-grass-top"></div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiM4QjVBMkIiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMSkiLz48L3N2Zz4=')]">
              <div className="text-white/80 font-pixel text-xl mb-4 flex items-center gap-2">
                <Pickaxe className="w-5 h-5" /> 点击挖掘词义
              </div>
              <h2 className="text-6xl md:text-7xl font-pixel text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] tracking-wider">
                {currentWord.word}
              </h2>
              <div className="absolute bottom-4 right-4 text-white/50 font-pixel">
                {currentIndex + 1} / {words.length}
              </div>
            </div>
          </div>

          {/* Back of Card (Stone/Iron Panel Style) */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 mc-panel flex flex-col p-6">
            <div className="flex items-center justify-between mb-2 border-b-4 border-gray-400 pb-2">
              <h2 className="text-4xl font-pixel text-gray-800">
                {currentWord.word}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveWord}
                  className={`mc-btn p-1 border-2 ${savedSuccess ? 'bg-green-200 border-green-500' : 'bg-purple-200 border-purple-500 hover:bg-purple-300'}`}
                  title="加入末影箱 (生词本)"
                >
                  {savedSuccess ? <Check className="w-6 h-6 text-green-700" /> : <Box className="w-6 h-6 text-purple-900" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); speak(currentWord.word); }}
                  className="mc-btn bg-gray-300 border-2 border-gray-500 p-1 hover:bg-gray-400"
                >
                  <Volume2 className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-700 mb-6">{currentWord.meaning}</p>
            
            <div className="flex-1 bg-black/5 border-4 border-black/10 p-4 relative">
              <div className="absolute -top-3 -left-3 bg-yellow-400 border-2 border-black p-1">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-pixel text-lg text-gray-600">AI 附魔例句 (Minecraft Theme):</h3>
                {aiData && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); speak(aiData.sentence); }}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {isLoadingAi ? (
                <div className="flex items-center justify-center h-20">
                  <div className="font-pixel text-xl animate-pulse text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin"/> 正在合成例句...
                  </div>
                </div>
              ) : aiData ? (
                <div className="space-y-3">
                  <p className="text-xl font-pixel text-gray-900 leading-relaxed">{aiData.sentence}</p>
                  <p className="text-lg text-gray-600 font-medium">{aiData.translation}</p>
                </div>
              ) : (
                <p className="text-red-500 font-pixel">合成失败，请重试。</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons (Only show when flipped) */}
      <div className={`mt-8 flex justify-center gap-6 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="mc-btn mc-btn-red px-8 py-4 font-pixel text-2xl flex items-center gap-2"
        >
          <Sword className="w-6 h-6" /> 还需要练
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="mc-btn mc-btn-green px-8 py-4 font-pixel text-2xl flex items-center gap-2"
        >
          <Pickaxe className="w-6 h-6" /> 已经掌握
        </button>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Loader2, Sparkles, Volume2, Box, Check } from 'lucide-react';
import { analyzeArticle } from '../lib/gemini';

interface Article {
  id: number;
  title: string;
  content: string;
  difficulty_level: number;
  theme: string;
}

interface Analysis {
  vocabulary: { word: string; meaning: string }[];
  difficultSentences: { sentence: string; analysis: string; translation: string }[];
  summary: string;
}

export default function ReadingModule({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsLoadingArticles(true);
    fetch(`/api/articles?level=${level}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setIsLoadingArticles(false);
      });
  }, [level]);

  const handleSelectArticle = async (article: Article) => {
    setSelectedArticle(article);
    setAnalysis(null);
    setIsAnalyzing(true);
    const result = await analyzeArticle(article.content);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSaveWord = async (word: string, meaning: string) => {
    try {
      const res = await fetch('/api/user/saved-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, meaning })
      });
      if (res.ok) {
        setSavedWords(prev => new Set(prev).add(word));
      }
    } catch (err) {
      console.error('Failed to save word', err);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
        <button 
          onClick={() => setSelectedArticle(null)}
          className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> 返回列表
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Content */}
          <div className="mc-panel p-8 bg-white/90">
            <div className="flex items-center justify-between mb-6 border-b-4 border-gray-300 pb-4">
              <h1 className="text-3xl font-pixel text-gray-900">{selectedArticle.title}</h1>
              <button onClick={() => speak(selectedArticle.content)} className="mc-btn bg-gray-200 p-2 border-2 border-gray-400">
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xl leading-relaxed text-gray-800 font-medium whitespace-pre-wrap">
              {selectedArticle.content}
            </p>
          </div>

          {/* AI Analysis */}
          <div className="space-y-6">
            {isAnalyzing ? (
              <div className="mc-panel p-8 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="font-pixel text-xl">AI 正在附魔解析文章...</p>
              </div>
            ) : analysis ? (
              <>
                {/* Vocabulary */}
                <div className="mc-panel p-6 bg-blue-50">
                  <h3 className="font-pixel text-2xl text-blue-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> 核心词汇
                  </h3>
                  <div className="space-y-3">
                    {analysis.vocabulary.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 border-2 border-blue-200">
                        <div className="flex-1">
                          <span className="font-bold text-lg mr-2">{v.word}</span>
                          <span className="text-gray-600">{v.meaning}</span>
                        </div>
                        <button 
                          onClick={() => handleSaveWord(v.word, v.meaning)}
                          className={`ml-2 p-2 rounded border-2 transition-colors ${savedWords.has(v.word) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'}`}
                          title="加入末影箱"
                          disabled={savedWords.has(v.word)}
                        >
                          {savedWords.has(v.word) ? <Check className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficult Sentences */}
                <div className="mc-panel p-6 bg-amber-50">
                  <h3 className="font-pixel text-2xl text-amber-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> 长难句解析
                  </h3>
                  <div className="space-y-4">
                    {analysis.difficultSentences.map((s, i) => (
                      <div key={i} className="bg-white p-4 border-2 border-amber-200">
                        <p className="font-bold text-gray-900 mb-2 italic">"{s.sentence}"</p>
                        <p className="text-sm text-indigo-600 mb-2">解析: {s.analysis}</p>
                        <p className="text-sm text-gray-600">翻译: {s.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mc-panel p-6 bg-emerald-50">
                  <h3 className="font-pixel text-2xl text-emerald-800 mb-2">文章摘要</h3>
                  <p className="text-gray-700 italic">{analysis.summary}</p>
                </div>
              </>
            ) : (
              <div className="mc-panel p-8 text-center text-gray-500 font-pixel">解析失败，请重试</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl"
        >
          <ArrowLeft className="w-5 h-5" /> 返回大厅
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map(l => (
            <button 
              key={l}
              onClick={() => setLevel(l)}
              className={`mc-btn px-4 py-2 font-pixel text-xl ${level === l ? 'mc-btn-blue' : 'mc-panel'}`}
            >
              Lvl {l}
            </button>
          ))}
        </div>
      </div>

      <h1 className="text-4xl font-pixel text-gray-900 mb-8 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)] flex items-center gap-3">
        <BookOpen className="w-8 h-8" /> 附魔书图书馆
      </h1>

      {isLoadingArticles ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gray-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(article => (
            <div 
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className="mc-panel p-6 cursor-pointer hover:-translate-y-1 transition-transform bg-white/80 group"
            >
              <div className="w-12 h-12 bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-pixel text-gray-900 mb-2">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{article.content}</p>
              <div className="mt-4 text-indigo-600 font-pixel text-lg">点击阅读 →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

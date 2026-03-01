import React, { useState } from 'react';
import { BookOpen, Mic, Trophy, LayoutDashboard, User, Pickaxe, Sword, Shield } from 'lucide-react';
import VocabularyChallenge from './components/VocabularyChallenge';
import PackSelector from './components/PackSelector';
import ReadingModule from './components/ReadingModule';
import SpeakingModule from './components/SpeakingModule';
import EnglishAssessment from './components/EnglishAssessment';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'pack_select' | 'vocab' | 'reading' | 'speaking' | 'assessment'>('dashboard');
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);

  if (currentView === 'pack_select') {
    return (
      <div className="min-h-screen font-sans">
        <PackSelector 
          onBack={() => setCurrentView('dashboard')} 
          onSelectPack={(id) => {
            setSelectedPackId(id);
            setCurrentView('vocab');
          }}
        />
      </div>
    );
  }

  if (currentView === 'vocab' && selectedPackId !== null) {
    return (
      <div className="min-h-screen font-sans">
        <VocabularyChallenge 
          packId={selectedPackId} 
          onBack={() => setCurrentView('pack_select')} 
        />
      </div>
    );
  }

  if (currentView === 'reading') {
    return (
      <div className="min-h-screen font-sans">
        <ReadingModule onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'speaking') {
    return (
      <div className="min-h-screen font-sans">
        <SpeakingModule onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'assessment') {
    return (
      <div className="min-h-screen font-sans">
        <EnglishAssessment onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-12">
      {/* Header */}
      <header className="mc-panel sticky top-0 z-10 border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800">
            <Pickaxe className="w-8 h-8" />
            <span className="text-2xl font-pixel tracking-wider drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">LingoTeen</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-lg font-pixel text-gray-700">
            <a href="#" className="flex items-center gap-1 bg-black/10 px-4 py-2 border-2 border-black/20">
              <LayoutDashboard className="w-5 h-5"/> 基地大厅
            </a>
            <a href="#" className="hover:text-black transition-colors">我的背包(词库)</a>
            <a href="#" className="hover:text-black transition-colors">探险记录</a>
            <button
              onClick={() => setCurrentView('assessment')}
              className="hover:text-black transition-colors flex items-center gap-1"
            >
              <Shield className="w-4 h-4" /> 测评
            </button>
          </nav>
          <div className="w-10 h-10 bg-gray-300 border-2 border-gray-500 flex items-center justify-center text-gray-700 cursor-pointer">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-10 mc-panel p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-20">
            <Sword className="w-48 h-48" />
          </div>
          <h1 className="text-4xl font-pixel text-gray-900 mb-3 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">早上好，探险家！👋</h1>
          <p className="text-gray-700 text-xl font-bold">今天想去哪个区块探险？我已经为你准备好了合成配方。</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Module: Assessment */}
          <div
            onClick={() => setCurrentView('assessment')}
            className="mc-panel p-6 cursor-pointer group hover:-translate-y-2 transition-transform relative"
          >
            <div className="absolute -top-4 -right-4 bg-red-500 border-4 border-black text-white font-pixel px-3 py-1 transform rotate-12 z-10">
              BOSS!
            </div>
            <div className="w-16 h-16 bg-red-800 border-4 border-red-950 flex items-center justify-center mb-5">
              <Shield className="w-8 h-8 text-red-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]" />
            </div>
            <h3 className="text-2xl font-pixel mb-2 text-gray-900">BOSS战 - 英语测评</h3>
            <p className="text-gray-700 font-bold mb-6 flex-grow">挑战终极 BOSS，5 种题型全面测评英语水平，获得 AI 个性化学习报告！</p>
            <button className="mc-btn mc-btn-red w-full py-3 font-pixel text-xl flex items-center justify-center gap-2">
              <Sword className="w-5 h-5" /> 开始挑战
            </button>
          </div>

          {/* Module 3: Vocabulary */}
          <div 
            onClick={() => setCurrentView('pack_select')}
            className="mc-panel p-6 cursor-pointer group hover:-translate-y-2 transition-transform relative"
          >
            <div className="absolute -top-4 -right-4 bg-yellow-400 border-4 border-black text-black font-pixel px-3 py-1 transform rotate-12 z-10">
              HOT!
            </div>
            <div className="w-16 h-16 bg-[#8B5A2B] border-4 border-[#5C3A21] flex items-center justify-center mb-5 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#4CAF50]"></div>
              <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]" />
            </div>
            <h3 className="text-2xl font-pixel mb-2 text-gray-900">核心词汇挖矿</h3>
            <p className="text-gray-700 font-bold mb-6 flex-grow">装备你的铁镐，结合 AI 生成的 MC 趣味例句，高效挖掘初高中核心词汇！</p>
            <button className="mc-btn mc-btn-green w-full py-3 font-pixel text-xl flex items-center justify-center gap-2">
              <Pickaxe className="w-5 h-5" /> 选择维度
            </button>
          </div>

          {/* Module 1: Reading */}
          <div 
            onClick={() => setCurrentView('reading')}
            className="mc-panel p-6 cursor-pointer group hover:-translate-y-2 transition-transform"
          >
            <div className="w-16 h-16 bg-blue-200 border-4 border-blue-400 flex items-center justify-center mb-5">
              <BookOpen className="w-8 h-8 text-blue-700" />
            </div>
            <h3 className="text-2xl font-pixel mb-2 text-gray-900">附魔书解析</h3>
            <p className="text-gray-700 font-bold mb-6 flex-grow">精选中考/高考难度文章，AI 辅助解析长难句与生词，提升阅读附魔等级。</p>
            <div className="w-full bg-gray-800 border-2 border-black h-4 mb-2 p-0.5">
              <div className="bg-blue-500 h-full" style={{ width: '45%' }}></div>
            </div>
            <span className="text-sm font-pixel text-gray-600">点击进入图书馆 →</span>
          </div>

          {/* Module 2: Speaking/Chat */}
          <div 
            onClick={() => setCurrentView('speaking')}
            className="mc-panel p-6 cursor-pointer group hover:-translate-y-2 transition-transform"
          >
            <div className="w-16 h-16 bg-emerald-200 border-4 border-emerald-400 flex items-center justify-center mb-5">
              <Mic className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-pixel mb-2 text-gray-900">村民交易对话</h3>
            <p className="text-gray-700 font-bold mb-6 flex-grow">模拟真实生活场景，和 AI 村民进行一对一口语交易练习，告别哑巴英语。</p>
            <button className="mc-btn mc-btn-blue w-full py-3 font-pixel text-xl flex items-center justify-center gap-2">
              前往集市交易
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

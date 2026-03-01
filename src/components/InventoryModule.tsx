import React, { useState, useEffect } from 'react';
import { ArrowLeft, Box, Trash2, Volume2, X } from 'lucide-react';

interface UserProgress {
  emeralds: number;
  xp: number;
  level: number;
}

interface InventoryItem {
  id: number;
  item_type: string;
  count: number;
  name: string;
  description: string;
}

interface SavedWord {
  id: number;
  word: string;
  meaning: string;
  added_at: string;
}

export default function InventoryModule({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [showEnderChest, setShowEnderChest] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [progRes, invRes, wordRes] = await Promise.all([
      fetch('/api/user/progress'),
      fetch('/api/user/inventory'),
      fetch('/api/user/saved-words')
    ]);
    
    setProgress(await progRes.json());
    setInventory(await invRes.json());
    setSavedWords(await wordRes.json());
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    if (item.item_type === 'ender_chest') {
      setShowEnderChest(true);
    }
  };

  const handleDeleteWord = async (id: number) => {
    await fetch(`/api/user/saved-words/${id}`, { method: 'DELETE' });
    setSavedWords(prev => prev.filter(w => w.id !== id));
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Generate grid slots (Minecraft inventory has 27 slots usually, we'll do 9x3)
  const slots = Array(27).fill(null).map((_, i) => inventory[i] || null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans min-h-screen flex flex-col">
      <button 
        onClick={onBack}
        className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl mb-6 w-fit"
      >
        <ArrowLeft className="w-5 h-5" /> 返回大厅
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Inventory Container */}
        <div className="bg-[#C6C6C6] p-4 border-4 border-[#373737] rounded-sm shadow-2xl w-full max-w-2xl relative">
          <h2 className="font-pixel text-2xl text-[#3f3f3f] mb-4">我的背包</h2>

          {/* User Stats */}
          {progress && (
            <div className="flex justify-between mb-6 bg-[#8B8B8B] p-2 border-2 border-[#373737] text-white font-pixel">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rotate-45"></div>
                <span>等级: {progress.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-400 border border-emerald-600"></div>
                <span>绿宝石: {progress.emeralds}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-4 bg-gray-700 relative">
                  <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${Math.min(progress.xp, 100)}%` }}></div>
                </div>
                <span className="text-xs">XP: {progress.xp}</span>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-9 gap-2 mb-6">
            {slots.map((item, i) => (
              <div 
                key={i}
                onClick={() => item && handleItemClick(item)}
                className={`w-12 h-12 bg-[#8B8B8B] border-2 border-white border-r-[#373737] border-b-[#373737] flex items-center justify-center relative cursor-pointer hover:bg-[#9e9e9e] transition-colors ${item ? 'active:translate-y-0.5' : ''}`}
              >
                {item && (
                  <>
                    {item.item_type === 'ender_chest' && <Box className="w-8 h-8 text-purple-900" />}
                    {item.item_type === 'compass' && <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-gray-200 flex items-center justify-center"><div className="w-1 h-4 bg-red-500 rotate-45"></div></div>}
                    {item.item_type === 'book_quill' && <div className="w-8 h-8 bg-amber-700 rounded-sm border border-amber-900"></div>}
                    
                    {item.count > 1 && (
                      <span className="absolute bottom-0 right-0 text-white font-pixel text-xs drop-shadow-md">{item.count}</span>
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#100010] text-white text-xs p-2 border-2 border-[#2a002a] hidden group-hover:block z-10 whitespace-nowrap font-pixel">
                      {item.name}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Selected Item Detail */}
          <div className="bg-[#8B8B8B] p-4 border-2 border-[#373737] min-h-[100px] text-white font-pixel">
            {selectedItem ? (
              <div>
                <h3 className="text-yellow-300 mb-1">{selectedItem.name}</h3>
                <p className="text-gray-200 text-sm">{selectedItem.description}</p>
                {selectedItem.item_type === 'ender_chest' && (
                  <p className="text-purple-300 text-xs mt-2 animate-pulse">点击再次打开...</p>
                )}
              </div>
            ) : (
              <p className="text-gray-300">选择一个物品查看详情...</p>
            )}
          </div>
        </div>
      </div>

      {/* Ender Chest Modal */}
      {showEnderChest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] w-full max-w-2xl border-4 border-purple-900 rounded-lg shadow-[0_0_50px_rgba(147,51,234,0.5)] flex flex-col max-h-[80vh]">
            <div className="p-4 border-b-2 border-purple-800 flex justify-between items-center bg-purple-950/50">
              <h2 className="text-2xl font-pixel text-purple-300 flex items-center gap-3">
                <Box className="w-6 h-6" /> 末影箱 (生词本)
              </h2>
              <button onClick={() => setShowEnderChest(false)} className="text-purple-300 hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#111]">
              {savedWords.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-pixel">
                  <p className="mb-4">箱子是空的...</p>
                  <p className="text-sm">在阅读或背单词时添加生词到这里。</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedWords.map(word => (
                    <div key={word.id} className="bg-[#222] p-4 border border-purple-900/50 rounded flex justify-between items-center group hover:border-purple-500 transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl font-bold text-purple-100">{word.word}</span>
                          <button onClick={() => speak(word.word)} className="text-purple-400 hover:text-purple-200">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-400">{word.meaning}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteWord(word.id)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        title="移出末影箱"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-purple-950/30 border-t-2 border-purple-800 text-center">
              <p className="text-purple-400 font-pixel text-sm">共收集 {savedWords.length} 个生词</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

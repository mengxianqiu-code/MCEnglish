import React, { useState, useEffect } from 'react';
import { ArrowLeft, Map, Loader2 } from 'lucide-react';

interface Pack {
  id: number;
  name: string;
  description: string;
  theme: string;
  difficulty_level: number;
}

export default function PackSelector({ onSelectPack, onBack }: { onSelectPack: (id: number) => void, onBack: () => void }) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packs')
      .then(res => res.json())
      .then(data => {
        setPacks(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch packs", err);
        setIsLoading(false);
      });
  }, []);

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'plains':
        return {
          bg: 'bg-[#7CFC00]',
          border: 'border-[#556B2F]',
          top: 'bg-[#32CD32]',
          topBorder: 'border-[#228B22]',
        };
      case 'forest':
        return {
          bg: 'bg-[#228B22]',
          border: 'border-[#006400]',
          top: 'bg-[#008000]',
          topBorder: 'border-[#004d00]',
        };
      case 'ocean':
        return {
          bg: 'bg-[#00CED1]',
          border: 'border-[#008B8B]',
          top: 'bg-[#20B2AA]',
          topBorder: 'border-[#008080]',
        };
      case 'mineshaft':
        return {
          bg: 'bg-[#8B4513]',
          border: 'border-[#5D4037]',
          top: 'bg-[#A0522D]',
          topBorder: 'border-[#8B4513]',
        };
      case 'overworld':
        return {
          bg: 'bg-[#8B5A2B]',
          border: 'border-[#5C3A21]',
          top: 'bg-[#4CAF50]',
          topBorder: 'border-[#388E3C]',
        };
      case 'nether':
        return {
          bg: 'bg-[#8B0000]',
          border: 'border-[#5C0000]',
          top: 'bg-[#B22222]',
          topBorder: 'border-[#8B0000]',
        };
      case 'end':
        return {
          bg: 'bg-[#F5F5DC]',
          border: 'border-[#D3D3A4]',
          top: 'bg-[#FFF8DC]',
          topBorder: 'border-[#EEDC82]',
        };
      case 'deep_dark':
        return {
          bg: 'bg-[#0D161B]',
          border: 'border-[#030506]',
          top: 'bg-[#006666]',
          topBorder: 'border-[#004d4d]',
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-700',
          top: 'bg-gray-400',
          topBorder: 'border-gray-600',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl"
        >
          <ArrowLeft className="w-5 h-5" /> 返回大厅
        </button>
        <h1 className="text-4xl font-pixel text-gray-900 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)] flex items-center gap-3">
          <Map className="w-8 h-8" /> 选择探险维度 (词库)
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gray-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const styles = getThemeStyles(pack.theme);
            return (
              <div 
                key={pack.id}
                onClick={() => onSelectPack(pack.id)}
                className={`relative w-full aspect-square cursor-pointer group transition-transform hover:-translate-y-2 mc-border ${styles.bg} flex flex-col`}
              >
                {/* Block Top */}
                <div className={`h-1/4 w-full border-b-4 ${styles.topBorder} ${styles.top}`}></div>
                
                {/* Block Front Content */}
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAwMDAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')]"></div>
                  
                  <div className="relative z-10">
                    <div className="text-yellow-300 font-pixel text-xl mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                      Level {pack.difficulty_level}
                    </div>
                    <h2 className={`text-3xl font-pixel mb-3 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] ${pack.theme === 'end' ? 'text-gray-800 drop-shadow-none' : 'text-white'}`}>
                      {pack.name}
                    </h2>
                    <p className={`text-sm font-bold px-2 ${pack.theme === 'end' ? 'text-gray-700' : 'text-white/90'}`}>
                      {pack.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Book, Trophy, Calendar, Activity, User } from 'lucide-react';

interface UserProgress {
  id: number;
  emeralds: number;
  xp: number;
  level: number;
  created_at: string;
  total_study_time: number;
  mastered_words_count: number;
}

interface StudyLog {
  id: number;
  activity_type: string;
  xp_earned: number;
  timestamp: string;
}

export default function UserProfile({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, logsRes] = await Promise.all([
          fetch('/api/user/progress'),
          fetch('/api/user/logs')
        ]);
        
        const progressData = await progressRes.json();
        const logsData = await logsRes.json();
        
        setProgress(progressData);
        setLogs(logsData);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-pixel text-2xl">
        读取档案中...
      </div>
    );
  }

  if (!progress) return null;

  // Calculate English Level based on XP/Level
  const getEnglishLevel = (level: number) => {
    if (level < 5) return "初级探险家 (A1)";
    if (level < 10) return "熟练工匠 (A2)";
    if (level < 20) return "资深矿工 (B1)";
    if (level < 30) return "附魔大师 (B2)";
    return "红石工程师 (C1)";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <button 
        onClick={onBack}
        className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> 返回大厅
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="mc-panel p-6 flex flex-col items-center bg-gray-100">
            <div className="w-32 h-32 bg-gray-300 border-4 border-gray-500 mb-4 flex items-center justify-center relative overflow-hidden">
              {/* Simple CSS Pixel Art Avatar Placeholder */}
              <div className="w-full h-full bg-[#ffcc99] relative">
                <div className="absolute top-0 w-full h-8 bg-[#4a3728]"></div> {/* Hair */}
                <div className="absolute top-10 left-4 w-4 h-4 bg-white"></div> {/* Eye L */}
                <div className="absolute top-10 left-6 w-2 h-2 bg-blue-500"></div> {/* Pupil L */}
                <div className="absolute top-10 right-8 w-4 h-4 bg-white"></div> {/* Eye R */}
                <div className="absolute top-10 right-6 w-2 h-2 bg-blue-500"></div> {/* Pupil R */}
                <div className="absolute bottom-8 left-10 w-12 h-2 bg-[#cc6666]"></div> {/* Mouth */}
              </div>
            </div>
            <h2 className="text-2xl font-pixel text-gray-900 mb-1">Steve</h2>
            <div className="px-3 py-1 bg-yellow-400 border-2 border-black text-xs font-bold rounded-full mb-4">
              Level {progress.level}
            </div>
            
            <div className="w-full space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/> 加入时间</span>
                <span className="font-bold">{formatDate(progress.created_at)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4"/> 学习时长</span>
                <span className="font-bold">{progress.total_study_time} 分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & History */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="mc-panel p-4 bg-blue-50 flex items-center gap-4">
              <div className="p-3 bg-blue-200 border-2 border-blue-400 rounded-lg">
                <Book className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <div className="text-gray-500 text-sm font-bold uppercase">掌握单词</div>
                <div className="text-3xl font-pixel text-gray-900">{progress.mastered_words_count}</div>
              </div>
            </div>
            <div className="mc-panel p-4 bg-purple-50 flex items-center gap-4">
              <div className="p-3 bg-purple-200 border-2 border-purple-400 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <div className="text-gray-500 text-sm font-bold uppercase">英语等级</div>
                <div className="text-lg font-pixel text-gray-900">{getEnglishLevel(progress.level)}</div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="mc-panel p-6 min-h-[300px]">
            <h3 className="text-xl font-pixel text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" /> 最近活动记录
            </h3>
            
            {logs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 italic">
                暂无活动记录，快去开始你的第一次探险吧！
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-white/50 border-b border-gray-200 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-bold text-gray-800">{log.activity_type}</div>
                        <div className="text-xs text-gray-500">{formatDate(log.timestamp)} {formatTime(log.timestamp)}</div>
                      </div>
                    </div>
                    <div className="font-pixel text-green-600">
                      +{log.xp_earned} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

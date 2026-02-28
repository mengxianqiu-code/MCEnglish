import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Send, Loader2, User, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Scenario {
  id: number;
  name: string;
  description: string;
  character_name: string;
  character_gender: string;
  initial_message: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function SpeakingModule({ onBack }: { onBack: () => void }) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => {
        setScenarios(data);
        setIsLoadingScenarios(false);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([{ role: 'model', text: scenario.initial_message }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedScenario) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are ${selectedScenario.character_name}, a ${selectedScenario.character_gender} villager in Minecraft. 
          The user is a middle school student learning English. 
          Scenario: ${selectedScenario.description}. 
          Keep your responses short, friendly, and in simple English suitable for an 8th grader. 
          Occasionally use Minecraft terms. 
          Correct the student's English gently if they make major mistakes, but keep the conversation flowing.`
        }
      });

      // Reconstruct history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }]
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm a bit confused right now. Can we try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (selectedScenario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 h-[90vh] flex flex-col font-sans">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setSelectedScenario(null)}
            className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl"
          >
            <ArrowLeft className="w-5 h-5" /> 离开交易
          </button>
          <div className="mc-panel px-4 py-2 bg-emerald-100 border-emerald-400 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${selectedScenario.character_gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
            <span className="font-pixel text-xl">{selectedScenario.character_name}</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 mc-panel bg-white/90 mb-4 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 shrink-0 border-2 border-black flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-200' : 'bg-emerald-200'}`}>
                  {m.role === 'user' ? <User className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </div>
                <div className={`p-4 mc-border ${m.role === 'user' ? 'bg-indigo-50' : 'bg-white'} relative group`}>
                  <p className="text-lg leading-relaxed">{m.text}</p>
                  <button 
                    onClick={() => speak(m.text)}
                    className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="mc-panel px-4 py-2 bg-gray-100 animate-pulse font-pixel">
                村民正在思考交易...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的回复..."
            className="flex-1 mc-panel px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping}
            className="mc-btn mc-btn-green px-8 flex items-center justify-center"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <button 
        onClick={onBack}
        className="mc-btn mc-panel px-4 py-2 flex items-center gap-2 font-pixel text-xl mb-8"
      >
        <ArrowLeft className="w-5 h-5" /> 返回大厅
      </button>

      <h1 className="text-4xl font-pixel text-gray-900 mb-8 drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)] flex items-center gap-3">
        <Mic className="w-8 h-8" /> 村民交易中心 (口语练习)
      </h1>

      {isLoadingScenarios ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-gray-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map(s => (
            <div 
              key={s.id}
              onClick={() => handleStartChat(s)}
              className="mc-panel p-8 cursor-pointer hover:-translate-y-1 transition-transform bg-white/80 group flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 border-4 border-black flex items-center justify-center ${s.character_gender === 'male' ? 'bg-blue-200' : 'bg-pink-200'}`}>
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-pixel text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 font-bold">角色: {s.character_name}</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-8 flex-grow leading-relaxed">{s.description}</p>
              <button className="mc-btn mc-btn-green w-full py-4 font-pixel text-xl flex items-center justify-center gap-2">
                开始交易对话
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

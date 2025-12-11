import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { sendMessageToAssistant } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
        id: '1', 
        role: 'model', 
        text: 'Hello! I am the White Lotus HR AI. I have access to your current worker list and attendance records. How can I assist you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await sendMessageToAssistant(input);
        const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
            <Sparkles size={24} />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-slate-800">AI Assistant</h2>
            <p className="text-slate-500 text-sm">Ask questions about your workforce data</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-brand-100 text-brand-600'
                    }`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                            ? 'bg-slate-800 text-white rounded-tr-none' 
                            : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                        ))}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-2 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <form onSubmit={handleSend} className="relative flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about attendance, draft an email, or get HR advice..."
                    className="w-full pl-6 pr-14 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
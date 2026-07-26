import React, { useState } from 'react';
import { StockItem } from '../types';
import { Bot, X, Send, Sparkles, RefreshCw } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeStock: StockItem | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeStock,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: activeStock
        ? `MarketTerminal AI Bot online. Currently inspecting $${activeStock.symbol} (${activeStock.name}). Ask me about DCF valuation targets, technical support levels, or peer comparisons!`
        : 'MarketTerminal AI Bot online. Ask me to evaluate any stock in BIST, US Equities, Crypto, or Forex markets.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          activeSymbol: activeStock?.symbol || 'General Market',
          marketContext: activeStock?.market || 'Global',
        }),
      });

      const data = await res.json();
      const botReplyText = data.success && data.reply
        ? data.reply
        : 'Apologies, unable to query the valuation engine. Please check network connection.';

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('AI Bot Chat Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    `Evaluate $${activeStock?.symbol || 'META'} DCF valuation`,
    'Compare BIST THYAO vs European airlines',
    'Which stocks currently have Strong Value signals?',
    'What is the 2026 outlook for Gold and Bitcoin?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#070709] border-l border-[#1f1f2e] z-50 flex flex-col shadow-2xl select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#1f1f2e] flex justify-between items-center bg-[#101017]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xs uppercase text-[#dee3e8] tracking-wider flex items-center gap-1">
              AI Valuation Bot
            </h3>
            <span className="text-[10px] text-[#34d399] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
              ONLINE • Gemini 3.6 Flash
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#87929a] hover:text-[#dee3e8] rounded-lg hover:bg-[#171c20] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed font-sans ${
                m.sender === 'user'
                  ? 'bg-[#38bdf8] text-[#00354a] font-medium rounded-br-none'
                  : 'bg-[#101017] border border-[#1f1f2e] text-[#dee3e8] rounded-bl-none'
              }`}
            >
              {m.sender === 'bot' && (
                <div className="flex items-center gap-1 mb-1 text-[10px] font-mono text-[#38bdf8] font-bold">
                  <Sparkles className="w-3 h-3" /> MarketTerminal AI
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[9px] text-[#87929a] font-mono mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-[#101017] border border-[#1f1f2e] rounded-xl text-xs text-[#38bdf8] font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Analyzing equity financials & technical indicators...
          </div>
        )}
      </div>

      {/* Sample Quick Prompts */}
      <div className="p-3 border-t border-[#1f1f2e] bg-[#0f1418]/50 space-y-1.5">
        <span className="text-[9px] font-mono text-[#87929a] uppercase block">Suggested Queries:</span>
        <div className="flex flex-wrap gap-1">
          {samplePrompts.slice(0, 2).map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInput(p)}
              className="text-[10px] px-2 py-1 bg-[#101017] hover:bg-[#171c20] border border-[#1f1f2e] text-[#bdc8d1] hover:text-[#38bdf8] rounded cursor-pointer transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#1f1f2e] bg-[#101017] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AI about ${activeStock ? activeStock.symbol : 'any ticker'}...`}
          className="flex-1 px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-xs text-[#dee3e8] placeholder-[#87929a] focus:outline-none focus:border-[#38bdf8] font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 bg-[#38bdf8] text-[#00354a] hover:bg-[#7bd0ff] rounded-lg disabled:opacity-40 cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

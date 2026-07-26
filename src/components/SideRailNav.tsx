import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Wallet, 
  Filter, 
  MessageSquare, 
  Settings,
  Bot
} from 'lucide-react';

interface SideRailNavProps {
  activeTab: 'screener' | 'markets' | 'signals' | 'portfolio' | 'forum';
  setActiveTab: (tab: 'screener' | 'markets' | 'signals' | 'portfolio' | 'forum') => void;
  onOpenAiAssistant: () => void;
  aiAnalyzing: boolean;
}

export const SideRailNav: React.FC<SideRailNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
  aiAnalyzing,
}) => {
  const navItems = [
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'signals', label: 'Signals', icon: Sparkles },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'screener', label: 'Screener', icon: Filter },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
  ] as const;

  return (
    <aside className="w-[64px] h-screen fixed left-0 top-0 border-r border-[#1f1f2e] bg-[#070709] flex flex-col items-center py-4 z-50 select-none">
      {/* Logo */}
      <button 
        onClick={() => setActiveTab('screener')} 
        className="mb-6 flex flex-col items-center group cursor-pointer"
        title="MarketTerminal Home"
      >
        <div className="w-10 h-10 rounded-lg bg-[#101017] border border-[#1f1f2e] flex items-center justify-center group-hover:border-[#38bdf8] transition-all">
          <span className="font-headline font-bold text-xl text-[#38bdf8]">T</span>
        </div>
      </button>

      {/* Primary Navigation */}
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-3.5 w-full transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#38bdf8] bg-[#252b2e]/60 border-r-2 border-[#38bdf8]'
                  : 'text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#171c20]'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Bot Quick Trigger */}
      <div className="mt-auto flex flex-col items-center w-full px-2 mb-3">
        <button
          onClick={onOpenAiAssistant}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            aiAnalyzing
              ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8] animate-pulse'
              : 'bg-[#101017] border-[#1f1f2e] text-[#38bdf8] hover:border-[#38bdf8] hover:bg-[#38bdf8]/10'
          }`}
          title="Open AI Valuation Assistant"
        >
          <Bot className="w-5 h-5" />
        </button>
      </div>

      {/* Settings */}
      <button className="flex flex-col items-center py-3 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#171c20] w-full transition-colors cursor-pointer">
        <Settings className="w-5 h-5" />
      </button>
    </aside>
  );
};

import React, { useState } from 'react';
import { MarketCategory } from '../types';
import { 
  Bell, 
  Search, 
  PlusCircle, 
  ArrowLeftRight, 
  Sparkles,
  Check,
  X
} from 'lucide-react';

interface TopNavBarProps {
  selectedMarket: MarketCategory;
  setSelectedMarket: (market: MarketCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenDeposit: () => void;
  onOpenTrade: () => void;
  notificationCount: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  selectedMarket,
  setSelectedMarket,
  searchQuery,
  setSearchQuery,
  onOpenDeposit,
  onOpenTrade,
  notificationCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const markets: MarketCategory[] = ['BIST', 'US Markets', 'Crypto', 'Forex'];

  const sampleNotifications = [
    { id: '1', title: 'META Signal Alert', text: 'Strong Buy score upgraded to 92 based on Q2 free cash flow metrics.', time: '12m ago', unread: true },
    { id: '2', title: 'THYAO Target Hit', text: 'THYAO reached ₺312.50 (+2.8%). Target upside remains +36.5%.', time: '1h ago', unread: true },
    { id: '3', title: 'Macro Update', text: 'Fed rate projection model refreshed for all US equities.', time: '2h ago', unread: false },
  ];

  return (
    <header className="h-14 flex items-center justify-between px-6 w-full border-b border-[#1f1f2e] bg-[#0f1418]/90 backdrop-blur-md z-40 relative select-none">
      {/* Brand & Market Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-lg text-[#dee3e8] tracking-tight">MarketTerminal</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
            PRO AI
          </span>
        </div>

        {/* Market Category Tabs */}
        <div className="flex items-center gap-1 bg-[#101017] p-1 rounded-lg border border-[#1f1f2e]">
          {markets.map((m) => {
            const isActive = selectedMarket === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedMarket(m)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#38bdf8] text-[#001e2c] shadow-sm'
                    : 'text-[#bdc8d1] hover:text-[#dee3e8] hover:bg-[#1f1f2e]/50'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center relative w-64 lg:w-80">
        <Search className="w-4 h-4 absolute left-3 text-[#87929a]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${selectedMarket} tickers (e.g. META, THYAO, BTC)...`}
          className="w-full pl-9 pr-3 py-1.5 bg-[#070709] border border-[#1f1f2e] rounded-lg text-xs text-[#dee3e8] placeholder-[#87929a] focus:outline-none focus:border-[#38bdf8] transition-colors font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 text-[#87929a] hover:text-[#dee3e8] text-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Deposit Button */}
        <button
          onClick={onOpenDeposit}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#45dfa4] text-[#003825] hover:bg-[#34d399] rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#45dfa4]/10 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Deposit
        </button>

        {/* Trade Button */}
        <button
          onClick={onOpenTrade}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#38bdf8] text-[#004965] hover:bg-[#7bd0ff] rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#38bdf8]/10 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Trade
        </button>

        <div className="h-5 w-px bg-[#1f1f2e] mx-1"></div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#bdc8d1] hover:text-[#38bdf8] transition-colors rounded-lg hover:bg-[#101017] relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fb7185] animate-ping" />
            )}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#fb7185]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl p-3 z-50 border border-[#1f1f2e] shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-[#1f1f2e] mb-2">
                <span className="text-xs font-bold font-headline text-[#dee3e8] uppercase tracking-wider">
                  Signal Notifications
                </span>
                <span className="text-[10px] text-[#38bdf8] font-mono">{sampleNotifications.length} Alert Messages</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-[#101017] border border-[#1f1f2e] hover:border-[#38bdf8]/40 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-[#dee3e8] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#87929a] font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#bdc8d1] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analyst Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#101017] border border-[#1f1f2e] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#38bdf8] transition-colors">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3QcTL7wU1ef6leUPxx-q3ePdHJf3Y2FTs1J-izSOKRDACFdQOT4ZowuHukggvlTpWCg_KMq_HOw7zOB-USfQ0TT0UStN-XQ2xBTOHPDOz4SWY0rVWlpfugMw7DPC9BX1Bq8RoSJipTvsrcKWn8s9lzrhJSPBYZSXlUniy64DCq3LGEJ4EBhcxbDY5_aC16EgWx79RhyLAFooY4Cg0i2wRg02M3WxlG4z4NburZQgEyzi6E7khS_i3wjSxvlb2KFCPK2J-HjF1tMM"
            alt="Institutional Analyst Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

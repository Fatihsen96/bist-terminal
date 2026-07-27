import React, { useState } from 'react';
import { MarketCategory, StockItem } from '../types';
import { 
  Bell, 
  Search, 
  PlusCircle, 
  ArrowLeftRight, 
  Sparkles,
  Globe,
  X,
  Award,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface TopNavBarProps {
  selectedMarket: MarketCategory;
  setSelectedMarket: (market: MarketCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenDeposit: () => void;
  onOpenTrade: () => void;
  notificationCount: number;
  currentLang: 'en' | 'tr';
  setLang: (lang: 'en' | 'tr') => void;
  fourOfFourStocks?: StockItem[];
  onSelectStock?: (stock: StockItem) => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  selectedMarket,
  setSelectedMarket,
  searchQuery,
  setSearchQuery,
  onOpenDeposit,
  onOpenTrade,
  notificationCount,
  currentLang,
  setLang,
  fourOfFourStocks = [],
  onSelectStock
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const markets: MarketCategory[] = ['BIST', 'US Markets'];

  const fourOfFourCount = fourOfFourStocks.length;
  const totalNotifications = (notificationCount || 1) + fourOfFourCount;

  return (
    <header className="h-14 flex items-center justify-between px-6 w-full border-b border-[#1f1f2e] bg-[#0f1418]/90 backdrop-blur-md z-40 relative select-none">
      {/* Brand & Market Tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-lg text-[#dee3e8] tracking-tight">FinOS</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
            PRD v2.0 AI
          </span>
        </div>

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
          placeholder={currentLang === 'tr' ? `${selectedMarket} hisselerini ara (örn: ORGE, THYAO)...` : `Search ${selectedMarket} tickers...`}
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

      {/* Right Actions, Notification & Profile */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(currentLang === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#101017] hover:bg-[#1f1f2e] border border-[#1f1f2e] rounded-lg text-xs font-mono font-bold text-[#38bdf8] transition-all cursor-pointer shadow-sm"
          title="Change language / Dili değiştir"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{currentLang === 'tr' ? 'EN' : 'TR'}</span>
        </button>

        <button
          onClick={onOpenDeposit}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#101017] hover:bg-[#1f1f2e] border border-[#1f1f2e] rounded-lg text-xs font-medium text-[#bdc8d1] hover:text-[#dee3e8] transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>{currentLang === 'tr' ? 'Bakiye Ekle' : 'Deposit'}</span>
        </button>

        <button
          onClick={onOpenTrade}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{currentLang === 'tr' ? 'Hızlı Al / Sat' : 'Trade'}</span>
        </button>

        {/* NOTIFICATION BELL WITH 4/4 ALIGNMENT ALERT BADGE */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-[#101017] hover:bg-[#1f1f2e] border border-[#1f1f2e] rounded-lg text-[#bdc8d1] hover:text-[#dee3e8] transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 border border-slate-900 animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0f1418] border border-[#1f1f2e] rounded-xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f2e] pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    {currentLang === 'tr' ? 'FinOS Live Sinyal Bildirimleri' : 'Live Signal Notifications'}
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  {fourOfFourCount} Adet 4/4 Uyum
                </span>
              </div>

              {fourOfFourStocks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {fourOfFourStocks.map((s) => (
                    <div
                      key={s.symbol}
                      onClick={() => {
                        if (onSelectStock) onSelectStock(s);
                        setShowNotifications(false);
                      }}
                      className="p-2.5 bg-[#171c22] hover:bg-[#1f262e] rounded-lg border border-amber-500/30 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{s.symbol}</span>
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                            4/4 GÜÇLÜ AL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Teknik (%{s.technicalScore}) • Temel (%{s.fundamentalScore}) • Haber (%{s.newsScore}) • Analist (%{s.analystScore})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">{s.currency}{s.price}</span>
                        <span className="text-[10px] font-bold text-emerald-400">+{s.upside}% Prim</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#171c22] rounded-lg text-xs text-slate-400 text-center">
                  Henüz 4/4 sinyal uyumu yakalayan hisse taranıyor...
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38bdf8] to-blue-600 flex items-center justify-center font-bold text-xs text-[#001e2c] border border-[#38bdf8]/40 shadow-sm">
          FS
        </div>
      </div>
    </header>
  );
};
import React, { useState, useMemo, useEffect } from 'react';
import {
   MarketCategory,
   StockItem,
   PortfolioHolding,
   ForumPost,
   SignalNews
} from './types';
import { INITIAL_STOCKS, INITIAL_NEWS, INITIAL_PORTFOLIO, INITIAL_FORUM_POSTS } from './data/mockData';
import { SideRailNav } from './components/SideRailNav';
import { TopNavBar } from './components/TopNavBar';
import { FilterSidebar } from './components/FilterSidebar';
import { KPIGlassCards } from './components/KPIGlassCards';
import { SignalsTable } from './components/SignalsTable';
import { RadarChart } from './components/RadarChart';
import { NewsFeed } from './components/NewsFeed';
import { StockDetailModal } from './components/StockDetailModal';
import { TradeModal } from './components/TradeModal';
import { DepositModal } from './components/DepositModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { PortfolioView } from './components/PortfolioView';
import { ForumView } from './components/ForumView';
import { SignalsView } from './components/SignalsView';

export default function App() {
  // Navigation & Market States
  const [activeTab, setActiveTab] = useState<'screener' | 'markets' | 'signals' | 'portfolio' | 'forum'>('screener');
  const [selectedMarket, setSelectedMarket] = useState<MarketCategory>('BIST');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Language State (Türkçe / İngilizce)
  const [lang, setLang] = useState<'en' | 'tr'>('tr');
  
  // Data States
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [news, setNews] = useState<SignalNews[]>(INITIAL_NEWS);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>(INITIAL_PORTFOLIO);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  
  // Cash balances
  const [cashUsd, setCashUsd] = useState(25000);
  const [cashTry, setCashTry] = useState(150000);
  
  // Active Selected Stock for Radar Chart & Analysis
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(stocks[0]);
  
  // AI Filter States
  const [valuationRange, setValuationRange] = useState<[number, number]>([0, 100]);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Modals & Drawers
  const [detailModalStock, setDetailModalStock] = useState<StockItem | null>(null);
  const [tradeModalStock, setTradeModalStock] = useState<StockItem | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Live FastAPI & Express API Data Fetching Bridge
  useEffect(() => {
    if (selectedMarket === 'BIST' || selectedMarket === 'US Markets') {
      const fetchUrl = `/api/tara?piyasa=${selectedMarket}`;
      fetch(fetchUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Express proxy down, trying port 8000");
          return res.json();
        })
        .catch(() => {
          return fetch(`http://localhost:8000/api/tara?piyasa=${selectedMarket}`).then((r) => r.json());
        })
        .then((data) => {
          if (data && data.veriler && data.veriler.length > 0) {
            setStocks((prev) => {
              const otherStocks = prev.filter((s) => s.market !== selectedMarket);
              return [...otherStocks, ...data.veriler];
            });
          }
        })
        .catch((err) => {
          console.warn("Canlı veri bağlantı uyarısı (Varsayılan veriler kullanılıyor):", err);
        });
    }
  }, [selectedMarket]);

  // Compute 4/4 Alignment Stocks for Navbar Notification Alert
  const fourOfFourStocks = useMemo(() => {
    return stocks.filter((s) => s.isFourOfFour);
  }, [stocks]);

  // Toggle Signals in Filter Sidebar
  const toggleSignalFilter = (sig: string) => {
    setSelectedSignals((prev) =>
      prev.includes(sig) ? prev.filter((s) => s !== sig) : [...prev, sig]
    );
  };

  // Toggle Sector in Filter Sidebar
  const toggleSectorFilter = (sec: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  // Run AI Filter Analysis Simulation
  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setStocks((prev) =>
        prev.map((item) => ({
          ...item,
          valueScore: Math.min(100, Math.max(10, item.valueScore + Math.floor(Math.random() * 5 - 2))),
        }))
      );
      setIsAnalyzing(false);
    }, 900);
  };

  // Filtered stocks computation
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (s.market !== selectedMarket) return false;
      if (s.valueScore < valuationRange[0] || s.valueScore > valuationRange[1]) return false;
      if (selectedSignals.length > 0) {
        if (!s.primaryTag || !selectedSignals.includes(s.primaryTag)) {
          if (!selectedSignals.includes(s.signal)) return false;
        }
      }
      if (selectedSectors.length > 0 && !selectedSectors.includes(s.sector)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stocks, selectedMarket, valuationRange, selectedSignals, selectedSectors, searchQuery]);

  // Handle Trade Execution
  const handleExecuteTrade = (trade: {
    symbol: string;
    name: string;
    market: MarketCategory;
    shares: number;
    price: number;
    currency: string;
    action: 'BUY' | 'SELL';
  }) => {
    const totalCost = trade.shares * trade.price;
    if (trade.currency === '$') {
      if (trade.action === 'BUY') setCashUsd((prev) => Math.max(0, prev - totalCost));
      else setCashUsd((prev) => prev + totalCost);
    } else {
      if (trade.action === 'BUY') setCashTry((prev) => Math.max(0, prev - totalCost));
      else setCashTry((prev) => prev + totalCost);
    }
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === trade.symbol);
      if (trade.action === 'BUY') {
        if (existing) {
          const totalShares = existing.shares + trade.shares;
          const avgPrice = (existing.shares * existing.avgBuyPrice + trade.shares * trade.price) / totalShares;
          return prev.map((p) =>
            p.symbol === trade.symbol ? { ...p, shares: totalShares, avgBuyPrice: avgPrice } : p
          );
        } else {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              symbol: trade.symbol,
              name: trade.name,
              market: trade.market,
              shares: trade.shares,
              avgBuyPrice: trade.price,
              currentPrice: trade.price,
              currency: trade.currency,
            },
          ];
        }
      } else {
        if (!existing) return prev;
        const remainingShares = existing.shares - trade.shares;
        if (remainingShares <= 0) {
          return prev.filter((p) => p.symbol !== trade.symbol);
        } else {
          return prev.map((p) =>
            p.symbol === trade.symbol ? { ...p, shares: remainingShares } : p
          );
        }
      }
    });
  };

  // Deposit funds
  const handleDeposit = (amount: number, currency: string) => {
    if (currency === '$') setCashUsd((prev) => prev + amount);
    else setCashTry((prev) => prev + amount);
  };

  // Add Forum Post
  const handleAddForumPost = (newPost: Omit<ForumPost, 'id' | 'likes' | 'commentsCount' | 'timeAgo'>) => {
    const created: ForumPost = {
      ...newPost,
      id: Date.now().toString(),
      likes: 1,
      commentsCount: 0,
      timeAgo: 'Just now',
    };
    setForumPosts((prev) => [created, ...prev]);
  };

  return (
    <div className="bg-[#070709] min-h-screen text-[#dee3e8] flex overflow-hidden font-sans">
      {/* Side Rail Bar */}
      <SideRailNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
        aiAnalyzing={isAnalyzing}
      />
      {/* Main Container */}
      <main className="ml-[64px] flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <TopNavBar
          selectedMarket={selectedMarket}
          setSelectedMarket={setSelectedMarket}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenDeposit={() => setIsDepositOpen(true)}
          onOpenTrade={() => setTradeModalStock(selectedStock || stocks[0])}
          notificationCount={2}
          currentLang={lang}
          setLang={setLang}
          fourOfFourStocks={fourOfFourStocks}
          onSelectStock={(st) => setDetailModalStock(st)}
        />
        {/* Content Views */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'screener' || activeTab === 'markets' ? (
            <>
              {/* Filter Sidebar */}
              <FilterSidebar
                valuationRange={valuationRange}
                setValuationRange={setValuationRange}
                selectedSignals={selectedSignals}
                toggleSignal={toggleSignalFilter}
                selectedSectors={selectedSectors}
                toggleSector={toggleSectorFilter}
                onRunAiAnalysis={handleRunAiAnalysis}
                isAnalyzing={isAnalyzing}
                currentLang={lang}
              />
              {/* Main Screener Dashboard */}
              <section className="flex-1 p-5 overflow-hidden flex flex-col gap-5">
                {/* KPI Glass Cards */}
                <KPIGlassCards filteredCount={filteredStocks.length} marketName={selectedMarket} currentLang={lang} />
                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
                  {/* Leaderboard Table (8 cols) */}
                  <div className="lg:col-span-8 h-full overflow-hidden">
                    <SignalsTable
                      stocks={filteredStocks}
                      selectedStock={selectedStock}
                      onSelectStock={(st) => setSelectedStock(st)}
                      onOpenDetailModal={(st) => setDetailModalStock(st)}
                      currentLang={lang}
                    />
                  </div>
                  {/* Right Column (4 cols) - Flex & Scroll Kilitli Sağ Panel */}
                  <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                    {/* Company Radar Health */}
                    <div className="flex-1 min-h-[220px] overflow-y-auto custom-scrollbar">
                      <RadarChart
                        stock={selectedStock}
                        onOpenDetailModal={(st) => setDetailModalStock(st)}
                        currentLang={lang}
                      />
                    </div>
                    {/* News Feed - Alta Sabitlenmiş Haber Akışı */}
                    <div className="shrink-0 h-[280px] overflow-hidden">
                      <NewsFeed
                        newsItems={news}
                        onSelectTicker={(ticker) => {
                          const matched = stocks.find((s) => s.symbol === ticker);
                          if (matched) setSelectedStock(matched);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : activeTab === 'portfolio' ? (
            <div className="flex-1 overflow-y-auto">
              <PortfolioView
                portfolio={portfolio}
                cashBalanceUsd={cashUsd}
                cashBalanceTry={cashTry}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onOpenTradeForHolding={(symbol) => {
                  const item = stocks.find((s) => s.symbol === symbol);
                  if (item) setTradeModalStock(item);
                }}
              />
            </div>
          ) : activeTab === 'signals' ? (
            <div className="flex-1 overflow-y-auto">
              <SignalsView />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ForumView posts={forumPosts} onAddPost={handleAddForumPost} />
            </div>
          )}
        </div>
      </main>
      {/* Modals & Drawers */}
      <StockDetailModal
        stock={detailModalStock}
        onClose={() => setDetailModalStock(null)}
        onOpenTrade={(st) => setTradeModalStock(st)}
      />
      <TradeModal
        stock={tradeModalStock}
        onClose={() => setTradeModalStock(null)}
        onExecuteTrade={handleExecuteTrade}
      />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        activeStock={selectedStock}
      />
    </div>
  );
}

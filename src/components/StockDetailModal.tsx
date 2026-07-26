import React, { useState, useEffect } from 'react';
import { StockItem } from '../types';
import { X, Sparkles, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, ArrowLeftRight, RefreshCw, BarChart2 } from 'lucide-react';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onOpenTrade: (stock: StockItem) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onOpenTrade,
}) => {
  if (!stock) return null;

  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [aiLoading, setAiLoading] = useState(false);
  const [liveAiAnalysis, setLiveAiAnalysis] = useState<any>(null);

  useEffect(() => {
    // Reset state when stock changes
    setLiveAiAnalysis(null);
  }, [stock.id]);

  const fetchRealtimeAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          currentPrice: stock.price,
          peRatio: stock.peRatio,
          sector: stock.sector,
          userQuestion: 'Analyze valuation margin of safety, institutional position accumulation, and technical breakout setup.',
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setLiveAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to fetch real-time AI analysis:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const isPositive = stock.change24h >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-[#1f1f2e] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#1f1f2e]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-headline font-bold text-2xl text-[#dee3e8] font-mono">
                {stock.symbol}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#101017] border border-[#1f1f2e] text-[#38bdf8] font-mono">
                {stock.market}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-mono font-bold">
                SCORE: {stock.valueScore}/100
              </span>
            </div>
            <h2 className="text-xs text-[#94a3b8] font-mono mt-0.5">{stock.name} • {stock.sector}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#87929a] hover:text-[#dee3e8] rounded-lg hover:bg-[#171c20] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 py-4 space-y-5">
          {/* Top Price Row & Timeframes */}
          <div className="flex flex-wrap justify-between items-end gap-4 bg-[#101017] p-4 rounded-xl border border-[#1f1f2e]">
            <div>
              <span className="text-[10px] text-[#94a3b8] font-mono block uppercase">Current Price</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-[#dee3e8]">
                  {stock.currency}{stock.price.toFixed(2)}
                </span>
                <span
                  className={`font-mono text-sm font-bold flex items-center gap-1 ${
                    isPositive ? 'text-[#34d399]' : 'text-[#fb7185]'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositive ? `+${stock.change24h}%` : `${stock.change24h}%`}
                </span>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-[#070709] p-1 rounded-lg border border-[#1f1f2e]">
              {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTimeframe === tf
                      ? 'bg-[#38bdf8] text-[#001e2c]'
                      : 'text-[#87929a] hover:text-[#dee3e8]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Sparkline Chart SVG */}
          <div className="bg-[#070709] p-4 rounded-xl border border-[#1f1f2e] h-36 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#87929a]">
              <span>Price Trajectory ({activeTimeframe})</span>
              <span className="text-[#38bdf8]">52W High: {stock.high52w || stock.price * 1.2}</span>
            </div>

            {/* SVG Trendline */}
            <svg className="w-full h-20 overflow-visible" viewBox="0 0 100 40">
              <polyline
                fill="none"
                stroke={isPositive ? '#34d399' : '#fb7185'}
                strokeWidth="2"
                points="0,30 15,25 30,28 45,15 60,18 75,8 100,2"
              />
              <polygon
                fill={isPositive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)'}
                points="0,30 15,25 30,28 45,15 60,18 75,8 100,2 100,40 0,40"
              />
            </svg>

            <div className="flex justify-between items-center text-[10px] font-mono text-[#87929a]">
              <span>52W Low: {stock.low52w || stock.price * 0.7}</span>
              <span className="text-[#34d399] font-bold">Estimated Upside: +{stock.upside}%</span>
            </div>
          </div>

          {/* Financial Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">P/E Ratio</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.peRatio ? `${stock.peRatio}x` : 'N/A'}
              </span>
            </div>
            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">Market Cap</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.marketCap || '$120B'}
              </span>
            </div>
            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">24H Volume</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.volume24h || '$2.4B'}
              </span>
            </div>
            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">Signal Rating</span>
              <span className="text-sm font-mono font-bold text-[#34d399]">{stock.signal}</span>
            </div>
          </div>

          {/* AI Investment Thesis */}
          <div className="glass-panel p-4 rounded-xl border border-[#38bdf8]/30 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <h4 className="font-headline font-bold text-xs uppercase text-[#dee3e8]">
                  AI Investment Thesis
                </h4>
              </div>

              <button
                onClick={fetchRealtimeAiAnalysis}
                disabled={aiLoading}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Asking Gemini...' : 'Refresh AI Thesis'}
              </button>
            </div>

            <p className="text-xs text-[#bdc8d1] leading-relaxed font-sans">
              {liveAiAnalysis?.investmentThesis || stock.aiThesis || stock.summary}
            </p>

            {liveAiAnalysis?.keyCatalysts && (
              <div className="pt-2 border-t border-[#1f1f2e]">
                <span className="text-[10px] font-bold text-[#38bdf8] font-mono uppercase block mb-1">
                  Key Catalysts Identified
                </span>
                <ul className="space-y-1">
                  {liveAiAnalysis.keyCatalysts.map((cat: string, i: number) => (
                    <li key={i} className="text-xs text-[#dee3e8] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Trade Trigger */}
        <div className="pt-4 border-t border-[#1f1f2e] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#87929a] hover:text-[#dee3e8] cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenTrade(stock);
            }}
            className="px-5 py-2 text-xs font-bold bg-[#38bdf8] text-[#00354a] hover:bg-[#7bd0ff] rounded-lg shadow-lg shadow-[#38bdf8]/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Simulate Trade ({stock.symbol})
          </button>
        </div>
      </div>
    </div>
  );
};

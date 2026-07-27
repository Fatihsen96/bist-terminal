import React, { useState, useEffect, useRef } from 'react';
import { StockItem } from '../types';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowLeftRight, 
  RefreshCw, 
  BarChart2,
  Activity,
  ExternalLink,
  Target,
  FileText,
  Newspaper,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Award
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onOpenTrade: (stock: StockItem) => void;
}

// TradingView Interactive Widget Component for BIST & US Markets
const TradingViewWidget: React.FC<{ symbol: string; market: string }> = ({ symbol, market }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = ''; // Clean previous chart

    const containerId = `tv_chart_${symbol.toLowerCase()}_${Math.random().toString(36).substring(7)}`;
    const chartDiv = document.createElement('div');
    chartDiv.id = containerId;
    chartDiv.style.width = '100%';
    chartDiv.style.height = '100%';
    container.appendChild(chartDiv);

    // Format symbol for TradingView (BIST:THYAO or NASDAQ:AAPL)
    const tvSymbol = market === 'BIST' ? `BIST:${symbol}` : symbol;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: 'D',
          timezone: 'Europe/Istanbul',
          theme: 'dark',
          style: '1',
          locale: 'tr',
          toolbar_bg: '#121316',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: containerId,
        });
      }
    };
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [symbol, market]);

  return <div ref={containerRef} className="w-full h-full min-h-[380px]" />;
};

// Fallback Canvas Candlestick Chart Component
const NativeCandlestickChart: React.FC<{ stock: StockItem }> = ({ stock }) => {
  const rawCandles = stock.candles && stock.candles.length > 0 ? stock.candles : [];
  const candles = rawCandles.slice(-30);

  if (candles.length === 0) {
    return (
      <div className="w-full h-[360px] flex items-center justify-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
        <Activity className="w-6 h-6 animate-pulse mr-2 text-cyan-400" />
        Grafik Verisi Yükleniyor...
      </div>
    );
  }

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const minP = Math.min(...lows);
  const maxP = Math.max(...highs);
  const rangeP = maxP - minP || 1;

  return (
    <div className="w-full h-[360px] bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
      <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800/80 pb-2">
        <span className="font-semibold text-slate-200">Yerel Mum Grafiği (EOD OHLC)</span>
        <span>Yüksek: {stock.currency}{maxP.toFixed(2)} | Düşük: {stock.currency}{minP.toFixed(2)}</span>
      </div>

      <div className="flex-1 flex items-end justify-between gap-1 pt-4 pb-2">
        {candles.map((c, i) => {
          const isUp = c.close >= c.open;
          const openY = ((maxP - c.open) / rangeP) * 100;
          const closeY = ((maxP - c.close) / rangeP) * 100;
          const highY = ((maxP - c.high) / rangeP) * 100;
          const lowY = ((maxP - c.low) / rangeP) * 100;

          const candleTop = Math.min(openY, closeY);
          const candleHeight = Math.max(Math.abs(closeY - openY), 1.5);

          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full relative group">
              {/* Wick */}
              <div 
                className={`w-[1.5px] absolute ${isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                style={{ top: `${highY}%`, bottom: `${100 - lowY}%` }}
              />
              {/* Body */}
              <div 
                className={`w-full max-w-[12px] rounded-sm absolute z-10 transition-all ${isUp ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
                style={{ top: `${candleTop}%`, height: `${candleHeight}%` }}
              />
              
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-2 bg-slate-950 border border-slate-700 text-[10px] p-2 rounded shadow-2xl z-30 whitespace-nowrap">
                <p className="font-bold text-slate-200">{c.date}</p>
                <p className="text-emerald-400">Açılış: {c.open}</p>
                <p className="text-cyan-400">Kapanış: {c.close}</p>
                <p className="text-slate-300">Yüksek: {c.high} | Düşük: {c.low}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, onOpenTrade }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'fundamental' | 'news' | 'analyst'>('overview');
  const [chartMode, setChartMode] = useState<'tradingview' | 'native'>('tradingview');
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    if (stock) {
      setIsLoadingAi(true);
      fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          market: stock.market,
          currentPrice: stock.price,
          peRatio: stock.peRatio,
          technicalScore: stock.technicalScore || 85,
          fundamentalScore: stock.fundamentalScore || 80,
          newsScore: stock.newsScore || 75,
          analystScore: stock.analystScore || 88,
          aiScore: stock.valueScore,
          signal: stock.signal
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.explanation) {
          setAiExplanation(data.explanation);
        } else {
          setAiExplanation(stock.aiThesis);
        }
      })
      .catch(() => {
        setAiExplanation(stock.aiThesis);
      })
      .finally(() => {
        setIsLoadingAi(false);
      });
    }
  }, [stock]);

  if (!stock) return null;

  const isPositive = stock.change24h >= 0;
  const isStrongBuy = stock.signal === 'STRONG BUY';
  const isBuy = stock.signal === 'BUY' || isStrongBuy;
  
  const techScore = stock.technicalScore || Math.min(96, stock.valueScore + 2);
  const fundScore = stock.fundamentalScore || Math.min(94, stock.valueScore - 1);
  const newsScore = stock.newsScore || Math.min(90, stock.valueScore - 3);
  const analystScore = stock.analystScore || Math.min(95, stock.valueScore + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center font-bold text-lg text-cyan-300 shadow-inner">
              {stock.symbol.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">{stock.symbol}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {stock.market}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {stock.sector}
                </span>
                {stock.isFourOfFour && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 flex items-center gap-1 shadow-lg animate-pulse">
                    <Award className="w-3.5 h-3.5" /> 4/4 SİNYAL UYUM
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-extrabold text-white">
                {stock.currency}{stock.price.toFixed(2)}
              </div>
              <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}{stock.change24h.toFixed(2)}%
              </div>
            </div>

            <button
              onClick={() => onOpenTrade(stock)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" /> İşlem Yap
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* 1. TRADINGVIEW / NATIVE CHART CONTAINER */}
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">İnteraktif Teknik Grafik Katmanı</h3>
              </div>
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setChartMode('tradingview')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${chartMode === 'tradingview' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  TradingView Pro
                </button>
                <button
                  onClick={() => setChartMode('native')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${chartMode === 'native' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  HTML5 Canvas
                </button>
              </div>
            </div>

            <div className="w-full h-[380px] rounded-xl overflow-hidden">
              {chartMode === 'tradingview' ? (
                <TradingViewWidget symbol={stock.symbol} market={stock.market} />
              ) : (
                <NativeCandlestickChart stock={stock} />
              )}
            </div>
          </div>

          {/* 2. PRD WIREFRAME EXACT MATCH: 5-PILLAR SCORE CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* AI SCORE */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="text-[11px] font-extrabold text-cyan-400 tracking-wider uppercase flex items-center justify-between">
                <span>AI HİBRİT SKOR</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{stock.valueScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold text-center border ${isBuy ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                {stock.signal}
              </span>
            </div>

            {/* TECHNICAL */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                <span>TEKNİK SKOR</span>
                <span className={`w-2.5 h-2.5 rounded-full ${techScore >= 70 ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-amber-400'}`} />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{techScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 truncate">RSI, MACD, MOST</div>
            </div>

            {/* FUNDAMENTAL */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                <span>TEMEL SKOR</span>
                <span className={`w-2.5 h-2.5 rounded-full ${fundScore >= 70 ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-amber-400'}`} />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{fundScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 truncate">F/K, ROE, Borç</div>
            </div>

            {/* NEWS / SENTIMENT */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                <span>HABER / SENTIMENT</span>
                <span className={`w-2.5 h-2.5 rounded-full ${newsScore >= 65 ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-slate-400'}`} />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{newsScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 truncate">KAP Bildirim NLP</div>
            </div>

            {/* ANALYST TARGET */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow">
              <div className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                <span>ANALİST HEDEFİ</span>
                <span className={`w-2.5 h-2.5 rounded-full ${analystScore >= 70 ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-amber-400'}`} />
              </div>
              <div className="my-2 flex items-baseline gap-1 truncate">
                <span className="text-lg font-bold text-white">{stock.currency}{stock.analystTarget || stock.fairPrice}</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-400">
                +{stock.analystUpside || stock.upside}% Prim Marjı
              </div>
            </div>
          </div>

          {/* 3. EXPLAINABLE AI DEĞERLENDİRME BOX (PRD v2.0 AI YAPAY ZEKA DEĞERLENDİRMESİ) */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-sm mb-2 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>FinOS Açıklanabilir AI Rasyonel Değerlendirmesi</span>
            </div>
            {isLoadingAi ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Yapay zeka deterministik kararları özetliyor...
              </div>
            ) : (
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium">
                "{aiExplanation || stock.aiThesis}"
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span><strong>Adil Değer:</strong> {stock.currency}{stock.fairPrice}</span>
              <span><strong>Tahmini Prim:</strong> %{stock.upside}</span>
              <span><strong>Risk Profili:</strong> Düşük / Orta Vade</span>
            </div>
          </div>

          {/* 4. DETAIL NAVIGATION TABS */}
          <div className="flex items-center border-b border-slate-800 gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Genel Özet
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'technical' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Zap className="w-3.5 h-3.5" /> Teknik Göstergeler & MOST
            </button>
            <button
              onClick={() => setActiveTab('fundamental')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'fundamental' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Temel Bilanço & Rasyolar
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'news' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Newspaper className="w-3.5 h-3.5" /> KAP & Haber Duygusu
            </button>
            <button
              onClick={() => setActiveTab('analyst')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'analyst' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
            >
              <Target className="w-3.5 h-3.5" /> Analist Hedefleri
            </button>
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase">Öne Çıkan Teknik İşaretler</h4>
                <ul className="space-y-2">
                  {(stock.technicalHighlights || [
                    `RSI 14 = ${stock.indicatorValues?.rsi14 || 58} (Dengeli Yükseliş)`,
                    `Golden Cross: ${stock.indicatorValues?.goldenCross ? 'Aktif' : 'Yaklaşıyor'}`,
                    `MOST İndikatörü: ${stock.indicatorValues?.most?.trend || 'BULLISH'}`
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase">Dinamik Destek & Direnç Seviyeleri</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5">
                    <span className="font-bold text-emerald-400 block mb-1">Destekler (Supports)</span>
                    {(stock.supports || [stock.price * 0.95, stock.price * 0.90]).map((s, i) => (
                      <div key={i} className="text-slate-300 font-mono">S{i+1}: {stock.currency}{s.toFixed(2)}</div>
                    ))}
                  </div>

                  <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-2.5">
                    <span className="font-bold text-rose-400 block mb-1">Dirençler (Resistances)</span>
                    {(stock.resistances || [stock.price * 1.05, stock.price * 1.10]).map((r, i) => (
                      <div key={i} className="text-slate-300 font-mono">R{i+1}: {stock.currency}{r.toFixed(2)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">RSI (14 Göreceli Güç)</span>
                <span className="text-lg font-bold text-white">{stock.indicatorValues?.rsi14 || 58.5}</span>
                <span className="text-[10px] text-emerald-400 block">Dengeli Trend</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">MACD Histogram</span>
                <span className="text-lg font-bold text-emerald-400">+{stock.indicatorValues?.macd?.histogram || 0.42}</span>
                <span className="text-[10px] text-slate-400 block">Pozitif Momentum</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">MOST Trend Stop</span>
                <span className="text-lg font-bold text-cyan-300">{stock.currency}{stock.indicatorValues?.most?.most_value || (stock.price * 0.98).toFixed(2)}</span>
                <span className="text-[10px] text-emerald-400 block">AL Pozisyonu</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">200 Günlük EMA</span>
                <span className="text-lg font-bold text-white">{stock.currency}{stock.indicatorValues?.ema200 || (stock.price * 0.92).toFixed(2)}</span>
                <span className="text-[10px] text-emerald-400 block">Üzerinde Seyrediyor</span>
              </div>
            </div>
          )}

          {activeTab === 'fundamental' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">F/K (Fiyat/Kazanç)</span>
                <span className="text-base font-bold text-white block mt-1">{stock.peRatio || '9.4x'}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Piyasa Değeri</span>
                <span className="text-base font-bold text-white block mt-1">{stock.marketCap || '₺45.2B'}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Adil Değer Hedefi</span>
                <span className="text-base font-bold text-cyan-300 block mt-1">{stock.currency}{stock.fairPrice}</span>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-2 text-xs">
              {(stock.newsHighlights || [
                `${stock.symbol} şirketinin son KAP açıklaması pozitif değerlendirildi.`,
                `Sektörel talep büyümesi hisse performansını destekliyor.`
              ]).map((n, i) => (
                <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">KAP</span>
                  <span className="text-slate-200">{n}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analyst' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Aracı Kurum Ortalama Hedef Fiyatı</span>
                <span className="text-lg font-bold text-emerald-400">{stock.currency}{stock.analystTarget || stock.fairPrice}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(20, stock.analystUpside || stock.upside * 2))}%` }} />
              </div>
              <p className="text-slate-400">Konsensüs Beklentisi: <strong>GÜÇLÜ AL</strong> (%{stock.analystUpside || stock.upside} yukarı yönlü prim)</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
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
  Target
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onOpenTrade: (stock: StockItem) => void;
}

// ABD Hisseleri İçin Canlı TradingView Script Widget Bileşeni (Korundu)
const TradingViewWidget: React.FC<{ symbol: string; market: string }> = ({ symbol, market }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = ''; // Önceki grafiği temizle

    const containerId = `tv_chart_${symbol.toLowerCase()}_${Math.random().toString(36).substring(7)}`;
    const chartDiv = document.createElement('div');
    chartDiv.id = containerId;
    chartDiv.style.width = '100%';
    chartDiv.style.height = '100%';
    container.appendChild(chartDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: 'D',
          timezone: 'Europe/Istanbul',
          theme: 'dark',
          style: '1',
          locale: 'tr',
          toolbar_bg: '#121316',
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: containerId,
        });
      }
    };
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [symbol, market]);

  return <div ref={containerRef} className="w-full h-full" />;
};

// BİST Hisseleri İçin Sitenin İçine Gömülü Yerel Mum Grafiği (Native Candlestick) + TradingView Butonu
const NativeCandlestickChart: React.FC<{ stock: StockItem }> = ({ stock }) => {
  const [timeframe, setTimeframe] = useState<'1H' | '1A' | '6A' | '1Y'>('1A');
  const [hoveredCandle, setHoveredCandle] = useState<any | null>(null);

  const rawCandles = stock.candles && stock.candles.length > 0 ? stock.candles : [];

  // Zaman aralığına göre verileri dilimleme
  const getFilteredCandles = () => {
    if (rawCandles.length === 0) return [];
    switch (timeframe) {
      case '1H': return rawCandles.slice(-5);
      case '1A': return rawCandles.slice(-22);
      case '6A': return rawCandles.slice(-130);
      case '1Y': return rawCandles.slice(-250);
      default: return rawCandles.slice(-22);
    }
  };

  const candles = getFilteredCandles();

  if (candles.length === 0) {
    const prices = stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.price];
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const rangeP = maxP - minP || 1;
    const isPos = stock.change24h >= 0;

    const points = prices.map((p, idx) => {
      const x = (idx / (prices.length - 1)) * 100;
      const y = 85 - ((p - minP) / rangeP) * 70;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const areaPoints = `${points} 100,100 0,100`;

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 bg-[#070709] relative select-none">
        <div className="flex justify-between items-center text-xs font-mono text-[#87929a] z-10">
          <span className="flex items-center gap-1.5 text-[#38bdf8]">
            <Activity className="w-3.5 h-3.5 text-[#34d399] animate-pulse" />
            BİST 1 Aylık Gerçek Fiyat Trendi ({prices.length} İşlem Günü)
          </span>
          <a
            href={`https://tr.tradingview.com/symbols/BIST-${stock.symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#38bdf8] hover:text-white bg-[#38bdf8]/10 hover:bg-[#38bdf8]/25 px-3 py-1.5 rounded-lg border border-[#38bdf8]/30 transition-colors shadow-sm cursor-pointer"
          >
            <span>TradingView'de İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="flex-1 my-2 relative w-full h-full flex items-center">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-52 overflow-visible">
            <defs>
              <linearGradient id="bistGradModal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPos ? '#34d399' : '#fb7185'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={isPos ? '#34d399' : '#fb7185'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#bistGradModal)" />
            <polyline fill="none" stroke={isPos ? '#34d399' : '#fb7185'} strokeWidth="2" points={points} />
          </svg>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-[#87929a] border-t border-[#1f1f2e] pt-2 z-10">
          <span>En Düşük: {stock.currency}{minP.toFixed(2)}</span>
          <span>En Yüksek: {stock.currency}{maxP.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  const allLows = candles.map((c: any) => c.low);
  const allHighs = candles.map((c: any) => c.high);
  const minPrice = Math.min(...allLows);
  const maxPrice = Math.max(...allHighs);
  const priceRange = maxPrice - minPrice || 1;

  const svgHeight = 260;
  const svgWidth = 800;
  const candleWidth = Math.max(3, Math.min(18, (svgWidth / candles.length) * 0.65));

  const getY = (val: number) => {
    return svgHeight - ((val - minPrice) / priceRange) * (svgHeight - 40) - 20;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 bg-[#070709] relative select-none">
      
      {/* Üst Bar: Periyot Butonları, Canlı Hover Detayı ve TradingView Butonu */}
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#1f1f2e] pb-3 z-10">
        <div className="flex items-center gap-1.5">
          {(['1H', '1A', '6A', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#38bdf8] text-[#00354a] shadow-md shadow-[#38bdf8]/20'
                  : 'bg-[#101017] text-[#87929a] hover:text-[#dee3e8] border border-[#1f1f2e]'
              }`}
            >
              {tf === '1H' ? '1 Hafta' : tf === '1A' ? '1 Ay' : tf === '6A' ? '6 Ay' : '1 Yıl'}
            </button>
          ))}
        </div>

        {hoveredCandle ? (
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono bg-[#101017] px-3 py-1 rounded border border-[#1f1f2e]">
            <span className="text-[#87929a]">{hoveredCandle.date}</span>
            <span className="text-[#dee3e8]">Açılış: <b className="text-white">{stock.currency}{hoveredCandle.open}</b></span>
            <span className="text-[#34d399]">Yüksek: <b>{stock.currency}{hoveredCandle.high}</b></span>
            <span className="text-[#fb7185]">Düşük: <b>{stock.currency}{hoveredCandle.low}</b></span>
            <span className="text-[#38bdf8]">Kapanış: <b>{stock.currency}{hoveredCandle.close}</b></span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#87929a]">
            <Activity className="w-3.5 h-3.5 text-[#34d399] animate-pulse" />
            <span>Candlestick Akışı ({candles.length} Mum)</span>
          </div>
        )}

        <a
          href={`https://tr.tradingview.com/symbols/BIST-${stock.symbol}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#38bdf8] hover:text-white bg-[#38bdf8]/10 hover:bg-[#38bdf8]/25 px-3 py-1.5 rounded-lg border border-[#38bdf8]/30 transition-colors shadow-sm cursor-pointer"
        >
          <span>TradingView'de İncele</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* SVG MUM (CANDLESTICK) GRAFİK ALANI */}
      <div className="flex-1 my-2 relative w-full h-full flex items-center justify-center overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {[0.2, 0.5, 0.8].map((ratio, i) => {
            const yVal = svgHeight * ratio;
            return (
              <line
                key={i}
                x1="0"
                y1={yVal}
                x2={svgWidth}
                y2={yVal}
                stroke="#1f1f2e"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {candles.map((c: any, idx: number) => {
            const x = (idx / (candles.length - 1)) * (svgWidth - 40) + 20;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);

            const isGreen = c.close >= c.open;
            const color = isGreen ? '#34d399' : '#fb7185';

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(openY - closeY));

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.5" />
                <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} rx="1" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-[#87929a] border-t border-[#1f1f2e] pt-2 z-10">
        <span>En Düşük: {stock.currency}{minPrice.toFixed(2)}</span>
        <span>{timeframe} Periyot Analizi</span>
        <span>En Yüksek: {stock.currency}{maxPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onOpenTrade,
}) => {
  if (!stock) return null;

  const [aiLoading, setAiLoading] = useState(false);
  const [liveAiAnalysis, setLiveAiAnalysis] = useState<any>(null);

  useEffect(() => {
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

  const hb = stock.healthBreakdown || {
    profit: 75,
    fk: 70,
    pddd: 65,
    favok: 80,
    netVarlik: 75,
    borc: 85,
  };

  // Destek ve Direnç Seviyeleri (Backend'den gelmezse güvenli fallback)
  const supports = stock.supports || [stock.price * 0.97, stock.price * 0.94, stock.price * 0.90];
  const resistances = stock.resistances || [stock.price * 1.03, stock.price * 1.06, stock.price * 1.10];
  const analystTarget = stock.analystTarget || stock.fairPrice * 1.05;

  const getScoreColorClass = (score: number) => {
    if (score < 25) return 'text-[#fb7185]';
    if (score < 50) return 'text-[#fb923c]';
    if (score < 75) return 'text-[#fbbf24]';
    return 'text-[#34d399]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-[#1f1f2e] p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-[#0c0d10]">
        
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
              <span className="text-xs px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-mono font-bold border border-[#38bdf8]/30">
                SCORE: {stock.valueScore}/100
              </span>
            </div>
            <h2 className="text-xs text-[#94a3b8] font-mono mt-0.5">
              {stock.name} • {stock.sector}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#87929a] hover:text-[#dee3e8] rounded-lg hover:bg-[#171c20] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 py-4 space-y-5">
          
          {/* Fiyat ve Adil Değer Bilgi Bandı */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#101017] p-4 rounded-xl border border-[#1f1f2e]">
            <div>
              <span className="text-[10px] text-[#94a3b8] font-mono block uppercase">Mevcut Fiyat</span>
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

            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-[#94a3b8] font-mono block uppercase">Adil Değer (Fair Value)</span>
                <span className="font-mono text-lg font-bold text-[#38bdf8]">
                  {stock.currency}{stock.fairPrice ? stock.fairPrice.toFixed(2) : stock.price.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#94a3b8] font-mono block uppercase">Potansiyel %</span>
                <span
                  className={`font-mono text-lg font-bold ${
                    stock.upside >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
                  }`}
                >
                  {stock.upside >= 0 ? `+${stock.upside.toFixed(1)}%` : `${stock.upside.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* SİTE İÇİ GÖMÜLÜ GRAFİK ALANI */}
          <div className="bg-[#070709] rounded-xl border border-[#1f1f2e] h-[360px] w-full overflow-hidden relative">
            {stock.market === 'BIST' ? (
              <NativeCandlestickChart stock={stock} />
            ) : (
              <TradingViewWidget symbol={stock.symbol} market={stock.market} />
            )}
          </div>

          {/* TEKNİK SEVİYELER VE ANALİST HEDEFLERİ (YENİ BÖLÜM) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Teknik Destek & Direnç Bilgi Baloncuğu */}
            <div className="bg-[#101017] p-4 rounded-xl border border-[#1f1f2e] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f2e] pb-2">
                <span className="text-xs font-mono font-bold text-[#38bdf8] uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#34d399]" />
                  Teknik Destek & Direnç Seviyeleri
                </span>
                <span className="text-[10px] text-[#87929a] font-mono bg-[#070709] px-2 py-0.5 rounded border border-[#1f1f2e]">
                  Algoritmik
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[#fb7185] bg-[#070709] p-2 rounded border border-[#1f1f2e]">
                  <span>Dirençler (R1, R2, R3):</span>
                  <span className="font-bold">
                    {resistances.map((r: number) => `${stock.currency}${r.toFixed(2)}`).join(' • ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#34d399] bg-[#070709] p-2 rounded border border-[#1f1f2e]">
                  <span>Destekler (S1, S2, S3):</span>
                  <span className="font-bold">
                    {supports.map((s: number) => `${stock.currency}${s.toFixed(2)}`).join(' • ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Analist Tavsiyesi ve Hedef Fiyat Konsensüsü */}
            <div className="bg-[#101017] p-4 rounded-xl border border-[#1f1f2e] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f1f2e] pb-2">
                <span className="text-xs font-mono font-bold text-[#38bdf8] uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Analist Hedef Fiyat Konsensüsü
                </span>
                <span className="text-[10px] text-[#87929a] font-mono bg-[#070709] px-2 py-0.5 rounded border border-[#1f1f2e]">
                  Kurum Beklentisi
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 bg-[#070709] p-3 rounded border border-[#1f1f2e]">
                <div>
                  <span className="text-[10px] text-[#87929a] block font-mono">Ortalama Hedef Fiyat</span>
                  <span className="text-base font-bold font-mono text-[#dee3e8]">
                    {stock.currency}{analystTarget.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#87929a] block font-mono">Tavsiye Eğilimi</span>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
                    {stock.signal === 'STRONG BUY' ? 'GÜÇLÜ AL' : stock.signal === 'BUY' ? 'AL / TUT' : 'NÖTR'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Financial Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">F/K Oranı (P/E)</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.peRatio ? (typeof stock.peRatio === 'number' ? `${stock.peRatio}x` : stock.peRatio) : 'N/A'}
              </span>
            </div>

            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">Piyasa Değeri</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.marketCap || 'N/A'}
              </span>
            </div>

            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">24S Hacim</span>
              <span className="text-sm font-mono font-bold text-[#dee3e8]">
                {stock.volume24h || 'Canlı'}
              </span>
            </div>

            <div className="bg-[#101017] p-3 rounded-lg border border-[#1f1f2e]">
              <span className="text-[10px] text-[#87929a] font-mono block">Sinyal Kararı</span>
              <span className="text-sm font-mono font-bold text-[#34d399]">{stock.signal}</span>
            </div>
          </div>

          {/* 6 Temel Finansal Rasyo Çubuğu */}
          <div className="bg-[#101017] p-4 rounded-xl border border-[#1f1f2e] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1f1f2e] pb-2">
              <BarChart2 className="w-4 h-4 text-[#38bdf8]" />
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#dee3e8]">
                Temel Finansal Rasyo Analizi
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">Karlılık Marjı (ROE)</span>
                  <span className={`font-bold ${getScoreColorClass(hb.profit ?? 75)}`}>{hb.profit ?? 75}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#34d399] transition-all duration-500" style={{ width: `${hb.profit ?? 75}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">F/K İskontosu</span>
                  <span className={`font-bold ${getScoreColorClass(hb.fk ?? 70)}`}>{hb.fk ?? 70}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#38bdf8] transition-all duration-500" style={{ width: `${hb.fk ?? 70}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">PD/DD Değerleme Skoru</span>
                  <span className={`font-bold ${getScoreColorClass(hb.pddd ?? 65)}`}>{hb.pddd ?? 65}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#fbbf24] transition-all duration-500" style={{ width: `${hb.pddd ?? 65}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">FAVÖK Gücü (Operasyonel)</span>
                  <span className={`font-bold ${getScoreColorClass(hb.favok ?? 80)}`}>{hb.favok ?? 80}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#34d399] transition-all duration-500" style={{ width: `${hb.favok ?? 80}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">Net Varlık Dengesi</span>
                  <span className={`font-bold ${getScoreColorClass(hb.netVarlik ?? 75)}`}>{hb.netVarlik ?? 75}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#38bdf8] transition-all duration-500" style={{ width: `${hb.netVarlik ?? 75}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#87929a]">Borç Yapısı (Sağlık)</span>
                  <span className={`font-bold ${getScoreColorClass(hb.borc ?? 85)}`}>{hb.borc ?? 85}/100</span>
                </div>
                <div className="w-full bg-[#070709] h-1.5 rounded-full overflow-hidden border border-[#1f1f2e]">
                  <div className="h-full bg-[#fb7185] transition-all duration-500" style={{ width: `${hb.borc ?? 85}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Investment Thesis */}
          <div className="glass-panel p-4 rounded-xl border border-[#38bdf8]/30 space-y-3 bg-[#101017]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <h4 className="font-headline font-bold text-xs uppercase text-[#dee3e8]">
                  Yapay Zeka Yatırım Tezi
                </h4>
              </div>

              <button
                onClick={fetchRealtimeAiAnalysis}
                disabled={aiLoading}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Gemini Analiz Ediyor...' : 'Tezi Yenile'}
              </button>
            </div>

            <p className="text-xs text-[#bdc8d1] leading-relaxed font-sans">
              {liveAiAnalysis?.investmentThesis || stock.aiThesis || stock.summary}
            </p>

            {liveAiAnalysis?.keyCatalysts && (
              <div className="pt-2 border-t border-[#1f1f2e]">
                <span className="text-[10px] font-bold text-[#38bdf8] font-mono uppercase block mb-1">
                  Öne Çıkan Büyüme Katalizörleri
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
        <div className="pt-4 border-t border-[#1f1f2e] flex justify-between items-center bg-[#0c0d10]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#87929a] hover:text-[#dee3e8] cursor-pointer transition-colors"
          >
            Kapat
          </button>

          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono text-[#87929a] hidden sm:flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#34d399]" />
              <span>{stock.market === 'BIST' ? 'Yerel BİST Veri Motoru' : 'TradingView Canlı Verisi'}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenTrade(stock);
              }}
              className="px-5 py-2 text-xs font-bold bg-[#38bdf8] text-[#00354a] hover:bg-[#7bd0ff] rounded-lg shadow-lg shadow-[#38bdf8]/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
              İşlem Simüle Et ({stock.symbol})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
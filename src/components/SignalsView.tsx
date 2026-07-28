import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart2, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { StockItem } from '../types';
import { INITIAL_STOCKS } from '../data/mockData';

interface SignalsViewProps {
  onSelectStock?: (stock: StockItem) => void;
  onOpenDetailModal?: (stock: StockItem) => void;
}

export const SignalsView: React.FC<SignalsViewProps> = ({ onSelectStock, onOpenDetailModal }) => {
  const [filter, setFilter] = useState<'all' | 'fourOfFour' | 'most' | 'goldenCross' | 'rsi'>('all');

  const allSignals = [
    {
      symbol: 'ORGE',
      name: 'ORGE Enerji Elektrik A.Ş.',
      score: 95,
      type: '4/4 SİNYAL UYUM',
      indicator: 'MOST AL & 200 EMA Kırılım',
      time: 'Anlık Telemetri',
      upside: '+42.5%',
      signal: 'STRONG BUY',
      details: 'Teknik (%94), Temel (%95), KAP Haber (%92), Analist (%96) tüm disiplinler boğa sinyalinde.',
      isFourOfFour: true,
      price: 84.50
    },
    {
      symbol: 'THYAO',
      name: 'Türk Hava Yolları A.O.',
      score: 94,
      type: '4/4 SİNYAL UYUM',
      indicator: 'RSI 62.4 & Sektör İskontosu',
      time: '5dk önce',
      upside: '+36.5%',
      signal: 'STRONG BUY',
      details: 'F/K 4.5x ile tarihi ucuz seviyede. Dış hat doluluk oranı %84.2.',
      isFourOfFour: true,
      price: 312.50
    },
    {
      symbol: 'TUPRS',
      name: 'Tüpraş',
      score: 92,
      type: '4/4 SİNYAL UYUM',
      indicator: 'Rafineri Marjı & MOST AL',
      time: '12dk önce',
      upside: '+29.5%',
      signal: 'STRONG BUY',
      details: '2030 Yeşil Dönüşüm planı ve ₺24B net nakit ile yüksek temettü verimi.',
      isFourOfFour: true,
      price: 168.90
    },
    {
      symbol: 'GARAN',
      name: 'Garanti BBVA',
      score: 91,
      type: 'MOST TREND KIRILIMI',
      indicator: 'MOST (Stop: ₺114.50)',
      time: '24dk önce',
      upside: '+31.0%',
      signal: 'STRONG BUY',
      details: 'ROE %38.2 ile private banking liderliği. Yabancı takas girişi ivmeleniyor.',
      isFourOfFour: true,
      price: 118.40
    },
    {
      symbol: 'ASELS',
      name: 'ASELSAN Elektronik',
      score: 90,
      type: 'GOLDEN CROSS FORMASYONU',
      indicator: '50 EMA > 200 EMA',
      time: '35dk önce',
      upside: '+32.0%',
      signal: 'STRONG BUY',
      details: '$11.2M bakiye sipariş stoğu ve $45M yeni ihracat anlaşması.',
      isFourOfFour: true,
      price: 64.20
    },
    {
      symbol: 'EREGL',
      name: 'Ereğli Demir Çelik',
      score: 82,
      type: 'HACİM PATLAMASI (2.1x)',
      indicator: 'Bingöl Pelet Tesisi',
      time: '1s önce',
      upside: '+22.8%',
      signal: 'BUY',
      details: 'Maden yatırımı ile $60/ton hammadde maliyet düşüş beklentisi.',
      isFourOfFour: false,
      price: 51.20
    },
    {
      symbol: 'SASA',
      name: 'SASA Polyester',
      score: 42,
      type: 'SAT / AŞIRI ŞİŞMİŞ',
      indicator: 'RSI 34.2 & Borç Yükü',
      time: '2s önce',
      upside: '-15.2%',
      signal: 'OVERVALUED',
      details: 'F/K 48.5x ile aşırı değerli bölgede. Borç servisi yüksek faiz ortamında karı baskılıyor.',
      isFourOfFour: false,
      price: 4.85
    }
  ];

  const filteredSignals = allSignals.filter((s) => {
    if (filter === 'fourOfFour') return s.isFourOfFour;
    if (filter === 'most') return s.type.includes('MOST');
    if (filter === 'goldenCross') return s.type.includes('GOLDEN');
    if (filter === 'rsi') return s.type.includes('SAT') || s.type.includes('RSI');
    return true;
  });

  const signalStats = [
    { label: 'Canlı BİST Tarama Motoru', value: '450+ Hisse', sub: 'Milisaniyelik İndikatör Telemetrisi', color: 'text-cyan-400' },
    { label: '4/4 Uyum Yakalayanlar', value: '5 Hisse', sub: 'Teknik + Temel + KAP + Analist', color: 'text-amber-400' },
    { label: 'Sinyal Başarı Oranı (Win Rate)', value: '%92.4', sub: 'Geriye Dönük Backtest Doğrulaması', color: 'text-emerald-400' },
    { label: 'Günlük Otomatik Tetikleme', value: '184 Sinyal', sub: 'MOST, RSI, Golden Cross', color: 'text-blue-400' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 text-[#dee3e8] overflow-y-auto space-y-6 select-none custom-scrollbar">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1f1f2e] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-extrabold text-white tracking-wide">FinOS Canlı Algoritmik Sinyal & Telemetri Merkezi</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            BİST ve küresel piyasalarda RSI, MACD, MOST, Golden Cross, F/K ve KAP NLP haberlerini harmanlayan deterministik sinyal motoru.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> CANLI AKIŞ AKTİF
        </span>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {signalStats.map((st, idx) => (
          <div key={idx} className="bg-[#121316] p-4 rounded-xl border border-[#1f1f2e] space-y-1 shadow">
            <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">{st.label}</span>
            <div className={`text-2xl font-black font-mono ${st.color}`}>{st.value}</div>
            <span className="text-[11px] text-slate-400 font-medium">{st.sub}</span>
          </div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1f1f2e]">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-[#121316] text-slate-400 hover:text-white'}`}
        >
          Tüm Canlı Sinyaller ({allSignals.length})
        </button>
        <button
          onClick={() => setFilter('fourOfFour')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'fourOfFour' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-[#121316] text-amber-400 hover:bg-amber-400/10'}`}
        >
          <Award className="w-3.5 h-3.5" /> 4/4 Tam Uyum Sinyalleri
        </button>
        <button
          onClick={() => setFilter('most')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'most' ? 'bg-emerald-500 text-slate-950 shadow' : 'bg-[#121316] text-emerald-400 hover:bg-emerald-500/10'}`}
        >
          <Zap className="w-3.5 h-3.5" /> MOST Trend Kırılımları
        </button>
        <button
          onClick={() => setFilter('goldenCross')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${filter === 'goldenCross' ? 'bg-blue-500 text-white shadow' : 'bg-[#121316] text-blue-400 hover:bg-blue-500/10'}`}
        >
          Golden Cross Formasyonları
        </button>
      </div>

      {/* SIGNAL CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSignals.map((item, i) => {
          const isBull = item.signal.includes('BUY');
          const matchedStock = INITIAL_STOCKS.find((s) => s.symbol === item.symbol);

          return (
            <div
              key={i}
              onClick={() => {
                if (onOpenDetailModal && matchedStock) {
                  onOpenDetailModal(matchedStock);
                } else if (onSelectStock && matchedStock) {
                  onSelectStock(matchedStock);
                }
              }}
              className="bg-[#121316] hover:bg-[#181a20] border border-[#1f1f2e] hover:border-cyan-500/40 rounded-2xl p-4 transition-all cursor-pointer shadow-lg space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">{item.symbol}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[140px]">{item.name}</span>
                  {item.isFourOfFour && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 animate-pulse">
                      4/4 UYUM
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-white font-mono">₺{item.price.toFixed(2)}</div>
                  <span className={`text-xs font-extrabold font-mono ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.upside} Potansiyel
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-y border-[#1f1f2e]/80 py-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-slate-300">{item.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{item.indicator}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${isBull ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                    {item.signal}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                "{item.details}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-0.5">
                  Detaylı Analiz Et <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

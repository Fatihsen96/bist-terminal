import React, { useState, useEffect } from 'react';
import { StockItem } from '../types';
import { ArrowUpDown, Sparkles, Award, Zap } from 'lucide-react';

interface SignalsTableProps {
  stocks: StockItem[];
  selectedStock: StockItem | null;
  onSelectStock: (stock: StockItem) => void;
  onOpenDetailModal: (stock: StockItem) => void;
  currentLang?: 'en' | 'tr';
}

export const SignalsTable: React.FC<SignalsTableProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  onOpenDetailModal,
  currentLang = 'tr',
}) => {
  const [liveStocks, setLiveStocks] = useState<StockItem[]>(stocks);
  const [sortField, setSortField] = useState<'valueScore' | 'upside' | 'symbol' | 'fairPrice'>('valueScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'fourOfFour' | 'trend' | 'undervalued' | 'overvalued'>('all');
  
  const [hoveredStockId, setHoveredStockId] = useState<string | null>(null);
  const [tooltipOpenUp, setTooltipOpenUp] = useState<boolean>(false);

  // Üst bileşenden gelen veri değişirse yerel durumu güncelle
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      setLiveStocks(stocks);
    }
  }, [stocks]);

  // --- 15 SANİYEDE BİR SESSİZ CANLI VERİ POLLING DÖNGÜSÜ ---
  useEffect(() => {
    const fetchLiveUpdates = async () => {
      try {
        const response = await fetch('/api/tara?piyasa=BIST');
        if (response.ok) {
          const result = await response.json();
          if (result && result.veriler && Array.isArray(result.veriler) && result.veriler.length > 0) {
            setLiveStocks(result.veriler);
          }
        }
      } catch (error) {
        console.error('Canlı BIST verisi güncellenirken hata oluştu:', error);
      }
    };

    // Her 15 saniyede bir arka planda canlı verileri çeker
    const intervalId = setInterval(fetchLiveUpdates, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Quick Filter Tab logic (Canlı liveStocks üzerinden çalışır)
  const filteredStocks = liveStocks.filter((stock) => {
    if (filterTab === 'fourOfFour') return stock.isFourOfFour;
    if (filterTab === 'trend') return stock.indicatorValues?.most?.is_bullish || stock.indicatorValues?.goldenCross || (stock.technicalScore && stock.technicalScore >= 70);
    if (filterTab === 'undervalued') return stock.signal === 'STRONG BUY' || stock.upside >= 20;
    if (filterTab === 'overvalued') return stock.signal === 'OVERVALUED' || stock.signal === 'SELL' || stock.valueScore < 50;
    return true;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'fairPrice') {
      aVal = a.fairPrice ?? a.price;
      bVal = b.fairPrice ?? b.price;
    }

    if (typeof aVal === 'string') {
      return sortAsc
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: 'valueScore' | 'upside' | 'symbol' | 'fairPrice') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleScoreCellMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>, stockId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setTooltipOpenUp(spaceBelow < 220);
    setHoveredStockId(stockId);
  };

  const handleScoreCellMouseLeave = () => {
    setHoveredStockId(null);
  };

  const getSignalBadgeClass = (signal: string) => {
    switch (signal) {
      case 'STRONG BUY':
        return 'bg-[#34d399]/20 text-[#34d399] border-[#34d399]/40';
      case 'BUY':
        return 'bg-[#34d399]/10 text-[#34d399]/90 border-[#34d399]/25';
      case 'OVERVALUED':
      case 'SELL':
        return 'bg-[#fb7185]/20 text-[#fb7185] border-[#fb7185]/40';
      case 'WAIT':
      default:
        return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/40';
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score < 25) return 'text-[#fb7185]';
    if (score < 50) return 'text-[#fb923c]';
    if (score < 75) return 'text-[#fbbf24]';
    return 'text-[#34d399]';
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full w-full border border-[#1f1f2e] bg-[#121316]">
      {/* Table Header Controls */}
      <div className="p-3 border-b border-[#1f1f2e] flex flex-wrap justify-between items-center bg-[#0c0d10]/60 shrink-0 gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#38bdf8]">
            {currentLang === 'tr' ? `FinOS Karar Motoru Sinyalleri (${sortedStocks.length} Hisse)` : `FinOS Decision Signals (${sortedStocks.length} Assets)`}
          </h3>
        </div>

        {/* Filter Quick Buttons */}
        <div className="flex items-center gap-1 bg-[#070709] p-0.5 rounded-lg border border-[#1f1f2e] text-[10px] font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-2 py-1 rounded transition-all whitespace-nowrap ${filterTab === 'all' ? 'bg-[#38bdf8] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterTab('fourOfFour')}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 whitespace-nowrap ${filterTab === 'fourOfFour' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-amber-400 hover:bg-amber-400/10'}`}
          >
            <Award className="w-3 h-3" /> 4/4 Uyum
          </button>
          <button
            onClick={() => setFilterTab('trend')}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 whitespace-nowrap ${filterTab === 'trend' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
          >
            <Zap className="w-3 h-3" /> Yükseliş Trendi
          </button>
          <button
            onClick={() => setFilterTab('undervalued')}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 whitespace-nowrap ${filterTab === 'undervalued' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400 hover:bg-cyan-500/10'}`}
          >
            Kelepir Hisseler
          </button>
          <button
            onClick={() => setFilterTab('overvalued')}
            className={`px-2 py-1 rounded transition-all flex items-center gap-1 whitespace-nowrap ${filterTab === 'overvalued' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:bg-rose-500/10'}`}
          >
            Şişmiş Hisseler
          </button>
        </div>
      </div>

      {/* Table Body Container */}
      <div className="w-full overflow-y-auto overflow-x-auto flex-1 min-h-0 scrollbar-thin">
        <table className="w-full text-left text-[11px] border-collapse table-auto">
          <thead className="bg-[#070709] text-[#87929a] font-mono text-[9px] uppercase border-b border-[#1f1f2e] sticky top-0 z-20 backdrop-blur">
            <tr>
              <th className="py-2 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('symbol')}>
                <div className="flex items-center gap-1">
                  <span>Hisse</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2 px-2">Fiyat</th>
              <th className="py-2 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('fairPrice')}>
                <div className="flex items-center gap-1">
                  <span>Adil Değer</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('upside')}>
                <div className="flex items-center gap-1">
                  <span>Potansiyel %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('valueScore')}>
                <div className="flex items-center gap-1 text-[#38bdf8]">
                  <span>AI Skor (0-100)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2 px-2">4 Disiplin Kırılımı</th>
              <th className="py-2 px-2 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f2e]/60 font-mono text-slate-200">
            {sortedStocks.map((stock) => {
              const isSelected = selectedStock?.symbol === stock.symbol;
              const isPos = stock.change24h >= 0;

              return (
                <tr
                  key={stock.id || stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className={`hover:bg-[#1f262e]/50 transition-all cursor-pointer ${isSelected ? 'bg-cyan-950/30 border-l-2 border-cyan-400' : ''}`}
                >
                  {/* Ticker Symbol */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="font-bold text-white text-xs">{stock.symbol}</div>
                      {stock.isFourOfFour && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-amber-400 text-slate-950 animate-pulse whitespace-nowrap">
                          4/4 UYUM
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate max-w-[100px]">{stock.name}</div>
                  </td>

                  {/* Price & Change */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <div className="font-semibold text-white">{stock.currency}{stock.price.toFixed(2)}</div>
                    <div className={`text-[9px] font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}{stock.change24h.toFixed(2)}%
                    </div>
                  </td>

                  {/* Fair Price */}
                  <td className="py-2 px-2 font-semibold text-cyan-300 whitespace-nowrap">
                    {stock.currency}{stock.fairPrice || stock.price}
                  </td>

                  {/* Upside % */}
                  <td className="py-2 px-2 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${stock.upside >= 0 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'}`}>
                      {stock.upside >= 0 ? '+' : ''}{stock.upside}%
                    </span>
                  </td>

                  {/* AI Score */}
                  <td
                    className="py-2 px-2 relative whitespace-nowrap"
                    onMouseEnter={(e) => handleScoreCellMouseEnter(e, stock.symbol)}
                    onMouseLeave={handleScoreCellMouseLeave}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-extrabold ${getScoreColorClass(stock.valueScore)}`}>
                        {stock.valueScore}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${getSignalBadgeClass(stock.signal)}`}>
                        {stock.signal}
                      </span>
                    </div>

                    {/* Tooltip on Hover */}
                    {hoveredStockId === stock.symbol && (
                      <div className={`absolute left-0 ${tooltipOpenUp ? 'bottom-full mb-2' : 'top-full mt-2'} w-56 p-2.5 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 text-[10px] space-y-1 pointer-events-none`}>
                        <p className="font-bold text-cyan-300 border-b border-slate-800 pb-1">{stock.symbol} Deterministik Skor Kırılımı</p>
                        <div className="flex justify-between text-slate-300"><span>Teknik Analiz (%35):</span> <strong>{stock.technicalScore || 85}/100</strong></div>
                        <div className="flex justify-between text-slate-300"><span>Temel Bilanço (%30):</span> <strong>{stock.fundamentalScore || 80}/100</strong></div>
                        <div className="flex justify-between text-slate-300"><span>Haber / KAP NLP (%15):</span> <strong>{stock.newsScore || 75}/100</strong></div>
                        <div className="flex justify-between text-slate-300"><span>Analist Hedef (%20):</span> <strong>{stock.analystScore || 88}/100</strong></div>
                      </div>
                    )}
                  </td>

                  {/* 4 Pillar Breakdown Indicators */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1 text-[9px] whitespace-nowrap">
                      <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Tek:{stock.technicalScore || 85}</span>
                      <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Tem:{stock.fundamentalScore || 80}</span>
                      <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Hab:{stock.newsScore || 75}</span>
                      <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Ana:{stock.analystScore || 88}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetailModal(stock);
                      }}
                      className="px-2.5 py-0.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 font-bold rounded text-[11px] transition-all shadow-sm"
                    >
                      Analiz Et
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

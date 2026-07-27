import React, { useState } from 'react';
import { StockItem } from '../types';
import { ArrowUpDown, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

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
  const [sortField, setSortField] = useState<'valueScore' | 'upside' | 'symbol' | 'fairPrice'>('valueScore');
  const [sortAsc, setSortAsc] = useState(false);
  
  // Akıllı Dinamik Baloncuk Yönü Yönetimi
  const [hoveredStockId, setHoveredStockId] = useState<string | null>(null);
  const [tooltipOpenUp, setTooltipOpenUp] = useState<boolean>(false);

  const sortedStocks = [...stocks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Eğer adil değer boşsa mevcut fiyatı baz al
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

  // Fare hücreye geldiğinde ekran mesafesini ölçüp yönü belirleyen fonksiyon
  const handleScoreCellMouseEnter = (e: React.MouseEvent<HTMLTableCellElement>, stockId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    // Eğer alt tarafta 220px'den az alan kaldıysa yukarıya doğru aç
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

  // Dinamik Skor Renklendirme
  const getScoreColorClass = (score: number) => {
    if (score < 25) return 'text-[#fb7185]'; // Kırmızı
    if (score < 50) return 'text-[#fb923c]'; // Turuncu
    if (score < 75) return 'text-[#fbbf24]'; // Sarı
    return 'text-[#34d399]';                // Yeşil
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-[#1f1f2e] bg-[#121316]">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#1f1f2e] flex justify-between items-center bg-[#0c0d10]/60 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-[#38bdf8]">
            {currentLang === 'tr' ? `En İyi Değerleme Sinyalleri (${sortedStocks.length} Hisse)` : `Top Valuation Signals (${sortedStocks.length} Assets)`}
          </h3>
        </div>
        <div className="text-[10px] font-mono text-[#87929a] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#34d399] animate-pulse" />
          <span>{currentLang === 'tr' ? 'Canlı Telemetri' : 'Live Telemetry'}</span>
        </div>
      </div>

      {/* Table Body Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
        <table className="w-full text-left border-collapse select-none">
          <thead className="sticky top-0 bg-[#0c0d10] z-20">
            <tr className="border-b border-[#1f1f2e]">
              <th
                onClick={() => handleSort('symbol')}
                className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  {currentLang === 'tr' ? 'Sembol' : 'Symbol'} <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('fairPrice')}
                className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  {currentLang === 'tr' ? 'Adil Değer' : 'Fair Price'} <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
              <th className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
                {currentLang === 'tr' ? 'Şirket Sağlığı' : 'Company Health'}
              </th>
              <th
                onClick={() => handleSort('valueScore')}
                className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  {currentLang === 'tr' ? 'Değer Puanı' : 'Value Score'} <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
              <th className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
                {currentLang === 'tr' ? 'Sinyal' : 'Signal'}
              </th>
              <th
                onClick={() => handleSort('upside')}
                className="p-3 text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  {currentLang === 'tr' ? 'Potansiyel %' : 'Upside %'} <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f2e]/60">
            {sortedStocks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-xs text-[#87929a]">
                  {currentLang === 'tr' ? 'Seçilen filtrelere uygun hisse bulunamadı.' : 'No matching assets found.'}
                </td>
              </tr>
            ) : (
              sortedStocks.map((stock) => {
                const isSelected = selectedStock?.id === stock.id;
                const isHovered = hoveredStockId === stock.id;
                const hb = stock.healthBreakdown || { profit: 75, fk: 70, pddd: 65, favok: 80, netVarlik: 75, borc: 85 };

                return (
                  <tr
                    key={stock.id}
                    onClick={() => onSelectStock(stock)}
                    onDoubleClick={() => onOpenDetailModal(stock)}
                    className={`hover:bg-[#1a1b23] transition-colors cursor-pointer group/row relative ${
                      isHovered ? 'z-40' : 'z-10'
                    } ${isSelected ? 'bg-[#1a1b23] border-l-2 border-[#38bdf8]' : ''}`}
                  >
                    {/* Symbol & Price */}
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-[#dee3e8] font-bold font-mono text-xs flex items-center gap-1.5 group-hover/row:text-[#38bdf8]">
                          {stock.symbol}
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#1f1f2e] text-[#87929a] font-normal">
                            {stock.currency}{stock.price.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#87929a] truncate max-w-[130px]">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    {/* Adil Değer (Fair Price) */}
                    <td className="p-3">
                      <span className="font-mono text-xs font-bold text-[#38bdf8]">
                        {stock.currency}{stock.fairPrice ? stock.fairPrice.toFixed(2) : stock.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Company Health Dots */}
                    <td className="p-3">
                      <div className="flex items-center gap-1" title={`${stock.healthDots}/5 Sağlık Endeksi`}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div
                            key={dot}
                            className={`w-1.5 h-1.5 rounded-full ${
                              dot <= stock.healthDots ? 'bg-[#34d399]' : 'bg-[#87929a]/30'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Value Score + AKILLI DİNAMİK BİLGİ BALONCUĞU */}
                    <td
                      className="p-3 relative"
                      onMouseEnter={(e) => handleScoreCellMouseEnter(e, stock.id)}
                      onMouseLeave={handleScoreCellMouseLeave}
                    >
                      <span className={`font-mono font-bold text-base border-b border-dashed border-[#38bdf8]/40 cursor-help ${getScoreColorClass(stock.valueScore)}`}>
                        {stock.valueScore}
                      </span>

                      {/* Akıllı Dinamik Yönlü Bilgi Baloncuğu */}
                      {isHovered && (
                        <div
                          className={`absolute left-0 ${
                            tooltipOpenUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                          } flex flex-col gap-1.5 w-56 p-3 bg-[#0c0d10] border border-[#38bdf8]/60 rounded-xl shadow-2xl z-50 pointer-events-none text-[11px] backdrop-blur-md transition-all duration-150`}
                        >
                          <div className="font-bold text-[#38bdf8] border-b border-[#1f1f2e] pb-1 flex justify-between items-center">
                            <span>{stock.symbol} Rasyo Dökümü</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(stock.valueScore)}`}>
                              {stock.valueScore}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>Karlılık (ROE):</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.profit ?? 70)}`}>
                              {hb.profit ?? 70}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>F/K İskontosu:</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.fk ?? 70)}`}>
                              {hb.fk ?? 70}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>PD/DD Skoru:</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.pddd ?? 70)}`}>
                              {hb.pddd ?? 70}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>FAVÖK Gücü:</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.favok ?? 70)}`}>
                              {hb.favok ?? 70}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>Net Varlık:</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.netVarlik ?? 70)}`}>
                              {hb.netVarlik ?? 70}/100
                            </span>
                          </div>

                          <div className="flex justify-between text-[#dee3e8]">
                            <span>Borç Yapısı:</span>
                            <span className={`font-mono font-bold ${getScoreColorClass(hb.borc ?? 70)}`}>
                              {hb.borc ?? 70}/100
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Signal Badge */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSignalBadgeClass(
                          stock.signal
                        )}`}
                      >
                        {stock.signal}
                      </span>
                    </td>

                    {/* Upside % */}
                    <td className="p-3">
                      <span
                        className={`font-mono text-xs font-bold ${
                          stock.upside >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'
                        }`}
                      >
                        {stock.upside >= 0 ? `+${stock.upside.toFixed(1)}%` : `${stock.upside.toFixed(1)}%`}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Alt Bilgi ve Durum Çubuğu */}
      <div className="p-3 border-t border-[#1f1f2e] bg-[#0c0d10]/80 flex justify-between items-center text-[10px] font-mono text-[#87929a] shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span>
          <span>
            {currentLang === 'tr' ? 'Canlı Borsa Senkronizasyonu Aktif' : 'Live Market Sync Active'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>
            {currentLang === 'tr'
              ? `Listelenen: ${sortedStocks.length} Hisse`
              : `Displayed: ${sortedStocks.length} Assets`}
          </span>
        </div>
      </div>
    </div>
  );
};
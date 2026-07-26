import React, { useState } from 'react';
import { StockItem } from '../types';
import { Download, ChevronLeft, ChevronRight, ArrowUpDown, Sparkles } from 'lucide-react';

interface SignalsTableProps {
  stocks: StockItem[];
  selectedStock: StockItem | null;
  onSelectStock: (stock: StockItem) => void;
  onOpenDetailModal: (stock: StockItem) => void;
}

export const SignalsTable: React.FC<SignalsTableProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  onOpenDetailModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'valueScore' | 'upside' | 'symbol'>('valueScore');
  const [sortAsc, setSortAsc] = useState(false);

  const itemsPerPage = 6;

  // Sorting logic
  const sortedStocks = [...stocks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortAsc
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = sortedStocks.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: 'valueScore' | 'upside' | 'symbol') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Market', 'Price', 'Value Score', 'Signal', 'Upside %'];
    const rows = stocks.map((s) => [s.symbol, s.name, s.market, s.price, s.valueScore, s.signal, `${s.upside}%`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `market_terminal_valuation_signals.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-[#1f1f2e]">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#1f1f2e] flex justify-between items-center bg-[#101017]/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#38bdf8]" />
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-[#38bdf8]">
            Top Valuation Signals
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="p-1.5 text-[#bdc8d1] hover:text-[#38bdf8] transition-colors rounded hover:bg-[#171c20] cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="border-b border-[#1f1f2e] bg-[#0a0f12]">
              <th
                onClick={() => handleSort('symbol')}
                className="p-3 text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider cursor-pointer hover:text-[#dee3e8]"
              >
                <div className="flex items-center gap-1">
                  Symbol <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
              <th className="p-3 text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
                Company Health
              </th>
              <th
                onClick={() => handleSort('valueScore')}
                className="p-3 text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider cursor-pointer hover:text-[#dee3e8]"
              >
                <div className="flex items-center gap-1">
                  Value Score <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
              <th className="p-3 text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
                Signal
              </th>
              <th
                onClick={() => handleSort('upside')}
                className="p-3 text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider cursor-pointer hover:text-[#dee3e8]"
              >
                <div className="flex items-center gap-1">
                  Upside % <ArrowUpDown className="w-3 h-3 text-[#87929a]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f2e]/60">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-[#94a3b8]">
                  No matching assets found for selected filters. Try lowering the valuation range or clearing filters.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => {
                const isSelected = selectedStock?.id === stock.id;
                return (
                  <tr
                    key={stock.id}
                    onClick={() => onSelectStock(stock)}
                    onDoubleClick={() => onOpenDetailModal(stock)}
                    className={`hover:bg-[#171c20] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#171c20] border-l-2 border-[#38bdf8]' : ''
                    }`}
                  >
                    {/* Symbol */}
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-[#dee3e8] font-bold font-mono text-xs flex items-center gap-1.5 group-hover:text-[#38bdf8]">
                          {stock.symbol}
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#1f1f2e] text-[#94a3b8] font-normal">
                            {stock.currency}{stock.price.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#94a3b8] truncate max-w-[130px]">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    {/* Company Health Dots */}
                    <td className="p-3">
                      <div className="flex items-center gap-1" title={`${stock.healthDots}/5 Health Index`}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div
                            key={dot}
                            className={`w-1.5 h-1.5 rounded-full ${
                              dot <= stock.healthDots ? 'bg-[#34d399]' : 'bg-[#94a3b8]/30'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Value Score */}
                    <td className="p-3">
                      <span className="text-[#dee3e8] font-mono font-bold text-base">
                        {stock.valueScore}
                      </span>
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

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#1f1f2e] flex justify-between items-center text-xs text-[#94a3b8] bg-[#0a0f12]">
        <span className="text-[11px] font-mono">
          Showing {sortedStocks.length > 0 ? startIndex + 1 : 0}-
          {Math.min(startIndex + itemsPerPage, sortedStocks.length)} of {sortedStocks.length} assets
        </span>

        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#1f1f2e] hover:bg-[#1f1f2e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#bdc8d1]" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                currentPage === page
                  ? 'border border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8]'
                  : 'border border-[#1f1f2e] hover:bg-[#1f1f2e] text-[#bdc8d1]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#1f1f2e] hover:bg-[#1f1f2e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#bdc8d1]" />
          </button>
        </div>
      </div>
    </div>
  );
};

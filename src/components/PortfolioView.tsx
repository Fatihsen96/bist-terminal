import React from 'react';
import { PortfolioHolding, StockItem } from '../types';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, PlusCircle, PieChart } from 'lucide-react';

interface PortfolioViewProps {
  portfolio: PortfolioHolding[];
  cashBalanceUsd: number;
  cashBalanceTry: number;
  onOpenDeposit: () => void;
  onOpenTradeForHolding: (symbol: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  cashBalanceUsd,
  cashBalanceTry,
  onOpenDeposit,
  onOpenTradeForHolding,
}) => {
  // Compute portfolio valuation
  const totalHoldingsUsd = portfolio
    .filter((p) => p.currency === '$')
    .reduce((sum, p) => sum + p.shares * p.currentPrice, 0);

  const totalHoldingsTry = portfolio
    .filter((p) => p.currency === '₺')
    .reduce((sum, p) => sum + p.shares * p.currentPrice, 0);

  const totalCostUsd = portfolio
    .filter((p) => p.currency === '$')
    .reduce((sum, p) => sum + p.shares * p.avgBuyPrice, 0);

  const totalCostTry = portfolio
    .filter((p) => p.currency === '₺')
    .reduce((sum, p) => sum + p.shares * p.avgBuyPrice, 0);

  const pnlUsd = totalHoldingsUsd - totalCostUsd;
  const pnlUsdPct = totalCostUsd > 0 ? (pnlUsd / totalCostUsd) * 100 : 0;

  const pnlTry = totalHoldingsTry - totalCostTry;
  const pnlTryPct = totalCostTry > 0 ? (pnlTry / totalCostTry) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto custom-scrollbar select-none">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* USD Portfolio Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1f1f2e] relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#87929a] uppercase font-mono tracking-wider">
              US & Global Portfolio
            </span>
            <Wallet className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#dee3e8] mb-1">
            ${(totalHoldingsUsd + cashBalanceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#87929a]">PnL:</span>
            <span className={`font-bold flex items-center gap-1 ${pnlUsd >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
              {pnlUsd >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {pnlUsd >= 0 ? `+$${pnlUsd.toFixed(2)} (+${pnlUsdPct.toFixed(2)}%)` : `-$${Math.abs(pnlUsd).toFixed(2)} (${pnlUsdPct.toFixed(2)}%)`}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1f1f2e] text-[11px] font-mono text-[#87929a] flex justify-between">
            <span>Holdings: ${totalHoldingsUsd.toFixed(2)}</span>
            <span>Cash: ${cashBalanceUsd.toFixed(2)}</span>
          </div>
        </div>

        {/* TRY BIST Portfolio Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1f1f2e] relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#87929a] uppercase font-mono tracking-wider">
              BIST Portfolio (₺)
            </span>
            <Wallet className="w-5 h-5 text-[#34d399]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#dee3e8] mb-1">
            ₺{(totalHoldingsTry + cashBalanceTry).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#87929a]">PnL:</span>
            <span className={`font-bold flex items-center gap-1 ${pnlTry >= 0 ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
              {pnlTry >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {pnlTry >= 0 ? `+₺${pnlTry.toFixed(2)} (+${pnlTryPct.toFixed(2)}%)` : `-₺${Math.abs(pnlTry).toFixed(2)} (${pnlTryPct.toFixed(2)}%)`}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1f1f2e] text-[11px] font-mono text-[#87929a] flex justify-between">
            <span>Holdings: ₺{totalHoldingsTry.toFixed(2)}</span>
            <span>Cash: ₺{cashBalanceTry.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-[#1f1f2e] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#87929a] uppercase font-mono tracking-wider">
              Terminal Buying Power
            </span>
            <PieChart className="w-5 h-5 text-[#fbbf24]" />
          </div>
          <p className="text-xs text-[#bdc8d1] leading-relaxed">
            Deposit simulated capital or execute fast rebalancing across BIST, US Equities, and Crypto assets.
          </p>
          <button
            onClick={onOpenDeposit}
            className="w-full py-2.5 bg-[#45dfa4] text-[#003825] hover:bg-[#34d399] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-md shadow-[#45dfa4]/15"
          >
            <PlusCircle className="w-4 h-4" />
            Deposit Funds to Terminal
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel rounded-2xl border border-[#1f1f2e] p-5 overflow-hidden">
        <h3 className="font-headline font-bold text-sm text-[#dee3e8] uppercase tracking-wider mb-4">
          Active Positions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1f1f2e] text-[#87929a] text-[10px] uppercase">
                <th className="p-3">Asset</th>
                <th className="p-3">Market</th>
                <th className="p-3">Position Size</th>
                <th className="p-3">Avg Buy Price</th>
                <th className="p-3">Current Price</th>
                <th className="p-3">Total Value</th>
                <th className="p-3">Unrealized PnL</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f2e]/60">
              {portfolio.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#87929a]">
                    No active positions. Execute a trade from the Screener table to build your portfolio!
                  </td>
                </tr>
              ) : (
                portfolio.map((item) => {
                  const val = item.shares * item.currentPrice;
                  const cost = item.shares * item.avgBuyPrice;
                  const pnl = val - cost;
                  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                  const isGain = pnl >= 0;

                  return (
                    <tr key={item.id} className="hover:bg-[#171c20] transition-colors">
                      <td className="p-3 font-bold text-[#dee3e8]">
                        <div>{item.symbol}</div>
                        <span className="text-[10px] text-[#87929a] font-normal">{item.name}</span>
                      </td>
                      <td className="p-3 text-[#38bdf8]">{item.market}</td>
                      <td className="p-3 text-[#dee3e8]">{item.shares}</td>
                      <td className="p-3 text-[#87929a]">
                        {item.currency}{item.avgBuyPrice.toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-[#dee3e8]">
                        {item.currency}{item.currentPrice.toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-[#dee3e8]">
                        {item.currency}{val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 font-bold ${isGain ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
                        {isGain ? `+${item.currency}${pnl.toFixed(2)} (+${pnlPct.toFixed(1)}%)` : `-${item.currency}${Math.abs(pnl).toFixed(2)} (${pnlPct.toFixed(1)}%)`}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onOpenTradeForHolding(item.symbol)}
                          className="px-2.5 py-1 bg-[#38bdf8]/15 hover:bg-[#38bdf8]/30 border border-[#38bdf8]/40 text-[#38bdf8] font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

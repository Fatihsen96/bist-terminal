import React, { useState } from 'react';
import { StockItem, PortfolioHolding } from '../types';
import { X, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface TradeModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onExecuteTrade: (trade: {
    symbol: string;
    name: string;
    market: StockItem['market'];
    shares: number;
    price: number;
    currency: string;
    action: 'BUY' | 'SELL';
  }) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ stock, onClose, onExecuteTrade }) => {
  if (!stock) return null;

  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesInput, setSharesInput] = useState('10');
  const [executed, setExecuted] = useState(false);

  const numShares = parseFloat(sharesInput) || 0;
  const totalValue = numShares * stock.price;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (numShares <= 0) return;

    onExecuteTrade({
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      shares: numShares,
      price: stock.price,
      currency: stock.currency,
      action: tradeAction,
    });

    setExecuted(true);
    setTimeout(() => {
      onClose();
      setExecuted(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-[#1f1f2e] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#87929a] hover:text-[#dee3e8] p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-5 h-5 text-[#38bdf8]" />
          <h3 className="font-headline font-bold text-lg text-[#dee3e8]">
            Simulate Trade Order
          </h3>
        </div>

        {executed ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#34d399] mx-auto animate-bounce" />
            <h4 className="font-headline font-bold text-base text-[#dee3e8]">
              Order Executed Successfully!
            </h4>
            <p className="text-xs text-[#94a3b8] font-mono">
              {tradeAction} {numShares} shares of {stock.symbol} @ {stock.currency}{stock.price.toFixed(2)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Asset Info Header */}
            <div className="bg-[#101017] p-3 rounded-xl border border-[#1f1f2e] flex justify-between items-center">
              <div>
                <span className="font-mono font-bold text-sm text-[#dee3e8] block">{stock.symbol}</span>
                <span className="text-[10px] text-[#94a3b8]">{stock.name}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-[#dee3e8] block">
                  {stock.currency}{stock.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#34d399]">Value Score: {stock.valueScore}</span>
              </div>
            </div>

            {/* Action Switcher (BUY vs SELL) */}
            <div className="grid grid-cols-2 gap-2 bg-[#070709] p-1 rounded-xl border border-[#1f1f2e]">
              <button
                type="button"
                onClick={() => setTradeAction('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tradeAction === 'BUY'
                    ? 'bg-[#34d399] text-[#003825] shadow-md'
                    : 'text-[#87929a] hover:text-[#dee3e8]'
                }`}
              >
                BUY ({stock.symbol})
              </button>
              <button
                type="button"
                onClick={() => setTradeAction('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tradeAction === 'SELL'
                    ? 'bg-[#fb7185] text-[#690005] shadow-md'
                    : 'text-[#87929a] hover:text-[#dee3e8]'
                }`}
              >
                SELL ({stock.symbol})
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Number of Shares / Contracts
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-sm text-[#dee3e8] font-mono focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* Total Order Summary */}
            <div className="bg-[#101017] p-3 rounded-xl border border-[#1f1f2e] flex justify-between items-center text-xs font-mono">
              <span className="text-[#94a3b8]">Estimated Total Value</span>
              <span className="font-bold text-sm text-[#38bdf8]">
                {stock.currency}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer ${
                tradeAction === 'BUY'
                  ? 'bg-[#34d399] text-[#003825] hover:bg-[#68fcbf]'
                  : 'bg-[#fb7185] text-[#690005] hover:bg-[#ffdad6]'
              }`}
            >
              Confirm {tradeAction} Order
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

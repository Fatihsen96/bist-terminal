import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2 } from 'lucide-react';

interface DepositModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onDeposit: (amount: number, currency: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen = true, onClose, onDeposit }) => {
  if (!isOpen) return null;
  const [amountInput, setAmountInput] = useState('10000');
  const [currency, setCurrency] = useState('$');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput) || 0;
    if (val > 0) {
      onDeposit(val, currency);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
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
          <PlusCircle className="w-5 h-5 text-[#45dfa4]" />
          <h3 className="font-headline font-bold text-lg text-[#dee3e8]">
            Simulate Terminal Deposit
          </h3>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#45dfa4] mx-auto animate-bounce" />
            <h4 className="font-headline font-bold text-base text-[#dee3e8]">
              Funds Deposited Successfully!
            </h4>
            <p className="text-xs text-[#94a3b8] font-mono">
              +{currency}{parseFloat(amountInput).toLocaleString()} added to your active buying power.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Select Currency
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#070709] p-1 rounded-xl border border-[#1f1f2e]">
                <button
                  type="button"
                  onClick={() => setCurrency('$')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    currency === '$'
                      ? 'bg-[#38bdf8] text-[#001e2c]'
                      : 'text-[#87929a] hover:text-[#dee3e8]'
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('₺')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    currency === '₺'
                      ? 'bg-[#38bdf8] text-[#001e2c]'
                      : 'text-[#87929a] hover:text-[#dee3e8]'
                  }`}
                >
                  TRY (₺)
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1">
                Deposit Amount
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#070709] border border-[#1f1f2e] rounded-lg text-sm text-[#dee3e8] font-mono focus:outline-none focus:border-[#45dfa4]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {[2500, 5000, 10000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(preset.toString())}
                  className="flex-1 py-1 rounded bg-[#101017] border border-[#1f1f2e] hover:border-[#38bdf8] text-[10px] font-mono text-[#dee3e8] cursor-pointer"
                >
                  +{currency}{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#45dfa4] text-[#003825] hover:bg-[#34d399] font-bold text-xs rounded-xl shadow-lg shadow-[#45dfa4]/15 cursor-pointer transition-transform active:scale-95 mt-2"
            >
              Deposit Funds
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

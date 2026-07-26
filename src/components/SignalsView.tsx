import React from 'react';
import { Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';

export const SignalsView: React.FC = () => {
  const signalStats = [
    { label: '30D Model Win-Rate', value: '88.4%', trend: '+2.1% vs Benchmark' },
    { label: 'Avg Return per Trade', value: '+14.2%', trend: 'Hold horizon 18 days' },
    { label: 'Strong Buy Precision', value: '94.2%', trend: '312 Signals Evaluated' },
    { label: 'False Positive Rate', value: '5.8%', trend: 'Minimal Drawdown Risk' },
  ];

  const recentAlerts = [
    { ticker: 'THYAO', signal: 'STRONG BUY', score: 94, upside: '+36.5%', market: 'BIST', time: '10m ago', driver: 'FCF Expansion & Foreign Inflow' },
    { ticker: 'META', signal: 'STRONG BUY', score: 92, upside: '+28.4%', market: 'US', time: '25m ago', driver: 'Ad CPM Rebound & Llama Monetization' },
    { ticker: 'BTC', signal: 'STRONG BUY', score: 88, upside: '+25.0%', market: 'Crypto', time: '1h ago', driver: 'ETF Inflows & Exchange Outflows' },
    { ticker: 'BABA', signal: 'BUY', score: 87, upside: '+41.2%', market: 'US', time: '2h ago', driver: 'Deep EV/EBITDA Cyclical Discount' },
    { ticker: 'NVDA', signal: 'OVERVALUED', score: 42, upside: '-12.8%', market: 'US', time: '3h ago', driver: '4H RSI Divergence & Multiple Expansion' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 custom-scrollbar select-none">
      {/* Top AI Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {signalStats.map((st, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-[#1f1f2e]">
            <span className="text-[10px] font-bold text-[#87929a] font-mono uppercase block mb-1">
              {st.label}
            </span>
            <div className="text-2xl font-bold font-mono text-[#38bdf8] mb-1">{st.value}</div>
            <span className="text-[11px] text-[#34d399] font-mono">{st.trend}</span>
          </div>
        ))}
      </div>

      {/* Signal Log Table */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1f1f2e] space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#1f1f2e]">
          <h3 className="font-headline font-bold text-sm text-[#dee3e8] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            Real-Time Valuation Signal Stream
          </h3>
          <span className="text-xs font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/30">
            AUTO-SCANNING 1,402 TICKERS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1f1f2e] text-[#87929a] text-[10px] uppercase">
                <th className="p-3">Ticker</th>
                <th className="p-3">Market</th>
                <th className="p-3">AI Signal</th>
                <th className="p-3">Value Score</th>
                <th className="p-3">Estimated Upside</th>
                <th className="p-3">Primary Value Driver</th>
                <th className="p-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f2e]/60">
              {recentAlerts.map((alt, idx) => (
                <tr key={idx} className="hover:bg-[#171c20] transition-colors">
                  <td className="p-3 font-bold text-[#dee3e8]">${alt.ticker}</td>
                  <td className="p-3 text-[#38bdf8]">{alt.market}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        alt.signal.includes('BUY')
                          ? 'bg-[#34d399]/20 text-[#34d399] border-[#34d399]/40'
                          : alt.signal === 'OVERVALUED'
                          ? 'bg-[#fb7185]/20 text-[#fb7185] border-[#fb7185]/40'
                          : 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/40'
                      }`}
                    >
                      {alt.signal}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#dee3e8]">{alt.score}/100</td>
                  <td className={`p-3 font-bold ${alt.upside.startsWith('+') ? 'text-[#34d399]' : 'text-[#fb7185]'}`}>
                    {alt.upside}
                  </td>
                  <td className="p-3 text-[#bdc8d1] font-sans">{alt.driver}</td>
                  <td className="p-3 text-right text-[#87929a]">{alt.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

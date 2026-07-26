import React from 'react';
import { Zap, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

interface KPIGlassCardsProps {
  filteredCount: number;
  marketName: string;
}

export const KPIGlassCards: React.FC<KPIGlassCardsProps> = ({ filteredCount, marketName }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 select-none">
      {/* Glass Panel 1 */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#38bdf8]/40 transition-all">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#38bdf8]/5 rounded-full blur-xl group-hover:bg-[#38bdf8]/15 transition-all" />
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
            Market Valuation
          </span>
          <TrendingUp className="w-4 h-4 text-[#34d399]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-xl text-[#dee3e8]">Undervalued</span>
          <span className="text-[#34d399] font-mono text-xs font-bold">+12.4%</span>
        </div>
      </div>

      {/* Glass Panel 2 */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
            Top Signal Conf.
          </span>
          <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-xl text-[#dee3e8]">94.2%</span>
          <span className="text-[#87929a] font-mono text-[11px]">AI CONF</span>
        </div>
      </div>

      {/* Glass Panel 3 */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
            Signal Intensity
          </span>
          <Zap className="w-4 h-4 text-[#fbbf24]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-xl text-[#dee3e8]">High</span>
          <span className="text-[#fbbf24] font-mono text-xs flex items-center">⚡ Peak</span>
        </div>
      </div>

      {/* Glass Panel 4 */}
      <div className="glass-panel p-4 rounded-xl flex flex-col justify-between hover:border-[#38bdf8]/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
            Active Trackers
          </span>
          <Activity className="w-4 h-4 text-[#38bdf8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-xl text-[#dee3e8]">{filteredCount}</span>
          <span className="text-[#87929a] font-mono text-[11px] uppercase">{marketName}</span>
        </div>
      </div>
    </div>
  );
};

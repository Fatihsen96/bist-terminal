import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

interface KPIGlassCardsProps {
  filteredCount: number;
  marketName: string;
  currentLang?: 'en' | 'tr';
}

export const KPIGlassCards: React.FC<KPIGlassCardsProps> = ({
  filteredCount,
  marketName,
  currentLang = 'tr',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 select-none">
      {/* Card 1 */}
      <div className="glass-panel p-4 rounded-xl border border-[#1f1f2e] bg-[#121316] flex flex-col justify-between shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
            {currentLang === 'tr' ? 'PİYASA DEĞERLEMESİ' : 'MARKET VALUATION'}
          </span>
          <TrendingUp className="w-4 h-4 text-[#34d399]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold font-headline text-white">
            {currentLang === 'tr' ? 'Ucuz / Cazip' : 'Undervalued'}
          </span>
          <span className="text-xs font-mono text-[#34d399]">+12.4%</span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="glass-panel p-4 rounded-xl border border-[#1f1f2e] bg-[#121316] flex flex-col justify-between shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
            {currentLang === 'tr' ? 'SİNYAL GÜVENCESİ' : 'TOP SIGNAL CONF.'}
          </span>
          <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold font-mono text-white">94.2%</span>
          <span className="text-[10px] text-[#87929a] font-mono">AI CONF</span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="glass-panel p-4 rounded-xl border border-[#1f1f2e] bg-[#121316] flex flex-col justify-between shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
            {currentLang === 'tr' ? 'SİNYAL YOĞUNLUĞU' : 'SIGNAL INTENSITY'}
          </span>
          <Zap className="w-4 h-4 text-[#fbbf24]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold font-headline text-white">
            {currentLang === 'tr' ? 'Yüksek' : 'High'}
          </span>
          <span className="text-xs font-mono text-[#fbbf24]">⚡ Peak</span>
        </div>
      </div>

      {/* Card 4 */}
      <div className="glass-panel p-4 rounded-xl border border-[#1f1f2e] bg-[#121316] flex flex-col justify-between shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold font-sans text-[#87929a] uppercase tracking-wider">
            {currentLang === 'tr' ? 'AKTİF TAKİPÇİLER' : 'ACTIVE TRACKERS'}
          </span>
          <Activity className="w-4 h-4 text-[#38bdf8]" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold font-mono text-white">{filteredCount}</span>
          <span className="text-[10px] text-[#87929a] font-mono uppercase">{marketName}</span>
        </div>
      </div>
    </div>
  );
};
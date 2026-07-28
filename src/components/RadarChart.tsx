import React from 'react';
import { StockItem } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface RadarChartProps {
  stock: StockItem | null;
  onOpenDetailModal: (stock: StockItem) => void;
  currentLang?: 'en' | 'tr';
}

export const RadarChart: React.FC<RadarChartProps> = ({ stock, onOpenDetailModal, currentLang = 'tr' }) => {
  if (!stock) {
    return (
      <div className="glass-panel rounded-xl p-5 flex flex-col h-full items-center justify-center text-center border border-[#1f1f2e] bg-[#121316]">
        <Info className="w-8 h-8 text-[#87929a] mb-2" />
        <p className="text-xs text-[#94a3b8]">
          {currentLang === 'tr' 
            ? 'Finansal radar analizini görüntülemek için tablodan bir hisse seçin' 
            : 'Select a stock from the table to view Financial Breakdown radar'}
        </p>
      </div>
    );
  }

  const { healthBreakdown, symbol, name } = stock;

  // Varsayılan finansal rasyo değerleri
  const hb = healthBreakdown || {
    profit: 75,
    fk: 70,
    pddd: 65,
    favok: 80,
    netVarlik: 75,
    borc: 85
  };

  const center = 50;
  const maxRadius = 35;

  // 6 Gerçek Finansal Eksen
  const metrics = [
    { label: currentLang === 'tr' ? 'KARLILIK' : 'PROFIT', score: hb.profit ?? 75, xLabel: 50, yLabel: 7, textAnchor: 'middle' },
    { label: 'F/K', score: hb.fk ?? 70, xLabel: 92, yLabel: 28, textAnchor: 'start' },
    { label: 'PD/DD', score: hb.pddd ?? 65, xLabel: 88, yLabel: 82, textAnchor: 'start' },
    { label: 'FAVÖK', score: hb.favok ?? 80, xLabel: 50, yLabel: 96, textAnchor: 'middle' },
    { label: currentLang === 'tr' ? 'NET VARLIK' : 'ASSETS', score: hb.netVarlik ?? 75, xLabel: 8, yLabel: 82, textAnchor: 'end' },
    { label: currentLang === 'tr' ? 'BORÇ SĞL.' : 'DEBT', score: hb.borc ?? 85, xLabel: 8, yLabel: 28, textAnchor: 'end' },
  ];

  const points = metrics.map((m, idx) => {
    const angleRad = (Math.PI / 180) * (idx * 60 - 90);
    const radius = (m.score / 100) * maxRadius;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Dinamik Skor Renklendirme Yardımcısı
  const getScoreColorClass = (score: number) => {
    if (score < 25) return 'text-[#fb7185]';
    if (score < 50) return 'text-[#fb923c]';
    if (score < 75) return 'text-[#fbbf24]';
    return 'text-[#34d399]';
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full border border-[#1f1f2e] select-none bg-[#121316]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#dee3e8] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
            {symbol} {currentLang === 'tr' ? 'Temel Finansal Analiz' : 'Financial Breakdown'}
          </h3>
          <span className="text-[10px] text-[#94a3b8] font-mono">{name}</span>
        </div>
        <button
          onClick={() => onOpenDetailModal(stock)}
          className="text-[10px] font-bold text-[#38bdf8] hover:underline cursor-pointer"
        >
          {currentLang === 'tr' ? 'Detaylı Analiz →' : 'Deep Analysis →'}
        </button>
      </div>

      {/* SVG Radar Polygon */}
      <div className="flex-1 flex items-center justify-center relative rounded-lg border border-[#1f1f2e]/60 overflow-hidden py-2 min-h-[190px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-40 h-40 rounded-full border border-[#38bdf8]/30" />
          <div className="w-28 h-28 rounded-full border border-[#38bdf8]/20" />
          <div className="w-14 h-14 rounded-full border border-[#38bdf8]/10" />
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-48 drop-shadow-lg overflow-visible z-10">
          {/* Eksen Çizgileri */}
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const angleRad = (Math.PI / 180) * (deg - 90);
            const x2 = center + maxRadius * Math.cos(angleRad);
            const y2 = center + maxRadius * Math.sin(angleRad);
            return (
              <line
                key={deg}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#334155"
                strokeWidth="0.6"
                strokeDasharray="1.5 1.5"
              />
            );
          })}

          {/* Doldurulmuş Radar Poligonu */}
          <polygon
            points={points}
            fill="rgba(56, 189, 248, 0.28)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            className="transition-all duration-500 ease-out"
          />

          {/* Noktalar */}
          {metrics.map((m, idx) => {
            const angleRad = (Math.PI / 180) * (idx * 60 - 90);
            const radius = (m.score / 100) * maxRadius;
            const x = center + radius * Math.cos(angleRad);
            const y = center + radius * Math.sin(angleRad);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="2"
                fill="#38bdf8"
                stroke="#070709"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Etiketler */}
          {metrics.map((m, idx) => (
            <text
              key={idx}
              x={m.xLabel}
              y={m.yLabel}
              fill="#94a3b8"
              fontSize="4.2"
              fontWeight="bold"
              textAnchor={m.textAnchor as any}
              className="font-mono uppercase tracking-wider"
            >
              {m.label} ({m.score})
            </text>
          ))}
        </svg>
      </div>

      {/* Rasyo Özet Kutuları */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#1f1f2e]">
        <div className="bg-[#101017] p-1.5 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">
            {currentLang === 'tr' ? 'Karlılık (ROE)' : 'Profitability'}
          </span>
          <span className={`text-xs font-bold font-mono ${getScoreColorClass(metrics[0].score)}`}>
            {metrics[0].score}/100
          </span>
        </div>
        <div className="bg-[#101017] p-1.5 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">
            {currentLang === 'tr' ? 'F/K İskontosu' : 'P/E Score'}
          </span>
          <span className={`text-xs font-bold font-mono ${getScoreColorClass(metrics[1].score)}`}>
            {metrics[1].score}/100
          </span>
        </div>
        <div className="bg-[#101017] p-1.5 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">
            {currentLang === 'tr' ? 'FAVÖK Gücü' : 'EBITDA Score'}
          </span>
          <span className={`text-xs font-bold font-mono ${getScoreColorClass(metrics[3].score)}`}>
            {metrics[3].score}/100
          </span>
        </div>
      </div>
    </div>
  );
};

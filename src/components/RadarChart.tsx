import React from 'react';
import { StockItem } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface RadarChartProps {
  stock: StockItem | null;
  onOpenDetailModal: (stock: StockItem) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({ stock, onOpenDetailModal }) => {
  if (!stock) {
    return (
      <div className="glass-panel rounded-xl p-5 flex flex-col h-full items-center justify-center text-center border border-[#1f1f2e]">
        <Info className="w-8 h-8 text-[#87929a] mb-2" />
        <p className="text-xs text-[#94a3b8]">Select a stock from the table to view Health Breakdown radar</p>
      </div>
    );
  }

  const { healthBreakdown, symbol, name } = stock;

  // Convert 6 metrics to 6 polygon vertices
  // Angles for 6 axes (60 degrees apart starting from top -90deg):
  // 0: PROFIT (top: -90deg)
  // 1: DEBT (30deg)
  // 2: VALUE (90deg)
  // 3: FLOW (150deg)
  // 4: MOMENTUM (210deg)
  // 5: SENTIMENT (270deg)

  const center = 50;
  const maxRadius = 38;

  const metrics = [
    { label: 'PROFIT', score: healthBreakdown.profit, xLabel: 50, yLabel: 5, textAnchor: 'middle' },
    { label: 'DEBT', score: 100 - healthBreakdown.debt, xLabel: 95, yLabel: 28, textAnchor: 'start' }, // lower debt is better health
    { label: 'VALUE', score: healthBreakdown.value, xLabel: 88, yLabel: 85, textAnchor: 'start' },
    { label: 'FLOW', score: healthBreakdown.flow, xLabel: 50, yLabel: 98, textAnchor: 'middle' },
    { label: 'MOMENTUM', score: healthBreakdown.momentum, xLabel: 5, yLabel: 85, textAnchor: 'end' },
    { label: 'SENTIMENT', score: healthBreakdown.sentiment, xLabel: 5, yLabel: 28, textAnchor: 'end' },
  ];

  const points = metrics.map((m, idx) => {
    const angleRad = (Math.PI / 180) * (idx * 60 - 90);
    const radius = (m.score / 100) * maxRadius;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full border border-[#1f1f2e] select-none">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#dee3e8] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
            {symbol} Health Breakdown
          </h3>
          <span className="text-[10px] text-[#94a3b8] font-mono">{name}</span>
        </div>
        <button
          onClick={() => onOpenDetailModal(stock)}
          className="text-[10px] font-bold text-[#38bdf8] hover:underline cursor-pointer"
        >
          Deep Analysis &rarr;
        </button>
      </div>

      {/* Simulated Radar Chart Grid */}
      <div className="flex-1 flex items-center justify-center relative radar-grid rounded-lg border border-[#1f1f2e]/60 overflow-hidden py-4">
        {/* Concentric Grid Circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 rounded-full border border-[#1f1f2e]/60" />
          <div className="w-32 h-32 rounded-full border border-[#1f1f2e]/50" />
          <div className="w-16 h-16 rounded-full border border-[#1f1f2e]/40" />
        </div>

        {/* SVG Radar Polygon */}
        <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-lg overflow-visible z-10">
          {/* Axis Radial Lines */}
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
                stroke="#1f1f2e"
                strokeWidth="0.8"
                strokeDasharray="1 1"
              />
            );
          })}

          {/* Polygon Area */}
          <polygon
            points={points}
            fill="rgba(56, 189, 248, 0.22)"
            stroke="#38bdf8"
            strokeWidth="1.8"
            className="transition-all duration-500 ease-out"
          />

          {/* Vertex Dots */}
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

          {/* Labels */}
          {metrics.map((m, idx) => (
            <text
              key={idx}
              x={m.xLabel}
              y={m.yLabel}
              fill="#94a3b8"
              fontSize="4.5"
              fontWeight="bold"
              textAnchor={m.textAnchor as any}
              className="font-mono uppercase tracking-wider"
            >
              {m.label} ({m.score})
            </text>
          ))}
        </svg>
      </div>

      {/* Metrics Summary footer */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#1f1f2e]">
        <div className="bg-[#101017] p-2 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">Profitability</span>
          <span className="text-xs font-bold font-mono text-[#34d399]">{healthBreakdown.profit}/100</span>
        </div>
        <div className="bg-[#101017] p-2 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">Debt Leverage</span>
          <span className="text-xs font-bold font-mono text-[#38bdf8]">{healthBreakdown.debt}% Low</span>
        </div>
        <div className="bg-[#101017] p-2 rounded border border-[#1f1f2e] text-center">
          <span className="text-[9px] text-[#87929a] font-mono block">Cash Flow</span>
          <span className="text-xs font-bold font-mono text-[#fbbf24]">{healthBreakdown.flow}/100</span>
        </div>
      </div>
    </div>
  );
};

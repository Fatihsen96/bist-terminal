import React, { useState } from 'react';
import { Bot, RefreshCw, CheckCircle2, Circle, Plus, X } from 'lucide-react';

interface FilterSidebarProps {
  valuationRange: [number, number];
  setValuationRange: (val: [number, number]) => void;
  selectedSignals: string[];
  toggleSignal: (signal: string) => void;
  selectedSectors: string[];
  toggleSector: (sector: string) => void;
  onRunAiAnalysis: () => void;
  isAnalyzing: boolean;
  currentLang?: 'en' | 'tr'; // Dil desteği eklendi
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  valuationRange,
  setValuationRange,
  selectedSignals,
  toggleSignal,
  selectedSectors,
  toggleSector,
  onRunAiAnalysis,
  isAnalyzing,
  currentLang = 'tr',
}) => {
  const [showAddSector, setShowAddSector] = useState(false);
  const [newSectorInput, setNewSectorInput] = useState('');

  const signalOptions = [
    { id: 'Strong Value', label: 'Strong Value' },
    { id: 'Dividend King', label: 'Dividend King' },
    { id: 'Growth Rebound', label: 'Growth Rebound' },
    { id: 'High Momentum', label: 'High Momentum' },
    { id: 'AI Outlier', label: 'AI Outlier' },
  ];

  const availableSectors = ['Tech', 'Energy', 'Healthcare', 'Finance', 'Industrials', 'Crypto', 'Commodity'];

  const handleAddCustomSector = () => {
    if (newSectorInput.trim()) {
      toggleSector(newSectorInput.trim());
      setNewSectorInput('');
      setShowAddSector(false);
    }
  };

  return (
    <aside className="w-[280px] border-r border-[#1f1f2e] flex flex-col p-5 overflow-y-auto custom-scrollbar bg-[#070709]/70 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Bot className="w-5 h-5 text-[#38bdf8]" />
        <h2 className="font-headline font-bold text-sm text-[#dee3e8] uppercase tracking-wider">
          {currentLang === 'tr' ? 'Yapay Zeka Filtreleri' : 'AI Bot Filters'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Valuation Range Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider">
              {currentLang === 'tr' ? 'Değerleme Aralığı' : 'Valuation Range'}
            </label>
            <span className="text-xs font-mono text-[#38bdf8]">
              {valuationRange[0]} - {valuationRange[1]}
            </span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={valuationRange[0]}
              onChange={(e) => setValuationRange([parseInt(e.target.value), valuationRange[1]])}
              className="w-full h-1 bg-[#1f1f2e] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#94a3b8]">
              <span>{currentLang === 'tr' ? '0 (Düşük Değer)' : '0 (Deep Value)'}</span>
              <span>{currentLang === 'tr' ? '100 (Tepe Çarpanlar)' : '100 (Peak Multiples)'}</span>
            </div>
          </div>
        </div>

        {/* Primary Signals */}
        <div>
          <label className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider mb-2.5 block">
            {currentLang === 'tr' ? 'Birincil Sinyaller' : 'Primary Signals'}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {signalOptions.map((opt) => {
              const isSelected = selectedSignals.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSignal(opt.id)}
                  className={`flex items-center justify-between p-2.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]'
                      : 'bg-[#101017] border-[#1f1f2e] text-[#bdc8d1] hover:border-[#38bdf8]/30'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#87929a]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sector Focus */}
        <div>
          <label className="text-[10px] font-bold font-sans text-[#94a3b8] uppercase tracking-wider mb-2.5 block">
            {currentLang === 'tr' ? 'Sektör Odağı' : 'Sector Focus'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableSectors.map((sector) => {
              const isSelected = selectedSectors.includes(sector);
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#38bdf8] text-[#001e2c] font-bold shadow-sm'
                      : 'bg-[#171c20] border border-[#1f1f2e] text-[#dee3e8] hover:border-[#38bdf8]/40'
                  }`}
                >
                  {sector}
                </button>
              );
            })}

            {!showAddSector ? (
              <button
                onClick={() => setShowAddSector(true)}
                className="px-2 py-1 border border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#38bdf8]/10 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> {currentLang === 'tr' ? 'Ekle' : 'Add'}
              </button>
            ) : (
              <div className="flex items-center gap-1 w-full mt-1">
                <input
                  type="text"
                  value={newSectorInput}
                  onChange={(e) => setNewSectorInput(e.target.value)}
                  placeholder={currentLang === 'tr' ? 'Özel sektör...' : 'Custom sector...'}
                  className="px-2 py-1 bg-[#101017] border border-[#38bdf8] rounded text-xs text-[#dee3e8] focus:outline-none flex-1 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSector()}
                  autoFocus
                />
                <button
                  onClick={handleAddCustomSector}
                  className="px-2 py-1 bg-[#38bdf8] text-[#001e2c] text-xs font-bold rounded cursor-pointer"
                >
                  OK
                </button>
                <button
                  onClick={() => setShowAddSector(false)}
                  className="p-1 text-[#87929a] hover:text-[#dee3e8] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#1f1f2e]">
          <button
            onClick={onRunAiAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-2.5 px-4 bg-[#38bdf8] text-[#00354a] font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[#38bdf8]/15 hover:bg-[#7bd0ff] transition-all cursor-pointer active:scale-95 ${
              isAnalyzing ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing 
              ? (currentLang === 'tr' ? 'Sinyaller Analiz Ediliyor...' : 'Analyzing Signals...') 
              : (currentLang === 'tr' ? 'Yapay Zeka Analizini Çalıştır' : 'Run AI Analysis')}
          </button>
        </div>
      </div>
    </aside>
  );
};
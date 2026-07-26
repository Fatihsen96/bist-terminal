import React from 'react';

export const SignalsView: React.FC = () => {
  const recentAlerts = [
    { ticker: 'BABA', signal: 'BUY', score: 87, upside: '+41.2%', market: 'US', time: '2h ago', driver: 'Deep EV/EBITDA Discount' },
    { ticker: 'NVDA', signal: 'OVERVALUED', score: 42, upside: '-12.8%', market: 'US', time: '3h ago', driver: '4H RSI Overbought' },
  ];

  const signalStats = [
    { label: 'Active Scans', value: '24', trend: '+12% this week' },
    { label: 'AI Accuracy', value: '94.2%', trend: 'High Confidence' },
    { label: 'Pending Signals', value: '8', trend: 'Real-time telemetry' },
  ];

  return (
    <div className="flex-1 p-6 text-[#dee3e8] overflow-y-auto space-y-6">
      <h2 className="text-xl font-bold">Market Signals & AI Alerts</h2>
      
      {/* Top AI Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {signalStats.map((st, i) => (
          <div key={i} className="bg-[#121316] p-5 rounded-2xl border border-[#1f1f2e]">
            <span className="text-[10px] font-bold text-[#87929a] font-mono uppercase block mb-1">
              {st.label}
            </span>
            <div className="text-2xl font-bold font-mono text-[#38bdf8] mb-1">{st.value}</div>
            <span className="text-[11px] text-[#34d399] font-mono">{st.trend}</span>
          </div>
        ))}
      </div>

      {/* Recent Alerts Table */}
      <div className="bg-[#121316] p-5 rounded-2xl border border-[#1f1f2e] space-y-4">
        <h3 className="text-sm font-bold text-[#87929a] uppercase tracking-wider">Recent Telemetry Alerts</h3>
        <div className="space-y-2">
          {recentAlerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#070709] rounded-xl border border-[#1f1f2e]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white">{alert.ticker}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#1f1f2e] text-[#38bdf8]">{alert.signal}</span>
              </div>
              <div className="text-xs text-gray-400">{alert.driver}</div>
              <div className="text-sm font-mono text-[#34d399]">{alert.upside}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
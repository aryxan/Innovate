import React, { useState, useEffect } from 'react';
import { getSensorStatistics } from '../data/sensorNetwork';

const CommandCenterBanner = () => {
  const [stats, setStats] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setStats(getSensorStatistics());
    const interval = setInterval(() => {
      setTime(new Date());
      setStats(getSensorStatistics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-r from-slate-950 via-blue-950/30 to-slate-950 border-b border-blue-500/20 px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        {/* Left: System Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                Global Hydrological Monitoring Active
              </div>
              <div className="text-gray-500 text-[10px] font-mono">
                National Infrastructure Intelligence Platform
              </div>
            </div>
          </div>

          {/* Sensor Network Status */}
          <div className="flex items-center gap-4 pl-6 border-l border-slate-700/50">
            <div className="text-center">
              <div className="text-blue-400 text-lg font-bold font-mono">{stats.total}</div>
              <div className="text-gray-500 text-[10px] font-mono uppercase">Sensors</div>
            </div>
            <div className="text-center">
              <div className="text-emerald-400 text-lg font-bold font-mono">{stats.byStatus.normal}</div>
              <div className="text-gray-500 text-[10px] font-mono uppercase">Normal</div>
            </div>
            <div className="text-center">
              <div className="text-amber-400 text-lg font-bold font-mono">{stats.byStatus.warning}</div>
              <div className="text-gray-500 text-[10px] font-mono uppercase">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 text-lg font-bold font-mono animate-pulse">{stats.byStatus.critical}</div>
              <div className="text-gray-500 text-[10px] font-mono uppercase">Critical</div>
            </div>
          </div>
        </div>

        {/* Right: Time and System Info */}
        <div className="flex items-center gap-6">
          {/* AI Engine Status */}
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-blue-400 text-xs font-mono font-bold uppercase">AI Engine Online</span>
          </div>

          {/* System Time */}
          <div className="text-right">
            <div className="text-white text-sm font-mono font-bold">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-gray-500 text-[10px] font-mono uppercase">
              {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-700/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-mono font-bold uppercase">Network Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterBanner;

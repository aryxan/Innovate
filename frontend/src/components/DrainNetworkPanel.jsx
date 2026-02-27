import React from 'react';
import { getSensorStatistics } from '../data/sensorNetwork';

const DrainNetworkPanel = () => {
  const stats = getSensorStatistics();
  const drainHealth = stats.drainHealth;
  const criticalCities = stats.criticalCities;

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Urban Drain Network Status</h2>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Real-Time Infrastructure Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-mono font-bold uppercase">Live</span>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Healthy Drains */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30 rounded-lg p-4 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">Healthy</span>
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-emerald-400 font-mono mb-1 group-hover:scale-110 transition-transform">
              {drainHealth.healthy}%
            </div>
            <div className="text-xs text-emerald-500/70">Operating Normally</div>
          </div>
        </div>

        {/* Blocked Drains */}
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/30 rounded-lg p-4 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest">Blocked</span>
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono mb-1 group-hover:scale-110 transition-transform">
              {drainHealth.blocked}%
            </div>
            <div className="text-xs text-amber-500/70">Blockage Detected</div>
          </div>
        </div>

        {/* Overflowing Drains */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/30 rounded-lg p-4 relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-xs font-mono uppercase tracking-widest">Overflow</span>
              <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1 group-hover:scale-110 transition-transform">
              {drainHealth.overflowing}%
            </div>
            <div className="text-xs text-red-500/70">Critical Alert</div>
          </div>
        </div>
      </div>

      {/* Critical Cities */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest">Top 5 Critical Zones</h3>
          {criticalCities.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-red-400 text-xs font-mono font-bold">ALERT</span>
            </div>
          )}
        </div>

        {criticalCities.length === 0 ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 mx-auto mb-2 text-emerald-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-emerald-500 text-sm font-mono">All zones operating normally</p>
          </div>
        ) : (
          <div className="space-y-2">
            {criticalCities.map((city, index) => (
              <div
                key={`${city.state}-${city.city}`}
                className="bg-slate-900/50 border border-slate-800/80 rounded p-3 relative overflow-hidden group hover:border-red-500/30 transition-all"
              >
                <div className="absolute left-0 top-0 h-full w-[2px] bg-red-500/50"></div>
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-red-600/20 rounded text-red-400 text-xs font-bold font-mono">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{city.city}</div>
                      <div className="text-gray-500 text-xs font-mono">{city.state}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-red-400 font-bold text-lg font-mono">{city.count}</div>
                      <div className="text-gray-500 text-xs">Critical Sensors</div>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Statistics */}
      <div className="mt-4 pt-4 border-t border-slate-800/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-blue-400 text-xl font-bold font-mono">{stats.byType.drains}</div>
            <div className="text-gray-500 text-xs font-mono uppercase tracking-wider">Total Drains</div>
          </div>
          <div>
            <div className="text-emerald-400 text-xl font-bold font-mono">{stats.byStatus.normal}</div>
            <div className="text-gray-500 text-xs font-mono uppercase tracking-wider">Normal</div>
          </div>
          <div>
            <div className="text-red-400 text-xl font-bold font-mono">{stats.byStatus.critical}</div>
            <div className="text-gray-500 text-xs font-mono uppercase tracking-wider">Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrainNetworkPanel;

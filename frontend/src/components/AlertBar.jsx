import React from 'react';
import { indiaRiskData } from '../data/indiaRiskData';

const AlertBar = ({ stateName }) => {
  if (!stateName) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border-b border-blue-500/30 p-4 border-l-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-l-blue-500">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
          <div className="flex-1">
            <p className="text-blue-500 font-mono tracking-widest uppercase font-bold text-sm">Global System Scanning_</p>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Awaiting sector target designation for detailed analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const stateData = indiaRiskData[stateName];

  if (!stateData) {
    return null;
  }

  const getAlertStyle = (risk) => {
    switch (risk) {
      case "high":
        return {
          bg: "bg-slate-950/90 border-red-500",
          border: "border-l-red-500",
          icon: "text-red-500",
          text: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
          glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        };
      case "medium":
        return {
          bg: "bg-slate-950/90 border-amber-500/50",
          border: "border-l-amber-500",
          icon: "text-amber-500",
          text: "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]"
        };
      case "low":
        return {
          bg: "bg-slate-950/90 border-emerald-500/30",
          border: "border-l-emerald-500",
          icon: "text-emerald-500",
          text: "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]",
          glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        };
      default:
        return {
          bg: "bg-slate-950/90 border-slate-700",
          border: "border-l-slate-500",
          icon: "text-slate-500",
          text: "text-slate-400",
          glow: ""
        };
    }
  };

  const alertStyle = getAlertStyle(stateData.risk);

  const getAlertIcon = (risk) => {
    if (risk === "high") {
      return (
        <svg className={`w-7 h-7 ${alertStyle.icon} animate-pulse`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else if (risk === "medium") {
      return (
        <svg className={`w-7 h-7 ${alertStyle.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className={`w-7 h-7 ${alertStyle.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const getAlertTitle = (risk) => {
    if (risk === "high") return `⚠️ CRITICAL THREAT DETECTED: [${stateName}]`;
    if (risk === "medium") return `⚡ ELEVATED RISK PROBABILITY: [${stateName}]`;
    return `✓ NORMAL BASELINE ESTABLISHED: [${stateName}]`;
  };

  return (
    <div className={`${alertStyle.bg} ${alertStyle.glow} backdrop-blur-md border-b border-l-[6px] ${alertStyle.border} p-4 animate-slideIn relative overflow-hidden font-sans`}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="flex items-center gap-6">
        <div className="flex-shrink-0 bg-slate-900/80 p-3 rounded border border-white/5">
          {getAlertIcon(stateData.risk)}
        </div>
        <div className="flex-1">
          <p className={`${alertStyle.text} font-bold font-mono text-lg tracking-widest uppercase mb-1 flex items-center gap-3`}>
            {getAlertTitle(stateData.risk)}
            {stateData.risk === 'high' && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-sm animate-pulse tracking-widest text-shadow-none">EVAC_WARN</span>
            )}
          </p>
          <div className="flex gap-4 items-center">
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
              > {stateData.description}
            </p>
            <span className="text-slate-600">|</span>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
              ACTIVE_LOGS: <strong className="text-slate-200">{stateData.alerts}</strong>
            </p>
            <span className="text-slate-600">|</span>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
              LAST_SYNC: <strong className="text-slate-200">{stateData.lastUpdate}</strong>
            </p>
          </div>
        </div>
        <div className={`text-right flex-shrink-0 border-l border-slate-700/50 pl-6`}>
          <div className={`${alertStyle.text} text-3xl font-bold font-mono mb-1`}>{stateData.riskLevel}%</div>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Threat Vector</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AlertBar;

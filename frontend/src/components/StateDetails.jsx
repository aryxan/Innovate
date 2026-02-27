import React, { useState, useEffect } from 'react';
import { indiaRiskData } from '../data/indiaRiskData';
import StateMapDetail from './StateMapDetail';
import apiService from '../services/apiService';

const StateDetails = ({ stateName, reports = [], selectedReport }) => {
  const [floodProbability, setFloodProbability] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState('ai'); // 'ai' or 'map'
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stateName) {
      fetchLiveData();
    }
  }, [stateName]);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getStateRisk(stateName);
      if (data) {
        setLiveData(data);
        setFloodProbability(data.forecast_12h || 0);
        setConfidence(data.confidence || 0);
        setLastUpdate('Just now');

        // Generate chart data based on live forecast
        const baseValue = data.forecast_12h || 50;
        const trend = data.trend === 'rising' ? 1 : data.trend === 'falling' ? -1 : 0;
        const chartData = Array.from({ length: 7 }, (_, i) => ({
          hour: i,
          value: Math.max(0, Math.min(100, baseValue + (i * trend * 2) + (Math.random() * 5 - 2.5)))
        }));
        setChartData(chartData);
      } else {
        // Fallback to mock data
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const stateData = indiaRiskData[stateName];
    if (stateData) {
      const probabilityMap = {
        high: Math.floor(Math.random() * 20) + 70,
        medium: Math.floor(Math.random() * 25) + 40,
        low: Math.floor(Math.random() * 25) + 10,
      };

      const confidenceMap = {
        high: Math.floor(Math.random() * 10) + 85,
        medium: Math.floor(Math.random() * 15) + 75,
        low: Math.floor(Math.random() * 15) + 70,
      };

      setFloodProbability(probabilityMap[stateData.risk] || 0);
      setConfidence(confidenceMap[stateData.risk] || 0);

      const baseValue = probabilityMap[stateData.risk];
      const trend = stateData.risk === 'high' ? 1 : stateData.risk === 'medium' ? 0.5 : -0.5;
      const data = Array.from({ length: 7 }, (_, i) => ({
        hour: i,
        value: Math.max(0, Math.min(100, baseValue + (i * trend * 2) + (Math.random() * 5 - 2.5)))
      }));
      setChartData(data);

      const minutes = Math.floor(Math.random() * 10) + 1;
      setLastUpdate(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
    }
  };

  if (!stateName) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 flex flex-col font-sans">
        <div className="p-6 border-b border-slate-800 bg-slate-900/80">
          <h2 className="text-lg font-bold text-slate-200 tracking-widest uppercase font-mono mb-1">National Command Overview</h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Awaiting regional selection</p>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          {/* System Diagnostics */}
          <div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              System Diagnostics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-1">Hydraulic Sensors</div>
                <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                  2,450 <span className="text-xs text-emerald-500 font-normal tracking-wide">ONLINE</span>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-1">API Latency</div>
                <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                  12ms <span className="text-xs text-blue-400 font-normal tracking-wide">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* National Risk Summary */}
          <div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              National Risk Summary
            </h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-mono">Brahmaputra Basin</span>
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/30 uppercase tracking-widest">Critical</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-mono">Ganges Plains</span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs border border-amber-500/30 uppercase tracking-widest">Watch</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-mono">Godavari River</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs border border-emerald-500/30 uppercase tracking-widest">Normal</span>
              </div>
            </div>
          </div>

          {/* AI Model Status */}
          <div>
            <h3 className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              AI Core Status
            </h3>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300 font-mono">JalRakshak Engine v2.0</div>
                <div className="text-xs text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Active</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyzing incoming telemetry data from 36 states/UTs. Model confidence factor at 98.5%. Awaiting region selection for detailed deep-dive analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stateData = indiaRiskData[stateName];

  if (!stateData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>No data available for {stateName}</p>
      </div>
    );
  }

  // If map view is selected and we have live data with sensors
  if (viewMode === 'map' && liveData && liveData.sensors && liveData.sensors.length > 0) {
    return (
      <div className="h-full flex flex-col">
        {/* View Toggle */}
        <div className="flex-shrink-0 p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('ai')}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/50"
            >
              📊 AI Predictions
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-blue-600 text-white border border-blue-500/50"
            >
              🗺️ Sensor Map
            </button>
          </div>
        </div>

        {/* Google Maps View */}
        <div className="flex-1">
          <StateMapDetail
            stateData={liveData}
            onClose={() => setViewMode('ai')}
            reports={reports}
            selectedReport={selectedReport}
          />
        </div>
      </div>
    );
  }

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'bg-red-600/90 text-white border-red-500/30';
      case 'medium':
        return 'bg-amber-600/90 text-white border-amber-500/30';
      case 'low':
        return 'bg-emerald-600/90 text-white border-emerald-500/30';
      default:
        return 'bg-gray-600/90 text-white border-gray-500/30';
    }
  };

  const getModelInputs = () => {
    if (liveData) {
      return {
        rainfall: liveData.rainfall_mm > 50 ? 'High' : liveData.rainfall_mm > 20 ? 'Medium' : 'Low',
        riverTrend: liveData.trend === 'rising' ? 'Rising' : liveData.trend === 'falling' ? 'Stable' : 'Stable',
        soilSaturation: Math.round((liveData.past_7day_rainfall / 300) * 100),
        floodIndex: (liveData.risk_score / 10).toFixed(1)
      };
    }

    const rainfallMap = {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };

    const riverTrendMap = {
      high: 'Critical',
      medium: 'Rising',
      low: 'Stable'
    };

    const soilSaturation = {
      high: Math.floor(Math.random() * 15) + 80,
      medium: Math.floor(Math.random() * 20) + 50,
      low: Math.floor(Math.random() * 30) + 20,
    };

    const floodIndex = {
      high: (Math.random() * 2 + 7).toFixed(1),
      medium: (Math.random() * 2 + 4).toFixed(1),
      low: (Math.random() * 2 + 1).toFixed(1),
    };

    return {
      rainfall: rainfallMap[stateData.risk],
      riverTrend: riverTrendMap[stateData.risk],
      soilSaturation: soilSaturation[stateData.risk],
      floodIndex: floodIndex[stateData.risk]
    };
  };

  const modelInputs = getModelInputs();

  const getInputChipColor = (value) => {
    if (value === 'High' || value === 'Critical' || value === 'Rising') return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (value === 'Medium') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  const hasSensors = liveData && liveData.sensors && liveData.sensors.length > 0;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fadeIn font-sans relative z-10">
      {/* Header */}
      <div className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-widest uppercase font-mono">{stateName}</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <span className={`${getRiskBadgeColor(stateData.risk)} px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-widest shadow-sm`}>
            {stateData.risk} Threat
          </span>
          <span className="text-slate-500 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            LAST_SYNC: {lastUpdate}
          </span>
          {loading && (
            <span className="text-blue-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-blue-500"></div>
              FETCH_DATA_STREAM...
            </span>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
        <button
          onClick={() => setViewMode('ai')}
          className={`flex-1 px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-all ${viewMode === 'ai'
            ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
        >
          [ AI CORE ]
        </button>
        <button
          onClick={() => setViewMode('map')}
          disabled={!hasSensors}
          className={`flex-1 px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-all ${viewMode === 'map'
            ? 'bg-blue-700 text-white font-bold border border-blue-600 shadow-sm'
            : hasSensors
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              : 'text-slate-600 cursor-not-allowed'
            }`}
        >
          [ SENS_NET ] {hasSensors && `(${liveData.sensors.length})`}
        </button>
      </div>

      {/* AI Flood Risk Prediction Engine */}
      <div className="bg-slate-800/30 rounded-lg p-5 border border-slate-700">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <h3 className="text-slate-300 font-mono font-bold text-xs uppercase tracking-widest">Predictive Threat Model</h3>
          {liveData && (
            <span className="ml-auto text-[10px] text-emerald-500 flex items-center gap-1 font-mono tracking-widest uppercase">
              <span className="text-emerald-500">[LIVE]</span>
            </span>
          )}
        </div>

        {/* Prediction Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Flood Probability */}
          <div className="bg-slate-900 rounded p-4 border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
            <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-1 pl-2">Est. Inundation Prob. (24h)</div>
            <div className="text-4xl font-bold font-mono text-slate-200 mb-2 pl-2">
              {Math.round(floodProbability)}<span className="text-xl text-slate-600">%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 px-2">
              <div className="w-full bg-slate-800/80 rounded-sm h-1">
                <div
                  className={`h-full rounded-sm transition-all duration-1000 ${floodProbability > 70 ? 'bg-red-500' :
                    floodProbability > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  style={{ width: `${floodProbability}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-slate-950/80 rounded p-4 border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
            <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-1 pl-2">AI Confidence Factor</div>
            <div className="text-4xl font-bold font-mono text-blue-500/90 mb-2 pl-2 text-shadow-sm">
              {Math.round(confidence)}<span className="text-xl text-slate-600">%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-blue-500/80 font-mono uppercase tracking-widest pl-2">
              <span>H.A.M. ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Projected Risk Level */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Projected Risk Level</div>
              <span className={`${getRiskBadgeColor(liveData?.risk_level || stateData.risk)} border px-3 py-1 rounded-md text-sm font-semibold uppercase inline-block`}>
                {liveData?.risk_level || stateData.risk}
              </span>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Last Model Run</div>
              <div className="text-gray-300 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Updated {lastUpdate}
              </div>
            </div>
          </div>
        </div>

        {/* Model Inputs */}
        <div className="mb-5">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">Model Input Parameters</div>
          <div className="grid grid-cols-2 gap-2">
            <div className={`${getInputChipColor(modelInputs.rainfall)} border rounded-lg px-3 py-2 text-sm`}>
              <div className="text-xs opacity-70 mb-0.5">Rainfall Intensity</div>
              <div className="font-semibold">{modelInputs.rainfall}</div>
            </div>
            <div className={`${getInputChipColor(modelInputs.riverTrend)} border rounded-lg px-3 py-2 text-sm`}>
              <div className="text-xs opacity-70 mb-0.5">River Level Trend</div>
              <div className="font-semibold">{modelInputs.riverTrend}</div>
            </div>
            <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg px-3 py-2 text-sm">
              <div className="text-xs opacity-70 mb-0.5">Soil Saturation</div>
              <div className="font-semibold">{modelInputs.soilSaturation}%</div>
            </div>
            <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg px-3 py-2 text-sm">
              <div className="text-xs opacity-70 mb-0.5">Historical Flood Index</div>
              <div className="font-semibold">{modelInputs.floodIndex}/10</div>
            </div>
          </div>
        </div>

        {/* Risk Projection Graph */}
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">Risk Projection (Next 6 Hours)</div>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: floodProbability > 70 ? '#ef4444' : floodProbability > 40 ? '#f59e0b' : '#10b981', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: floodProbability > 70 ? '#dc2626' : floodProbability > 40 ? '#d97706' : '#059669', stopOpacity: 1 }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={120 - (y * 1.2)}
                  x2="300"
                  y2={120 - (y * 1.2)}
                  stroke="#334155"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}

              {/* Chart line */}
              <path
                d={chartData.map((point, i) =>
                  `${i === 0 ? 'M' : 'L'} ${(i / 6) * 300} ${120 - (point.value * 1.2)}`
                ).join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                filter="url(#glow)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((point, i) => (
                <circle
                  key={i}
                  cx={(i / 6) * 300}
                  cy={120 - (point.value * 1.2)}
                  r="4"
                  fill={floodProbability > 70 ? '#ef4444' : floodProbability > 40 ? '#f59e0b' : '#10b981'}
                  stroke="#1e293b"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Now</span>
              <span>+2h</span>
              <span>+4h</span>
              <span>+6h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
          <div className="text-gray-400 text-sm mb-1">Population</div>
          <div className="text-white text-2xl font-bold">{stateData.population}</div>
        </div>
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
          <div className="text-gray-400 text-sm mb-1">Active Alerts</div>
          <div className="text-white text-2xl font-bold">{stateData.alerts}</div>
        </div>
      </div>

      {/* Current Situation */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Current Situation
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">{stateData.description}</p>
      </div>

      {/* Action Items */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-3">Recommended Actions</h3>
        <ul className="space-y-2">
          {stateData.risk === 'high' && (
            <>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-red-500 mt-1">●</span>
                <span>Evacuate low-lying areas immediately</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-red-500 mt-1">●</span>
                <span>Deploy emergency response teams</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-red-500 mt-1">●</span>
                <span>Activate relief centers</span>
              </li>
            </>
          )}
          {stateData.risk === 'medium' && (
            <>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-amber-500 mt-1">●</span>
                <span>Monitor water levels continuously</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-amber-500 mt-1">●</span>
                <span>Alert vulnerable populations</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-amber-500 mt-1">●</span>
                <span>Prepare emergency supplies</span>
              </li>
            </>
          )}
          {stateData.risk === 'low' && (
            <>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-emerald-500 mt-1">●</span>
                <span>Continue routine monitoring</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-emerald-500 mt-1">●</span>
                <span>Maintain readiness protocols</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <style jsx>{`
        .prediction-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StateDetails;

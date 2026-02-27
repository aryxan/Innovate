import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { indiaRiskData, getRiskColor } from '../../data/indiaRiskData';
import { cityData } from '../../data/cityData';

const INDIA_GEOJSON = "https://raw.githubusercontent.com/udit-001/india-maps-data/refs/heads/main/geojson/india.geojson";

const NationalMap = ({ onStateClick, selectedState, complaints = [] }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const container = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - container.left + 15,
      y: event.clientY - container.top + 15,
    });
  };

  const getStateComplaints = (stateName) => {
    return complaints.filter(c => {
      // Simple check - in production, use proper state matching
      return true; // For now, return all
    }).length;
  };

  const getWeatherSummary = (risk) => {
    if (risk === 'high') return '🌧️ Heavy Rain';
    if (risk === 'medium') return '⛅ Moderate Rain';
    return '☀️ Clear';
  };

  return (
    <div 
      className="w-full h-full flex flex-col bg-slate-950 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Title Bar */}
      <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">National Overview</h2>
            <p className="text-sm text-gray-400 mt-1">Click any state for detailed analysis</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Live Monitoring Active</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [78.9629, 22.5937]
          }}
          width={800}
          height={600}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup zoom={1} center={[78.9629, 22.5937]}>
            <Geographies geography={INDIA_GEOJSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.st_nm;
                  const stateData = indiaRiskData[stateName];
                  const fillColor = stateData ? getRiskColor(stateData.risk) : "#4b5563";
                  const isSelected = selectedState === stateName;
                  const isHovered = hoveredState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#1e293b"
                      strokeWidth={isSelected ? 2 : 0.5}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isSelected ? "#3b82f6" : "#1e293b",
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: "none",
                          transition: "all 0.2s ease-in-out",
                        },
                        hover: {
                          fill: fillColor,
                          stroke: "#3b82f6",
                          strokeWidth: 2,
                          outline: "none",
                          cursor: "pointer",
                          filter: "brightness(1.2)",
                          transition: "all 0.2s ease-in-out",
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: "#3b82f6",
                          strokeWidth: 2,
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => {
                        if (stateData) {
                          onStateClick(stateName);
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-2xl">
        <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">Risk Classification</h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-600 rounded-md shadow-lg"></div>
            <span className="text-gray-300 text-sm">Critical (80-100%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-600 rounded-md shadow-lg"></div>
            <span className="text-gray-300 text-sm">High (60-79%)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-emerald-600 rounded-md shadow-lg"></div>
            <span className="text-gray-300 text-sm">Low (0-59%)</span>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredState && indiaRiskData[hoveredState] && (
        <div
          className="absolute pointer-events-none z-50 animate-fadeIn"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl p-4 min-w-[240px]">
            <div className="text-white font-bold text-base mb-3 border-b border-slate-700/50 pb-2">
              {hoveredState}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Risk Score:</span>
                <span className="text-white font-semibold">{indiaRiskData[hoveredState].riskLevel}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Weather:</span>
                <span className="text-white">{getWeatherSummary(indiaRiskData[hoveredState].risk)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Alerts:</span>
                <span className="text-amber-400 font-semibold">{indiaRiskData[hoveredState].alerts}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Complaints:</span>
                <span className="text-blue-400 font-semibold">{getStateComplaints(hoveredState)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-blue-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Click for detailed view
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NationalMap;

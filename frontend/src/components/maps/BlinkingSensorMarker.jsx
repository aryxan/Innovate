import React, { useState, useEffect } from 'react';
import { OverlayView, Marker, InfoWindow } from '@react-google-maps/api';

const BlinkingSensorMarker = ({ sensor, onClick, isSelected, onCloseInfo }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (sensor.risk_level === 'critical' || sensor.risk_level === 'high') {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, sensor.risk_level === 'critical' ? 500 : 1000);
      
      return () => clearInterval(interval);
    }
  }, [sensor.risk_level]);

  const getMarkerColor = () => {
    switch (sensor.risk_level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getMarkerIcon = () => {
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: getMarkerColor(),
      fillOpacity: pulse && sensor.risk_level === 'critical' ? 0.5 : 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: pulse && (sensor.risk_level === 'critical' || sensor.risk_level === 'high') ? 10 : 8,
    };
  };

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return '↗️';
    if (trend === 'falling') return '↘️';
    return '→';
  };

  return (
    <>
      <Marker
        position={{ lat: sensor.lat, lng: sensor.lng }}
        icon={getMarkerIcon()}
        onClick={onClick}
        animation={sensor.risk_level === 'critical' ? window.google.maps.Animation.BOUNCE : null}
      />

      {/* Ripple effect for critical sensors */}
      {sensor.risk_level === 'critical' && (
        <OverlayView
          position={{ lat: sensor.lat, lng: sensor.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <div className="relative" style={{ transform: 'translate(-50%, -50%)' }}>
            <div 
              className="absolute rounded-full bg-red-500"
              style={{
                width: '40px',
                height: '40px',
                top: '-20px',
                left: '-20px',
                opacity: pulse ? 0 : 0.4,
                transform: pulse ? 'scale(2)' : 'scale(1)',
                transition: 'all 0.5s ease-out',
              }}
            />
          </div>
        </OverlayView>
      )}

      {isSelected && (
        <InfoWindow
          position={{ lat: sensor.lat, lng: sensor.lng }}
          onCloseClick={onCloseInfo}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-lg mb-2 text-slate-900">{sensor.sensor_id}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Water Level:</span>
                <span className="font-semibold text-slate-900">{sensor.water_level_cm} cm</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Trend:</span>
                <span className="font-semibold text-slate-900">
                  {getTrendIcon(sensor.trend)} {sensor.trend}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Component:</span>
                <span className="font-semibold text-slate-900">{sensor.risk_component}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`font-semibold uppercase text-xs px-2 py-0.5 rounded ${
                  sensor.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                  sensor.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                  sensor.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {sensor.risk_level}
                </span>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default BlinkingSensorMarker;

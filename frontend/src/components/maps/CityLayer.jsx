import React from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { getCityMarkerColor, getCityMarkerSize, getCityRiskLevel } from '../../data/cityData';

const CityLayer = ({ cities, onCityClick, selectedCity, onCloseInfo }) => {
  const getCityIcon = (riskScore) => {
    const size = getCityMarkerSize(riskScore);
    const color = getCityMarkerColor(riskScore);
    const riskLevel = getCityRiskLevel(riskScore);

    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: color,
      fillOpacity: 0.85,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: size,
      animation: (riskLevel === 'critical' || riskLevel === 'high') 
        ? window.google.maps.Animation.BOUNCE 
        : null,
    };
  };

  return (
    <>
      {cities.map((city) => (
        <Marker
          key={`${city.name}-${city.lat}-${city.lng}`}
          position={{ lat: city.lat, lng: city.lng }}
          icon={getCityIcon(city.riskScore)}
          onClick={() => onCityClick(city)}
          title={city.name}
        />
      ))}

      {selectedCity && (
        <InfoWindow
          position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
          onCloseClick={onCloseInfo}
        >
          <div className="p-3 min-w-[220px]">
            <h3 className="font-bold text-lg mb-3 text-slate-900 border-b border-gray-200 pb-2">
              {selectedCity.name}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Score:</span>
                <span className={`font-bold ${
                  selectedCity.riskScore >= 80 ? 'text-red-600' :
                  selectedCity.riskScore >= 60 ? 'text-orange-600' :
                  selectedCity.riskScore >= 40 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {selectedCity.riskScore}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Sensors:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {selectedCity.sensors}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Complaints:</span>
                <span className="font-semibold text-slate-900">{selectedCity.complaints}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  getCityRiskLevel(selectedCity.riskScore) === 'critical' ? 'bg-red-100 text-red-700' :
                  getCityRiskLevel(selectedCity.riskScore) === 'high' ? 'bg-orange-100 text-orange-700' :
                  getCityRiskLevel(selectedCity.riskScore) === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {getCityRiskLevel(selectedCity.riskScore)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-blue-600 font-medium">
                Click to zoom for sensor details
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default CityLayer;

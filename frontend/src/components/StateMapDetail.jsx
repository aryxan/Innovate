import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import BlinkingSensorMarker from './maps/BlinkingSensorMarker';
import ComplaintMarker from './maps/ComplaintMarker';
import CityLayer from './maps/CityLayer';
import HeatmapLayer from './maps/HeatmapLayer';
import { cityData, checkEmergencyMode } from '../data/cityData';

const libraries = ['visualization'];

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1e3a2f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9080" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c4a6e" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }],
  },
];

const StateMapDetail = ({ stateData, onClose, reports = [], selectedReport, onMapClick }) => {
  const [map, setMap] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedReportMarker, setSelectedReportMarker] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, terrain
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, city, sensor

  // Get cities for this state
  const stateCities = cityData[stateData.name] || [];

  // Filter reports for this state (if location is within state bounds)
  const stateReports = reports.filter(report => {
    // Simple proximity check - in production, use proper geofencing
    const latDiff = Math.abs(report.lat - stateData.centroid_lat);
    const lngDiff = Math.abs(report.lng - stateData.centroid_lng);
    return latDiff < 2 && lngDiff < 2; // Rough state boundary
  });

  // Check for emergency mode
  const isEmergencyMode = checkEmergencyMode(stateCities, stateReports);

  useEffect(() => {
    if (selectedReport && map) {
      map.panTo({ lat: selectedReport.lat, lng: selectedReport.lng });
      map.setZoom(14);
      setSelectedReportMarker(selectedReport);
    }
  }, [selectedReport, map]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your API key
    libraries: libraries,
  });

  const center = {
    lat: stateData.centroid_lat,
    lng: stateData.centroid_lng,
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    if (map) {
      map.panTo({ lat: city.lat, lng: city.lng });
      map.setZoom(12);
      setViewMode('city');
    }
  };

  const handleBackToOverview = () => {
    if (map) {
      map.panTo(center);
      map.setZoom(8);
      setViewMode('overview');
      setSelectedCity(null);
      setSelectedSensor(null);
      setSelectedReportMarker(null);
    }
  };

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading Google Maps</p>
          <p className="text-sm text-gray-400">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-slate-900 rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 animate-pulse">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-bold text-sm uppercase tracking-wider">⚠ Emergency Hydrological Alert</span>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2" style={{ marginTop: isEmergencyMode ? '50px' : '0' }}>
        {/* Map Type Toggle */}
        <div className="bg-slate-800/95 backdrop-blur-md rounded-lg p-2 border border-slate-700/50 shadow-lg">
          <div className="flex gap-1">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                mapType === 'roadmap'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                mapType === 'satellite'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                mapType === 'terrain'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Terrain
            </button>
          </div>
        </div>

        {/* Heatmap Toggle */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            showHeatmap
              ? 'bg-orange-600 text-white'
              : 'bg-slate-800/95 text-gray-300 hover:bg-slate-700 border border-slate-700/50'
          } backdrop-blur-md shadow-lg`}
        >
          {showHeatmap ? '🔥 Hide Heatmap' : '🗺️ Show Risk Heatmap'}
        </button>

        {/* View Mode Indicator */}
        {viewMode !== 'overview' && (
          <button
            onClick={handleBackToOverview}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-md shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </button>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-slate-800/95 backdrop-blur-md hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700/50 shadow-lg transition-all"
        style={{ marginTop: isEmergencyMode ? '50px' : '0' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-semibold">Back to National View</span>
      </button>

      {/* Layer Info Badge */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/95 backdrop-blur-md rounded-lg px-4 py-2 border border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-semibold">
            {viewMode === 'overview' && `${stateCities.length} Cities • ${stateData.sensors?.length || 0} Sensors • ${stateReports.length} Reports`}
            {viewMode === 'city' && selectedCity && `${selectedCity.name} • ${selectedCity.sensors} Sensors • ${selectedCity.complaints} Complaints`}
            {viewMode === 'overview' && stateCities.length === 0 && `${stateData.sensors?.length || 0} Active Sensors`}
          </span>
        </div>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapType === 'roadmap' ? darkMapStyles : [],
          mapTypeId: mapType,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Heatmap Layer */}
        <HeatmapLayer 
          sensors={stateData.sensors}
          complaints={stateReports}
          showHeatmap={showHeatmap}
        />

        {/* City Layer - Show in overview mode */}
        {viewMode === 'overview' && stateCities.length > 0 && (
          <CityLayer
            cities={stateCities}
            onCityClick={handleCityClick}
            selectedCity={selectedCity}
            onCloseInfo={() => setSelectedCity(null)}
          />
        )}

        {/* Sensor Markers - Show when not in heatmap mode */}
        {!showHeatmap && stateData.sensors?.map((sensor) => (
          <BlinkingSensorMarker
            key={sensor.sensor_id}
            sensor={sensor}
            onClick={() => setSelectedSensor(sensor)}
            isSelected={selectedSensor?.sensor_id === sensor.sensor_id}
            onCloseInfo={() => setSelectedSensor(null)}
          />
        ))}

        {/* Citizen Report Markers */}
        {stateReports.map((report) => (
          <ComplaintMarker
            key={report.id}
            complaint={report}
            onClick={() => setSelectedReportMarker(report)}
            isSelected={selectedReportMarker?.id === report.id}
            onCloseInfo={() => setSelectedReportMarker(null)}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default StateMapDetail;

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { indiaRiskData, getRiskColor } from '../data/indiaRiskData';

// India GeoJSON URL - All states with district boundaries
const INDIA_GEOJSON = "https://raw.githubusercontent.com/udit-001/india-maps-data/refs/heads/main/geojson/india.geojson";

const IndiaMap = ({ onStateClick, selectedState }) => {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([78.9629, 22.5937]);

  const handleMouseEnter = (stateName) => {
    setHoveredState(stateName);
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
  };

  const handleMouseMove = (event) => {
    const container = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - container.left + 15,
      y: event.clientY - container.top + 15,
    });
  };

  const getTooltipContent = (stateName) => {
    const stateData = indiaRiskData[stateName];
    
    if (!stateData) {
      return {
        name: stateName,
        risk: 'No Data',
        riskLevel: 0,
        rainfall: 'N/A',
        readiness: 0,
      };
    }

    // Generate mock rainfall and readiness data based on risk level
    const rainfallMap = {
      high: Math.floor(Math.random() * 50) + 150,
      medium: Math.floor(Math.random() * 50) + 75,
      low: Math.floor(Math.random() * 40) + 20,
    };

    const readinessMap = {
      high: Math.floor(Math.random() * 15) + 85,
      medium: Math.floor(Math.random() * 20) + 70,
      low: Math.floor(Math.random() * 20) + 60,
    };

    return {
      name: stateName,
      risk: stateData.risk,
      riskLevel: stateData.riskLevel,
      rainfall: rainfallMap[stateData.risk] || 0,
      readiness: readinessMap[stateData.risk] || 0,
    };
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500/90 text-white';
      case 'medium':
        return 'bg-yellow-500/90 text-gray-900';
      case 'low':
        return 'bg-green-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  // State center coordinates for zooming
  const stateCenters = {
    "Andhra Pradesh": [79.7400, 15.9129],
    "Arunachal Pradesh": [94.7278, 28.2180],
    "Assam": [92.9376, 26.2006],
    "Bihar": [85.3131, 25.0961],
    "Chhattisgarh": [81.8661, 21.2787],
    "Goa": [74.1240, 15.2993],
    "Gujarat": [71.1924, 22.2587],
    "Haryana": [76.0856, 29.0588],
    "Himachal Pradesh": [77.1734, 31.1048],
    "Jharkhand": [85.2799, 23.6102],
    "Karnataka": [75.7139, 15.3173],
    "Kerala": [76.2711, 10.8505],
    "Madhya Pradesh": [78.6569, 22.9734],
    "Maharashtra": [75.7139, 19.7515],
    "Manipur": [93.9063, 24.6637],
    "Meghalaya": [91.3662, 25.4670],
    "Mizoram": [92.9376, 23.1645],
    "Nagaland": [94.5624, 26.1584],
    "Odisha": [85.0985, 20.9517],
    "Punjab": [75.3412, 31.1471],
    "Rajasthan": [74.2179, 27.0238],
    "Sikkim": [88.5122, 27.5330],
    "Tamil Nadu": [78.6569, 11.1271],
    "Telangana": [79.0193, 18.1124],
    "Tripura": [91.9882, 23.9408],
    "Uttar Pradesh": [80.9462, 26.8467],
    "Uttarakhand": [79.0193, 30.0668],
    "West Bengal": [87.8550, 22.9868],
    "Andaman and Nicobar Islands": [92.6586, 11.7401],
    "Chandigarh": [76.7794, 30.7333],
    "Dadra and Nagar Haveli and Daman and Diu": [73.0169, 20.1809],
    "Delhi": [77.1025, 28.7041],
    "Jammu and Kashmir": [76.5762, 33.7782],
    "Ladakh": [78.2932, 34.1526],
    "Lakshadweep": [72.6369, 10.5667],
    "Puducherry": [79.8083, 11.9416],
  };

  // Locate Me functionality
  const handleLocateMe = async () => {
    setIsLocating(true);
    setLocationError('');
    setSearchError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        try {
          // Reverse geocoding using Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await response.json();

          if (data.address) {
            const state = data.address.state;
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const locationName = city ? `${city}, ${state}` : state;
            
            setDetectedLocation({
              coordinates: [longitude, latitude],
              name: locationName,
              state: state
            });
            
            // Try to match state name
            const matchedState = Object.keys(indiaRiskData).find(
              s => s.toLowerCase() === state?.toLowerCase()
            );

            if (matchedState) {
              onStateClick(matchedState);
              setCenter([longitude, latitude]);
              setZoom(4);
              setLocationError('');
            } else {
              setLocationError(`Location detected: ${state || 'Unknown'} - Not in our database`);
              setCenter([longitude, latitude]);
              setZoom(4);
            }
          } else {
            setLocationError('Could not determine state from your location');
          }
        } catch (error) {
          setLocationError('Failed to fetch location details');
          console.error('Reverse geocoding error:', error);
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
        }
      }
    );
  };

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    setLocationError('');
    setSearchError('');

    if (!searchQuery.trim()) {
      setSearchError('Please enter a state name');
      return;
    }

    // Case insensitive search
    const matchedState = Object.keys(indiaRiskData).find(
      state => state.toLowerCase() === searchQuery.toLowerCase().trim()
    );

    if (matchedState) {
      onStateClick(matchedState);
      zoomToState(matchedState);
      setSearchQuery('');
      setSearchError('');
    } else {
      setSearchError('State not found. Please check the spelling.');
    }
  };

  // Zoom to state
  const zoomToState = (stateName) => {
    const stateCenter = stateCenters[stateName];
    if (stateCenter) {
      setCenter(stateCenter);
      setZoom(3.5);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.5, 8));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.5, 1));
  };

  // Reset zoom
  const handleResetZoom = () => {
    setCenter([78.9629, 22.5937]);
    setZoom(1);
    setDetectedLocation(null);
  };

  return (
    <div 
      className="w-full h-full flex flex-col bg-gray-900 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Search and Locate Controls */}
      <div className="absolute top-4 left-4 z-40 flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state..."
              className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-md border border-blue-500/50"
          >
            {isLocating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Locating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Locate Me</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 text-white p-3 rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 text-white p-3 rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        {zoom > 1 && (
          <button
            onClick={handleResetZoom}
            className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 text-white p-3 rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
            title="Reset View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Messages */}
      {(locationError || searchError) && (
        <div className="absolute top-20 left-4 z-40 bg-red-900/95 backdrop-blur-md border border-red-600/50 rounded-lg px-4 py-2 text-white max-w-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{locationError || searchError}</span>
            <button
              onClick={() => {
                setLocationError('');
                setSearchError('');
              }}
              className="ml-auto text-red-300 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 flex items-center justify-center">
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
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ coordinates, zoom }) => {
              setCenter(coordinates);
              setZoom(zoom);
            }}
          >
            <Geographies geography={INDIA_GEOJSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.st_nm;
                  const stateData = indiaRiskData[stateName];
                  const fillColor = stateData ? getRiskColor(stateData.risk) : "#4b5563";
                  const isSelected = selectedState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#1f2937"
                      strokeWidth={isSelected ? 2 : 0.5}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isSelected ? "#fff" : "#1f2937",
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: "none",
                          transition: "all 0.2s ease-in-out",
                        },
                        hover: {
                          fill: fillColor,
                          stroke: "#fff",
                          strokeWidth: 2,
                          outline: "none",
                          cursor: "pointer",
                          filter: "brightness(1.3)",
                          transition: "all 0.2s ease-in-out",
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: "#fff",
                          strokeWidth: 2,
                          outline: "none",
                        },
                      }}
                      onMouseEnter={() => handleMouseEnter(stateName)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        if (stateData) {
                          onStateClick(stateName);
                          zoomToState(stateName);
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Location Pin Marker */}
            {detectedLocation && (
              <Marker coordinates={detectedLocation.coordinates}>
                <g>
                  <ellipse cx="0" cy="25" rx="8" ry="3" fill="#000000" opacity="0.3" />
                  <path
                    d="M0,-20 C-8,-20 -15,-13 -15,-5 C-15,3 0,20 0,20 C0,20 15,3 15,-5 C15,-13 8,-20 0,-20 Z"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <circle cx="0" cy="-5" r="5" fill="#FFFFFF" />
                  <circle cx="0" cy="-5" r="8" fill="#EF4444" opacity="0.4">
                    <animate
                      attributeName="r"
                      from="8"
                      to="15"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.4"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </Marker>
            )}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Location Label */}
      {detectedLocation && (
        <div className="absolute bottom-8 left-4 z-40 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-lg px-4 py-3 text-white shadow-lg max-w-xs">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Your Location</div>
              <div className="font-semibold text-sm">{detectedLocation.name}</div>
            </div>
            <button
              onClick={() => setDetectedLocation(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredState && (
        <div
          className="absolute pointer-events-none z-50 animate-fadeIn"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-lg shadow-2xl p-4 min-w-[220px]">
            {(() => {
              const tooltipData = getTooltipContent(hoveredState);
              return (
                <>
                  <div className="text-white font-bold text-base mb-3 border-b border-slate-600/50 pb-2">
                    {tooltipData.name}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Risk Level:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getRiskBadgeColor(tooltipData.risk)}`}>
                      {tooltipData.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Risk Score:</span>
                    <span className="text-white font-semibold text-sm">{tooltipData.riskLevel}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Readiness:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${tooltipData.readiness}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold text-sm">{tooltipData.readiness}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Rainfall:</span>
                    <span className="text-blue-400 font-semibold text-sm">{tooltipData.rainfall} mm</span>
                  </div>
                  <div className="absolute -left-1 top-4 w-2 h-2 bg-slate-800 border-l border-t border-slate-600/50 transform rotate-45"></div>
                </>
              );
            })()}
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

export default IndiaMap;

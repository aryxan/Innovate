# JalRakshak AI - Hybrid Mapping Architecture Guide

## Overview

JalRakshak AI uses a **two-layer hybrid mapping architecture**:

1. **Layer 1: National Overview (SVG Map)** - Fast, lightweight India map for state-level risk visualization
2. **Layer 2: State Detail View (Google Maps)** - Detailed sensor visualization with real-time data

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   National View (SVG)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  • Color-coded states by risk level              │  │
│  │  • Weather icons overlay                         │  │
│  │  • Click state → Drill down to Google Maps      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ Click State
┌─────────────────────────────────────────────────────────┐
│              State Detail View (Google Maps)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  • Sensor markers (color by risk)                │  │
│  │  • InfoWindows with live data                    │  │
│  │  • Heatmap layer (optional)                      │  │
│  │  • Satellite/Terrain toggle                      │  │
│  │  • Back to National View button                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend will run on `http://localhost:8000`

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API (optional)
4. Create credentials → API Key
5. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:5173/*`
   - API restrictions: Maps JavaScript API

### 3. Configure API Key

Open `frontend/src/components/StateMapDetail.jsx` and replace:

```javascript
googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
```

With your actual API key.

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install `@react-google-maps/api` package.

### 5. Run Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Features

### National View (SVG Map)
- ✅ Fast rendering of all Indian states
- ✅ Color-coded risk levels (green/yellow/orange/red)
- ✅ Weather icon overlays
- ✅ Hover tooltips with quick stats
- ✅ Search and locate functionality
- ✅ Zoom controls

### State Detail View (Google Maps)
- ✅ Dynamic loading (only when state selected)
- ✅ Sensor markers with risk-based colors:
  - 🟢 Green: Low risk
  - 🟡 Yellow: Medium risk
  - 🟠 Orange: High risk
  - 🔴 Red: Critical risk
- ✅ InfoWindow popups showing:
  - Sensor ID
  - Water level (cm)
  - Trend (rising/stable/falling)
  - Risk component %
  - Last update time
- ✅ Map type toggle (Map/Satellite/Terrain)
- ✅ Risk heatmap layer (for states with 4+ sensors)
- ✅ Dark theme styling
- ✅ Smooth animations
- ✅ Back to national view button

## API Endpoints

### Get State Risk with Sensors
```
GET /state-risk/{state_name}
```

Response:
```json
{
  "state_name": "Maharashtra",
  "centroid_lat": 19.7515,
  "centroid_lng": 75.7139,
  "risk_score": 65.5,
  "risk_level": "high",
  "weather_type": "rain",
  "rainfall_mm": 45.2,
  "temperature": 28.5,
  "confidence": 89.5,
  "trend": "rising",
  "forecast_12h": 72.4,
  "past_7day_rainfall": 156.8,
  "last_updated": "2024-02-27T10:30:00",
  "sensors": [
    {
      "sensor_id": "MAH-S001",
      "lat": 19.0760,
      "lng": 72.8777,
      "water_level_cm": 285,
      "trend": "rising",
      "risk_component": 68.5,
      "risk_level": "high",
      "last_update": "2 minutes ago",
      "status": "active"
    }
  ]
}
```

## User Flow

1. **National Overview**
   - User sees India map with color-coded states
   - Hover shows quick tooltip
   - Search or locate functionality available

2. **State Selection**
   - Click on any state
   - Smooth transition animation
   - Google Maps loads dynamically

3. **State Detail View**
   - Map centers on state
   - Sensor markers appear
   - Click marker to see detailed info
   - Toggle heatmap for risk visualization
   - Switch between map types
   - Click "Back to National View" to return

## Performance Optimization

- ✅ Google Maps loads only when needed (lazy loading)
- ✅ SVG map for fast national overview
- ✅ Sensor data fetched on-demand
- ✅ Heatmap only for states with multiple sensors
- ✅ Marker clustering for dense sensor areas (future)

## Customization

### Adjust Map Zoom Level
In `StateMapDetail.jsx`:
```javascript
zoom={8}  // Change this value (1-20)
```

### Modify Marker Colors
In `getMarkerIcon()` function:
```javascript
const colors = {
  low: '#10b981',      // Green
  medium: '#f59e0b',   // Yellow
  high: '#f97316',     // Orange
  critical: '#ef4444', // Red
};
```

### Change Heatmap Gradient
In HeatmapLayer options:
```javascript
gradient: [
  'rgba(0, 255, 0, 0)',
  'rgba(0, 255, 0, 1)',
  'rgba(255, 255, 0, 1)',
  'rgba(255, 165, 0, 1)',
  'rgba(255, 0, 0, 1)',
]
```

## Troubleshooting

### Google Maps not loading
- Check API key is correct
- Verify Maps JavaScript API is enabled
- Check browser console for errors
- Ensure API key restrictions allow localhost

### Sensors not appearing
- Verify backend is running
- Check `/state-risk/{state_name}` endpoint returns sensors
- Open browser DevTools → Network tab

### Heatmap not showing
- Ensure state has 4+ sensors
- Check "Show Risk Heatmap" button is clicked
- Verify `visualization` library is loaded

## Future Enhancements

- [ ] Real-time sensor data streaming
- [ ] Historical data playback
- [ ] Marker clustering for dense areas
- [ ] Custom map overlays (flood zones, evacuation routes)
- [ ] 3D terrain visualization
- [ ] Satellite imagery integration
- [ ] Mobile-responsive map controls

## Support

For issues or questions:
- Check backend logs: `backend/main.py`
- Check frontend console: Browser DevTools
- Verify API endpoints: `http://localhost:8000/docs`

# JalRakshak AI - Flood Risk Monitoring Dashboard

A real-time flood risk monitoring dashboard for India built with React, Vite, and Tailwind CSS.

## Features

- 🗺️ Interactive map of India with state-level flood risk visualization
- 🎨 Color-coded risk levels (Green: Low, Yellow: Medium, Red: High)
- 📊 Detailed state information panel with risk metrics
- 🚨 Dynamic alert bar showing current state status
- 📱 Responsive, full-screen control-room style UI
- ⚡ Fast performance with Vite

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **react-simple-maps** - Interactive map rendering
- **d3-scale** - Data visualization utilities

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── index.html              # Main HTML file with Tailwind CDN
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx            # Application entry point
    ├── App.jsx             # Main application component
    ├── components/
    │   ├── IndiaMap.jsx    # Interactive India map component
    │   ├── StateDetails.jsx # State information panel
    │   └── AlertBar.jsx    # Alert notification bar
    └── data/
        └── indiaRiskData.js # Mock flood risk data for all states
```

## Usage

1. The dashboard displays an interactive map of India on the left (60% width)
2. Click on any state to view detailed information
3. The right panel (40% width) shows:
   - State name and risk level
   - Risk percentage with visual bar
   - Population and active alerts
   - Current situation description
   - Recommended actions
4. The alert bar at the top updates based on selected state
5. Header shows overall statistics across all states

## Risk Levels

- **High Risk (Red)**: 70%+ risk level - Critical flood situation
- **Medium Risk (Yellow)**: 40-69% risk level - Moderate flood risk
- **Low Risk (Green)**: 0-39% risk level - Normal conditions

## Customization

To update flood risk data, edit `src/data/indiaRiskData.js` with real-time data from your backend API.

## License

MIT

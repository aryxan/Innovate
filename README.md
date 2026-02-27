# 🌊 JalRakshak AI - Hydrological Intelligence Control System

A comprehensive **National Infrastructure Intelligence Platform** for real-time flood monitoring, prediction, and disaster management across India.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)
![Python](https://img.shields.io/badge/Python-3.9+-3776ab.svg)

---

## 🎯 Overview

JalRakshak AI is a government-grade hydrological intelligence system that monitors **2,500+ sensors** across India to predict flood risks, detect drain blockages, and coordinate emergency response through AI-powered analytics.

### Key Features

- 🗺️ **Multi-Layer Geographic Intelligence** - National → State → City → Sensor hierarchy
- 🤖 **AI Flood Prediction Engine** - Multi-factor risk assessment with 5 weighted inputs
- 📊 **Real-Time Sensor Network** - 2,500+ drain, river, and rainfall sensors
- 🎯 **AI Confidence Scoring** - 4-factor confidence calculation for predictions
- 🚨 **Citizen Alert System** - OTP-verified complaint reporting with tracking
- 👨‍💼 **Admin Dashboard** - Complaint management and status tracking
- 📈 **Live Event Feed** - Real-time monitoring of sensor spikes and anomalies
- 🔍 **Drain Network Intelligence** - Blockage detection and overflow alerts

---

## 🏗️ Architecture

### Frontend (React + Vite)
- **Interactive India Map** - SVG-based national overview with state-level risk visualization
- **Google Maps Integration** - City and sensor-level detailed views
- **Multi-Layer System** - Hierarchical navigation from national to sensor level
- **Real-Time Dashboard** - Live statistics and event monitoring
- **Responsive UI** - Government-grade command center aesthetic

### Backend (FastAPI + Python)
- **Weather Service** - Open-Meteo API integration for real-time weather data
- **Risk Engine** - Probabilistic flood risk calculation
- **Sensor Service** - Mock sensor data generation (ready for IoT integration)
- **RESTful API** - CORS-enabled endpoints for frontend communication

### Data & Intelligence
- **Sensor Network** - 2,500+ sensors across 36 states/UTs
- **Predictive Engine** - 5-factor weighted risk assessment
- **AI Confidence Engine** - 4-factor confidence scoring
- **Dynamic State Data** - Real-time computation from sensor network

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aryxan/Innovate.git
   cd Innovate
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Setup Backend** (Optional - for weather integration)
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   Backend will run on `http://localhost:8000`

---

## 📱 Application Routes

- **Landing Page**: `/`
- **Dashboard**: `/dashboard`
- **Admin Login**: `/admin`
- **Admin Dashboard**: `/admin/dashboard`

### Demo Credentials
- **Admin Username**: `admin`
- **Admin Password**: `admin123`

---

## 🎨 Features Breakdown

### 1. National Overview Map
- Color-coded states by risk level (Green/Yellow/Red)
- Hover tooltips with risk score, rainfall, and readiness
- Click to drill down to state details

### 2. Multi-Layer Map System
- **Layer 1**: National SVG map
- **Layer 2**: State view with city markers
- **Layer 3**: City view with sensor and complaint markers
- **Heatmap**: AI risk overlay based on sensor data

### 3. Sensor Network (2,500+ Sensors)
- **Drain Sensors**: Urban drainage monitoring with blockage detection
- **River Sensors**: Water level tracking
- **Rainfall Sensors**: Precipitation and humidity measurement

**Intelligent Logic**:
- Blockage Detection: `waterLevel > 85%` AND `flowRate < 15%`
- Overflow Alert: `waterLevel > 95%`
- Status Classification: Normal/Warning/Critical

### 4. Predictive Flood Engine
Multi-factor risk assessment with weighted inputs:
- Rainfall Forecast (25%)
- River Level Trend (20%)
- Drain Blockage Density (25%)
- Complaint Spike Factor (15%)
- Soil Saturation Index (15%)

**Risk Classification**:
- Low: 0-39%
- Medium: 40-69%
- High: 70-100%

### 5. AI Confidence Engine
4-factor confidence calculation:
- Sensor Coverage (40%)
- Cross-Signal Agreement (30%)
- Data Freshness (20%)
- Historical Pattern Match (10%)

**Confidence Levels**: Very High / High / Medium / Low / Very Low

### 6. Citizen Reporting System
- OTP-verified mobile number authentication
- Unique complaint number generation (JR12345678 format)
- Issue type selection (Blocked Drain, Overflowing Drain, etc.)
- Severity classification (Low/Medium/High)
- Location detection via GPS or map click
- Status tracking (Pending/In-Progress/Resolved/Rejected)

### 7. Admin Dashboard
- Complaint management interface
- Status update functionality
- Statistics cards (Total/Pending/In-Progress/Resolved)
- Issue type distribution analysis
- Detailed complaint view panel

### 8. Drain Network Intelligence
- Health metrics dashboard (Healthy/Blocked/Overflowing %)
- Top 5 critical cities identification
- Real-time network statistics
- Blinking indicators for overflow zones

### 9. Live Event Feed
Auto-generated events from sensor data:
- Sensor spike alerts
- Blockage detection
- Complaint surges
- Rainfall anomalies
- System alerts

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Simple Maps** - SVG India map
- **@react-google-maps/api** - Google Maps integration
- **Tailwind CSS** - Utility-first styling

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Open-Meteo API** - Weather data integration
- **CORS Middleware** - Cross-origin support

### Data & Intelligence
- **Custom Sensor Network** - 2,500+ simulated sensors
- **Predictive Engine** - Multi-factor risk calculation
- **AI Confidence Engine** - Prediction reliability scoring

---

## 📊 Data Structure

### Sensor Model
```javascript
{
  id: "MH-MUM-DR-0042",
  state: "Maharashtra",
  city: "Mumbai",
  type: "drain" | "river" | "rainfall",
  lat: 19.0760,
  lng: 72.8777,
  waterLevelPercentage: 87.5,
  flowRate: 12.3,
  blockageIndex: 78.2,
  status: "normal" | "warning" | "critical",
  lastUpdatedMinutesAgo: 5
}
```

### Risk Assessment Output
```javascript
{
  riskScore: 75,
  riskLevel: "high",
  contributingFactors: [...],
  prediction: {
    severity: "high",
    message: "Elevated flood risk",
    action: "Monitor situation closely",
    timeframe: "Next 12-24 hours"
  }
}
```

---

## 🎨 UI/UX Design

### Command Center Aesthetic
- Dark theme (Slate-900/950)
- Glassmorphic effects with backdrop blur
- Neon blue accent colors
- Professional typography (Mono fonts for data)
- Subtle grid background pattern

### Animations
- Pulse effects for critical alerts
- Scale transforms on hover
- Fade transitions for state changes
- Blinking indicators for overflow zones
- Gradient glows on metric cards

---

## 📚 Documentation

- **[Admin System Guide](ADMIN_SYSTEM_GUIDE.md)** - Complete admin functionality documentation
- **[Hybrid Mapping Guide](HYBRID_MAPPING_GUIDE.md)** - Multi-layer map system details
- **[Hydrological Intelligence System](HYDROLOGICAL_INTELLIGENCE_SYSTEM.md)** - Core system documentation
- **[Multi-Layer Map Implementation](MULTI_LAYER_MAP_IMPLEMENTATION.md)** - Technical implementation details

---

## 🔮 Future Enhancements

- [ ] Real IoT sensor integration
- [ ] Historical trend analysis and charts
- [ ] SMS/Email alert notifications
- [ ] Mobile app (React Native)
- [ ] Machine learning model training on historical data
- [ ] Integration with government disaster management systems
- [ ] Multi-language support
- [ ] Offline mode with data sync
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/Excel)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Aryan** - [@aryxan](https://github.com/aryxan)

---

## 🙏 Acknowledgments

- Open-Meteo API for weather data
- React Simple Maps for India GeoJSON
- Google Maps Platform
- FastAPI framework
- React and Vite communities

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ for India's flood safety and disaster management**

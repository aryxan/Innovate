# 🌊 JalRakshak — Real-Time Flood Monitoring & Prediction System

<div align="center">

![JalRakshak Banner](https://img.shields.io/badge/JalRakshak-Water%20Protector-blue?style=for-the-badge)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=flat&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-ML%20Model-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-Internal-red?style=flat)](LICENSE)

**An intelligent disaster management platform combining citizen reporting, administrative coordination, and AI-powered flood prediction.**

[Features](#-features) • [Architecture](#-system-architecture) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
  - [Citizen Portal](#-citizen-portal-consumer-interface)
  - [Admin Portal](#-admin-portal-command--control)
  - [AI Model](#-ai-model-flood-prediction-engine)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Data Sources](#-data-sources)
- [Incident Lifecycle](#-incident-lifecycle)
- [Key Innovations](#-key-innovations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**JalRakshak** (जलरक्षक - "Water Protector") is a full-stack intelligent disaster management platform designed to address flood emergencies through three integrated components:

1. **🧑‍🤝‍🧑 Citizen Reporting System** — Real-time incident reporting from affected communities
2. **🛡️ Administrative Command Center** — Centralized dashboard for emergency response coordination
3. **🧠 AI Prediction Engine** — Spatio-temporal deep learning model for flood forecasting

The platform delivers real-time situational awareness, predictive intelligence, and rapid response coordination during flood emergencies.

---

## 🏗️ System Architecture

```
┌─────────────────┐
│  Citizen Input  │ ─┐
│  (Mobile/Web)   │  │
└─────────────────┘  │
                     ▼
              ┌──────────────┐
              │   Firebase   │ ◄──────┐
              │  (Firestore) │        │
              └──────────────┘        │
                     │                │
                     ▼                │
              ┌──────────────┐        │
              │    Admin     │        │
              │  Dashboard   │ ───────┤
              └──────────────┘        │
                     │                │
                     ▼                │
              ┌──────────────┐        │
              │   Response   │        │
              │    Teams     │        │
              └──────────────┘        │
                                      │
┌─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────┐
│         AI Prediction Engine            │
│  ┌───────────┐  ┌──────────────────┐   │
│  │  Spatial  │  │    Temporal      │   │
│  │  Module   │  │  (LSTM Model)    │   │
│  │ (SCS-CN)  │  │                  │   │
│  └───────────┘  └──────────────────┘   │
│         ▲               ▲               │
│         │               │               │
│   ┌─────┴───────────────┴─────┐        │
│   │  Weather + Sensors + GIS  │        │
│   └───────────────────────────┘        │
└─────────────────────────────────────────┘
```

---

## ✨ Features

### 🧑‍🤝‍🧑 Citizen Portal (Consumer Interface)

<table>
<tr>
<td width="50%">

#### 🌊 Flood Reporting
- **Multi-type incident logging**
  - Waterlogging
  - Overflow events
  - Drainage blockages
- **Rich media support**
  - Image uploads
  - GPS-based geolocation
  - Severity classification

</td>
<td width="50%">

#### 📍 Real-Time Tracking
- Track reports via phone or incident ID
- Live status updates:
  - 🟡 Pending
  - 🔵 Assigned
  - 🔄 In Progress
  - 🟢 Resolved

</td>
</tr>
<tr>
<td width="50%">

#### 🗺️ Live Incident Map
- Interactive mapping interface
- Color-coded severity indicators
- Real-time synchronized updates

</td>
<td width="50%">

#### 🆘 Emergency Services
- Missing person registry
- Volunteer network coordination
- Crisis counseling resources

</td>
</tr>
</table>

### 🛡️ Admin Portal (Command & Control)

> 🔗 **Repository:** [JalRakshakAdmin](https://github.com/SA318-ctrl/JalRakshakAdmin)

<table>
<tr>
<td width="50%">

#### 📊 Tactical Dashboard
- Real-time incident feed
- Alert prioritization system
- Weather metrics integration
- Performance analytics

#### 🗺️ GIS Intelligence
- Satellite mapping (Leaflet)
- Multi-layer overlays
- Topographic visualization
- Flood risk zones

</td>
<td width="50%">

#### 📦 Incident Management
- Team assignment workflows
- Real-time status updates (Firestore sync)
- Priority-based routing
- Communication logs

#### 🏥 Infrastructure Registry
- Hospital locations
- School facilities
- Relief centers
- Emergency shelters

</td>
</tr>
<tr>
<td colspan="2">

#### 🚀 Resource Optimization
- **ETA calculation** — Dynamic route planning
- **Nearest facility detection** — Distance-based allocation
- **Resource availability tracking** — Real-time inventory

</td>
</tr>
</table>

### 🧠 AI Model — Flood Prediction Engine

> 🔗 **Repository:** [JalRakshakModel](https://github.com/SA318-ctrl/JalRakshakModel)

#### 🔬 Hybrid Spatio-Temporal Deep Learning Pipeline

The prediction engine combines spatial and temporal intelligence for accurate flood forecasting:

<table>
<tr>
<th>Module</th>
<th>Description</th>
<th>Technology</th>
</tr>
<tr>
<td><strong>1️⃣ Spatial Module</strong></td>
<td>
<strong>Inputs:</strong><br>
• LULC (Land Use Land Cover)<br>
• DEM (Digital Elevation Model)<br>
• HSG (Hydrologic Soil Groups)<br><br>
<strong>Method:</strong><br>
• SCS Curve Number Method<br>
• Runoff Coefficient (C) computation
</td>
<td>Geospatial Analysis</td>
</tr>
<tr>
<td><strong>2️⃣ Temporal Model</strong></td>
<td>
<strong>Inputs:</strong><br>
• Rainfall time-series<br>
• River stage levels<br>
• Discharge velocity<br>
• IoT drain sensor data<br><br>
<strong>Output:</strong><br>
• Flood probability<br>
• Predicted water levels
</td>
<td>LSTM (PyTorch)</td>
</tr>
<tr>
<td><strong>3️⃣ Sensor Intelligence</strong></td>
<td>
<strong>Purpose:</strong><br>
• Raw signal processing<br>
• Real-world flow metric conversion
</td>
<td>Random Forest Regression</td>
</tr>
<tr>
<td><strong>4️⃣ Real-Time Pipeline</strong></td>
<td>
<strong>Components:</strong><br>
• Event streaming (Kafka/MQTT)<br>
• Inference API (FastAPI)<br>
• Low-latency JSON predictions
</td>
<td>FastAPI + Kafka</td>
</tr>
</table>

#### 📂 Model Repository Structure

```
JalRakshakModel/
├── data/
│   ├── static/           # GIS layers, DEM, LULC
│   ├── historical/       # Historical flood events
│   └── mock_streams/     # Simulated sensor data
├── src/
│   ├── spatial/          # SCS-CN implementation
│   ├── sensors/          # IoT data processing
│   ├── data/             # Data loaders & preprocessing
│   ├── models/           # LSTM & RF models
│   └── deployment/       # FastAPI inference server
└── notebooks/            # Research & experimentation
```

---

## 🔄 Real-Time Workflow

```
1. Citizen submits flood report
           ↓
2. Stored in Firebase Firestore
           ↓
3. Admin dashboard updates instantly
           ↓
4. AI model processes:
   • Current rainfall data
   • Terrain characteristics
   • Sensor readings
           ↓
5. Flood risk prediction generated
           ↓
6. Admin assigns response team
           ↓
7. Citizen tracks progress in real-time
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=white) | UI framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build tool |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | Styling |
| ![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0055FF?style=flat&logo=framer&logoColor=white) | Animations |
| ![Leaflet](https://img.shields.io/badge/-Leaflet-199900?style=flat&logo=leaflet&logoColor=white) | Mapping |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?style=flat&logo=firebase&logoColor=white) | Database (Firestore) |
| ![Firebase Auth](https://img.shields.io/badge/-Firebase%20Auth-FFCA28?style=flat&logo=firebase&logoColor=white) | Authentication |
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat&logo=fastapi&logoColor=white) | ML inference API |

### Machine Learning
| Technology | Purpose |
|------------|---------|
| ![PyTorch](https://img.shields.io/badge/-PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white) | Deep learning framework |
| ![Scikit-learn](https://img.shields.io/badge/-Scikit--learn-F7931E?style=flat&logo=scikitlearn&logoColor=white) | ML utilities |
| ![Pandas](https://img.shields.io/badge/-Pandas-150458?style=flat&logo=pandas&logoColor=white) | Data processing |
| ![NumPy](https://img.shields.io/badge/-NumPy-013243?style=flat&logo=numpy&logoColor=white) | Numerical computing |

---

## 🚀 Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.8+ (for ML model)
- Firebase account with Firestore enabled
- Git

### Citizen/Admin Portal Setup

```bash
# Clone the repository
git clone https://github.com/your-username/JalRakshak.git
cd JalRakshak

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure Firebase credentials (see Configuration section)

# Start development server
npm run dev
```

### AI Model Setup

```bash
# Clone the model repository
git clone https://github.com/SA318-ctrl/JalRakshakModel.git
cd JalRakshakModel

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run inference server
uvicorn src.deployment.api:app --reload
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional: External APIs
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_MAPBOX_TOKEN=your_mapbox_token

# ML Model Endpoint
VITE_ML_API_URL=http://localhost:8000
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Enable Storage (for image uploads)
5. Copy configuration from Project Settings → General → Your apps

### Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{incidentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.token.admin == true;
    }
  }
}
```

---

## 🌦️ Data Sources

| Source | Purpose | Provider |
|--------|---------|----------|
| **Weather APIs** | Real-time rainfall, temperature | OpenWeather API |
| **Hydrological Data** | River levels, discharge | WRIS (Water Resources Information System) |
| **IoT Sensors** | Drain monitoring, water level | Custom hardware network |
| **GIS Layers** | DEM, LULC, soil data | USGS, ESA Sentinel |

---

## 📊 Incident Lifecycle

| Stage | Status | Description |
|-------|--------|-------------|
| 🟡 | **Pending** | Report received, awaiting assignment |
| 🔵 | **Assigned** | Response team allocated |
| 🔄 | **In Progress** | Team actively responding |
| 🟢 | **Resolved** | Issue successfully addressed |

---

## 🔥 Key Innovations

<table>
<tr>
<td width="50%">

### 🧠 Hybrid AI Architecture
Combines spatial terrain analysis with temporal deep learning for superior flood prediction accuracy.

### 📡 Real-Time Data Fusion
Integrates IoT sensors, weather APIs, and citizen reports into a unified intelligence stream.

</td>
<td width="50%">

### ⚡ Instant Response Pipeline
Sub-second latency from citizen report to admin dashboard notification.

### 🗺️ GIS Decision Support
Satellite imagery and topographic overlays enable strategic resource deployment.

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 🚨 Predictive Risk Simulation
Proactive flood forecasting enables pre-emptive evacuations and resource positioning.

</td>
</tr>
</table>

---

## 📖 Documentation

### Related Repositories

- **Admin Portal:** [SA318-ctrl/JalRakshakAdmin](https://github.com/SA318-ctrl/JalRakshakAdmin)
- **AI Model:** [SA318-ctrl/JalRakshakModel](https://github.com/SA318-ctrl/JalRakshakModel)

### API Documentation

Once the FastAPI server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Notes

- ✅ Firebase configuration in frontend is public-safe
- ⚠️ Move API keys to backend services in production
- 📍 Location permissions improve reporting accuracy
- 🧪 Run tests before submitting PRs

---

## 🛡️ Security & Privacy

- All user data is stored in Firebase with appropriate security rules
- Location data is used only for incident mapping and is not tracked continuously
- Image uploads are processed locally and stored securely
- Admin authentication uses Firebase Auth with role-based access control

---

## 📄 License

**Internal Development** — JalRakshak AI Initiative

This project is currently under internal development. For licensing inquiries, please contact the development team.

---

## 🎯 Vision

> "To build a real-time intelligent flood response ecosystem integrating citizens, authorities, and AI-driven predictions — saving lives through technology."

---

## 👥 Team

JalRakshak is developed by a dedicated team of engineers, data scientists, and disaster management experts.

---

## 📞 Contact & Support

For questions, issues, or collaboration opportunities:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/JalRakshak/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/JalRakshak/discussions)

---

<div align="center">

**Made with ❤️ for safer communities**

[![GitHub stars](https://img.shields.io/github/stars/your-username/JalRakshak?style=social)](https://github.com/your-username/JalRakshak/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/JalRakshak?style=social)](https://github.com/your-username/JalRakshak/network/members)

</div>

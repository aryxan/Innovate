🌊 JalRakshak — Real-Time Flood Monitoring & Prediction System 🛡️

JalRakshak (Water Protector) is a full-stack intelligent disaster management platform that combines:

🧑‍🤝‍🧑 Citizen Reporting System (Consumer Portal)
🛡️ Administrative Command Center (Admin Portal)
🧠 AI-powered Flood Prediction Engine (ML Model)

It delivers real-time situational awareness, predictive intelligence, and rapid response coordination during flood emergencies.

🚀 System Overview
Citizen Input → Firebase → Admin Dashboard → Response Teams
        ↓                               ↑
   AI Model Prediction ← Weather + Sensors + GIS Data
🔗 Repositories
🛡️ Admin Portal: https://github.com/SA318-ctrl/JalRakshakAdmin
🧠 AI Model: https://github.com/SA318-ctrl/JalRakshakModel
🧑‍🤝‍🧑 Consumer Portal (Citizen Interface)
🌟 Features
🌊 Flood Reporting
Waterlogging, overflow, blockages
Image + GPS-based reporting
Severity classification
📍 Real-Time Tracking
Track via phone or ID
Status updates (Pending → Resolved)
🗺️ Live Incident Map
Color-coded severity visualization
Real-time updates
🆘 Missing Person Registry
🤝 Volunteer Network
💚 Crisis Counseling
🛡️ Admin Portal (Command & Control)
⚡ Features
📊 Tactical Dashboard
Live incidents + alerts
Weather metrics
🗺️ GIS Intelligence
Satellite mapping (Leaflet)
Multi-layer overlays
📦 Incident Management
Assign teams
Update status (real-time Firestore)
🏥 Infrastructure Registry
Hospitals, schools, relief centers
🚀 Resource Optimization
ETA calculation
Nearest facility detection
🧠 AI Model — Flood Prediction Engine
🔬 Overview

JalRakshak uses a hybrid spatio-temporal deep learning pipeline:

Spatial Intelligence (Where) → Terrain & land features
Temporal Intelligence (When) → Weather + river + sensor streams
⚙️ Core Architecture
1️⃣ Spatial Module
Inputs:
LULC (Land Use Land Cover)
DEM (Elevation)
HSG (Soil Groups)
Method:
SCS Curve Number Method
Computes Runoff Coefficient (C)
2️⃣ Temporal Model (Deep Learning)
Model: Long Short-Term Memory (LSTM)
Inputs:
Rainfall (time-series)
River stage
Discharge velocity
IoT drain sensor data
Output:
Flood probability
Predicted water level
3️⃣ Sensor Intelligence
Model: Random Forest Regression
Purpose:
Convert raw sensor signals → real-world flow metrics
4️⃣ Real-Time Pipeline
Streaming: Kafka / MQTT
Inference API: FastAPI
Output: Low-latency JSON predictions
📂 Model Architecture Structure
JalRakshakModel/
├── data/
│   ├── static/
│   ├── historical/
│   └── mock_streams/
├── src/
│   ├── spatial/
│   ├── sensors/
│   ├── data/
│   ├── models/
│   └── deployment/
🔄 Real-Time Workflow
1. Citizen submits report
2. Stored in Firebase Firestore
3. Admin dashboard updates instantly
4. AI model processes:
      - Rainfall
      - Terrain
      - Sensors
5. Flood risk predicted
6. Admin assigns response
7. Citizen tracks progress
🌦️ Data Sources
🌧️ Weather APIs (OpenWeather)
🌊 Hydrological Data (WRIS - optional)
📡 IoT Sensors (drain monitoring)
🗺️ GIS Layers (DEM, LULC)
🛠️ Tech Stack
Frontend
React
Vite
UI & Animation
Tailwind CSS
Framer Motion
Mapping
Leaflet
React-Leaflet
Backend
Firebase Firestore
Firebase Auth
FastAPI (ML inference)
ML Stack
PyTorch
Scikit-learn
📊 Incident Lifecycle
Stage	Description
🟡 Pending	Report received
🔵 Assigned	Team allocated
🔄 In Progress	Action ongoing
🟢 Resolved	Issue fixed
🔥 Key Innovations
🧠 Hybrid Spatio-Temporal AI Model
📡 Real-time IoT + Weather fusion
⚡ Instant citizen-to-admin pipeline
🗺️ GIS-based decision support system
🚨 Predictive flood risk simulation
🏁 Getting Started
git clone https://github.com/your-repo/JalRakshak
cd JalRakshak
npm install
npm run dev
🔑 Environment Variables
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
⚠️ Notes
Firebase config is public-safe
Move API keys to backend in production
Location permission improves accuracy
🚀 Vision

“To build a real-time intelligent flood response ecosystem integrating citizens, authorities, and AI-driven predictions.”

📜 License

Internal Development — JalRakshak AI Initiative

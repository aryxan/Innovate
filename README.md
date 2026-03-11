<div align="center">

<img src="https://img.shields.io/badge/Status-Hackathon%202026-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/Domain-Urban%20Flood%20Prediction-0077B6?style=for-the-badge" />
<img src="https://img.shields.io/badge/AI-GIS%20Integrated-02C39A?style=for-the-badge" />
<a href="https://github.com/aryxan/Innovate"><img src="https://img.shields.io/badge/GitHub-aryxan%2FInnovate-181717?style=for-the-badge&logo=github" /></a>
<a href="https://innovate-inky.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel" /></a>

# 🌊 JalRakshak AI
### GIS-Integrated Urban Flood Prediction System
**Pre-Monsoon Readiness Edition · India Innovates 2026**

*Predict. Alert. Protect. — Before the Flood Hits.*

🔗 **[Live Demo →](https://innovate-27vz.vercel.app/)**

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Novel Data Inputs](#-novel-data-inputs)
- [Proactive Response Layer](#-proactive-response-layer)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [References](#-references)
- [Team](#-team)

---

## 🌐 Overview

**JalRakshak AI** is an AI-powered, GIS-integrated urban flood prediction platform designed for pre-monsoon readiness across Indian cities. It combines satellite soil moisture data, real-time CCTV computer vision, multilingual social media signal detection, and citizen crowdsourcing to generate **ward-level flood probability scores** — enabling authorities and citizens to act *before* disaster strikes.

> Built for **India Innovates Hackathon 2026** — where technology meets civic resilience.

---

## ❗ Problem Statement

Every monsoon season, Indian cities suffer devastating flood losses — loss of life, property damage, and disruption to essential services. Existing flood management systems are reactive and suffer from:

- ❌ No real-time, hyper-local flood prediction at the ward level
- ❌ Generic alerts delivered too late for residents to act
- ❌ No early warning system for pre-deploying emergency resources
- ❌ Critical infrastructure (hospitals, schools) left unprotected
- ❌ Citizens excluded as potential data contributors
- ❌ Infrastructure decay not factored into flood risk models

There is an urgent need for a **proactive, AI-driven platform** that predicts floods at micro-hotspot precision, engages citizens as sensors, and empowers ward officers with actionable dashboards.

---

## ✅ Solution

JalRakshak AI delivers a **full-stack flood intelligence system**:

1. **Ingests** satellite SAR soil moisture, IMD rain forecasts, CCTV feeds, social media signals, and crowdsourced WhatsApp reports
2. **Processes** data through YOLOv8 computer vision, NLP flood signal detection, and Manning's equation for flow modelling
3. **Predicts** ward-level flood probability with micro-hotspot identification and spread direction
4. **Alerts** citizens via hyper-local SMS in their regional language with alternate route guidance
5. **Responds** proactively — elevating hospitals and schools to Priority 1 and pre-deploying pump crews 48 hours before heavy rainfall

---

## ✨ Key Features

### 🔔 Citizen Engagement & Alerts

| Feature | Description |
|---|---|
| **Personalized Flood SMS Alerts** | Hyper-local alerts (e.g., *"78% flood probability in 6 hrs — avoid MG Road"*) in the resident's regional language, generated from ward-level readiness scores and IMD forecasts |
| **WhatsApp Crowdsourced Drain Reports** `NEW` | Citizens photograph blocked drains via a WhatsApp chatbot — submissions are geo-tagged, timestamped, and fused into the drainage capacity model in near-real-time |
| **Augmented Reality Flood Visualisation** `WOW` | Mobile AR feature (ARCore/ARKit) lets citizens point their phone at any street and see a photorealistic overlay of predicted waterlogging depth (e.g., 30 cm, 60 cm) — shareable on social media |

### 🧠 Prediction & Scoring Innovations

| Feature | Description |
|---|---|
| **Flood Velocity & Spread Direction** `CORE` | Uses Manning's equation on DEM-derived drainage gradients to compute flow velocity and directional spread — feeds directly into optimised evacuation route planning |
| **Infrastructure Age Decay Scoring** | Municipal drainage pipe age and material type (from ULBS asset registers) are scored — pre-1980 cast-iron pipes receive a capacity penalty, translating physical deterioration into a quantifiable risk multiplier |

### 📡 Novel Data Inputs

| Feature | Description |
|---|---|
| **Social Media Flood Signal Detection** | NLP pipeline scrapes Twitter/X and Facebook in Hindi, Marathi, Bengali, and Tamil — complaint clusters reduce alert latency by **up to 45 minutes** before official sensors trigger |
| **ISRO Bhuvan / Sentinel-1 SAR Soil Moisture** | Nightly ingestion of soil saturation data — fully saturated soil switches flood mode to instant runoff, identifying which micro-hotspots trigger first |
| **Street-Level CCTV / Dashcam Integration** `CV` | YOLOv8-based computer vision on existing city CCTV feeds detects waterlogging in real-time; dashcam footage via citizen app provides ground-truth validation |

### 🚨 Proactive Response Layer

| Feature | Description |
|---|---|
| **School & Hospital Vulnerability Overlay** | GIS proximity filter flags every flood micro-hotspot within 500 m of a school, hospital, or care home — elevated to Priority 1, triggering mandatory pump crew pre-deployment **48 hrs** before forecast heavy rainfall |
| **Gamified Ward Officer Dashboard** `NOVEL` | Ward officers earn Preparedness Badges for completing drain de-silting, pump testing, and manhole inspections with geo-tagged photo proof. A public ward leaderboard creates civic accountability |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA INGESTION LAYER                        │
│  IMD Rain API │ Sentinel-1 SAR │ Social Media NLP │ WhatsApp    │
│  City CCTV Feeds │ Dashcam Footage │ ULBS Asset Registers       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       PROCESSING LAYER                           │
│  YOLOv8 Waterlogging Detection │ Manning's Equation (Flow)      │
│  Multilingual NLP Pipeline │ Infrastructure Age Decay Scoring   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      PREDICTION ENGINE                           │
│  Ward-Level Flood Probability │ Micro-Hotspot Identification    │
│  GIS Proximity Filter (500m Schools/Hospitals)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        OUTPUT LAYER                              │
│  Hyper-Local SMS Alerts (Regional Languages)                    │
│  AR Flood Depth Visualisation (ARCore / ARKit)                  │
│  Gamified Ward Officer Dashboard + Leaderboard                  │
│  Emergency Pump Crew Pre-Deployment Orders                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Innovate/
├── frontend/                            # JavaScript frontend (React/Next.js)
│   └── ...                              # UI, maps, AR visualisation, dashboards
├── backend/                             # Python backend
│   └── ...                              # Flood prediction engine, NLP, APIs
├── ADMIN_SYSTEM_GUIDE.md                # Admin panel & system management guide
├── HYBRID_MAPPING_GUIDE.md              # GIS hybrid mapping implementation
├── HYDROLOGICAL_INTELLIGENCE_SYSTEM.md # Hydrological model documentation
├── MULTI_LAYER_MAP_IMPLEMENTATION.md   # Multi-layer map feature docs
├── .gitignore
└── README.md
```

---

## 🛠 Technology Stack

| Category | Technologies |
|---|---|
| **Frontend** | JavaScript (React / Next.js) — deployed on Vercel |
| **Backend** | Python — flood prediction engine, NLP pipeline, REST APIs |
| **Computer Vision** | YOLOv8 (Ultralytics) — waterlogging detection on CCTV/dashcam |
| **NLP / AI** | Multilingual flood signal detection (Hindi, Marathi, Bengali, Tamil) |
| **Geospatial / Mapping** | GIS multi-layer ward mapping, DEM terrain tiles, Manning's equation |
| **Satellite Data** | ISRO Bhuvan, ESA Sentinel-1 SAR (nightly soil moisture ingestion) |
| **Augmented Reality** | ARCore (Android), ARKit (iOS) |
| **Citizen Engagement** | WhatsApp Business API, SMS Gateway |
| **Data Sources** | IMD Rain Forecast API, Twitter/X API, Facebook API, ULBS Asset Registers |
| **Deployment** | Vercel (Frontend) |

---

## 📡 Novel Data Inputs

What sets JalRakshak AI apart from competing models is the use of data sources typically ignored:

- **Soil Saturation State** — Sentinel-1 SAR nightly data identifies when soil switches from slow absorption to instant runoff mode, fundamentally altering which micro-hotspots flood first
- **Infrastructure Decay** — Pipe age and material type from municipal records translate physical deterioration into a quantifiable flood risk multiplier
- **Social Listening** — Citizen complaints on social media as soft-sensors, reducing alert lead time by up to 45 minutes

---

## 🚑 Proactive Response Layer

JalRakshak AI is not just a prediction system — it's a **response orchestration platform**:

- Schools and hospitals within 500m of flood hotspots are automatically escalated to **Priority 1**
- Pump crews receive mandatory pre-deployment orders **48 hours** before forecast heavy rainfall
- Ward officers are incentivised via gamification to complete pre-monsoon infrastructure checks **before** the season begins

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.9+ (backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryxan/Innovate.git
cd Innovate

# Setup frontend
cd frontend
npm install
npm run dev

# Setup backend (in a new terminal)
cd ../backend
pip install -r requirements.txt
python src/main.py
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
IMD_API_KEY=your_imd_api_key
WHATSAPP_API_TOKEN=your_whatsapp_token
TWITTER_BEARER_TOKEN=your_twitter_token
SENTINEL_API_KEY=your_copernicus_key
```

---

## 📖 Documentation

| Document | Description |
|---|---|
| [ADMIN_SYSTEM_GUIDE.md](./ADMIN_SYSTEM_GUIDE.md) | Admin panel setup and system management |
| [HYBRID_MAPPING_GUIDE.md](./HYBRID_MAPPING_GUIDE.md) | GIS hybrid mapping implementation |
| [HYDROLOGICAL_INTELLIGENCE_SYSTEM.md](./HYDROLOGICAL_INTELLIGENCE_SYSTEM.md) | Hydrological model and flood prediction logic |
| [MULTI_LAYER_MAP_IMPLEMENTATION.md](./MULTI_LAYER_MAP_IMPLEMENTATION.md) | Multi-layer map feature implementation |

---

## 📚 References

| Resource | Link |
|---|---|
| **Project Repository** | [github.com/aryxan/Innovate](https://github.com/aryxan/Innovate) |
| **Live Demo** | [innovate-inky.vercel.app](https://innovate-inky.vercel.app) |
| ISRO Bhuvan Geoportal | [bhuvan.nrsc.gov.in](https://bhuvan.nrsc.gov.in) |
| ESA Copernicus Sentinel-1 SAR | [sentinel.esa.int](https://sentinel.esa.int) |
| IMD Rain Forecast API | [mausam.imd.gov.in](https://mausam.imd.gov.in) |
| YOLOv8 by Ultralytics | [github.com/ultralytics/ultralytics](https://github.com/ultralytics/ultralytics) |
| ARCore (Google) | [developers.google.com/ar](https://developers.google.com/ar) |
| ARKit (Apple) | [developer.apple.com/augmented-reality](https://developer.apple.com/augmented-reality) |
| WhatsApp Business API | [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp) |
| Manning's Equation Reference | ASCE Journal of Hydrologic Engineering |
| GIS-based Urban Flood Risk | ISPRS Journal of Photogrammetry and Remote Sensing |

---

## 👥 Team

**JalRakshak AI** — India Innovates Hackathon 2026

> Team Members:
> Aryan Gupta
> Divyansh Lalotra
> Siddharth Arora
> Anish Vaddan
> Bhavesh Nayyar

---

<div align="center">

**Built with ❤️ for a flood-resilient India**

*JalRakshak AI · Hackathon 2026 · Pre-Monsoon Readiness Edition*

</div>

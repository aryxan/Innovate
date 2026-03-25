<div align="center">

<img src="https://img.shields.io/badge/Status-Hackathon%202026-blueviolet?style=for-the-badge" />
<img src="https://img.shields.io/badge/Domain-Realtime%20Flood%20Response-0077B6?style=for-the-badge" />
<img src="https://img.shields.io/badge/Stack-Firebase%20%2B%20GIS-02C39A?style=for-the-badge" />
<a href="https://github.com/aryxan/Innovate"><img src="https://img.shields.io/badge/GitHub-aryxan%2FInnovate-181717?style=for-the-badge&logo=github" /></a>
<a href="https://innovate-inky.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel" /></a>

# 🌊 JalRakshak AI
### GIS-Integrated Realtime Flood Command System
**Pre-Monsoon Readiness Edition · India Innovates 2026**

*Predict. Track. Respond. — In Realtime.*

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

**JalRakshak AI** is a realtime citizen-admin flood response platform with Firebase-backed incident logging, live status tracking, map intelligence, and multilingual emergency UX. The system now supports end-to-end complaint submission, admin assignment flow, geolocation-locked reporting, and live operational updates for mission-critical use.

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

JalRakshak AI now delivers a **production-style flood command workflow**:

1. **Captures** verified citizen reports with GPS-locked location, OTP flow improvements, and media proof upload
2. **Stores** incidents in Firebase Firestore/Storage with structured metadata and realtime updates
3. **Tracks** complaint lifecycle in realtime for both citizen and admin dashboards
4. **Publishes** instant alert capabilities (browser notifications + tactical alert card)
5. **Persists** platform analytics like visitor counters to Firebase for centralized monitoring

---

## ✨ Key Features

### 🔔 Citizen Engagement & Alerts

| Feature | Description |
|---|---|
| **Multilingual Realtime Command UI** | Citizen dashboard supports regional language switching, accessibility toggles, and mission-oriented emergency content |
| **Instant Browser Alerts** `NEW` | Citizens can enable browser notifications for critical flood alerts directly from the Instant Alerts panel |
| **Realtime Track-My-Report Flow** | Complaint references are generated with typed prefixes and mapped for continuous status tracking |

### 🧠 Prediction & Scoring Innovations

| Feature | Description |
|---|---|
| **Realtime Status Intelligence** `CORE` | Firestore subscriptions stream complaint status transitions (pending, assigned, resolved) to dashboard widgets without manual refresh |
| **Typed Mission References** | Structured 11-character reference IDs for report classes improve traceability and operational communication |

### 📡 Novel Data Inputs

| Feature | Description |
|---|---|
| **CWC Realtime Flood Feed** | River/warning telemetry is ingested through backend proxy APIs and reflected in citizen map intelligence |
| **Live Weather + District Context** | Weather cards and advisory context are tuned from location-aware telemetry and updated through resilient API fallbacks |
| **User Session Analytics** `NEW` | Visitor sessions are recorded in Firebase (`visitor_sessions` + `analytics/visitors`) for centralized reporting |

### 🚨 Proactive Response Layer

| Feature | Description |
|---|---|
| **Admin Complaint Command Center** | Admin dashboard receives realtime complaint updates, enabling assignment and resolution without polling delays |
| **Mission-Style Safety & Advisory Layer** | Tactical advisories, emergency contacts, and operational bulletins are integrated into citizen flow for immediate action |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA INGESTION LAYER                        │
│  Citizen Report Forms │ Location/GPS │ CWC Flood API │ Weather   │
│  Browser Notification Permissions │ Visitor Session Analytics    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       PROCESSING LAYER                           │
│  Firebase Validation │ Media Upload (Storage) │ ID Generation   │
│  Location Locking │ Realtime Subscription Mapping               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      PREDICTION ENGINE                           │
│  Flood Risk Views │ Report Lifecycle State │ Dashboard Insights │
│  Live Tracking by Report Reference / Phone                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        OUTPUT LAYER                              │
│  Citizen Dashboard + Admin Dashboard                             │
│  Instant Browser Alerts │ Realtime Report Tracking               │
│  Firebase-Persisted Visitor Metrics + Operational UI Telemetry   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Innovate/
└── README.md                            # Consolidated project documentation
```

---

## 🛠 Technology Stack

| Category | Technologies |
|---|---|
| **Frontend** | React + TypeScript + Vite |
| **Backend** | Node.js + Express API proxy |
| **Realtime Database** | Firebase Firestore |
| **Media Storage** | Firebase Storage |
| **Geospatial / Mapping** | Leaflet + React-Leaflet + OpenStreetMap/CWC data |
| **Charts & Visuals** | Recharts + Motion + Lucide icons |
| **Localization / Accessibility** | Multi-language translation layer + accessibility toggles |
| **Deployment** | Vercel-compatible frontend + local Node backend for APIs |

---

## 📡 Novel Data Inputs

What sets JalRakshak AI apart in its current implementation is practical operational telemetry:

- **Session-Aware Visitor Analytics** — each unique session can be persisted to Firebase for shared command-center visibility
- **Realtime Complaint Telemetry** — complaint transitions are streamed directly from Firestore listeners
- **Location-Verified Citizen Reports** — reports are bound to captured GPS context rather than manual location entry

---

## 🚑 Proactive Response Layer

JalRakshak AI is not just a prediction system — it's a **response orchestration platform**:

- Citizens receive immediate confirmation references and can track status in realtime
- Admin operations can triage, assign, and resolve incidents from a unified dashboard
- Instant Alerts and multilingual advisories improve readiness and citizen compliance

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase project credentials (Firestore + Storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/aryxan/Innovate.git
cd Innovate

# Install dependencies
npm install

# Start API proxy
npm run server

# Start frontend
npm run dev
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📖 Documentation

| Document | Description |
|---|---|
| [README.md](./README.md) | Current consolidated implementation notes, setup, and architecture |

---

## 📚 References

| Resource | Link |
|---|---|
| **Project Repository** | [github.com/aryxan/Innovate](https://github.com/aryxan/Innovate) |
| **Live Demo** | [innovate-inky.vercel.app](https://innovate-inky.vercel.app) |
| Firebase Docs | [firebase.google.com/docs](https://firebase.google.com/docs) |
| CWC Flood Data API | [ffs.india-water.gov.in](https://ffs.india-water.gov.in/) |
| IMD Data Source | [mausam.imd.gov.in](https://mausam.imd.gov.in) |
| Leaflet Mapping | [leafletjs.com](https://leafletjs.com/) |

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

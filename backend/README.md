# JalRakshak AI Backend

FastAPI backend with real weather integration and AI-powered flood risk prediction.

## Features

- Real-time weather data from Open-Meteo API
- AI-powered flood risk calculation engine
- Weighted probabilistic risk model
- Historical flood index integration
- RESTful API endpoints

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Get State Risk
```
GET /state-risk/{state_name}
```

Returns comprehensive flood risk assessment including:
- Risk score (0-100)
- Risk level (low/medium/high/critical)
- Weather type
- Rainfall forecast
- Confidence score
- Trend prediction

### Get All States
```
GET /states/all-risks
```

Returns risk assessment for all Indian states.

### Health Check
```
GET /health
```

## Risk Calculation Formula

```
Risk Score = 0.4 * forecasted_rainfall_intensity 
           + 0.2 * 7day_rainfall_accumulation 
           + 0.2 * historical_flood_index 
           + 0.1 * elevation_factor 
           + 0.1 * drainage_capacity
```

Normalized to 0-100 scale.

## Architecture

```
backend/
├── main.py                 # FastAPI application
├── models/
│   └── state_risk.py      # Pydantic models
├── services/
│   ├── weather_service.py # Weather API integration
│   └── risk_engine.py     # Risk calculation engine
└── requirements.txt       # Dependencies
```

## Environment Variables

No environment variables required. Uses public Open-Meteo API.

## Future Enhancements

- Machine Learning model integration
- Real-time river level monitoring
- Satellite imagery analysis
- Historical flood pattern analysis

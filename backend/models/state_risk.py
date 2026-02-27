from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SensorData(BaseModel):
    sensor_id: str
    lat: float
    lng: float
    water_level_cm: int
    trend: str
    risk_component: float
    risk_level: str
    last_update: str
    status: str

class StateRiskResponse(BaseModel):
    state_name: str
    centroid_lat: float = Field(..., description="State centroid latitude")
    centroid_lng: float = Field(..., description="State centroid longitude")
    risk_score: float = Field(..., ge=0, le=100, description="Risk score from 0-100")
    risk_level: str = Field(..., description="Risk level: low, medium, high, critical")
    weather_type: str = Field(..., description="Current weather: sunny, rain, thunder, cloudy")
    rainfall_mm: float = Field(..., description="24h rainfall forecast in mm")
    temperature: float = Field(..., description="Current temperature in Celsius")
    confidence: float = Field(..., ge=0, le=100, description="Model confidence percentage")
    trend: str = Field(..., description="Risk trend: rising, stable, falling")
    forecast_12h: float = Field(..., description="12-hour flood probability")
    past_7day_rainfall: float = Field(..., description="Past 7 days rainfall accumulation")
    last_updated: str = Field(..., description="Last update timestamp")
    sensors: List[SensorData] = Field(default=[], description="List of sensors in the state")

class WeatherData(BaseModel):
    temperature: float
    rainfall_24h: float
    past_7day_rainfall: float
    weather_type: str
    last_updated: str

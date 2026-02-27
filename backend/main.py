from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.weather_service import WeatherService
from services.risk_engine import RiskEngine
from services.sensor_service import SensorService
from models.state_risk import StateRiskResponse
import uvicorn

app = FastAPI(title="JalRakshak AI Backend", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
weather_service = WeatherService()
risk_engine = RiskEngine()
sensor_service = SensorService()

@app.get("/")
async def root():
    return {
        "message": "JalRakshak AI Backend API",
        "version": "2.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_model": "active"}

@app.get("/state-risk/{state_name}", response_model=StateRiskResponse)
async def get_state_risk(state_name: str):
    """
    Get comprehensive flood risk assessment for a state with sensor data
    """
    try:
        # Get weather data
        weather_data = await weather_service.get_state_weather(state_name)
        
        if not weather_data:
            raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
        
        # Calculate risk score
        risk_assessment = risk_engine.calculate_risk(state_name, weather_data)
        
        # Get state coordinates
        coordinates = weather_service.get_state_coordinates(state_name)
        
        # Get sensor data for the state
        sensors = sensor_service.get_state_sensors(state_name)
        
        return StateRiskResponse(
            state_name=state_name,
            centroid_lat=coordinates[0],
            centroid_lng=coordinates[1],
            risk_score=risk_assessment["risk_score"],
            risk_level=risk_assessment["risk_level"],
            weather_type=weather_data["weather_type"],
            rainfall_mm=weather_data["rainfall_24h"],
            temperature=weather_data["temperature"],
            confidence=risk_assessment["confidence"],
            trend=risk_assessment["trend"],
            forecast_12h=risk_assessment["forecast_12h"],
            past_7day_rainfall=weather_data["past_7day_rainfall"],
            last_updated=weather_data["last_updated"],
            sensors=sensors
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/states/all-risks")
async def get_all_states_risk():
    """
    Get risk assessment for all states
    """
    try:
        all_states = weather_service.get_all_states()
        results = []
        
        for state_name in all_states:
            try:
                weather_data = await weather_service.get_state_weather(state_name)
                risk_assessment = risk_engine.calculate_risk(state_name, weather_data)
                coordinates = weather_service.get_state_coordinates(state_name)
                
                results.append({
                    "state_name": state_name,
                    "centroid_lat": coordinates[0],
                    "centroid_lng": coordinates[1],
                    "risk_score": risk_assessment["risk_score"],
                    "risk_level": risk_assessment["risk_level"],
                    "weather_type": weather_data["weather_type"],
                    "rainfall_mm": weather_data["rainfall_24h"]
                })
            except Exception as e:
                print(f"Error processing {state_name}: {e}")
                continue
        
        return {"states": results, "total": len(results)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching all states: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

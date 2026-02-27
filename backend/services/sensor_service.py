import random
from typing import List, Dict

class SensorService:
    """
    Service to manage sensor data for flood monitoring
    Generates mock sensor data for demonstration
    """
    
    def __init__(self):
        # Number of sensors per state (varies by state size and flood risk)
        self.sensor_counts = {
            "Andhra Pradesh": 8,
            "Assam": 10,
            "Bihar": 12,
            "Kerala": 7,
            "Maharashtra": 9,
            "Odisha": 8,
            "Uttar Pradesh": 15,
            "West Bengal": 11,
            "Uttarakhand": 6,
            "Gujarat": 7,
            "Karnataka": 6,
            "Tamil Nadu": 7,
            "Telangana": 5,
            "Madhya Pradesh": 6,
            "Rajasthan": 4,
            "Punjab": 4,
            "Haryana": 4,
            "Delhi": 3,
            "Himachal Pradesh": 5,
            "Jharkhand": 5,
            "Chhattisgarh": 4,
            "Meghalaya": 4,
            "Tripura": 3,
            "Manipur": 3,
            "Nagaland": 3,
            "Mizoram": 3,
            "Arunachal Pradesh": 4,
            "Sikkim": 3,
            "Goa": 2,
            "Jammu and Kashmir": 5,
            "Ladakh": 2,
            "Chandigarh": 1,
            "Puducherry": 2,
            "Andaman and Nicobar Islands": 2,
            "Lakshadweep": 1,
            "Dadra and Nagar Haveli and Daman and Diu": 2,
        }
    
    def get_state_sensors(self, state_name: str) -> List[Dict]:
        """
        Generate sensor data for a state
        Returns list of sensors with location and readings
        """
        sensor_count = self.sensor_counts.get(state_name, 3)
        sensors = []
        
        # Get state base coordinates (from weather service)
        from services.weather_service import WeatherService
        weather_service = WeatherService()
        
        if state_name not in weather_service.state_coordinates:
            return []
        
        base_lat, base_lng = weather_service.state_coordinates[state_name]
        
        for i in range(sensor_count):
            # Distribute sensors around the state (within ~1 degree radius)
            lat_offset = random.uniform(-0.8, 0.8)
            lng_offset = random.uniform(-0.8, 0.8)
            
            sensor_lat = base_lat + lat_offset
            sensor_lng = base_lng + lng_offset
            
            # Generate sensor readings
            water_level = random.randint(50, 450)  # cm
            
            # Determine risk based on water level
            if water_level > 350:
                risk_level = "critical"
                risk_component = random.uniform(85, 100)
            elif water_level > 250:
                risk_level = "high"
                risk_component = random.uniform(60, 85)
            elif water_level > 150:
                risk_level = "medium"
                risk_component = random.uniform(35, 60)
            else:
                risk_level = "low"
                risk_component = random.uniform(10, 35)
            
            # Determine trend
            trend_options = ["rising", "stable", "falling"]
            trend_weights = [0.3, 0.5, 0.2] if water_level > 200 else [0.2, 0.5, 0.3]
            trend = random.choices(trend_options, weights=trend_weights)[0]
            
            sensor = {
                "sensor_id": f"{state_name[:3].upper()}-S{i+1:03d}",
                "lat": round(sensor_lat, 6),
                "lng": round(sensor_lng, 6),
                "water_level_cm": water_level,
                "trend": trend,
                "risk_component": round(risk_component, 2),
                "risk_level": risk_level,
                "last_update": "2 minutes ago",
                "status": "active"
            }
            
            sensors.append(sensor)
        
        return sensors

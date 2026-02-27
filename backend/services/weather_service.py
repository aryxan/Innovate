import httpx
from datetime import datetime, timedelta
from typing import Dict, Optional

class WeatherService:
    """
    Service to fetch weather data from Open-Meteo API
    """
    
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.archive_url = "https://archive-api.open-meteo.com/v1/archive"
        
        # State centroids (lat, lon) for major Indian states
        self.state_coordinates = {
            "Andhra Pradesh": (15.9129, 79.7400),
            "Arunachal Pradesh": (28.2180, 94.7278),
            "Assam": (26.2006, 92.9376),
            "Bihar": (25.0961, 85.3131),
            "Chhattisgarh": (21.2787, 81.8661),
            "Goa": (15.2993, 74.1240),
            "Gujarat": (22.2587, 71.1924),
            "Haryana": (29.0588, 76.0856),
            "Himachal Pradesh": (31.1048, 77.1734),
            "Jharkhand": (23.6102, 85.2799),
            "Karnataka": (15.3173, 75.7139),
            "Kerala": (10.8505, 76.2711),
            "Madhya Pradesh": (22.9734, 78.6569),
            "Maharashtra": (19.7515, 75.7139),
            "Manipur": (24.6637, 93.9063),
            "Meghalaya": (25.4670, 91.3662),
            "Mizoram": (23.1645, 92.9376),
            "Nagaland": (26.1584, 94.5624),
            "Odisha": (20.9517, 85.0985),
            "Punjab": (31.1471, 75.3412),
            "Rajasthan": (27.0238, 74.2179),
            "Sikkim": (27.5330, 88.5122),
            "Tamil Nadu": (11.1271, 78.6569),
            "Telangana": (18.1124, 79.0193),
            "Tripura": (23.9408, 91.9882),
            "Uttar Pradesh": (26.8467, 80.9462),
            "Uttarakhand": (30.0668, 79.0193),
            "West Bengal": (22.9868, 87.8550),
            "Andaman and Nicobar Islands": (11.7401, 92.6586),
            "Chandigarh": (30.7333, 76.7794),
            "Dadra and Nagar Haveli and Daman and Diu": (20.1809, 73.0169),
            "Delhi": (28.7041, 77.1025),
            "Jammu and Kashmir": (33.7782, 76.5762),
            "Ladakh": (34.1526, 78.2932),
            "Lakshadweep": (10.5667, 72.6369),
            "Puducherry": (11.9416, 79.8083),
        }
    
    def get_all_states(self):
        """Return list of all state names"""
        return list(self.state_coordinates.keys())
    
    def get_state_coordinates(self, state_name: str):
        """Return coordinates for a specific state"""
        return self.state_coordinates.get(state_name, (22.5937, 78.9629))
    
    async def get_state_weather(self, state_name: str) -> Optional[Dict]:
        """
        Fetch weather data for a specific state
        """
        if state_name not in self.state_coordinates:
            return None
        
        lat, lon = self.state_coordinates[state_name]
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Get current and forecast data
                forecast_params = {
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,precipitation,weather_code",
                    "hourly": "precipitation",
                    "forecast_days": 1
                }
                
                forecast_response = await client.get(self.base_url, params=forecast_params)
                forecast_data = forecast_response.json()
                
                # Get past 7 days data
                end_date = datetime.now().date()
                start_date = end_date - timedelta(days=7)
                
                archive_params = {
                    "latitude": lat,
                    "longitude": lon,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "daily": "precipitation_sum"
                }
                
                archive_response = await client.get(self.archive_url, params=archive_params)
                archive_data = archive_response.json()
                
                # Process data
                current = forecast_data.get("current", {})
                hourly = forecast_data.get("hourly", {})
                
                # Calculate 24h rainfall forecast
                rainfall_24h = sum(hourly.get("precipitation", [])[:24])
                
                # Calculate past 7 days rainfall
                past_7day_rainfall = sum(archive_data.get("daily", {}).get("precipitation_sum", []))
                
                # Determine weather type from weather code
                weather_code = current.get("weather_code", 0)
                weather_type = self._get_weather_type(weather_code)
                
                return {
                    "temperature": current.get("temperature_2m", 25.0),
                    "rainfall_24h": round(rainfall_24h, 2),
                    "past_7day_rainfall": round(past_7day_rainfall, 2),
                    "weather_type": weather_type,
                    "last_updated": datetime.now().isoformat()
                }
        
        except Exception as e:
            print(f"Error fetching weather for {state_name}: {e}")
            # Return mock data as fallback
            return self._get_mock_weather(state_name)
    
    def _get_weather_type(self, weather_code: int) -> str:
        """
        Convert WMO weather code to simple weather type
        """
        if weather_code == 0:
            return "sunny"
        elif weather_code in [1, 2, 3]:
            return "cloudy"
        elif weather_code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
            return "rain"
        elif weather_code in [95, 96, 99]:
            return "thunder"
        else:
            return "cloudy"
    
    def _get_mock_weather(self, state_name: str) -> Dict:
        """
        Fallback mock weather data
        """
        import random
        
        weather_types = ["sunny", "cloudy", "rain", "thunder"]
        
        return {
            "temperature": round(random.uniform(20, 35), 1),
            "rainfall_24h": round(random.uniform(0, 100), 2),
            "past_7day_rainfall": round(random.uniform(0, 300), 2),
            "weather_type": random.choice(weather_types),
            "last_updated": datetime.now().isoformat()
        }

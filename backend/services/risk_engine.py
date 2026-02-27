from typing import Dict
import random

class RiskEngine:
    """
    AI-powered flood risk calculation engine
    Uses weighted probabilistic model
    """
    
    def __init__(self):
        # Historical flood index for Indian states (0-10 scale)
        self.historical_flood_index = {
            "Andhra Pradesh": 7.5,
            "Arunachal Pradesh": 5.0,
            "Assam": 9.0,
            "Bihar": 8.5,
            "Chhattisgarh": 5.5,
            "Goa": 3.0,
            "Gujarat": 5.0,
            "Haryana": 3.5,
            "Himachal Pradesh": 6.0,
            "Jharkhand": 6.0,
            "Karnataka": 5.5,
            "Kerala": 7.5,
            "Madhya Pradesh": 4.0,
            "Maharashtra": 6.5,
            "Manipur": 5.5,
            "Meghalaya": 7.0,
            "Mizoram": 5.0,
            "Nagaland": 5.0,
            "Odisha": 8.0,
            "Punjab": 3.5,
            "Rajasthan": 2.0,
            "Sikkim": 6.0,
            "Tamil Nadu": 6.0,
            "Telangana": 5.5,
            "Tripura": 5.5,
            "Uttar Pradesh": 7.5,
            "Uttarakhand": 7.0,
            "West Bengal": 8.0,
            "Andaman and Nicobar Islands": 4.0,
            "Chandigarh": 2.5,
            "Dadra and Nagar Haveli and Daman and Diu": 3.0,
            "Delhi": 5.5,
            "Jammu and Kashmir": 6.0,
            "Ladakh": 3.0,
            "Lakshadweep": 2.0,
            "Puducherry": 5.0,
        }
        
        # Elevation factor (higher elevation = lower flood risk)
        self.elevation_factor = {
            "Andhra Pradesh": 0.6,
            "Arunachal Pradesh": 0.3,
            "Assam": 0.8,
            "Bihar": 0.9,
            "Chhattisgarh": 0.6,
            "Goa": 0.7,
            "Gujarat": 0.7,
            "Haryana": 0.8,
            "Himachal Pradesh": 0.2,
            "Jharkhand": 0.6,
            "Karnataka": 0.5,
            "Kerala": 0.6,
            "Madhya Pradesh": 0.6,
            "Maharashtra": 0.5,
            "Manipur": 0.5,
            "Meghalaya": 0.4,
            "Mizoram": 0.4,
            "Nagaland": 0.4,
            "Odisha": 0.7,
            "Punjab": 0.8,
            "Rajasthan": 0.5,
            "Sikkim": 0.2,
            "Tamil Nadu": 0.6,
            "Telangana": 0.6,
            "Tripura": 0.6,
            "Uttar Pradesh": 0.8,
            "Uttarakhand": 0.3,
            "West Bengal": 0.8,
            "Andaman and Nicobar Islands": 0.5,
            "Chandigarh": 0.7,
            "Dadra and Nagar Haveli and Daman and Diu": 0.7,
            "Delhi": 0.8,
            "Jammu and Kashmir": 0.4,
            "Ladakh": 0.2,
            "Lakshadweep": 0.6,
            "Puducherry": 0.7,
        }
        
        # Drainage capacity (0-1, higher = better drainage)
        self.drainage_capacity = {
            "Andhra Pradesh": 0.6,
            "Arunachal Pradesh": 0.7,
            "Assam": 0.4,
            "Bihar": 0.3,
            "Chhattisgarh": 0.6,
            "Goa": 0.7,
            "Gujarat": 0.6,
            "Haryana": 0.7,
            "Himachal Pradesh": 0.8,
            "Jharkhand": 0.6,
            "Karnataka": 0.6,
            "Kerala": 0.5,
            "Madhya Pradesh": 0.7,
            "Maharashtra": 0.6,
            "Manipur": 0.6,
            "Meghalaya": 0.5,
            "Mizoram": 0.6,
            "Nagaland": 0.6,
            "Odisha": 0.5,
            "Punjab": 0.7,
            "Rajasthan": 0.8,
            "Sikkim": 0.7,
            "Tamil Nadu": 0.6,
            "Telangana": 0.6,
            "Tripura": 0.6,
            "Uttar Pradesh": 0.5,
            "Uttarakhand": 0.7,
            "West Bengal": 0.4,
            "Andaman and Nicobar Islands": 0.7,
            "Chandigarh": 0.8,
            "Dadra and Nagar Haveli and Daman and Diu": 0.7,
            "Delhi": 0.6,
            "Jammu and Kashmir": 0.6,
            "Ladakh": 0.8,
            "Lakshadweep": 0.7,
            "Puducherry": 0.6,
        }
    
    def calculate_risk(self, state_name: str, weather_data: Dict) -> Dict:
        """
        Calculate comprehensive flood risk score
        
        Formula:
        Risk Score = 0.4 * rainfall_intensity + 0.2 * 7day_accumulation + 
                     0.2 * historical_index + 0.1 * elevation + 0.1 * drainage
        """
        
        # Normalize rainfall intensity (0-100mm -> 0-100 scale)
        rainfall_24h = min(weather_data["rainfall_24h"], 100)
        rainfall_intensity_score = (rainfall_24h / 100) * 100
        
        # Normalize 7-day accumulation (0-300mm -> 0-100 scale)
        past_7day = min(weather_data["past_7day_rainfall"], 300)
        accumulation_score = (past_7day / 300) * 100
        
        # Historical flood index (0-10 -> 0-100 scale)
        historical_score = (self.historical_flood_index.get(state_name, 5) / 10) * 100
        
        # Elevation factor (0-1, inverted so higher elevation = lower risk)
        elevation_score = self.elevation_factor.get(state_name, 0.5) * 100
        
        # Drainage capacity (0-1, inverted so better drainage = lower risk)
        drainage_score = (1 - self.drainage_capacity.get(state_name, 0.6)) * 100
        
        # Calculate weighted risk score
        risk_score = (
            0.4 * rainfall_intensity_score +
            0.2 * accumulation_score +
            0.2 * historical_score +
            0.1 * elevation_score +
            0.1 * drainage_score
        )
        
        # Normalize to 0-100
        risk_score = max(0, min(100, risk_score))
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "critical"
        elif risk_score >= 50:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Calculate confidence (based on data quality)
        confidence = self._calculate_confidence(weather_data, risk_score)
        
        # Determine trend
        trend = self._calculate_trend(weather_data, risk_score)
        
        # Calculate 12h forecast
        forecast_12h = self._calculate_forecast(risk_score, trend)
        
        return {
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "trend": trend,
            "forecast_12h": round(forecast_12h, 2)
        }
    
    def _calculate_confidence(self, weather_data: Dict, risk_score: float) -> float:
        """
        Calculate model confidence based on data quality and consistency
        """
        base_confidence = 85.0
        
        # Adjust based on rainfall consistency
        if weather_data["rainfall_24h"] > 0 and weather_data["past_7day_rainfall"] > 0:
            base_confidence += 5
        
        # Adjust based on risk score extremes
        if risk_score > 80 or risk_score < 20:
            base_confidence += 5
        
        return min(95, base_confidence)
    
    def _calculate_trend(self, weather_data: Dict, risk_score: float) -> str:
        """
        Determine if risk is rising, stable, or falling
        """
        rainfall_24h = weather_data["rainfall_24h"]
        past_7day_avg = weather_data["past_7day_rainfall"] / 7
        
        if rainfall_24h > past_7day_avg * 1.5:
            return "rising"
        elif rainfall_24h < past_7day_avg * 0.5:
            return "falling"
        else:
            return "stable"
    
    def _calculate_forecast(self, risk_score: float, trend: str) -> float:
        """
        Calculate 12-hour flood probability forecast
        """
        base_probability = risk_score * 0.8  # Base on current risk
        
        # Adjust based on trend
        if trend == "rising":
            base_probability += 10
        elif trend == "falling":
            base_probability -= 10
        
        return max(0, min(100, base_probability))

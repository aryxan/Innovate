// City-level data for multi-layer map system
export const cityData = {
  "Andhra Pradesh": [
    { name: "Visakhapatnam", lat: 17.6869, lng: 83.2185, riskScore: 75, sensors: 8, complaints: 5 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, riskScore: 82, sensors: 12, complaints: 8 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365, riskScore: 68, sensors: 6, complaints: 3 },
  ],
  "Assam": [
    { name: "Guwahati", lat: 26.1445, lng: 91.7362, riskScore: 88, sensors: 15, complaints: 12 },
    { name: "Dibrugarh", lat: 27.4728, lng: 94.9120, riskScore: 85, sensors: 10, complaints: 9 },
    { name: "Silchar", lat: 24.8333, lng: 92.7789, riskScore: 79, sensors: 7, complaints: 6 },
  ],
  "Bihar": [
    { name: "Patna", lat: 25.5941, lng: 85.1376, riskScore: 86, sensors: 14, complaints: 11 },
    { name: "Gaya", lat: 24.7955, lng: 85.0002, riskScore: 81, sensors: 9, complaints: 7 },
    { name: "Muzaffarpur", lat: 26.1225, lng: 85.3906, riskScore: 84, sensors: 11, complaints: 8 },
  ],
  "Kerala": [
    { name: "Kochi", lat: 9.9312, lng: 76.2673, riskScore: 76, sensors: 13, complaints: 9 },
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, riskScore: 72, sensors: 10, complaints: 6 },
    { name: "Kozhikode", lat: 11.2588, lng: 75.7804, riskScore: 78, sensors: 11, complaints: 7 },
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, riskScore: 65, sensors: 20, complaints: 8 },
    { name: "Pune", lat: 18.5204, lng: 73.8567, riskScore: 58, sensors: 15, complaints: 5 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882, riskScore: 62, sensors: 12, complaints: 6 },
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lng: 80.9462, riskScore: 73, sensors: 16, complaints: 9 },
    { name: "Varanasi", lat: 25.3176, lng: 82.9739, riskScore: 77, sensors: 11, complaints: 8 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319, riskScore: 75, sensors: 13, complaints: 7 },
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, riskScore: 80, sensors: 18, complaints: 10 },
    { name: "Howrah", lat: 22.5958, lng: 88.2636, riskScore: 83, sensors: 14, complaints: 11 },
    { name: "Siliguri", lat: 26.7271, lng: 88.3953, riskScore: 78, sensors: 10, complaints: 7 },
  ],
  "Odisha": [
    { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245, riskScore: 79, sensors: 12, complaints: 8 },
    { name: "Cuttack", lat: 20.4625, lng: 85.8830, riskScore: 82, sensors: 10, complaints: 9 },
    { name: "Puri", lat: 19.8135, lng: 85.8312, riskScore: 81, sensors: 9, complaints: 7 },
  ],
  "Uttarakhand": [
    { name: "Dehradun", lat: 30.3165, lng: 78.0322, riskScore: 69, sensors: 8, complaints: 5 },
    { name: "Haridwar", lat: 29.9457, lng: 78.1642, riskScore: 72, sensors: 10, complaints: 6 },
    { name: "Rishikesh", lat: 30.0869, lng: 78.2676, riskScore: 68, sensors: 7, complaints: 4 },
  ],
  // Add default empty arrays for other states
  "Arunachal Pradesh": [],
  "Chhattisgarh": [],
  "Goa": [],
  "Gujarat": [],
  "Haryana": [],
  "Himachal Pradesh": [],
  "Jharkhand": [],
  "Karnataka": [],
  "Madhya Pradesh": [],
  "Manipur": [],
  "Meghalaya": [],
  "Mizoram": [],
  "Nagaland": [],
  "Punjab": [],
  "Rajasthan": [],
  "Sikkim": [],
  "Tamil Nadu": [],
  "Telangana": [],
  "Tripura": [],
  "Andaman and Nicobar Islands": [],
  "Chandigarh": [],
  "Dadra and Nagar Haveli and Daman and Diu": [],
  "Delhi": [
    { name: "New Delhi", lat: 28.6139, lng: 77.2090, riskScore: 56, sensors: 15, complaints: 6 },
  ],
  "Jammu and Kashmir": [],
  "Ladakh": [],
  "Lakshadweep": [],
  "Puducherry": [],
};

// Helper function to get city risk level
export const getCityRiskLevel = (riskScore) => {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
};

// Helper function to get city marker color
export const getCityMarkerColor = (riskScore) => {
  if (riskScore >= 80) return '#ef4444'; // red
  if (riskScore >= 60) return '#f97316'; // orange
  if (riskScore >= 40) return '#eab308'; // yellow
  return '#22c55e'; // green
};

// Helper function to get city marker size
export const getCityMarkerSize = (riskScore) => {
  if (riskScore >= 80) return 16;
  if (riskScore >= 60) return 14;
  if (riskScore >= 40) return 12;
  return 10;
};

// Check if emergency mode should be triggered
export const checkEmergencyMode = (cities, complaints) => {
  // Check for critical sensors
  const hasCriticalSensor = cities.some(city => city.riskScore >= 80);
  
  // Check for high severity complaint clusters (simplified for demo)
  const highSeverityComplaints = complaints.filter(c => c.severity === 'High').length;
  
  return hasCriticalSensor || highSeverityComplaints >= 3;
};

// Hydrological Intelligence Sensor Network
// 2,500+ sensors distributed across India

const SENSOR_TYPES = {
  DRAIN: 'drain',
  RIVER: 'river',
  RAINFALL: 'rainfall',
};

const SENSOR_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// State-wise sensor distribution
const stateSensorCounts = {
  'Andhra Pradesh': 120,
  'Assam': 150,
  'Bihar': 180,
  'Kerala': 140,
  'Maharashtra': 200,
  'Uttar Pradesh': 190,
  'West Bengal': 170,
  'Odisha': 130,
  'Uttarakhand': 90,
  'Gujarat': 110,
  'Tamil Nadu': 125,
  'Karnataka': 115,
  'Madhya Pradesh': 100,
  'Rajasthan': 80,
  'Punjab': 85,
  'Haryana': 75,
  'Delhi': 95,
  'Jharkhand': 70,
  'Chhattisgarh': 65,
  'Telangana': 105,
  'Himachal Pradesh': 60,
  'Goa': 40,
  'Tripura': 35,
  'Meghalaya': 45,
  'Manipur': 38,
  'Nagaland': 32,
  'Mizoram': 30,
  'Sikkim': 28,
  'Arunachal Pradesh': 42,
  'Jammu and Kashmir': 55,
  'Ladakh': 25,
  'Chandigarh': 20,
  'Puducherry': 18,
  'Andaman and Nicobar Islands': 22,
  'Lakshadweep': 15,
  'Dadra and Nagar Haveli and Daman and Diu': 16,
};

// City coordinates for sensor placement
const cityCoordinates = {
  'Andhra Pradesh': [
    { city: 'Visakhapatnam', lat: 17.6869, lng: 83.2185 },
    { city: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
    { city: 'Guntur', lat: 16.3067, lng: 80.4365 },
    { city: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  ],
  'Assam': [
    { city: 'Guwahati', lat: 26.1445, lng: 91.7362 },
    { city: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
    { city: 'Silchar', lat: 24.8333, lng: 92.7789 },
    { city: 'Jorhat', lat: 26.7509, lng: 94.2037 },
  ],
  'Bihar': [
    { city: 'Patna', lat: 25.5941, lng: 85.1376 },
    { city: 'Gaya', lat: 24.7955, lng: 85.0002 },
    { city: 'Muzaffarpur', lat: 26.1225, lng: 85.3906 },
    { city: 'Bhagalpur', lat: 25.2425, lng: 86.9842 },
  ],
  'Kerala': [
    { city: 'Kochi', lat: 9.9312, lng: 76.2673 },
    { city: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { city: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
    { city: 'Thrissur', lat: 10.5276, lng: 76.2144 },
  ],
  'Maharashtra': [
    { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { city: 'Pune', lat: 18.5204, lng: 73.8567 },
    { city: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { city: 'Nashik', lat: 19.9975, lng: 73.7898 },
  ],
  'Uttar Pradesh': [
    { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { city: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { city: 'Kanpur', lat: 26.4499, lng: 80.3319 },
    { city: 'Agra', lat: 27.1767, lng: 78.0081 },
  ],
  'West Bengal': [
    { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { city: 'Howrah', lat: 22.5958, lng: 88.2636 },
    { city: 'Siliguri', lat: 26.7271, lng: 88.3953 },
    { city: 'Durgapur', lat: 23.5204, lng: 87.3119 },
  ],
  'Delhi': [
    { city: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { city: 'Dwarka', lat: 28.5921, lng: 77.0460 },
    { city: 'Rohini', lat: 28.7495, lng: 77.0736 },
  ],
};

// Generate sensor ID
const generateSensorId = (state, city, type, index) => {
  const stateCode = state.substring(0, 2).toUpperCase();
  const cityCode = city.substring(0, 3).toUpperCase();
  const typeCode = type === 'drain' ? 'DR' : type === 'river' ? 'RV' : 'RF';
  return `${stateCode}-${cityCode}-${typeCode}-${String(index).padStart(4, '0')}`;
};

// Simulate sensor data with realistic patterns
const generateSensorData = () => {
  const sensors = [];
  let globalIndex = 0;

  Object.entries(stateSensorCounts).forEach(([state, count]) => {
    const cities = cityCoordinates[state] || [{ city: state, lat: 0, lng: 0 }];
    const sensorsPerCity = Math.ceil(count / cities.length);

    cities.forEach((cityData) => {
      for (let i = 0; i < sensorsPerCity && globalIndex < 2500; i++) {
        const type = i % 3 === 0 ? SENSOR_TYPES.RAINFALL : 
                     i % 3 === 1 ? SENSOR_TYPES.RIVER : 
                     SENSOR_TYPES.DRAIN;

        // Generate realistic coordinates near city center
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;

        // Simulate realistic sensor readings
        const baseWaterLevel = Math.random() * 100;
        const flowRate = type === SENSOR_TYPES.DRAIN ? Math.random() * 50 : Math.random() * 100;
        const blockageIndex = type === SENSOR_TYPES.DRAIN ? Math.random() * 100 : 0;

        // Determine status based on logic
        let status = SENSOR_STATUS.NORMAL;
        let waterLevelPercentage = baseWaterLevel;

        // Blockage detection logic
        if (type === SENSOR_TYPES.DRAIN) {
          if (waterLevelPercentage > 95) {
            status = SENSOR_STATUS.CRITICAL;
          } else if (waterLevelPercentage > 85 && flowRate < 15) {
            status = SENSOR_STATUS.CRITICAL; // Blockage detected
            waterLevelPercentage = Math.min(waterLevelPercentage + 10, 100);
          } else if (waterLevelPercentage > 70) {
            status = SENSOR_STATUS.WARNING;
          }
        } else if (type === SENSOR_TYPES.RIVER) {
          if (waterLevelPercentage > 90) {
            status = SENSOR_STATUS.CRITICAL;
          } else if (waterLevelPercentage > 75) {
            status = SENSOR_STATUS.WARNING;
          }
        } else if (type === SENSOR_TYPES.RAINFALL) {
          if (waterLevelPercentage > 85) {
            status = SENSOR_STATUS.CRITICAL;
          } else if (waterLevelPercentage > 65) {
            status = SENSOR_STATUS.WARNING;
          }
        }

        sensors.push({
          id: generateSensorId(state, cityData.city, type, globalIndex),
          state,
          city: cityData.city,
          type,
          lat: cityData.lat + latOffset,
          lng: cityData.lng + lngOffset,
          waterLevelPercentage: Math.round(waterLevelPercentage * 10) / 10,
          flowRate: Math.round(flowRate * 10) / 10,
          blockageIndex: Math.round(blockageIndex * 10) / 10,
          status,
          lastUpdatedMinutesAgo: Math.floor(Math.random() * 30),
          temperature: type === SENSOR_TYPES.RAINFALL ? Math.round(20 + Math.random() * 15) : null,
          humidity: type === SENSOR_TYPES.RAINFALL ? Math.round(40 + Math.random() * 50) : null,
        });

        globalIndex++;
      }
    });
  });

  return sensors;
};

// Generate the sensor network
export const sensorNetwork = generateSensorData();

// Helper functions
export const getSensorsByState = (stateName) => {
  return sensorNetwork.filter(sensor => sensor.state === stateName);
};

export const getSensorsByCity = (stateName, cityName) => {
  return sensorNetwork.filter(sensor => 
    sensor.state === stateName && sensor.city === cityName
  );
};

export const getSensorsByType = (type) => {
  return sensorNetwork.filter(sensor => sensor.type === type);
};

export const getSensorsByStatus = (status) => {
  return sensorNetwork.filter(sensor => sensor.status === status);
};

export const getCriticalSensors = () => {
  return sensorNetwork.filter(sensor => sensor.status === SENSOR_STATUS.CRITICAL);
};

export const getBlockedDrains = () => {
  return sensorNetwork.filter(sensor => 
    sensor.type === SENSOR_TYPES.DRAIN && 
    sensor.waterLevelPercentage > 85 && 
    sensor.flowRate < 15
  );
};

export const getOverflowingSensors = () => {
  return sensorNetwork.filter(sensor => sensor.waterLevelPercentage > 95);
};

// Statistics
export const getSensorStatistics = () => {
  const total = sensorNetwork.length;
  const drains = getSensorsByType(SENSOR_TYPES.DRAIN).length;
  const rivers = getSensorsByType(SENSOR_TYPES.RIVER).length;
  const rainfall = getSensorsByType(SENSOR_TYPES.RAINFALL).length;
  
  const normal = getSensorsByStatus(SENSOR_STATUS.NORMAL).length;
  const warning = getSensorsByStatus(SENSOR_STATUS.WARNING).length;
  const critical = getSensorsByStatus(SENSOR_STATUS.CRITICAL).length;
  
  const blocked = getBlockedDrains().length;
  const overflowing = getOverflowingSensors().length;

  return {
    total,
    byType: { drains, rivers, rainfall },
    byStatus: { normal, warning, critical },
    drainHealth: {
      healthy: Math.round((drains - blocked - overflowing) / drains * 100),
      blocked: Math.round(blocked / drains * 100),
      overflowing: Math.round(overflowing / drains * 100),
    },
    criticalCities: getCriticalCitiesList(),
  };
};

export const getCriticalCitiesList = () => {
  const cityMap = {};
  
  getCriticalSensors().forEach(sensor => {
    const key = `${sensor.state}-${sensor.city}`;
    if (!cityMap[key]) {
      cityMap[key] = {
        state: sensor.state,
        city: sensor.city,
        count: 0,
      };
    }
    cityMap[key].count++;
  });

  return Object.values(cityMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// State-wise aggregated data
export const getStateAggregatedData = (stateName) => {
  const stateSensors = getSensorsByState(stateName);
  
  if (stateSensors.length === 0) {
    return null;
  }

  const avgWaterLevel = stateSensors.reduce((sum, s) => sum + s.waterLevelPercentage, 0) / stateSensors.length;
  const avgFlowRate = stateSensors.reduce((sum, s) => sum + s.flowRate, 0) / stateSensors.length;
  const criticalCount = stateSensors.filter(s => s.status === SENSOR_STATUS.CRITICAL).length;
  const warningCount = stateSensors.filter(s => s.status === SENSOR_STATUS.WARNING).length;
  const blockedDrainCount = stateSensors.filter(s => 
    s.type === SENSOR_TYPES.DRAIN && s.waterLevelPercentage > 85 && s.flowRate < 15
  ).length;

  return {
    totalSensors: stateSensors.length,
    avgWaterLevel: Math.round(avgWaterLevel * 10) / 10,
    avgFlowRate: Math.round(avgFlowRate * 10) / 10,
    criticalCount,
    warningCount,
    normalCount: stateSensors.length - criticalCount - warningCount,
    blockedDrainCount,
    drainBlockageDensity: Math.round(blockedDrainCount / stateSensors.length * 100),
  };
};

export { SENSOR_TYPES, SENSOR_STATUS };

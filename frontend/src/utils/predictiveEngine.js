// Predictive Flood Intelligence Engine
// Multi-factor risk assessment with AI-powered analysis

import { getStateAggregatedData } from '../data/sensorNetwork';

// Risk classification thresholds
const RISK_LEVELS = {
  LOW: { min: 0, max: 39, label: 'low', color: '#22c55e' },
  MEDIUM: { min: 40, max: 69, label: 'medium', color: '#eab308' },
  HIGH: { min: 70, max: 100, label: 'high', color: '#ef4444' },
};

// Factor weights for risk calculation
const WEIGHTS = {
  rainfall: 0.25,
  riverLevel: 0.20,
  drainBlockage: 0.25,
  complaintSpike: 0.15,
  soilSaturation: 0.15,
};

/**
 * Calculate flood risk score for a state
 * @param {Object} stateData - State information
 * @param {Array} complaints - Citizen complaints for the state
 * @param {Object} weatherData - Weather forecast data
 * @returns {Object} Risk assessment with score, level, and contributing factors
 */
export const calculateFloodRisk = (stateData, complaints = [], weatherData = null) => {
  const stateName = stateData.name || stateData;
  const sensorData = getStateAggregatedData(stateName);

  if (!sensorData) {
    return {
      riskScore: 0,
      riskLevel: 'low',
      confidence: 0,
      contributingFactors: [],
      message: 'Insufficient sensor data',
    };
  }

  const factors = [];
  let totalScore = 0;

  // 1. Rainfall Factor (0-100)
  const rainfallScore = calculateRainfallScore(weatherData, stateData);
  totalScore += rainfallScore * WEIGHTS.rainfall;
  factors.push({
    name: 'Rainfall Forecast',
    score: rainfallScore,
    weight: WEIGHTS.rainfall,
    contribution: Math.round(rainfallScore * WEIGHTS.rainfall),
    status: rainfallScore > 70 ? 'critical' : rainfallScore > 40 ? 'warning' : 'normal',
    description: getRainfallDescription(rainfallScore),
  });

  // 2. River Level Trend (0-100)
  const riverLevelScore = calculateRiverLevelScore(sensorData);
  totalScore += riverLevelScore * WEIGHTS.riverLevel;
  factors.push({
    name: 'River Water Levels',
    score: riverLevelScore,
    weight: WEIGHTS.riverLevel,
    contribution: Math.round(riverLevelScore * WEIGHTS.riverLevel),
    status: riverLevelScore > 70 ? 'critical' : riverLevelScore > 40 ? 'warning' : 'normal',
    description: getRiverLevelDescription(riverLevelScore, sensorData),
  });

  // 3. Drain Blockage Density (0-100)
  const drainBlockageScore = sensorData.drainBlockageDensity;
  totalScore += drainBlockageScore * WEIGHTS.drainBlockage;
  factors.push({
    name: 'Drain Network Health',
    score: drainBlockageScore,
    weight: WEIGHTS.drainBlockage,
    contribution: Math.round(drainBlockageScore * WEIGHTS.drainBlockage),
    status: drainBlockageScore > 70 ? 'critical' : drainBlockageScore > 40 ? 'warning' : 'normal',
    description: getDrainBlockageDescription(drainBlockageScore, sensorData),
  });

  // 4. Complaint Spike Factor (0-100)
  const complaintScore = calculateComplaintScore(complaints, stateName);
  totalScore += complaintScore * WEIGHTS.complaintSpike;
  factors.push({
    name: 'Citizen Alert Density',
    score: complaintScore,
    weight: WEIGHTS.complaintSpike,
    contribution: Math.round(complaintScore * WEIGHTS.complaintSpike),
    status: complaintScore > 70 ? 'critical' : complaintScore > 40 ? 'warning' : 'normal',
    description: getComplaintDescription(complaintScore, complaints),
  });

  // 5. Soil Saturation (simulated based on recent rainfall and water levels)
  const soilSaturationScore = calculateSoilSaturation(sensorData, rainfallScore);
  totalScore += soilSaturationScore * WEIGHTS.soilSaturation;
  factors.push({
    name: 'Soil Saturation Index',
    score: soilSaturationScore,
    weight: WEIGHTS.soilSaturation,
    contribution: Math.round(soilSaturationScore * WEIGHTS.soilSaturation),
    status: soilSaturationScore > 70 ? 'critical' : soilSaturationScore > 40 ? 'warning' : 'normal',
    description: getSoilSaturationDescription(soilSaturationScore),
  });

  // Calculate final risk score
  const riskScore = Math.round(totalScore);
  const riskLevel = getRiskLevel(riskScore);

  // Sort factors by contribution
  factors.sort((a, b) => b.contribution - a.contribution);

  return {
    riskScore,
    riskLevel,
    contributingFactors: factors,
    topFactors: factors.slice(0, 3),
    sensorCoverage: sensorData.totalSensors,
    lastUpdated: new Date().toISOString(),
    prediction: generatePrediction(riskScore, factors),
  };
};

// Helper: Calculate rainfall score
const calculateRainfallScore = (weatherData, stateData) => {
  if (weatherData && weatherData.rainfall) {
    // Use actual weather data if available
    const rainfall = weatherData.rainfall;
    if (rainfall > 100) return 95;
    if (rainfall > 75) return 85;
    if (rainfall > 50) return 70;
    if (rainfall > 25) return 50;
    return 30;
  }

  // Simulate based on state risk level
  const riskLevel = stateData.riskLevel || stateData.risk || 50;
  return Math.min(riskLevel + Math.random() * 20, 100);
};

// Helper: Calculate river level score
const calculateRiverLevelScore = (sensorData) => {
  const avgWaterLevel = sensorData.avgWaterLevel;
  const criticalRatio = sensorData.criticalCount / sensorData.totalSensors;

  return Math.min(avgWaterLevel * 0.7 + criticalRatio * 100 * 0.3, 100);
};

// Helper: Calculate complaint score
const calculateComplaintScore = (complaints, stateName) => {
  if (!complaints || complaints.length === 0) return 10;

  const recentComplaints = complaints.filter(c => {
    const hoursSince = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
    return hoursSince < 24;
  });

  const highSeverity = recentComplaints.filter(c => c.severity === 'High').length;
  const mediumSeverity = recentComplaints.filter(c => c.severity === 'Medium').length;

  const score = (highSeverity * 10 + mediumSeverity * 5) * 2;
  return Math.min(score, 100);
};

// Helper: Calculate soil saturation
const calculateSoilSaturation = (sensorData, rainfallScore) => {
  const waterLevelFactor = sensorData.avgWaterLevel * 0.6;
  const rainfallFactor = rainfallScore * 0.4;
  
  return Math.min(waterLevelFactor + rainfallFactor, 100);
};

// Helper: Get risk level from score
const getRiskLevel = (score) => {
  if (score >= RISK_LEVELS.HIGH.min) return RISK_LEVELS.HIGH.label;
  if (score >= RISK_LEVELS.MEDIUM.min) return RISK_LEVELS.MEDIUM.label;
  return RISK_LEVELS.LOW.label;
};

// Description generators
const getRainfallDescription = (score) => {
  if (score > 80) return 'Heavy rainfall expected in next 24-48 hours';
  if (score > 60) return 'Moderate to heavy rainfall forecast';
  if (score > 40) return 'Light to moderate rainfall expected';
  return 'Minimal rainfall forecast';
};

const getRiverLevelDescription = (score, sensorData) => {
  if (score > 80) return `Critical: ${sensorData.criticalCount} river sensors at danger level`;
  if (score > 60) return `Warning: River levels rising, ${sensorData.warningCount} sensors elevated`;
  if (score > 40) return 'River levels stable but elevated';
  return 'River levels within normal range';
};

const getDrainBlockageDescription = (score, sensorData) => {
  if (score > 70) return `Critical: ${sensorData.blockedDrainCount} drains blocked or overflowing`;
  if (score > 40) return `Warning: ${sensorData.blockedDrainCount} drains showing blockage signs`;
  return 'Drain network operating normally';
};

const getComplaintDescription = (score, complaints) => {
  const recent = complaints.filter(c => {
    const hoursSince = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
    return hoursSince < 24;
  }).length;

  if (score > 70) return `Alert: ${recent} citizen reports in last 24 hours`;
  if (score > 40) return `${recent} citizen reports logged recently`;
  return 'Minimal citizen alerts';
};

const getSoilSaturationDescription = (score) => {
  if (score > 80) return 'Soil critically saturated, high runoff risk';
  if (score > 60) return 'Soil saturation elevated, reduced absorption';
  if (score > 40) return 'Moderate soil moisture levels';
  return 'Soil absorption capacity normal';
};

// Generate prediction text
const generatePrediction = (riskScore, factors) => {
  const criticalFactors = factors.filter(f => f.status === 'critical');
  const warningFactors = factors.filter(f => f.status === 'warning');

  if (riskScore >= 80) {
    return {
      severity: 'critical',
      message: 'Immediate flood risk detected',
      action: 'Emergency protocols recommended',
      timeframe: 'Next 6-12 hours',
    };
  } else if (riskScore >= 60) {
    return {
      severity: 'high',
      message: 'Elevated flood risk',
      action: 'Monitor situation closely, prepare response',
      timeframe: 'Next 12-24 hours',
    };
  } else if (riskScore >= 40) {
    return {
      severity: 'medium',
      message: 'Moderate flood risk',
      action: 'Continue monitoring',
      timeframe: 'Next 24-48 hours',
    };
  } else {
    return {
      severity: 'low',
      message: 'Low flood risk',
      action: 'Routine monitoring',
      timeframe: 'Next 48-72 hours',
    };
  }
};

// Calculate risk trend (rising, stable, falling)
export const calculateRiskTrend = (currentRisk, historicalRisks = []) => {
  if (historicalRisks.length < 2) return 'stable';

  const recentAvg = historicalRisks.slice(-3).reduce((sum, r) => sum + r, 0) / 3;
  const diff = currentRisk - recentAvg;

  if (diff > 10) return 'rising';
  if (diff < -10) return 'falling';
  return 'stable';
};

// Export risk levels for UI
export { RISK_LEVELS };

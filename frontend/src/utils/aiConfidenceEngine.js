// AI Confidence Engine
// Calculates prediction confidence based on data quality and coverage

import { getSensorsByState, getSensorStatistics } from '../data/sensorNetwork';

const CONFIDENCE_LEVELS = {
  VERY_HIGH: { min: 85, max: 100, label: 'Very High', color: '#22c55e' },
  HIGH: { min: 70, max: 84, label: 'High', color: '#84cc16' },
  MEDIUM: { min: 50, max: 69, label: 'Medium', color: '#eab308' },
  LOW: { min: 30, max: 49, label: 'Low', color: '#f97316' },
  VERY_LOW: { min: 0, max: 29, label: 'Very Low', color: '#ef4444' },
};

/**
 * Calculate AI confidence score for predictions
 * @param {string} stateName - State name
 * @param {Object} riskData - Risk assessment data
 * @returns {Object} Confidence assessment with score, level, and explanation
 */
export const calculateConfidence = (stateName, riskData = {}) => {
  const factors = [];
  let totalScore = 0;

  // 1. Sensor Coverage (40% weight)
  const coverageScore = calculateSensorCoverage(stateName);
  totalScore += coverageScore * 0.4;
  factors.push({
    name: 'Sensor Network Coverage',
    score: coverageScore,
    weight: 0.4,
    contribution: Math.round(coverageScore * 0.4),
    description: getCoverageDescription(coverageScore, stateName),
  });

  // 2. Cross-Signal Agreement (30% weight)
  const agreementScore = calculateCrossSignalAgreement(stateName, riskData);
  totalScore += agreementScore * 0.3;
  factors.push({
    name: 'Multi-Source Data Agreement',
    score: agreementScore,
    weight: 0.3,
    contribution: Math.round(agreementScore * 0.3),
    description: getAgreementDescription(agreementScore),
  });

  // 3. Data Freshness (20% weight)
  const freshnessScore = calculateDataFreshness(stateName);
  totalScore += freshnessScore * 0.2;
  factors.push({
    name: 'Real-Time Data Quality',
    score: freshnessScore,
    weight: 0.2,
    contribution: Math.round(freshnessScore * 0.2),
    description: getFreshnessDescription(freshnessScore),
  });

  // 4. Historical Pattern Match (10% weight)
  const historicalScore = calculateHistoricalMatch(stateName, riskData);
  totalScore += historicalScore * 0.1;
  factors.push({
    name: 'Historical Pattern Confidence',
    score: historicalScore,
    weight: 0.1,
    contribution: Math.round(historicalScore * 0.1),
    description: getHistoricalDescription(historicalScore),
  });

  const confidenceScore = Math.round(totalScore);
  const confidenceLevel = getConfidenceLevel(confidenceScore);

  return {
    confidenceScore,
    confidenceLevel: confidenceLevel.label,
    confidenceColor: confidenceLevel.color,
    factors,
    explanation: generateExplanation(confidenceScore, factors),
    recommendations: generateRecommendations(confidenceScore, factors),
    lastCalculated: new Date().toISOString(),
  };
};

// Helper: Calculate sensor coverage score
const calculateSensorCoverage = (stateName) => {
  const stateSensors = getSensorsByState(stateName);
  const stats = getSensorStatistics();

  if (stateSensors.length === 0) return 0;

  // Base score on sensor density
  const sensorDensity = stateSensors.length;
  
  // Ideal coverage: 100+ sensors
  let score = Math.min((sensorDensity / 100) * 100, 100);

  // Bonus for sensor type diversity
  const drainSensors = stateSensors.filter(s => s.type === 'drain').length;
  const riverSensors = stateSensors.filter(s => s.type === 'river').length;
  const rainfallSensors = stateSensors.filter(s => s.type === 'rainfall').length;

  const hasDiversity = drainSensors > 0 && riverSensors > 0 && rainfallSensors > 0;
  if (hasDiversity) score = Math.min(score + 10, 100);

  return Math.round(score);
};

// Helper: Calculate cross-signal agreement
const calculateCrossSignalAgreement = (stateName, riskData) => {
  if (!riskData.contributingFactors) return 50;

  const factors = riskData.contributingFactors;
  
  // Check if factors agree on severity
  const criticalCount = factors.filter(f => f.status === 'critical').length;
  const warningCount = factors.filter(f => f.status === 'warning').length;
  const normalCount = factors.filter(f => f.status === 'normal').length;

  const total = factors.length;
  const maxCount = Math.max(criticalCount, warningCount, normalCount);
  const agreementRatio = maxCount / total;

  // High agreement = high confidence
  let score = agreementRatio * 100;

  // Bonus if multiple high-weight factors agree
  const topFactors = factors.slice(0, 3);
  const topAgreement = topFactors.filter(f => f.status === topFactors[0].status).length;
  if (topAgreement >= 2) score = Math.min(score + 15, 100);

  return Math.round(score);
};

// Helper: Calculate data freshness
const calculateDataFreshness = (stateName) => {
  const stateSensors = getSensorsByState(stateName);
  
  if (stateSensors.length === 0) return 0;

  // Calculate average data age
  const avgAge = stateSensors.reduce((sum, s) => sum + s.lastUpdatedMinutesAgo, 0) / stateSensors.length;

  // Fresher data = higher confidence
  // Ideal: < 5 minutes
  // Good: < 15 minutes
  // Acceptable: < 30 minutes
  let score = 100;
  if (avgAge > 30) score = 40;
  else if (avgAge > 15) score = 70;
  else if (avgAge > 5) score = 90;

  // Penalty for stale sensors
  const staleSensors = stateSensors.filter(s => s.lastUpdatedMinutesAgo > 30).length;
  const staleRatio = staleSensors / stateSensors.length;
  score -= staleRatio * 30;

  return Math.max(Math.round(score), 0);
};

// Helper: Calculate historical pattern match
const calculateHistoricalMatch = (stateName, riskData) => {
  // Simulate historical pattern matching
  // In production, this would compare current patterns with historical flood events
  
  const riskScore = riskData.riskScore || 50;
  
  // Simulate confidence based on risk level
  // Higher risk = more historical data available = higher confidence
  let score = 60; // Base confidence

  if (riskScore > 70) {
    // High risk scenarios have more historical precedent
    score = 75 + Math.random() * 15;
  } else if (riskScore > 40) {
    // Medium risk scenarios
    score = 60 + Math.random() * 15;
  } else {
    // Low risk scenarios
    score = 70 + Math.random() * 20;
  }

  return Math.round(score);
};

// Helper: Get confidence level
const getConfidenceLevel = (score) => {
  for (const level of Object.values(CONFIDENCE_LEVELS)) {
    if (score >= level.min && score <= level.max) {
      return level;
    }
  }
  return CONFIDENCE_LEVELS.MEDIUM;
};

// Description generators
const getCoverageDescription = (score, stateName) => {
  const sensors = getSensorsByState(stateName);
  const count = sensors.length;

  if (score >= 85) return `Excellent coverage with ${count} active sensors across the region`;
  if (score >= 70) return `Good sensor network with ${count} monitoring points`;
  if (score >= 50) return `Adequate coverage with ${count} sensors, some gaps exist`;
  if (score >= 30) return `Limited sensor coverage (${count} sensors), expanding network recommended`;
  return `Insufficient sensor coverage (${count} sensors), predictions may be unreliable`;
};

const getAgreementDescription = (score) => {
  if (score >= 85) return 'All data sources strongly agree on risk assessment';
  if (score >= 70) return 'Multiple data sources confirm risk indicators';
  if (score >= 50) return 'Moderate agreement between data sources';
  if (score >= 30) return 'Mixed signals from different data sources';
  return 'Conflicting data from multiple sources, interpret with caution';
};

const getFreshnessDescription = (score) => {
  if (score >= 90) return 'Real-time data streaming, all sensors reporting';
  if (score >= 70) return 'Recent data available, minor delays in some sensors';
  if (score >= 50) return 'Data mostly current, some sensors delayed';
  if (score >= 30) return 'Significant data delays detected';
  return 'Stale data, sensor network may have connectivity issues';
};

const getHistoricalDescription = (score) => {
  if (score >= 80) return 'Strong correlation with historical flood patterns';
  if (score >= 65) return 'Good match with past hydrological events';
  if (score >= 50) return 'Moderate alignment with historical data';
  if (score >= 35) return 'Limited historical precedent for current conditions';
  return 'Unusual conditions, limited historical comparison available';
};

// Generate overall explanation
const generateExplanation = (score, factors) => {
  const level = getConfidenceLevel(score);
  const weakestFactor = factors.reduce((min, f) => f.score < min.score ? f : min, factors[0]);
  const strongestFactor = factors.reduce((max, f) => f.score > max.score ? f : max, factors[0]);

  let explanation = `Prediction confidence is ${level.label.toLowerCase()} (${score}%). `;

  if (score >= 85) {
    explanation += 'All indicators show strong data quality and agreement. Predictions are highly reliable.';
  } else if (score >= 70) {
    explanation += `Good data quality overall. ${strongestFactor.name} provides strong support.`;
  } else if (score >= 50) {
    explanation += `Moderate confidence. ${weakestFactor.name} is the limiting factor.`;
  } else if (score >= 30) {
    explanation += `Low confidence due to ${weakestFactor.name}. Use predictions with caution.`;
  } else {
    explanation += `Very low confidence. Significant data quality issues detected. Manual verification recommended.`;
  }

  return explanation;
};

// Generate recommendations
const generateRecommendations = (score, factors) => {
  const recommendations = [];

  if (score < 70) {
    const weakFactors = factors.filter(f => f.score < 60);
    
    weakFactors.forEach(factor => {
      if (factor.name.includes('Coverage')) {
        recommendations.push('Deploy additional sensors to improve coverage');
      } else if (factor.name.includes('Agreement')) {
        recommendations.push('Cross-verify with manual observations');
      } else if (factor.name.includes('Freshness')) {
        recommendations.push('Check sensor connectivity and data transmission');
      } else if (factor.name.includes('Historical')) {
        recommendations.push('Consult historical records and local expertise');
      }
    });
  }

  if (score >= 85) {
    recommendations.push('Confidence is high - predictions can be used for operational decisions');
  } else if (score >= 70) {
    recommendations.push('Good confidence - suitable for planning and preparedness');
  } else if (score >= 50) {
    recommendations.push('Moderate confidence - combine with other information sources');
  } else {
    recommendations.push('Low confidence - manual verification strongly recommended');
  }

  return recommendations;
};

// Calculate model accuracy (simulated)
export const calculateModelAccuracy = () => {
  // Simulate model performance metrics
  return {
    overall: 87.5,
    precision: 89.2,
    recall: 85.8,
    f1Score: 87.4,
    lastTrainingDate: '2024-01-15',
    trainingDataPoints: 15420,
    validationAccuracy: 86.3,
  };
};

export { CONFIDENCE_LEVELS };

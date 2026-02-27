import React from 'react';
import { HeatmapLayer as GoogleHeatmapLayer } from '@react-google-maps/api';

const HeatmapLayer = ({ sensors, complaints, showHeatmap }) => {
  if (!showHeatmap) return null;

  // Combine sensor data and complaint data for heatmap
  const heatmapData = [];

  // Add sensor data points
  if (sensors && sensors.length > 0) {
    sensors.forEach(sensor => {
      heatmapData.push({
        location: new window.google.maps.LatLng(sensor.lat, sensor.lng),
        weight: sensor.risk_component || 50,
      });
    });
  }

  // Add complaint data points with higher weight for high severity
  if (complaints && complaints.length > 0) {
    complaints.forEach(complaint => {
      const weight = complaint.severity === 'High' ? 80 : 
                     complaint.severity === 'Medium' ? 50 : 30;
      heatmapData.push({
        location: new window.google.maps.LatLng(complaint.lat, complaint.lng),
        weight: weight,
      });
    });
  }

  if (heatmapData.length === 0) return null;

  return (
    <GoogleHeatmapLayer
      data={heatmapData}
      options={{
        radius: 30,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 0, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 165, 0, 1)',
          'rgba(255, 0, 0, 1)',
        ],
      }}
    />
  );
};

export default HeatmapLayer;

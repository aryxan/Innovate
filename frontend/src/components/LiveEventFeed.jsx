import React, { useState, useEffect } from 'react';
import { getCriticalSensors, getBlockedDrains } from '../data/sensorNetwork';

const LiveEventFeed = ({ complaints = [] }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    generateEvents();
    const interval = setInterval(generateEvents, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [complaints]);

  const generateEvents = () => {
    const newEvents = [];
    const now = new Date();

    // Sensor spike events
    const criticalSensors = getCriticalSensors();
    if (criticalSensors.length > 0) {
      const recentCritical = criticalSensors.filter(s => s.lastUpdatedMinutesAgo < 10);
      if (recentCritical.length > 0) {
        const sensor = recentCritical[0];
        newEvents.push({
          id: `sensor-${sensor.id}-${Date.now()}`,
          type: 'sensor_spike',
          severity: 'critical',
          title: 'Critical Sensor Alert',
          message: `${sensor.city}: Water level ${sensor.waterLevelPercentage}% at ${sensor.id}`,
          location: `${sensor.city}, ${sensor.state}`,
          timestamp: new Date(now - sensor.lastUpdatedMinutesAgo * 60000),
          icon: 'sensor',
        });
      }
    }

    // Blockage events
    const blockedDrains = getBlockedDrains();
    if (blockedDrains.length > 0) {
      const recentBlocked = blockedDrains.filter(s => s.lastUpdatedMinutesAgo < 15);
      if (recentBlocked.length > 0) {
        const drain = recentBlocked[0];
        newEvents.push({
          id: `blockage-${drain.id}-${Date.now()}`,
          type: 'blockage',
          severity: 'warning',
          title: 'Drain Blockage Detected',
          message: `${drain.city}: Flow rate dropped to ${drain.flowRate}% at ${drain.id}`,
          location: `${drain.city}, ${drain.state}`,
          timestamp: new Date(now - drain.lastUpdatedMinutesAgo * 60000),
          icon: 'blockage',
        });
      }
    }

    // Complaint surge events
    const recentComplaints = complaints.filter(c => {
      const hoursSince = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
      return hoursSince < 1;
    });

    if (recentComplaints.length >= 3) {
      newEvents.push({
        id: `complaint-surge-${Date.now()}`,
        type: 'complaint_surge',
        severity: 'warning',
        title: 'Citizen Alert Surge',
        message: `${recentComplaints.length} new reports in last hour`,
        location: 'Multiple locations',
        timestamp: new Date(),
        icon: 'alert',
      });
    }

    // Rainfall anomaly (simulated)
    if (Math.random() > 0.7) {
      const states = ['Maharashtra', 'Kerala', 'Assam', 'Bihar', 'West Bengal'];
      const state = states[Math.floor(Math.random() * states.length)];
      newEvents.push({
        id: `rainfall-${Date.now()}`,
        type: 'rainfall_anomaly',
        severity: 'info',
        title: 'Rainfall Anomaly Detected',
        message: `Unexpected precipitation pattern in ${state}`,
        location: state,
        timestamp: new Date(),
        icon: 'weather',
      });
    }

    // System alerts
    if (criticalSensors.length > 10) {
      newEvents.push({
        id: `system-alert-${Date.now()}`,
        type: 'system_alert',
        severity: 'critical',
        title: 'Multi-Zone Emergency',
        message: `${criticalSensors.length} critical sensors across network`,
        location: 'National',
        timestamp: new Date(),
        icon: 'system',
      });
    }

    // Combine with existing events and sort by timestamp
    const allEvents = [...newEvents, ...events]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Keep only last 10 events

    setEvents(allEvents);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-900/20';
      case 'warning': return 'border-amber-500/50 bg-amber-900/20';
      case 'info': return 'border-blue-500/50 bg-blue-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const getSeverityDot = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 animate-pulse';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'sensor':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'blockage':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'weather':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Live Event Feed</h2>
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Real-Time System Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-700/30">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-mono font-bold uppercase">Streaming</span>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm font-mono">No recent events</p>
            <p className="text-gray-600 text-xs mt-1">System monitoring active</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-3 transition-all hover:scale-[1.02] ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  event.severity === 'critical' ? 'bg-red-600/30 text-red-400' :
                  event.severity === 'warning' ? 'bg-amber-600/30 text-amber-400' :
                  'bg-blue-600/30 text-blue-400'
                }`}>
                  {getIcon(event.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{event.title}</h3>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${getSeverityDot(event.severity)}`}></div>
                  </div>
                  <p className="text-gray-300 text-xs mb-2">{event.message}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </span>
                    <span className="text-gray-500 font-mono">{getTimeAgo(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LiveEventFeed;

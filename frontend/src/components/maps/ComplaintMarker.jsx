import React, { useState, useEffect } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

const ComplaintMarker = ({ complaint, onClick, isSelected, onCloseInfo }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (complaint.severity === 'High') {
      const interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 600);
      
      return () => clearInterval(interval);
    }
  }, [complaint.severity]);

  const getMarkerIcon = () => {
    const colors = {
      Low: '#3b82f6',
      Medium: '#f59e0b',
      High: '#ef4444',
    };

    const color = colors[complaint.severity] || '#6b7280';
    const opacity = (complaint.severity === 'High' && blink) ? 0.3 : 1;

    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: opacity,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24),
    };
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const reportTime = new Date(timestamp);
    const diffMs = now - reportTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <>
      <Marker
        position={{ lat: complaint.lat, lng: complaint.lng }}
        icon={getMarkerIcon()}
        onClick={onClick}
        animation={complaint.severity === 'High' ? window.google.maps.Animation.DROP : null}
      />

      {isSelected && (
        <InfoWindow
          position={{ lat: complaint.lat, lng: complaint.lng }}
          onCloseClick={onCloseInfo}
        >
          <div className="p-3 min-w-[250px]">
            <div className="flex items-start gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                complaint.severity === 'High' ? 'bg-red-100' :
                complaint.severity === 'Medium' ? 'bg-amber-100' :
                'bg-blue-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  complaint.severity === 'High' ? 'text-red-600' :
                  complaint.severity === 'Medium' ? 'text-amber-600' :
                  'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900 mb-1">Citizen Report</h3>
                <span className="text-xs text-gray-500">{getTimeAgo(complaint.created_at)}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 text-xs uppercase tracking-wide">Complaint #</span>
                <div className="font-mono text-blue-600 font-semibold">{complaint.complaintNumber}</div>
              </div>

              <div>
                <span className="text-gray-600 text-xs uppercase tracking-wide">Issue Type</span>
                <div className="font-semibold text-slate-900">{complaint.issueType}</div>
              </div>
              
              <div>
                <span className="text-gray-600 text-xs uppercase tracking-wide">Severity</span>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    complaint.severity === 'High' ? 'bg-red-100 text-red-700' :
                    complaint.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {complaint.severity}
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600 text-xs uppercase tracking-wide">Description</span>
                <div className="text-slate-900 text-sm mt-1">{complaint.description}</div>
              </div>

              {complaint.name && (
                <div>
                  <span className="text-gray-600 text-xs uppercase tracking-wide">Reported By</span>
                  <div className="text-slate-900">{complaint.name}</div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <span className={`inline-flex items-center gap-1 text-xs ${
                  complaint.status === 'pending' ? 'text-amber-600' : 
                  complaint.status === 'in-progress' ? 'text-blue-600' :
                  complaint.status === 'resolved' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    complaint.status === 'pending' ? 'bg-amber-500' : 
                    complaint.status === 'in-progress' ? 'bg-blue-500' :
                    complaint.status === 'resolved' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}></div>
                  Status: {complaint.status}
                </span>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default ComplaintMarker;

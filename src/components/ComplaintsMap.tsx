/**
 * Complaints Map Visualization
 * Displays real-time complaint locations with color-coded severity markers
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import { motion } from "motion/react";
import { firebaseService, ComplaintReport } from "../services/firebaseService";
import {
  createComplaintMarkerIcon,
  createComplaintPopupContent,
  getMarkerColorBySeverity,
  filterComplaintsBySeverity,
  filterComplaintsByStatus,
} from "../services/mapUtils";
import { Loader2, AlertTriangle } from "lucide-react";

interface ComplaintsMapProps {
  height?: string;
  showFilters?: boolean;
}

export const ComplaintsMap: React.FC<ComplaintsMapProps> = ({
  height = "500px",
  showFilters = true,
}) => {
  const [complaints, setComplaints] = useState<ComplaintReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverities, setFilterSeverities] = useState<
    ("low" | "moderate" | "high")[]
  >(["low", "moderate", "high"]);
  const [filterStatuses, setFilterStatuses] = useState<
    ("pending" | "assigned" | "resolved")[]
  >(["pending", "assigned"]);

  // Subscribe to real-time complaints
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const startSubscription = async () => {
      try {
        setIsLoading(true);
        // Ensure Firebase is initialized before subscribing
        await firebaseService.initialize();
        
        if (!isMounted) return;

        unsubscribe = firebaseService.subscribeToComplaints((data) => {
          if (isMounted) {
            setComplaints(data);
            setError(null);
            setIsLoading(false);
          }
        });
      } catch (err) {
        if (isMounted) {
          console.error("Error subscribing to complaints:", err);
          setError("Failed to load map data. Please check your connection.");
          setIsLoading(false);
        }
      }
    };

    startSubscription();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Filter complaints based on selected filters
  const filteredComplaints = useMemo(() => {
    let filtered = complaints;

    filtered = filterComplaintsBySeverity(filtered, filterSeverities as any);
    filtered = filterComplaintsByStatus(filtered, filterStatuses as any);

    return filtered;
  }, [complaints, filterSeverities, filterStatuses]);

  const toggleSeverityFilter = (severity: "low" | "moderate" | "high") => {
    setFilterSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity],
    );
  };

  const toggleStatusFilter = (status: "pending" | "assigned" | "resolved") => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  if (error && !complaints.length) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">
              Filter by Severity
            </h4>
            <div className="flex gap-2 flex-wrap">
              {(["high", "moderate", "low"] as const).map((severity) => (
                <button
                  key={severity}
                  onClick={() => toggleSeverityFilter(severity)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterSeverities.includes(severity)
                      ? severity === "high"
                        ? "bg-red-600 text-white"
                        : severity === "moderate"
                          ? "bg-orange-600 text-white"
                          : "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {severity === "high" && "🔴"}{" "}
                  {severity === "moderate" && "🟠"} {severity === "low" && "🟢"}{" "}
                  {severity.charAt(0).toUpperCase() +
                    severity.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">
              Filter by Status
            </h4>
            <div className="flex gap-2 flex-wrap">
              {(["pending", "assigned"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatuses.includes(status)
                      ? status === "pending"
                        ? "bg-yellow-600 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status === "pending" && "⏳"} {status === "assigned" && "👥"}{" "}
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        style={{ height }}
        className="rounded-lg overflow-hidden border border-gray-200 relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-700 text-sm">Loading map...</p>
            </div>
          </div>
        )}

        {complaints.length > 0 && (
          <MapContainer
            center={[complaints[0].lat || 19.076, complaints[0].lng || 72.8777]}
            zoom={12}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Complaint Markers */}
            {filteredComplaints.map((complaint) => (
              <Marker
                key={complaint.id}
                position={[complaint.lat, complaint.lng]}
                icon={createComplaintMarkerIcon(
                  complaint.severity,
                  complaint.status,
                )}
              >
                <Popup
                  closeButton={true}
                  maxWidth={300}
                  className="complaint-popup"
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: createComplaintPopupContent(complaint),
                    }}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {!isLoading && complaints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">
                No complaints to display
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <StatBox
          label="Total"
          value={filteredComplaints.length}
          color="bg-blue-100 text-blue-700"
        />
        <StatBox
          label="High Priority"
          value={filteredComplaints.filter((c) => c.severity === "high").length}
          color="bg-red-100 text-red-700"
        />
        <StatBox
          label="Moderate"
          value={
            filteredComplaints.filter((c) => c.severity === "moderate").length
          }
          color="bg-orange-100 text-orange-700"
        />
        <StatBox
          label="Low Priority"
          value={filteredComplaints.filter((c) => c.severity === "low").length}
          color="bg-green-100 text-green-700"
        />
      </div>
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color }) => (
  <div className={`${color} rounded-lg p-3 text-center`}>
    <p className="text-xs font-semibold opacity-75">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

/**
 * Map Integration Utilities
 * Handles complaint markers and map rendering
 * @license SPDX-License-Identifier: Apache-2.0
 */

import L from "leaflet";
import { ComplaintReport } from "./firebaseService";

/**
 * Get marker color based on severity
 */
export function getMarkerColorBySeverity(
  severity: "low" | "moderate" | "high",
): string {
  switch (severity) {
    case "high":
      return "#EF4444"; // Red
    case "moderate":
      return "#F97316"; // Orange
    case "low":
      return "#22C55E"; // Green
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Create custom marker icon for complaint
 */
export function createComplaintMarkerIcon(
  severity: "low" | "moderate" | "high",
  status: "pending" | "assigned" | "resolved",
): L.DivIcon {
  const color = getMarkerColorBySeverity(severity);
  const isResolved = status === "resolved";

  const html = `
    <div style="
      width: 50px;
      height: 50px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ${isResolved ? "opacity: 0.6;" : ""}
      position: relative;
      cursor: pointer;
    ">
      <div style="
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-center;
      ">
        ${getSeverityIcon(severity)}
      </div>
      ${isResolved ? '<div style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background: #22C55E; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-center; font-size: 12px; font-weight: bold; color: white;">✓</div>' : ""}
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [50, 50],
    className: "complaint-marker",
  });
}

/**
 * Get SVG icon for severity level
 */
function getSeverityIcon(severity: "low" | "moderate" | "high"): string {
  switch (severity) {
    case "high":
      return "!"; // Exclamation for high severity
    case "moderate":
      return "△"; // Triangle for moderate
    case "low":
      return "✓"; // Checkmark for low
    default:
      return "?";
  }
}

/**
 * Create popup content for complaint marker
 */
export function createComplaintPopupContent(
  complaint: ComplaintReport,
): string {
  const statusColor = getStatusColorForPopup(complaint.status);
  const severityLabel = getSeverityLabelForPopup(complaint.severity);
  const categoryLabel = getCategoryLabelForPopup(complaint.category);
  const timeAgo = formatTimeAgo(complaint.createdAt);

  return `
    <div style="width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="margin-bottom: 8px;">
        <strong style="font-size: 14px; color: #1F2937;">${complaint.name}</strong>
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
        <div><strong>Category:</strong> ${categoryLabel}</div>
        <div><strong>Water Level:</strong> ${complaint.waterLevel}</div>
        <div><strong>Location:</strong> ${complaint.location}</div>
        <div><strong>Phone:</strong> ${complaint.phone}</div>
      </div>
      <div style="margin-bottom: 8px;">
        <p style="margin: 0; font-size: 11px; color: #6B7280; line-height: 1.4; max-height: 50px; overflow: hidden;">
          ${complaint.description}
        </p>
      </div>
      <div style="display: flex; gap: 6px; font-size: 11px; margin-bottom: 8px;">
        <span style="background: ${statusColor.bg}; color: ${statusColor.text}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${statusColor.border};">
          ${complaint.status}
        </span>
        <span style="background: ${getSeverityBackgroundColor(complaint.severity)}; color: ${getSeverityTextColor(complaint.severity)}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${getSeverityBorderColor(complaint.severity)};">
          ${severityLabel}
        </span>
      </div>
      <div style="font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 6px;">
        ${timeAgo}
        ${complaint.assignedTo ? `<br />Assigned to: ${complaint.assignedTo}` : ""}
      </div>
    </div>
  `;
}

/**
 * Get status color for popup
 */
function getStatusColorForPopup(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "pending":
      return {
        bg: "#FEF08A",
        text: "#92400E",
        border: "#FCD34D",
      };
    case "assigned":
      return {
        bg: "#DBEAFE",
        text: "#1E40AF",
        border: "#93C5FD",
      };
    case "resolved":
      return {
        bg: "#DCFCE7",
        text: "#166534",
        border: "#86EFAC",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#374151",
        border: "#E5E7EB",
      };
  }
}

/**
 * Get severity label for popup
 */
function getSeverityLabelForPopup(severity: string): string {
  switch (severity) {
    case "high":
      return "HIGH PRIORITY";
    case "moderate":
      return "MODERATE";
    case "low":
      return "LOW PRIORITY";
    default:
      return "UNKNOWN";
  }
}

/**
 * Get category label for popup
 */
function getCategoryLabelForPopup(category: string): string {
  const labels: Record<string, string> = {
    surface_flooding: "Surface Flooding",
    blockage: "Blockage",
    broken_pipe: "Broken Pipe",
    overflow: "Overflow",
    other: "Other",
  };
  return labels[category] || category;
}

/**
 * Format time ago for popup
 */
function formatTimeAgo(timestamp: any): string {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get severity background color
 */
function getSeverityBackgroundColor(severity: string): string {
  switch (severity) {
    case "high":
      return "#FEE2E2";
    case "moderate":
      return "#FFEDD5";
    case "low":
      return "#DCFCE7";
    default:
      return "#F3F4F6";
  }
}

/**
 * Get severity text color
 */
function getSeverityTextColor(severity: string): string {
  switch (severity) {
    case "high":
      return "#991B1B";
    case "moderate":
      return "#9A3412";
    case "low":
      return "#166534";
    default:
      return "#374151";
  }
}

/**
 * Get severity border color
 */
function getSeverityBorderColor(severity: string): string {
  switch (severity) {
    case "high":
      return "#FECACA";
    case "moderate":
      return "#FBDDD0";
    case "low":
      return "#BBEF63";
    default:
      return "#E5E7EB";
  }
}

/**
 * Filter complaints by severity level on map
 */
export function filterComplaintsBySeverity(
  complaints: ComplaintReport[],
  severities: ("low" | "moderate" | "high")[],
): ComplaintReport[] {
  return complaints.filter((complaint) =>
    severities.includes(complaint.severity),
  );
}

/**
 * Filter complaints by status on map
 */
export function filterComplaintsByStatus(
  complaints: ComplaintReport[],
  statuses: ("pending" | "assigned" | "resolved")[],
): ComplaintReport[] {
  return complaints.filter((complaint) => statuses.includes(complaint.status));
}

/**
 * Get bounds for all complaint markers
 */
export function getComplaintsBounds(
  complaints: ComplaintReport[],
): { south: number; west: number; north: number; east: number } | null {
  if (complaints.length === 0) return null;

  let minLat = complaints[0].lat;
  let maxLat = complaints[0].lat;
  let minLng = complaints[0].lng;
  let maxLng = complaints[0].lng;

  complaints.forEach((complaint) => {
    minLat = Math.min(minLat, complaint.lat);
    maxLat = Math.max(maxLat, complaint.lat);
    minLng = Math.min(minLng, complaint.lng);
    maxLng = Math.max(maxLng, complaint.lng);
  });

  return {
    south: minLat,
    west: minLng,
    north: maxLat,
    east: maxLng,
  };
}

/**
 * Report Tracking Utilities
 * Handles tracking user complaints by phone or ID
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { firebaseService, ComplaintReport } from "./firebaseService";

export interface TrackingResult {
  success: boolean;
  complaints: ComplaintReport[];
  error?: string;
}

/**
 * Track report by phone number
 */
export async function trackReportByPhone(
  phone: string,
): Promise<TrackingResult> {
  try {
    // Validate phone
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return {
        success: false,
        complaints: [],
        error: "Please enter a valid 10-digit phone number",
      };
    }

    // Fetch from Firestore
    const complaints = await firebaseService.getComplaintsByPhone(cleanPhone);

    if (complaints.length === 0) {
      return {
        success: false,
        complaints: [],
        error: "No reports found for this phone number",
      };
    }

    return {
      success: true,
      complaints: complaints.sort((a, b) => {
        const aTime = (a.createdAt as any)?.toMillis?.() || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || 0;
        return bTime - aTime;
      }),
    };
  } catch (error) {
    console.error("Error tracking report by phone:", error);
    return {
      success: false,
      complaints: [],
      error: "Failed to retrieve reports. Please try again.",
    };
  }
}

/**
 * Track report by ID
 */
export async function trackReportById(id: string): Promise<TrackingResult> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        complaints: [],
        error: "Please enter a report ID",
      };
    }

    const complaint = await firebaseService.getComplaintById(id);

    if (!complaint) {
      return {
        success: false,
        complaints: [],
        error: "Report not found with this ID",
      };
    }

    return {
      success: true,
      complaints: [complaint],
    };
  } catch (error) {
    console.error("Error tracking report by ID:", error);
    return {
      success: false,
      complaints: [],
      error: "Failed to retrieve report. Please try again.",
    };
  }
}

/**
 * Subscribe to real-time updates for a tracked report
 */
export function subscribeToReportUpdates(
  phone: string,
  callback: (complaints: ComplaintReport[]) => void,
  onError?: (error: string) => void,
): () => void {
  try {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      onError?.("Invalid phone number");
      return () => {};
    }

    const unsubscribe = firebaseService.subscribeToComplaintsByPhone(
      cleanPhone,
      callback,
    );
    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to updates:", error);
    onError?.("Failed to subscribe to updates");
    return () => {};
  }
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: "pending" | "assigned" | "resolved"): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    case "assigned":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "resolved":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}

/**
 * Get severity badge color
 */
export function getSeverityBadgeColor(severity: "low" | "moderate" | "high"): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case "high":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "moderate":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    case "low":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}

/**
 * Get estimated resolution time based on severity
 */
export function getEstimatedResolutionTime(severity: string): string {
  switch (severity) {
    case "high":
      return "2-4 hours";
    case "moderate":
      return "4-8 hours";
    case "low":
      return "24-48 hours";
    default:
      return "TBD";
  }
}

/**
 * Format elapsed time since report creation
 */
export function formatElapsedTime(timestamp: any): string {
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

  if (diffMins < 1) return "0 mins";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""}`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
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
 * Get water level label
 */
export function getWaterLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    ankle: "Ankle Level",
    knee: "Knee Level",
    waist: "Waist Level",
    neck: "Neck Level",
    head: "Head Level",
  };
  return labels[level] || level;
}

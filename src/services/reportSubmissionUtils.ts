/**
 * Report Submission Utilities
 * Handles form validation, image upload, and report creation
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { firebaseService, ComplaintReport } from "./firebaseService";

export interface ReportFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  issueType:
    | "surface_flooding"
    | "blockage"
    | "broken_pipe"
    | "overflow"
    | "other";
  waterLevel: "ankle" | "knee" | "waist" | "neck" | "head";
  description: string;
  image: File | null;
  latitude: number;
  longitude: number;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate report form data
 */
export function validateReportForm(formData: ReportFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = "Name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
    errors.phone = "Valid 10-digit phone number required";
  }

  // Address validation
  if (!formData.address?.trim()) {
    errors.address = "Address is required";
  }

  // City validation
  if (!formData.city?.trim()) {
    errors.city = "City is required";
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  // Image validation
  if (!formData.image) {
    errors.image = "Image is required";
  } else {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(formData.image.type)) {
      errors.image = "Image must be JPEG, PNG, or WebP";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (formData.image.size > maxSize) {
      errors.image = "Image must be less than 5MB";
    }
  }

  // Coordinates validation
  if (
    typeof formData.latitude !== "number" ||
    typeof formData.longitude !== "number"
  ) {
    errors.location = "Invalid location coordinates";
  }

  return errors;
}

/**
 * Submit report to Firebase
 * Uploads image and creates Firestore document
 */
export async function submitReportToFirebase(
  formData: ReportFormData,
  onProgress?: (progress: string) => void,
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    // Validate form
    const errors = validateReportForm(formData);
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        error: Object.values(errors).join(", "),
      };
    }

    // Check if Firebase is initialized, try to initialize if not
    if (!firebaseService.isInitialized()) {
      await firebaseService.initialize();
    }

    if (!firebaseService.isInitialized()) {
      return {
        success: false,
        error: "Firebase service not initialized",
      };
    }

    onProgress?.("Uploading image...");

    // Process image with watermark (GPS + Timestamp)
    let processedImage = formData.image!;
    try {
      onProgress?.("Processing forensic watermark...");
      processedImage = await processImageWithWatermark(
        formData.image!,
        formData.latitude,
        formData.longitude,
        formData.address
      );
    } catch (processError) {
      console.warn("Watermarking failed, uploading original:", processError);
    }

    // Upload image
    const timestamp = Date.now();
    const imagePath = `complaints/${timestamp}-${formData.phone}`;
    let imageUrl = "";

    try {
      imageUrl = await firebaseService.uploadImage(processedImage, imagePath);
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }

    if (!imageUrl) {
      return {
        success: false,
        error: "Failed to get image URL",
      };
    }

    // Generate a unique reference ID
    const referenceId = generateReportId();
    const now = new Date();

    onProgress?.("Storing report...");

    // Create complaint object
    const complaint: Omit<ComplaintReport, "id" | "createdAt"> = {
      referenceId,
      userId: `user-${timestamp}`,
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      location: formData.address.trim(),
      lat: formData.latitude,
      lng: formData.longitude,
      category: formData.issueType,
      waterLevel: formData.waterLevel,
      description: formData.description.trim(),
      imageUrl,
      status: "pending",
      severity: "low",
      assignedTo: null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      trustScore: 75, // Default trust score
      timeline: [
        {
          status: "pending",
          timestamp: now,
          message: "Report submitted by citizen via mobile portal",
        },
      ],
    };

    // Submit to Firestore
    const reportId = await firebaseService.submitComplaint(complaint);

    onProgress?.("Report submitted successfully!");

    return {
      success: true,
      reportId: referenceId, // Return the reference ID for the user
    };
  } catch (error) {
    console.error("Error submitting report:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit report",
    };
  }
}

/**
 * Generate a user-friendly report ID for display
 */
export function generateReportId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `JAL-${timestamp}-${random}`;
}

/**
 * processImageWithWatermark - Embeds dynamic GPS coordinates and timestamp onto the image
 */
export async function processImageWithWatermark(
  file: File,
  lat: number,
  lng: number,
  label: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        // Maintain original quality and dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Watermark styling
        const fontSize = Math.max(20, Math.floor(canvas.width / 40));
        const padding = fontSize * 0.8;
        const lineHeight = fontSize * 1.2;
        
        ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        
        const dateStr = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        
        const lines = [
          `JALRAKSHAK 2.0 | REAL-TIME VERIFIED`,
          `TIMESTAMP: ${dateStr}`,
          `LATITUDE: ${lat.toFixed(6)}`,
          `LONGITUDE: ${lng.toFixed(6)}`,
          `LOCATION: ${label.slice(0, 50)}${label.length > 50 ? "..." : ""}`
        ];

        // Draw background overlay for legibility
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        const rectHeight = (lines.length * lineHeight) + (padding * 2);
        ctx.fillRect(0, canvas.height - rectHeight, canvas.width, rectHeight);

        // Draw text
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        
        lines.forEach((line, i) => {
          ctx.fillText(
            line, 
            padding, 
            canvas.height - rectHeight + padding + (i * lineHeight) + (fontSize * 0.8)
          );
        });

        canvas.toBlob((blob) => {
          if (blob) {
            const watermarkedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(watermarkedFile);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, "image/jpeg", 0.85); // High quality JPEG
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

/**
 * Format Firestore timestamp for display
 */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp.toDate) {
    // Firestore Timestamp
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
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get severity color for markers/badges
 */
export function getSeverityColor(
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
 * Get severity name
 */
export function getSeverityLabel(
  severity: "low" | "moderate" | "high",
): string {
  switch (severity) {
    case "high":
      return "High Priority";
    case "moderate":
      return "Moderate";
    case "low":
      return "Low Priority";
    default:
      return "Unknown";
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "assigned":
      return "Assigned to Team";
    case "resolved":
      return "Resolved";
    default:
      return "Unknown";
  }
}

/**
 * Calculate distance between two coordinates (km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

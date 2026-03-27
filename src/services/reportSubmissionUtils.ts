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
  logTime?: string;
  reporterName?: string;
  reporterPhone?: string;
  reporterAddress?: string;
  uploadTimestamp?: string;
  referenceId?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

const WATERMARK_TIMEZONE = "Asia/Kolkata";

const formatIstTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: WATERMARK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for watermarking"));
    };
    image.src = objectUrl;
  });

const canvasToFile = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType: string,
): Promise<File> => {
  const quality = mimeType === "image/png" ? undefined : 0.92;
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error("Failed to export watermarked image");
  }

  return new File([blob], fileName, {
    type: mimeType,
    lastModified: Date.now(),
  });
};

type BlankImageCheckResult = {
  isInvalid: boolean;
  reason?: string;
  trustScore: number;
};

async function detectBlankOrLowDetailImage(
  originalFile: File,
): Promise<BlankImageCheckResult> {
  const image = await loadImageElement(originalFile);

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = Math.max(32, Math.min(256, image.naturalWidth || image.width));
  sampleCanvas.height = Math.max(32, Math.min(256, image.naturalHeight || image.height));

  const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      isInvalid: true,
      reason: "Unable to validate image",
      trustScore: 0,
    };
  }

  ctx.drawImage(image, 0, 0, sampleCanvas.width, sampleCanvas.height);
  const { data, width, height } = ctx.getImageData(
    0,
    0,
    sampleCanvas.width,
    sampleCanvas.height,
  );

  const totalPixels = width * height;
  if (!totalPixels) {
    return {
      isInvalid: true,
      reason: "Empty image",
      trustScore: 0,
    };
  }

  let transparentPixels = 0;
  let sum = 0;
  let sumSq = 0;
  let minLum = 255;
  let maxLum = 0;
  const luminance = new Float32Array(totalPixels);

  for (let i = 0, px = 0; i < data.length; i += 4, px++) {
    const alpha = data[i + 3];
    if (alpha < 12) {
      transparentPixels++;
      luminance[px] = 0;
      continue;
    }

    const lum =
      0.299 * data[i] +
      0.587 * data[i + 1] +
      0.114 * data[i + 2];
    luminance[px] = lum;
    sum += lum;
    sumSq += lum * lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const visiblePixels = totalPixels - transparentPixels;
  if (visiblePixels <= 0) {
    return {
      isInvalid: true,
      reason: "Image appears fully transparent",
      trustScore: 0,
    };
  }

  const mean = sum / visiblePixels;
  const variance = Math.max(0, sumSq / visiblePixels - mean * mean);
  const stdDev = Math.sqrt(variance);
  const range = maxLum - minLum;

  let strongEdges = 0;
  let comparisons = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = y * width + x;
      const lum = luminance[idx];
      const diffX = Math.abs(lum - luminance[idx + 1]);
      const diffY = Math.abs(lum - luminance[idx + width]);
      if (diffX > 16 || diffY > 16) {
        strongEdges++;
      }
      comparisons++;
    }
  }

  const edgeRatio = comparisons > 0 ? strongEdges / comparisons : 0;
  const visibleRatio = visiblePixels / totalPixels;

  if (visibleRatio < 0.2) {
    return {
      isInvalid: true,
      reason: "Image appears mostly transparent",
      trustScore: 0,
    };
  }

  // Reject near-solid or near-empty visuals that do not carry usable evidence.
  if (range < 14 && stdDev < 6) {
    return {
      isInvalid: true,
      reason: "Image appears blank or near-solid",
      trustScore: 0,
    };
  }

  if (edgeRatio < 0.003 && stdDev < 10) {
    return {
      isInvalid: true,
      reason: "Image has too little visual detail",
      trustScore: 0,
    };
  }

  let trustScore = 100;
  if (range < 22) trustScore -= 15;
  if (stdDev < 14) trustScore -= 15;
  if (edgeRatio < 0.01) trustScore -= 18;
  if (visibleRatio < 0.6) trustScore -= 8;

  trustScore = Math.max(45, Math.min(100, Math.round(trustScore)));
  return { isInvalid: false, trustScore };
}

async function createWatermarkedImage(
  originalFile: File,
  latitude: number,
  longitude: number,
): Promise<File> {
  const image = await loadImageElement(originalFile);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const safeWidth = Math.max(canvas.width, 1);
  const fontSize = Math.max(14, Math.round(safeWidth * 0.018));
  const lineHeight = Math.round(fontSize * 1.35);
  const padding = Math.max(10, Math.round(fontSize * 0.75));

  const watermarkLines = [
    "JalRakshak",
    `Date/Time (IST): ${formatIstTimestamp(new Date())}`,
    `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
  ];

  ctx.font = `700 ${fontSize}px Arial`;
  const maxTextWidth = Math.max(
    ...watermarkLines.map((line) => ctx.measureText(line).width),
  );

  const boxWidth = Math.min(safeWidth - padding * 2, Math.ceil(maxTextWidth + padding * 2));
  const boxHeight = watermarkLines.length * lineHeight + padding * 2;
  const boxX = padding;
  const boxY = Math.max(padding, canvas.height - boxHeight - padding);

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";

  watermarkLines.forEach((line, index) => {
    const y = boxY + padding + index * lineHeight;
    ctx.fillText(line, boxX + padding, y);
  });

  const outputType = ["image/jpeg", "image/png", "image/webp"].includes(originalFile.type)
    ? originalFile.type
    : "image/jpeg";
  const outputName = originalFile.name.replace(/\.[^.]+$/, "") + "-wm." + (outputType.split("/")[1] || "jpg");

  return canvasToFile(canvas, outputName, outputType);
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

  // Reporter Address validation
  if (!formData.reporterAddress?.trim()) {
    errors.reporterAddress = "Reporter address is required";
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

    onProgress?.("Validating uploaded image...");
    let trustScore = 100;
    try {
      const blankCheck = await detectBlankOrLowDetailImage(formData.image!);
      if (blankCheck.isInvalid) {
        return {
          success: false,
          error:
            "Photo is not a valid photo. Please upload a clear, non-blank image.",
        };
      }
      trustScore = blankCheck.trustScore;
    } catch (imageValidationError) {
      console.warn("Image validation failed", imageValidationError);
      return {
        success: false,
        error: "Unable to validate image. Please upload a valid photo.",
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

    // Start transmission
    // Imprint contextual evidence details onto image before upload.
    let processedImage = formData.image!;
    try {
      onProgress?.("Stamping image with watermark...");
      processedImage = await createWatermarkedImage(
        formData.image!,
        formData.latitude,
        formData.longitude,
      );
    } catch (watermarkError) {
      console.warn("Watermark processing failed, uploading original image", watermarkError);
      trustScore = Math.max(0, trustScore - 8);
    }

    onProgress?.(`Trust score assessed: ${trustScore}/100`);

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

    // Generate a unique reference ID if not provided
    const referenceId = formData.referenceId || generateReportId();
    const now = new Date();

    // Finalizing

    // Calculate severity based on water level
    let severity: "low" | "moderate" | "high" = "low";
    if (formData.waterLevel === "head" || formData.waterLevel === "neck") {
      severity = "high";
    } else if (formData.waterLevel === "waist" || formData.waterLevel === "knee") {
      severity = "moderate";
    }

    // Create complaint object
    const complaint: ComplaintReport = {
      referenceId,
      userId: `user-${timestamp}`,
      
      // Admin Schema (MANDATORY)
      reporterName: formData.reporterName?.trim() || formData.name.trim() || "Anonymous Reporter",
      reporterPhone: formData.reporterPhone || formData.phone.replace(/\D/g, ""),
      reporterAddress: formData.reporterAddress || formData.address.trim(),
      uploadTimestamp: formData.uploadTimestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),

      name: formData.name.trim() || "Anonymous Reporter",
      phone: formData.phone.replace(/\D/g, ""),
      location: formData.address.trim(),
      lat: formData.latitude,
      lng: formData.longitude,
      category: formData.issueType,
      waterLevel: formData.waterLevel,
      description: formData.description.trim(),
      imageUrl,
      status: "pending",
      severity: severity,
      createdAt: new Date().toISOString(),
      assignedTo: null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      trustScore,
      timeline: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          message: "Tactical Incident Record Created",
          user: "System (Automation)"
        }
      ],
    };

    // Submit to Firestore
    const reportId = await firebaseService.submitComplaint(complaint);

    // Done

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
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let idArr = [];
  
  // 3 chars for sector/prefix
  for (let i = 0; i < 3; i++) idArr.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  const part1 = idArr.join("");
  
  idArr = [];
  // 3 chars for second part
  for (let i = 0; i < 3; i++) idArr.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  const part2 = idArr.join("");
  
  return `JAL-${part1}-${part2}`; // Exactly 11 characters (JAL(3) + -(1) + 3 + -(1) + 3)
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

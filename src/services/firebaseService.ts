/**
 * Firebase Service for JalRakshak
 * Handles Firestore integration, image uploads, and real-time synchronization
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  Firestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  Unsubscribe,
  Timestamp,
  runTransaction,
  DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasRequiredFirebaseConfig = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
  );
};

// Types
export interface ComplaintReport {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  category:
    | "surface_flooding"
    | "blockage"
    | "broken_pipe"
    | "overflow"
    | "other";
  waterLevel: "ankle" | "knee" | "waist" | "neck" | "head";
  description: string;
  imageUrl: string;
  status: "pending" | "assigned" | "resolved";
  severity: "low" | "moderate" | "high";
  assignedTo: string | null;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface FirebaseService {
  db: Firestore | null;
  storage: any;
  initialized: boolean;
}

class JalRakshakFirebase {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private storage: any = null;
  private initialized: boolean = false;
  private listeners: Map<string, Unsubscribe> = new Map();

  /**
   * Initialize Firebase app and services
   */
  async initialize(): Promise<boolean> {
    try {
      if (!hasRequiredFirebaseConfig()) {
        console.error(
          "Missing Firebase env vars. Set VITE_FIREBASE_* in .env.local before starting the app.",
        );
        return false;
      }

      // Check if Firebase app already exists
      if (getApps().length > 0) {
        this.app = getApp();
      } else {
        this.app = initializeApp(firebaseConfig);
      }

      this.db = initializeFirestore(this.app, {
        experimentalAutoDetectLongPolling: true,
      });
      this.storage = getStorage(this.app);
      this.initialized = true;
      console.log("Firebase initialized successfully");
      return true;
    } catch (error) {
      console.error("Firebase initialization error:", error);
      return false;
    }
  }

  /**
   * Upload image to Firebase Storage
   * @param file The image file to upload
   * @param path Storage path (e.g., 'complaints/report-id')
   * @returns URL of uploaded image or null on failure
   */
  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      if (!this.storage) {
        throw new Error("Firebase Storage not initialized");
      }

      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  }

  /**
   * Submit a new complaint report
   */
  async submitComplaint(
    complaint: Omit<ComplaintReport, "id" | "createdAt">,
  ): Promise<string> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const complaintData = {
        ...complaint,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        severity: this.calculateSeverity(
          complaint.waterLevel,
          complaint.category,
        ),
      };

      const docRef = await addDoc(
        collection(this.db, "complaints"),
        complaintData,
      );
      return docRef.id;
    } catch (error) {
      console.error("Error submitting complaint:", error);
      throw error;
    }
  }

  /**
   * Get all complaints (for admin dashboard)
   */
  async getAllComplaints(): Promise<ComplaintReport[]> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const querySnapshot = await getDocs(collection(this.db, "complaints"));
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ComplaintReport,
      );
    } catch (error) {
      console.error("Error fetching complaints:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates of all complaints
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  subscribeToComplaints(
    callback: (complaints: ComplaintReport[]) => void,
  ): Unsubscribe {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const q = query(collection(this.db, "complaints"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const complaints = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as ComplaintReport,
        );

        // Sort by createdAt descending
        complaints.sort((a, b) => {
          const aTime = (a.createdAt as Timestamp)?.toMillis?.() || 0;
          const bTime = (b.createdAt as Timestamp)?.toMillis?.() || 0;
          return bTime - aTime;
        });

        callback(complaints);
      });

      this.listeners.set("allComplaints", unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to complaints:", error);
      throw error;
    }
  }

  /**
   * Query complaints by phone number
   */
  async getComplaintsByPhone(phone: string): Promise<ComplaintReport[]> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const q = query(
        collection(this.db, "complaints"),
        where("phone", "==", phone),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ComplaintReport,
      );
    } catch (error) {
      console.error("Error querying complaints by phone:", error);
      throw error;
    }
  }

  /**
   * Get complaint by ID
   */
  async getComplaintById(id: string): Promise<ComplaintReport | null> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const docRef = doc(this.db, "complaints", id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as ComplaintReport;
    } catch (error) {
      console.error("Error fetching complaint by ID:", error);
      throw error;
    }
  }

  /**
   * Update complaint status (admin function)
   */
  async updateComplaintStatus(
    complaintId: string,
    status: "pending" | "assigned" | "resolved",
    assignedTo?: string,
  ): Promise<void> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const docRef = doc(this.db, "complaints", complaintId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating complaint status:", error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates of a specific complaint
   */
  subscribeToComplaint(
    complaintId: string,
    callback: (complaint: ComplaintReport | null) => void,
  ): Unsubscribe {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const docRef = doc(this.db, "complaints", complaintId);
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback({
            id: snapshot.id,
            ...snapshot.data(),
          } as ComplaintReport);
        } else {
          callback(null);
        }
      });

      this.listeners.set(`complaint-${complaintId}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to complaint:", error);
      throw error;
    }
  }

  /**
   * Subscribe to complaints by phone
   */
  subscribeToComplaintsByPhone(
    phone: string,
    callback: (complaints: ComplaintReport[]) => void,
  ): Unsubscribe {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const q = query(
        collection(this.db, "complaints"),
        where("phone", "==", phone),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const complaints = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as ComplaintReport,
        );

        // Sort by createdAt descending
        complaints.sort((a, b) => {
          const aTime = (a.createdAt as Timestamp)?.toMillis?.() || 0;
          const bTime = (b.createdAt as Timestamp)?.toMillis?.() || 0;
          return bTime - aTime;
        });

        callback(complaints);
      });

      this.listeners.set(`phone-${phone}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to complaints by phone:", error);
      throw error;
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(imagePath: string): Promise<void> {
    try {
      if (!this.storage) {
        throw new Error("Firebase Storage not initialized");
      }

      const imageRef = ref(this.storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Calculate severity based on water level and category
   */
  private calculateSeverity(
    waterLevel: string,
    category: string,
  ): "low" | "moderate" | "high" {
    const highWaterLevels = ["waist", "neck", "head"];
    const criticalCategories = ["overflow", "blockage"];

    if (
      highWaterLevels.includes(waterLevel) ||
      criticalCategories.includes(category)
    ) {
      return "high";
    }

    const mediumWaterLevels = ["knee"];
    if (mediumWaterLevels.includes(waterLevel)) {
      return "moderate";
    }

    return "low";
  }

  /**
   * Unsubscribe from a listener
   */
  unsubscribe(listenerKey: string): void {
    const unsubscribe = this.listeners.get(listenerKey);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerKey);
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Return aggregate visitor count from Firestore analytics document.
   */
  async getVisitorCount(): Promise<number> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const metricsRef = doc(this.db, "analytics", "visitors");
      const snapshot = await getDoc(metricsRef);
      if (!snapshot.exists()) {
        return 0;
      }

      const data = snapshot.data() as DocumentData;
      return Number(data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching visitor count:", error);
      throw error;
    }
  }

  /**
   * Record one unique visitor session and update aggregate count atomically.
   */
  async recordVisitorVisit(
    sessionId: string,
    metadata: Record<string, string> = {},
  ): Promise<number> {
    try {
      if (!this.db) {
        throw new Error("Firestore not initialized");
      }

      const metricsRef = doc(this.db, "analytics", "visitors");
      const sessionRef = doc(this.db, "visitor_sessions", sessionId);

      const nextCount = await runTransaction(this.db, async (transaction) => {
        const [metricsSnap, sessionSnap] = await Promise.all([
          transaction.get(metricsRef),
          transaction.get(sessionRef),
        ]);

        const currentCount = metricsSnap.exists()
          ? Number((metricsSnap.data() as DocumentData).totalCount || 0)
          : 0;

        if (sessionSnap.exists()) {
          return currentCount;
        }

        const updatedCount = currentCount + 1;

        transaction.set(
          sessionRef,
          {
            sessionId,
            createdAt: Timestamp.now(),
            ...metadata,
          },
          { merge: true },
        );

        transaction.set(
          metricsRef,
          {
            totalCount: updatedCount,
            updatedAt: Timestamp.now(),
          },
          { merge: true },
        );

        return updatedCount;
      });

      return nextCount;
    } catch (error) {
      console.error("Error recording visitor visit:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new JalRakshakFirebase();

/**
 * Initialize Firebase on app load
 */
export async function initializeFirebase(): Promise<boolean> {
  return firebaseService.initialize();
}

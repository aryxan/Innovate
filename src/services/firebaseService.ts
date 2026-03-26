/**
 * Firebase Service for JalRakshak
 * Handles Firestore integration, image uploads, and real-time synchronization
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
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
  FirebaseStorage,
} from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
  storage: FirebaseStorage | null;
  initialized: boolean;
}

class JalRakshakFirebase {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;
  private initialized: boolean = false;
  private listeners: Map<string, Unsubscribe> = new Map();

  private initPromise: Promise<boolean> | null = null;

  /**
   * Initialize Firebase app and services
   */
  async initialize(): Promise<boolean> {
    // If already initialized and services are present, return true
    if (this.initialized && this.app && this.db) return true;

    // If currently initializing, return the same promise
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const missingVars = [];
        if (!firebaseConfig.apiKey) missingVars.push("VITE_FIREBASE_API_KEY");
        if (!firebaseConfig.authDomain) missingVars.push("VITE_FIREBASE_AUTH_DOMAIN");
        if (!firebaseConfig.projectId) missingVars.push("VITE_FIREBASE_PROJECT_ID");
        if (!firebaseConfig.storageBucket) missingVars.push("VITE_FIREBASE_STORAGE_BUCKET");
        if (!firebaseConfig.messagingSenderId) missingVars.push("VITE_FIREBASE_MESSAGING_SENDER_ID");
        if (!firebaseConfig.appId) missingVars.push("VITE_FIREBASE_APP_ID");

        if (missingVars.length > 0) {
          console.error(
            `Missing Firebase env vars: ${missingVars.join(", ")}. Set them in .env.local before starting the app.`,
          );
          this.initPromise = null;
          return false;
        }

        // Check if Firebase app already exists
        const apps = getApps();
        if (apps.length > 0) {
          this.app = apps[0];
        } else {
          this.app = initializeApp(firebaseConfig);
        }

        // Initialize Firestore with a fallback to getFirestore if already initialized
        try {
          // First attempt a clean initialization with specific settings
          this.db = initializeFirestore(this.app, {
            experimentalAutoDetectLongPolling: true,
          });
        } catch (e: any) {
          // If already initialized (common during HMR), use getFirestore
          if (e.code === 'failed-precondition' || e.message?.includes('already been initialized')) {
            this.db = getFirestore(this.app);
          } else {
            throw e;
          }
        }

        this.storage = getStorage(this.app);
        this.initialized = true;
        console.log("Firebase initialized successfully");
        return true;
      } catch (error) {
        console.error("Firebase initialization error:", error);
        this.initPromise = null;
        return false;
      }
    })();

    return this.initPromise;
  }


  /**
   * Internal helper to ensure Firebase is ready
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      const result = await this.initialize();
      if (!result) {
        throw new Error("Firebase failed to initialize. Check environment variables and console for details.");
      }
    }
    if (!this.db) {
      throw new Error("Firestore not initialized. Please check your Firebase project setup.");
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
      await this.ensureInitialized();
      if (!this.storage) {
        throw new Error("Firebase Storage not initialized. Please enable it in your Firebase console.");
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
      await this.ensureInitialized();

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
      await this.ensureInitialized();

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
        // Since this is synchronous, we can't await ensureInitialized here easily
        // but we can check the db and throw a helpful error
        throw new Error("Firestore not initialized. Call initialize() first.");
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
      await this.ensureInitialized();

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
      await this.ensureInitialized();

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
      await this.ensureInitialized();

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
        throw new Error("Firestore not initialized. Call initialize() first.");
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
        throw new Error("Firestore not initialized. Call initialize() first.");
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
      await this.ensureInitialized();
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
      await this.ensureInitialized();

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
      await this.ensureInitialized();

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

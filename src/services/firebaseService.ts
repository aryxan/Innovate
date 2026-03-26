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
  orderBy,
  limit,
  setDoc,
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
export interface TimelineLog {
  status: string;
  timestamp: any;
  message: string;
  user?: string;
}

export interface ComplaintReport {
  id?: string;
  referenceId: string;
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
  imageUrl?: string;
  status: "pending" | "assigned" | "resolved";
  severity: "low" | "moderate" | "high";
  createdAt: any;
  assignedTo?: string | null;
  city: string;
  state: string;
  pincode: string;
  trustScore?: number;
  timeline?: TimelineLog[];
}

export class JalRakshakFirebase {
  private static instance: JalRakshakFirebase;
  private app: FirebaseApp | null = null;
  public db: Firestore | null = null;
  public storage: FirebaseStorage | null = null;
  private initPromise: Promise<boolean> | null = null;

  private constructor() {}

  public static getInstance(): JalRakshakFirebase {
    if (!JalRakshakFirebase.instance) {
      JalRakshakFirebase.instance = new JalRakshakFirebase();
    }
    return JalRakshakFirebase.instance;
  }

  /**
   * Initialize Firebase application and services
   */
  public async initialize(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const missingVars = [];
        if (!import.meta.env.VITE_FIREBASE_API_KEY) missingVars.push("API_KEY");
        if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingVars.push("PROJECT_ID");
        if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) missingVars.push("AUTH_DOMAIN");

        if (missingVars.length > 0) {
          console.error(
            `Missing Firebase env vars: ${missingVars.join(", ")}. \n` +
            `Local Dev: Set them in .env.local \n` +
            `Vercel: Add them to Project Settings > Environment Variables.`,
          );
          this.initPromise = null;
          return false;
        }

        if (!getApps().length) {
          this.app = initializeApp(firebaseConfig);
        } else {
          this.app = getApp();
        }

        try {
          this.db = initializeFirestore(this.app, {
            ignoreUndefinedProperties: true,
          });
        } catch (e: any) {
          if (e.code === "failed-precondition" || e.message?.includes("already exists")) {
            this.db = getFirestore(this.app);
          } else {
            throw e;
          }
        }

        this.storage = getStorage(this.app);
        console.log("Firebase initialized successfully");
        return true;
      } catch (error) {
        console.error("Firebase failed to initialize:", error);
        this.initPromise = null;
        return false;
      }
    })();

    return this.initPromise;
  }

  private async ensureInitialized() {
    if (!this.db || !this.storage) {
      const success = await this.initialize();
      if (!success) throw new Error("Firebase service could not be started.");
    }
  }

  /**
   * Upload an image to Firebase Storage
   */
  async uploadImage(file: File, path: string): Promise<string> {
    await this.ensureInitialized();
    if (!this.storage) throw new Error("Storage not initialized");

    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  }

  /**
   * Submit a new complaint to Firestore
   */
  async submitComplaint(complaint: Omit<ComplaintReport, "id" | "createdAt">): Promise<string> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Firestore not initialized");

    const complaintsCol = collection(this.db, "complaints");
    const docRef = await addDoc(complaintsCol, {
      ...complaint,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  /**
   * Subscribe to real-time complaint updates
   */
  subscribeToComplaints(callback: (complaints: ComplaintReport[]) => void): Unsubscribe {
    if (!this.db) {
       this.initialize().then(() => {
         if (this.db) return this.subscribeToComplaints(callback);
       });
       return () => {};
    }

    const complaintsCol = collection(this.db, "complaints");
    const q = query(complaintsCol, orderBy("createdAt", "desc"), limit(100));

    return onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ComplaintReport[];
      callback(complaints);
    });
  }

  /**
   * Get complaints by phone number (for tracking)
   */
  async getComplaintsByPhone(phone: string): Promise<ComplaintReport[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Firestore not initialized");

    const complaintsCol = collection(this.db, "complaints");
    const q = query(complaintsCol, where("phone", "==", phone), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ComplaintReport[];
  }

  /**
   * Get complaint by ID
   */
  async getComplaintById(id: string): Promise<ComplaintReport | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Firestore not initialized");

    // 1. Try fetching by Firestore Document ID first
    try {
      const docRef = doc(this.db, "complaints", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ComplaintReport;
      }
    } catch (e) {
      // Ignore errors (like invalid ID format) and proceed to query
    }

    // 2. Try fetching by referenceId field (JAL- format)
    const complaintsCol = collection(this.db, "complaints");
    const q = query(complaintsCol, where("referenceId", "==", id.toUpperCase().trim()));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0];
      return { id: firstDoc.id, ...firstDoc.data() } as ComplaintReport;
    }

    return null;
  }

  /**
   * Subscribe to a single complaint's updates
   */
  subscribeToComplaint(
    id: string,
    callback: (complaint: ComplaintReport | null) => void,
  ): Unsubscribe {
    if (!this.db) {
      return () => {};
    }

    const docRef = doc(this.db, "complaints", id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as ComplaintReport);
      } else {
        // Fallback: search by referenceId
        const complaintsCol = collection(this.db, "complaints");
        const q = query(complaintsCol, where("referenceId", "==", id.toUpperCase().trim()));
        onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0];
            callback({ id: firstDoc.id, ...firstDoc.data() } as ComplaintReport);
          } else {
            callback(null);
          }
        });
      }
    });
  }

  /**
   * Subscribe to complaints by phone
   */
  subscribeToComplaintsByPhone(
    phone: string,
    callback: (complaints: ComplaintReport[]) => void,
  ): Unsubscribe {
    if (!this.db) {
      return () => {};
    }

    const complaintsCol = collection(this.db, "complaints");
    const q = query(complaintsCol, where("phone", "==", phone), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const complaints = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ComplaintReport[];
      callback(complaints);
    });
  }

  /**
   * Update complaint status (admin function)
   */
  async updateComplaintStatus(
    id: string,
    status: "pending" | "assigned" | "resolved",
    assignedTo?: string,
  ): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Firestore not initialized");

    const complaintRef = doc(this.db, "complaints", id);
    const now = new Date();
    
    // Get existing doc to update timeline
    const snap = await getDoc(complaintRef);
    const existingData = snap.data() as ComplaintReport;
    const timeline = existingData?.timeline || [];
    
    const newLog: TimelineLog = {
      status,
      timestamp: now,
      message: assignedTo 
        ? `Status updated to ${status} and assigned to ${assignedTo}`
        : `Status updated to ${status}`,
    };

    await updateDoc(complaintRef, {
      status,
      assignedTo: assignedTo || null,
      updatedAt: Timestamp.now(),
      timeline: [...timeline, newLog]
    });
  }

  /**
   * Record a visitor visit with metadata
   */
  async recordVisitorVisit(sessionId: string, metadata: any): Promise<number> {
    try {
      await this.ensureInitialized();
      if (!this.db) return 0;

      const statsRef = doc(this.db, "analytics", "visitor_stats");
      const sessionRef = doc(this.db, "analytics", "sessions", "history", sessionId);

      await runTransaction(this.db, async (transaction) => {
        const statsSnap = await transaction.get(statsRef);
        const sessionSnap = await transaction.get(sessionRef);

        if (!sessionSnap.exists()) {
          // Increment total visit count ONLY if this is a new session
          if (!statsSnap.exists()) {
            transaction.set(statsRef, { count: 1, lastVisit: Timestamp.now() });
          } else {
            transaction.update(statsRef, {
              count: (statsSnap.data()?.count || 0) + 1,
              lastVisit: Timestamp.now(),
            });
          }
          // Log the session details
          transaction.set(sessionRef, {
            ...metadata,
            timestamp: Timestamp.now()
          });
        }
      });

      const finalSnap = await getDoc(statsRef);
      return finalSnap.data()?.count || 0;
    } catch (e) {
      console.warn("Could not record visitor stats", e);
      return 0;
    }
  }

  /**
   * Get visitor count
   */
  async getVisitorCount(): Promise<number> {
    try {
      await this.ensureInitialized();
      if (!this.db) return 0;

      const visitorRef = doc(this.db, "analytics", "visitor_stats");
      const docSnap = await getDoc(visitorRef);
      return docSnap.exists() ? docSnap.data().count : 0;
    } catch (e) {
      return 0;
    }
  }

  isInitialized(): boolean {
    return this.db !== null && this.storage !== null;
  }
}

export const firebaseService = JalRakshakFirebase.getInstance();
export const initializeFirebase = () => firebaseService.initialize();

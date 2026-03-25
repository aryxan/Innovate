/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";

const LandingPage = lazy(() => import("./components/LandingPage"));
const CitizenDashboard = lazy(() => import("./components/CitizenDashboard"));
const AdminLogin = lazy(() =>
  import("./components/AdminLogin").then((module) => ({
    default: module.AdminLogin,
  })),
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);

type ViewState =
  | "landing"
  | "loading"
  | "citizen"
  | "admin_login"
  | "admin_dashboard";

export default function App() {
  const [view, setView] = useState<ViewState>("citizen");
  const [isAdmin, setIsAdmin] = useState(false);
  const [missionReports, setMissionReports] = useState<any[]>([]);

  const handleAddReport = (report: any) => {
    setMissionReports((prev) => [report, ...prev]);
  };

  // Defer Firebase bundle load until after first paint.
  useEffect(() => {
    const timer = setTimeout(() => {
      import("./services/firebaseService")
        .then(({ initializeFirebase }) => initializeFirebase())
        .catch((error) => {
          console.error("Error initializing Firebase:", error);
        });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Check for existing admin session
  useEffect(() => {
    const savedAdmin = localStorage.getItem("isAdmin");
    if (savedAdmin === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleLaunch = () => {
    setView("citizen");
  };

  const handleAdminAuth = (password: string) => {
    if (password === "admin123") {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      setView("admin_dashboard");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
    setView("landing");
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-[11px] text-ashoka-blue font-bold uppercase tracking-[0.25em] animate-pulse text-center">
            Loading JalRakshak Modules...
          </p>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LandingPage
              onLaunch={handleLaunch}
              onAdminPortal={() => setView("admin_login")}
            />
          </motion.div>
        )}

        {view === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"
          >
            <div className="text-center max-w-md w-full">
              <div className="w-20 h-20 mx-auto mb-8 animate-pulse">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-display uppercase mb-6 tracking-widest">
                Starting JalRakshak
              </h2>

              <div className="space-y-3 text-left font-mono text-[10px] md:text-xs text-blue-400/60 uppercase tracking-tighter">
                <LoadingText
                  text="Loading Maps | नक्शा लोड हो रहा है..."
                  delay={0}
                />
                <LoadingText
                  text="Checking Satellite Data | सैटेलाइट डेटा की जांच..."
                  delay={500}
                />
                <LoadingText
                  text="Reading Citizen Reports | रिपोर्ट पढ़ी जा रही हैं..."
                  delay={1000}
                />
                <LoadingText
                  text="Connecting to Local Sensors | सेंसर से जुड़ रहे हैं..."
                  delay={1500}
                />
                <LoadingText
                  text="Preparing Safety Advice | सुरक्षा सलाह तैयार..."
                  delay={2000}
                />
              </div>

              <div className="mt-10 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        )}

        {view === "citizen" && (
          <motion.div
            key="citizen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <CitizenDashboard
              onExit={() => setView("landing")}
              onAddReport={handleAddReport}
            />
          </motion.div>
        )}

        {view === "admin_login" && (
          <motion.div
            key="admin_login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <AdminLogin
              onLogin={handleAdminAuth}
              onBack={() => setView("citizen")}
            />
          </motion.div>
        )}

        {view === "admin_dashboard" && (
          <motion.div
            key="admin_dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <AdminDashboard
              onExit={() => setView("landing")}
              onLogout={handleLogout}
              reports={missionReports}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  );
}

const LoadingText = ({ text, delay }: { text: string; delay: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center gap-3 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
      <span>{text}</span>
    </div>
  );
};

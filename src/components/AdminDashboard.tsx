import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Droplets,
  CloudRain,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Map as MapIcon,
  ShieldAlert,
  Zap,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardSkeleton, TableSkeleton } from "./Skeleton";
import { ComplaintsManager } from "./ComplaintsManager";

// Mock data for the flood prediction chart
const predictionData = [
  { time: "00:00", level: 1.2, predicted: 1.2 },
  { time: "04:00", level: 1.5, predicted: 1.6 },
  { time: "08:00", level: 1.8, predicted: 2.1 },
  { time: "12:00", level: 2.2, predicted: 2.8 },
  { time: "16:00", level: null, predicted: 3.5 },
  { time: "20:00", level: null, predicted: 4.2 },
  { time: "23:59", level: null, predicted: 3.8 },
];

const sensorData = [
  {
    id: "S-101",
    location: "Dharavi Main Drain",
    type: "Water Level",
    value: "2.4m",
    status: "Warning",
    trend: "rising",
  },
  {
    id: "S-102",
    location: "Mithi River Bridge",
    type: "Flow Rate",
    value: "12m³/s",
    status: "Normal",
    trend: "stable",
  },
  {
    id: "S-103",
    location: "Andheri Subway",
    type: "Water Level",
    value: "0.8m",
    status: "Critical",
    trend: "rising",
  },
  {
    id: "S-104",
    location: "Worli Sea Face",
    type: "Tide Level",
    value: "3.2m",
    status: "Normal",
    trend: "falling",
  },
];

const readinessTasks = [
  {
    id: 1,
    task: "Desilting of major storm drains",
    progress: 85,
    status: "In Progress",
  },
  {
    id: 2,
    task: "Installation of high-capacity pumps",
    progress: 100,
    status: "Completed",
  },
  {
    id: 3,
    task: "Community awareness workshops",
    progress: 45,
    status: "Delayed",
  },
  {
    id: 4,
    task: "Emergency shelter verification",
    progress: 90,
    status: "In Progress",
  },
];

export const AdminDashboard: React.FC<{
  onExit: () => void;
  onLogout: () => void;
  reports?: any[];
}> = ({ onExit, onLogout, reports = [] }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "sensors" | "readiness" | "reports"
  >("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Simulate data fetching
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  const handleTabChange = (
    tab: "overview" | "sensors" | "readiness" | "reports",
  ) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Dashboard Header */}
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-display uppercase tracking-wider text-white">
                Admin Command Center
              </h1>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                <Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString()}{" "}
                | AUTHORIZED ACCESS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              {(["overview", "sensors", "readiness", "reports"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 uppercase tracking-widest ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </nav>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <button
                onClick={onLogout}
                className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={onExit}
                className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key={`loading-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeTab === "overview" && <DashboardSkeleton />}
              {activeTab === "sensors" && <TableSkeleton />}
              {activeTab === "readiness" && <DashboardSkeleton />}
              {activeTab === "reports" && <TableSkeleton />}
            </motion.div>
          ) : (
            <>
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={<Droplets className="text-blue-400" />}
                      label="Avg. Water Level"
                      value="1.8m"
                      trend="+12%"
                      trendColor="text-red-400"
                    />
                    <StatCard
                      icon={<CloudRain className="text-blue-400" />}
                      label="Current Rainfall"
                      value="14mm/h"
                      trend="Stable"
                      trendColor="text-slate-400"
                    />
                    <StatCard
                      icon={<AlertTriangle className="text-amber-400" />}
                      label="Risk Probability"
                      value="68%"
                      trend="High"
                      trendColor="text-red-400"
                    />
                    <StatCard
                      icon={<ShieldAlert className="text-emerald-400" />}
                      label="Evacuation Readiness"
                      value="92%"
                      trend="Ready"
                      trendColor="text-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Prediction Chart */}
                    <div className="lg:col-span-2 bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-display uppercase tracking-wider text-white">
                            AI Flood Prediction
                          </h3>
                          <p className="text-sm text-slate-500">
                            Predicted water levels for the next 24 hours based
                            on satellite data
                          </p>
                        </div>
                        <div className="flex gap-4 text-[10px] font-mono uppercase">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />{" "}
                            Actual
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500/30 rounded-full border border-blue-500/50" />{" "}
                            Predicted
                          </div>
                        </div>
                      </div>
                      <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={predictionData}>
                            <defs>
                              <linearGradient
                                id="colorLevel"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#3b82f6"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#3b82f6"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#ffffff05"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="time"
                              stroke="#475569"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#475569"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `${value}m`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                              itemStyle={{ color: "#fff" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="predicted"
                              stroke="#3b82f6"
                              strokeDasharray="5 5"
                              fillOpacity={1}
                              fill="url(#colorLevel)"
                            />
                            <Area
                              type="monotone"
                              dataKey="level"
                              stroke="#60a5fa"
                              strokeWidth={3}
                              fill="transparent"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-blue-600/10 rounded-2xl border border-blue-500/20 p-6 flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Zap className="text-white w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-display uppercase tracking-wider text-white">
                          AI Insights
                        </h3>
                      </div>

                      <div className="space-y-6 flex-1">
                        <InsightItem
                          title="High Tide Alert"
                          content="A 4.2m high tide is expected at 20:00. Combined with current rainfall, low-lying areas in Sector-4 are at 85% risk of waterlogging."
                          type="warning"
                        />
                        <InsightItem
                          title="Drainage Capacity"
                          content="Current drainage flow is at 72% capacity. AI recommends activating secondary pump stations in Andheri and Worli immediately."
                          type="info"
                        />
                        <InsightItem
                          title="Weather Update"
                          content="Satellite imagery shows a heavy cloud formation moving towards the coast. Expect 20mm rainfall in the next 2 hours."
                          type="alert"
                        />
                      </div>

                      <button className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs">
                        Generate Full Report
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "sensors" && (
                <motion.div
                  key="sensors"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-display uppercase tracking-wider text-white">
                      Sensor Network Status
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded-full border border-emerald-500/20">
                        42 ACTIVE
                      </span>
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-mono rounded-full border border-red-500/20">
                        2 OFFLINE
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                          <th className="px-6 py-4 font-medium">Sensor ID</th>
                          <th className="px-6 py-4 font-medium">Location</th>
                          <th className="px-6 py-4 font-medium">Type</th>
                          <th className="px-6 py-4 font-medium">Value</th>
                          <th className="px-6 py-4 font-medium">Trend</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sensorData.map((sensor) => (
                          <tr
                            key={sensor.id}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          >
                            <td className="px-6 py-4 font-mono text-xs text-blue-400">
                              {sensor.id}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-white">
                              {sensor.location}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">
                              {sensor.type}
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-white">
                              {sensor.value}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                                  sensor.trend === "rising"
                                    ? "text-red-400"
                                    : sensor.trend === "falling"
                                      ? "text-emerald-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {sensor.trend === "rising"
                                  ? "↑"
                                  : sensor.trend === "falling"
                                    ? "↓"
                                    : "→"}{" "}
                                {sensor.trend}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                  sensor.status === "Critical"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : sensor.status === "Warning"
                                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}
                              >
                                {sensor.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === "readiness" && (
                <motion.div
                  key="readiness"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
                    <h3 className="text-xl font-display uppercase tracking-wider text-white mb-8">
                      Pre-Monsoon Readiness
                    </h3>
                    <div className="space-y-8">
                      {readinessTasks.map((task) => (
                        <div key={task.id} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300">
                              {task.task}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                task.status === "Completed"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : task.status === "Delayed"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                task.status === "Completed"
                                  ? "bg-emerald-500"
                                  : task.status === "Delayed"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                        <h4 className="text-lg font-display uppercase text-white">
                          System Health
                        </h4>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        All critical infrastructure nodes are reporting optimal
                        performance. AI models have been updated with the latest
                        meteorological data from IMD.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-4">
                        Upcoming Maintenance
                      </h4>
                      <div className="space-y-4">
                        <MaintenanceItem
                          date="MAR 24"
                          task="Sensor Calibration - Sector 7"
                        />
                        <MaintenanceItem
                          date="MAR 26"
                          task="Pump Station Load Test"
                        />
                        <MaintenanceItem
                          date="APR 02"
                          task="Satellite Link Upgrade"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === "reports" && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-display uppercase tracking-wider text-white mb-2">
                      Citizen Reports - Real-time Dashboard
                    </h3>
                    <p className="text-sm text-slate-500">
                      Review, assign, and track incoming waterlogging reports
                      from the community
                    </p>
                  </div>
                  <ComplaintsManager />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const ReportReviewItem = ({ location, time, severity, description }: any) => (
  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
    <div className="flex gap-4 items-start">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 ${
          severity === "High"
            ? "bg-red-500"
            : severity === "Medium"
              ? "bg-amber-500"
              : "bg-blue-500"
        }`}
      />
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-sm font-bold text-white">{location}</h4>
          <span className="text-[10px] font-mono text-slate-500">{time}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md">{description}</p>
      </div>
    </div>
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors">
        Verify
      </button>
      <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded-lg transition-colors">
        Dismiss
      </button>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, trend, trendColor }: any) => (
  <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm hover:bg-white/[0.07] transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span
        className={`text-[10px] font-mono font-bold uppercase ${trendColor}`}
      >
        {trend}
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="text-3xl font-display text-white">{value}</p>
    </div>
  </div>
);

const InsightItem = ({ title, content, type }: any) => (
  <div className="space-y-2 group cursor-default">
    <div className="flex items-center gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          type === "warning"
            ? "bg-amber-400"
            : type === "alert"
              ? "bg-red-400"
              : "bg-blue-400"
        }`}
      />
      <h4 className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors">
        {title}
      </h4>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed pl-3.5 border-l border-white/10">
      {content}
    </p>
  </div>
);

const MaintenanceItem = ({ date, task }: any) => (
  <div className="flex items-center gap-4">
    <div className="text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
      {date}
    </div>
    <span className="text-xs text-slate-300">{task}</span>
  </div>
);

/**
 * Complaints Manager Component
 * Real-time Firebase integration for admin dashboard
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Loader2,
  ChevronDown,
  MapIcon,
  Users,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { firebaseService, ComplaintReport } from "../services/firebaseService";
import {
  formatTimestamp,
  getSeverityColor,
  getSeverityLabel,
  getStatusLabel,
} from "../services/reportSubmissionUtils";
import {
  trackReportByPhone,
  getSeverityBadgeColor,
  getStatusColor,
} from "../services/reportTrackingUtils";

interface ComplaintsManagerProps {
  onComplaintsLoaded?: (complaints: ComplaintReport[]) => void;
}

export const ComplaintsManager: React.FC<ComplaintsManagerProps> = ({
  onComplaintsLoaded,
}) => {
  const [complaints, setComplaints] = useState<ComplaintReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "assigned" | "resolved"
  >("all");
  const [filterSeverity, setFilterSeverity] = useState<
    "all" | "low" | "moderate" | "high"
  >("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<
    "pending" | "assigned" | "resolved"
  >("pending");
  const [editingTeam, setEditingTeam] = useState<string>("");
  const [showImageModal, setShowImageModal] = useState<{
    open: boolean;
    imageUrl: string;
  }>({
    open: false,
    imageUrl: "",
  });
  const [sortBy, setSortBy] = useState<"newest" | "severity" | "status">(
    "newest",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [highAlertVisible, setHighAlertVisible] = useState(false);

  // Subscribe to real-time complaint updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const startSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure Firebase is initialized before subscribing
        await firebaseService.initialize();

        if (!isMounted) return;

        unsubscribe = firebaseService.subscribeToComplaints((data) => {
          if (isMounted) {
            setComplaints(data);
            onComplaintsLoaded?.(data);
            setIsLoading(false);
          }
        });
      } catch (err) {
        if (isMounted) {
          console.error("Error subscribing to complaints:", err);
          setError("Failed to load complaints. Please check your connection and configuration.");
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
  }, [onComplaintsLoaded]);

  // Filter and sort complaints
  const filteredComplaints = useMemo(() => {
    let filtered = complaints;

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Apply severity filter
    if (filterSeverity !== "all") {
      filtered = filtered.filter((c) => c.severity === filterSeverity);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.location.toLowerCase().includes(query) ||
          c.id?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "severity":
        const severityOrder = { high: 0, moderate: 1, low: 2 };
        sorted.sort(
          (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
        );
        break;
      case "status":
        const statusOrder = { pending: 0, assigned: 1, resolved: 2 };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case "newest":
      default:
        sorted.sort((a, b) => {
          const aTime = (a.createdAt as any)?.toMillis?.() || 0;
          const bTime = (b.createdAt as any)?.toMillis?.() || 0;
          return bTime - aTime;
        });
    }

    return sorted;
  }, [complaints, filterStatus, filterSeverity, searchQuery, sortBy]);

  // Update complaint status and team assignment
  const handleUpdateComplaint = async (
    complaintId: string,
    status: "pending" | "assigned" | "resolved",
    team: string,
  ) => {
    try {
      await firebaseService.updateComplaintStatus(
        complaintId,
        status,
        team || undefined,
      );
      setEditingId(null);
      setError(null);
    } catch (err) {
      console.error("Error updating complaint:", err);
      setError("Failed to update complaint. Please try again.");
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      assigned: complaints.filter((c) => c.status === "assigned").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      highSeverity: complaints.filter((c) => c.severity === "high").length,
    };
  }, [complaints]);

  useEffect(() => {
    if (stats.highSeverity > 0) {
      setHighAlertVisible(true);
    }
  }, [stats.highSeverity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {highAlertVisible && stats.highSeverity > 0 && (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-amber-300 text-sm font-semibold">
            High Severity Alert: {stats.highSeverity} critical complaint
            {stats.highSeverity > 1 ? "s" : ""} need immediate action.
          </p>
          <button
            onClick={() => setHighAlertVisible(false)}
            className="text-amber-300 hover:text-amber-100 text-xs font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Assigned" value={stats.assigned} color="purple" />
        <StatCard label="Resolved" value={stats.resolved} color="green" />
        <StatCard
          label="High Priority"
          value={stats.highSeverity}
          color="red"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-900/40 border border-white/10 rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, phone, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "newest" | "severity" | "status")
            }
            className="px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
          >
            <option value="newest">Newest First</option>
            <option value="severity">By Severity</option>
            <option value="status">By Status</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            active={filterStatus === "all"}
            onClick={() => setFilterStatus("all")}
          />
          <FilterButton
            label="Pending"
            active={filterStatus === "pending"}
            onClick={() => setFilterStatus("pending")}
            color="yellow"
          />
          <FilterButton
            label="Assigned"
            active={filterStatus === "assigned"}
            onClick={() => setFilterStatus("assigned")}
            color="purple"
          />
          <FilterButton
            label="Resolved"
            active={filterStatus === "resolved"}
            onClick={() => setFilterStatus("resolved")}
            color="green"
          />

          <div className="w-px bg-white/10 mx-2" />

          <FilterButton
            label="All Severities"
            active={filterSeverity === "all"}
            onClick={() => setFilterSeverity("all")}
          />
          <FilterButton
            label="High"
            active={filterSeverity === "high"}
            onClick={() => setFilterSeverity("high")}
            color="red"
          />
          <FilterButton
            label="Moderate"
            active={filterSeverity === "moderate"}
            onClick={() => setFilterSeverity("moderate")}
            color="orange"
          />
          <FilterButton
            label="Low"
            active={filterSeverity === "low"}
            onClick={() => setFilterSeverity("low")}
            color="green"
          />
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
            No complaints found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Main Row */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === complaint.id ? null : complaint.id,
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Severity Indicator */}
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: getSeverityColor(complaint.severity),
                    }}
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                        {complaint.referenceId || complaint.id?.substring(0, 8)}
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        {complaint.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {complaint.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Severity Tags */}
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      getStatusColor(complaint.status).bg
                    } ${getStatusColor(complaint.status).text}`}
                  >
                    {complaint.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      getSeverityBadgeColor(complaint.severity).bg
                    } ${getSeverityBadgeColor(complaint.severity).text}`}
                  >
                    {complaint.severity}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      expandedId === complaint.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === complaint.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 px-4 py-4 space-y-4 bg-black/20"
                >
                   {/* Header with Trust Score */}
                   <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                     <div className="flex items-center gap-3">
                       <h3 className="text-lg font-display uppercase text-white tracking-wide">
                         {complaint.category.replace("_", " ")}
                       </h3>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                         complaint.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                         complaint.status === "assigned" ? "bg-blue-500/20 text-blue-400" :
                         "bg-emerald-500/20 text-emerald-400"
                       }`}>
                         {complaint.status.toUpperCase()}
                       </span>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Trust Score</p>
                       <p className="text-xl font-display text-white">{complaint.trustScore || 0}<span className="text-xs text-slate-500">/100</span></p>
                     </div>
                   </div>

                   {/* Reporter Details & Timeline */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                         <Users className="w-3 h-3" /> Reporter Details
                       </h4>
                       <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                         <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/20">
                           <Users className="w-5 h-5 text-blue-400" />
                         </div>
                         <div className="space-y-1">
                           <p className="text-sm font-bold text-white">{complaint.name}</p>
                           <p className="text-xs text-slate-400 flex items-center gap-1">
                             <Phone className="w-3 h-3" /> {complaint.phone}
                           </p>
                           <p className="text-[10px] text-slate-500 font-mono italic">
                             ID: {complaint.userId}
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-4">
                       <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                         <Clock className="w-3 h-3" /> Log Timeline
                       </h4>
                       <div className="space-y-3 pl-2 border-l border-white/5">
                         {complaint.timeline && complaint.timeline.length > 0 ? (
                            complaint.timeline.map((log, idx) => (
                              <div key={idx} className="relative pl-4 pb-1">
                                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                                <p className="text-xs font-bold text-slate-300">{log.status.toUpperCase()}</p>
                                <p className="text-[10px] text-slate-500">{log.message}</p>
                                <p className="text-[8px] text-blue-500/60 font-mono mt-0.5">
                                  {formatTimestamp(log.timestamp)}
                                </p>
                              </div>
                            ))
                         ) : (
                           <p className="text-xs text-slate-600 italic">No timeline data available</p>
                         )}
                         <div className="text-[10px] font-bold p-2 bg-amber-500/5 text-amber-500/70 border border-amber-500/10 rounded">
                           SLA: EMERGENCY RESPONSE WITHIN 4H
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Image */}
                   {complaint.imageUrl && (
                     <div className="space-y-4">
                       <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Incident Evidence</h4>
                       <div className="relative group overflow-hidden rounded-2xl border border-white/5 max-h-[300px]">
                         <img
                           src={complaint.imageUrl}
                           alt="Report"
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                           onError={(e) => {
                             (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1e293b/white?text=Evidence+Not+Available";
                           }}
                         />
                         <button
                           onClick={() =>
                             setShowImageModal({
                               open: true,
                               imageUrl: complaint.imageUrl!,
                             })
                           }
                           className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                         >
                           <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 uppercase tracking-widest">
                             Expand Analysis
                           </div>
                         </button>
                       </div>
                     </div>
                   )}

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">
                      Description
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <DetailItem
                      label="Water Level"
                      value={complaint.waterLevel}
                    />
                    <DetailItem label="Category" value={complaint.category} />
                    <DetailItem label="Phone" value={complaint.phone} />
                    <DetailItem label="City" value={complaint.city} />
                    <DetailItem label="State" value={complaint.state} />
                    <DetailItem label="Pincode" value={complaint.pincode} />
                    <DetailItem
                      label="Latitude"
                      value={complaint.lat.toFixed(4)}
                    />
                    <DetailItem
                      label="Longitude"
                      value={complaint.lng.toFixed(4)}
                    />
                    <DetailItem
                      label="Created"
                      value={formatTimestamp(complaint.createdAt)}
                    />
                  </div>

                  {/* Edit/Update Section */}
                  {editingId === complaint.id ? (
                    <div className="bg-slate-950/50 border border-blue-500/30 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2 tracking-widest">
                          Status
                        </label>
                        <select
                          value={editingStatus}
                          onChange={(e) =>
                            setEditingStatus(
                              e.target.value as
                                | "pending"
                                | "assigned"
                                | "resolved",
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-slate-400 block mb-2 tracking-widest">
                          Assign to Team
                        </label>
                        <input
                          type="text"
                          value={editingTeam}
                          onChange={(e) => setEditingTeam(e.target.value)}
                          placeholder="e.g., Team A, Fire Brigade, etc."
                          className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateComplaint(
                              complaint.id!,
                              editingStatus,
                              editingTeam,
                            )
                          }
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="text-xs text-slate-500">
                        {complaint.assignedTo && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>Assigned to: {complaint.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(complaint.id!);
                          setEditingStatus(complaint.status);
                          setEditingTeam(complaint.assignedTo || "");
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <Edit2 className="w-3 h-3" />
                        Update
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowImageModal({ open: false, imageUrl: "" })}
        >
          <div
            className="max-w-2xl w-full max-h-96 bg-slate-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={showImageModal.imageUrl}
              alt="Full size"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatCardProps {
  label: string;
  value: number;
  color: "blue" | "yellow" | "purple" | "green" | "red";
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <p className="text-[10px] font-mono uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  active,
  onClick,
  color,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-colors ${
        active
          ? `${
              color === "yellow"
                ? "bg-yellow-600 text-white"
                : color === "purple"
                  ? "bg-purple-600 text-white"
                  : color === "green"
                    ? "bg-green-600 text-white"
                    : color === "red"
                      ? "bg-red-600 text-white"
                      : color === "orange"
                        ? "bg-orange-600 text-white"
                        : "bg-blue-600 text-white"
            }`
          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-white font-medium">{value}</p>
  </div>
);

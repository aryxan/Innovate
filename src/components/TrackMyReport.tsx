/**
 * Track My Report Module
 * Allows users to track their complaint reports in real-time
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Search,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  Droplets,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  trackReportByPhone,
  trackReportById,
} from "../services/reportTrackingUtils";
import { ComplaintReport } from "../services/firebaseService";
import {
  formatTimestamp,
  getSeverityColor,
  getSeverityLabel,
  getStatusLabel,
} from "../services/reportSubmissionUtils";

interface TrackMyReportProps {
  onClose?: () => void;
  initialPhone?: string;
  initialId?: string;
}

export const TrackMyReport: React.FC<TrackMyReportProps> = ({
  onClose,
  initialPhone,
  initialId,
}) => {
  const [searchType, setSearchType] = useState<"phone" | "id">(
    initialPhone ? "phone" : "id",
  );
  const [searchInput, setSearchInput] = useState(
    initialPhone || initialId || "",
  );
  const [complaints, setComplaints] = useState<ComplaintReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setComplaints([]);
    setHasSearched(true);

    try {
      let result;
      if (searchType === "phone") {
        result = await trackReportByPhone(searchInput);
      } else {
        result = await trackReportById(searchInput);
      }

      if (result.success) {
        setComplaints(result.complaints);
      } else {
        setError(result.error || "No reports found");
      }
    } catch (err) {
      setError("Error searching reports. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Track Your Report
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Type Selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSearchType("phone")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                searchType === "phone"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Search by Phone
            </button>
            <button
              type="button"
              onClick={() => setSearchType("id")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                searchType === "id"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search by Report ID
            </button>
          </div>

          {/* Input Field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                searchType === "phone"
                  ? "Enter your 10-digit phone number"
                  : "Enter your report ID"
              }
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-gray-800"
            />
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Results */}
      {hasSearched && !isLoading && complaints.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reports found</p>
          <p className="text-sm">Try searching with a different query</p>
        </div>
      )}

      {/* Complaints List */}
      {complaints.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase">
            Found {complaints.length} Report{complaints.length !== 1 ? "s" : ""}
          </h3>

          {complaints.map((complaint) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Main Row */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === complaint.id ? null : complaint.id,
                  )
                }
                className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  {/* ID and Status */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {complaint.id?.substring(0, 12)}...
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          complaint.severity === "high"
                            ? "#EF4444"
                            : complaint.severity === "moderate"
                              ? "#F97316"
                              : "#22C55E",
                      }}
                    />
                  </div>

                  {/* Report Info */}
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      {complaint.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {complaint.location}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(complaint.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : complaint.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {complaint.status === "resolved" && (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {complaint.status}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor:
                        complaint.severity === "high"
                          ? "#FEE2E2"
                          : complaint.severity === "moderate"
                            ? "#FFEDD5"
                            : "#DCFCE7",
                      color:
                        complaint.severity === "high"
                          ? "#991B1B"
                          : complaint.severity === "moderate"
                            ? "#9A3412"
                            : "#166534",
                    }}
                  >
                    {complaint.severity} priority
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === complaint.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-4"
                >
                  {/* Image */}
                  {complaint.imageUrl && (
                    <img
                      src={complaint.imageUrl}
                      alt="Report"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Water Level
                      </p>
                      <p className="text-gray-900 font-medium">
                        {complaint.waterLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Category
                      </p>
                      <p className="text-gray-900 font-medium">
                        {complaint.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Phone
                      </p>
                      <p className="text-gray-900 font-medium">
                        {complaint.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        City
                      </p>
                      <p className="text-gray-900 font-medium">
                        {complaint.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase font-semibold">
                        Coordinates
                      </p>
                      <p className="text-gray-900 font-mono text-xs">
                        {complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}
                      </p>
                    </div>
                    {complaint.assignedTo && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold">
                          Assigned To
                        </p>
                        <p className="text-gray-900 font-medium">
                          {complaint.assignedTo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <h4 className="text-sm font-bold text-gray-700">
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-1 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Report Submitted
                          </p>
                          <p className="text-gray-600 text-xs">
                            {formatTimestamp(complaint.createdAt)}
                          </p>
                        </div>
                      </div>

                      {complaint.status !== "pending" && (
                        <div className="flex gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-1 shrink-0"
                            style={{
                              backgroundColor:
                                complaint.status === "assigned"
                                  ? "#3B82F6"
                                  : "#10B981",
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {complaint.status === "assigned"
                                ? "Team Assigned"
                                : "Resolved"}
                            </p>
                            {complaint.assignedTo && (
                              <p className="text-gray-600 text-xs">
                                Team: {complaint.assignedTo}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Get reports from localStorage (in production, this would come from backend)
  const [complaints, setComplaints] = useState(() => {
    const stored = localStorage.getItem('jalrakshak_reports');
    return stored ? JSON.parse(stored) : [];
  });

  const handleStatusChange = (complaintId, newStatus) => {
    const updated = complaints.map(c =>
      c.complaintNumber === complaintId ? { ...c, status: newStatus } : c
    );
    setComplaints(updated);
    localStorage.setItem('jalrakshak_reports', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('jalrakshak_admin_auth');
    navigate('/admin');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500/90 text-white';
      case 'Medium': return 'bg-amber-500/90 text-white';
      case 'Low': return 'bg-blue-500/90 text-white';
      default: return 'bg-gray-500/90 text-white';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const reportTime = new Date(timestamp);
    const diffMs = now - reportTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    highSeverity: complaints.filter(c => c.severity === 'High').length,
  };

  const issueTypeStats = complaints.reduce((acc, c) => {
    acc[c.issueType] = (acc[c.issueType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <img src="/logo.png" alt="JalRakshak AI Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Complaint Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors border border-slate-700"
            >
              View Public Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Complaints</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
          </div>
          <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">In Progress</div>
            <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
          </div>
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Resolved</div>
            <div className="text-3xl font-bold text-emerald-400">{stats.resolved}</div>
          </div>
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">High Priority</div>
            <div className="text-3xl font-bold text-red-400">{stats.highSeverity}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">All Complaints</h2>
              <p className="text-sm text-gray-400 mt-1">Manage and track citizen reports</p>
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {complaints.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">No complaints yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.complaintNumber}
                      onClick={() => setSelectedComplaint(complaint)}
                      className={`p-6 hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedComplaint?.complaintNumber === complaint.complaintNumber ? 'bg-slate-800/50' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-400 font-mono text-sm font-semibold">
                              #{complaint.complaintNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(complaint.severity)}`}>
                              {complaint.severity}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-1">{complaint.issueType}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{complaint.description}</p>
                        </div>
                        {complaint.severity === 'High' && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse ml-4"></div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {complaint.name || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {complaint.mobile}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeAgo(complaint.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Complaint Details</h2>
            </div>

            {selectedComplaint ? (
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Complaint Number</div>
                  <div className="text-blue-400 font-mono text-lg font-bold">#{selectedComplaint.complaintNumber}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Issue Type</div>
                  <div className="text-white font-semibold">{selectedComplaint.issueType}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Severity</div>
                  <span className={`inline-block px-3 py-1 rounded font-semibold ${getSeverityColor(selectedComplaint.severity)}`}>
                    {selectedComplaint.severity}
                  </span>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Status</div>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusChange(selectedComplaint.complaintNumber, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Description</div>
                  <div className="text-white text-sm bg-slate-800/50 p-3 rounded-lg">{selectedComplaint.description}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Reporter Details</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">{selectedComplaint.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mobile:</span>
                      <span className="text-white font-mono">{selectedComplaint.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verified:</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yes
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Location</div>
                  <div className="text-white text-sm">
                    {selectedComplaint.lat.toFixed(4)}, {selectedComplaint.lng.toFixed(4)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Submitted</div>
                  <div className="text-white text-sm">{new Date(selectedComplaint.created_at).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">Select a complaint to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Issue Type Statistics */}
        <div className="relative z-10 bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-lg p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Threat Vector Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(issueTypeStats).map(([type, count]) => (
              <div key={type} className="bg-slate-950/50 border border-slate-800/80 rounded p-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-full w-[2px] bg-blue-500/50"></div>
                <div className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1 pl-2">{type}</div>
                <div className="text-2xl font-bold text-slate-300 font-mono pl-2">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

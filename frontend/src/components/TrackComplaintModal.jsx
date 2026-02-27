import React, { useState } from 'react';

const TrackComplaintModal = ({ isOpen, onClose }) => {
  const [complaintNumber, setComplaintNumber] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    setNotFound(false);
    setComplaint(null);

    setTimeout(() => {
      const stored = localStorage.getItem('jalrakshak_reports');
      if (stored) {
        const reports = JSON.parse(stored);
        const found = reports.find(r => r.complaintNumber === complaintNumber.trim());
        if (found) {
          setComplaint(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      setSearching(false);
    }, 1000);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'resolved':
        return (
          <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Track Complaint</h2>
                <p className="text-sm text-gray-400">Check the status of your complaint</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Complaint Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={complaintNumber}
                onChange={(e) => {
                  setComplaintNumber(e.target.value.toUpperCase());
                  setNotFound(false);
                  setComplaint(null);
                }}
                placeholder="JR12345678"
                className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                required
              />
              <button
                type="submit"
                disabled={searching}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                {searching ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Not Found Message */}
          {notFound && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-red-400 font-semibold mb-1">Complaint Not Found</div>
                <div className="text-red-300 text-sm">
                  No complaint found with number "{complaintNumber}". Please check the number and try again.
                </div>
              </div>
            </div>
          )}

          {/* Complaint Details */}
          {complaint && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(complaint.status)}
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wide">Current Status</div>
                      <div className={`inline-block px-3 py-1 rounded border font-semibold text-sm mt-1 ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity} Priority
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-4">
                  <div className="flex justify-between mb-2 text-xs text-gray-400">
                    <span>Submitted</span>
                    <span>In Progress</span>
                    <span>Resolved</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        complaint.status === 'resolved' ? 'bg-emerald-500 w-full' :
                        complaint.status === 'in-progress' ? 'bg-blue-500 w-2/3' :
                        'bg-amber-500 w-1/3'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Complaint Number</div>
                  <div className="text-white font-mono font-semibold">#{complaint.complaintNumber}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Issue Type</div>
                  <div className="text-white font-semibold">{complaint.issueType}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Submitted On</div>
                  <div className="text-white text-sm">{new Date(complaint.created_at).toLocaleDateString()}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Mobile Number</div>
                  <div className="text-white font-mono text-sm">{complaint.mobile}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Description</div>
                <div className="text-white text-sm leading-relaxed">{complaint.description}</div>
              </div>

              {/* Reporter Info */}
              {complaint.name && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Reported By</div>
                  <div className="text-white">{complaint.name}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrackComplaintModal;

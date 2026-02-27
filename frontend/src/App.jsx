import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import IndiaMap from './components/IndiaMap';
import StateDetails from './components/StateDetails';
import AlertBar from './components/AlertBar';
import ReportIncidentModal from './components/ReportIncidentModal';
import ReportsPanel from './components/ReportsPanel';
import TrackComplaintModal from './components/TrackComplaintModal';
import { indiaRiskData } from './data/indiaRiskData';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Extract the main dashboard view into its own component
function Dashboard() {
  const [selectedState, setSelectedState] = useState(null);
  const [reports, setReports] = useState(() => {
    const stored = localStorage.getItem('jalrakshak_reports');
    return stored ? JSON.parse(stored) : [];
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showTrackComplaint, setShowTrackComplaint] = useState(false);

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);
  };

  const handleReportSubmit = (reportData) => {
    const updatedReports = [reportData, ...reports];
    setReports(updatedReports);
    // Save to localStorage
    localStorage.setItem('jalrakshak_reports', JSON.stringify(updatedReports));
    setIsReportModalOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    // You can add logic here to zoom to the report location on the map
  };

  // Calculate overall statistics
  const totalStates = Object.keys(indiaRiskData).length;
  const highRiskStates = Object.values(indiaRiskData).filter(s => s.risk === 'high').length;
  const mediumRiskStates = Object.values(indiaRiskData).filter(s => s.risk === 'medium').length;
  const lowRiskStates = Object.values(indiaRiskData).filter(s => s.risk === 'low').length;
  const totalAlerts = Object.values(indiaRiskData).reduce((sum, s) => sum + s.alerts, 0);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden font-sans relative">
      {/* Thematic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-950/80 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex-shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-widest uppercase font-mono">JalRakshak AI Control</h1>
              <p className="text-blue-400 text-xs font-mono uppercase tracking-wider">Hydrological Intelligence System</p>
            </div>
          </div>

          {/* AI Model Status */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTrackComplaint(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-slate-600"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track Complaint
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-mono font-bold text-xs uppercase tracking-widest border border-blue-600"
            >
              <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Incident
            </button>

            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-50"></div>
                </div>
                <span className="text-emerald-500 text-xs font-mono font-bold uppercase tracking-widest">Model Active</span>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-6">
            <div className="text-center group">
              <div className="text-red-500 text-2xl font-bold font-mono transition-colors">{highRiskStates}</div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">High Risk</div>
            </div>
            <div className="text-center group">
              <div className="text-amber-500 text-2xl font-bold font-mono transition-colors">{mediumRiskStates}</div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">Medium Risk</div>
            </div>
            <div className="text-center group">
              <div className="text-emerald-500 text-2xl font-bold font-mono transition-colors">{lowRiskStates}</div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">Low Risk</div>
            </div>
            <div className="text-center border-l border-slate-700 pl-6 group">
              <div className="text-blue-400 text-2xl font-bold font-mono transition-colors">{totalAlerts}</div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">Active Alerts</div>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Bar */}
      <div className="flex-shrink-0">
        <AlertBar stateName={selectedState} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Section - 65% */}
        <div className="w-[65%] bg-slate-900 border-r border-slate-800 relative">
          <IndiaMap onStateClick={handleStateClick} selectedState={selectedState} />

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-md rounded-lg p-4 border border-slate-700 shadow-xl shadow-slate-950/50">
            <h3 className="text-white font-semibold mb-3 text-sm tracking-wide">Threat Levels</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                <span className="text-gray-300 text-sm">High Risk (70%+)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-600 rounded-sm"></div>
                <span className="text-gray-300 text-sm">Medium Risk (40-69%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-600 rounded-sm"></div>
                <span className="text-gray-300 text-sm">Low Risk (0-39%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Layout - 35% */}
        <div className="w-[35%] bg-slate-900 flex flex-col relative overflow-hidden">
          {/* Top Half: State Details or Placeholder */}
          <div className="flex-1 overflow-hidden">
            <StateDetails
              stateName={selectedState}
              reports={reports}
              selectedReport={selectedReport}
            />
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-24 right-4 z-50 animate-slideIn">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-emerald-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-semibold">Report Submitted!</div>
                <div className="text-sm text-emerald-100">Your incident has been recorded</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Track Complaint Modal */}
      <TrackComplaintModal
        isOpen={showTrackComplaint}
        onClose={() => setShowTrackComplaint(false)}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950/80 backdrop-blur-md border-t border-blue-500/20 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase">
          <div className="text-gray-500">
            System Sync: <span className="text-blue-400 font-bold">Real-time</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-2 text-emerald-500">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Network Online
            </span>
            <span>|</span>
            <span>{totalStates} Regions Monitored</span>
            <span>|</span>
            <span className="flex items-center gap-1 text-blue-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analytics Active
            </span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;

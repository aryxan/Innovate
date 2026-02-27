import React, { useState } from 'react';

const ReportsPanel = ({ reports, onReportClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'bg-red-500/90 text-white border-red-500/30';
      case 'Medium': return 'bg-amber-500/90 text-white border-amber-500/30';
      case 'Low': return 'bg-blue-500/90 text-white border-blue-500/30';
      default: return 'bg-gray-500/90 text-white border-gray-500/30';
    }
  };

  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case 'Blocked Drain':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      case 'Overflowing Drain':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'Waterlogging':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'River Rising':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  // Sort reports by severity (High -> Medium -> Low) and then by time
  const sortedReports = [...reports].sort((a, b) => {
    const severityOrder = { High: 0, Medium: 1, Low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const highSeverityCount = reports.filter(r => r.severity === 'High').length;

  return (
    <div className={`flex flex-col bg-slate-900 transition-all duration-300 h-full border-r border-slate-800 ${isCollapsed ? 'max-w-[60px]' : 'max-w-md w-96'}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between cursor-pointer flex-shrink-0 select-none hover:bg-slate-800/50 transition-colors" onClick={() => setIsCollapsed(!isCollapsed)}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
            <span className="w-1.5 h-4 bg-blue-500 inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            <h3 className="text-blue-400 font-mono tracking-widest font-bold text-xs uppercase">Field Reports Log</h3>
            {reports.length > 0 && (
              <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-sm font-mono ml-1">
                [{reports.length}]
              </span>
            )}
            {highSeverityCount > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2" title={`${highSeverityCount} High Severity`}></span>
            )}
          </div>
          {isCollapsed && (
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="w-1.5 h-3 bg-blue-500 inline-block mb-2"></span>
              <span className="text-white text-xs font-bold font-mono">{reports.length}</span>
              {highSeverityCount > 0 && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1"></div>
              )}
            </div>
          )}
          <button className="text-slate-500 hover:text-blue-400 transition-colors p-1 ml-auto">
            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Reports List */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto font-sans bg-slate-900/50">
            {reports.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border border-slate-700/50 flex items-center justify-center mb-3 bg-slate-800/20">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">Incoming Buffer Empty</p>
                <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">System awaiting inputs</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {sortedReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => onReportClick(report)}
                    className="p-4 hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center ${report.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        report.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        }`}>
                        {getIssueIcon(report.issueType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-slate-300 text-sm font-mono tracking-wider truncate group-hover:text-blue-400 transition-colors">
                            {report.issueType}
                          </h4>
                          {report.severity === 'High' && (
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2 font-mono uppercase tracking-widest">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {getTimeAgo(report.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400/80 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ReportsPanel;

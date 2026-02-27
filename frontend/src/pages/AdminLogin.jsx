import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportsPanel from '../components/ReportsPanel';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [reports] = useState(() => {
    const stored = localStorage.getItem('jalrakshak_reports');
    return stored ? JSON.parse(stored) : [];
  });

  // Simple authentication (in production, use proper backend authentication)
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('jalrakshak_admin_auth', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-row relative overflow-hidden font-sans">
      <style>
        {`
          @keyframes border-radar {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .radar-sweep {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 800px;
            height: 800px;
            margin-left: -400px;
            margin-top: -400px;
            border-radius: 50%;
            background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(220, 38, 38, 0.15) 360deg);
            animation: border-radar 6s linear infinite;
            pointer-events: none;
          }
        `}
      </style>

      {/* Thematic Background Elements (Matching Landing Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-slate-950">
        <div
          className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: 'url(/india-satellite-dark.png)',
            filter: 'blur(2px) contrast(1.2)'
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-blue-950/90 mix-blend-multiply"></div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30"></div>
      </div>

      <div className="radar-sweep z-0 opacity-40"></div>

      {/* Reports Panel Feed (Left Sidebar) */}
      <div className="relative z-20 h-screen hidden lg:block shadow-[10px_0_30px_rgba(0,0,0,0.5)] bg-slate-950 border-r border-slate-800">
        <ReportsPanel reports={reports} onReportClick={() => { }} />
      </div>

      {/* Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 w-full ml-0 lg:ml-[-20%]">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <img src="/logo.png" alt="JalRakshak AI Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8 border-b border-red-500/20 pb-4">
            <h1 className="text-2xl font-bold text-red-500 tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Secure Access
            </h1>
            <p className="text-gray-400 text-xs font-mono tracking-wider uppercase">jalrakshak command terminal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-sm font-mono uppercase tracking-wide">Error: {error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest pl-1">Target Identity</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                className="w-full bg-slate-950/80 border border-slate-700/50 rounded-md px-4 py-3 text-red-400 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
                placeholder="[ ENTER USERNAME ]"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest pl-1">Authorization Code</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="w-full bg-slate-950/80 border border-slate-700/50 rounded-md px-4 py-3 text-red-400 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner tracking-[0.3em]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600/90 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-4 rounded-md font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-500/50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-red-500">Validating...</span>
                </>
              ) : (
                <>
                  <span>Init Connection</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="text-xs text-gray-400 mb-2">Demo Credentials:</div>
            <div className="text-sm text-gray-300 font-mono">
              <div>Username: admin</div>
              <div>Password: admin123</div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

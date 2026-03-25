import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, ArrowRight, Activity, Waves } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-blue-950/50">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-white mb-2">Admin Portal</h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-4 h-4 transition-colors ${error ? 'text-red-400' : 'text-slate-500 group-focus-within:text-blue-400'}`} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-black/40 border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none transition-all ${
                    error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'
                  }`}
                  required
                />
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-mono text-red-400 uppercase tracking-tighter mt-2 ml-1"
                >
                  Invalid Access Key. Access Denied.
                </motion.p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs"
            >
              Authenticate System
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4">
            <button 
              onClick={onBack}
              className="text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-white transition-colors text-center"
            >
              ← Return to Citizen Portal
            </button>
            <div className="flex items-center justify-center gap-2 opacity-20">
              <Activity className="w-3 h-3" />
              <div className="w-12 h-[1px] bg-white"></div>
              <Waves className="w-3 h-3" />
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] text-slate-600 font-mono uppercase tracking-widest">
          System ID: JAL-RAKSHAK-MUM-04 | IP: 192.168.1.104
        </p>
      </motion.div>
    </div>
  );
};

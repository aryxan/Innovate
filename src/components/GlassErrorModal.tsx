import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlassErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onRetry: () => void;
  onClose: () => void;
  isRetrying?: boolean;
}

export const GlassErrorModal: React.FC<GlassErrorModalProps> = ({
  isOpen,
  title,
  message,
  onRetry,
  onClose,
  isRetrying = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[210] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ashoka-blue/45 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/70 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-ashoka-blue uppercase tracking-wide">
                  {title}
                </h3>
                <p className="text-xs text-ink/70 mt-1 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex-1 py-3 rounded-xl bg-ashoka-blue text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                />
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-border bg-white text-[11px] font-bold uppercase tracking-widest text-ink/70"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

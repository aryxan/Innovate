import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface ToastState {
  show: boolean;
  message: string;
  type: "error" | "success";
}

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-[220]"
        >
          <div
            className={`min-w-[260px] max-w-sm rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-50/90 border-red-200 text-red-700"
                : "bg-emerald-50/90 border-emerald-200 text-emerald-700"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {toast.type === "error" ? (
                <AlertTriangle className="w-4 h-4 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
              )}
              <div className="flex-1 text-xs font-bold uppercase tracking-wider">
                {toast.message}
              </div>
              <button
                onClick={onClose}
                className="text-[10px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info, Sparkles } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'magic';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode='popLayout'>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className="pointer-events-auto min-w-[320px] bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-start gap-3"
            >
                <div className={`mt-0.5 ${
                  t.type === 'success' ? 'text-emerald-400' : 
                  t.type === 'error' ? 'text-red-400' : 
                  t.type === 'magic' ? 'text-purple-400' :
                  'text-blue-400'
                }`}>
                    {t.type === 'success' && <CheckCircle2 size={18} />}
                    {t.type === 'error' && <AlertCircle size={18} />}
                    {t.type === 'magic' && <Sparkles size={18} />}
                    {t.type === 'info' && <Info size={18} />}
                </div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm font-medium text-zinc-100 leading-snug tracking-wide">{t.message}</p>
                </div>
                <button onClick={() => removeToast(t.id)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X size={14} />
                </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
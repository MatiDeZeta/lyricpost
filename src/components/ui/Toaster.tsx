import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, Info, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ToastKind } from '@/types';

const ICON: Record<ToastKind, React.ComponentType<{ size?: number; className?: string }>> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const ACCENT: Record<ToastKind, string> = {
  success: 'text-white',
  error: 'text-red-300',
  info: 'text-neutral-300',
};

export default function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICON[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/95 backdrop-blur border border-white/[0.08] shadow-2xl shadow-black/60 max-w-sm"
            >
              <Icon size={13} className={ACCENT[t.kind]} />
              <span className="text-[12px] font-medium text-neutral-200">{t.message}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="ml-1 -mr-1 p-0.5 rounded hover:bg-white/[0.06] transition-colors"
                aria-label="Dismiss"
              >
                <X size={11} className="text-neutral-500" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

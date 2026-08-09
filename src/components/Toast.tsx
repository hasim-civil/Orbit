import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const toastColor: Record<ToastState['type'], string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-amber-500',
};

export function ToastStack({ toasts }: { toasts: ToastState[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[500] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={cn('rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(23,23,38,0.18)]', toastColor[t.type])}
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

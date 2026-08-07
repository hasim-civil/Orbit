import { AnimatePresence, motion } from 'framer-motion';
import './Toast.css';

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export function ToastStack({ toasts }: { toasts: ToastState[] }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast--${t.type}`}
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

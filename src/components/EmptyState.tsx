import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-3.5 shadow-sm">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-100" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = 'h-32' }: { className?: string }) {
  return <div className={`w-full animate-pulse rounded-[var(--radius-xl)] bg-neutral-100 ${className}`} />;
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] bg-neutral-0/60 px-6 py-12 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-muted-text">{icon}</div>
      <p className="m-0 font-semibold text-neutral-700">{title}</p>
      {subtitle && <p className="m-0 text-sm text-muted-text">{subtitle}</p>}
    </motion.div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  subtitle,
  onRetry,
}: {
  title?: string;
  subtitle?: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] bg-neutral-0/60 px-6 py-12 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-subtle text-danger">
        <AlertTriangle size={20} />
      </div>
      <p className="m-0 font-semibold text-neutral-700">{title}</p>
      {subtitle && <p className="m-0 text-sm text-muted-text">{subtitle}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white active:scale-95 transition-transform"
      >
        Try Again
      </button>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function SettingsSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <motion.section
      className="mb-4 overflow-hidden rounded-[var(--radius-xl)] bg-neutral-0 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
        <span className="text-brand">{icon}</span>
        <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-neutral-500">{title}</h3>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </motion.section>
  );
}

export function SettingsRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold text-neutral-900">{label}</p>
        {description && <p className="m-0 mt-0.5 text-xs text-muted-text">{description}</p>}
      </div>
      {control}
    </div>
  );
}

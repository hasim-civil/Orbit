import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: ReactNode;
  iconClass: 'blue' | 'purple' | 'orange' | 'red' | 'teal';
  value: string;
  label: string;
  index: number;
}

const iconBg: Record<StatCardProps['iconClass'], string> = {
  blue: 'bg-blue-100 text-blue-500',
  purple: 'bg-brand-subtle text-brand',
  orange: 'bg-amber-100 text-amber-500',
  red: 'bg-red-100 text-red-500',
  teal: 'bg-teal-100 text-teal-500',
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.05 * i },
  }),
};

export function StatCard({ icon, iconClass, value, label, index }: StatCardProps) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-transparent bg-neutral-0 p-4 shadow-[0_2px_6px_rgba(23,23,38,0.06),0_1px_2px_rgba(23,23,38,0.04)] [background-image:linear-gradient(var(--color-neutral-0),var(--color-neutral-0)),linear-gradient(150deg,rgba(107,78,255,0.14)_0%,rgba(0,184,169,0.10)_100%)] [background-origin:border-box] [background-clip:padding-box,border-box]"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={cn('grid h-9.5 w-9.5 shrink-0 place-items-center rounded-md', iconBg[iconClass])}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="m-0 text-md font-bold leading-tight tracking-tight text-neutral-900">{value}</h3>
        <p className="mt-0.5 text-2xs font-medium text-muted-text">{label}</p>
      </div>
    </motion.div>
  );
}

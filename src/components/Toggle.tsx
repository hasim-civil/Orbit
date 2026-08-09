import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-brand' : 'bg-neutral-200',
      )}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-neutral-0 shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

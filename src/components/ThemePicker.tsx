import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import type { Theme } from '@/store/settingsStore';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'glass', label: 'Glass', icon: Sparkles },
];

export function ThemePicker({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-neutral-50 p-1">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex flex-col items-center gap-1 rounded-[10px] py-2.5 text-xs font-semibold"
          >
            {active && (
              <motion.div
                layoutId="theme-picker-active"
                className="absolute inset-0 rounded-[10px] bg-neutral-0 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={cn('relative flex flex-col items-center gap-1', active ? 'text-brand' : 'text-muted-text')}>
              <Icon size={16} />
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

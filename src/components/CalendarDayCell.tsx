import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { resolveDotColor } from '@/lib/statusColors';
import type { ResolvedDay } from '@/types/attendance';

export function CalendarDayCell({
  dateStr,
  dayOfMonth,
  isToday,
  isSelected,
  resolved,
  index,
  onSelect,
}: {
  dateStr: string;
  dayOfMonth: number;
  isToday: boolean;
  isSelected: boolean;
  resolved: ResolvedDay | undefined;
  index: number;
  onSelect: () => void;
}) {
  const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const statusPart = resolved && resolved.status !== 'not-marked' ? `, ${resolved.statusLabel}` : '';
  const todayPart = isToday ? ', today' : '';

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={`${dayLabel}${todayPart}${statusPart}`}
      aria-pressed={isSelected}
      className={cn(
        'relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm font-semibold transition-colors',
        isSelected ? 'bg-brand text-white' : isToday ? 'bg-brand-subtle text-brand' : 'text-neutral-700 hover:bg-neutral-50',
      )}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26, delay: Math.min(index, 20) * 0.012 }}
      whileTap={{ scale: 0.9 }}
    >
      <span aria-hidden="true">{dayOfMonth}</span>
      {resolved && resolved.status !== 'not-marked' && (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            isSelected ? 'bg-neutral-0' : resolveDotColor(resolved.status, resolved.isLate),
          )}
        />
      )}
    </motion.button>
  );
}

import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { ResolvedDay } from '@/types/attendance';

export function DayRow({ day, index, showWeekday = false }: { day: ResolvedDay; index: number; showWeekday?: boolean }) {
  const date = new Date(day.dateStr);
  const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <motion.div
      className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-3.5 shadow-[0_1px_2px_rgba(23,23,38,0.05)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: Math.min(index, 8) * 0.03 }}
    >
      <div className="flex w-14 shrink-0 flex-col leading-tight">
        <span className="text-sm font-bold text-neutral-900">{dateLabel}</span>
        {showWeekday && <span className="text-2xs text-muted-text">{weekday}</span>}
      </div>

      <div className="flex flex-1 items-center gap-3 text-xs text-neutral-500">
        <span className="tabular-nums">{day.checkIn}</span>
        <span className="text-muted-text">→</span>
        <span className="tabular-nums">{day.checkOut}</span>
        {day.hours !== '--' && <span className="ml-auto font-semibold text-neutral-700 tabular-nums">{day.hours}</span>}
      </div>

      <StatusBadge status={day.status} label={day.statusLabel} workLocation={day.workLocation} isLate={day.isLate} />
    </motion.div>
  );
}

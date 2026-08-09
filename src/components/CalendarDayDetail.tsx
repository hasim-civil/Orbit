import { AnimatePresence, motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { ResolvedDay } from '@/types/attendance';

export function CalendarDayDetail({ day }: { day: ResolvedDay | null }) {
  return (
    <AnimatePresence mode="wait">
      {day && (
        <motion.div
          key={day.dateStr}
          className="overflow-hidden rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="m-0 text-sm font-bold text-neutral-900">
              {new Date(day.dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <StatusBadge status={day.status} label={day.statusLabel} workLocation={day.workLocation} isLate={day.isLate} />
          </div>

          {(day.status === 'present' || day.status === 'incomplete') && (
            <div className="grid grid-cols-3 gap-3">
              <DetailField label="Check In" value={day.checkIn} />
              <DetailField label="Check Out" value={day.checkOut} />
              <DetailField label="Hours" value={day.hours} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[10px] bg-neutral-50 px-3 py-2.5">
      <span className="text-2xs font-bold uppercase tracking-wide text-muted-text">{label}</span>
      <span className="text-sm font-bold tabular-nums text-neutral-900">{value}</span>
    </div>
  );
}

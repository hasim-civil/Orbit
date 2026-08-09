import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import type { EmployeeTodayStatus } from '@/services/adminService';

export function EmployeeRow({ entry, index, onClick }: { entry: EmployeeTodayStatus; index: number; onClick: () => void }) {
  const { user, today } = entry;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-3.5 text-left shadow-sm active:scale-[0.99] transition-transform"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: Math.min(index, 12) * 0.03 }}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-sm font-bold text-white">
        {(user.name || '?').charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-neutral-900">{user.name}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
          <span className="tabular-nums">{today.checkIn}</span>
          {today.checkOut !== '--' && (
            <>
              <span className="text-muted-text">→</span>
              <span className="tabular-nums">{today.checkOut}</span>
            </>
          )}
          {today.hours !== '--' && <span className="ml-auto font-semibold text-neutral-700 tabular-nums">{today.hours}</span>}
        </div>
      </div>

      <StatusBadge status={today.status} label={today.statusLabel} workLocation={today.workLocation} isLate={today.isLate} />
    </motion.button>
  );
}

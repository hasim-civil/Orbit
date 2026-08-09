import { motion } from 'framer-motion';
import { Pencil, Trash2, PartyPopper } from 'lucide-react';
import type { Holiday } from '@/types/attendance';

function formatDateLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function HolidayCard({
  holiday,
  index,
  onEdit,
  onDelete,
  deleting,
  canManage = true,
}: {
  holiday: Holiday;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  /** Hides edit/delete for non-admins. The Firestore rules are the real
   * enforcement (holidays/{date} write requires isAdmin()); this only keeps
   * the UI from offering an action that would fail. */
  canManage?: boolean;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: Math.min(index, 10) * 0.04 }}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-500">
        <PartyPopper size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-neutral-900">{holiday.name}</p>
        <p className="m-0 mt-0.5 text-xs text-neutral-500">{formatDateLabel(holiday.date)}</p>
      </div>

      {canManage && (
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-text transition-colors hover:bg-neutral-50 hover:text-brand active:scale-90"
            aria-label="Edit holiday"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-text transition-colors hover:bg-red-50 hover:text-danger active:scale-90 disabled:opacity-40"
            aria-label="Delete holiday"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

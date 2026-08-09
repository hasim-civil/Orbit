import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { LEAVE_TYPE_META, type LeaveEntry } from '@/lib/leaveGrouping';

function formatDateLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function LeaveCard({
  entry,
  index,
  onEdit,
  onDelete,
  deleting,
}: {
  entry: LeaveEntry;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const meta = LEAVE_TYPE_META[entry.leaveType];
  const dateLabel = entry.isRange
    ? `${formatDateLabel(entry.startDate)} → ${formatDateLabel(entry.endDate)}`
    : formatDateLabel(entry.startDate);

  return (
    <motion.div
      layout
      className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: Math.min(index, 10) * 0.04 }}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.colorClass}`}>
            {meta.label}
          </span>
          {entry.isRange && (
            <span className="text-2xs font-semibold text-muted-text">{entry.dates.length} days</span>
          )}
        </div>
        <p className="m-0 text-sm font-bold text-neutral-900">{dateLabel}</p>
        {entry.reason && <p className="m-0 mt-1 text-xs text-neutral-500">{entry.reason}</p>}
      </div>

      <div className="flex shrink-0 gap-1">
        {!entry.isRange && (
          <button
            type="button"
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-text transition-colors hover:bg-neutral-50 hover:text-brand active:scale-90"
            aria-label="Edit leave"
          >
            <Pencil size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="grid h-8 w-8 place-items-center rounded-full text-muted-text transition-colors hover:bg-red-50 hover:text-danger active:scale-90 disabled:opacity-40"
          aria-label="Delete leave"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

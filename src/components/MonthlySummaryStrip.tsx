import { motion } from 'framer-motion';

export interface SummaryTile {
  label: string;
  value: number | string;
  color: string; // Tailwind text-color class
}

/** Generic responsive tile strip — wraps instead of forcing a fixed column
 * count, so the same component works for Attendance's 5-tile summary and
 * Reports' 6-tile breakdown without duplicating markup. */
export function MonthlySummaryStrip({ items }: { items: SummaryTile[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="flex flex-col items-center gap-0.5 rounded-[var(--radius-lg)] bg-neutral-0 py-2.5 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.04 }}
        >
          <span className={`text-md font-bold tabular-nums ${item.color}`}>{item.value}</span>
          <span className="text-2xs font-medium text-muted-text text-center px-1">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { TrendPoint } from '@/lib/reportMetrics';

const STATUS_COLOR: Record<string, string> = {
  present: '#12A150', // success
  incomplete: '#F5A524', // amber (worked but never checked out)
  absent: '#E5484D', // danger
  'paid-leave': '#6B4EFF', // brand
  holiday: '#3E7BFA', // blue
  'week-off': '#C4C4D6', // neutral-300
  'not-marked': '#EDEDF4',
};
const LATE_COLOR = '#F59E0B';

interface ChartRow {
  day: number;
  dateStr: string;
  height: number; // 1 for every eligible bar so the chart reads as a status strip, not a magnitude chart
  status: string;
  isLate: boolean;
  label: string;
}

const STATUS_LABEL: Record<string, string> = {
  present: 'Present',
  incomplete: 'Incomplete',
  absent: 'Absent',
  'paid-leave': 'Paid Leave',
  holiday: 'Holiday',
  'week-off': 'Week Off',
  'not-marked': 'Not marked',
};

export function AttendanceTrendChart({ trend }: { trend: TrendPoint[] }) {
  const rows: ChartRow[] = useMemo(
    () =>
      trend.map((t) => ({
        day: t.dayOfMonth,
        dateStr: t.dateStr,
        height: 1,
        status: t.status,
        isLate: t.isLate,
        label: t.isLate ? 'Late' : STATUS_LABEL[t.status] ?? t.status,
      })),
    [trend],
  );

  if (rows.length === 0) return null;

  return (
    <motion.div
      className="h-[120px] w-full"
      initial={{ opacity: 0, scaleY: 0.7 }}
      animate={{ opacity: 1, scaleY: 1 }}
      style={{ transformOrigin: 'bottom' }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap={2}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: '#9A9AB0' }}
            axisLine={false}
            tickLine={false}
            interval={rows.length > 20 ? 3 : 1}
          />
          <Tooltip
            cursor={{ fill: 'rgba(107,78,255,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as ChartRow;
              return (
                <div className="rounded-lg bg-neutral-900 px-2.5 py-1.5 text-2xs font-semibold text-white shadow-lg">
                  {new Date(row.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {row.label}
                </div>
              );
            }}
          />
          <Bar dataKey="height" radius={[3, 3, 3, 3]} maxBarSize={14}>
            {rows.map((row) => (
              <Cell key={row.dateStr} fill={row.isLate ? LATE_COLOR : STATUS_COLOR[row.status] ?? '#EDEDF4'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

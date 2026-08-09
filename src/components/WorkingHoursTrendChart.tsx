import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrendPoint } from '@/lib/reportMetrics';

export function WorkingHoursTrendChart({ trend }: { trend: TrendPoint[] }) {
  const rows = useMemo(
    () =>
      trend
        .filter((t) => t.hoursValue !== null)
        .map((t) => ({ day: t.dayOfMonth, dateStr: t.dateStr, hours: Math.round((t.hoursValue ?? 0) * 100) / 100 })),
    [trend],
  );

  if (rows.length < 2) return null; // a single point isn't a "trend"

  return (
    <motion.div
      className="h-[130px] w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.15 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9A9AB0' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#9A9AB0' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            cursor={{ stroke: '#6B4EFF', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as { dateStr: string; hours: number };
              return (
                <div className="rounded-lg bg-neutral-900 px-2.5 py-1.5 text-2xs font-semibold text-white shadow-lg">
                  {new Date(row.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {row.hours}h
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#6B4EFF"
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: '#6B4EFF', strokeWidth: 0 }}
            activeDot={{ r: 4.5 }}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

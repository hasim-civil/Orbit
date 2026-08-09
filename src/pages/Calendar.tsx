import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarX2 } from 'lucide-react';
import { CalendarMonthNav } from '@/components/CalendarMonthNav';
import { CalendarDayCell } from '@/components/CalendarDayCell';
import { CalendarLegend } from '@/components/CalendarLegend';
import { CalendarDayDetail } from '@/components/CalendarDayDetail';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyHistory } from '@/hooks/useAttendanceQueries';
import { buildMonthGrid, WEEKDAY_LABELS } from '@/lib/calendarGrid';
import { getTodayDate, LAUNCH_DATE } from '@/lib/attendanceLogic';
import type { ResolvedDay } from '@/types/attendance';

export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayDate());

  const { data: monthly, isLoading } = useMonthlyHistory(user?.uid, year, month);

  const resolvedByDate = useMemo(() => {
    const map = new Map<string, ResolvedDay>();
    (monthly ?? []).forEach((d) => map.set(d.dateStr, d));
    return map;
  }, [monthly]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const todayStr = getTodayDate();
  const canGoNext = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());
  const launchYear = parseInt(LAUNCH_DATE.split('-')[0], 10);
  const launchMonth = parseInt(LAUNCH_DATE.split('-')[1], 10) - 1;
  const canGoPrev = year > launchYear || (year === launchYear && month > launchMonth);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else { setMonth((m) => m - 1); }
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else { setMonth((m) => m + 1); }
  };

  const selectedDay = selectedDate ? resolvedByDate.get(selectedDate) ?? null : null;
  const hasAnyData = (monthly ?? []).some((d) => d.status !== 'not-marked');

  return (
    <>
      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Calendar</h2>
      </motion.header>

      <main className="pt-1 pb-6">
        <motion.div
          className="mb-4 rounded-[var(--radius-xl)] bg-neutral-0 p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <div className="mb-4">
            <CalendarMonthNav year={year} month={month} onPrev={goPrev} onNext={goNext} canGoNext={canGoNext} />
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="text-center text-2xs font-bold uppercase text-muted-text">{d}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-neutral-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, i) =>
                cell.dateStr && cell.dayOfMonth ? (
                  <CalendarDayCell
                    key={cell.dateStr}
                    dateStr={cell.dateStr}
                    dayOfMonth={cell.dayOfMonth}
                    isToday={cell.dateStr === todayStr}
                    isSelected={cell.dateStr === selectedDate}
                    resolved={resolvedByDate.get(cell.dateStr)}
                    index={i}
                    onSelect={() => setSelectedDate(cell.dateStr)}
                  />
                ) : (
                  <div key={`blank-${i}`} />
                ),
              )}
            </div>
          )}

          <div className="mt-4 border-t border-neutral-100 pt-3">
            <CalendarLegend />
          </div>
        </motion.div>

        {!isLoading && !hasAnyData ? (
          <EmptyState icon={<CalendarX2 size={22} />} title="No records this month" subtitle="Tap a date once attendance has been tracked." />
        ) : (
          <CalendarDayDetail day={selectedDay} />
        )}
      </main>
    </>
  );
}

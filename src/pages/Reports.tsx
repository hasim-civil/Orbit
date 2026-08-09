import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { BarChart3, Clock, TrendingUp, FileWarning } from 'lucide-react';
import { AttendancePercentRing } from '@/components/AttendancePercentRing';
import { AttendanceTrendChart } from '@/components/AttendanceTrendChart';
import { WorkingHoursTrendChart } from '@/components/WorkingHoursTrendChart';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { MonthlySummaryStrip, type SummaryTile } from '@/components/MonthlySummaryStrip';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyReport } from '@/hooks/useAttendanceQueries';
import { formatHoursMinutes } from '@/lib/attendanceLogic';

export default function Reports() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { summary, trend, data, isLoading, isError, refetch } = useMonthlyReport(user?.uid, year, month);

  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = document.documentElement.getAttribute('data-motion') === 'off';
    if (reduced || !pageRef.current || isLoading) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-report-block]', {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, [year, month, isLoading]);

  const hasAnyRecord = (data ?? []).some((d) => d.status !== 'not-marked');

  const summaryTiles: SummaryTile[] = [
    { label: 'Present', value: summary.presentDays, color: 'text-success' },
    { label: 'Late', value: summary.lateDays, color: 'text-amber-500' },
    { label: 'Absent', value: summary.absentDays, color: 'text-danger' },
    { label: 'Paid Leave', value: summary.paidLeaveDays, color: 'text-brand' },
    { label: 'Holiday', value: summary.holidayDays, color: 'text-blue-500' },
    { label: 'Week Off', value: summary.weekOffDays, color: 'text-neutral-500' },
  ];

  return (
    <div ref={pageRef}>
      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Reports</h2>
      </motion.header>

      <main className="pt-1 pb-6">
        <div data-report-block className="mb-4 flex items-center justify-between gap-3">
          <p className="m-0 text-sm text-neutral-500">Monthly summary</p>
          <MonthYearFilter month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        </div>

        {isError ? (
          <ErrorState
            title="Couldn't load your report"
            subtitle="Check your connection and try again."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-4">
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-40" />
          </div>
        ) : !hasAnyRecord ? (
          <EmptyState
            icon={<FileWarning size={22} />}
            title="No data for this month"
            subtitle="Reports will populate once attendance has been tracked."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Attendance percentage — the headline metric */}
            <motion.div data-report-block className="rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm">
              <AttendancePercentRing percent={summary.attendancePercent} />
              <p className="m-0 mt-3 text-center text-xs text-muted-text">
                {summary.presentDays} of {summary.workingDays} working day{summary.workingDays === 1 ? '' : 's'} present
              </p>
            </motion.div>

            {/* Present / Late / Absent / Leave / Holiday / Week Off breakdown */}
            <div data-report-block>
              <MonthlySummaryStrip items={summaryTiles} />
            </div>

            {/* Working hours */}
            <motion.div data-report-block className="rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Clock size={16} className="text-brand" />
                <h3 className="m-0 text-sm font-bold text-neutral-900">Working Hours</h3>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <HourStat
                  label="Avg / Day"
                  value={summary.avgHoursPerDay !== null ? formatHoursMinutes(summary.avgHoursPerDay) : '--'}
                />
                <HourStat label="Total" value={formatHoursMinutes(summary.totalHours)} />
              </div>
              <WorkingHoursTrendChart trend={trend} />
            </motion.div>

            {/* Attendance trend */}
            <motion.div data-report-block className="rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand" />
                <h3 className="m-0 text-sm font-bold text-neutral-900">Attendance Trend</h3>
              </div>
              <AttendanceTrendChart trend={trend} />
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                <LegendDot color="bg-success" label="Present" />
                <LegendDot color="bg-amber-500" label="Late" />
                <LegendDot color="bg-danger" label="Absent" />
                <LegendDot color="bg-brand" label="Paid Leave" />
                <LegendDot color="bg-blue-500" label="Holiday" />
                <LegendDot color="bg-neutral-300" label="Week Off" />
              </div>
            </motion.div>

            <div data-report-block className="flex items-center gap-2 px-1 text-2xs text-muted-text">
              <BarChart3 size={13} />
              Based on {data?.length ?? 0} tracked day{(data?.length ?? 0) === 1 ? '' : 's'} this month.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function HourStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-neutral-50 px-4 py-3.5">
      <span className="text-2xs font-bold uppercase tracking-wide text-muted-text">{label}</span>
      <span className="text-base font-bold tabular-nums">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs font-medium text-neutral-500">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

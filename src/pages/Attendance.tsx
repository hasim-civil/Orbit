import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, CalendarX2, Search as SearchIcon } from 'lucide-react';
import { ShiftRing } from '@/components/ShiftRing';
import { SpringButton } from '@/components/SpringButton';
import { DayRow } from '@/components/DayRow';
import { SkeletonList, EmptyState } from '@/components/EmptyState';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { MonthlySummaryStrip, type SummaryTile } from '@/components/MonthlySummaryStrip';
import { ToastStack, type ToastState } from '@/components/Toast';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/hooks/useSuccessAnimation';
import { trackEvent } from '@/lib/analytics';
import { AddPastAttendanceModal } from '@/components/AddPastAttendanceModal';
import { EditTimeModal } from '@/components/EditTimeModal';
import { useAuth } from '@/hooks/useAuth';
import {
  useAttendanceTimeline,
  useCheckIn,
  useCheckOut,
  useMonthlyHistory,
  useTodayAttendance,
} from '@/hooks/useAttendanceQueries';
import { formatTime } from '@/lib/attendanceLogic';
import { summarizeMonth } from '@/lib/reportMetrics';
import type { DayStatus } from '@/types/attendance';

let toastId = 0;

export default function Attendance() {
  const { user } = useAuth();
  const { data: record } = useTodayAttendance(user?.uid);
  const checkInMutation = useCheckIn(user?.uid);
  const checkOutMutation = useCheckOut(user?.uid);

  const [toasts, setToasts] = useState<ToastState[]>([]);
  const successAnim = useSuccessAnimation();
  const [addPastOpen, setAddPastOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DayStatus | 'all'>('all');

  const { data: timeline, isLoading: timelineLoading } = useAttendanceTimeline(user?.uid, 7);
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyHistory(user?.uid, filterYear, filterMonth);

  const pushToast = (message: string, type: ToastState['type']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync();
      pushToast('Checked in successfully!', 'success');
      successAnim.trigger();
      trackEvent('check_in');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to check in.', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync();
      pushToast('Checked out successfully!', 'success');
      successAnim.trigger();
      trackEvent('check_out');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to check out.', 'error');
    }
  };

  const checkedIn = !!record?.checkIn;
  const checkedOut = !!record?.checkOut;
  const checkInDate = record?.checkIn ? (record.checkIn as unknown as { toDate: () => Date }).toDate() : null;
  const checkOutDate = record?.checkOut ? (record.checkOut as unknown as { toDate: () => Date }).toDate() : null;
  const busy = checkInMutation.isPending || checkOutMutation.isPending;

  const reportSummary = summarizeMonth(monthly ?? []);
  const summaryTiles: SummaryTile[] = [
    { label: 'Present', value: reportSummary.presentDays, color: 'text-success' },
    { label: 'Week Off', value: reportSummary.weekOffDays, color: 'text-neutral-500' },
    { label: 'Holiday', value: reportSummary.holidayDays, color: 'text-blue-500' },
    { label: 'Paid Leave', value: reportSummary.paidLeaveDays, color: 'text-brand' },
    { label: 'Absent', value: reportSummary.absentDays, color: 'text-danger' },
  ];

  const filteredMonthly = useMemo(() => {
    let rows = monthly ?? [];
    if (statusFilter !== 'all') {
      rows = rows.filter((d) => d.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((d) => {
        const dateLabel = new Date(d.dateStr)
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' })
          .toLowerCase();
        return dateLabel.includes(q) || d.statusLabel.toLowerCase().includes(q);
      });
    }
    return rows;
  }, [monthly, statusFilter, search]);

  return (
    <>
      <ToastStack toasts={toasts} />
      <SuccessAnimation show={successAnim.visible} />

      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">My Attendance</h2>
      </motion.header>

      <main className="pt-1 pb-4">
        <motion.div
          className="relative isolate mb-5 overflow-hidden rounded-[var(--radius-xl)] border border-transparent bg-neutral-0 shadow-[0_18px_48px_rgba(23,23,38,0.08),0_4px_12px_rgba(23,23,38,0.05)] [background-image:linear-gradient(var(--color-neutral-0),var(--color-neutral-0)),linear-gradient(135deg,rgba(107,78,255,0.28)_0%,rgba(0,184,169,0.22)_45%,rgba(174,155,255,0.26)_100%)] [background-origin:border-box] [background-clip:padding-box,border-box]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div className="pointer-events-none absolute -inset-10 -z-10 blur-[10px] [background:radial-gradient(70%_70%_at_50%_32%,rgba(107,78,255,0.20)_0%,rgba(0,184,169,0.12)_45%,transparent_78%)]" />
          <div className="p-5">
            <ShiftRing record={record ?? null} />
            <div className="mb-3 grid grid-cols-2 gap-3">
              <SpringButton variant="success" disabled={checkedIn || busy} onClick={handleCheckIn}>Check In</SpringButton>
              <SpringButton variant="danger" disabled={!checkedIn || checkedOut || busy} onClick={handleCheckOut}>Check Out</SpringButton>
            </div>
            <div className="flex flex-col gap-3">
              <SpringButton variant="secondary" fullWidth onClick={() => setAddPastOpen(true)}>Add Past Attendance</SpringButton>
              {checkedIn && (
                <SpringButton variant="secondary" fullWidth onClick={() => setEditTimeOpen(true)}>Edit Time</SpringButton>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DetailBox label="Check In" value={checkInDate ? formatTime(checkInDate) : '--:--'} />
              <DetailBox label="Check Out" value={checkOutDate ? formatTime(checkOutDate) : '--:--'} />
            </div>
          </div>
        </motion.div>

        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <History size={18} className="text-brand" />
            <h3 className="m-0 text-md font-bold">Timeline</h3>
          </div>
          {timelineLoading ? (
            <SkeletonList rows={5} />
          ) : timeline && timeline.length > 0 ? (
            <div className="flex flex-col gap-2">
              {timeline.map((day, i) => (
                <DayRow key={day.dateStr} day={day} index={i} showWeekday />
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarX2 size={22} />} title="No recent attendance" subtitle="Records will appear here once tracked." />
          )}
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-md font-bold">Monthly History</h3>
            <MonthYearFilter month={filterMonth} year={filterYear} onMonthChange={setFilterMonth} onYearChange={setFilterYear} />
          </div>

          <div className="mb-4">
            <MonthlySummaryStrip items={summaryTiles} />
          </div>

          <div className="mb-4">
            <SearchFilterBar search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
          </div>

          {monthlyLoading ? (
            <SkeletonList rows={6} />
          ) : filteredMonthly.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredMonthly.map((day, i) => (
                <DayRow key={day.dateStr} day={day} index={i} showWeekday />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<SearchIcon size={22} />}
              title="No matching records"
              subtitle={search || statusFilter !== 'all' ? 'Try a different search or filter.' : 'No attendance records for this month.'}
            />
          )}
        </section>
      </main>

      <AddPastAttendanceModal open={addPastOpen} onClose={() => setAddPastOpen(false)} uid={user?.uid} onSaved={(msg) => pushToast(msg, 'success')} />
      <EditTimeModal open={editTimeOpen} onClose={() => setEditTimeOpen(false)} uid={user?.uid} record={record} onSaved={(msg) => pushToast(msg, 'success')} />
    </>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-neutral-50 px-4 py-3.5">
      <span className="text-2xs font-bold uppercase tracking-wide text-muted-text">{label}</span>
      <span className="text-base font-bold tabular-nums">{value}</span>
    </div>
  );
}

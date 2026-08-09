import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Hourglass,
  ArrowDown,
  ArrowUp,
  TriangleAlert,
} from 'lucide-react';
import { ShiftRing } from '@/components/ShiftRing';
import { StatCard } from '@/components/StatCard';
import { SpringButton } from '@/components/SpringButton';
import { ToastStack, type ToastState } from '@/components/Toast';
import { AddPastAttendanceModal } from '@/components/AddPastAttendanceModal';
import { EditTimeModal } from '@/components/EditTimeModal';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { CreatorCredit } from '@/components/CreatorCredit';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/hooks/useSuccessAnimation';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks/useAuth';
import {
  useCheckIn,
  useCheckOut,
  useMonthlyStats,
  useTodayAttendance,
} from '@/hooks/useAttendanceQueries';
import { formatHoursMinutes, formatTime } from '@/lib/attendanceLogic';

let toastId = 0;

export default function Dashboard() {
  const { user, userData } = useAuth();
  const { data: record, isLoading: recordLoading } = useTodayAttendance(user?.uid);
  const stats = useMonthlyStats(user?.uid);
  const checkInMutation = useCheckIn(user?.uid);
  const checkOutMutation = useCheckOut(user?.uid);

  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [addPastOpen, setAddPastOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);
  const successAnim = useSuccessAnimation();

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
  const checkInDate = record?.checkIn
    ? (record.checkIn as unknown as { toDate: () => Date }).toDate()
    : null;
  const checkOutDate = record?.checkOut
    ? (record.checkOut as unknown as { toDate: () => Date }).toDate()
    : null;
  const busy = checkInMutation.isPending || checkOutMutation.isPending;

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <ToastStack toasts={toasts} />
      <SuccessAnimation show={successAnim.visible} />

      <motion.header
        className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-md font-bold">
          Welcome, <span className="text-brand">{userData?.name?.split(' ')[0] || 'there'}</span>!
        </h2>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 font-bold text-white">
          {(userData?.name || '?').charAt(0).toUpperCase()}
        </div>
      </motion.header>

      <main className="pt-1">
        {stats.isLoading || recordLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="my-4 grid grid-cols-2 gap-3">
              <StatCard
                index={0}
                iconClass="blue"
                value={String(stats.workingDays)}
                label="Working Days"
                icon={<CalendarDays size={18} />}
              />
              <StatCard
                index={1}
                iconClass="purple"
                value={String(stats.presentDays)}
                label="Present Days"
                icon={<CheckCircle2 size={18} />}
              />
              <StatCard
                index={2}
                iconClass="orange"
                value={formatHoursMinutes(stats.avgHoursPerDay)}
                label="Avg Hours/Day"
                icon={<Hourglass size={18} />}
              />
              <StatCard
                index={3}
                iconClass="red"
                value={formatHoursMinutes(stats.lessHours)}
                label="Less Hours"
                icon={<ArrowDown size={18} />}
              />
              <StatCard
                index={4}
                iconClass="teal"
                value={formatHoursMinutes(stats.overtimeHours)}
                label="Overtime"
                icon={<ArrowUp size={18} />}
              />
              <StatCard
                index={5}
                iconClass="red"
                value={String(stats.lateDays)}
                label="Late Days (this month)"
                icon={<TriangleAlert size={18} />}
              />
            </div>

            <motion.div
              className="relative isolate overflow-hidden rounded-[var(--radius-xl)] border border-transparent bg-neutral-0 shadow-[0_18px_48px_rgba(23,23,38,0.08),0_4px_12px_rgba(23,23,38,0.05)] [background-image:linear-gradient(var(--color-neutral-0),var(--color-neutral-0)),linear-gradient(135deg,rgba(107,78,255,0.28)_0%,rgba(0,184,169,0.22)_45%,rgba(174,155,255,0.26)_100%)] [background-origin:border-box] [background-clip:padding-box,border-box]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.2 }}
            >
              <div className="pointer-events-none absolute -inset-10 -z-10 blur-[10px] [background:radial-gradient(70%_70%_at_50%_32%,rgba(107,78,255,0.20)_0%,rgba(0,184,169,0.12)_45%,transparent_78%)]" />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
                <h3 className="m-0 text-md font-bold text-neutral-900">Today's Attendance</h3>
                <span className="rounded-full bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600">
                  {todayLabel}
                </span>
              </div>

              <div className="p-5">
                <ShiftRing record={record ?? null} />

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <SpringButton
                    variant="success"
                    disabled={checkedIn || busy}
                    onClick={handleCheckIn}
                  >
                    Check In
                  </SpringButton>
                  <SpringButton
                    variant="danger"
                    disabled={!checkedIn || checkedOut || busy}
                    onClick={handleCheckOut}
                  >
                    Check Out
                  </SpringButton>
                </div>

                <div className="mb-1 flex flex-col gap-3">
                  <SpringButton variant="secondary" fullWidth onClick={() => setAddPastOpen(true)}>
                    Add Past Attendance
                  </SpringButton>
                  {checkedIn && (
                    <SpringButton
                      variant="secondary"
                      fullWidth
                      onClick={() => setEditTimeOpen(true)}
                    >
                      Edit Time
                    </SpringButton>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <DetailBox
                    label="Check In"
                    value={checkInDate ? formatTime(checkInDate) : '--:--'}
                  />
                  <DetailBox
                    label="Check Out"
                    value={checkOutDate ? formatTime(checkOutDate) : '--:--'}
                  />
                  <DetailBox
                    label="Working Hours"
                    value={
                      record?.totalHours != null ? formatHoursMinutes(record.totalHours) : '--:--'
                    }
                  />
                  <DetailBox
                    label="Status"
                    value={
                      record?.status === 'present'
                        ? 'Present'
                        : record?.status === 'incomplete'
                          ? 'In Progress'
                          : 'Not checked in'
                    }
                  />
                </div>
              </div>
            </motion.div>

            <div className="mt-6 mb-2">
              <CreatorCredit />
            </div>
          </>
        )}
      </main>

      <AddPastAttendanceModal
        open={addPastOpen}
        onClose={() => setAddPastOpen(false)}
        uid={user?.uid}
        onSaved={(msg) => pushToast(msg, 'success')}
      />
      <EditTimeModal
        open={editTimeOpen}
        onClose={() => setEditTimeOpen(false)}
        uid={user?.uid}
        record={record}
        onSaved={(msg) => pushToast(msg, 'success')}
      />
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

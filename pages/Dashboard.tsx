import { useState } from 'react';
import { motion } from 'framer-motion';
import { AuroraBackground } from '../components/AuroraBackground';
import { ShiftRing } from '../components/ShiftRing';
import { StatCard } from '../components/StatCard';
import { SpringButton } from '../components/SpringButton';
import { ToastStack, type ToastState } from '../components/Toast';
import { AddPastAttendanceModal } from '../components/AddPastAttendanceModal';
import { EditTimeModal } from '../components/EditTimeModal';
import { useAuthUser, useMonthlyStats, useTodayAttendance } from '../hooks/useAttendance';
import { formatHoursMinutes, formatTime } from '../lib/attendanceLogic';
import './Dashboard.css';

let toastId = 0;

export default function Dashboard() {
  const { user, userData, authLoading } = useAuthUser();
  const { record, checkIn, checkOut } = useTodayAttendance(user?.uid);
  const stats = useMonthlyStats(user?.uid);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [busy, setBusy] = useState(false);
  const [addPastOpen, setAddPastOpen] = useState(false);
  const [editTimeOpen, setEditTimeOpen] = useState(false);

  const pushToast = (message: string, type: ToastState['type']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      await checkIn();
      pushToast('Checked in successfully!', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to check in.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    try {
      await checkOut();
      pushToast('Checked out successfully!', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to check out.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <AuroraBackground />
        <div className="dashboard-loading__spinner" />
      </div>
    );
  }

  const checkedIn = !!record?.checkIn;
  const checkedOut = !!record?.checkOut;
  const checkInDate = record?.checkIn ? (record.checkIn as unknown as { toDate: () => Date }).toDate() : null;
  const checkOutDate = record?.checkOut ? (record.checkOut as unknown as { toDate: () => Date }).toDate() : null;

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="dashboard-page">
      <AuroraBackground />
      <ToastStack toasts={toasts} />

      <motion.header
        className="dashboard-topbar"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="welcome-text">
          <h2>
            Welcome, <span>{userData?.name?.split(' ')[0] || 'there'}</span>!
          </h2>
        </div>
        <div className="avatar-badge">{(userData?.name || '?').charAt(0).toUpperCase()}</div>
      </motion.header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <StatCard index={0} iconClass="blue" value={String(stats.workingDays)} label="Working Days" icon={<CalendarIcon />} />
          <StatCard index={1} iconClass="purple" value={String(stats.presentDays)} label="Present Days" icon={<CheckIcon />} />
          <StatCard index={2} iconClass="orange" value={formatHoursMinutes(stats.avgHoursPerDay)} label="Avg Hours/Day" icon={<HourglassIcon />} />
          <StatCard index={3} iconClass="red" value={formatHoursMinutes(stats.lessHours)} label="Less Hours" icon={<DownIcon />} />
          <StatCard index={4} iconClass="teal" value={formatHoursMinutes(stats.overtimeHours)} label="Overtime" icon={<UpIcon />} />
          <StatCard index={5} iconClass="red" value={String(stats.lateDays)} label="Late Days (this month)" icon={<WarnIcon />} />
        </div>

        <motion.div
          className="attendance-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.2 }}
        >
          <div className="attendance-card__glow" />
          <div className="attendance-card__header">
            <h3>Today's Attendance</h3>
            <span className="today-pill">{todayLabel}</span>
          </div>

          <div className="attendance-card__body">
            <ShiftRing record={record} />

            <div className="action-buttons">
              <SpringButton variant="success" disabled={checkedIn || busy} onClick={handleCheckIn}>
                Check In
              </SpringButton>
              <SpringButton variant="danger" disabled={!checkedIn || checkedOut || busy} onClick={handleCheckOut}>
                Check Out
              </SpringButton>
            </div>

            <div className="secondary-actions">
              <SpringButton variant="secondary" fullWidth onClick={() => setAddPastOpen(true)}>
                Add Past Attendance
              </SpringButton>
              {checkedIn && (
                <SpringButton variant="secondary" fullWidth onClick={() => setEditTimeOpen(true)}>
                  Edit Time
                </SpringButton>
              )}
            </div>

            <div className="detail-grid">
              <DetailBox label="Check In" value={checkInDate ? formatTime(checkInDate) : '--:--'} />
              <DetailBox label="Check Out" value={checkOutDate ? formatTime(checkOutDate) : '--:--'} />
              <DetailBox label="Working Hours" value={record?.totalHours != null ? formatHoursMinutes(record.totalHours) : '--:--'} />
              <DetailBox label="Status" value={record?.status === 'present' ? 'Present' : record?.status === 'incomplete' ? 'In Progress' : 'Not checked in'} />
            </div>
          </div>
        </motion.div>
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
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-box">
      <span className="detail-box__label">{label}</span>
      <span className="detail-box__value">{value}</span>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" />
    </svg>
  );
}
function HourglassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 22h14M5 2h14M5 2v4l7 6-7 6v4M19 2v4l-7 6 7 6v4" />
    </svg>
  );
}
function DownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}
function UpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  );
}

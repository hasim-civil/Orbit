/**
 * Domain logic ported 1:1 from the original js/attendance.js so the React
 * dashboard produces identical numbers against the same Firestore data.
 */
import type { AttendanceRecord, Holiday, PaidLeave, ResolvedDay, WorkLocation } from '@/types/attendance';

// Check-ins at or after this time are considered "late".
const LATE_CUTOFF_HOUR = 11;
const LATE_CUTOFF_MIN = 1; // 11:01 AM

export function isLateCheckIn(checkInDate: Date | null): boolean {
  if (!checkInDate) return false;
  const h = checkInDate.getHours();
  const m = checkInDate.getMinutes();
  return h > LATE_CUTOFF_HOUR || (h === LATE_CUTOFF_HOUR && m >= LATE_CUTOFF_MIN);
}

/** Local YYYY-MM-DD, matching js/auth.js's toLocalDateString (no UTC shift). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDate(): string {
  return toLocalDateString(new Date());
}

export function formatHoursMinutes(hoursDecimal: number): string {
  const totalMinutes = Math.round(hoursDecimal * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ---------------------------------------------------------------------------
// Attendance history resolution — ported from js/leave-holiday.js so the
// React history views (Timeline, Monthly table) apply the exact same
// Paid Leave > Holiday > Week Off > Attendance > Absent priority.
// ---------------------------------------------------------------------------

/** Date the attendance system went live. Dates before this are never shown
 * as Present/Absent/Week Off/etc. in history views. */
export const LAUNCH_DATE = '2026-08-01';

/** 0 = Sunday, 1 = Monday, ... 6 = Saturday. Currently: Sunday only. */
const WEEK_OFF_DAYS = [0];

export function isWeekOff(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return WEEK_OFF_DAYS.includes(day);
}

export const WORK_LOCATION_META: Record<WorkLocation, { label: string; icon: string }> = {
  office: { label: 'Present', icon: '🏢' },
  outstation: { label: 'Outstation', icon: '🚗' },
  wfh: { label: 'WFH', icon: '🏠' },
};

export function getWorkLocationMeta(location: string | null | undefined) {
  return WORK_LOCATION_META[(location as WorkLocation) ?? 'office'] ?? WORK_LOCATION_META.office;
}

const STANDARD_HOURS = 8;

export function resolveDayStatus(params: {
  dateStr: string;
  attendanceData: AttendanceRecord | null;
  holiday: Holiday | null;
  paidLeave: PaidLeave | null;
  isFutureOrToday?: boolean;
}): ResolvedDay {
  const { dateStr, attendanceData, holiday, paidLeave, isFutureOrToday = false } = params;

  const NA = {
    checkIn: '--', checkOut: '--', hours: '--', hoursValue: null as number | null,
    lessValue: 0, overtimeValue: 0, workLocation: null as WorkLocation | null, countsAsPresent: false,
    isLate: false,
  };

  if (paidLeave) {
    return { dateStr, status: 'paid-leave', statusLabel: 'Paid Leave', ...NA };
  }
  if (holiday) {
    return { dateStr, status: 'holiday', statusLabel: 'Holiday', ...NA };
  }
  if (isWeekOff(dateStr)) {
    return { dateStr, status: 'week-off', statusLabel: 'Week Off', ...NA };
  }
  if (attendanceData) {
    const checkIn = attendanceData.checkIn ? formatTime((attendanceData.checkIn as unknown as { toDate: () => Date }).toDate()) : '--:--';
    const checkOut = attendanceData.checkOut ? formatTime((attendanceData.checkOut as unknown as { toDate: () => Date }).toDate()) : '--:--';
    const isPresent = attendanceData.status === 'present';
    const hoursValue = isPresent ? (attendanceData.totalHours ?? 0) : null;
    const hours = hoursValue !== null ? formatHoursMinutes(hoursValue) : '--';

    let lessValue = 0;
    let overtimeValue = 0;
    if (isPresent && hoursValue !== null) {
      const diff = hoursValue - STANDARD_HOURS;
      if (diff < 0) lessValue = Math.abs(diff);
      else if (diff > 0) overtimeValue = diff;
    }

    const workLocation = (attendanceData.workLocation as WorkLocation) || 'office';
    const meta = getWorkLocationMeta(workLocation);
    const statusLabel = isPresent ? `${meta.icon} ${meta.label}` : 'Incomplete';

    return {
      dateStr,
      status: isPresent ? 'present' : 'incomplete',
      statusLabel, checkIn, checkOut, hours, hoursValue, lessValue, overtimeValue,
      workLocation, countsAsPresent: isPresent,
      isLate: attendanceData.isLate ?? false,
    };
  }
  if (isFutureOrToday) {
    return { dateStr, status: 'not-marked', statusLabel: 'Not Checked In', ...NA };
  }
  return { dateStr, status: 'absent', statusLabel: 'Absent', ...NA };
}

export function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    days.push(toLocalDateString(new Date(year, month, d)));
  }
  return days;
}

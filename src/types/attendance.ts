import type { Timestamp } from 'firebase/firestore';

/** users/{uid} */
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: Timestamp;
}

/** attendance/{uid}/records/{date} — date key is 'YYYY-MM-DD' */
export interface AttendanceRecord {
  checkIn: Timestamp | null;
  checkOut: Timestamp | null;
  totalHours: number | null;
  status: 'incomplete' | 'present';
  date: string;
  workLocation: string;
  isLate?: boolean;
}

export interface MonthlyStats {
  workingDays: number;
  presentDays: number;
  avgHoursPerDay: number;
  lessHours: number;
  overtimeHours: number;
  lateDays: number;
}

/** holidays/{date} */
export interface Holiday {
  id: string;
  date: string;
  name: string;
  updatedAt?: Timestamp;
  updatedBy?: string | null;
}

/** paidLeaves/{uid}/records/{date} — one leave entry per date. A date range
 * is stored as one document per date, not a single ranged document, so the
 * existing date-keyed lookup (fetchRecordsInRange-style Map) works unchanged
 * for Calendar/Attendance/Reports. */
export type LeaveType = 'casual' | 'sick' | 'other';

export interface PaidLeave {
  id: string; // = date, 'YYYY-MM-DD'
  date: string;
  leaveType: LeaveType;
  reason?: string;
  createdAt?: Timestamp;
  /** Set when this date was added as part of a multi-day range, so the UI
   * can group/edit/delete the whole range together. Undefined for
   * single-day leaves. */
  rangeId?: string;
}

export type WorkLocation = 'office' | 'outstation' | 'wfh';

export type DayStatus =
  | 'paid-leave'
  | 'holiday'
  | 'week-off'
  | 'present'
  | 'incomplete'
  | 'not-marked'
  | 'absent';

/** Result of resolving what a single calendar day should display, following
 * the priority: Paid Leave > Holiday > Week Off > Attendance Record > Absent.
 * A typed equivalent of the original resolveDayStatus() — components render
 * their own markup from these fields instead of receiving pre-built HTML. */
export interface ResolvedDay {
  dateStr: string;
  status: DayStatus;
  statusLabel: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  hoursValue: number | null;
  lessValue: number;
  overtimeValue: number;
  workLocation: WorkLocation | null;
  countsAsPresent: boolean;
  /** True when a Present/Incomplete day's check-in was at/after the late
   * cutoff (see isLateCheckIn). Always false for non-attendance statuses
   * (leave/holiday/week-off/absent). Sourced from the same isLate field
   * Dashboard's stat cards already use — not a second calculation. */
  isLate: boolean;
}


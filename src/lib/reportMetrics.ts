import type { ResolvedDay } from '@/types/attendance';

export interface ReportSummary {
  workingDays: number; // days counted at all (excludes week-off/holiday/not-marked from the denominator)
  presentDays: number; // present, on time
  lateDays: number; // present, but check-in was late
  absentDays: number;
  paidLeaveDays: number;
  holidayDays: number;
  weekOffDays: number;
  incompleteDays: number;
  attendancePercent: number | null; // null when there's no eligible day to compute against
  avgHoursPerDay: number | null;
  totalHours: number;
  daysWithHours: number; // denominator actually used for avgHoursPerDay
}

export interface TrendPoint {
  dateStr: string;
  dayOfMonth: number;
  status: ResolvedDay['status'];
  isLate: boolean;
  hoursValue: number | null;
}

/** Derives every Reports metric from the same ResolvedDay[] that Attendance's
 * Monthly History and Calendar already render — so Reports can never disagree
 * with them, by construction. Nothing here re-queries Firestore or
 * re-implements the Paid Leave > Holiday > Week Off > Attendance > Absent
 * priority; it only aggregates what resolveDayStatus already decided. */
export function summarizeMonth(days: ResolvedDay[]): ReportSummary {
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;
  let paidLeaveDays = 0;
  let holidayDays = 0;
  let weekOffDays = 0;
  let incompleteDays = 0;
  let totalHours = 0;
  let daysWithHours = 0;

  for (const d of days) {
    switch (d.status) {
      case 'present':
        presentDays++;
        if (d.isLate) lateDays++;
        if (d.hoursValue !== null) {
          totalHours += d.hoursValue;
          daysWithHours++;
        }
        break;
      case 'incomplete':
        incompleteDays++;
        break;
      case 'absent':
        absentDays++;
        break;
      case 'paid-leave':
        paidLeaveDays++;
        break;
      case 'holiday':
        holidayDays++;
        break;
      case 'week-off':
        weekOffDays++;
        break;
      case 'not-marked':
        // Today/future with no record yet — excluded from every metric below,
        // same as the original app's history views.
        break;
    }
  }

  // Attendance % denominator: days that were actually eligible to be worked
  // (present + incomplete + absent). Week-offs, holidays, and paid leave are
  // not "missed" days, so including them would understate attendance.
  const eligibleDays = presentDays + incompleteDays + absentDays;
  const attendancePercent = eligibleDays > 0 ? Math.round((presentDays / eligibleDays) * 1000) / 10 : null;

  const avgHoursPerDay = daysWithHours > 0 ? totalHours / daysWithHours : null;

  return {
    workingDays: eligibleDays,
    presentDays,
    lateDays,
    absentDays,
    paidLeaveDays,
    holidayDays,
    weekOffDays,
    incompleteDays,
    attendancePercent,
    avgHoursPerDay,
    totalHours,
    daysWithHours,
  };
}

/** Chronological (oldest-first) per-day series for the trend chart. Calendar/
 * Attendance's useMonthlyHistory returns most-recent-first, so this re-sorts
 * rather than re-fetching. */
export function buildTrend(days: ResolvedDay[]): TrendPoint[] {
  return [...days]
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    .map((d) => ({
      dateStr: d.dateStr,
      dayOfMonth: Number(d.dateStr.split('-')[2]),
      status: d.status,
      isLate: d.isLate,
      hoursValue: d.hoursValue,
    }));
}

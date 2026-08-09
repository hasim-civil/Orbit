import { fetchRecordsInRange } from './attendanceService';
import { fetchLeavesInRange, fetchHolidaysInRange } from './leaveHolidayService';
import { getTodayDate, resolveDayStatus } from '@/lib/attendanceLogic';
import type { ResolvedDay } from '@/types/attendance';

/** Resolve every date in `dateStrs` against attendance + holiday + leave data
 * for that range, applying the same Paid Leave > Holiday > Week Off >
 * Attendance > Absent priority as the original app. Order of the input
 * array is preserved in the output. */
export async function resolveDateRange(uid: string, dateStrs: string[]): Promise<ResolvedDay[]> {
  if (dateStrs.length === 0) return [];

  const sorted = [...dateStrs].sort();
  const startDate = sorted[0];
  const endDate = sorted[sorted.length - 1];
  const todayStr = getTodayDate();

  const [attendanceMap, holidayMap, leaveMap] = await Promise.all([
    fetchRecordsInRange(uid, startDate, endDate),
    fetchHolidaysInRange(startDate, endDate),
    fetchLeavesInRange(uid, startDate, endDate),
  ]);

  return dateStrs.map((dateStr) =>
    resolveDayStatus({
      dateStr,
      attendanceData: attendanceMap.get(dateStr) ?? null,
      holiday: holidayMap.get(dateStr) ?? null,
      paidLeave: leaveMap.get(dateStr) ?? null,
      isFutureOrToday: dateStr === todayStr,
    }),
  );
}

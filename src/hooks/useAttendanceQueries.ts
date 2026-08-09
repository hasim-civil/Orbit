import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as attendanceService from '@/services/attendanceService';
import { resolveDateRange } from '@/services/historyService';
import { summarizeMonth, buildTrend } from '@/lib/reportMetrics';
import { getDaysInMonth, getTodayDate, LAUNCH_DATE, toLocalDateString } from '@/lib/attendanceLogic';
import type { MonthlyStats } from '@/types/attendance';

const STANDARD_HOURS = 8;

export function useTodayAttendance(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.todayAttendance(uid),
    queryFn: () => attendanceService.fetchTodayRecord(uid!),
    enabled: !!uid,
  });
}

export function useMonthlyRecords(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.monthlyStats(uid),
    queryFn: () => attendanceService.fetchMonthlyRecords(uid!),
    enabled: !!uid,
  });
}

export function useMonthlyStats(uid: string | undefined): MonthlyStats & { isLoading: boolean } {
  const { data: docs = [], isLoading } = useMonthlyRecords(uid);

  return useMemo(() => {
    let workingDays = 0;
    let presentDays = 0;
    let totalHours = 0;
    let lateDays = 0;
    let lessHours = 0;
    let overtimeHours = 0;

    for (const d of docs) {
      workingDays++;
      if (d.status === 'present') {
        presentDays++;
        totalHours += d.totalHours || 0;
        if (d.totalHours !== null) {
          const diff = d.totalHours - STANDARD_HOURS;
          if (diff < 0) lessHours += Math.abs(diff);
          else overtimeHours += diff;
        }
      }
      if (d.isLate) lateDays++;
    }

    const avgHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0;
    return { workingDays, presentDays, avgHoursPerDay, lessHours, overtimeHours, lateDays, isLoading };
  }, [docs, isLoading]);
}

/** Invalidates every attendance-derived query after a write — kept in one
 * place so every mutation hook below stays in sync by construction. */
function useInvalidateAttendance(uid: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['attendance', 'today', uid] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly', uid] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'timeline', uid] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'history', uid] });
  };
}

export function useCheckIn(uid: string | undefined) {
  const invalidate = useInvalidateAttendance(uid);
  return useMutation({
    mutationFn: () => attendanceService.checkIn(uid!),
    onSuccess: invalidate,
  });
}

export function useCheckOut(uid: string | undefined) {
  const invalidate = useInvalidateAttendance(uid);
  return useMutation({
    mutationFn: () => attendanceService.checkOut(uid!),
    onSuccess: invalidate,
  });
}

export function useAddPastAttendance(uid: string | undefined) {
  const invalidate = useInvalidateAttendance(uid);
  return useMutation({
    mutationFn: (vars: { dateStr: string; checkIn: Date; checkOut: Date; workLocation: string }) =>
      attendanceService.addPastAttendance(uid!, vars.dateStr, vars.checkIn, vars.checkOut, vars.workLocation),
    onSuccess: invalidate,
  });
}

export function useEditTodayTime(uid: string | undefined) {
  const invalidate = useInvalidateAttendance(uid);
  return useMutation({
    mutationFn: (vars: { recordExists: boolean; checkIn: Date; checkOut: Date | null; workLocation: string }) =>
      attendanceService.editTodayTime(uid!, vars.recordExists, vars.checkIn, vars.checkOut, vars.workLocation),
    onSuccess: invalidate,
  });
}

/** Last N calendar days (including today), resolved through the Paid Leave >
 * Holiday > Week Off > Attendance > Absent priority. Clamped to not go
 * earlier than LAUNCH_DATE, same as the original's recent-attendance view. */
export function useAttendanceTimeline(uid: string | undefined, days = 7) {
  return useQuery({
    queryKey: queryKeys.timeline(uid, days),
    queryFn: async () => {
      const dateList: string[] = [];
      const cursor = new Date();
      for (let i = 0; i < days; i++) {
        dateList.unshift(toLocalDateString(cursor));
        cursor.setDate(cursor.getDate() - 1);
      }
      const filtered = dateList.filter((d) => d >= LAUNCH_DATE);
      const resolved = await resolveDateRange(uid!, filtered);
      return resolved.reverse(); // most recent first
    },
    enabled: !!uid,
  });
}

/** Every day in a given month, from LAUNCH_DATE up to today (future days
 * aren't history yet), resolved the same way as the timeline. */
export function useMonthlyHistory(uid: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.monthlyHistory(uid, year, month),
    queryFn: async () => {
      const todayStr = getTodayDate();
      const dateList = getDaysInMonth(year, month).filter((d) => d >= LAUNCH_DATE && d <= todayStr);
      const resolved = await resolveDateRange(uid!, dateList);
      return resolved.reverse(); // most recent first
    },
    enabled: !!uid,
  });
}

/** Reports' data source: the same resolved-day series as Attendance/Calendar,
 * with summary + trend derived from it. No separate Firestore query and no
 * separate status logic — summarizeMonth/buildTrend only aggregate what
 * useMonthlyHistory already resolved. */
export function useMonthlyReport(uid: string | undefined, year: number, month: number) {
  const query = useMonthlyHistory(uid, year, month);
  const summary = useMemo(() => summarizeMonth(query.data ?? []), [query.data]);
  const trend = useMemo(() => buildTrend(query.data ?? []), [query.data]);
  return { ...query, summary, trend };
}

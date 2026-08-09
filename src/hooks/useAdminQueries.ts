import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as adminService from '@/services/adminService';
import { getDaysInMonth, getTodayDate, LAUNCH_DATE } from '@/lib/attendanceLogic';

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: () => adminService.fetchAllUsers(),
  });
}

/** Today's resolved status for every user, plus the org-wide counts derived
 * from it (Present/Late/Absent/On Leave/Holiday/Week Off) — the counts are a
 * pure aggregation over the same ResolvedDay[] the list itself renders, so
 * the headline numbers and the list can never disagree. */
export function useAdminTodayOverview() {
  const usersQuery = useAdminUsers();

  const statusQuery = useQuery({
    queryKey: queryKeys.adminTodayStatus(),
    queryFn: () => adminService.fetchTodayStatusForAllUsers(usersQuery.data ?? []),
    enabled: !!usersQuery.data,
  });

  const counts = useMemo(() => {
    const c = { total: 0, present: 0, late: 0, absent: 0, onLeave: 0, holiday: 0, weekOff: 0, notMarked: 0 };
    for (const row of statusQuery.data ?? []) {
      c.total++;
      switch (row.today.status) {
        case 'present':
          c.present++;
          if (row.today.isLate) c.late++;
          break;
        case 'incomplete':
          c.present++; // checked in, counts toward "present" for the headline
          if (row.today.isLate) c.late++;
          break;
        case 'absent':
          c.absent++;
          break;
        case 'paid-leave':
          c.onLeave++;
          break;
        case 'holiday':
          c.holiday++;
          break;
        case 'week-off':
          c.weekOff++;
          break;
        case 'not-marked':
          c.notMarked++;
          break;
      }
    }
    return c;
  }, [statusQuery.data]);

  return {
    rows: statusQuery.data ?? [],
    counts,
    isLoading: usersQuery.isLoading || statusQuery.isLoading,
    isError: usersQuery.isError || statusQuery.isError,
    refetch: () => {
      usersQuery.refetch();
      statusQuery.refetch();
    },
  };
}

export function useAdminUserHistory(uid: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.adminUserHistory(uid ?? '', year, month),
    queryFn: () => {
      const todayStr = getTodayDate();
      const dateList = getDaysInMonth(year, month).filter((d) => d >= LAUNCH_DATE && d <= todayStr);
      return adminService.fetchUserHistory(uid!, dateList);
    },
    enabled: !!uid,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { uid: string; role: 'admin' | 'employee' }) => adminService.updateUserRole(vars.uid, vars.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
    },
  });
}

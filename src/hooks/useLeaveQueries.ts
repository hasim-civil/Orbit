import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as leaveHolidayService from '@/services/leaveHolidayService';
import type { LeaveType } from '@/types/attendance';

export function useLeaves(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leaves(uid),
    queryFn: () => leaveHolidayService.fetchAllLeaves(uid!),
    enabled: !!uid,
  });
}

/** A leave changes what resolveDayStatus returns for the affected date(s),
 * which every attendance-derived view depends on — so invalidate broadly
 * (leaves list + all history/timeline/monthly queries) rather than trying
 * to guess exactly which cached month keys are affected. */
function useInvalidateLeaves(uid: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leaves(uid) });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'history', uid] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'timeline', uid] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly', uid] });
  };
}

export function useAddLeave(uid: string | undefined) {
  const invalidate = useInvalidateLeaves(uid);
  return useMutation({
    mutationFn: (vars: { startDate: string; endDate: string; leaveType: LeaveType; reason: string }) =>
      leaveHolidayService.addLeave(uid!, vars.startDate, vars.endDate, vars.leaveType, vars.reason),
    onSuccess: invalidate,
  });
}

export function useUpdateLeave(uid: string | undefined) {
  const invalidate = useInvalidateLeaves(uid);
  return useMutation({
    mutationFn: (vars: { date: string; leaveType: LeaveType; reason: string }) =>
      leaveHolidayService.updateLeave(uid!, vars.date, vars.leaveType, vars.reason),
    onSuccess: invalidate,
  });
}

export function useDeleteLeave(uid: string | undefined) {
  const invalidate = useInvalidateLeaves(uid);
  return useMutation({
    mutationFn: (date: string) => leaveHolidayService.deleteLeave(uid!, date),
    onSuccess: invalidate,
  });
}

export function useDeleteLeaveRange(uid: string | undefined) {
  const invalidate = useInvalidateLeaves(uid);
  return useMutation({
    mutationFn: (dates: string[]) => leaveHolidayService.deleteLeaveRange(uid!, dates),
    onSuccess: invalidate,
  });
}

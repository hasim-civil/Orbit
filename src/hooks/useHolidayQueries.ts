import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import * as leaveHolidayService from '@/services/leaveHolidayService';

/** Holidays are shared across all users, so this query isn't scoped by uid —
 * unlike leaves, there's one holiday list for the whole app. */
export function useHolidays() {
  return useQuery({
    queryKey: queryKeys.holidays(),
    queryFn: () => leaveHolidayService.fetchAllHolidays(),
  });
}

/** A holiday changes what resolveDayStatus returns for that date for EVERY
 * user, not just the one who added it — so invalidate broadly (holiday list
 * + all history/timeline/monthly queries, uid-agnostic) rather than trying
 * to guess which cached keys are affected. */
function useInvalidateHolidays() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.holidays() });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'history'] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'timeline'] });
    queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly'] });
  };
}

export function useAddHoliday(uid: string | undefined) {
  const invalidate = useInvalidateHolidays();
  return useMutation({
    mutationFn: (vars: { date: string; name: string }) =>
      leaveHolidayService.addHoliday(vars.date, vars.name, uid!),
    onSuccess: invalidate,
  });
}

export function useUpdateHoliday(uid: string | undefined) {
  const invalidate = useInvalidateHolidays();
  return useMutation({
    mutationFn: (vars: { date: string; name: string }) =>
      leaveHolidayService.updateHoliday(vars.date, vars.name, uid!),
    onSuccess: invalidate,
  });
}

export function useDeleteHoliday() {
  const invalidate = useInvalidateHolidays();
  return useMutation({
    mutationFn: (date: string) => leaveHolidayService.deleteHoliday(date),
    onSuccess: invalidate,
  });
}

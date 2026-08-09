/** Central query-key factory. Every hook imports from here instead of
 * hand-writing key arrays, so cache invalidation can't drift out of sync. */
export const queryKeys = {
  todayAttendance: (uid: string | undefined) => ['attendance', 'today', uid] as const,
  monthlyStats: (uid: string | undefined) => ['attendance', 'monthly', uid] as const,
  timeline: (uid: string | undefined, days: number) => ['attendance', 'timeline', uid, days] as const,
  monthlyHistory: (uid: string | undefined, year: number, month: number) =>
    ['attendance', 'history', uid, year, month] as const,
  leaves: (uid: string | undefined) => ['leaves', uid] as const,
  holidays: () => ['holidays'] as const,
  adminUsers: () => ['admin', 'users'] as const,
  adminTodayStatus: () => ['admin', 'today-status'] as const,
  adminUserHistory: (uid: string, year: number, month: number) => ['admin', 'user-history', uid, year, month] as const,
};

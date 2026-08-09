import type { LeaveType, PaidLeave } from '@/types/attendance';

export interface LeaveEntry {
  key: string; // rangeId or single date
  startDate: string;
  endDate: string;
  dates: string[]; // every date this entry covers, for edit/delete
  leaveType: LeaveType;
  reason?: string;
  isRange: boolean;
}

/** Groups raw per-date leave docs by rangeId so a 3-day leave request shows
 * as one card instead of three. Single-day leaves (no rangeId) pass through
 * as their own entry. Assumes input is already sorted; grouping preserves
 * the first-seen order. */
export function groupLeaves(leaves: PaidLeave[]): LeaveEntry[] {
  const byRange = new Map<string, PaidLeave[]>();
  const singles: PaidLeave[] = [];

  for (const leave of leaves) {
    if (leave.rangeId) {
      const existing = byRange.get(leave.rangeId) ?? [];
      existing.push(leave);
      byRange.set(leave.rangeId, existing);
    } else {
      singles.push(leave);
    }
  }

  const entries: LeaveEntry[] = [];

  for (const [rangeId, docs] of byRange) {
    const dates = docs.map((d) => d.date).sort();
    entries.push({
      key: rangeId,
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      dates,
      leaveType: docs[0].leaveType,
      reason: docs[0].reason,
      isRange: true,
    });
  }

  for (const leave of singles) {
    entries.push({
      key: leave.date,
      startDate: leave.date,
      endDate: leave.date,
      dates: [leave.date],
      leaveType: leave.leaveType,
      reason: leave.reason,
      isRange: false,
    });
  }

  return entries.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export const LEAVE_TYPE_META: Record<LeaveType, { label: string; colorClass: string }> = {
  casual: { label: 'Casual Leave', colorClass: 'bg-brand-subtle text-brand-hover' },
  sick: { label: 'Sick Leave', colorClass: 'bg-red-100 text-red-700' },
  other: { label: 'Other', colorClass: 'bg-neutral-100 text-neutral-600' },
};

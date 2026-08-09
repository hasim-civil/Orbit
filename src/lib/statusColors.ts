import type { DayStatus, WorkLocation } from '@/types/attendance';

/** Background+text pairing, used by StatusBadge (pill). */
export const statusBadgeColors: Record<DayStatus, string> = {
  present: 'bg-success-subtle text-green-700',
  incomplete: 'bg-amber-100 text-amber-700',
  'paid-leave': 'bg-brand-subtle text-brand-hover',
  holiday: 'bg-blue-100 text-blue-700',
  'week-off': 'bg-neutral-100 text-neutral-500',
  absent: 'bg-danger-subtle text-red-700',
  'not-marked': 'bg-neutral-100 text-neutral-500',
};

/** Solid dot color, used by calendar day cells and legends. */
export const statusDotColors: Record<DayStatus, string> = {
  present: 'bg-success',
  incomplete: 'bg-amber-500',
  'paid-leave': 'bg-brand',
  holiday: 'bg-blue-500',
  'week-off': 'bg-neutral-300',
  absent: 'bg-danger',
  'not-marked': 'bg-neutral-200',
};

// Present days additionally distinguish by work location, matching the
// original's .status-badge.outstation / .wfh accent treatment.
export const workLocationBadgeColors: Partial<Record<WorkLocation, string>> = {
  outstation: 'bg-teal-100 text-teal-700',
  wfh: 'bg-teal-100 text-teal-700',
};

export function resolveBadgeColor(status: DayStatus, workLocation?: WorkLocation | null, isLate?: boolean): string {
  if (status === 'present' && isLate) {
    return 'bg-amber-100 text-amber-700';
  }
  if (status === 'present' && workLocation && workLocationBadgeColors[workLocation]) {
    return workLocationBadgeColors[workLocation]!;
  }
  return statusBadgeColors[status];
}

export function resolveDotColor(status: DayStatus, isLate?: boolean): string {
  if (status === 'present' && isLate) return 'bg-amber-500';
  return statusDotColors[status];
}

import { cn } from '@/lib/utils';
import { resolveBadgeColor } from '@/lib/statusColors';
import type { DayStatus, WorkLocation } from '@/types/attendance';

export function StatusBadge({
  status,
  label,
  workLocation,
  isLate,
}: {
  status: DayStatus;
  label: string;
  workLocation?: WorkLocation | null;
  isLate?: boolean;
}) {
  const displayLabel = status === 'present' && isLate ? 'Late' : label;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        resolveBadgeColor(status, workLocation, isLate),
      )}
    >
      {displayLabel}
    </span>
  );
}

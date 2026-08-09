import { statusDotColors } from '@/lib/statusColors';
import type { DayStatus } from '@/types/attendance';

const LEGEND_ITEMS: { status: DayStatus; label: string; colorClass?: string }[] = [
  { status: 'present', label: 'Present' },
  { status: 'present', label: 'Late', colorClass: 'bg-amber-500' },
  { status: 'incomplete', label: 'Incomplete' },
  { status: 'absent', label: 'Absent' },
  { status: 'paid-leave', label: 'Paid Leave' },
  { status: 'holiday', label: 'Holiday' },
  { status: 'week-off', label: 'Week Off' },
];

export function CalendarLegend() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex shrink-0 items-center gap-1.5 text-2xs font-medium text-neutral-500">
          <span className={`h-2 w-2 rounded-full ${item.colorClass ?? statusDotColors[item.status]}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

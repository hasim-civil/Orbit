import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayStatus } from '@/types/attendance';

const FILTERS: { value: DayStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'week-off', label: 'Week Off' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'paid-leave', label: 'Paid Leave' },
];

export function SearchFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: DayStatus | 'all';
  onStatusFilterChange: (v: DayStatus | 'all') => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
        <input
          type="text"
          placeholder="Search by date or status…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-0 pl-10 pr-3.5 text-sm outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onStatusFilterChange(f.value)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              statusFilter === f.value ? 'bg-brand text-white' : 'bg-neutral-0 text-neutral-600 border border-neutral-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

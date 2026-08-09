import { LAUNCH_DATE } from '@/lib/attendanceLogic';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const launchYear = parseInt(LAUNCH_DATE.split('-')[0], 10);
  const launchMonth = parseInt(LAUNCH_DATE.split('-')[1], 10) - 1;
  const years = Array.from({ length: currentYear - launchYear + 1 }, (_, i) => currentYear - i);

  // In the launch year, months before LAUNCH_DATE's month were never tracked
  // and shouldn't be selectable — mirrors the same guard Calendar's
  // Previous-month button already enforces.
  const availableMonths = year === launchYear ? MONTH_NAMES.slice(launchMonth) : MONTH_NAMES;
  const monthOffset = year === launchYear ? launchMonth : 0;

  const selectClass =
    'h-10 rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-0 px-3 text-sm font-semibold text-neutral-700 outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16';

  return (
    <div className="flex gap-2">
      <select className={selectClass} value={month} onChange={(e) => onMonthChange(Number(e.target.value))}>
        {availableMonths.map((name, i) => (
          <option key={name} value={i + monthOffset}>{name}</option>
        ))}
      </select>
      <select className={selectClass} value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

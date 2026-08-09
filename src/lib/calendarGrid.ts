import { toLocalDateString } from './attendanceLogic';

export interface CalendarCell {
  dateStr: string | null; // null = padding cell outside this month
  dayOfMonth: number | null;
  isToday: boolean;
}

/** Builds a Sunday-first 7-column grid for the given month, padded with
 * null cells so every row has exactly 7 columns and the grid always spans
 * complete weeks. Pure function — no Firebase, no React. */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const todayStr = toLocalDateString(new Date());
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)

  const cells: CalendarCell[] = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({ dateStr: null, dayOfMonth: null, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toLocalDateString(new Date(year, month, d));
    cells.push({ dateStr, dayOfMonth: d, isToday: dateStr === todayStr });
  }
  // Trailing blanks to complete the final week row.
  while (cells.length % 7 !== 0) {
    cells.push({ dateStr: null, dayOfMonth: null, isToday: false });
  }
  return cells;
}

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

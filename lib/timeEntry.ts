export type Ampm = 'AM' | 'PM';

export function to24Hour(hour: number, ampm: Ampm): number {
  if (ampm === 'AM' && hour === 12) return 0;
  if (ampm === 'PM' && hour !== 12) return hour + 12;
  return hour;
}

export function isValidTimeInput(hour: number, minute: number): boolean {
  return !isNaN(hour) && !isNaN(minute) && hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59;
}

export function buildDateFromParts(dateStr: string, hour: number, minute: number, ampm: Ampm): Date {
  const d = new Date(dateStr);
  d.setHours(to24Hour(hour, ampm), minute, 0, 0);
  return d;
}

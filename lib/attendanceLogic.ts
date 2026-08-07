/**
 * Domain logic ported 1:1 from the original js/attendance.js so the React
 * dashboard produces identical numbers against the same Firestore data.
 */

// Check-ins at or after this time are considered "late".
const LATE_CUTOFF_HOUR = 11;
const LATE_CUTOFF_MIN = 1; // 11:01 AM

export function isLateCheckIn(checkInDate: Date | null): boolean {
  if (!checkInDate) return false;
  const h = checkInDate.getHours();
  const m = checkInDate.getMinutes();
  return h > LATE_CUTOFF_HOUR || (h === LATE_CUTOFF_HOUR && m >= LATE_CUTOFF_MIN);
}

/** Local YYYY-MM-DD, matching js/auth.js's toLocalDateString (no UTC shift). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDate(): string {
  return toLocalDateString(new Date());
}

export function formatHoursMinutes(hoursDecimal: number): string {
  const totalMinutes = Math.round(hoursDecimal * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

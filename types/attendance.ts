import type { Timestamp } from 'firebase/firestore';

/** users/{uid} */
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  createdAt: Timestamp;
}

/** attendance/{uid}/records/{date} — date key is 'YYYY-MM-DD' */
export interface AttendanceRecord {
  checkIn: Timestamp | null;
  checkOut: Timestamp | null;
  totalHours: number | null;
  status: 'incomplete' | 'present';
  date: string;
  workLocation: string;
  isLate?: boolean;
}

export interface MonthlyStats {
  workingDays: number;
  presentDays: number;
  avgHoursPerDay: number;
  lessHours: number;
  overtimeHours: number;
  lateDays: number;
}

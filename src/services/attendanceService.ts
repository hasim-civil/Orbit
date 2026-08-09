import {
  collection,
  doc,
  getDoc,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  getDocs,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTodayDate, isLateCheckIn, toLocalDateString } from '@/lib/attendanceLogic';
import type { AttendanceRecord } from '@/types/attendance';

function recordRef(uid: string, date: string) {
  return doc(db, 'attendance', uid, 'records', date);
}

export async function fetchTodayRecord(uid: string): Promise<AttendanceRecord | null> {
  const snap = await getDoc(recordRef(uid, getTodayDate()));
  return snap.exists() ? (snap.data() as AttendanceRecord) : null;
}

export async function fetchMonthlyRecords(uid: string): Promise<AttendanceRecord[]> {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayStr = toLocalDateString(firstDay);

  const ref = collection(db, 'attendance', uid, 'records');
  const q = query(ref, where('date', '>=', firstDayStr));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AttendanceRecord);
}

/** Records for an arbitrary date range, returned as a Map keyed by date so
 * callers can resolve a day even when no record exists for it. */
export async function fetchRecordsInRange(uid: string, startDate: string, endDate: string): Promise<Map<string, AttendanceRecord>> {
  const map = new Map<string, AttendanceRecord>();
  const ref = collection(db, 'attendance', uid, 'records');
  const q = query(ref, where('date', '>=', startDate), where('date', '<=', endDate));
  const snap = await getDocs(q);
  snap.forEach((d) => map.set(d.id, d.data() as AttendanceRecord));
  return map;
}

export async function checkIn(uid: string): Promise<void> {
  const today = getTodayDate();
  const ref = recordRef(uid, today);
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error('You have already checked in today!');

  const now = new Date();
  await setDoc(ref, {
    checkIn: Timestamp.fromDate(now),
    checkOut: null,
    totalHours: null,
    status: 'incomplete',
    date: today,
    workLocation: 'office',
    isLate: isLateCheckIn(now),
  });
}

export async function checkOut(uid: string): Promise<void> {
  const today = getTodayDate();
  const ref = recordRef(uid, today);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Please check in first!');

  const data = snap.data() as AttendanceRecord;
  if (data.checkOut) throw new Error('You have already checked out today!');

  const checkInTime = (data.checkIn as unknown as Timestamp).toDate();
  const checkOutTime = new Date();
  const diffHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  const totalHours = Math.round(diffHours * 100) / 100;

  await updateDoc(ref, {
    checkOut: Timestamp.fromDate(checkOutTime),
    totalHours,
    status: 'present',
  });
}

export async function addPastAttendance(
  uid: string,
  dateStr: string,
  checkInDate: Date,
  checkOutDate: Date,
  workLocation: string,
): Promise<void> {
  const ref = recordRef(uid, dateStr);
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error('Attendance record already exists for this date.');

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

  await setDoc(ref, {
    checkIn: Timestamp.fromDate(checkInDate),
    checkOut: Timestamp.fromDate(checkOutDate),
    totalHours,
    status: 'present',
    date: dateStr,
    workLocation,
    isLate: isLateCheckIn(checkInDate),
  });
}

export async function editTodayTime(
  uid: string,
  recordExists: boolean,
  checkInDate: Date,
  checkOutDate: Date | null,
  workLocation: string,
): Promise<void> {
  const today = getTodayDate();
  const ref = recordRef(uid, today);

  let totalHours: number | null = null;
  let status: 'incomplete' | 'present' = 'incomplete';
  if (checkOutDate) {
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    status = 'present';
  }

  const updateData: DocumentData = {
    checkIn: Timestamp.fromDate(checkInDate),
    date: today,
    workLocation,
    isLate: isLateCheckIn(checkInDate),
    checkOut: checkOutDate ? Timestamp.fromDate(checkOutDate) : null,
    totalHours,
    status,
  };

  if (recordExists) {
    await updateDoc(ref, updateData);
  } else {
    await setDoc(ref, updateData);
  }
}

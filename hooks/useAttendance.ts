import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, db, watchAuth } from '../lib/firebase';
import { getTodayDate, isLateCheckIn, toLocalDateString } from '../lib/attendanceLogic';
import type { AttendanceRecord, MonthlyStats, UserData } from '../types/attendance';

const STANDARD_HOURS = 8;

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuth(async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        setUserData(snap.exists() ? ({ id: snap.id, ...snap.data() } as UserData) : null);
      } else {
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  return { user, userData, authLoading };
}

export function useTodayAttendance(uid: string | undefined) {
  const today = getTodayDate();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'attendance', uid, 'records', today);
    const unsub = onSnapshot(ref, (snap) => {
      setRecord(snap.exists() ? (snap.data() as AttendanceRecord) : null);
      setLoading(false);
    });
    return unsub;
  }, [uid, today]);

  const checkIn = useCallback(async () => {
    if (!uid) return;
    const now = new Date();
    const ref = doc(db, 'attendance', uid, 'records', today);
    const existing = await getDoc(ref);
    if (existing.exists()) throw new Error('You have already checked in today!');
    await setDoc(ref, {
      checkIn: Timestamp.fromDate(now),
      checkOut: null,
      totalHours: null,
      status: 'incomplete',
      date: today,
      workLocation: 'office',
      isLate: isLateCheckIn(now),
    });
  }, [uid, today]);

  const checkOut = useCallback(async () => {
    if (!uid) return;
    const ref = doc(db, 'attendance', uid, 'records', today);
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
  }, [uid, today]);

  return { record, loading, checkIn, checkOut };
}

export function useMonthlyStats(uid: string | undefined): MonthlyStats & { loading: boolean } {
  const [docs, setDocs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = toLocalDateString(firstDay);

    const ref = collection(db, 'attendance', uid, 'records');
    const q = query(ref, where('date', '>=', firstDayStr));
    const unsub = onSnapshot(q, (snap) => {
      setDocs(snap.docs.map((d) => d.data() as AttendanceRecord));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return useMemo(() => {
    let workingDays = 0;
    let presentDays = 0;
    let totalHours = 0;
    let lateDays = 0;
    let lessHours = 0;
    let overtimeHours = 0;

    for (const d of docs) {
      workingDays++;
      if (d.status === 'present') {
        presentDays++;
        totalHours += d.totalHours || 0;
        if (d.totalHours !== null) {
          const diff = d.totalHours - STANDARD_HOURS;
          if (diff < 0) lessHours += Math.abs(diff);
          else overtimeHours += diff;
        }
      }
      if (d.isLate) lateDays++;
    }

    const avgHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0;

    return { workingDays, presentDays, avgHoursPerDay, lessHours, overtimeHours, lateDays, loading };
  }, [docs, loading]);
}

export { auth };

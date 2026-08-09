import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { resolveDateRange } from './historyService';
import { getTodayDate } from '@/lib/attendanceLogic';
import type { ResolvedDay, UserData } from '@/types/attendance';

/** All registered users. Requires the caller to already satisfy
 * firestore.rules' isAdmin() check — this function does not itself gate
 * access, Firestore does, at the query level. A non-admin calling this
 * gets a permission-denied error from Firestore, not real data. */
export async function fetchAllUsers(): Promise<UserData[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserData);
}

export interface EmployeeTodayStatus {
  user: UserData;
  today: ResolvedDay;
}

/** Today's resolved status for every user, reusing the exact same
 * resolveDateRange/resolveDayStatus pipeline Attendance/Calendar/Reports
 * already use per-user — so an employee's "Present" here can never disagree
 * with what they see on their own Attendance page. Runs one resolution per
 * user in parallel; fine at the employee counts this app targets. */
export async function fetchTodayStatusForAllUsers(users: UserData[]): Promise<EmployeeTodayStatus[]> {
  const todayStr = getTodayDate();
  const results = await Promise.all(
    users.map(async (user) => {
      const [today] = await resolveDateRange(user.id, [todayStr]);
      return { user, today };
    }),
  );
  return results;
}

/** A user's resolved attendance for an arbitrary set of dates — used by the
 * admin's per-employee history view. Thin wrapper so admin components import
 * from adminService rather than reaching into historyService directly. */
export async function fetchUserHistory(uid: string, dateStrs: string[]): Promise<ResolvedDay[]> {
  return resolveDateRange(uid, dateStrs);
}

export async function fetchUserById(uid: string): Promise<UserData | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserData) : null;
}

/** Updates a user's editable profile fields. Role changes are intentionally
 * excluded here — firestore.rules only allows an admin to change role via
 * a plain update (unlike self-updates, which are blocked from touching
 * role), so this is a deliberate, narrow surface for that one admin action. */
export async function updateUserRole(uid: string, role: 'admin' | 'employee'): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

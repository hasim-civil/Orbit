import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toLocalDateString } from '@/lib/attendanceLogic';
import type { Holiday, LeaveType, PaidLeave } from '@/types/attendance';

export async function fetchHolidaysInRange(startDate: string, endDate: string): Promise<Map<string, Holiday>> {
  const map = new Map<string, Holiday>();
  try {
    const ref = collection(db, 'holidays');
    const q = query(ref, where('date', '>=', startDate), where('date', '<=', endDate));
    const snap = await getDocs(q);
    snap.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as Holiday));
  } catch (error) {
    console.error('Error loading holidays:', error);
  }
  return map;
}

export async function fetchHoliday(dateStr: string): Promise<Holiday | null> {
  const snap = await getDoc(doc(db, 'holidays', dateStr));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Holiday) : null;
}

/** All holidays, most recent first — used by the Holiday page's list view
 * (not scoped to a single month like fetchHolidaysInRange above). */
export async function fetchAllHolidays(): Promise<Holiday[]> {
  const ref = collection(db, 'holidays');
  const snap = await getDocs(ref);
  const holidays = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Holiday);
  return holidays.sort((a, b) => b.date.localeCompare(a.date));
}

/** Adds a holiday for a single date. Throws if a holiday already exists on
 * that date — holidays/{date} is the doc id, so this is a simple existence
 * check, not a query. */
export async function addHoliday(dateStr: string, name: string, uid: string): Promise<void> {
  const ref = doc(db, 'holidays', dateStr);
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error(`A holiday already exists on ${dateStr}.`);

  await setDoc(ref, {
    date: dateStr,
    name: name.trim(),
    updatedAt: Timestamp.now(),
    updatedBy: uid,
  });
}

export async function updateHoliday(dateStr: string, name: string, uid: string): Promise<void> {
  const ref = doc(db, 'holidays', dateStr);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Holiday not found.');
  await updateDoc(ref, { name: name.trim(), updatedAt: Timestamp.now(), updatedBy: uid });
}

export async function deleteHoliday(dateStr: string): Promise<void> {
  await deleteDoc(doc(db, 'holidays', dateStr));
}

/** Every leave the user has recorded in a date range. No approval filter —
 * this app has no approval workflow; adding a leave is enough to make that
 * date count as Paid Leave in resolveDayStatus. */
export async function fetchLeavesInRange(uid: string, startDate: string, endDate: string): Promise<Map<string, PaidLeave>> {
  const map = new Map<string, PaidLeave>();
  try {
    const ref = collection(db, 'paidLeaves', uid, 'records');
    const q = query(ref, where('date', '>=', startDate), where('date', '<=', endDate));
    const snap = await getDocs(q);
    snap.forEach((d) => map.set(d.id, { id: d.id, ...d.data() } as PaidLeave));
  } catch (error) {
    console.error('Error loading paid leaves:', error);
  }
  return map;
}

/** All of a user's recorded leaves, most recent first — used by the Leave
 * page's list view (not scoped to a single month like the range fetch above). */
export async function fetchAllLeaves(uid: string): Promise<PaidLeave[]> {
  const ref = collection(db, 'paidLeaves', uid, 'records');
  const snap = await getDocs(ref);
  const leaves = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaidLeave);
  return leaves.sort((a, b) => b.date.localeCompare(a.date));
}

export async function fetchPaidLeave(uid: string, dateStr: string): Promise<PaidLeave | null> {
  const snap = await getDoc(doc(db, 'paidLeaves', uid, 'records', dateStr));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as PaidLeave) : null;
}

function toDateStr(d: Date) {
  return toLocalDateString(d);
}

/** Every date from start to end (inclusive), as 'YYYY-MM-DD' strings. */
function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);
  while (cursor <= end) {
    dates.push(toDateStr(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/** Adds a leave for a single date or an inclusive date range. Each date in
 * the range gets its own document (same shape fetchLeavesInRange already
 * expects), tagged with a shared rangeId when it's a multi-day request so
 * the Leave page can show/edit/delete the range as one unit. Throws if any
 * date in the range already has a leave recorded. */
export async function addLeave(
  uid: string,
  startDate: string,
  endDate: string,
  leaveType: LeaveType,
  reason: string,
): Promise<void> {
  const dates = enumerateDates(startDate, endDate);
  if (dates.length === 0) throw new Error('Invalid date range.');

  // Check for existing leaves across the whole range before writing anything.
  const existingChecks = await Promise.all(dates.map((d) => getDoc(doc(db, 'paidLeaves', uid, 'records', d))));
  const alreadyTaken = dates.filter((_, i) => existingChecks[i].exists());
  if (alreadyTaken.length > 0) {
    throw new Error(
      alreadyTaken.length === 1
        ? `A leave already exists for ${alreadyTaken[0]}.`
        : `Leaves already exist for ${alreadyTaken.length} of the selected dates.`,
    );
  }

  const rangeId = dates.length > 1 ? `${startDate}_${endDate}` : undefined;
  const createdAt = Timestamp.now();

  await Promise.all(
    dates.map((d) => {
      const payload: Omit<PaidLeave, 'id'> = { date: d, leaveType, createdAt, ...(rangeId ? { rangeId } : {}) };
      if (reason.trim()) payload.reason = reason.trim();
      return setDoc(doc(db, 'paidLeaves', uid, 'records', d), payload);
    }),
  );
}

export async function updateLeave(uid: string, dateStr: string, leaveType: LeaveType, reason: string): Promise<void> {
  const ref = doc(db, 'paidLeaves', uid, 'records', dateStr);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Leave not found.');
  await updateDoc(ref, { leaveType, reason: reason.trim() || null });
}

export async function deleteLeave(uid: string, dateStr: string): Promise<void> {
  await deleteDoc(doc(db, 'paidLeaves', uid, 'records', dateStr));
}

/** Deletes every date belonging to a multi-day leave range in one go. */
export async function deleteLeaveRange(uid: string, dates: string[]): Promise<void> {
  await Promise.all(dates.map((d) => deleteDoc(doc(db, 'paidLeaves', uid, 'records', d))));
}

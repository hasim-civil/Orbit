import { useEffect, useState } from 'react';
import { doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getTodayDate, isLateCheckIn } from '../lib/attendanceLogic';
import { buildDateFromParts, isValidTimeInput, type Ampm } from '../lib/timeEntry';
import type { AttendanceRecord } from '../types/attendance';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';

function to12Hour(d: Date): { hour: string; min: string; ampm: Ampm } {
  let h = d.getHours();
  const ampm: Ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return { hour: String(h), min: String(d.getMinutes()).padStart(2, '0'), ampm };
}

export function EditTimeModal({
  open,
  onClose,
  uid,
  record,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  uid: string | undefined;
  record: AttendanceRecord | null;
  onSaved: (message: string) => void;
}) {
  const [inHour, setInHour] = useState('');
  const [inMin, setInMin] = useState('');
  const [inAmpm, setInAmpm] = useState<Ampm>('AM');
  const [hasCheckOut, setHasCheckOut] = useState(false);
  const [outHour, setOutHour] = useState('');
  const [outMin, setOutMin] = useState('');
  const [outAmpm, setOutAmpm] = useState<Ampm>('PM');
  const [workLocation, setWorkLocation] = useState('office');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Pre-fill from the live record every time the sheet opens.
  useEffect(() => {
    if (!open) return;
    setError(null);
    const checkIn = record?.checkIn ? (record.checkIn as unknown as { toDate: () => Date }).toDate() : null;
    const checkOut = record?.checkOut ? (record.checkOut as unknown as { toDate: () => Date }).toDate() : null;

    if (checkIn) {
      const p = to12Hour(checkIn);
      setInHour(p.hour); setInMin(p.min); setInAmpm(p.ampm);
    } else {
      setInHour(''); setInMin(''); setInAmpm('AM');
    }
    if (checkOut) {
      const p = to12Hour(checkOut);
      setHasCheckOut(true);
      setOutHour(p.hour); setOutMin(p.min); setOutAmpm(p.ampm);
    } else {
      setHasCheckOut(false);
      setOutHour(''); setOutMin(''); setOutAmpm('PM');
    }
    setWorkLocation(record?.workLocation || 'office');
  }, [open, record]);

  const handleSave = async () => {
    setError(null);
    if (!uid) return;

    const ciH = parseInt(inHour, 10), ciM = parseInt(inMin, 10);
    if (!isValidTimeInput(ciH, ciM)) { setError('Please enter a valid Check In time.'); return; }

    const today = getTodayDate();
    const newCheckIn = buildDateFromParts(today, ciH, ciM, inAmpm);

    let newCheckOut: Date | null = null;
    let totalHours: number | null = null;
    let status: 'incomplete' | 'present' = 'incomplete';

    if (hasCheckOut) {
      const coH = parseInt(outHour, 10), coM = parseInt(outMin, 10);
      if (!isValidTimeInput(coH, coM)) { setError('Please enter a valid Check Out time.'); return; }
      newCheckOut = buildDateFromParts(today, coH, coM, outAmpm);
      if (newCheckOut <= newCheckIn) { setError('Check Out time must be after Check In time.'); return; }
      const diffMs = newCheckOut.getTime() - newCheckIn.getTime();
      totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      status = 'present';
    }

    setBusy(true);
    try {
      const ref = doc(db, 'attendance', uid, 'records', today);
      const updateData: Partial<AttendanceRecord> = {
        checkIn: Timestamp.fromDate(newCheckIn) as unknown as AttendanceRecord['checkIn'],
        date: today,
        workLocation,
        isLate: isLateCheckIn(newCheckIn),
        checkOut: newCheckOut ? (Timestamp.fromDate(newCheckOut) as unknown as AttendanceRecord['checkOut']) : null,
        totalHours,
        status,
      };

      if (record) {
        await updateDoc(ref, updateData);
      } else {
        await setDoc(ref, updateData as AttendanceRecord);
      }

      onSaved('Attendance time updated successfully!');
      onClose();
    } catch {
      setError('Failed to update time. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Attendance Time"
      footer={
        <>
          <SpringButton variant="secondary" onClick={onClose}>Cancel</SpringButton>
          <SpringButton variant="primary" onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save Changes'}
          </SpringButton>
        </>
      }
    >
      <div className="form-group">
        <label>Check In Time</label>
        <TimeRow hour={inHour} setHour={setInHour} min={inMin} setMin={setInMin} ampm={inAmpm} setAmpm={setInAmpm} />
      </div>

      {hasCheckOut && (
        <div className="form-group">
          <label>Check Out Time</label>
          <TimeRow hour={outHour} setHour={setOutHour} min={outMin} setMin={setOutMin} ampm={outAmpm} setAmpm={setOutAmpm} />
        </div>
      )}

      <div className="form-group">
        <label>Work Location</label>
        <select className="form-input" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)}>
          <option value="office">🏢 Office</option>
          <option value="outstation">🚗 Outstation</option>
          <option value="wfh">🏠 Work From Home</option>
        </select>
      </div>

      <p className="form-hint">You can type the time or click AM/PM to switch.</p>
      {error && <p className="modal-error">{error}</p>}
    </Modal>
  );
}

function TimeRow({
  hour, setHour, min, setMin, ampm, setAmpm,
}: {
  hour: string; setHour: (v: string) => void;
  min: string; setMin: (v: string) => void;
  ampm: Ampm; setAmpm: (v: Ampm) => void;
}) {
  return (
    <div className="time-picker-group">
      <input type="number" className="form-input time-part" min={1} max={12} placeholder="HH" value={hour} onChange={(e) => setHour(e.target.value)} />
      <span className="time-sep">:</span>
      <input type="number" className="form-input time-part" min={0} max={59} placeholder="MM" value={min} onChange={(e) => setMin(e.target.value)} />
      <div className="ampm-toggle">
        <button type="button" className={`ampm-btn ${ampm === 'AM' ? 'active' : ''}`} onClick={() => setAmpm('AM')}>AM</button>
        <button type="button" className={`ampm-btn ${ampm === 'PM' ? 'active' : ''}`} onClick={() => setAmpm('PM')}>PM</button>
      </div>
    </div>
  );
}

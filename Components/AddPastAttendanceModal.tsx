import { useState } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isLateCheckIn, toLocalDateString } from '../lib/attendanceLogic';
import { buildDateFromParts, isValidTimeInput, type Ampm } from '../lib/timeEntry';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';

export function AddPastAttendanceModal({
  open,
  onClose,
  uid,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  uid: string | undefined;
  onSaved: (message: string) => void;
}) {
  const [date, setDate] = useState('');
  const [inHour, setInHour] = useState('');
  const [inMin, setInMin] = useState('');
  const [inAmpm, setInAmpm] = useState<Ampm>('AM');
  const [outHour, setOutHour] = useState('');
  const [outMin, setOutMin] = useState('');
  const [outAmpm, setOutAmpm] = useState<Ampm>('PM');
  const [workLocation, setWorkLocation] = useState('office');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setDate(''); setInHour(''); setInMin(''); setInAmpm('AM');
    setOutHour(''); setOutMin(''); setOutAmpm('PM'); setWorkLocation('office');
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    setError(null);
    if (!uid) return;

    if (!date) { setError('Please select a date.'); return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    if (selected >= today) { setError('Please select a past date.'); return; }

    const ciH = parseInt(inHour, 10), ciM = parseInt(inMin, 10);
    if (!isValidTimeInput(ciH, ciM)) { setError('Please enter a valid Check In time.'); return; }

    const coH = parseInt(outHour, 10), coM = parseInt(outMin, 10);
    if (!isValidTimeInput(coH, coM)) { setError('Please enter a valid Check Out time.'); return; }

    const checkInDate = buildDateFromParts(date, ciH, ciM, inAmpm);
    const checkOutDate = buildDateFromParts(date, coH, coM, outAmpm);
    if (checkOutDate <= checkInDate) { setError('Check Out time must be after Check In time.'); return; }

    setBusy(true);
    try {
      const dateStr = toLocalDateString(selected);
      const ref = doc(db, 'attendance', uid, 'records', dateStr);
      const existing = await getDoc(ref);
      if (existing.exists()) {
        setError('Attendance record already exists for this date.');
        setBusy(false);
        return;
      }

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

      onSaved('Past attendance added successfully!');
      handleClose();
    } catch {
      setError('Failed to add attendance. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Past Attendance"
      footer={
        <>
          <SpringButton variant="secondary" onClick={handleClose}>Cancel</SpringButton>
          <SpringButton variant="primary" onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save Attendance'}
          </SpringButton>
        </>
      }
    >
      <div className="form-group">
        <label>Select Date</label>
        <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Check In Time</label>
        <TimeRow hour={inHour} setHour={setInHour} min={inMin} setMin={setInMin} ampm={inAmpm} setAmpm={setInAmpm} />
      </div>

      <div className="form-group">
        <label>Check Out Time</label>
        <TimeRow hour={outHour} setHour={setOutHour} min={outMin} setMin={setOutMin} ampm={outAmpm} setAmpm={setOutAmpm} />
      </div>

      <div className="form-group">
        <label>Work Location</label>
        <select className="form-input" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)}>
          <option value="office">🏢 Office</option>
          <option value="outstation">🚗 Outstation</option>
          <option value="wfh">🏠 Work From Home</option>
        </select>
      </div>

      <p className="form-hint">Select a past date and enter your check-in/out times.</p>
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

import { useState } from 'react';
import { toLocalDateString } from '@/lib/attendanceLogic';
import { buildDateFromParts, isValidTimeInput, type Ampm } from '@/lib/timeEntry';
import { useAddPastAttendance } from '@/hooks/useAttendanceQueries';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

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

  const { mutateAsync, isPending } = useAddPastAttendance(uid);

  const reset = () => {
    setDate(''); setInHour(''); setInMin(''); setInAmpm('AM');
    setOutHour(''); setOutMin(''); setOutAmpm('PM'); setWorkLocation('office');
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    setError(null);

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

    if (!uid) { setError('You must be signed in to add attendance.'); return; }

    try {
      await mutateAsync({
        dateStr: toLocalDateString(selected),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        workLocation,
      });
      onSaved('Past attendance added successfully!');
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add attendance. Please try again.');
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
          <SpringButton variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Attendance'}
          </SpringButton>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Select Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Check In Time</label>
        <TimeRow hour={inHour} setHour={setInHour} min={inMin} setMin={setInMin} ampm={inAmpm} setAmpm={setInAmpm} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Check Out Time</label>
        <TimeRow hour={outHour} setHour={setOutHour} min={outMin} setMin={setOutMin} ampm={outAmpm} setAmpm={setOutAmpm} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Work Location</label>
        <select
          className="h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-transparent px-3.5 text-base outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
          value={workLocation}
          onChange={(e) => setWorkLocation(e.target.value)}
        >
          <option value="office">🏢 Office</option>
          <option value="outstation">🚗 Outstation</option>
          <option value="wfh">🏠 Work From Home</option>
        </select>
      </div>

      <p className="m-0 text-xs text-muted-text">Select a past date and enter your check-in/out times.</p>
      {error && <p className="m-0 rounded-[10px] bg-red-100 px-3.5 py-2.5 text-sm font-semibold text-red-700">{error}</p>}
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
    <div className="flex items-center gap-2">
      <Input type="number" className="w-16 shrink-0 text-center" min={1} max={12} placeholder="HH" value={hour} onChange={(e) => setHour(e.target.value)} />
      <span className="font-bold text-muted-text">:</span>
      <Input type="number" className="w-16 shrink-0 text-center" min={0} max={59} placeholder="MM" value={min} onChange={(e) => setMin(e.target.value)} />
      <div className="ml-auto flex overflow-hidden rounded-[10px] border border-neutral-200">
        <button
          type="button"
          className={cn('px-3.5 py-2.5 text-sm font-bold', ampm === 'AM' ? 'bg-brand text-white' : 'bg-neutral-0 text-neutral-600')}
          onClick={() => setAmpm('AM')}
        >
          AM
        </button>
        <button
          type="button"
          className={cn('px-3.5 py-2.5 text-sm font-bold', ampm === 'PM' ? 'bg-brand text-white' : 'bg-neutral-0 text-neutral-600')}
          onClick={() => setAmpm('PM')}
        >
          PM
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { getTodayDate } from '@/lib/attendanceLogic';
import { buildDateFromParts, isValidTimeInput, type Ampm } from '@/lib/timeEntry';
import { useEditTodayTime } from '@/hooks/useAttendanceQueries';
import type { AttendanceRecord } from '@/types/attendance';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

function to12Hour(d: Date): { hour: string; min: string; ampm: Ampm } {
  let h = d.getHours();
  const ampm: Ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return { hour: String(h), min: String(d.getMinutes()).padStart(2, '0'), ampm };
}

interface EditTimeModalProps {
  open: boolean;
  onClose: () => void;
  uid: string | undefined;
  record: AttendanceRecord | null | undefined;
  onSaved: (message: string) => void;
}

/** Thin wrapper: mounts/unmounts the form on `open` so the form's initial
 * state is computed fresh from `record` every time it opens, with no effect
 * needed to "sync" state afterwards (avoids the cascading-render footgun
 * React's own docs warn about for derived-state resets). */
export function EditTimeModal(props: EditTimeModalProps) {
  return (
    <Modal open={props.open} onClose={props.onClose} title="Edit Attendance Time" footer={null}>
      {props.open && <EditTimeForm {...props} />}
    </Modal>
  );
}

function EditTimeForm({ onClose, uid, record, onSaved }: EditTimeModalProps) {
  const checkIn = record?.checkIn ? (record.checkIn as unknown as { toDate: () => Date }).toDate() : null;
  const checkOut = record?.checkOut ? (record.checkOut as unknown as { toDate: () => Date }).toDate() : null;
  const initialIn = checkIn ? to12Hour(checkIn) : { hour: '', min: '', ampm: 'AM' as Ampm };
  const initialOut = checkOut ? to12Hour(checkOut) : { hour: '', min: '', ampm: 'PM' as Ampm };

  const [inHour, setInHour] = useState(initialIn.hour);
  const [inMin, setInMin] = useState(initialIn.min);
  const [inAmpm, setInAmpm] = useState<Ampm>(initialIn.ampm);
  const hasCheckOut = !!checkOut;
  const [outHour, setOutHour] = useState(initialOut.hour);
  const [outMin, setOutMin] = useState(initialOut.min);
  const [outAmpm, setOutAmpm] = useState<Ampm>(initialOut.ampm);
  const [workLocation, setWorkLocation] = useState(record?.workLocation || 'office');
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useEditTodayTime(uid);

  const handleSave = async () => {
    setError(null);

    const ciH = parseInt(inHour, 10), ciM = parseInt(inMin, 10);
    if (!isValidTimeInput(ciH, ciM)) { setError('Please enter a valid Check In time.'); return; }

    const today = getTodayDate();
    const newCheckIn = buildDateFromParts(today, ciH, ciM, inAmpm);

    let newCheckOut: Date | null = null;
    if (hasCheckOut) {
      const coH = parseInt(outHour, 10), coM = parseInt(outMin, 10);
      if (!isValidTimeInput(coH, coM)) { setError('Please enter a valid Check Out time.'); return; }
      newCheckOut = buildDateFromParts(today, coH, coM, outAmpm);
      if (newCheckOut <= newCheckIn) { setError('Check Out time must be after Check In time.'); return; }
    }

    if (!uid) { setError('You must be signed in to update attendance.'); return; }

    try {
      await mutateAsync({
        recordExists: !!record,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        workLocation,
      });
      onSaved('Attendance time updated successfully!');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update time. Please try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Check In Time</label>
        <TimeRow hour={inHour} setHour={setInHour} min={inMin} setMin={setInMin} ampm={inAmpm} setAmpm={setInAmpm} />
      </div>

      {hasCheckOut && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-600">Check Out Time</label>
          <TimeRow hour={outHour} setHour={setOutHour} min={outMin} setMin={setOutMin} ampm={outAmpm} setAmpm={setOutAmpm} />
        </div>
      )}

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

      <p className="m-0 text-xs text-muted-text">You can type the time or click AM/PM to switch.</p>
      {error && <p className="m-0 rounded-[10px] bg-red-100 px-3.5 py-2.5 text-sm font-semibold text-red-700">{error}</p>}

      <div className="-mx-5 -mb-5 mt-2 flex gap-3 border-t border-neutral-100 px-5 py-4 [&>*]:flex-1">
        <SpringButton variant="secondary" onClick={onClose}>Cancel</SpringButton>
        <SpringButton variant="primary" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Changes'}
        </SpringButton>
      </div>
    </>
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

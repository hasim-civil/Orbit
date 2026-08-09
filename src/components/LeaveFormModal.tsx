import { useState } from 'react';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';
import { Input } from './ui/input';
import { useAddLeave, useUpdateLeave } from '@/hooks/useLeaveQueries';
import type { LeaveEntry } from '@/lib/leaveGrouping';
import type { LeaveType } from '@/types/attendance';

interface LeaveFormModalProps {
  open: boolean;
  onClose: () => void;
  uid: string | undefined;
  /** Present when editing an existing leave; absent when adding a new one. */
  editing?: LeaveEntry | null;
  onSaved: (message: string) => void;
}

const LEAVE_TYPE_OPTIONS: { value: LeaveType; label: string }[] = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'other', label: 'Other' },
];

export function LeaveFormModal(props: LeaveFormModalProps) {
  return (
    <Modal open={props.open} onClose={props.onClose} title={props.editing ? 'Edit Leave' : 'Add Leave'} footer={null}>
      {props.open && <LeaveForm {...props} />}
    </Modal>
  );
}

function LeaveForm({ onClose, uid, editing, onSaved }: LeaveFormModalProps) {
  const isEditing = !!editing;
  const [startDate, setStartDate] = useState(editing?.startDate ?? '');
  const [endDate, setEndDate] = useState(editing?.endDate ?? '');
  const [leaveType, setLeaveType] = useState<LeaveType>(editing?.leaveType ?? 'casual');
  const [reason, setReason] = useState(editing?.reason ?? '');
  const [error, setError] = useState<string | null>(null);

  const addMutation = useAddLeave(uid);
  const updateMutation = useUpdateLeave(uid);
  const busy = addMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    setError(null);

    if (!startDate) { setError('Please select a date.'); return; }
    const effectiveEnd = endDate || startDate;
    if (effectiveEnd < startDate) { setError('End date cannot be before the start date.'); return; }

    if (!uid) { setError('You must be signed in to save a leave.'); return; }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ date: editing.startDate, leaveType, reason });
        onSaved('Leave updated successfully!');
      } else {
        await addMutation.mutateAsync({ startDate, endDate: effectiveEnd, leaveType, reason });
        onSaved(startDate === effectiveEnd ? 'Leave added successfully!' : 'Leave range added successfully!');
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save leave. Please try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">{isEditing ? 'Date' : 'Start Date'}</label>
        <Input type="date" value={startDate} disabled={isEditing} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      {!isEditing && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-600">
            End Date <span className="font-normal text-muted-text">(optional — leave blank for a single day)</span>
          </label>
          <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Leave Type</label>
        <select
          className="h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-transparent px-3.5 text-base outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as LeaveType)}
        >
          {LEAVE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">
          Reason <span className="font-normal text-muted-text">(optional)</span>
        </label>
        <textarea
          className="min-h-20 w-full resize-none rounded-[var(--radius-md)] border border-neutral-200 bg-transparent px-3.5 py-2.5 text-base outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Family function, feeling unwell…"
        />
      </div>

      <p className="m-0 text-xs text-muted-text">This date will show as Paid Leave instead of Absent once saved.</p>
      {error && <p className="m-0 rounded-[10px] bg-red-100 px-3.5 py-2.5 text-sm font-semibold text-red-700">{error}</p>}

      <div className="-mx-5 -mb-5 mt-2 flex gap-3 border-t border-neutral-100 px-5 py-4 [&>*]:flex-1">
        <SpringButton variant="secondary" onClick={onClose}>Cancel</SpringButton>
        <SpringButton variant="primary" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Leave'}
        </SpringButton>
      </div>
    </>
  );
}

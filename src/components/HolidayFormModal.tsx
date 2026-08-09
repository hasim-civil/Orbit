import { useState } from 'react';
import { Modal } from './Modal';
import { SpringButton } from './SpringButton';
import { Input } from './ui/input';
import { useAddHoliday, useUpdateHoliday } from '@/hooks/useHolidayQueries';
import type { Holiday } from '@/types/attendance';

interface HolidayFormModalProps {
  open: boolean;
  onClose: () => void;
  uid: string | undefined;
  /** Present when editing an existing holiday; absent when adding a new one. */
  editing?: Holiday | null;
  onSaved: (message: string) => void;
}

export function HolidayFormModal(props: HolidayFormModalProps) {
  return (
    <Modal open={props.open} onClose={props.onClose} title={props.editing ? 'Edit Holiday' : 'Add Holiday'} footer={null}>
      {props.open && <HolidayForm {...props} />}
    </Modal>
  );
}

function HolidayForm({ onClose, uid, editing, onSaved }: HolidayFormModalProps) {
  const isEditing = !!editing;
  const [date, setDate] = useState(editing?.date ?? '');
  const [name, setName] = useState(editing?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  const addMutation = useAddHoliday(uid);
  const updateMutation = useUpdateHoliday(uid);
  const busy = addMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    setError(null);

    if (!date) { setError('Please select a date.'); return; }
    if (!name.trim()) { setError('Please enter a holiday name.'); return; }

    if (!uid) { setError('You must be signed in to save a holiday.'); return; }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ date: editing.date, name });
        onSaved('Holiday updated successfully!');
      } else {
        await addMutation.mutateAsync({ date, name });
        onSaved('Holiday added successfully!');
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save holiday. Please try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Date</label>
        <Input type="date" value={date} disabled={isEditing} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-600">Holiday Name</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Independence Day"
          maxLength={80}
        />
      </div>

      <p className="m-0 text-xs text-muted-text">This date will show as Holiday instead of Absent once saved.</p>
      {error && <p className="m-0 rounded-[10px] bg-red-100 px-3.5 py-2.5 text-sm font-semibold text-red-700">{error}</p>}

      <div className="-mx-5 -mb-5 mt-2 flex gap-3 border-t border-neutral-100 px-5 py-4 [&>*]:flex-1">
        <SpringButton variant="secondary" onClick={onClose}>Cancel</SpringButton>
        <SpringButton variant="primary" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Holiday'}
        </SpringButton>
      </div>
    </>
  );
}

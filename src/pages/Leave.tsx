import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CalendarOff } from 'lucide-react';
import { LeaveCard } from '@/components/LeaveCard';
import { LeaveFormModal } from '@/components/LeaveFormModal';
import { SpringButton } from '@/components/SpringButton';
import { SkeletonList, EmptyState, ErrorState } from '@/components/EmptyState';
import { ToastStack, type ToastState } from '@/components/Toast';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/hooks/useSuccessAnimation';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteLeave, useDeleteLeaveRange, useLeaves } from '@/hooks/useLeaveQueries';
import { groupLeaves, type LeaveEntry } from '@/lib/leaveGrouping';

let toastId = 0;

export default function Leave() {
  const { user } = useAuth();
  const { data: leaves, isLoading, isError, refetch } = useLeaves(user?.uid);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveEntry | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const successAnim = useSuccessAnimation();

  const deleteMutation = useDeleteLeave(user?.uid);
  const deleteRangeMutation = useDeleteLeaveRange(user?.uid);

  const pushToast = (message: string, type: ToastState['type']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const entries = groupLeaves(leaves ?? []);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (entry: LeaveEntry) => { setEditing(entry); setFormOpen(true); };

  const handleDelete = async (entry: LeaveEntry) => {
    setDeletingKey(entry.key);
    try {
      if (entry.isRange) {
        await deleteRangeMutation.mutateAsync(entry.dates);
      } else {
        await deleteMutation.mutateAsync(entry.startDate);
      }
      pushToast('Leave deleted.', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to delete leave.', 'error');
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <>
      <ToastStack toasts={toasts} />
      <SuccessAnimation show={successAnim.visible} />

      <motion.header
        className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Leave</h2>
        <button
          type="button"
          onClick={openAdd}
          className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-[0_6px_16px_rgba(107,78,255,0.28)] active:scale-90 transition-transform"
          aria-label="Add leave"
        >
          <Plus size={18} />
        </button>
      </motion.header>

      <main className="pt-1 pb-6">
        <p className="mb-4 text-sm text-neutral-500">
          Dates you add here show as <span className="font-semibold text-brand">Paid Leave</span> instead of Absent
          across Attendance, Calendar, and Reports.
        </p>

        <div className="mb-4">
          <SpringButton variant="primary" fullWidth onClick={openAdd}>
            <Plus size={16} /> Add Leave
          </SpringButton>
        </div>

        {isError ? (
          <ErrorState title="Couldn't load your leaves" subtitle="Check your connection and try again." onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonList rows={4} />
        ) : entries.length === 0 ? (
          <EmptyState icon={<CalendarOff size={22} />} title="No leaves recorded" subtitle="Add a leave to keep a date off Absent." />
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => (
                <LeaveCard
                  key={entry.key}
                  entry={entry}
                  index={i}
                  onEdit={() => openEdit(entry)}
                  onDelete={() => handleDelete(entry)}
                  deleting={deletingKey === entry.key}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <LeaveFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        uid={user?.uid}
        editing={editing}
        onSaved={(msg) => {
          pushToast(msg, 'success');
          if (msg.includes('added')) {
            successAnim.trigger();
            trackEvent('leave_added');
          }
        }}
      />
    </>
  );
}

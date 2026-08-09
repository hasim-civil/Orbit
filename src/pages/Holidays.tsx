import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CalendarX2 } from 'lucide-react';
import { HolidayCard } from '@/components/HolidayCard';
import { HolidayFormModal } from '@/components/HolidayFormModal';
import { SpringButton } from '@/components/SpringButton';
import { SkeletonList, EmptyState, ErrorState } from '@/components/EmptyState';
import { ToastStack, type ToastState } from '@/components/Toast';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useSuccessAnimation } from '@/hooks/useSuccessAnimation';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteHoliday, useHolidays } from '@/hooks/useHolidayQueries';
import type { Holiday } from '@/types/attendance';

let toastId = 0;

export default function Holidays() {
  const { user, userData } = useAuth();
  const canManage = userData?.role === 'admin';
  const { data: holidays, isLoading, isError, refetch } = useHolidays();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const successAnim = useSuccessAnimation();

  const deleteMutation = useDeleteHoliday();

  const pushToast = (message: string, type: ToastState['type']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (holiday: Holiday) => { setEditing(holiday); setFormOpen(true); };

  const handleDelete = async (holiday: Holiday) => {
    setDeletingDate(holiday.date);
    try {
      await deleteMutation.mutateAsync(holiday.date);
      pushToast('Holiday deleted.', 'success');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Failed to delete holiday.', 'error');
    } finally {
      setDeletingDate(null);
    }
  };

  const entries = holidays ?? [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = entries.filter((h) => h.date >= todayStr);
  const past = entries.filter((h) => h.date < todayStr);

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
        <h2 className="m-0 text-lg font-bold">Holidays</h2>
        {canManage && (
          <button
            type="button"
            onClick={openAdd}
            className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-[0_6px_16px_rgba(107,78,255,0.28)] active:scale-90 transition-transform"
            aria-label="Add holiday"
          >
            <Plus size={18} />
          </button>
        )}
      </motion.header>

      <main className="pt-1 pb-6">
        <p className="mb-4 text-sm text-neutral-500">
          Dates marked here show as <span className="font-semibold text-blue-500">Holiday</span> instead of Absent
          across Attendance, Calendar, and Reports.
        </p>

        {canManage && (
          <div className="mb-4">
            <SpringButton variant="primary" fullWidth onClick={openAdd}>
              <Plus size={16} /> Add Holiday
            </SpringButton>
          </div>
        )}

        {isError ? (
          <ErrorState title="Couldn't load holidays" subtitle="Check your connection and try again." onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonList rows={4} />
        ) : entries.length === 0 ? (
          <EmptyState icon={<CalendarX2 size={22} />} title="No holidays added" subtitle="Add a holiday to keep a date off Absent." />
        ) : (
          <div className="flex flex-col gap-5">
            {upcoming.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-text">Upcoming</h3>
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {upcoming.map((h, i) => (
                      <HolidayCard
                        key={h.id}
                        holiday={h}
                        index={i}
                        onEdit={() => openEdit(h)}
                        onDelete={() => handleDelete(h)}
                        deleting={deletingDate === h.date}
                        canManage={canManage}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-text">Past</h3>
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {past.map((h, i) => (
                      <HolidayCard
                        key={h.id}
                        holiday={h}
                        index={i}
                        onEdit={() => openEdit(h)}
                        onDelete={() => handleDelete(h)}
                        deleting={deletingDate === h.date}
                        canManage={canManage}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {canManage && (
        <HolidayFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          uid={user?.uid}
          editing={editing}
          onSaved={(msg) => {
            pushToast(msg, 'success');
            if (msg.includes('added')) {
              successAnim.trigger();
              trackEvent('holiday_added');
            }
          }}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { DayRow } from '@/components/DayRow';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { SkeletonList, EmptyState, ErrorState } from '@/components/EmptyState';
import { SpringButton } from '@/components/SpringButton';
import { useAdminUsers, useAdminUserHistory, useUpdateUserRole } from '@/hooks/useAdminQueries';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUserDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: users } = useAdminUsers();
  const targetUser = users?.find((u) => u.id === uid);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const { data: history, isLoading, isError, refetch } = useAdminUserHistory(uid, year, month);
  const roleMutation = useUpdateUserRole();

  const isSelf = currentUser?.uid === uid;

  const handleToggleRole = async () => {
    if (!uid || !targetUser || isSelf) return;
    const nextRole = targetUser.role === 'admin' ? 'employee' : 'admin';
    try {
      await roleMutation.mutateAsync({ uid, role: nextRole });
    } catch {
      // toast intentionally omitted here to keep this screen minimal; the
      // button reverting to its previous label communicates failure
    }
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button type="button" onClick={() => navigate(-1)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-0 shadow-sm active:scale-90 transition-transform" aria-label="Back">
          <ArrowLeft size={17} />
        </button>
        <h2 className="m-0 truncate text-lg font-bold">{targetUser?.name ?? 'Employee'}</h2>
      </motion.header>

      <main className="pt-1 pb-6">
        {targetUser && (
          <motion.div
            className="mb-5 flex items-center gap-4 rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-xl font-bold text-white">
              {(targetUser.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-bold text-neutral-900">{targetUser.name}</p>
              <p className="m-0 truncate text-sm text-neutral-500">{targetUser.email}</p>
              <span className="mt-1.5 inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wide text-neutral-500">
                {targetUser.role}
              </span>
            </div>
          </motion.div>
        )}

        {targetUser && !isSelf && (
          <div className="mb-5">
            <SpringButton variant="secondary" fullWidth onClick={handleToggleRole} disabled={roleMutation.isPending}>
              <ShieldCheck size={16} />
              {roleMutation.isPending
                ? 'Updating…'
                : targetUser.role === 'admin'
                  ? 'Remove Admin Access'
                  : 'Grant Admin Access'}
            </SpringButton>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-bold text-neutral-900">Attendance History</h3>
          <MonthYearFilter month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        </div>

        {isError ? (
          <ErrorState title="Couldn't load attendance" subtitle="Check your connection and try again." onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonList rows={6} />
        ) : !history || history.length === 0 ? (
          <EmptyState icon={<ArrowLeft size={22} />} title="No records this month" />
        ) : (
          <div className="flex flex-col gap-2">
            {history
              .slice()
              .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
              .map((day, i) => (
                <DayRow key={day.dateStr} day={day} index={i} showWeekday />
              ))}
          </div>
        )}

        <div className="mt-5 text-center">
          <Link to="/admin/users" className="text-xs font-semibold text-muted-text">
            ← Back to all users
          </Link>
        </div>
      </main>
    </>
  );
}

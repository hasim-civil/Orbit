import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, CalendarDays, Search as SearchIcon } from 'lucide-react';
import { MonthlySummaryStrip, type SummaryTile } from '@/components/MonthlySummaryStrip';
import { EmployeeRow } from '@/components/EmployeeRow';
import { SkeletonList, EmptyState, ErrorState } from '@/components/EmptyState';
import { CreatorCredit } from '@/components/CreatorCredit';
import { useAdminTodayOverview } from '@/hooks/useAdminQueries';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { rows, counts, isLoading, isError, refetch } = useAdminTodayOverview();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const summaryTiles: SummaryTile[] = [
    { label: 'Present', value: counts.present, color: 'text-success' },
    { label: 'Late', value: counts.late, color: 'text-amber-500' },
    { label: 'Absent', value: counts.absent, color: 'text-danger' },
    { label: 'On Leave', value: counts.onLeave, color: 'text-brand' },
    { label: 'Holiday', value: counts.holiday, color: 'text-blue-500' },
  ];

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => r.user.name?.toLowerCase().includes(q) || r.user.email?.toLowerCase().includes(q));
  }, [rows, search]);

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Admin Dashboard</h2>
        <p className="m-0 mt-0.5 text-xs text-neutral-500">{todayLabel}</p>
      </motion.header>

      <main className="pt-1 pb-6">
        {/* Quick links */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-[var(--radius-xl)] bg-neutral-0 p-4 shadow-sm"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-subtle text-brand">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-neutral-900">Users</p>
              <p className="m-0 text-xs text-muted-text">{counts.total} total</p>
            </div>
          </Link>
          <Link
            to="/holidays"
            className="flex items-center gap-3 rounded-[var(--radius-xl)] bg-neutral-0 p-4 shadow-sm"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-500">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-neutral-900">Holidays</p>
              <p className="m-0 text-xs text-muted-text">Manage</p>
            </div>
          </Link>
        </div>

        {/* Today's Overview */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand" />
            <h3 className="m-0 text-sm font-bold text-neutral-900">Today's Overview</h3>
          </div>
          {isError ? (
            <ErrorState title="Couldn't load overview" subtitle="Check your connection and try again." onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-[var(--radius-lg)] bg-neutral-100" />
              ))}
            </div>
          ) : (
            <MonthlySummaryStrip items={summaryTiles} />
          )}
        </section>

        {/* Attendance Overview */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-brand" />
            <h3 className="m-0 text-sm font-bold text-neutral-900">Attendance Overview</h3>
          </div>

          <div className="relative mb-3">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-0 pl-10 pr-3.5 text-sm outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
            />
          </div>

          {isError ? null : isLoading ? (
            <SkeletonList rows={5} />
          ) : filteredRows.length === 0 ? (
            <EmptyState icon={<Users size={22} />} title="No employees found" subtitle={search ? 'Try a different search.' : 'No users registered yet.'} />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredRows.map((entry, i) => (
                <EmployeeRow key={entry.user.id} entry={entry} index={i} onClick={() => navigate(`/admin/users/${entry.user.id}`)} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 mb-2">
          <CreatorCredit />
        </div>
      </main>
    </>
  );
}

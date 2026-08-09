import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Search as SearchIcon } from 'lucide-react';
import { UserRow } from '@/components/UserRow';
import { SkeletonList, EmptyState, ErrorState } from '@/components/EmptyState';
import { useAdminUsers } from '@/hooks/useAdminQueries';

type RoleFilter = 'all' | 'admin' | 'employee';

export default function AdminUsers() {
  const { data: users, isLoading, isError, refetch } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let rows = users ?? [];
    if (roleFilter !== 'all') rows = rows.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return rows;
  }, [users, search, roleFilter]);

  return (
    <>
      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Users</h2>
        <p className="m-0 mt-0.5 text-xs text-neutral-500">{users?.length ?? 0} registered</p>
      </motion.header>

      <main className="pt-1 pb-6">
        <div className="relative mb-3">
          <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-0 pl-10 pr-3.5 text-sm outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
          />
        </div>

        <div className="mb-4 flex gap-2">
          {(['all', 'employee', 'admin'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setRoleFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === f ? 'bg-brand text-white' : 'border border-neutral-200 bg-neutral-0 text-neutral-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'admin' ? 'Admins' : 'Employees'}
            </button>
          ))}
        </div>

        {isError ? (
          <ErrorState title="Couldn't load users" subtitle="Check your connection and try again." onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonList rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users size={22} />} title="No users found" subtitle={search ? 'Try a different search.' : 'No users match this filter.'} />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((user, i) => (
              <UserRow key={user.id} user={user} index={i} onClick={() => navigate(`/admin/users/${user.id}`)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

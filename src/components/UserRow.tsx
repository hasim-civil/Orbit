import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserData } from '@/types/attendance';

export function UserRow({ user, index, onClick }: { user: UserData; index: number; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-neutral-0 p-3.5 text-left shadow-sm active:scale-[0.99] transition-transform"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: Math.min(index, 12) * 0.03 }}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-sm font-bold text-white">
        {(user.name || '?').charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-neutral-900">{user.name}</p>
        <p className="m-0 truncate text-xs text-neutral-500">{user.email}</p>
      </div>

      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide',
          user.role === 'admin' ? 'bg-brand-subtle text-brand' : 'bg-neutral-100 text-neutral-500',
        )}
      >
        {user.role}
      </span>
    </motion.button>
  );
}

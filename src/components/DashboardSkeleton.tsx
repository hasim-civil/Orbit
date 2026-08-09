import { SkeletonCard } from './EmptyState';

/** Mirrors Dashboard's real grid shape (2-col x 3-row stat cards, then the
 * large attendance card) so there's no layout shift when real data arrives
 * — same card heights/gaps as the live StatCard and attendance card. */
export function DashboardSkeleton() {
  return (
    <div className="pt-1">
      <div className="my-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[76px] rounded-[var(--radius-xl)]" />
        ))}
      </div>
      <SkeletonCard className="h-[520px] rounded-[var(--radius-xl)]" />
    </div>
  );
}

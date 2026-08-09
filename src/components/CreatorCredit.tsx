import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

/** "Developed by Hasim" — small, muted, non-interactive-feeling credit line.
 * Uses text-muted-text (already theme-scoped and AA-contrast-checked for
 * Light/Dark/Glass, see index.css) so it never needs its own color logic.
 * The tap scale is intentionally tiny (0.97) — just enough to feel alive
 * without reading as a real button — and is skipped under Reduce Motion. */
export function CreatorCredit({ className = '' }: { className?: string }) {
  const manuallyReduced = useSettingsStore((s) => s.reducedMotion);
  const reduced =
    manuallyReduced ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  return (
    <motion.p
      className={`m-0 select-none text-center text-2xs font-medium text-muted-text/70 ${className}`}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      Developed by Hasim
    </motion.p>
  );
}

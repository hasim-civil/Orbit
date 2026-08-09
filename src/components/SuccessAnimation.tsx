import { AnimatePresence, motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';

/** Small, centered success confirmation — a checkmark that scales and fades
 * in, then auto-dismisses (driven by useSuccessAnimation's timer). Built
 * with Framer Motion + SVG rather than a Lottie library: it's lighter,
 * needs no extra runtime dependency, and renders identically across every
 * browser/build target without any third-party animation-engine risk.
 * Non-blocking — sits above content but never intercepts clicks
 * (pointer-events-none) — and respects Reduce Motion by skipping straight
 * to the settled frame instead of animating in. */
export function SuccessAnimation({ show }: { show: boolean }) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduced = reducedMotion || prefersReduced;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[600] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <motion.div
            className="grid h-24 w-24 place-items-center rounded-full bg-brand text-white shadow-[0_16px_40px_rgba(107,78,255,0.4)]"
            initial={reduced ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: 'spring', stiffness: 380, damping: 20 }
            }
          >
            <motion.svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M4 12l5 5L20 6"
                initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.35, delay: 0.15, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
